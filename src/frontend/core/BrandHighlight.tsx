import React from 'react';

export function highlightBrandName(text: string) {
  if (!text) return "";
  
  // Regex to match "Shailraj Travels", "Shailraj", "शैलराज ट्रॅव्हल्स", or "शैलराज"
  const regex = /(Shailraj\s+Travels|Shailraj|शैलराज\s+ट्रॅव्हल्स|शैलराज)/gi;
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    const lower = part.toLowerCase().trim();
    if (lower === "shailraj travels" || lower === "शैलराज ट्रॅव्हल्स") {
      const isMarathi = lower.includes("ट्रॅव्हल्स");
      return (
        <span key={i} className="inline-flex gap-1 items-center font-bold">
          <span className="text-[#E10600]">{isMarathi ? "शैलराज" : "Shailraj"}</span>
          <span className="text-[#2FAF43]">{isMarathi ? "ट्रॅव्हल्स" : "Travels"}</span>
        </span>
      );
    } else if (lower === "shailraj" || lower === "शैलराज") {
      return (
        <span key={i} className="text-[#E10600] font-bold">
          {part}
        </span>
      );
    }
    return part;
  });
}

export const BrandHighlight: React.FC<{ text: string }> = ({ text }) => {
  return <>{highlightBrandName(text)}</>;
};
