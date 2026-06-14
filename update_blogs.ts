import { MongoClient, ObjectId } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const apiKey = process.env.VITE_GEMINI_API_KEY;

async function migrate() {
  if (!apiKey) {
    console.error("No API key");
    return;
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('shailraj');
  
  const reviews = await db.collection('reviews').find({}).toArray();

  console.log(`Found ${reviews.length} reviews to migrate`);

  const genAI = new GoogleGenerativeAI(apiKey);
  let model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  for (const review of reviews) {
    console.log(`Processing review ${review._id}...`);
    const prompt = `You are an expert travel blogger for Shailraj Travels.
I have a short customer review. I need you to write a completely new, beautifully expanded 3-paragraph travelogue story based on their review.
DO NOT just copy their review. Write a creative story in the third person or first person. Create a unique, catchy blog title. Do this in BOTH English and Marathi.

OUTPUT FORMAT:
You must return a raw JSON object (no markdown, no \`\`\` tags).
{
  "blogTitle": "String",
  "blogContent": "String",
  "blogTitleMr": "String",
  "blogContentMr": "String"
}

Review text:
${review.text || review.textEn || review.textMr}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const resultText = response.text();
      
      console.log("Raw Gemini Output:", resultText);
      
      const jsonStr = resultText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      
      const updateData: any = {};
      if (parsed.blogTitle) updateData.blogTitle = parsed.blogTitle;
      if (parsed.blogContent && parsed.blogContent.length > 20) updateData.blogContent = parsed.blogContent;
      if (parsed.blogTitleMr) updateData.blogTitleMr = parsed.blogTitleMr;
      if (parsed.blogContentMr && parsed.blogContentMr.length > 20) updateData.blogContentMr = parsed.blogContentMr;
      
      if (Object.keys(updateData).length > 0) {
        await db.collection('reviews').updateOne(
          { _id: review._id },
          { $set: updateData }
        );
        console.log(`Updated ${review._id} successfully`);
      } else {
        console.log(`No valid fields to update for ${review._id}`);
      }
    } catch (e: any) {
      console.error(`Failed for ${review._id}:`, e.message);
    }
  }

  await client.close();
  console.log("Done");
}

migrate();
