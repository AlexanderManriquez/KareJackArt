const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// Basic validation / helpful logging to catch misconfigured env vars early
const cfg = cloudinary.config();
// cfg contains cloud_name, api_key, etc. Don't log secrets.
if (!cfg.cloud_name) {
  console.error('[Cloudinary] WARNING: CLOUDINARY_CLOUD_NAME is not set. Image uploads will fail.');
} else {
  console.log(`[Cloudinary] configured (cloud_name=${cfg.cloud_name}, api_key=${cfg.api_key ? 'present' : 'missing'})`);
  // Cloudinary cloud_name is case-sensitive and usually lowercase — warn if uppercase letters found.
  if (/[A-Z]/.test(cfg.cloud_name)) {
    console.warn('[Cloudinary] Warning: cloud_name contains uppercase letters — Cloudinary cloud names are typically lowercase.');
  }
}

function uploadBuffer(buffer, folder = 'karejackart', options = {}) {
  return new Promise((resolve, reject) => {
    const opts = Object.assign({ folder }, options || {});
    const stream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

module.exports = {
  cloudinary,
  uploadBuffer,
};
