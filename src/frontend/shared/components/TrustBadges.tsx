import React from 'react';
import { ShieldCheck, Award, ThumbsUp, Headset } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: <Award className="w-8 h-8 text-brand-green" />,
      title: "15+ Years Experience",
      desc: "Trusted by thousands since 2011",
    },
    {
      icon: <ThumbsUp className="w-8 h-8 text-brand-green" />,
      title: "5000+ Happy Yatris",
      desc: "Consistently 5-star rated journeys",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-brand-green" />,
      title: "Verified Local Drivers",
      desc: "Expert route & safety knowledge",
    },
    {
      icon: <Headset className="w-8 h-8 text-brand-green" />,
      title: "24/7 Trip Support",
      desc: "We are always with you on the road",
    },
  ];

  return (
    <div className="bg-brand-blue-deep text-white py-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                {badge.icon}
              </div>
              <h4 className="text-lg font-bold mb-2">{badge.title}</h4>
              <p className="text-brand-blue-light text-sm">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
