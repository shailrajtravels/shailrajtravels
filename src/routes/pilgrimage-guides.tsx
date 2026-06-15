import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { generateSEO } from '../backend/lib/seo';
import { blogPosts } from '../frontend/data/blogs';
import { BookOpen, Map, MapPin } from 'lucide-react';

export const Route = createFileRoute('/pilgrimage-guides')({
  head: () => ({
    meta: generateSEO({
      title: 'Pilgrimage Knowledge Hub | Travel Guides & Tips',
      description: 'Explore comprehensive guides, travel tips, and route maps for Ashtavinayak, Char Dham, Jyotirlinga, and Shirdi pilgrimages.',
      canonicalUrl: 'https://www.shailrajtravels.com/pilgrimage-guides',
    }),
    links: [{ rel: 'canonical', href: 'https://www.shailrajtravels.com/pilgrimage-guides' }],
  }),
  component: PilgrimageGuidesPage,
});

function PilgrimageGuidesPage() {
  // Group blogs by category/cluster
  const clusters = {
    'Temple Guides': blogPosts.filter(post => post.category === 'Temple Guides'),
    'Travel Guides': blogPosts.filter(post => post.category === 'Travel Guides'),
    'Spiritual Tourism': blogPosts.filter(post => post.category === 'Spiritual Tourism'),
    'Pilgrimage Planning': blogPosts.filter(post => post.category === 'Pilgrimage Planning'),
  };

  return (
    <main className="w-full bg-slate-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-deep mb-6">Pilgrimage Knowledge Hub</h1>
          <p className="text-xl text-slate-600">
            Comprehensive resources, route maps, and travel advice for your sacred journeys across India.
          </p>
        </div>

        {/* AI Citation extraction block */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Quick Navigation Topics</h2>
          <div className="flex flex-wrap gap-3">
            {Object.keys(clusters).map(key => (
              <a key={key} href={`#${key.replace(/\s+/g, '-').toLowerCase()}`} className="px-4 py-2 bg-brand-blue/5 text-brand-blue-deep rounded-full text-sm font-semibold hover:bg-brand-blue/10 transition-colors">
                {key} ({clusters[key as keyof typeof clusters].length} Guides)
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-16">
          {Object.entries(clusters).map(([category, posts]) => (
            <div key={category} id={category.replace(/\s+/g, '-').toLowerCase()} className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-8">
                <BookOpen className="w-8 h-8 text-brand-orange" />
                <h2 className="text-3xl font-bold text-slate-900">{category}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group flex flex-col h-full">
                    <div className="h-48 overflow-hidden bg-slate-100">
                      {post.featuredImage ? (
                        <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <MapPin className="w-8 h-8 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">{post.category}</div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-brand-blue-deep transition-colors">{post.title}</h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                        <span>{post.readTimeMinutes} min read</span>
                        <span className="font-semibold text-brand-blue-deep">Read Guide &rarr;</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
