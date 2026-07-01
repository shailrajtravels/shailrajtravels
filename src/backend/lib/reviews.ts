import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import clientPromise from "./db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAdminToken } from "./token";
import { ObjectId } from "mongodb";
import { logAuditAction } from "./audit";
import { getCachedData, setCachedData, invalidateCache, rateLimiters } from "./redis";
import { z } from "zod";
const apiKey = process.env.VITE_GEMINI_API_KEY;

export const getReviewsFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const cached = await getCachedData<any[]>("admin:reviews");
    if (cached) return cached;

    const client = await clientPromise;
    const db = client.db("shailraj");
    const reviews = await db.collection("reviews").find({}).sort({ date: -1 }).toArray();

    // Map _id to string for serialization
    const mapped = reviews.map((r: any) => ({
      _id: r._id.toString(),
      name: r.name,
      rating: r.rating,
      textEn: r.textEn,
      textMr: r.textMr,
      blogTitle: r.blogTitle || "A Journey of Devotion",
      blogContent: r.blogContent || r.textEn || r.text,
      blogTitleMr: r.blogTitleMr || r.blogTitle || "भक्तीचा प्रवास",
      blogContentMr: r.blogContentMr || r.textMr || r.text,
      date: r.date,
    }));
    await setCachedData("admin:reviews", mapped);
    return mapped;
  } catch (error) {
    console.error("Failed to fetch reviews", error);
    return [];
  }
});

const addReviewSchema = z.object({
  name: z.string().min(2, "Name is required"),
  rating: z.number().min(1).max(5),
  text: z.string().min(5, "Review text is too short"),
});

export const addReviewFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => addReviewSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      // Rate Limiting Check
      if (rateLimiters.api) {
        const req = getRequest();
        const ip =
          req?.headers.get("x-forwarded-for") || req?.headers.get("x-real-ip") || "unknown";
        const { success } = await rateLimiters.api.limit(`review:${ip}`);
        if (!success) {
          throw new Error("Too many review submissions. Please try again later.");
        }
      }

      const { name, rating, text } = data;

      let textEn = text;
      let textMr = text;

      // Auto-translate using Gemini
      if (apiKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          let model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

          const prompt = `You are a translator for Shailraj Travels.
You will receive a customer review of their trip.
Translate the raw review into BOTH English and Marathi.

OUTPUT FORMAT:
You must return a raw JSON object (no markdown, no \`\`\` tags).
{
  "textEn": "String (English translation of the review)",
  "textMr": "String (Marathi translation of the review)"
}

Review text:
"${text}"`;

          let resultText = "";
          try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            resultText = response.text();
          } catch (e: any) {
            if (e.message?.includes("404") || e.status === 404) {
              model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
              const result = await model.generateContent(prompt);
              const response = await result.response;
              resultText = response.text();
            } else {
              throw e;
            }
          }

          // Clean JSON
          const jsonStr = resultText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          const parsed = JSON.parse(jsonStr);
          if (parsed.textEn) textEn = parsed.textEn;
          if (parsed.textMr) textMr = parsed.textMr;
        } catch (e) {
          console.error("Translation failed, saving original text:", e);
        }
      }

      const client = await clientPromise;
      const db = client.db("shailraj");

      const newReview = {
        name,
        rating,
        textEn,
        textMr,
        date: new Date().toISOString(),
      };

      const res = await db.collection("reviews").insertOne(newReview);
      await invalidateCache("admin:reviews");

      return { success: true, review: { ...newReview, _id: res.insertedId.toString() } };
    } catch (error: any) {
      console.error("Failed to add review", error);
      throw new Error(error.message || "Failed to add review");
    }
  });

export const deleteReviewFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");

    const client = await clientPromise;
    const db = client.db("shailraj");

    const review = await db.collection("reviews").findOne({ _id: new ObjectId(data.id) });
    await db.collection("reviews").deleteOne({ _id: new ObjectId(data.id) });
    if (review) {
      await logAuditAction({
        data: {
          action: "Delete Review",
          entityType: "Review",
          details: `Deleted review by ${review.name}`,
          entityId: data.id,
        },
      });
    }
    await invalidateCache("admin:reviews");
    return { success: true };
  });
