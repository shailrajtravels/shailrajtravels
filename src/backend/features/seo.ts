import type { MetaDescriptor } from '@tanstack/react-router';

export interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  type?: "website" | "article";
  lang?: string;
}

export function generateSEO({
  title,
  description,
  canonicalUrl,
  ogImage = "https://www.shailrajtravels.com/og-image.jpg",
  type = "website",
  lang = "en",
}: SEOProps): any {
  const meta: any[] = [
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

export function generateHreflangLinks(currentUrl: string) {
  const urlObj = new URL(currentUrl);
  const path = urlObj.pathname;

  // Basic logic to swap /mr/ to / and vice-versa
  const enUrl = path.startsWith("/mr/")
    ? `${urlObj.origin}${path.replace("/mr/", "/")}`
    : currentUrl;

  const mrUrl = path.startsWith("/mr/") ? currentUrl : `${urlObj.origin}/mr${path}`;

  return [
    { rel: "alternate", hrefLang: "en", href: enUrl },
    { rel: "alternate", hrefLang: "mr", href: mrUrl },
    { rel: "alternate", hrefLang: "x-default", href: enUrl },
  ];
}
