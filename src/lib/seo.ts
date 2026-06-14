import type { MetaDescriptor } from "@tanstack/react-router";

export interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  type?: "website" | "article";
}

export function generateSEO({
  title,
  description,
  canonicalUrl,
  ogImage = "https://www.shailrajtravels.com/og-image.jpg",
  type = "website",
}: SEOProps): MetaDescriptor[] {
  const meta: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  if (canonicalUrl) {
    meta.push({ property: "og:url", content: canonicalUrl });
  }

  return meta;
}
