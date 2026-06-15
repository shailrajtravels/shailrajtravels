import { createServerFn } from '@tanstack/react-start';
import clientPromise from './db';
import { getAdminToken } from './token';
import { ObjectId } from 'mongodb';
import { uploadImageToCloudinary } from './cloudinary';
import { logAuditAction } from './audit';

// Get all tours
export const getToursFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const client = await clientPromise;
    const db = client.db('shailraj');
    const tours = await db.collection('tours').find({}).sort({ createdAt: -1 }).toArray();
    
    return tours.map((t: any) => ({
      _id: t._id.toString(),
      slug: t.slug,
      title: t.title,
      metaTitle: t.metaTitle,
      metaDescription: t.metaDescription,
      canonicalUrl: t.canonicalUrl,
      heroContent: t.heroContent || { image: '', description: '' },
      overview: t.overview,
      highlights: t.highlights || [],
      destinations: t.destinations || [],
      packages: t.packages || [],
      faq: t.faq || [],
      relatedTours: t.relatedTours || [],
      relatedBlogs: t.relatedBlogs || []
    }));
  } catch (error) {
    console.error("Failed to fetch tours", error);
    return [];
  }
});

// Get single tour by slug
export const getTourBySlugFn = createServerFn({ method: 'POST' })
  .validator((data: { slug: string, lang?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const client = await clientPromise;
      const db = client.db('shailraj');
      
      const query: any = { slug: data.slug };
      if (data.lang) {
        query.lang = data.lang;
      } else {
        query.lang = { $in: ['en', null] }; // default to english or un-versioned
      }
      
      const tour = await db.collection('tours').findOne(query);
      
      if (!tour) return null;

      return {
        _id: tour._id.toString(),
        slug: tour.slug,
        lang: tour.lang || 'en',
        title: tour.title,
        metaTitle: tour.metaTitle,
        metaDescription: tour.metaDescription,
        canonicalUrl: tour.canonicalUrl,
        heroContent: tour.heroContent || { image: '', description: '' },
        overview: tour.overview,
        highlights: tour.highlights || [],
        destinations: tour.destinations || [],
        packages: tour.packages || [],
        faq: tour.faq || [],
        relatedTours: tour.relatedTours || [],
        relatedBlogs: tour.relatedBlogs || [],
        schemaData: tour.schemaData || null
      };
    } catch (error) {
      console.error("Failed to fetch tour by slug", error);
      return null;
    }
  });

type TourInput = {
  adminToken: string;
  data: any;
};

// Helper to process base64 images inside tour data
const processTourImages = async (tourData: any) => {
  const newData = { ...tourData };
  
  if (newData.heroContent && newData.heroContent.image) {
    if (newData.heroContent.image.startsWith('data:image')) {
      newData.heroContent.image = await uploadImageToCloudinary(newData.heroContent.image, "tours");
    }
  }
  
  return newData;
};

export const createTourFn = createServerFn({ method: 'POST' })
  .validator((data: TourInput) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    
    const client = await clientPromise;
    const db = client.db('shailraj');
    
    const processedData = await processTourImages(data.data);
    processedData.createdAt = new Date();

    const result = await db.collection('tours').insertOne(processedData);
    
    await logAuditAction({ data: { action: "Create Tour", entityType: "Tour", details: `Created tour: ${processedData.title}`, entityId: result.insertedId.toString() } });
    return { success: true, id: result.insertedId.toString() };
  });

export const updateTourFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, id: string, data: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    
    const client = await clientPromise;
    const db = client.db('shailraj');
    
    const processedData = await processTourImages(data.data);
    const updateData = { ...processedData };
    delete updateData._id; // prevent _id override

    await db.collection('tours').updateOne(
      { _id: new ObjectId(data.id) },
      { $set: updateData }
    );
    
    await logAuditAction({ data: { action: "Update Tour", entityType: "Tour", details: `Updated tour: ${updateData.title || data.id}`, entityId: data.id } });
    return { success: true };
  });

export const deleteTourFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    
    const client = await clientPromise;
    const db = client.db('shailraj');
    
    const tour = await db.collection('tours').findOne({ _id: new ObjectId(data.id) });
    await db.collection('tours').deleteOne({ _id: new ObjectId(data.id) });
    
    await logAuditAction({ data: { action: "Delete Tour", entityType: "Tour", details: `Deleted tour: ${tour?.title || data.id}`, entityId: data.id } });
    return { success: true };
  });
