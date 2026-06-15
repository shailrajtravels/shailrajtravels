// @ts-nocheck
import React from 'react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { generateSEO, generateHreflangLinks } from '../../../backend/lib/seo';
import { blogPosts, blogAuthors } from '../../../frontend/data/blogs';
import { Navbar } from '../../../frontend/features/core/Navbar';
import { FooterSection as Footer } from '../../../frontend/features/core/Footer';
import { translations } from '../../../frontend/features/core/i18n';
import { Calendar, ChevronRight, User } from 'lucide-react';

export const Route = createFileRoute('/blog/author/$authorSlug')({
  loader: ({ params }) => {
    const author = blogAuthors[params.authorSlug];
    if (!author) throw notFound();
    
    const posts = blogPosts.filter(p => p.authorId === params.authorSlug);
    
    return { author, posts };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { author } = loaderData;
    
    return {
      meta: generateSEO({
        title: `${author.name} | Shailraj Travels Blog`,
        description: `Read articles and guides written by ${author.name} on the Shailraj Travels Blog.`,
        canonicalUrl: `https://www.shailrajtravels.com/blog/author/${author.id}`,
        type: 'profile'
      }),
      links: [
        { rel: 'canonical', href: `https://www.shailrajtravels.com/blog/author/${author.id}` },
        ...generateHreflangLinks(`https://www.shailrajtravels.com/blog/author/${author.id}`)
      ]
    };
  },
  component: BlogAuthorPage,
});

function BlogAuthorPage() {
  const { author, posts } = Route.useLoaderData();
  const lang = 'en';
  const t = translations[lang];

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen selection:bg-brand-green/20 selection:text-brand-blue-deep flex flex-col">
      <Navbar t={t} />
      
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Author Header */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm mb-16 animate-reveal flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          {author.avatarUrl ? (
            <img src={author.avatarUrl} alt={author.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-50 shadow-md flex-shrink-0" />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-brand-blue/10 flex items-center justify-center border-4 border-slate-50 shadow-md flex-shrink-0">
              <User className="w-16 h-16 text-brand-blue" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-500 mb-4">
              <Link to="/" className="hover:text-brand-blue transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/blog" className="hover:text-brand-blue transition-colors">Blog</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-400">Author</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-blue-deep mb-2">
              {author.name}
            </h1>
            <p className="text-brand-green font-bold mb-6">{author.role}</p>
            <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
              {author.bio}
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-12 border-b border-slate-200 pb-4 animate-reveal">
          <h2 className="text-2xl font-bold text-brand-blue-deep">
            Articles by {author.name}
          </h2>
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

