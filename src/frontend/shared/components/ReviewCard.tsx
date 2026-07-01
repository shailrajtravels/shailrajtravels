import React from 'react';
import { Review } from '@/frontend/shared/types/review';
import { Star, ShieldCheck, MapPin } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-brand-green bg-brand-green/10 px-2 py-1 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          Verified Pilgrim
        </div>
      </div>

      <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 italic">"{review.text}"</p>

      <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
        {review.photoUrl ? (
          <img
            src={review.photoUrl}
            alt={review.customerName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-sm">
            {review.customerName.charAt(0)}
          </div>
        )}
        <div>
          <h4 className="text-sm font-bold text-slate-800">{review.customerName}</h4>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="w-3 h-3" /> {review.city}
          </div>
        </div>
      </div>
    </div>
  );
};
