import { SEOData } from './seo';

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

export interface CityVariant {
  citySlug: string;
  cityName: string;
  metaTitle: string;
  metaDescription: string;
  heroDescription: string;
  overview: string;
  faq: FAQItem[];
  packages?: TourPackage[];
}

export interface Tour {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  heroContent: {
    image: string;
    description: string;
  };
  overview: string;
  highlights: string[];
  destinations: string[];
  packages: TourPackage[];
  faq: FAQItem[];
  schemaData: any; // Can be more specific if desired, e.g. Record<string, any>
  relatedTours: RelatedItem[];
  relatedBlogs: RelatedItem[];
  cityVariants?: CityVariant[];
}
