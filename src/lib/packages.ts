import { createServerFn } from '@tanstack/react-start';
import clientPromise from './db';
import { getAdminToken } from './token';
import { ObjectId } from 'mongodb';
import { uploadImageToCloudinary } from './cloudinary';
import { logAuditAction } from './audit';

export const getPackagesFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const client = await clientPromise;
    const db = client.db('shailraj');
    const packages = await db.collection('packages').find({}).sort({ createdAt: -1 }).toArray();
    
    return packages.map(p => ({
      _id: p._id.toString(),
      id: p.id,
      image: p.image,
      images: p.images || [],
      durationBadge: p.durationBadge,
      subtitle: p.subtitle,
      title: p.title,
      location: p.location,
      schedule: p.schedule,
      frequency: p.frequency,
      route: p.route,
      tags: p.tags,
      seatsAvailable: p.seatsAvailable,
      seatsTotal: p.seatsTotal,
      price: p.price,
      itinerary: p.itinerary,
      includes: p.includes,
    }));
  } catch (error) {
    console.error("Failed to fetch packages", error);
    return [];
  }
});

type PackageInput = {
  adminToken: string;
  data: any;
};

// Helper to process base64 images inside package data
const processPackageImages = async (packageData: any) => {
  const newData = { ...packageData };
  
  if (newData.images && Array.isArray(newData.images)) {
    const processedImages = await Promise.all(
      newData.images.map(async (img: string) => {
        if (img.startsWith('data:image')) {
          return await uploadImageToCloudinary(img, "packages");
        }
        return img;
      })
    );
    newData.images = processedImages;
    // Keep the main 'image' in sync with the first image
    if (processedImages.length > 0) {
      newData.image = processedImages[0];
    }
  } else if (newData.image && newData.image.startsWith('data:image')) {
    newData.image = await uploadImageToCloudinary(newData.image, "packages");
  }
  
  return newData;
};

export const createPackageFn = createServerFn({ method: 'POST' })
  .validator((data: PackageInput) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    
    const client = await clientPromise;
    const db = client.db('shailraj');
    
    const processedData = await processPackageImages(data.data);
    
    const newDoc = {
      ...processedData,
      createdAt: new Date(),
    };
    
    const res = await db.collection('packages').insertOne(newDoc);
    await logAuditAction({ data: { action: "Create Package", entityType: "Package", details: `Created new package: ${newDoc.title}`, entityId: res.insertedId.toString() } });
    return { success: true, _id: res.insertedId.toString() };
  });

export const updatePackageFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, id: string, data: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    
    const client = await clientPromise;
    const db = client.db('shailraj');
    
    const processedData = await processPackageImages(data.data);
    const updateData = { ...processedData };
    delete updateData._id; // prevent _id override

    await db.collection('packages').updateOne(
      { _id: new ObjectId(data.id) },
      { $set: updateData }
    );
    
    await logAuditAction({ data: { action: "Update Package", entityType: "Package", details: `Updated package: ${updateData.title || data.id}`, entityId: data.id } });
    return { success: true };
  });

export const deletePackageFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    
    const client = await clientPromise;
    const db = client.db('shailraj');
    
    // Fetch package first to get title for log
    const pkg = await db.collection('packages').findOne({ _id: new ObjectId(data.id) });
    
    await db.collection('packages').deleteOne({ _id: new ObjectId(data.id) });
    
    if (pkg) {
      await logAuditAction({ data: { action: "Delete Package", entityType: "Package", details: `Deleted package: ${pkg.title}`, entityId: data.id } });
    }
    return { success: true };
  });
