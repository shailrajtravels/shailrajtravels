import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: 'dquecn5qj',
  api_key: '912918221149553',
  api_secret: '2nz-n7M7UnXDw42pAjwS4tDg0H0',
  secure: true,
});

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function migrate() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('shailraj');

  console.log("Starting Gallery migration...");
  const gallery = await db.collection('gallery').find({}).toArray();
  for (const photo of gallery) {
    if (photo.imageUrl && photo.imageUrl.startsWith('data:image')) {
      console.log(`Uploading gallery photo ${photo._id}...`);
      try {
        const res = await cloudinary.uploader.upload(photo.imageUrl, { folder: "gallery", resource_type: "auto" });
        await db.collection('gallery').updateOne({ _id: photo._id }, { $set: { imageUrl: res.secure_url } });
        console.log(`Updated gallery photo ${photo._id} to ${res.secure_url}`);
      } catch (e: any) {
        console.error(`Failed gallery ${photo._id}:`, e.message);
      }
    }
  }

  console.log("Starting Packages migration...");
  const packages = await db.collection('packages').find({}).toArray();
  for (const pkg of packages) {
    let updated = false;
    const newData = { ...pkg };

    if (newData.images && Array.isArray(newData.images)) {
      newData.images = await Promise.all(newData.images.map(async (img: string, idx: number) => {
        if (img.startsWith('data:image')) {
          console.log(`Uploading package ${pkg._id} image ${idx}...`);
          try {
            const res = await cloudinary.uploader.upload(img, { folder: "packages", resource_type: "auto" });
            updated = true;
            return res.secure_url;
          } catch (e: any) {
            console.error(`Failed package ${pkg._id} image ${idx}:`, e.message);
            return img;
          }
        }
        return img;
      }));
      if (newData.images.length > 0) {
        newData.image = newData.images[0];
      }
    }

    if (updated) {
      const { _id, ...updatePayload } = newData;
      await db.collection('packages').updateOne({ _id: pkg._id }, { $set: updatePayload });
      console.log(`Updated package ${pkg._id}`);
    }
  }

  await client.close();
  console.log("Migration complete!");
}

migrate();
