import React, { useState } from 'react';
import { Star, CheckCircle2, User, FileText, Send, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Route } from '../../routes/index';
import { addReviewFn } from '../../lib/reviews';

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Sanjay Deshmukh",
    date: "2 weeks ago",
    rating: 5,
    text: "Excellent service by Shailraj Travels. The Ashtavinayak yatra was very well organized, hotels were clean, and the food was amazing. Highly recommend them for family trips.",
    textMr: "शैलराज ट्रॅव्हल्सची सेवा अतिशय उत्तम आहे. अष्टविनायक यात्रा खूप चांगल्या प्रकारे आयोजित केली होती, हॉटेल्स स्वच्छ होती आणि जेवण अप्रतिम होते. कौटुंबिक सहलींसाठी मी नक्की शिफारस करेन."
  },
  {
    id: 2,
    name: "Priya Kulkarni",
    date: "1 month ago",
    rating: 5,
    text: "We went to Ujjain Mahakal with Shailraj Travels. The tour manager was very polite and helpful. Darshan was smooth. Best travel agency in Pune!",
    textMr: "आम्ही शैलराज ट्रॅव्हल्ससोबत उज्जैन महाकालला गेलो होतो. टूर मॅनेजर अतिशय नम्र आणि मदत करणारे होते. दर्शन अगदी सुरळीत झाले. पुण्यातील सर्वोत्तम ट्रॅव्हल एजन्सी!"
  },
  {
    id: 3,
    name: "Rahul Patil",
    date: "2 months ago",
    rating: 5,
    text: "Very comfortable journey and safe driving. The AC coach was very nice. Thank you for a wonderful spiritual experience.",
    textMr: "अतिशय आरामदायी प्रवास आणि सुरक्षित ड्रायव्हिंग. एसी कोच खूप छान होता. एका सुंदर आध्यात्मिक अनुभवासाठी धन्यवाद."
  }
];

export function ReviewsSection({ lang, t }: { lang: 'mr' | 'en', t: any }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    if (!review.trim()) return;
    setIsRefining(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        alert("Please add VITE_GEMINI_API_KEY to your .env file!");
        setIsRefining(false);
        return;
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      let model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `Correct the grammar and spelling, and improve the flow of this review, while keeping the original sentiment and language (English or Marathi). Return ONLY the improved review text without any other comments.\n\nReview:\n${review}`;
      
      let text = "";
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
      } catch (e: any) {
        if (e.message?.includes("404") || e.status === 404) {
          console.log("Fallback to gemini-2.5-flash...");
          model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          text = response.text();
        } else {
          throw e;
        }
      }

      setReview(text.trim());
    } catch (error: any) {
      console.error("AI Refine Error:", error);
      alert(`AI Refine failed: ${error.message}`);
    }
    setIsRefining(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !review.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addReviewFn({ data: { name: name.trim(), rating, text: review.trim() } });
      setShowToast(true);
      
      // Copy to clipboard (optional, kept from previous feature)
      try {
        await navigator.clipboard.writeText(review);
      } catch (err) {
        console.error("Failed to copy text", err);
      }
      
      setTimeout(() => {
        window.open("https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4", "_blank");
        setName("");
        setReview("");
        setRating(5);
        setTimeout(() => setShowToast(false), 3000);
        // Force reload to show new review, or rely on react-query invalidate
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { reviews: dbReviews } = Route.useLoaderData() as any;
  // Fallback to MOCK_REVIEWS if DB is empty (e.g. fresh installation)
  const displayReviews = dbReviews && dbReviews.length > 0 ? dbReviews : MOCK_REVIEWS;

  return (
    <section id="reviews" className="w-full bg-white py-12 lg:py-20 relative scroll-mt-28 md:scroll-mt-32 overflow-hidden">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-brand-green text-white px-6 py-3.5 rounded-full font-bold shadow-2xl transition-all duration-500 flex items-center gap-2 ${showToast ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"}`}>
        <CheckCircle2 className="w-5 h-5" />
        {t.reviewFormSuccess}
      </div>

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col items-center text-center mb-12 animate-reveal">
          <p className="flex items-center gap-3 text-[13px] md:text-[15px] font-bold tracking-[0.2em] text-brand-green-dark mb-4 uppercase">
            <span className="h-px w-8 bg-brand-green" />
            {t.reviewTitle}
            <span className="h-px w-8 bg-brand-green" />
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-brand-blue-deep leading-tight">
            {t.reviewSubtitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Write Review Form */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-xl shadow-brand-blue/5 border border-slate-100 sticky top-32">
              <form action="https://formspree.io/f/placeholder" method="POST" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <input type="hidden" name="rating" value={rating} />
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${rating >= star ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-slate-100 text-slate-200'} transition-colors`} />
                    </button>
                  ))}
                </div>
                
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={t.reviewFormName}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-mist border-none rounded-xl px-4 py-3.5 text-[15px] font-medium text-brand-blue-deep placeholder-slate-400 focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all outline-none"
                />
                
                <div className="relative">
                  <textarea
                    name="review"
                    required
                    placeholder={t.reviewFormText}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={4}
                    className="w-full bg-brand-mist border-none rounded-xl px-4 py-3.5 text-[15px] font-medium text-brand-blue-deep placeholder-slate-400 focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all resize-none outline-none pb-12"
                  />
                  <button
                    type="button"
                    onClick={handleRefine}
                    disabled={isRefining || !review.trim()}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg text-xs font-bold shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    {isRefining ? t.reviewRefineWait : t.reviewRefineBtn}
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || showToast}
                  className="w-full mt-2 bg-brand-blue hover:bg-brand-blue-deep text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.reviewFormSubmitting}
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-5 h-5 bg-white rounded-full p-0.5 group-hover:scale-110 transition-transform">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      {t.reviewFormSubmit}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Existing Reviews Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displayReviews.map((r: any) => {
              const review = r as any;
              return (
              <div key={review._id || review.id} className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-1 text-[#F59E0B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < (review.rating || 5) ? 'fill-current' : 'fill-slate-100 text-slate-200'}`} />
                    ))}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-sm">G</span>
                  </div>
                </div>
                <p className="text-slate-700 text-[15px] sm:text-[16px] leading-relaxed mb-8 italic flex-1">
                  "{lang === 'mr' ? review.textMr : review.textEn || review.text}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-brand-mist flex items-center justify-center text-brand-blue-deep font-bold text-lg shrink-0 uppercase">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-blue-deep text-[15px]">{review.name}</h4>
                    <p className="text-slate-500 text-[13px] font-medium">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )
            })}
          </div>
        </div>
      </div>    </section>
  );
}
