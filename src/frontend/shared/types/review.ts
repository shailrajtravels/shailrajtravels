export interface Review {
  id: string;
  customerName: string;
  tourSlug: string; // To link review to a specific tour
  rating: number; // 1 to 5
  text: string;
  date: string; // ISO date string
  city: string;
  featured?: boolean; // Whether to show on homepage
  photoUrl?: string; // Optional customer photo
}
