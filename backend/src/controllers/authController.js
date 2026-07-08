import User from '../models/user.js';
import Wishlist from '../models/wishlist.js';
import ActivityLog from '../models/activityLog.js';
import jwt from 'jsonwebtoken';
import { sendEmail, generateOtpEmailHtml } from '../utilities/mailer.js';
import Coupon from '../models/coupon.js';
import NewsletterSubscription from '../models/newsletterSubscription.js';
import crypto from 'crypto';

// Helper to log user activity
const logActivity = async (userId, action, description, req) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      description,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || ''
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m'
  });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

// Register User
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Customer',
      verificationOTP: otp,
      verificationOTPExpires: otpExpires
    });

    // If Customer, initialize wishlist
    if (user.role === 'Customer') {
      await Wishlist.create({ user: user._id, tours: [] });
    }

    // Send verification email
    const emailHtml = generateOtpEmailHtml({
      userName: user.name,
      otp,
      purpose: 'verify',
      expiryMinutes: 10
    });
    await sendEmail({
      to: user.email,
      subject: 'Verify Your ExploreMyTrip Email',
      html: emailHtml
    });

    await logActivity(user._id, 'USER_REGISTER', `Created account with role: ${user.role}`, req);



    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification OTP sent to email.'
    });
  } catch (error) {
    next(error);
  }
};

// Login User
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }


    if (!user.isEmailVerified) {
      // Generate a new 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationOTP = otp;
      user.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      const emailHtml = generateOtpEmailHtml({
        userName: user.name,
        otp,
        purpose: 'verify',
        expiryMinutes: 10
      });

      await sendEmail({
        to: user.email,
        subject: 'Verify Your ExploreMyTrip Email',
        html: emailHtml
      });

      return res.status(200).json({ 
        success: true, 
        status: 'verificationRequired', 
        message: 'Please verify your email. A new OTP verification code has been sent to your email.' 
      });
    }



    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Set cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 mins
    });

    await logActivity(user._id, 'USER_LOGIN', 'Successfully logged in', req);

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Access Token
export const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      console.warn('[RefreshToken] Rejected: token is missing in request body');
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      console.warn(`[RefreshToken] Rejected: JWT signature validation or expiration failed. Error: ${err.message}`);
      return res.status(401).json({ success: false, message: 'Expired or invalid refresh token signature' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      console.warn(`[RefreshToken] Rejected: user with id ${decoded.id} not found in database`);
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Check if token matches active refresh token, OR matches previous refresh token within 10 seconds grace period
    const isMainToken = user.refreshToken === token;
    const isPreviousToken = user.previousRefreshToken === token;
    const isWithinGracePeriod = isPreviousToken && 
      user.previousRefreshTokenRotatedAt && 
      (Date.now() - new Date(user.previousRefreshTokenRotatedAt).getTime() < 10000); // 10-second grace period

    if (!isMainToken && !isWithinGracePeriod) {
      if (isPreviousToken) {
        console.warn(`[RefreshToken] Rejected: old/rotated refresh token used AFTER 10s grace period expiration for user ${user.email}`);
      } else {
        console.warn(`[RefreshToken] Rejected: token mismatch. Provided token does not match active or rotated previous token for user ${user.email}`);
      }
      return res.status(401).json({ success: false, message: 'Invalid or rotated refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.previousRefreshToken = user.refreshToken;
    user.previousRefreshTokenRotatedAt = new Date();
    user.refreshToken = newRefreshToken;
    await user.save();

    console.log(`[RefreshToken] Successfully rotated refresh token for user ${user.email}. Main token matched: ${isMainToken}, Previous token matched: ${isPreviousToken}`);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('[RefreshToken] Internal Error:', error.message);
    return res.status(401).json({ success: false, message: 'Expired or invalid refresh token' });
  }
};

// Verify Email OTP
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    if (user.verificationOTP !== otp || new Date() > user.verificationOTPExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.verificationOTP = null;
    user.verificationOTPExpires = null;
    await user.save();

    await logActivity(user._id, 'EMAIL_VERIFIED', 'Verified email address', req);

    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    next(error);
  }
};

// Forgot Password Request
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const emailHtml = generateOtpEmailHtml({
      userName: user.name,
      otp,
      purpose: 'reset',
      expiryMinutes: 10
    });
    await sendEmail({
      to: user.email,
      subject: 'Reset Your ExploreMyTrip Password',
      html: emailHtml
    });

    await logActivity(user._id, 'FORGOT_PASSWORD_REQUEST', 'Requested password reset OTP', req);

    res.status(200).json({ success: true, message: 'Password reset OTP sent to email' });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.resetPasswordOTP !== otp || new Date() > user.resetPasswordOTPExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;
    await user.save();

    await logActivity(user._id, 'PASSWORD_RESET', 'Successfully reset password', req);

    res.status(200).json({ success: true, message: 'Password reset successful!' });
  } catch (error) {
    next(error);
  }
};

