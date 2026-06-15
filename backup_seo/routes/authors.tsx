import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { generateSEO } from '../lib/seo';
import { authors } from '../data/authors';

export const Route = createFileRoute('/authors')({
  head: () => ({
    meta: generateSEO({
      title: 'Our Travel Experts & Authors | Shailraj Travels',
      description: 'Meet the expert pilgrimage guides, itinerary planners, and authors behind Shailraj Travels.',
      canonicalUrl: 'https://www.shailrajtravels.com/authors',
    }),
    links: [{ rel: 'canonical', href: 'https://www.shailrajtravels.com/authors' }],
  }),
  component: AuthorsIndexPage,
});

function AuthorsIndexPage() {
  return (
    <main className="w-full bg-slate-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-deep mb-4">Our Travel Experts</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our content is written and fact-checked by veteran tour guides and pilgrimage planners with decades of on-ground experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.values(authors).map(author => (
            <div key={author.id} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-slate-50">
                <img 
                  src={author.avatarUrl} 
                  alt={author.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDIxdi0yYTRgNCAwIDAgMC00LTRoLThhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+' }}
                />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{author.name}</h2>
              <div className="text-brand-orange font-bold text-sm uppercase tracking-wider mb-4">{author.role}</div>
              <p className="text-slate-600 mb-6 line-clamp-3">{author.bio}</p>
              
              <div className="mt-auto pt-6 border-t border-slate-100 w-full flex justify-between items-center">
                <div className="text-sm font-semibold text-slate-500">{author.yearsOfExperience} Years Experience</div>
                <Link to={`/author/${author.id}`} className="text-brand-blue-deep font-bold hover:text-brand-orange transition-colors">
                  View Full Profile &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
