// @ts-nocheck
import React from 'react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import {  generateSEO, SchemaMarkup  } from '../../backend/lib/seo';
import { authors } from '../../frontend/data/authors';
import { blogPosts } from '../../frontend/data/blogs';
import { BookOpen, MapPin, Award } from 'lucide-react';

export const Route = createFileRoute('/author/$authorSlug')({
  loader: ({ params }) => {
    const author = authors[params.authorSlug];
    if (!author) throw notFound();
    return author;
  },
  head: ({ loaderData }) => ({
    meta: generateSEO({
      title: `${loaderData.name} - ${loaderData.role} | Shailraj Travels`,
      description: `Read articles and travel guides by ${loaderData.name}, ${loaderData.role} at Shailraj Travels.`,
      canonicalUrl: `https://www.shailrajtravels.com/author/${loaderData.id}`,
    }),
    links: [{ rel: 'canonical', href: `https://www.shailrajtravels.com/author/${loaderData.id}` }],
  }),
  component: AuthorProfilePage,
});

function AuthorProfilePage() {
  const author = Route.useLoaderData();
  const authorArticles = blogPosts.filter(post => post.authorId === author.id);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "jobTitle": author.role,
    "worksFor": {
      "@type": "Organization",
      "name": "Shailraj Travels"
    },
    "description": author.bio,
    "knowsAbout": author.expertiseAreas,
    "url": `https://www.shailrajtravels.com/author/${author.id}`,
    "sameAs": author.socialLinks ? Object.values(author.socialLinks) : []
  };

  return (
    <main className="w-full bg-slate-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <SchemaMarkup schema={personSchema} />
      
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center md:items-start">
          <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg shrink-0">
            <img 
              src={author.avatarUrl} 
              alt={author.name} 
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDIxdi0yYTRgNCAwIDAgMC00LTRoLThhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+' }}
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-brand-blue-deep mb-2">{author.name}</h1>
            <div className="text-brand-orange font-bold text-lg uppercase tracking-wider mb-6">{author.role}</div>
            
            <p className="text-slate-700 text-lg leading-relaxed mb-8">
              {author.bio}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {author.expertiseAreas && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Award className="w-4 h-4 text-brand-orange"/> Core Expertise</div>
                  <ul className="text-slate-600 list-disc pl-5 space-y-1">
                    {author.expertiseAreas.map((exp, idx) => <li key={idx}>{exp}</li>)}
                  </ul>
                </div>
              )}
              {author.regionsCovered && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-orange"/> Regions Covered</div>
                  <ul className="text-slate-600 list-disc pl-5 space-y-1">
                    {author.regionsCovered.map((reg, idx) => <li key={idx}>{reg}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Authored Articles */}
        {authorArticles.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-8 h-8 text-brand-orange" />
              <h2 className="text-3xl font-bold text-slate-900">Articles by {author.name}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authorArticles.map(post => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all group flex flex-col h-full">
                  <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">{post.category}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-brand-blue-deep transition-colors">{post.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-auto pt-4 border-t border-slate-100 text-sm font-semibold text-brand-blue-deep">
                    Read Article &rarr;
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

