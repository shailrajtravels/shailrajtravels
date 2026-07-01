import { SEOData } from '@/frontend/shared/types/seo';

export interface TourPackage {
  title: string;
  price: string;
  inclusions: string[];
  exclusions: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface RelatedItem {
  title: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface Tour {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  heroContent: {
    image: string;
    mobileImage?: string;
    description: string;
  };
  overview: string;
  highlights: string[];
  destinations: string[];
  packages: TourPackage[];
  faq: FAQItem[];
  dates?: string[];
  schemaData: any; // Can be more specific if desired, e.g. Record<string, any>
  relatedTours: RelatedItem[];
  relatedBlogs: RelatedItem[];
}
