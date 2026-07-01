import { Author } from '@/frontend/shared/types/author';

export type BlogCategory =
  | "Travel Guides"
  | "Temple Guides"
  | "Pilgrimage Planning"
  | "Spiritual Tourism";

export interface TOCItem {
  id: string;
  title: string;
  level: 2 | 3;
}

export interface BlogFAQ {
  question: string;
  answer: string;
}

export interface RelatedContent {
  slug: string;
  title: string;
  image?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;

  // Content
  excerpt: string;
  content: string; // The rich HTML content (1800-2500 words)
  tableOfContents: TOCItem[];
  faqs: BlogFAQ[];

  // Taxonomy
  category: BlogCategory;
  tags: string[];

  // Relations
  authorId: string;
  reviewerId?: string; // Optional reviewer
  relatedTourSlugs: string[]; // At least 2
  relatedArticleSlugs: string[]; // At least 2

  // Media
  featuredImage: string;
  ogImage: string;

  // Metadata
  readingTimeMinutes: number;
  publishedAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  lastReviewedAt?: string; // ISO Date String
}
