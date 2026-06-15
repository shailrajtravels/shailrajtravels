import React from 'react';
import { businessConfig } from '../config/business';

export const BusinessStats: React.FC = () => {
  const stats = [
    { value: `${new Date().getFullYear() - businessConfig.establishedYear}+`, label: 'Years of Excellence' },
    { value: `${(businessConfig.happyTravelers / 1000).toFixed(0)}k+`, label: 'Happy Yatris' },
    { value: `${businessConfig.totalToursConducted}+`, label: 'Tours Conducted' },
    { value: `${businessConfig.pilgrimageDestinations}+`, label: 'Sacred Destinations' },
  ];

  return (
    <div className="bg-white py-12 border-y border-slate-100">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center px-4">
              <span className="text-4xl md:text-5xl font-display font-bold text-brand-orange mb-2">{stat.value}</span>
              <span className="text-sm md:text-base font-bold text-brand-blue-deep uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
