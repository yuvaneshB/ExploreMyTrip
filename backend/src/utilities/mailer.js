import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transporter;
const getTransporter = () => {
  if (transporter !== undefined) return transporter;

  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || host.includes('your_smtp') || !user || user.includes('your_smtp')) {
    console.warn('Mailer: SMTP host or credentials are missing/default. Using console log fallback.');
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.verify((err, success) => {
    if (err) {
      console.error('SMTP Transporter Verification Failed:', err.message);
    }
  });

  return transporter;
};

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.substring(0, 2)}***@${domain}`;
};

export const sendEmail = async ({ to, subject, html, attachments = [], emailType }) => {
  const logoPath = path.resolve(__dirname, '../../../frontend/src/assets/logo.png');
  const hasLogo = fs.existsSync(logoPath);

  const showLogoImage = hasLogo;

  const formattedHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; color: #334155; background-color: #ffffff;">
      ${showLogoImage ? `
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <img src="cid:logo" alt="ExploreMyTrip" style="height: 44px; width: auto; display: block; margin: 0 auto;" />
      </div>
      ` : `
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <h1 style="color: #eab308; font-size: 24px; font-weight: 800; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; letter-spacing: -0.5px;">ExploreMyTrip</h1>
      </div>
      `}
      <div style="line-height: 1.6; font-size: 15px;">
        ${html}
      </div>
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        <div>&copy; ${new Date().getFullYear()} ExploreMyTrip. All rights reserved.</div>
        <div style="margin-top: 8px; font-size: 11px;">This is an automated security email from ExploreMyTrip.</div>
      </div>
    </div>
  `;

  const finalAttachments = [...attachments];
  if (showLogoImage) {
    finalAttachments.push({
      filename: 'logo.png',
      path: logoPath,
      cid: 'logo',
      contentDisposition: 'inline'
    });
  }

  // Configured sender address
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@exploremytrip.com',
    to,
    subject,
    html: formattedHtml,
    attachments: finalAttachments
  };

  let derivedType = emailType || 'Email Notification';
  if (subject.toLowerCase().includes('booking') || subject.toLowerCase().includes('ticket')) {
    derivedType = 'Booking Confirmation';
  } else if (subject.toLowerCase().includes('otp') || subject.toLowerCase().includes('verification') || subject.toLowerCase().includes('verify')) {
    derivedType = 'OTP Verification';
  }

  const currentTransporter = getTransporter();
  if (!currentTransporter) {
    console.log('=============== MOCK EMAIL SENT ===============');
    console.log(`Email Type: ${derivedType}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${html.replace(/<[^>]*>/g, '')}`);
    console.log('================================================');
    return { mock: true, message: 'Mock email logged to console.' };
  }

  try {
    const info = await currentTransporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Email delivery failed:', error.message);
    return { mock: true, error: error.message };
  }
};

export const generateOtpEmailHtml = ({ userName, otp, purpose, expiryMinutes }) => {
  const greeting = userName ? `Hello ${userName},` : 'Hello,';
  
  let purposeMessage = '';
  if (purpose === 'verify') {
    purposeMessage = 'Use the verification code below to verify your email address and continue with ExploreMyTrip.';
  } else if (purpose === 'reset') {
    purposeMessage = 'We received a request to reset your ExploreMyTrip password. Use the verification code below to continue.';
  } else {
    purposeMessage = 'Use the verification code below to securely continue with your ExploreMyTrip account.';
  }

  // Large spaced code Konzept
  const otpSpaced = otp.split('').join(' ');

  return `
    <div style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
      <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 16px 0;">Welcome to ExploreMyTrip</h2>
      <p style="color: #475569; font-size: 15px; margin: 0; text-align: left; line-height: 1.6;">${greeting}</p>
      <p style="color: #475569; font-size: 15px; margin: 12px 0 24px 0; text-align: left; line-height: 1.6;">${purposeMessage}</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px auto; max-width: 280px; text-align: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
        <span style="display: block; font-size: 10px; font-weight: 850; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Your Verification Code</span>
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; color: #eab308; letter-spacing: 6px; display: inline-block;">${otpSpaced}</span>
      </div>
      
      <p style="color: #64748b; font-size: 13px; margin: 24px 0 12px 0; font-weight: 500;">
        This verification code will expire in <strong style="color: #334155;">${expiryMinutes} minutes</strong>.
      </p>
      
      <div style="margin-top: 24px; padding: 12px; border-radius: 8px; background-color: #fffbeb; border: 1px dashed #fef3c7; text-align: left;">
        <p style="color: #b45309; font-size: 12px; margin: 0; line-height: 1.5; font-weight: 500; text-align: center;">
          If you did not request this code, you can safely ignore this email. Never share your verification code with anyone.
        </p>
      </div>
    </div>
  `;
};

export const generateBookingEmailHtml = ({ userName, booking, tour, frontendOrigin, eticketToken, itineraryToken }) => {
  const greeting = userName ? `Hello ${userName},` : 'Hello,';
  const travelDateFormatted = new Date(booking.departureDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <div style="margin-top: 10px; margin-bottom: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 16px 0; text-align: center;">Booking Confirmed!</h2>
      <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.6;">${greeting}</p>
      <p style="color: #475569; font-size: 15px; margin: 12px 0 24px 0; line-height: 1.6;">
        Your booking for the tour <strong>${tour.title}</strong> is confirmed. Below are your travel ticket details.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: left;">
        <h3 style="color: #0f172a; font-size: 16px; font-weight: 800; margin: 0 0 16px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">TICKET DETAILS</h3>
        
        <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: 700; width: 140px;">Booking Ref:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">${booking._id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 700;">Tour/Destination:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${tour.title}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 700;">Departure Date:</td>
            <td style="padding: 6px 0; color: #0f172a;">${travelDateFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 700;">Seats Booked:</td>
            <td style="padding: 6px 0; color: #0f172a;">${booking.numSeats} Traveler(s)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 700;">Total Price Paid:</td>
            <td style="padding: 6px 0; color: #eab308; font-weight: 800;">$${booking.totalAmount}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 700;">Booking Status:</td>
            <td style="padding: 6px 0;">
              <span style="background-color: #ecfdf5; color: #065f46; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 11px;">
                ${booking.status.toUpperCase()}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <div style="margin: 32px 0; font-size: 14px; color: #334155; line-height: 1.6; border-top: 1px solid #cbd5e1; padding-top: 16px;">
        <strong style="color: #0f172a; display: block; margin-bottom: 12px; font-size: 15px;">YOUR TRAVEL DOCUMENTS</strong>
        
        <p style="margin: 6px 0;">
          <strong>E-Ticket:</strong><br/>
          Download E-Ticket: <a href="${frontendOrigin}/documents/${eticketToken}?type=eticket" style="color: #1e40af; text-decoration: underline; font-weight: 600;">Download E-Ticket</a><br/>
          <span style="color: #64748b; font-size: 11px;">${frontendOrigin}/documents/${eticketToken}?type=eticket</span>
        </p>
        
        <p style="margin: 16px 0 0 0;">
          <strong>Itinerary:</strong><br/>
          Download Itinerary: <a href="${frontendOrigin}/documents/${itineraryToken}?type=itinerary" style="color: #1e40af; text-decoration: underline; font-weight: 600;">Download Itinerary</a><br/>
          <span style="color: #64748b; font-size: 11px;">${frontendOrigin}/documents/${itineraryToken}?type=itinerary</span>
        </p>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin-top: 24px; text-align: center;">
        If you have any questions or require further assistance, please feel free to contact our support team.
      </p>
    </div>
  `;
};
