import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function getCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string; quality?: string; format?: string } = {}
) {
  const { width = 800, height, crop = "limit", quality = "auto", format = "webp" } = options;
  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: format,
  });
}
