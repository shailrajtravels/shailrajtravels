import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getReviewsFn } from "../lib/reviews";

import { translations } from "../features/core/i18n";
import { Navbar } from "../features/core/Navbar";
import { FooterSection as Footer } from "../features/core/Footer";
import { Star, User, Calendar } from "lucide-react";

export const Route = createFileRoute("/yatri-stories")({
  component: BlogPage,
  loader: async () => {
    try {
      const reviews = await getReviewsFn();
      return { reviews };
    } catch (e) {
      console.error(e);
      return { reviews: [] };
    }
  },
});

function BlogPage() {
  const lang = "en";
  const t = translations[lang];
  const { reviews } = Route.useLoaderData() as any;

  // Function to calculate a faux date based on index if no date is present
  const getReviewDate = (idx: number) => {
    const d = new Date();
    d.setDate(d.getDate() - idx * 3); // stagger dates
    return d.toLocaleDateString();
  };

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen selection:bg-brand-green/20 selection:text-brand-blue-deep overflow-x-hidden flex flex-col">
      <Navbar t={t} />
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        
        <div className="text-center mb-16 animate-reveal">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-green/10 text-brand-green-dark font-bold text-sm mb-4">
            {t.navBlog}
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-blue-deep mb-6">
            Yatri Stories & Experiences
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Read about the beautiful spiritual journeys and experiences of our Yatris who traveled with Shailraj Travels.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm animate-reveal">
            <h3 className="text-xl font-bold text-slate-400">No stories published yet.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review: any, idx: number) => (
              <article 
                key={review._id || idx} 
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col animate-reveal"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(review.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-green text-brand-green" />
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-bold text-brand-blue-deep mb-4 line-clamp-2">
                    {review.blogTitle}
                  </h3>
                  
                  <div className="text-slate-600 mb-6 flex-1 relative z-10 whitespace-pre-wrap line-clamp-6">
                    {review.blogContent}
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-brand-blue-deep text-sm">{review.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : getReviewDate(idx)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer t={t} />
    </div>
  );
}
