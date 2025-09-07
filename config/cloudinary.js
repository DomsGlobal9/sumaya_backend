const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config()
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,   
});

// Set up storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',  // Folder in Cloudinary where images will be stored
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'heic'],  
     transformation: [
      { width: 1024, height: 1024, crop: 'limit' }
    ],// Allowed image formats
  },
});

// Create multer instance with storage
const upload = multer({ storage: storage,limits: { fileSize: 5 * 1024 * 1024 }  });

module.exports = { upload, cloudinary };