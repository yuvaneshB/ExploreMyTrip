import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';

// Setup local uploads storage directory
const uploadDir = './public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|pdf|mp4/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Allowed formats: images, pdf, and mp4.'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

const tourImageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Please upload a valid JPG, PNG, or WebP image.'));
};

export const uploadTourImage = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: tourImageFileFilter
});

// Helper to upload a local file to Cloudinary if keys are present
export const uploadToCloudinary = async (filePath, folder = 'tours') => {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  console.log(`[CloudinaryUpload] Starting upload. CloudName: ${cloudName}, APIKey: ${apiKey}`);

  if (!apiKey || apiKey.includes('mock_key')) {
    // If mock, return local file server path
    let baseUrl = process.env.BACKEND_URL;
    if (!baseUrl) {
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        baseUrl = `http://localhost:${process.env.PORT || '4000'}`;
      } else {
        baseUrl = 'https://exploremytrip.onrender.com';
      }
    }
    const normalized = filePath.replace(/\\/g, '/').replace(/^public\//, '');
    return { url: `${baseUrl}/${normalized}`, public_id: null };
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    // Remove local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.error('[CloudinaryUpload] Error during upload operation:', error);
    // Remove local file on failure as well
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(error.message || 'Cloudinary upload failed');
  }
};

// Helper to delete an asset from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!apiKey || apiKey.includes('mock_key') || !publicId) {
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn('Failed to delete from Cloudinary:', error.message);
  }
};

export default upload;
