import { createServerFn } from "@tanstack/react-start";
import clientPromise from "./db";
import { getAdminToken } from "./token";
import { ObjectId } from "mongodb";
import { getCachedData, setCachedData, invalidateCache } from "./redis";
import { uploadImageToCloudinary } from "./cloudinary";
import { z } from "zod";

export const getCustomBlogsFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const cached = await getCachedData<any[]>("custom_blogs:all");
    if (cached) return cached;

    const client = await clientPromise;
    const db = client.db("shailraj");
    const blogs = await db.collection("custom_blogs").find({}).sort({ createdAt: -1 }).toArray();

    const mapped = blogs.map((b: any) => {
      const plainText = b.content ? b.content.replace(/<[^>]+>/g, '') : "";
      return {
        _id: b._id.toString(),
        title: b.title,
        slug: b.slug,
        content: b.content,
        excerpt: plainText.substring(0, 150) + (plainText.length > 150 ? "..." : ""),
        authorName: b.authorName || "Yatri",
        category: b.category || "Travel Guides",
        featuredImage: b.thumbnailUrl || "/images/blogs/default.jpg",
        ogImage: b.thumbnailUrl || "/images/blogs/default.jpg",
        publishedAt: b.createdAt || new Date().toISOString(),
        updatedAt: b.createdAt || new Date().toISOString(),
        readingTimeMinutes: Math.max(1, Math.ceil((b.content || "").split(/\s+/).length / 200)),
        tags: b.tags || ["Community"],
        isHidden: b.isHidden || false,
      };
    });

    await setCachedData("custom_blogs:all", mapped, 300); // 5 minutes cache
    return mapped;
  } catch (error) {
    console.error("Failed to fetch custom blogs", error);
    return [];
  }
});

export const getCustomBlogBySlugFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return z.object({
      slug: z.string(),
    }).parse(data);
  })
  .handler(async ({ data }) => {
    try {
      const client = await clientPromise;
      const db = client.db("shailraj");
      const blog = await db.collection("custom_blogs").findOne({ slug: data.slug });
      if (!blog) return null;

      return {
        _id: blog._id.toString(),
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        authorName: blog.authorName || "Yatri",
        category: blog.category || "Travel Guides",
        featuredImage: blog.thumbnailUrl || "/images/blogs/default.jpg",
        ogImage: blog.thumbnailUrl || "/images/blogs/default.jpg",
        publishedAt: blog.createdAt || new Date().toISOString(),
        updatedAt: blog.createdAt || new Date().toISOString(),
        readingTimeMinutes: Math.max(1, Math.ceil((blog.content || "").split(/\s+/).length / 200)),
        tags: blog.tags || ["Community"],
        isHidden: blog.isHidden || false,
      };
    } catch (error) {
      console.error("Failed to fetch custom blog by slug", error);
      return null;
    }
  });

export const createCustomBlogFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return z.object({
      title: z.string().min(3, "Title must be at least 3 characters"),
      content: z.string().min(10, "Content must be at least 10 characters"),
      authorName: z.string().min(2, "Author name must be at least 2 characters"),
      category: z.string().min(2, "Category is required"),
      thumbnailBase64: z.string().min(1, "Thumbnail is required"),
    }).parse(data);
  })
  .handler(async ({ data }) => {
    try {
      const { title, content, authorName, category, thumbnailBase64 } = data;

      // 1. Validate size (5MB max)
      const approxByteSize = (thumbnailBase64.length * 3) / 4;
      if (approxByteSize > 5 * 1024 * 1024) {
        throw new Error("Thumbnail size exceeds the 5MB limit.");
      }

      // 2. Upload to Cloudinary
      let thumbnailUrl = "";
      try {
        thumbnailUrl = await uploadImageToCloudinary(thumbnailBase64, "blogs");
      } catch (uploadErr: any) {
        console.error("Cloudinary upload failed:", uploadErr);
        throw new Error("Failed to upload thumbnail image to Cloudinary.");
      }

      // 3. Generate unique slug
      let slugBase = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (!slugBase) slugBase = "untitled";
      const uniqueSuffix = Date.now().toString().slice(-6);
      const slug = `${slugBase}-${uniqueSuffix}`;

      const client = await clientPromise;
      const db = client.db("shailraj");

      const newBlog = {
        title,
        slug,
        content,
        authorName,
        category,
        thumbnailUrl,
        createdAt: new Date().toISOString(),
      };

      const res = await db.collection("custom_blogs").insertOne(newBlog);
      await invalidateCache("custom_blogs:all");

      return { success: true, blogId: res.insertedId.toString(), slug };
    } catch (error: any) {
      console.error("Failed to create custom blog", error);
      throw new Error(error.message || "Failed to create custom blog");
    }
  });

export const deleteCustomBlogFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return z.object({
      adminToken: z.string(),
      id: z.string(),
    }).parse(data);
  })
  .handler(async ({ data }) => {
    try {
      if (data.adminToken !== getAdminToken()) {
        throw new Error("Unauthorized");
      }

      const client = await clientPromise;
      const db = client.db("shailraj");
      await db.collection("custom_blogs").deleteOne({ _id: new ObjectId(data.id) });
      await invalidateCache("custom_blogs:all");

      return { success: true };
    } catch (error: any) {
      console.error("Failed to delete custom blog", error);
      throw new Error(error.message || "Failed to delete custom blog");
    }
  });

export const updateCustomBlogFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return z.object({
      adminToken: z.string(),
      id: z.string(),
      title: z.string().min(3),
      content: z.string().min(10),
      authorName: z.string().min(2),
      category: z.string().min(2),
      thumbnailBase64: z.string().optional(),
    }).parse(data);
  })
  .handler(async ({ data }) => {
    try {
      if (data.adminToken !== getAdminToken()) {
        throw new Error("Unauthorized");
      }

      const client = await clientPromise;
      const db = client.db("shailraj");
      
      const updateDoc: any = {
        title: data.title,
        content: data.content,
        authorName: data.authorName,
        category: data.category,
        updatedAt: new Date().toISOString()
      };

      if (data.thumbnailBase64 && data.thumbnailBase64.length > 0) {
        const approxByteSize = (data.thumbnailBase64.length * 3) / 4;
        if (approxByteSize > 5 * 1024 * 1024) throw new Error("Thumbnail size exceeds 5MB.");
        updateDoc.thumbnailUrl = await uploadImageToCloudinary(data.thumbnailBase64, "blogs");
      }

      await db.collection("custom_blogs").updateOne(
        { _id: new ObjectId(data.id) },
        { $set: updateDoc }
      );
      await invalidateCache("custom_blogs:all");
      return { success: true };
    } catch (error: any) {
      console.error("Failed to update custom blog", error);
      throw new Error(error.message || "Failed to update custom blog");
    }
  });

export const toggleBlogVisibilityFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return z.object({
      adminToken: z.string(),
      id: z.string(),
      isHidden: z.boolean(),
    }).parse(data);
  })
  .handler(async ({ data }) => {
    try {
      if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");

      const client = await clientPromise;
      const db = client.db("shailraj");
      await db.collection("custom_blogs").updateOne(
        { _id: new ObjectId(data.id) },
        { $set: { isHidden: data.isHidden } }
      );
      await invalidateCache("custom_blogs:all");
      return { success: true };
    } catch (error: any) {
      console.error("Failed to toggle blog visibility", error);
      throw new Error(error.message || "Failed to toggle blog visibility");
    }
  });
