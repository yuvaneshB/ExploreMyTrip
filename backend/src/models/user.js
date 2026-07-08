import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const passportSchema = new mongoose.Schema({
  fullName: { type: String, trim: true },
  passportNumber: { type: String, trim: true },
  expiryDate: { type: Date },
  issuingCountry: { type: String, trim: true }
}, { _id: false });

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  relationship: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['Customer', 'Agent', 'Manager', 'Finance'],
    default: 'Customer'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationOTP: {
    type: String,
    default: null
  },
  verificationOTPExpires: {
    type: Date,
    default: null
  },
  resetPasswordOTP: {
    type: String,
    default: null
  },
  resetPasswordOTPExpires: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    default: null
  },
  previousRefreshToken: {
    type: String,
    default: null
  },
  previousRefreshTokenRotatedAt: {
    type: Date,
    default: null
  },

  profilePicture: {
    type: String,
    default: ''
  },
  passportDetails: {
    type: passportSchema,
    default: () => ({})
  },
  emergencyContact: {
    type: emergencyContactSchema,
    default: () => ({})
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
