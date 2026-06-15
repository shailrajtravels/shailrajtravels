import React, { useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { generateSEO, generateHreflangLinks } from '../../lib/seo';
import { blogPosts, blogAuthors } from '../../data/blogs';
import { Navbar } from '../../features/core/Navbar';
import { FooterSection as Footer } from '../../features/core/Footer';
import { translations } from '../../features/core/i18n';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { generateBreadcrumbSchema } from '../../lib/blog-schema';

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: generateSEO({
      title: 'Spiritual Travel Blog & Pilgrimage Guides | Shailraj Travels',
      description: 'Discover comprehensive guides on Ashtavinayak Yatra, Jyotirlinga Darshan, Chardham Yatra, and more. Read expert spiritual travel advice from Shailraj Travels.',
      canonicalUrl: 'https://www.shailrajtravels.com/blog',
      type: 'website'
    }),
    links: [
      { rel: 'canonical', href: 'https://www.shailrajtravels.com/blog' },
      ...generateHreflangLinks('https://www.shailrajtravels.com/blog')
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' }
        ]))
      }
    ]
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const lang = 'en';
  const t = translations[lang];

  // Get categories and count
  const categories = useMemo(() => {
    const cats = blogPosts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, []);

  const featuredPost = blogPosts[0];
  const recentPosts = blogPosts.slice(1);

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen selection:bg-brand-green/20 selection:text-brand-blue-deep flex flex-col">
      <Navbar t={t} />
      
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-16 animate-reveal">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-green/10 text-brand-green-dark font-bold text-sm mb-4">
            Our Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-blue-deep mb-6">
            Spiritual Travel Guides & Insights
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Comprehensive guides, itineraries, and spiritual knowledge to help you plan the perfect Darshan.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-3 justify-center mb-16">
          <Link to="/blog" className="px-5 py-2.5 rounded-full bg-brand-blue-deep text-white font-semibold text-sm transition-transform hover:scale-105 shadow-md">
            All Articles
          </Link>
          {categories.map(([cat, count]) => (
            <Link 
              key={cat}
              to={`/blog/category/$categorySlug`}
              params={{ categorySlug: cat.toLowerCase().replace(/\s+/g, '-') }}
              className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium text-sm transition-all hover:border-brand-blue hover:text-brand-blue shadow-sm hover:shadow-md"
            >
              {cat} <span className="text-slate-400 text-xs ml-1">({count})</span>
            </Link>
          ))}
        </div>

        {blogPosts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm animate-reveal">
            <h3 className="text-xl font-bold text-slate-400">Articles are being published soon.</h3>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-16 animate-reveal">
                <Link to="/blog/$slug" params={{ slug: featuredPost.slug }} className="group block bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/2 aspect-[4/3] lg:aspect-auto relative overflow-hidden bg-slate-100">
                      {featuredPost.featuredImage ? (
                        <img 
                          src={featuredPost.featuredImage} 
                          alt={featuredPost.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="eager"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-blue/10 flex items-center justify-center">
                          <span className="text-brand-blue/30 font-bold text-xl">Shailraj Travels</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-brand-blue-deep text-xs font-bold rounded-full shadow-sm">
                          {featuredPost.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                      <h2 className="text-2xl md:text-3xl font-bold text-brand-blue-deep mb-4 group-hover:text-brand-blue transition-colors line-clamp-3">
                        {featuredPost.title}
                      </h2>
                      <p className="text-slate-600 mb-8 text-lg line-clamp-4">
                        {featuredPost.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-500 mt-auto pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-brand-green" />
                          <span className="font-medium text-slate-700">
                            {blogAuthors[featuredPost.authorId]?.name || 'Editorial Team'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-brand-green" />
                          <span>{new Date(featuredPost.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-brand-green" />
                          <span>{featuredPost.readingTimeMinutes} min read</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Post Grid */}
            {recentPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentPosts.map((post, idx) => (
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
            )}
          </>
        )}
      </main>
      
      <Footer t={t} />
    </div>
  );
}
