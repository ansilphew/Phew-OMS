const cloudinary = require("cloudinary").v2;

// Configure Cloudinary only if env variables are present and not placeholders
const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== "dummy_cloud_name";

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a base64 image string to Cloudinary.
 * If Cloudinary is not configured, it returns the base64 string directly.
 * @param {string} base64Str - Base64 image string or existing URL
 * @param {string} folder - Target folder on Cloudinary
 * @returns {Promise<string>} - Cloudinary URL or fallback base64 string
 */
const uploadImage = async (base64Str, folder = "oms_uploads") => {
  if (!base64Str) return "";
  
  // If it's already an uploaded URL, return it directly
  if (base64Str.startsWith("http://") || base64Str.startsWith("https://")) {
    return base64Str;
  }

  if (!isConfigured) {
    console.warn("Cloudinary is not configured or uses dummy credentials. Storing image as Base64 in db.");
    return base64Str;
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Str, {
      folder: folder,
      resource_type: "auto"
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed, falling back to Base64:", error);
    return base64Str;
  }
};

module.exports = {
  cloudinary,
  uploadImage,
};
