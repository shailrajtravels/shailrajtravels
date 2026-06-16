import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { createTourFn, updateTourFn, deleteTourFn } from '../../../backend/lib/tours';

export function ToursAdmin({ token, tours, loadData, setDeleteConfirm }: any) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tour: any) => {
    setEditingItem(tour);
    setIsFormOpen(true);
  };

  if (isFormOpen) {
    return (
      <TourForm 
        token={token} 
        initialData={editingItem} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={() => {
          setIsFormOpen(false);
          loadData();
        }} 
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal">
      <div className="flex justify-between items-center p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold font-display text-brand-blue-deep">Manage Popular Tours</h2>
        <button 
          onClick={handleAddNew}
          className="bg-brand-blue-deep hover:bg-brand-blue text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-brand-blue/20"
        >
          <Plus className="w-5 h-5 shrink-0" />
          <span>Add Tour</span>
        </button>
      </div>

      {tours.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <p className="text-lg font-medium">No tours found.</p>
          <p className="text-sm mt-1">Click "Add Tour" to create your first tour.</p>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] uppercase tracking-wider font-bold px-6 py-4">
            <div className="col-span-4">Tour Title & Slug</div>
            <div className="col-span-3">Packages</div>
            <div className="col-span-3">Destinations</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="flex flex-col divide-y divide-slate-100">
            {tours.map((tour: any) => (
              <div key={tour._id} className="flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-slate-50/50 transition-colors p-4 md:px-6 md:py-4">
                <div className="md:col-span-4">
                  <p className="font-bold text-brand-blue-deep text-base truncate">{tour.title}</p>
                  <p className="text-sm text-brand-green font-medium mt-0.5 truncate">/{tour.slug}</p>
                </div>
                <div className="md:col-span-3 text-sm text-slate-500">
                  {tour.packages?.length || 0} packages
                </div>
                <div className="md:col-span-3 text-sm text-slate-500 truncate">
                  {tour.destinations?.join(', ') || 'None'}
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-4 md:mt-0">
                  <button onClick={() => handleEdit(tour)} className="p-2 text-slate-400 hover:text-brand-blue bg-white rounded-lg border border-slate-200 shadow-sm transition-colors" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm({ isOpen: true, id: tour._id, type: 'tour' })} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TourForm({ token, initialData, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(initialData || {
    slug: '',
    title: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    heroContent: { image: '', description: '' },
    overview: '',
    highlights: [],
    destinations: [],
    packages: [],
    faq: [],
    relatedTours: [],
    relatedBlogs: []
  });

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  const [datesInput, setDatesInput] = useState(
    Array.isArray(initialData?.dates) ? initialData.dates.join(', ') : ''
  );
  const [highlightsInput, setHighlightsInput] = useState(
    Array.isArray(initialData?.highlights) ? initialData.highlights.join(', ') : ''
  );
  const [destinationsInput, setDestinationsInput] = useState(
    Array.isArray(initialData?.destinations) ? initialData.destinations.join(', ') : ''
  );

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleHeroChange = (e: any) => {
    setFormData({ ...formData, heroContent: { ...formData.heroContent, [e.target.name]: e.target.value } });
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ 
        ...formData, 
        heroContent: { ...formData.heroContent, image: reader.result as string } 
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      dates: datesInput.split(',').map((s: string) => s.trim()).filter(Boolean),
      highlights: highlightsInput.split(',').map((s: string) => s.trim()).filter(Boolean),
      destinations: destinationsInput.split(',').map((s: string) => s.trim()).filter(Boolean)
    };
    
    try {
      if (initialData?._id) {
        await updateTourFn({ data: { adminToken: token, id: initialData._id, data: payload } });
      } else {
        await createTourFn({ data: { adminToken: token, data: payload } });
      }
      onSuccess();
    } catch (e) {
      alert("Failed to save tour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onClose} type="button" className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold font-display text-brand-blue-deep">
          {initialData ? "Edit Tour" : "Create New Tour"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Tour Title" name="title" value={formData.title} onChange={handleChange} required />
          <Input label="Slug (URL)" name="slug" value={formData.slug} onChange={handleChange} required placeholder="e.g. ashtavinayak-yatra" />
          
          <div className="md:col-span-2"><hr className="border-slate-100 my-2" /></div>
          <h3 className="md:col-span-2 font-bold text-brand-blue-deep">SEO Details</h3>
          
          <Input label="Meta Title" name="metaTitle" value={formData.metaTitle} onChange={handleChange} />
          <Input label="Meta Description" name="metaDescription" value={formData.metaDescription} onChange={handleChange} />
          <Input label="Canonical URL" name="canonicalUrl" value={formData.canonicalUrl} onChange={handleChange} />
          
          <div className="md:col-span-2"><hr className="border-slate-100 my-2" /></div>
          <h3 className="md:col-span-2 font-bold text-brand-blue-deep">Hero Content</h3>
          
          <div className="md:col-span-2">
            <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-2">Hero Image</label>
            {formData.heroContent.image && (
              <img src={formData.heroContent.image} className="h-32 object-contain bg-slate-100 rounded mb-4" alt="Hero Preview" />
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
          </div>
          
          <div className="md:col-span-2">
            <Input label="Hero Description" name="description" value={formData.heroContent.description} onChange={handleHeroChange} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-2">Overview (HTML allowed)</label>
            <textarea 
              name="overview"
              value={formData.overview}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[100px]"
            />
          </div>
          
          <div className="md:col-span-2"><hr className="border-slate-100 my-2" /></div>
          
          <div className="md:col-span-2">
            <Input label="Highlights (comma separated)" value={highlightsInput} onChange={(e: any) => setHighlightsInput(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Input label="Destinations (comma separated)" value={destinationsInput} onChange={(e: any) => setDestinationsInput(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Input label="Available Dates (comma separated, e.g. 2026-07-15, 2026-08-20)" value={datesInput} onChange={(e: any) => setDatesInput(e.target.value)} />
          </div>

          <div className="md:col-span-2 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-200">
            <strong>Note:</strong> Packages and FAQs are complex data structures. To edit them fully, you will need to update them directly in the database for now. In a future update, a full drag-and-drop editor for packages can be added here.
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-brand-green/20">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Save Tour
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">{label}</label>
      <input 
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] font-medium text-brand-blue-deep placeholder-slate-400 focus:ring-2 focus:ring-brand-green focus:border-brand-green focus:bg-white transition-all outline-none" 
        {...props} 
      />
    </div>
  );
}
