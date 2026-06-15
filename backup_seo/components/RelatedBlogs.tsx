import React from 'react';
import { RelatedItem } from '../types/tour';

export function RelatedBlogs({ blogs }: { blogs: RelatedItem[] }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="text-2xl font-bold text-brand-blue-deep mb-6">Helpful Guides & Travel Tips</h3>
      <div className="flex flex-col space-y-4">
        {blogs.map((blog) => (
          <a key={blog.slug} href={`/blog/${blog.slug}`} className="group flex items-start">
            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden shrink-0 mr-4">
               {blog.image ? (
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-brand-blue-deep/10" />
                )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-brand-orange transition-colors leading-tight">{blog.title}</h4>
              <p className="text-sm text-brand-orange mt-1 group-hover:underline">Read Article &rarr;</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
