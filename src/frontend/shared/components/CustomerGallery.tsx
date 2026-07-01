import React from 'react';
import { LazyImage } from '@/frontend/shared/ui/lazy-image';

export const CustomerGallery: React.FC = () => {
  const images = [
    { url: "/images/gallery/customer1.jpg", alt: "Family at Kedarnath Temple" },
    { url: "/images/gallery/customer2.jpg", alt: "Group trip to Trimbakeshwar" },
    { url: "/images/gallery/customer3.jpg", alt: "Happy Yatris at Somnath" },
    { url: "/images/gallery/customer4.jpg", alt: "Senior citizens at Pandharpur" },
  ];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-blue-deep mb-4">
            Memories of Our Yatris
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            See the smiles of thousands of families who trusted us with their spiritual journeys.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group bg-slate-100">
              <LazyImage 
                src={img.url} 
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-sm font-medium">{img.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
