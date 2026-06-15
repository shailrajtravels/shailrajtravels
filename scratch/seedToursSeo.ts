// @ts-nocheck
import { MongoClient } from 'mongodb';
import { tours as enTours } from '../backup_seo/data/tours.en.ts';
import { toursMR as mrTours } from '../backup_seo/data/tours.mr.ts';

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('shailraj');
    const collection = db.collection('tours');

    await collection.deleteMany({});
    
    // Insert EN tours
    for (const tour of enTours) {
      tour.createdAt = new Date();
      tour.lang = 'en';
      
      // If it has city variants, insert those as well
      const cityVariants = tour.cityVariants || [];
      delete tour.cityVariants; // don't store inside the document
      
      await collection.insertOne(tour);
      console.log(`Inserted EN tour: ${tour.title} (${tour.slug})`);
      
      for (const cv of cityVariants) {
        const cvTour = {
          ...tour,
          _id: undefined,
          slug: `${tour.slug}-from-${cv.citySlug}`,
          title: `${tour.title} from ${cv.cityName}`,
          metaTitle: cv.metaTitle,
          metaDescription: cv.metaDescription,
          heroContent: {
            ...tour.heroContent,
            description: cv.heroDescription
          },
          overview: cv.overview,
          faq: cv.faq,
          packages: cv.packages && cv.packages.length > 0 ? cv.packages : tour.packages,
          lang: 'en'
        };
        await collection.insertOne(cvTour);
        console.log(`Inserted EN city variant: ${cvTour.title} (${cvTour.slug})`);
      }
    }

    // Insert MR tours
    for (const tour of mrTours) {
      tour.createdAt = new Date();
      tour.lang = 'mr';
      
      const cityVariants = tour.cityVariants || [];
      delete tour.cityVariants;
      
      await collection.insertOne(tour);
      console.log(`Inserted MR tour: ${tour.title} (${tour.slug})`);
      
      for (const cv of cityVariants) {
        const cvTour = {
          ...tour,
          _id: undefined,
          slug: `${tour.slug}-from-${cv.citySlug}`,
          title: `${tour.title} from ${cv.cityName}`,
          metaTitle: cv.metaTitle,
          metaDescription: cv.metaDescription,
          heroContent: {
            ...tour.heroContent,
            description: cv.heroDescription
          },
          overview: cv.overview,
          faq: cv.faq,
          packages: cv.packages && cv.packages.length > 0 ? cv.packages : tour.packages,
          lang: 'mr'
        };
        await collection.insertOne(cvTour);
        console.log(`Inserted MR city variant: ${cvTour.title} (${cvTour.slug})`);
      }
    }

    console.log('Successfully seeded SEO tours collection!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.close();
  }
}

seed();

