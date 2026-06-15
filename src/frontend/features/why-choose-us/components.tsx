import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function FeatureCardBig({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white rounded-3xl p-8 md:p-10 flex flex-col items-center text-center shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-slate-100/50 hover:shadow-[0_12px_50px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-center mb-4 shrink-0 relative -mt-4">
        {icon}
      </div>
      <h3 className="text-[22px] md:text-[24px] font-bold text-[#1A2E35] mb-5 leading-tight whitespace-pre-line font-display tracking-tight">{title}</h3>
      <div className="w-8 h-[3px] bg-[#10A34A] mb-6 rounded-full opacity-80"></div>
      <p className="text-[15px] text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

export function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 bg-white px-5 py-3 md:px-6 md:py-3.5 rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-[#10A34A]/10 transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgb(16,163,74,0.15)] cursor-default">
      <CheckCircle2 className="w-[24px] h-[24px] md:w-[28px] md:h-[28px] text-[#10A34A] shrink-0" />
      <span className="text-[16px] md:text-[18px] font-bold text-[#1A2E35] tracking-tight">{text}</span>
    </div>
  );
}
