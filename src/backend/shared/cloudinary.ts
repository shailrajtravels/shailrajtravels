import { v2 as cloudinary } from 'cloudinary';

// Configuration gets automatically picked up from process.env.CLOUDINARY_URL if standard,
// but we pass it explicitly just in case it wasn't picked up correctly.
cloudinary.config({
  cloud_name: "dquecn5qj",
  api_key: "912918221149553",
  api_secret: "2nz-n7M7UnXDw42pAjwS4tDg0H0",
  secure: true,
});

export const uploadImageToCloudinary = async (
  base64Str: string,
  folder: string,
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(base64Str, {
      folder,
      resource_type: "auto", // use auto to preserve exactly what was uploaded (png, webp, jpg, etc)
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};
