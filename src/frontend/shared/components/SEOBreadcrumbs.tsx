import React from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';
import { SchemaMarkup } from '@/frontend/shared/components/SchemaMarkup';
import { generateBreadcrumbSchema } from '@/backend/shared/schema-generators';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function SEOBreadcrumbs({ items }: SEOBreadcrumbsProps) {
  const allItems = [{ name: "Home", url: "/" }, ...items];

  // Provide full absolute URLs for the schema
  const schemaItems = allItems.map((item) => ({
    name: item.name,
    url:
      item.url === "/"
        ? "https://www.shailrajtravels.com/"
        : `https://www.shailrajtravels.com${item.url}`,
  }));

  return (
    <nav aria-label="Breadcrumb" className="my-6">
      <SchemaMarkup schema={generateBreadcrumbSchema(schemaItems)} />
      <ol className="flex flex-wrap items-center space-x-2 text-sm text-gray-600">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          return (
            <li key={index} className="flex items-center">
              {index === 0 ? (
                <Link
                  to={item.url}
                  className="hover:text-brand-orange transition-colors flex items-center"
                >
                  <Home className="w-4 h-4 mr-1" />
                  <span className="sr-only">Home</span>
                </Link>
              ) : (
                <Link
                  to={item.url}
                  className={`transition-colors ${isLast ? "text-gray-900 font-semibold" : "hover:text-brand-orange"}`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.name}
                </Link>
              )}
              {!isLast && <ChevronRight className="w-4 h-4 mx-2 text-gray-400 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
