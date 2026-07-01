import { createServerFn } from '@tanstack/react-start';
import clientPromise from '@/backend/shared/db';
import { getAdminToken } from '@/backend/infrastructure/token';
import { ObjectId } from 'mongodb';
import { uploadImageToCloudinary } from '@/backend/shared/cloudinary';
import { logAuditAction } from '@/backend/shared/audit';
import { getCachedData, setCachedData, invalidateCache } from '@/backend/infrastructure/redis';

export const getGalleryPhotosFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const cached = await getCachedData<any[]>("admin:gallery");
    if (cached) return cached;

    const client = await clientPromise;
    const db = client.db("shailraj");
    const photos = await db.collection("gallery").find({}).sort({ createdAt: -1 }).toArray();

    const mapped = photos.map((p: any) => ({
      _id: p._id.toString(),
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
    }));
    await setCachedData("admin:gallery", mapped);
    return mapped;
  } catch (error) {
    console.error("Failed to fetch gallery photos", error);
    return [];
  }
});

type GalleryInput = {
  adminToken: string;
  imageUrl: string;
};

export const addGalleryPhotoFn = createServerFn({ method: "POST" })
  .validator((data: GalleryInput) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");

    const client = await clientPromise;
    const db = client.db("shailraj");

    let finalImageUrl = data.imageUrl;

    // If it's a base64 image data URL from the frontend, upload to Cloudinary
    if (finalImageUrl.startsWith("data:image")) {
      finalImageUrl = await uploadImageToCloudinary(finalImageUrl, "gallery");
    }

    const newDoc = {
      imageUrl: finalImageUrl,
      createdAt: new Date(),
    };

    const res = await db.collection("gallery").insertOne(newDoc);
    await logAuditAction({
      data: {
        action: "Upload Photo",
        entityType: "Gallery",
        details: "Uploaded a new gallery photo",
        entityId: res.insertedId.toString(),
      },
    });
    await invalidateCache("admin:gallery");
    return { success: true, _id: res.insertedId.toString() };
  });

export const deleteGalleryPhotoFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");

    const client = await clientPromise;
    const db = client.db("shailraj");

    await db.collection("gallery").deleteOne({ _id: new ObjectId(data.id) });
    await logAuditAction({
      data: {
        action: "Delete Photo",
        entityType: "Gallery",
        details: "Deleted a gallery photo",
        entityId: data.id,
      },
    });
    await invalidateCache("admin:gallery");
    return { success: true };
  });
