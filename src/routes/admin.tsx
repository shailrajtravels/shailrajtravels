import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { verifyAdminFn } from '../backend/lib/auth';
import { getPackagesFn, createPackageFn, updatePackageFn, deletePackageFn } from '../backend/lib/packages';
import { getReviewsFn, deleteReviewFn } from '../backend/lib/reviews';
import { getTripOptionsFn, createTripOptionFn, updateTripOptionFn, deleteTripOptionFn, getBookingsFn, deleteBookingFn, updateBookingStatusFn } from '../backend/lib/bookings';
import { getGalleryPhotosFn, addGalleryPhotoFn, deleteGalleryPhotoFn } from '../backend/lib/gallery';
import { getAuditLogsFn } from '../backend/lib/audit';
import { getToursFn, deleteTourFn } from '../backend/lib/tours';
import { ToursAdmin } from '../frontend/features/admin/ToursAdmin';
import * as XLSX from 'xlsx-js-style';
import { LayoutDashboard, Package, LogOut, Plus, Trash2, Edit, Loader2, Search, ArrowLeft, Image as ImageIcon, MessageSquare, Menu, X, Map, CalendarCheck, MoreVertical, Clock, Users, Eye, FileSpreadsheet, Download, Activity, Printer, MapPin, Lock, BadgeIndianRupee } from 'lucide-react';
import logo from '@/frontend/assets/logo11.png';
import { Calendar } from '@/frontend/components/ui/calendar';
import { format } from 'date-fns';

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        throw redirect({ to: '/login' });
      }
    }
  },
  component: AdminPage,
  errorComponent: ({ error }) => (
    <div className="p-8 bg-white text-red-600 font-mono text-sm max-w-full overflow-auto h-screen">
      <h1 className="text-2xl font-bold mb-4">React Error Details</h1>
      <p className="font-bold mb-2">Message: {error?.message}</p>
      <pre className="bg-slate-100 p-4 rounded">{error?.stack}</pre>
    </div>
  ),
});

function AdminPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [tripOptions, setTripOptions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // Shared for editing
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'packages' | 'tours' | 'reviews' | 'trips' | 'bookings' | 'gallery' | 'customers' | 'reports' | 'invoices' | 'audit' | 'revenue'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; type: 'package' | 'review' | 'photo' | 'trip' | 'booking' | 'tour' } | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem('adminToken');
    if (!t) {
      navigate({ to: '/login' });
      return;
    }
    
    // Verify token
    verifyAdminFn({ data: { token: t } }).then(res => {
      if (res?.success) {
        setToken(t);
        loadData(t);
      } else {
        sessionStorage.removeItem('adminToken');
        navigate({ to: '/login' });
      }
    }).catch(() => {
      sessionStorage.removeItem('adminToken');
      navigate({ to: '/login' });
    });
  }, [navigate]);

  const loadData = async (activeToken?: string) => {
    const tkn = activeToken || token;
    setLoading(true);
    setErrorMsg(null);
    try {
      // Fetch individually so one failure doesn't break the whole dashboard
      const pkgsPromise = getPackagesFn().catch(e => { console.error('Packages error:', e); return []; });
      const revsPromise = getReviewsFn().catch(e => { console.error('Reviews error:', e); return []; });
      const tripsPromise = getTripOptionsFn().catch(e => { console.error('Trips error:', e); return []; });
      const bksPromise = tkn ? getBookingsFn({ data: { adminToken: tkn } }).catch(e => { console.error('Bookings error:', e); return []; }) : Promise.resolve([]);
      const photosPromise = getGalleryPhotosFn().catch(e => { console.error('Photos error:', e); return []; });
      const auditPromise = tkn ? getAuditLogsFn({ data: { adminToken: tkn } }).catch(e => { console.error('Audit error:', e); return []; }) : Promise.resolve([]);
      const toursPromise = getToursFn().catch(e => { console.error('Tours error:', e); return []; });

      const [pkgs, revs, trips, bks, photos, logs, trs] = await Promise.all([
        pkgsPromise, revsPromise, tripsPromise, bksPromise, photosPromise, auditPromise, toursPromise
      ]);

      setPackages(pkgs);
      setReviews(revs);
      setTripOptions(trips);
      
      let sortedBks = [...(bks || [])].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      sortedBks = sortedBks.map((bk, idx) => {
        const index = idx + 1;
        const letter = String.fromCharCode(65 + ((index - 1) % 26));
        const prefix = letter + letter;
        const padded = String(index).padStart(5, '0');
        return { ...bk, generatedBookingId: `${prefix}${padded}` };
      });
      sortedBks.reverse();
      setBookings(sortedBks);
      
      setGalleryPhotos(photos);
      setAuditLogs(logs);
      setTours(trs);
    } catch (e: any) {
      console.error('loadData fatal error:', e);
      setErrorMsg(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    navigate({ to: '/login' });
  };

  const handleDeletePackage = (id: string) => {
    setDeleteConfirm({ isOpen: true, id, type: 'package' });
  };

  const handleDeleteReview = (id: string) => {
    setDeleteConfirm({ isOpen: true, id, type: 'review' });
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeletePhoto = (id: string) => {
    setDeleteConfirm({ isOpen: true, id, type: 'photo' });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm || !token) return;
    try {
      if (deleteConfirm.type === 'package') await deletePackageFn({ data: { adminToken: token, id: deleteConfirm.id } });
      else if (deleteConfirm.type === 'review') await deleteReviewFn({ data: { adminToken: token, id: deleteConfirm.id } });
      else if (deleteConfirm.type === 'photo') await deleteGalleryPhotoFn({ data: { adminToken: token, id: deleteConfirm.id } });
      else if (deleteConfirm.type === 'trip') await deleteTripOptionFn({ data: { adminToken: token, id: deleteConfirm.id } });
      else if (deleteConfirm.type === 'booking') await deleteBookingFn({ data: { adminToken: token, id: deleteConfirm.id } });
      else if (deleteConfirm.type === 'tour') await deleteTourFn({ data: { adminToken: token, id: deleteConfirm.id } });
      
      loadData();
    } catch (e) {
      alert(`Failed to delete ${deleteConfirm.type}.`);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  if (!token) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center">
            <img src={logo} alt="Shailraj" className="h-16 mr-3 object-contain" />
            <span className="font-display font-bold text-xl text-brand-blue-deep tracking-tight">Admin</span>
          </div>
          <button className="md:hidden p-2 text-slate-400 hover:text-slate-700" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 py-6 px-4 flex flex-col gap-2">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('packages'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'packages' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <Package className="w-5 h-5" />
            Packages
          </button>
          <button 
            onClick={() => { setActiveTab('tours'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'tours' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <MapPin className="w-5 h-5" />
            Popular Tours
          </button>
          <button 
            onClick={() => { setActiveTab('reviews'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'reviews' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <MessageSquare className="w-5 h-5" />
            Reviews
          </button>
          <button 
            onClick={() => { setActiveTab('trips'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'trips' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <Map className="w-5 h-5" />
            Trip Options
          </button>
          <button 
            onClick={() => { setActiveTab('bookings'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'bookings' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <CalendarCheck className="w-5 h-5" />
            Bookings
          </button>
          <button 
            onClick={() => { setActiveTab('invoices'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'invoices' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <Printer className="w-5 h-5" />
            Invoices
          </button>
          <button 
            onClick={() => { setActiveTab('revenue'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'revenue' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <BadgeIndianRupee className="w-5 h-5" />
            Revenue
          </button>
          <button 
            onClick={() => { setActiveTab('gallery'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'gallery' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <ImageIcon className="w-5 h-5" />
            Gallery
          </button>
          <button 
            onClick={() => { setActiveTab('customers'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'customers' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <Users className="w-5 h-5" />
            Customers
          </button>
          <button 
            onClick={() => { setActiveTab('reports'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'reports' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            Reports
          </button>
          <button 
            onClick={() => { setActiveTab('audit'); setIsFormOpen(false); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'audit' ? 'bg-brand-blue-deep text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep'}`}
          >
            <Activity className="w-5 h-5" />
            Audit Logs
          </button>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <button className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-display text-brand-blue-deep truncate">
              {activeTab === 'dashboard' ? 'Overview' :
               activeTab === 'packages' ? 'Packages Management' : 
               activeTab === 'tours' ? 'Popular Tours Management' :
               activeTab === 'reviews' ? 'Reviews Management' :
               activeTab === 'trips' ? 'Trip Options' : 
               activeTab === 'gallery' ? 'Gallery Management' : 
               activeTab === 'customers' ? 'Customers' : 
               activeTab === 'reports' ? 'Reports & Exports' : 
               activeTab === 'invoices' ? 'Generated Invoices' : 
               activeTab === 'audit' ? 'Audit Logs' : 'Booking Management'}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {(activeTab === 'packages' || activeTab === 'trips' || activeTab === 'gallery') && (
              <button 
                onClick={handleAddNew}
                className="bg-brand-blue-deep hover:bg-brand-blue text-white px-3 py-2 md:px-5 md:py-2.5 rounded-xl font-bold flex items-center gap-1 md:gap-2 transition-colors shadow-lg shadow-brand-blue/20 text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span className="hidden sm:inline">Add {activeTab === 'packages' ? 'Package' : activeTab === 'gallery' ? 'Photo' : 'Trip'}</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </header>

        {errorMsg && (
          <div className="m-8 p-4 bg-red-50 text-red-600 rounded-xl font-bold border border-red-200">
            Error loading data: {errorMsg}
          </div>
        )}

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 print:p-0 relative bg-slate-50/50">
          
          {activeTab === 'dashboard' ? (
            <DashboardOverview packages={packages} bookings={bookings} reviews={reviews} photos={galleryPhotos} />
          ) : activeTab === 'audit' ? (
            <AuditLogsPanel logs={auditLogs} />
          ) : activeTab === 'tours' ? (
            <ToursAdmin 
              token={token}
              tours={tours}
              loadData={loadData}
              setDeleteConfirm={setDeleteConfirm}
            />
          ) : activeTab === 'packages' ? (
            isFormOpen ? (
              <PackageForm 
                token={token} 
                initialData={editingItem} 
                onClose={() => setIsFormOpen(false)} 
                onSuccess={() => {
                  setIsFormOpen(false);
                  loadData();
                }} 
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal">
                {loading ? (
                  <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>
                ) : packages.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No packages found.</p>
                    <p className="text-sm mt-1">Click "Add Package" to create your first package.</p>
                  </div>
                ) : (
                  <div className="flex flex-col w-full">
                    <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] uppercase tracking-wider font-bold px-6 py-4">
                      <div className="col-span-1">Image</div>
                      <div className="col-span-5">Package Details</div>
                      <div className="col-span-2">Price</div>
                      <div className="col-span-2">Schedule</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    <div className="flex flex-col divide-y divide-slate-100">
                      {packages.map(pkg => (
                        <div key={pkg._id} className="flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-slate-50/50 transition-colors p-4 md:px-6 md:py-4">
                          <div className="flex items-center gap-4 md:col-span-6">
                            <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                              {pkg.image ? (
                                <img src={pkg.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-8 h-8 m-4 text-slate-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-brand-blue-deep text-base truncate">{pkg.title}</p>
                              <p className="text-sm text-brand-green font-medium mt-0.5 truncate">{pkg.durationBadge} • {pkg.location}</p>
                              <p className="md:hidden font-bold text-slate-700 mt-1">{pkg.price}</p>
                            </div>
                            <div className="md:hidden flex shrink-0">
                              <button onClick={() => handleEdit(pkg)} className="p-2 text-slate-400 hover:text-brand-blue transition-colors" title="Edit">
                                <Edit className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDeletePackage(pkg._id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="hidden md:block col-span-2 font-bold text-slate-700">{pkg.price}</div>
                          <div className="hidden md:block col-span-2 text-sm text-slate-500">{pkg.schedule}</div>
                          <div className="hidden md:flex col-span-2 justify-end gap-2">
                            <button onClick={() => handleEdit(pkg)} className="p-2 text-slate-400 hover:text-brand-blue bg-white rounded-lg border border-slate-200 shadow-sm transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeletePackage(pkg._id)} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : activeTab === 'reviews' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal">
              {loading ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>
              ) : reviews.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No reviews found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                        <th className="px-6 py-4">Reviewer</th>
                        <th className="px-6 py-4">Rating</th>
                        <th className="px-6 py-4 max-w-md">Review Text</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(rev => (
                        <tr key={rev._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-brand-blue-deep">{rev.name}</td>
                          <td className="px-6 py-4 font-bold text-yellow-500">{rev.rating} ★</td>
                          <td className="px-6 py-4 max-w-md truncate text-sm text-slate-600" title={rev.textEn}>{rev.textEn}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(rev.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteReview(rev._id)} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'trips' ? (
            isFormOpen ? (
              <TripOptionForm 
                token={token} 
                initialData={editingItem} 
                onClose={() => setIsFormOpen(false)} 
                onSuccess={() => {
                  setIsFormOpen(false);
                  loadData();
                }} 
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal">
                {loading ? (
                  <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>
                ) : tripOptions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Trip Options found.</p>
                    <p className="text-sm mt-1">Click "Add Trip" to create your first trip option.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                          <th className="px-6 py-4 w-16">Image</th>
                          <th className="px-6 py-4 w-1/4">Trip Name</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4">Available Travel Dates</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tripOptions.map(trip => (
                          <tr key={trip._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                {trip.image ? (
                                  <img src={trip.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 m-3 text-slate-300" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-brand-blue-deep">{trip.name}</td>
                            <td className="px-6 py-4 font-bold text-brand-green">{trip.price || "On Request"}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {trip.schedule && (
                                  <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue-deep text-[13px] font-bold rounded-lg border border-brand-blue/20">
                                    {trip.schedule}
                                  </span>
                                )}
                                {Array.isArray(trip.dates) && trip.dates.length > 0 ? (
                                  trip.dates.map((d: any, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-brand-green/10 text-brand-green-dark text-[13px] font-bold rounded-lg border border-brand-green/20">
                                      {typeof d === 'object' && d ? (typeof d.toLocaleDateString === 'function' ? d.toLocaleDateString() : String(d)) : String(d)}
                                    </span>
                                  ))
                                ) : (
                                  !trip.schedule && <span className="text-slate-400 italic text-sm">No schedule added</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleEdit(trip)} className="p-2 text-slate-400 hover:text-brand-blue bg-white rounded-lg border border-slate-200 shadow-sm transition-colors" title="Edit">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleteConfirm({ isOpen: true, id: trip._id, type: 'trip' })} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          ) : activeTab === 'gallery' ? (
            isFormOpen ? (
              <GalleryForm 
                token={token}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                  setIsFormOpen(false);
                  loadData();
                }}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal">
                {loading ? (
                  <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>
                ) : galleryPhotos.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No photos found.</p>
                    <p className="text-sm mt-1">Click "Add Photo" to upload your first image.</p>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {galleryPhotos.map((photo: any) => (
                      <div key={photo._id} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 shadow-sm">
                        <img src={photo.imageUrl} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={async () => {
                              if(!window.confirm("Delete this photo?")) return;
                              try {
                                await deleteGalleryPhotoFn({ data: { adminToken: token, id: photo._id }});
                                loadData();
                              } catch(e) {}
                            }} 
                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : activeTab === 'bookings' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal">
              {loading ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>
              ) : bookings.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No bookings yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                        <th className="px-6 py-4">Booking ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Trip Details</th>
                        <th className="px-6 py-4">Travel Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Submitted On</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((bk, idx) => (
                        <tr key={bk._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {bk.generatedBookingId}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-brand-blue-deep">{bk.name}</p>
                            <p className="text-sm font-medium text-slate-500">{bk.phone}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-700">{bk.tripName === 'custom' ? 'Custom Trip' : bk.tripName}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded">{bk.persons} Persons</span>
                              {bk.customDestination && (
                                <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded max-w-[120px] truncate" title={bk.customDestination}>To: {bk.customDestination}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700 text-sm">{bk.travelDate}</td>
                          <td className="px-6 py-4">
                            <select 
                              value={bk.status}
                              onChange={async (e) => {
                                try {
                                  await updateBookingStatusFn({ data: { adminToken: token, id: bk._id, status: e.target.value }});
                                  loadData();
                                } catch (err) {}
                              }}
                              className={`text-sm font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${
                                bk.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                bk.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(bk.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setDeleteConfirm({ isOpen: true, id: bk._id, type: 'booking' })} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors" title="Delete Booking">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'customers' ? (
            <CustomersView bookings={bookings} />
          ) : activeTab === 'reports' ? (
            <ReportsView bookings={bookings} />
          ) : activeTab === 'invoices' ? (
            <InvoicesView bookings={bookings} token={token} loadData={loadData} />
          ) : activeTab === 'revenue' ? (
            <RevenueView bookings={bookings} />
          ) : null}
          
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Delete</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent for the Form
function PackageForm({ token, initialData, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(initialData || {
    title: '',
    subtitle: '',
    durationBadge: '3D / 2N',
    location: '',
    schedule: 'Every Friday',
    frequency: '',
    price: '₹9,999',
    image: '',
    images: [],
    route: '',
    tags: '',
    includes: '',
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert comma-separated strings to arrays
    const payload = { ...formData };
    if (typeof payload.route === 'string') payload.route = payload.route.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (typeof payload.tags === 'string') payload.tags = payload.tags.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (typeof payload.includes === 'string') payload.includes = payload.includes.split(',').map((s: string) => s.trim()).filter(Boolean);
    
    try {
      if (initialData?._id) {
        await updatePackageFn({ data: { adminToken: token, id: initialData._id, data: payload } });
      } else {
        await createPackageFn({ data: { adminToken: token, data: payload } });
      }
      onSuccess();
    } catch (e) {
      alert("Failed to save package.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to format initial array data to strings
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        images: initialData.images || (initialData.image ? [initialData.image] : []),
        route: Array.isArray(initialData.route) ? initialData.route.join(', ') : '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        includes: Array.isArray(initialData.includes) ? initialData.includes.join(', ') : '',
      });
    }
  }, [initialData]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold font-display text-brand-blue-deep">
          {initialData ? "Edit Package" : "Create New Package"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Pune to Ujjain Mahakal Yatra" required />
          <Input label="Subtitle" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="e.g. The holy journey" />
          <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Pune" required />
          <Input label="Duration Badge" name="durationBadge" value={formData.durationBadge} onChange={handleChange} placeholder="e.g. 3D / 2N" required />
          <Input label="Price" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. ₹9,999" required />
          <Input label="Schedule" name="schedule" value={formData.schedule} onChange={handleChange} placeholder="e.g. Every Friday" />
          <div className="md:col-span-2">
            <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-2">Package Images</label>
            <div className="flex flex-col gap-4">
              {formData.images && formData.images.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {formData.images.map((img: string, idx: number) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => {
                        const newImages = [...formData.images];
                        newImages.splice(idx, 1);
                        setFormData({ ...formData, images: newImages, image: newImages[0] || '' });
                      }} className="absolute top-1 right-1 bg-slate-900/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-500 transition-colors shadow-sm">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;

                    const newImages = [...(formData.images || [])];
                    let processedCount = 0;

                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        newImages.push(reader.result as string);
                        processedCount++;
                        
                        if (processedCount === files.length) {
                          setFormData({ ...formData, images: newImages, image: newImages[0] });
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-brand-blue/10 file:text-brand-blue-deep hover:file:bg-brand-blue/20 cursor-pointer text-sm text-slate-500"
                />
                <p className="text-xs text-slate-400 mt-2">Upload high-quality images from your device. Images are automatically backed up to Cloudinary.</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <Input label="Route (comma separated)" name="route" value={formData.route} onChange={handleChange} placeholder="Pune, Omkareshwar, Ujjain" />
          </div>
          <div className="md:col-span-2">
            <Input label="Tags (comma separated)" name="tags" value={formData.tags} onChange={handleChange} placeholder="Mahakaleshwar, Bhasma Aarti" />
          </div>
          <div className="md:col-span-2">
            <Input label="Includes (comma separated)" name="includes" value={formData.includes} onChange={handleChange} placeholder="AC Bus, Hotel, Meals" />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-brand-green/20">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Save Package
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

function TripOptionForm({ token, initialData, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    ...(initialData || {}),
    name: initialData?.name || '',
    schedule: initialData?.schedule || '',
    price: initialData?.price || '',
    image: initialData?.image || '',
    dates: initialData?.dates || [],
  });

  const [datesInput, setDatesInput] = useState(
    Array.isArray(initialData?.dates) ? initialData.dates.join(', ') : ''
  );

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = { 
      ...formData,
      dates: datesInput.split(',').map((s: string) => s.trim()).filter(Boolean)
    };
    
    try {
      if (initialData?._id) {
        await updateTripOptionFn({ data: { adminToken: token, id: initialData._id, data: payload } });
      } else {
        await createTripOptionFn({ data: { adminToken: token, data: payload } });
      }
      onSuccess();
    } catch (e) {
      alert("Failed to save trip option.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dates: initialData.dates || [],
      });
      setDatesInput(Array.isArray(initialData.dates) ? initialData.dates.join(', ') : '');
    }
  }, [initialData]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold font-display text-brand-blue-deep">
          {initialData ? "Edit Trip Option" : "Create New Trip Option"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6">
          <Input 
            label="Trip Name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g. Pune - Ujjain - Pune" 
            required 
          />
          <Input 
            label="Price" 
            name="price" 
            value={formData.price} 
            onChange={handleChange} 
            placeholder="e.g. ₹5,999" 
          />
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Cover Image</label>
            <div className="flex items-center gap-4">
              {formData.image && (
                <div className="relative w-24 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-1 right-1 bg-slate-900/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-500 transition-colors shadow-sm">
                    ×
                  </button>
                </div>
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, image: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-brand-blue/10 file:text-brand-blue-deep hover:file:bg-brand-blue/20 cursor-pointer text-sm text-slate-500"
                />
              </div>
            </div>
          </div>
          <Input 
            label="Schedule" 
            name="schedule" 
            value={formData.schedule} 
            onChange={handleChange} 
            placeholder="e.g. Every month friday to sunday" 
          />
          <Input 
            label="Available Dates (comma separated)" 
            name="dates"
            value={datesInput} 
            onChange={(e: any) => setDatesInput(e.target.value)} 
            placeholder="e.g. Sat 12 june to 13 june, 19 june to 20 june, 25 june to 26 june" 
          />
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-brand-green/20">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Save Trip
          </button>
        </div>
      </form>
    </div>
  );
}

function GalleryForm({ token, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addGalleryPhotoFn({ data: { adminToken: token, imageUrl } });
      onSuccess();
    } catch (e) {
      alert("Failed to add photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold font-display text-brand-blue-deep">Add New Photo</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Upload Photo</label>
          <input 
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] font-medium text-brand-blue-deep focus:ring-2 focus:ring-brand-green focus:border-brand-green focus:bg-white transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20"
            required
          />
        </div>
        {imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading || !imageUrl} className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-brand-green/20">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Add Photo
          </button>
        </div>
      </form>
    </div>
  );
}

function DashboardOverview({ packages, bookings, reviews, photos }: any) {
  const pendingBookings = bookings.filter((b: any) => b.status === 'Pending').length;
  
  return (
    <div className="flex flex-col gap-8 animate-reveal">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Bookings</p>
            <p className="text-3xl font-display font-bold text-brand-blue-deep">{bookings.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-3xl font-display font-bold text-brand-blue-deep">{pendingBookings}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Packages</p>
            <p className="text-3xl font-display font-bold text-brand-blue-deep">{packages.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Reviews</p>
            <p className="text-3xl font-display font-bold text-brand-blue-deep">{reviews.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-blue-deep">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">No bookings yet.</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Trip</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((bk: any) => (
                  <tr key={bk._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-brand-blue-deep text-sm">{bk.name}</p>
                      <p className="text-xs text-slate-500">{bk.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700 text-sm">{bk.tripName === 'custom' ? 'Custom Trip' : bk.tripName}</p>
                      <p className="text-xs text-slate-500">{bk.persons} Persons</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                        bk.status === 'Confirmed' ? 'bg-green-50 text-green-700' : 
                        bk.status === 'Cancelled' ? 'bg-red-50 text-red-700' : 
                        'bg-yellow-50 text-yellow-700'
                      }`}>
                        {bk.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-500 font-medium">
                      {new Date(bk.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomersView({ bookings = [] }: { bookings?: any[] }) {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  try {
    const customersMap = new globalThis.Map();
    (bookings || []).forEach(bk => {
      if (!bk) return;
      const phone = bk.phone || 'Unknown';
      if (!customersMap.has(phone)) {
        customersMap.set(phone, {
          name: bk.name || 'Unknown',
          phone: phone,
          totalBookings: 1,
          latestBookingDate: bk.createdAt,
          firstBookingDate: bk.createdAt,
          allTrips: [{ 
            name: bk.tripName === 'custom' ? `Custom Trip${bk.customDestination ? ` to ${bk.customDestination}` : ''}` : bk.tripName || 'Unknown',
            date: bk.travelDate || (bk.createdAt ? new Date(bk.createdAt).toLocaleDateString() : 'Unknown Date')
          }]
        });
      } else {
        const cust = customersMap.get(phone);
        if (cust) {
          cust.totalBookings += 1;
          const currentLatest = cust.latestBookingDate ? new Date(cust.latestBookingDate).getTime() : 0;
          const currentFirst = cust.firstBookingDate ? new Date(cust.firstBookingDate).getTime() : Infinity;
          const newDate = bk.createdAt ? new Date(bk.createdAt).getTime() : 0;
          if (newDate > currentLatest) {
            cust.latestBookingDate = bk.createdAt;
          }
          if (newDate > 0 && newDate < currentFirst) {
            cust.firstBookingDate = bk.createdAt;
          }
          cust.allTrips.push({
            name: bk.tripName === 'custom' ? `Custom Trip${bk.customDestination ? ` to ${bk.customDestination}` : ''}` : bk.tripName || 'Unknown',
            date: bk.travelDate || (bk.createdAt ? new Date(bk.createdAt).toLocaleDateString() : 'Unknown Date')
          });
        }
      }
    });

    // Sort oldest first to ensure stable sequential IDs
    const sortedCustomers = Array.from(customersMap.values()).sort((a, b) => {
      const timeA = a.firstBookingDate ? new Date(a.firstBookingDate).getTime() : 0;
      const timeB = b.firstBookingDate ? new Date(b.firstBookingDate).getTime() : 0;
      return timeA - timeB;
    });

    // Assign sequential IDs
    sortedCustomers.forEach((cust, index) => {
      cust.customerId = `cus-${String(index + 1).padStart(5, '0')}`;
    });

    // Reverse so newest customers appear at the top
    let displayCustomers = [...sortedCustomers].reverse();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      displayCustomers = displayCustomers.filter(cust => 
        (cust.name && cust.name.toLowerCase().includes(q)) || 
        (cust.customerId && cust.customerId.toLowerCase().includes(q)) ||
        (cust.phone && cust.phone.toLowerCase().includes(q))
      );
    }

    return (
      <>
      <div className="mb-6 animate-reveal">
        <input 
          type="text" 
          placeholder="Search by Customer ID, Name, or Phone..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 lg:w-1/3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-brand-blue-deep placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-sm"
        />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal">
        {displayCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No customers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Customer ID</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Total Bookings</th>
                  <th className="px-6 py-4">Trips Taken</th>
                  <th className="px-6 py-4 text-right">Latest Booking</th>
                </tr>
              </thead>
              <tbody>
                {displayCustomers.map((cust: any, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {cust.customerId}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-blue-deep">{cust.name}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{cust.phone}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{cust.totalBookings}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedCustomer(cust)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue-deep rounded-lg transition-colors font-bold text-xs"
                      >
                        <Eye className="w-4 h-4" />
                        View Trips
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-500">
                      {cust.latestBookingDate ? new Date(cust.latestBookingDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-reveal">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-brand-blue-deep">Trips Taken</h2>
                <p className="text-sm font-medium text-slate-500">by {selectedCustomer.name}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors self-start"><X className="w-5 h-5"/></button>
            </div>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {selectedCustomer.allTrips?.map((trip: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Map className="w-5 h-5 text-brand-green" />
                    <span className="font-bold text-slate-700">{trip.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
                    {trip.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </>
    );
  } catch (error: any) {
    return (
      <div className="m-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
        <h3 className="text-red-700 font-bold mb-2">Error Displaying Customers</h3>
        <p className="text-red-600 text-sm font-mono">{error.message || String(error)}</p>
      </div>
    );
  }
}

const applyTableStyles = (ws: any, titleSz = 16, subtitleSz = 14) => {
  if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: titleSz, color: { rgb: "000000" } }, alignment: { horizontal: "center", vertical: "center" } };
  if (ws['A2']) ws['A2'].s = { font: { bold: true, sz: subtitleSz, color: { rgb: "333333" } }, alignment: { horizontal: "center", vertical: "center" } };

  if (ws['!ref']) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = 3; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };

        const isHeader = R === 3;
        ws[cellAddress].s = {
          border: {
            top: { style: 'thin', color: { auto: 1 } },
            bottom: { style: 'thin', color: { auto: 1 } },
            left: { style: 'thin', color: { auto: 1 } },
            right: { style: 'thin', color: { auto: 1 } }
          },
          alignment: { vertical: "center", wrapText: true },
          font: isHeader ? { bold: true, color: { rgb: "FFFFFF" } } : undefined,
          fill: isHeader ? { patternType: 'solid', fgColor: { rgb: "4F81BD" } } : undefined
        };
      }
    }
  }
};

function ReportsView({ bookings = [] }: { bookings?: any[] }) {
  const exportBookings = () => {
    const headers = ['Booking ID', 'Customer Name', 'Phone Number', 'Trip Name', 'Persons', 'Travel Date', 'Status', 'Submission Date', 'Custom Destination'];
    
    const rows = bookings.map((bk, idx) => {
      const bId = bk.generatedBookingId;
      const phoneStr = (bk.phone || '').replace(/[\r\n]+/g, ' ');
      const dateStr = bk.createdAt ? new Date(bk.createdAt).toLocaleDateString() : '';
      return [
        bId,
        (bk.name || '').replace(/[\r\n]+/g, ' '),
        phoneStr,
        (bk.tripName === 'custom' ? 'Custom Trip' : (bk.tripName || '')).replace(/[\r\n]+/g, ' '),
        bk.persons || '',
        (bk.travelDate || '').replace(/[\r\n]+/g, ' '),
        bk.status || '',
        dateStr,
        (bk.customDestination || '').replace(/[\r\n]+/g, ' ')
      ];
    });
    
    const ws = XLSX.utils.aoa_to_sheet([
      ['SHAILRAJ TRAVELS PUNE'],
      ['Booking Report'],
      [],
      headers, 
      ...rows
    ]);

    applyTableStyles(ws);
    
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }
    ];

    ws['!cols'] = [
      { wch: 10 }, // Booking ID
      { wch: 20 }, // Customer Name
      { wch: 12 }, // Phone Number
      { wch: 25 }, // Trip Name
      { wch: 8 },  // Persons
      { wch: 18 }, // Travel Date
      { wch: 12 }, // Status
      { wch: 12 }, // Submission Date
      { wch: 20 }  // Custom Destination
    ];
    
    ws['!fitToPage'] = true;
    ws['!pageSetup'] = { orientation: 'landscape', fitToWidth: 1, fitToHeight: 0 };
    ws['!margins'] = { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3, horizontallyCenter: true } as any;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, `bookings_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };



  const exportCustomers = () => {
    const customersMap = new globalThis.Map();
    (bookings || []).forEach(bk => {
      if (!bk) return;
      const phone = bk.phone || 'Unknown';
      if (!customersMap.has(phone)) {
        customersMap.set(phone, {
          name: bk.name || 'Unknown',
          phone: phone,
          totalBookings: 1,
          firstBookingDate: bk.createdAt,
          latestBookingDate: bk.createdAt,
          allTrips: new Set([bk.tripName === 'custom' ? 'Custom Trip' : bk.tripName || 'Unknown'])
        });
      } else {
        const cust = customersMap.get(phone);
        if (cust) {
          cust.totalBookings += 1;
          const currentLatest = cust.latestBookingDate ? new Date(cust.latestBookingDate).getTime() : 0;
          const currentFirst = cust.firstBookingDate ? new Date(cust.firstBookingDate).getTime() : Infinity;
          const newDate = bk.createdAt ? new Date(bk.createdAt).getTime() : 0;
          if (newDate > currentLatest) cust.latestBookingDate = bk.createdAt;
          if (newDate > 0 && newDate < currentFirst) cust.firstBookingDate = bk.createdAt;
          cust.allTrips.add(bk.tripName === 'custom' ? 'Custom Trip' : bk.tripName || 'Unknown');
        }
      }
    });

    const sortedCustomers = Array.from(customersMap.values()).sort((a, b) => {
      const timeA = a.firstBookingDate ? new Date(a.firstBookingDate).getTime() : 0;
      const timeB = b.firstBookingDate ? new Date(b.firstBookingDate).getTime() : 0;
      return timeA - timeB;
    });

    sortedCustomers.forEach((cust, index) => {
      cust.customerId = `cus-${String(index + 1).padStart(5, '0')}`;
    });

    const displayCustomers = [...sortedCustomers].reverse();

    const headers = ['Customer ID', 'Customer Name', 'Phone Number', 'Total Bookings', 'First Booking Date', 'Latest Booking Date', 'Trips Taken'];
    
    const rows = displayCustomers.map((cust: any) => {
      const tripsStr = Array.from(cust.allTrips).join('; ');
      const phoneStr = (cust.phone || '').replace(/[\r\n]+/g, ' ');
      const firstDateStr = cust.firstBookingDate ? new Date(cust.firstBookingDate).toLocaleDateString() : 'N/A';
      const lastDateStr = cust.latestBookingDate ? new Date(cust.latestBookingDate).toLocaleDateString() : 'N/A';

      return [
        cust.customerId,
        (cust.name || '').replace(/[\r\n]+/g, ' '),
        phoneStr,
        cust.totalBookings,
        firstDateStr,
        lastDateStr,
        tripsStr.replace(/[\r\n]+/g, ' ')
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([
      ['SHAILRAJ TRAVELS PUNE'],
      ['Customer Report'],
      [],
      headers, 
      ...rows
    ]);

    applyTableStyles(ws);
    
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }
    ];

    ws['!cols'] = [
      { wch: 12 }, // Customer ID
      { wch: 20 }, // Customer Name
      { wch: 12 }, // Phone Number
      { wch: 15 }, // Total Bookings
      { wch: 15 }, // First Booking Date
      { wch: 15 }, // Latest Booking Date
      { wch: 40 }  // Trips Taken
    ];
    
    ws['!fitToPage'] = true;
    ws['!pageSetup'] = { orientation: 'landscape', fitToWidth: 1, fitToHeight: 0 };
    ws['!margins'] = { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3, horizontallyCenter: true } as any;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `customers_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const groupsMap = new globalThis.Map<string, any[]>();
  (bookings || []).forEach(bk => {
    if (bk.tripName && bk.tripName !== 'custom') {
      const key = `${bk.tripName} (${bk.travelDate || 'No Date'})`;
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key)!.push(bk);
    }
  });
  const tripGroups = Array.from(groupsMap.entries());

  const [selectedTripGroup, setSelectedTripGroup] = React.useState<string>('');

  React.useEffect(() => {
    if (tripGroups.length > 0 && !selectedTripGroup) {
      setSelectedTripGroup(tripGroups[0][0]);
    }
  }, [tripGroups, selectedTripGroup]);

  const exportSpecificTrip = () => {
    if (!selectedTripGroup) return;
    const group = tripGroups.find(g => g[0] === selectedTripGroup);
    if (!group) return;

    const [groupName, groupBks] = group;
    const headers = ['Booking ID', 'Customer Name', 'Phone Number', 'Trip Name', 'Persons', 'Travel Date', 'Status', 'Submission Date', 'Custom Destination'];
    
    const rows = groupBks.map((bk: any) => {
      const bId = bk.generatedBookingId;
      const phoneStr = (bk.phone || '').replace(/[\r\n]+/g, ' ');
      const dateStr = bk.createdAt ? new Date(bk.createdAt).toLocaleDateString() : '';
      return [
        bId,
        (bk.name || '').replace(/[\r\n]+/g, ' '),
        phoneStr,
        (bk.tripName === 'custom' ? 'Custom Trip' : (bk.tripName || '')).replace(/[\r\n]+/g, ' '),
        bk.persons || '',
        (bk.travelDate || '').replace(/[\r\n]+/g, ' '),
        bk.status || '',
        dateStr,
        (bk.customDestination || '').replace(/[\r\n]+/g, ' ')
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([
      ['SHAILRAJ TRAVELS PUNE'],
      [`Booking Report: ${groupName}`],
      [],
      headers, 
      ...rows
    ]);

    applyTableStyles(ws);
    
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }
    ];

    ws['!cols'] = [
      { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 25 }, { wch: 8 }, 
      { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 20 }
    ];
    
    ws['!fitToPage'] = true;
    ws['!pageSetup'] = { orientation: 'landscape', fitToWidth: 1, fitToHeight: 0 };
    ws['!margins'] = { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3, horizontallyCenter: true } as any;

    const wb = XLSX.utils.book_new();
    const safeSheetName = groupName.replace(/[\\/*?:\[\]]/g, '').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
    
    const safeFileName = groupName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(wb, `trip_report_${safeFileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-reveal">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center mb-4">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-brand-blue-deep mb-2">Bookings Report</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">
          Download a complete Excel spreadsheet of all your trip bookings.
        </p>
        <button 
          onClick={exportBookings}
          className="w-full max-w-xs bg-brand-blue-deep hover:bg-brand-blue text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-blue/20"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export Bookings
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-brand-blue-deep mb-2">Customers Report</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">
          Download an Excel summary of all your unique customers and their trips.
        </p>
        <button 
          onClick={exportCustomers}
          className="w-full max-w-xs bg-brand-green hover:bg-brand-green-dark text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-green/20"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export Customers
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-brand-blue-deep mb-2">Trip Report</h3>
        <p className="text-slate-500 text-sm mb-4 max-w-xs">
          Select a specific trip to download its bookings.
        </p>
        
        <select
          value={selectedTripGroup}
          onChange={(e) => setSelectedTripGroup(e.target.value)}
          className="w-full max-w-xs p-3 mb-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue/50 outline-none"
        >
          {tripGroups.map(g => (
            <option key={g[0]} value={g[0]}>{g[0]} ({g[1].length} bookings)</option>
          ))}
          {tripGroups.length === 0 && <option value="">No specific trips found</option>}
        </select>

        <button 
          onClick={exportSpecificTrip}
          disabled={!selectedTripGroup}
          className="w-full max-w-xs bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export Trip Report
        </button>
      </div>
    </div>
  );
}

function AuditLogsPanel({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
        <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <h3 className="text-xl font-bold text-slate-600 mb-2">No Audit Logs</h3>
        <p className="text-slate-500">No actions have been recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium text-sm">
              <th className="p-4 pl-6 whitespace-nowrap">Date & Time</th>
              <th className="p-4">Action</th>
              <th className="p-4">Category</th>
              <th className="p-4 pr-6">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 text-slate-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-4 font-medium text-slate-800 whitespace-nowrap">
                  {log.action}
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 text-xs">
                    {log.entityType}
                  </span>
                </td>
                <td className="p-4 pr-6 text-slate-600">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { InvoicePrint } from '../frontend/components/InvoicePrint';

function InvoicesView({ bookings, token, loadData }: { bookings: any[]; token: string | null; loadData: (t?: string) => Promise<void> }) {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter for confirmed bookings whose travelDate is today or in the past
  let generatedInvoices = bookings.filter(b => {
    if (b.status !== 'Confirmed') return false;
    const travelTime = new Date(b.travelDate).getTime();
    if (isNaN(travelTime)) return true; // Show it if parsing fails
    return travelTime <= Date.now();
  });

  // Sort them chronologically by createdAt so older bookings get smaller IDs
  generatedInvoices.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

  // Assign sequential invoice ID
  generatedInvoices = generatedInvoices.map((bk, idx) => {
    const index = idx + 1;
    const letter = String.fromCharCode(65 + ((index - 1) % 26));
    const padded = String(index).padStart(4, '0');
    // Use custom invoice number if already locked/saved
    const customNo = bk.invoiceCustomData?.invoiceNo;
    return { ...bk, generatedInvoiceNo: customNo || `INV-${letter}${padded}` };
  });

  // Reverse so newest are shown first
  generatedInvoices.reverse();

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    generatedInvoices = generatedInvoices.filter(bk => {
      const invoiceNo = bk.generatedInvoiceNo;
      const custom = bk.invoiceCustomData || {};
      const customerName = custom.customerName || bk.customerName || bk.name || '';
      return (
        invoiceNo.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q)
      );
    });
  }

  const selectedBooking = generatedInvoices.find(b => b._id === selectedBookingId);

  if (selectedBookingId && selectedBooking) {
    return (
      <div className="animate-reveal">
        <div className="no-print flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={() => setSelectedBookingId(null)} className="text-brand-blue-deep flex items-center font-bold hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-brand-blue-deep text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-blue shadow-md flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
        
        {/* We rely on .no-print classes and specific print resets for layout */}
        <div className="print-container">
           <style>{`
             @media print {
                /* Hide global layout wrappers */
                aside, header { display: none !important; }
                
                /* Reset containers that might cause scrolling or clipping */
                main, .min-h-screen, .h-screen { 
                  height: auto !important; 
                  min-height: 0 !important; 
                  overflow: visible !important; 
                }
                
                /* Hide any siblings of the print container if needed, though no-print usually handles this */
                .no-print { display: none !important; }
             }
           `}</style>
           <InvoicePrint 
             booking={selectedBooking} 
             token={token} 
             onSuccess={() => {
               if (token) loadData(token);
             }} 
           />
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="mb-6 animate-reveal">
      <input 
        type="text" 
        placeholder="Search by Invoice ID or Customer Name..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full md:w-1/2 lg:w-1/3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-brand-blue-deep placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all shadow-sm"
      />
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal">
      {generatedInvoices.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Printer className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">No Invoices Ready</h3>
          <p className="text-sm">Invoices are automatically generated when a "Confirmed" booking reaches its Trip Start Date.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Trip Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {generatedInvoices.map((bk) => {
                const custom = bk.invoiceCustomData || {};
                const invoiceNo = bk.generatedInvoiceNo;
                const rate = custom.rate !== undefined ? Number(custom.rate) : (bk.defaultRate || 6000);
                const persons = custom.persons !== undefined ? Number(custom.persons) : (Number(bk.persons) || 1);
                const total = rate * persons;
                const customerName = custom.customerName || bk.customerName || bk.name || '';
                const tripName = custom.packageName || bk.packageName || bk.tripName || '';
                
                return (
                  <tr key={bk._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-brand-blue-deep">
                      <div className="flex items-center gap-2">
                        <span>{invoiceNo}</span>
                        {bk.isInvoiceLocked && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                            <Lock size={10} className="text-slate-400" /> Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{customerName}</p>
                      <p className="text-xs text-slate-500">{tripName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {new Date(bk.travelDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-green-dark">₹ {total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedBookingId(bk._id)}
                        className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green-dark px-4 py-2 rounded-lg font-bold hover:bg-brand-green/20 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
}

function RevenueView({ bookings }: { bookings: any[] }) {
  const getBookingRevenue = (bk: any) => {
    const custom = bk.invoiceCustomData || {};
    const rate = custom.rate !== undefined ? Number(custom.rate) : (bk.defaultRate || 6000);
    const persons = custom.persons !== undefined ? Number(custom.persons) : (Number(bk.persons) || 1);
    return rate * persons;
  };

  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
  const confirmedRevenue = confirmedBookings.reduce((sum, b) => sum + getBookingRevenue(b), 0);

  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const pendingRevenue = pendingBookings.reduce((sum, b) => sum + getBookingRevenue(b), 0);

  const totalPotentialRevenue = confirmedRevenue + pendingRevenue;
  const activeBookingsCount = confirmedBookings.length + pendingBookings.length;
  const averageBookingRevenue = activeBookingsCount > 0 ? totalPotentialRevenue / activeBookingsCount : 0;

  // Destination Breakdown
  const tripBreakdown: { [key: string]: { name: string; count: number; revenue: number } } = {};
  bookings.filter(b => b.status !== 'Cancelled').forEach(b => {
    const name = b.tripName === 'custom' ? 'Custom Trip' : b.tripName;
    const rev = getBookingRevenue(b);
    if (!tripBreakdown[name]) {
      tripBreakdown[name] = { name, count: 0, revenue: 0 };
    }
    tripBreakdown[name].revenue += rev;
    tripBreakdown[name].count += 1;
  });
  const tripList = Object.values(tripBreakdown).sort((a, b) => b.revenue - a.revenue);
  const totalBreakdownRevenue = tripList.reduce((sum, t) => sum + t.revenue, 0);

  // Monthly Breakdown
  const monthlyData: { [key: string]: number } = {};
  bookings.filter(b => b.status !== 'Cancelled').forEach(b => {
    const d = b.createdAt ? new Date(b.createdAt) : new Date();
    if (isNaN(d.getTime())) return;
    const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyData[key] = (monthlyData[key] || 0) + getBookingRevenue(b);
  });
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const maxMonthRevenue = sortedMonths.length > 0 ? Math.max(...Object.values(monthlyData)) : 1;

  return (
    <div className="flex flex-col gap-8 animate-reveal">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-reveal">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-2xl border border-indigo-700 shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <BadgeIndianRupee className="w-24 h-24 animate-pulse" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">Potential Revenue</p>
          <p className="text-3xl font-display font-bold mt-2">₹ {totalPotentialRevenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-indigo-200">
            <span>Confirmed + Pending</span>
            <span className="bg-indigo-500/30 px-2 py-0.5 rounded font-semibold">{activeBookingsCount} bookings</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl border border-emerald-700 shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <BadgeIndianRupee className="w-24 h-24 animate-pulse" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-200">Confirmed Revenue</p>
          <p className="text-3xl font-display font-bold mt-2">₹ {confirmedRevenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-emerald-200">
            <span>Realized Income</span>
            <span className="bg-emerald-500/30 px-2 py-0.5 rounded font-semibold">{confirmedBookings.length} confirmed</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl border border-amber-600 shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <BadgeIndianRupee className="w-24 h-24 animate-pulse" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200">Pipeline Revenue</p>
          <p className="text-3xl font-display font-bold mt-2">₹ {pendingRevenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-amber-200">
            <span>Expected Pending</span>
            <span className="bg-amber-500/30 px-2 py-0.5 rounded font-semibold">{pendingBookings.length} pending</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-700 text-white p-6 rounded-2xl border border-cyan-700 shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <BadgeIndianRupee className="w-24 h-24 animate-pulse" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-200">Avg Booking Revenue</p>
          <p className="text-3xl font-display font-bold mt-2">₹ {Math.round(averageBookingRevenue).toLocaleString()}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-cyan-200">
            <span>Average Deal Size</span>
            <span className="bg-cyan-500/30 px-2 py-0.5 rounded font-semibold">Per booking</span>
          </div>
        </div>
      </div>

      {/* Charts / Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Destination performance */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-brand-blue-deep mb-6">Revenue by Destination</h2>
          <div className="flex flex-col gap-5 flex-1 justify-center">
            {tripList.map((trip) => {
              const pct = totalBreakdownRevenue > 0 ? (trip.revenue / totalBreakdownRevenue) * 100 : 0;
              return (
                <div key={trip.name} className="flex flex-col">
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <span className="font-bold text-slate-700">{trip.name}</span>
                    <div className="flex gap-3 text-slate-500">
                      <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded">{trip.count} bookings</span>
                      <span className="font-bold text-brand-blue-deep">₹ {trip.revenue.toLocaleString()} ({Math.round(pct)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-blue h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {tripList.length === 0 && (
              <div className="text-center text-slate-400 py-8">No booking data available</div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-brand-blue-deep mb-6">Monthly Revenue Trend</h2>
          <div className="flex-1 flex items-end justify-around gap-2 pt-6 pb-2 min-h-[220px]">
            {sortedMonths.map((month) => {
              const val = monthlyData[month];
              const pct = (val / maxMonthRevenue) * 100;
              return (
                <div key={month} className="flex flex-col items-center gap-2 flex-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    ₹ {val.toLocaleString()}
                  </div>
                  <div className="w-full bg-slate-50 rounded-t-lg flex items-end h-[160px] overflow-hidden">
                    <div 
                      className="bg-gradient-to-t from-brand-blue to-cyan-500 w-full rounded-t-md group-hover:opacity-90 transition-all duration-300"
                      style={{ height: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{month}</span>
                </div>
              );
            })}
            {sortedMonths.length === 0 && (
              <div className="text-center text-slate-400 py-8 w-full">No trend data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-brand-blue-deep">Booking Revenue Ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Trip Destination</th>
                <th className="px-6 py-4">Calculated Rate</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Total Revenue</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {bookings.filter(b => b.status !== 'Cancelled').map((bk) => {
                const custom = bk.invoiceCustomData || {};
                const rate = custom.rate !== undefined ? Number(custom.rate) : 6000;
                const persons = custom.persons !== undefined ? Number(custom.persons) : (bk.persons || 1);
                const total = rate * persons;
                const customerName = custom.customerName || bk.customerName || bk.name || '';
                const tripName = custom.packageName || bk.packageName || bk.tripName || '';
                
                return (
                  <tr key={bk._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                      {bk.generatedBookingId || bk._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{customerName}</td>
                    <td className="px-6 py-4 text-slate-600">{tripName}</td>
                    <td className="px-6 py-4 text-slate-600">₹ {rate.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600 text-center w-12">{persons}</td>
                    <td className="px-6 py-4 font-bold text-brand-blue-deep">₹ {total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        bk.status === 'Confirmed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {bk.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-medium">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
