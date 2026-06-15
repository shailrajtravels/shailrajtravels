import React from 'react';
import { Author } from '../types/author';

interface AuthorProfileProps {
  author: Author;
  reviewer?: Author;
  lastReviewedAt?: string;
  publishedAt?: string;
}

export const AuthorProfile: React.FC<AuthorProfileProps> = ({ author, reviewer, lastReviewedAt, publishedAt }) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100 my-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <img 
          src={author.avatarUrl} 
          alt={author.name} 
          className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white"
        />
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{author.name}</h3>
              <p className="text-brand-orange font-medium">{author.role}</p>
            </div>
            {(author.socialLinks?.linkedin || author.socialLinks?.twitter) && (
              <div className="flex gap-3">
                {author.socialLinks.linkedin && (
                  <a href={author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
          
          <p className="text-slate-600 leading-relaxed mb-4">{author.bio}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl shadow-sm border border-slate-50">
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Expertise:</span>
              <span className="text-slate-600">{author.expertiseAreas.join(', ')}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Experience:</span>
              <span className="text-slate-600">{author.yearsOfExperience}+ Years</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Languages:</span>
              <span className="text-slate-600">{author.languages.join(', ')}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Regions:</span>
              <span className="text-slate-600">{author.regionsCovered.slice(0, 3).join(', ')}</span>
            </div>
          </div>
          
          {/* Reviewer Meta Layer */}
          {(reviewer || publishedAt) && (
            <div className="mt-6 pt-4 border-t border-slate-200 text-sm flex flex-col sm:flex-row sm:items-center gap-4 text-slate-500">
              {publishedAt && (
                <div>
                  <span className="font-semibold text-slate-600">Published: </span>
                  {new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              )}
              {reviewer && lastReviewedAt && (
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></div>
                  <div>
                    <span className="font-semibold text-slate-600">Reviewed By: </span>
                    <a href={reviewer.contactProfileUrl} className="text-brand-blue-deep hover:underline font-medium">
                      {reviewer.name}
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 ml-2">On: </span>
                    {new Date(lastReviewedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
