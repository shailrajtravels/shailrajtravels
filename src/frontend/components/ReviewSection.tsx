import React from 'react';
import { ReviewCard } from './ReviewCard';
import { customerReviews } from '../frontend/data/reviews';

interface ReviewSectionProps {
  tourSlug?: string; // If provided, shows reviews for this tour. Otherwise shows featured reviews.
  title?: string;
  subtitle?: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ 
  tourSlug, 
  title = "What Our Pilgrims Say", 
  subtitle = "Read real experiences from thousands of happy Yatris who traveled with us."
}) => {
  // Filter reviews
  const reviewsToShow = tourSlug 
    ? customerReviews.filter(r => r.tourSlug === tourSlug)
    : customerReviews.filter(r => r.featured);

  if (reviewsToShow.length === 0) return null;

  // Calculate Aggregate Rating
  const totalRating = reviewsToShow.reduce((acc, curr) => acc + curr.rating, 0);
  const avgRating = (totalRating / reviewsToShow.length).toFixed(1);

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-blue-deep mb-4">{title}</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <span className="text-lg font-bold text-slate-800">{avgRating}/5.0</span>
            <span className="text-sm text-slate-500">Average Rating based on {reviewsToShow.length} verified reviews</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewsToShow.slice(0, 3).map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};
