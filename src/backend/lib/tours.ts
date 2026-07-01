import { createServerFn } from "@tanstack/react-start";
import { getAdminToken } from "./token";
import { tourRepository } from "./repositories/TourRepository";
import { uploadImageToCloudinary } from "./cloudinary";
import { logAuditAction } from "./audit";
import { getCachedData, setCachedData, invalidateCache } from "./redis";
import { isUpcomingDate } from "./bookings";

export const getToursFn = createServerFn({ method: "POST" })
  .validator((data?: { lang?: string }) => data || {})
  .handler(async ({ data }) => {
    try {
      const cacheKey = `admin:tours:${data.lang || "all"}`;
      const cached = await getCachedData<any[]>(cacheKey);
      if (cached) return cached;

      const query: any = {};
      if (data.lang) {
        query.lang = data.lang;
      } else {
        query.lang = { $in: ["en", null] };
      }

      const tours = await tourRepository.findAllSorted(query);

      const mapped = tours.map((t: any) => ({
        _id: t._id.toString(),
        slug: t.slug,
        lang: t.lang || "en",
        title: t.title,
        metaTitle: t.metaTitle,
        metaDescription: t.metaDescription,
        canonicalUrl: t.canonicalUrl,
        heroContent: t.heroContent || { image: "", description: "" },
        overview: t.overview,
        highlights: t.highlights || [],
        destinations: t.destinations || [],
        dates: Array.isArray(t.dates) ? t.dates.filter(isUpcomingDate) : [],
        packages: t.packages || [],
        faq: t.faq || [],
        relatedTours: t.relatedTours || [],
        relatedBlogs: t.relatedBlogs || [],
      }));
      await setCachedData(cacheKey, mapped);
      return mapped;
    } catch (error) {
      console.error("Failed to fetch tours", error);
      return [];
    }
  });

// Get single tour by slug
export const getTourBySlugFn = createServerFn({ method: "POST" })
  .validator((data: { slug: string; lang?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const query: any = { slug: data.slug };
      if (data.lang) {
        query.lang = data.lang;
      } else {
        query.lang = { $in: ["en", null] }; // default to english or un-versioned
      }

      const tour = await tourRepository.findBySlug(data.slug, { lang: query.lang });

      if (!tour) return null;

      return {
        _id: tour._id.toString(),
        slug: tour.slug,
        lang: tour.lang || "en",
        title: tour.title,
        metaTitle: tour.metaTitle,
        metaDescription: tour.metaDescription,
        canonicalUrl: tour.canonicalUrl,
        heroContent: tour.heroContent || { image: "", description: "" },
        overview: tour.overview,
        highlights: tour.highlights || [],
        destinations: tour.destinations || [],
        dates: Array.isArray(tour.dates) ? tour.dates.filter(isUpcomingDate) : [],
        packages: tour.packages || [],
        faq: tour.faq || [],
        relatedTours: tour.relatedTours || [],
        relatedBlogs: tour.relatedBlogs || [],
        schemaData: tour.schemaData || null,
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
    if (newData.heroContent.image.startsWith("data:image")) {
      newData.heroContent.image = await uploadImageToCloudinary(newData.heroContent.image, "tours");
    }
  }

  return newData;
};

export const createTourFn = createServerFn({ method: "POST" })
  .validator((data: TourInput) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");

    const processedData = await processTourImages(data.data);
    processedData.createdAt = new Date();

    const insertedId = await tourRepository.insertOne(processedData);

    await logAuditAction({
      data: {
        action: "Create Tour",
        entityType: "Tour",
        details: `Created tour: ${processedData.title}`,
        entityId: insertedId,
      },
    });
    await invalidateCache("admin:tours:all");
    await invalidateCache("admin:tours:en");
    await invalidateCache("admin:tours:mr");
    return { success: true, id: insertedId };
  });

export const updateTourFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string; data: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");

    const processedData = await processTourImages(data.data);
    const updateData = { ...processedData };
    delete updateData._id; // prevent _id override

    await tourRepository.updateOne(data.id, updateData);

    await logAuditAction({
      data: {
        action: "Update Tour",
        entityType: "Tour",
        details: `Updated tour: ${updateData.title || data.id}`,
        entityId: data.id,
      },
    });
    await invalidateCache("admin:tours:all");
    await invalidateCache("admin:tours:en");
    await invalidateCache("admin:tours:mr");
    return { success: true };
  });

export const deleteTourFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");

    const tour = await tourRepository.findById(data.id);

    if (tour && tour.slug) {
      // Delete all language versions of the tour
      await tourRepository.deleteManyBySlug(tour.slug);
      await logAuditAction({
        data: {
          action: "Delete Tour",
          entityType: "Tour",
          details: `Deleted all language versions of tour: ${tour.title}`,
          entityId: data.id,
        },
      });
    } else {
      await tourRepository.deleteOne(data.id);
      await logAuditAction({
        data: {
          action: "Delete Tour",
          entityType: "Tour",
          details: `Deleted tour: ${tour?.title || data.id}`,
          entityId: data.id,
        },
      });
    }

    await invalidateCache("admin:tours:all");
    await invalidateCache("admin:tours:en");
    await invalidateCache("admin:tours:mr");
    return { success: true };
  });
