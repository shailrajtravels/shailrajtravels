import { createServerFn } from '@tanstack/react-start';
import clientPromise from '../lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAdminToken } from './token';
import { ObjectId } from 'mongodb';
import { logAuditAction } from './audit';
const apiKey = process.env.VITE_GEMINI_API_KEY;

export const getReviewsFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const client = await clientPromise;
    const db = client.db('shailraj');
    const reviews = await db
      .collection('reviews')
      .find({})
      .sort({ date: -1 })
      .toArray();
    
    // Map _id to string for serialization
    return reviews.map((r) => ({
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
  } catch (error) {
    console.error("Failed to fetch reviews", error);
    return [];
  }
});

type AddReviewInput = {
  name: string;
  rating: number;
  text: string;
};

export const addReviewFn = createServerFn({ method: 'POST' })
  .validator((data: AddReviewInput) => data)
  .handler(async ({ data }) => {
    try {
      const { name, rating, text } = data;
      
      let textEn = text;
      let textMr = text;
      let blogTitle = "A Journey of Devotion";
      let blogContent = text;
      let blogTitleMr = "भक्तीचा प्रवास";
      let blogContentMr = text;
      
      // Auto-translate and generate blog using Gemini
      if (apiKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          let model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
          
          const prompt = `You are an expert travel blog writer and translator for Shailraj Travels.
You will receive a short user review of their trip.
Task 1: Translate the raw review into BOTH English and Marathi.
Task 2: Write a completely new, beautifully expanded 3-paragraph travelogue story based on their review. DO NOT just copy their review. Write a creative story in the third person or first person adding immersive details. Create a catchy blog title. Do this in BOTH English and Marathi.

OUTPUT FORMAT:
You must return a raw JSON object (no markdown, no \`\`\` tags).
{
  "textEn": "String",
  "textMr": "String",
  "blogTitle": "String",
  "blogContent": "String (must be 2-3 paragraphs, completely rewritten from the review)",
  "blogTitleMr": "String",
  "blogContentMr": "String"
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
          const jsonStr = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(jsonStr);
          if (parsed.textEn) textEn = parsed.textEn;
          if (parsed.textMr) textMr = parsed.textMr;
          if (parsed.blogTitle) blogTitle = parsed.blogTitle;
          if (parsed.blogContent) blogContent = parsed.blogContent;
          if (parsed.blogTitleMr) blogTitleMr = parsed.blogTitleMr;
          if (parsed.blogContentMr) blogContentMr = parsed.blogContentMr;
          
        } catch (e) {
          console.error("Translation/Blog generation failed, saving original text:", e);
        }
      }
      
      const client = await clientPromise;
      const db = client.db('shailraj');
      
      const newReview = {
        name,
        rating,
        textEn,
        textMr,
        blogTitle,
        blogContent,
        blogTitleMr,
        blogContentMr,
        date: new Date().toISOString(),
      };
      
      const res = await db.collection('reviews').insertOne(newReview);
      
      return { success: true, review: { ...newReview, _id: res.insertedId.toString() } };
    } catch (error: any) {
      console.error("Failed to add review", error);
      throw new Error(error.message || "Failed to add review");
    }
  });

export const deleteReviewFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    
    const client = await clientPromise;
    const db = client.db('shailraj');
    
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(data.id) });
    await db.collection('reviews').deleteOne({ _id: new ObjectId(data.id) });
    if (review) {
      await logAuditAction({ data: { action: "Delete Review", entityType: "Review", details: `Deleted review by ${review.name}`, entityId: data.id } });
    }
    return { success: true };
  });
