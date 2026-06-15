import React from 'react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { generateSEO, generateHreflangLinks } from '../../../backend/lib/seo';
import { blogPosts } from '../../../frontend/data/blogs';
import { Navbar } from '../../../frontend/features/core/Navbar';
import { FooterSection as Footer } from '../../../frontend/features/core/Footer';
import { translations } from '../../../frontend/features/core/i18n';
import { Calendar, ChevronRight } from 'lucide-react';

export const Route = createFileRoute('/blog/tag/$tagSlug')({
  loader: ({ params }) => {
    const decodedSlug = params.tagSlug.replace(/-/g, ' ').toLowerCase();
    
    // Find matching posts where any tag matches the decoded slug
    const posts = blogPosts.filter(p => p.tags.some(t => t.toLowerCase() === decodedSlug));
    
    if (posts.length === 0) throw notFound();
    
    // Find exact original casing if possible
    const originalTag = posts[0].tags.find(t => t.toLowerCase() === decodedSlug) || decodedSlug;
    
    return { 
      posts, 
      tagName: originalTag 
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { tagName } = loaderData;
    
    return {
      meta: generateSEO({
        title: `Articles tagged with "${tagName}" | Shailraj Travels Blog`,
        description: `Explore our collection of articles tagged with ${tagName}. Discover travel tips, itineraries, and spiritual insights.`,
        canonicalUrl: `https://www.shailrajtravels.com/blog/tag/${tagName.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'website'
      }),
      links: [
        { rel: 'canonical', href: `https://www.shailrajtravels.com/blog/tag/${tagName.toLowerCase().replace(/\s+/g, '-')}` },
        ...generateHreflangLinks(`https://www.shailrajtravels.com/blog/tag/${tagName.toLowerCase().replace(/\s+/g, '-')}`)
      ]
    };
  },
  component: BlogTagPage,
});

function BlogTagPage() {
  const { posts, tagName } = Route.useLoaderData();
  const lang = 'en';
  const t = translations[lang];

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen selection:bg-brand-green/20 selection:text-brand-blue-deep flex flex-col">
      <Navbar t={t} />
      
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-16 animate-reveal">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6">
            <Link to="/" className="hover:text-brand-blue transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/blog" className="hover:text-brand-blue transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-400">Tag</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-blue-deep mb-6">
            #{tagName}
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Browsing all articles tagged with {tagName}.
          </p>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
              <article 
                key={post.slug} 
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group animate-reveal"
                style={{ animationDelay: ((idx % 3) * 100) + 'ms' }}
              >
              <Link to="/blog/$slug" params={{ slug: post.slug }} className="flex-1 flex flex-col">
                <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                  {post.featuredImage ? (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-blue/10 flex items-center justify-center">
                      <span className="text-brand-blue/30 font-bold text-sm">Shailraj Travels</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-brand-blue-deep text-xs font-bold rounded-full shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-brand-blue-deep mb-3 group-hover:text-brand-blue transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-6 flex-1 line-clamp-3 text-sm md:text-base">
                    {post.excerpt}
                  </p>
                  
                  <div className="pt-5 border-t border-slate-100 mt-auto flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-brand-blue">
                      Read More <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </main>
      
      <Footer t={t} />
    </div>
  );
}
