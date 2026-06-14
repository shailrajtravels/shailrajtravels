import { createServerFn } from '@tanstack/react-start';
import clientPromise from './db';
import { getAdminToken } from './token';
import { ObjectId } from 'mongodb';
import { uploadImageToCloudinary } from './cloudinary';
import { logAuditAction } from './audit';

export const getGalleryPhotosFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const client = await clientPromise;
    const db = client.db('shailraj');
    const photos = await db.collection('gallery').find({}).sort({ createdAt: -1 }).toArray();
    
    return photos.map(p => ({
      _id: p._id.toString(),
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
    }));
  } catch (error) {
    console.error("Failed to fetch gallery photos", error);
    return [];
  }
});

type GalleryInput = {
  adminToken: string;
  imageUrl: string;
};

export const addGalleryPhotoFn = createServerFn({ method: 'POST' })
  .validator((data: GalleryInput) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    
    const client = await clientPromise;
    const db = client.db('shailraj');
    
    let finalImageUrl = data.imageUrl;
    
    // If it's a base64 image data URL from the frontend, upload to Cloudinary
    if (finalImageUrl.startsWith('data:image')) {
      finalImageUrl = await uploadImageToCloudinary(finalImageUrl, "gallery");
    }
    
    const newDoc = {
      imageUrl: finalImageUrl,
      createdAt: new Date(),
    };
    
    const res = await db.collection('gallery').insertOne(newDoc);
    await logAuditAction({ data: { action: "Upload Photo", entityType: "Gallery", details: "Uploaded a new gallery photo", entityId: res.insertedId.toString() } });
    return { success: true, _id: res.insertedId.toString() };
  });

export const deleteGalleryPhotoFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    
    const client = await clientPromise;
    const db = client.db('shailraj');
    
    await db.collection('gallery').deleteOne({ _id: new ObjectId(data.id) });
    await logAuditAction({ data: { action: "Delete Photo", entityType: "Gallery", details: "Deleted a gallery photo", entityId: data.id } });
    return { success: true };
  });