// Google Auth Simulation
export const googleAuth = async (req, res, next) => {
  try {
    const { email, name, picture } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      // Create user with a random password since they use Google authentication
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: 'Customer',
        profilePicture: picture || '',
        isEmailVerified: true
      });
      await Wishlist.create({ user: user._id, tours: [] });
      await logActivity(user._id, 'USER_REGISTER_GOOGLE', 'Registered using Google Login', req);
    } else {
      await logActivity(user._id, 'USER_LOGIN_GOOGLE', 'Logged in using Google Login', req);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get profile details
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Update profile details
export const updateProfile = async (req, res, next) => {
  try {
    const { name, profilePicture, passportDetails, emergencyContact } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (profilePicture) user.profilePicture = profilePicture;
    
    if (passportDetails) {
      user.passportDetails = {
        fullName: passportDetails.fullName || user.passportDetails.fullName,
        passportNumber: passportDetails.passportNumber || user.passportDetails.passportNumber,
        expiryDate: passportDetails.expiryDate || user.passportDetails.expiryDate,
        issuingCountry: passportDetails.issuingCountry || user.passportDetails.issuingCountry
      };
    }

    if (emergencyContact) {
      user.emergencyContact = {
        name: emergencyContact.name || user.emergencyContact.name,
        relationship: emergencyContact.relationship || user.emergencyContact.relationship,
        phone: emergencyContact.phone || user.emergencyContact.phone,
        email: emergencyContact.email || user.emergencyContact.email
      };
    }

    await user.save();
    await logActivity(user._id, 'USER_UPDATE_PROFILE', 'Updated profile information', req);

    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    await logActivity(user._id, 'USER_CHANGE_PASSWORD', 'Changed password', req);

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Get Activity Logs
export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

// Subscribe to newsletter & generate random 10%, 15%, or 20% coupon with 12 usages
export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // Verify authenticated user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User session not found.' });
    }

    // Verify role is Customer
    if (user.role !== 'Customer') {
      return res.status(403).json({ success: false, message: 'Only Customer accounts are eligible for this welcome offer.' });
    }

    // Normalize emails
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user is already subscribed in NewsletterSubscription by userId or normalizedEmail
    const existingSubscription = await NewsletterSubscription.findOne({
      $or: [
        { email: normalizedEmail },
        { userId: user._id }
      ]
    });

    if (existingSubscription) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already subscribed and your reward coupon has already been issued.' 
      });
    }

    // Randomly select one discount percentage: 10, 15, or 20
    const allowedDiscounts = [10, 15, 20];
    const discountValue = allowedDiscounts[Math.floor(Math.random() * allowedDiscounts.length)];

    // Generate unique WELCOME<Value>-XXXXXX coupon code
    let code;
    let isUnique = false;
    while (!isUnique) {
      const randStr = crypto.randomBytes(3).toString('hex').toUpperCase();
      code = `WELCOME${discountValue}-${randStr}`;
      const existingCoupon = await Coupon.findOne({ code });
      if (!existingCoupon) {
        isUnique = true;
      }
    }

    // Create the Coupon with usageLimit: 12
    const coupon = await Coupon.create({
      code,
      discountType: 'Percentage',
      discountValue,
      minSpend: 0,
      expireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
      usageLimit: 12,
      usageCount: 0,
      isActive: true,
      owner: user._id
    });

    // Save newsletter subscription
    await NewsletterSubscription.create({
      email: normalizedEmail,
      userId: user._id
    });

    // Send professional coupon email showing the actual awarded discount percentage
    const mailHtml = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #0f172a; font-weight: 800; margin-top: 0; font-size: 20px;">Welcome to ExploreMyTrip!</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for subscribing to our newsletter! We are thrilled to have you join our travel updates community. You'll now receive exclusive travel guides, flight alerts, and promo code launches directly in your inbox.</p>
        <div style="background-color: #fcfaf2; border: 1px dashed #eab308; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #854d0e; letter-spacing: 1px; display: block; margin-bottom: 8px;">Your Exclusive Welcome Discount</span>
          <h3 style="font-size: 24px; font-weight: 900; color: #a16207; margin: 0 0 12px 0;">${discountValue}% OFF YOUR BOOKINGS</h3>
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 20px; font-weight: bold; color: #0f172a; letter-spacing: 2px; display: inline-block;">
            ${code}
          </div>
        </div>
        <p style="font-size: 13px; color: #64748b;">* Use this coupon code during checkout on your next bookings to save ${discountValue}%. This coupon can be redeemed for a maximum of 12 successful eligible bookings, is linked securely to your account, and cannot be combined with other offers.</p>
        <p>Happy exploring!<br/>The ExploreMyTrip Team</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: `Welcome to ExploreMyTrip - Your ${discountValue}% Subscription Discount`,
        html: mailHtml,
        emailType: 'Newsletter Coupon'
      });
    } catch (mailErr) {
      console.error('Failed to send welcome coupon email:', mailErr.message);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Subscribed successfully! Your exclusive discount coupon has been sent to your email.',
      couponCode: code
    });

  } catch (error) {
    next(error);
  }
};
