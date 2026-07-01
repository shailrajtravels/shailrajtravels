import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { verifyAdminFn } from '@/backend/infrastructure/auth';
import {
  getPackagesFn,
  createPackageFn,
  updatePackageFn,
  deletePackageFn,
} from '@/backend/features/packages';
import { getReviewsFn, deleteReviewFn } from '@/backend/features/reviews';
import { getCustomBlogsFn, deleteCustomBlogFn, updateCustomBlogFn, toggleBlogVisibilityFn } from '@/backend/features/custom-blogs';
import {
  getTripOptionsFn,
  createTripOptionFn,
  updateTripOptionFn,
  deleteTripOptionFn,
  getBookingsFn,
  deleteBookingFn,
  updateBookingStatusFn,
  updateBookingPaymentStatusFn,
  sendBookingReplyFn,
} from '@/backend/shared/bookings';
import {
  getGalleryPhotosFn,
  addGalleryPhotoFn,
  deleteGalleryPhotoFn,
} from '@/backend/shared/gallery';
import { getAuditLogsFn } from '@/backend/shared/audit';
import { getToursFn, deleteTourFn } from '@/backend/features/tours';
import {
  getWhatsAppStatusFn,
  restartWhatsAppFn,
  logoutWhatsAppFn,
  getChatbotRulesFn,
  saveChatbotRulesFn,
} from '@/backend/infrastructure/whatsapp-api';
import { ToursAdmin } from '@/frontend/features/admin/ToursAdmin';
import {
  LayoutDashboard,
  Package,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Search,
  ArrowLeft,
  Image as ImageIcon,
  MessageSquare,
  BookOpen,
  Menu,
  X,
  Map,
  CalendarCheck,
  MoreVertical,
  Clock,
  Users,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Download,
  Activity,
  Printer,
  MapPin,
  Lock,
  BadgeIndianRupee,
  Smartphone,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import logo from '@/frontend/shared/assets/Shailraj travels-Punelogo.png';
import { Calendar } from '@/frontend/shared/ui/calendar';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts';

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("adminToken");
      if (!token) {
        throw redirect({ to: "/login" });
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
  const [customBlogs, setCustomBlogs] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // Shared for editing
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "tours_packages"
    | "reviews"
    | "trips"
    | "bookings"
    | "gallery"
    | "customers"
    | "reports"
    | "invoices"
    | "audit"
    | "revenue"
    | "whatsapp"
    | "blogs"
  >("dashboard");
  const [subTab, setSubTab] = useState<"tours" | "packages">("tours");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
    type: "package" | "review" | "photo" | "trip" | "booking" | "tour" | "blog";
  } | null>(null);
  const [bookingSearch, setBookingSearch] = useState("");
  const [replyModal, setReplyModal] = useState<{isOpen: boolean, booking: any}>({isOpen: false, booking: null});
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    const t = sessionStorage.getItem("adminToken");
    if (!t) {
      navigate({ to: "/login" });
      return;
    }

    // Verify token
    verifyAdminFn({ data: { token: t } })
      .then((res) => {
        if (res?.success) {
          setToken(t);
          loadData(t);
        } else {
          sessionStorage.removeItem("adminToken");
          navigate({ to: "/login" });
        }
      })
      .catch(() => {
        sessionStorage.removeItem("adminToken");
        navigate({ to: "/login" });
      });
  }, [navigate]);

  const loadData = async (activeToken?: string) => {
    const tkn = activeToken || token;
    setLoading(true);
    setErrorMsg(null);
    try {
      // Fetch individually so one failure doesn't break the whole dashboard
      const pkgsPromise = getPackagesFn().catch((e) => {
        console.error("Packages error:", e);
        return [];
      });
      const revsPromise = getReviewsFn().catch((e) => {
        console.error("Reviews error:", e);
        return [];
      });
      const tripsPromise = getTripOptionsFn().catch((e) => {
        console.error("Trips error:", e);
        return [];
      });
      const bksPromise = tkn
        ? getBookingsFn({ data: { adminToken: tkn } }).catch((e) => {
            console.error("Bookings error:", e);
            return [];
          })
        : Promise.resolve([]);
      const photosPromise = getGalleryPhotosFn().catch((e) => {
        console.error("Photos error:", e);
        return [];
      });
      const auditPromise = tkn
        ? getAuditLogsFn({ data: { adminToken: tkn } }).catch((e) => {
            console.error("Audit error:", e);
            return [];
          })
        : Promise.resolve([]);
      const toursPromise = getToursFn().catch((e) => {
        console.error("Tours error:", e);
        return [];
      });
      const blogsPromise = getCustomBlogsFn().catch((e) => {
        console.error("Custom blogs error:", e);
        return [];
      });

      const [pkgs, revs, trips, bks, photos, logs, trs, dbBlogs] = await Promise.all([
        pkgsPromise,
        revsPromise,
        tripsPromise,
        bksPromise,
        photosPromise,
        auditPromise,
        toursPromise,
        blogsPromise,
      ]);

      setPackages(pkgs);
      setReviews(revs);
      setTripOptions(trips);

      let sortedBks = [...(bks || [])].sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      );
      sortedBks = sortedBks.map((bk, idx) => {
        const index = idx + 1;
        const letter = String.fromCharCode(65 + ((index - 1) % 26));
        const prefix = letter + letter;
        const padded = String(index).padStart(5, "0");
        return { ...bk, generatedBookingId: `${prefix}${padded}` };
      });
      sortedBks.reverse();
      setBookings(sortedBks);

      setGalleryPhotos(photos);
      setAuditLogs(logs);
      setTours(trs);
      setCustomBlogs(dbBlogs || []);
    } catch (e: any) {
      console.error("loadData fatal error:", e);
      setErrorMsg(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    navigate({ to: "/login" });
  };

  const handleDeletePackage = (id: string) => {
    setDeleteConfirm({ isOpen: true, id, type: "package" });
  };

  const handleDeleteReview = (id: string) => {
    setDeleteConfirm({ isOpen: true, id, type: "review" });
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeletePhoto = (id: string) => {
    setDeleteConfirm({ isOpen: true, id, type: "photo" });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm || !token) return;
    try {
      if (deleteConfirm.type === "package")
        await deletePackageFn({ data: { adminToken: token, id: deleteConfirm.id } });
      else if (deleteConfirm.type === "review")
        await deleteReviewFn({ data: { adminToken: token, id: deleteConfirm.id } });
      else if (deleteConfirm.type === "photo")
        await deleteGalleryPhotoFn({ data: { adminToken: token, id: deleteConfirm.id } });
      else if (deleteConfirm.type === "trip")
        await deleteTripOptionFn({ data: { adminToken: token, id: deleteConfirm.id } });
      else if (deleteConfirm.type === "booking")
        await deleteBookingFn({ data: { adminToken: token, id: deleteConfirm.id } });
      else if (deleteConfirm.type === "tour")
        await deleteTourFn({ data: { adminToken: token, id: deleteConfirm.id } });
      else if (deleteConfirm.type === "blog")
        await deleteCustomBlogFn({ data: { adminToken: token, id: deleteConfirm.id } });

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

  const filteredBookings = bookings.filter((bk) => {
    const query = bookingSearch.toLowerCase().trim();
    if (!query) return true;

    const bookingId = (bk.generatedBookingId || "").toLowerCase();
    const name = (bk.name || "").toLowerCase();
    const phone = (bk.phone || "").toLowerCase();
    const tripName = (bk.tripName === "custom" ? "custom trip" : bk.tripName || "").toLowerCase();
    const customDest = (bk.customDestination || "").toLowerCase();
    const pickup = (bk.pickupLocation || "").toLowerCase();
    const travelDate = (bk.travelDate || "").toLowerCase();

    return (
      bookingId.includes(query) ||
      name.includes(query) ||
      phone.includes(query) ||
      tripName.includes(query) ||
      customDest.includes(query) ||
      pickup.includes(query) ||
      travelDate.includes(query)
    );
  });

  if (!token)
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );

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
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center">
            <img src={logo} alt="Shailraj" className="h-16 mr-3 object-contain" />
            <span className="font-display font-bold text-xl text-brand-blue-deep tracking-tight">
              Admin
            </span>
          </div>
          <button
            className="md:hidden p-2 text-slate-400 hover:text-slate-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "dashboard" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab("tours_packages");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "tours_packages" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <Package className="w-5 h-5" />
            Tours & Packages
          </button>
          <button
            onClick={() => {
              setActiveTab("reviews");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "reviews" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <MessageSquare className="w-5 h-5" />
            Reviews
          </button>
          <button
            onClick={() => {
              setActiveTab("trips");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "trips" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <Map className="w-5 h-5" />
            Trip Options
          </button>
          <button
            onClick={() => {
              setActiveTab("bookings");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "bookings" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <CalendarCheck className="w-5 h-5" />
            Bookings
          </button>
          <button
            onClick={() => {
              setActiveTab("invoices");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "invoices" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <Printer className="w-5 h-5" />
            Invoices
          </button>
          <button
            onClick={() => {
              setActiveTab("revenue");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "revenue" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <BadgeIndianRupee className="w-5 h-5" />
            Revenue
          </button>
          <button
            onClick={() => {
              setActiveTab("gallery");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "gallery" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <ImageIcon className="w-5 h-5" />
            Gallery
          </button>
          <button
            onClick={() => {
              setActiveTab("customers");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "customers" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <Users className="w-5 h-5" />
            Customers
          </button>
          <button
            onClick={() => {
              setActiveTab("reports");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "reports" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            Reports
          </button>
          <button
            onClick={() => {
              setActiveTab("audit");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "audit" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <Activity className="w-5 h-5" />
            Audit Logs
          </button>
          <button
            onClick={() => {
              setActiveTab("whatsapp");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "whatsapp" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <Smartphone className="w-5 h-5" />
            WhatsApp Engine
          </button>
          <button
            onClick={() => {
              setActiveTab("blogs");
              setIsFormOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "blogs" ? "bg-brand-blue-deep text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue-deep"}`}
          >
            <ImageIcon className="w-5 h-5" />
            Custom Blogs
          </button>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all"
          >
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
            <button
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-display text-brand-blue-deep truncate">
              {activeTab === "dashboard"
                ? "Overview"
                : activeTab === "tours_packages"
                  ? "Tours & Packages"
                  : activeTab === "reviews"
                    ? "Reviews Management"
                    : activeTab === "trips"
                      ? "Trip Options"
                      : activeTab === "gallery"
                        ? "Gallery Management"
                        : activeTab === "customers"
                          ? "Customers"
                          : activeTab === "reports"
                            ? "Reports & Exports"
                            : activeTab === "invoices"
                              ? "Generated Invoices"
                              : activeTab === "audit"
                                ? "Audit Logs"
                                : activeTab === "revenue"
                                  ? "Revenue Overview"
                                  : activeTab === "whatsapp"
                                    ? "WhatsApp Engine"
                                    : activeTab === "blogs"
                                      ? "Blogs Management"
                                      : "Booking Management"}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {((activeTab === "tours_packages" && subTab === "packages") ||
              activeTab === "trips" ||
              activeTab === "gallery") &&
              !isFormOpen && (
                <button
                  onClick={handleAddNew}
                  className="bg-brand-blue-deep hover:bg-brand-blue text-white px-3 py-2 md:px-5 md:py-2.5 rounded-xl font-bold flex items-center gap-1 md:gap-2 transition-colors shadow-lg shadow-brand-blue/20 text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                  <span className="hidden sm:inline">
                    Add{" "}
                    {activeTab === "tours_packages" && subTab === "packages"
                      ? "Package"
                      : activeTab === "gallery"
                        ? "Photo"
                        : "Trip"}
                  </span>
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
          {activeTab === "dashboard" ? (
            <DashboardOverview
              packages={packages}
              bookings={bookings}
              reviews={reviews}
              photos={galleryPhotos}
            />
          ) : activeTab === "audit" ? (
            <AuditLogsPanel logs={auditLogs} />
          ) : activeTab === "tours_packages" ? (
            <div>
              {/* Mini-tab toggle */}
              {!isFormOpen && (
                <div className="flex gap-4 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setSubTab("tours")}
                    className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                      subTab === "tours"
                        ? "bg-brand-blue-deep text-white shadow-sm"
                        : "text-slate-600 hover:text-brand-blue-deep hover:bg-white/50"
                    }`}
                  >
                    Popular Tours
                  </button>
                  <button
                    onClick={() => setSubTab("packages")}
                    className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                      subTab === "packages"
                        ? "bg-brand-blue-deep text-white shadow-sm"
                        : "text-slate-600 hover:text-brand-blue-deep hover:bg-white/50"
                    }`}
                  >
                    Packages
                  </button>
                </div>
              )}

              {subTab === "tours" ? (
                <ToursAdmin
                  token={token}
                  tours={tours}
                  loadData={loadData}
                  setDeleteConfirm={setDeleteConfirm}
                />
              ) : isFormOpen ? (
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
                    <div className="p-12 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
                    </div>
                  ) : packages.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No packages found.</p>
                      <p className="text-sm mt-1">
                        Click "Add Package" to create your first package.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col w-full">
                      {/* Desktop Header */}
                      <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] uppercase tracking-wider font-bold px-6 py-4">
                        <div className="col-span-1">Image</div>
                        <div className="col-span-5">Package Details</div>
                        <div className="col-span-2">Price</div>
                        <div className="col-span-2">Schedule</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      
                      {/* Desktop and Mobile list wrapper */}
                      <div className="flex flex-col divide-y divide-slate-100">
                        {packages.map((pkg) => (
                          <div
                            key={pkg._id}
                            className="flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-slate-50/50 transition-colors p-4 md:px-6 md:py-4"
                          >
                            <div className="flex items-center gap-4 md:col-span-6">
                              <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/50">
                                {pkg.image ? (
                                  <img
                                    src={pkg.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="w-8 h-8 m-4 text-slate-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-brand-blue-deep text-base truncate">
                                  {pkg.title}
                                </p>
                                <p className="text-sm text-brand-green font-medium mt-0.5 truncate">
                                  {pkg.durationBadge} • {pkg.location}
                                </p>
                                <p className="md:hidden font-bold text-slate-700 mt-1.5">
                                  {pkg.price}
                                </p>
                                {pkg.schedule && (
                                  <p className="md:hidden text-xs text-slate-500 mt-0.5">
                                    Schedule: {pkg.schedule}
                                  </p>
                                )}
                              </div>
                              <div className="md:hidden flex gap-1 shrink-0 self-start">
                                <button
                                  onClick={() => handleEdit(pkg)}
                                  className="p-2 text-slate-400 hover:text-brand-blue transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePackage(pkg._id)}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            <div className="hidden md:block col-span-2 font-bold text-slate-700">
                              {pkg.price}
                            </div>
                            <div className="hidden md:block col-span-2 text-sm text-slate-500">
                              {pkg.schedule}
                            </div>
                            <div className="hidden md:flex col-span-2 justify-end gap-2">
                              <button
                                onClick={() => handleEdit(pkg)}
                                className="p-2 text-slate-400 hover:text-brand-blue bg-white rounded-lg border border-slate-200 shadow-sm transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePackage(pkg._id)}
                                className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === "reviews" ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal">
              {loading ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
                </div>
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
                      {reviews.map((rev) => (
                        <tr
                          key={rev._id}
                          className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-bold text-brand-blue-deep">{rev.name}</td>
                          <td className="px-6 py-4 font-bold text-yellow-500">{rev.rating} ★</td>
                          <td
                            className="px-6 py-4 max-w-md truncate text-sm text-slate-600"
                            title={rev.textEn}
                          >
                            {rev.textEn}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(rev.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteReview(rev._id)}
                              className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors"
                              title="Delete"
                            >
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
          ) : activeTab === "trips" ? (
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
                  <div className="p-12 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
                  </div>
                ) : tripOptions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Trip Options found.</p>
                    <p className="text-sm mt-1">
                      Click "Add Trip" to create your first trip option.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
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
                          {tripOptions.map((trip) => (
                            <tr
                              key={trip._id}
                              className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                  {trip.image ? (
                                    <img
                                      src={trip.image}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="w-6 h-6 m-3 text-slate-300" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-bold text-brand-blue-deep">
                                {trip.name}
                              </td>
                              <td className="px-6 py-4 font-bold text-brand-green">
                                {trip.price || "On Request"}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                  {trip.schedule && (
                                    <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue-deep text-[13px] font-bold rounded-lg border border-brand-blue/20">
                                      {trip.schedule}
                                    </span>
                                  )}
                                  {Array.isArray(trip.dates) && trip.dates.length > 0
                                    ? trip.dates.map((d: any, i: number) => (
                                        <span
                                          key={i}
                                          className="px-3 py-1 bg-brand-green/10 text-brand-green-dark text-[13px] font-bold rounded-lg border border-brand-green/20"
                                        >
                                          {typeof d === "object" && d
                                            ? typeof d.toLocaleDateString === "function"
                                              ? d.toLocaleDateString()
                                              : String(d)
                                            : String(d)}
                                        </span>
                                      ))
                                    : !trip.schedule && (
                                        <span className="text-slate-400 italic text-sm">
                                          No schedule added
                                        </span>
                                      )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEdit(trip)}
                                    className="p-2 text-slate-400 hover:text-brand-blue bg-white rounded-lg border border-slate-200 shadow-sm transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteConfirm({ isOpen: true, id: trip._id, type: "trip" })
                                    }
                                    className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden flex flex-col divide-y divide-slate-100">
                      {tripOptions.map((trip) => (
                        <div key={trip._id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors animate-reveal">
                          <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/50">
                              {trip.image ? (
                                <img src={trip.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-8 h-8 m-4 text-slate-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-brand-blue-deep text-base truncate">{trip.name}</h4>
                              <p className="font-bold text-brand-green text-sm mt-1">{trip.price || "On Request"}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Available Dates:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {trip.schedule && (
                                <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue-deep text-[11px] font-bold rounded border border-brand-blue/20">
                                  {trip.schedule}
                                </span>
                              )}
                              {Array.isArray(trip.dates) && trip.dates.length > 0
                                ? trip.dates.map((d: any, i: number) => (
                                    <span
                                      key={i}
                                      className="px-2.5 py-0.5 bg-brand-green/10 text-brand-green-dark text-[11px] font-bold rounded border border-brand-green/20"
                                    >
                                      {typeof d === "object" && d
                                        ? typeof d.toLocaleDateString === "function"
                                          ? d.toLocaleDateString()
                                          : String(d)
                                        : String(d)}
                                    </span>
                                  ))
                                : !trip.schedule && (
                                    <span className="text-slate-450 italic text-xs">No schedule added</span>
                                  )}
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-1 pt-2 border-t border-slate-50">
                            <button
                              onClick={() => handleEdit(trip)}
                              className="flex-1 justify-center p-2 text-slate-500 hover:text-brand-blue bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-1 text-xs font-bold"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ isOpen: true, id: trip._id, type: "trip" })}
                              className="flex-1 justify-center p-2 text-slate-500 hover:text-red-500 bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-1 text-xs font-bold"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          ) : activeTab === "gallery" ? (
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
                  <div className="p-12 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
                  </div>
                ) : galleryPhotos.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No photos found.</p>
                    <p className="text-sm mt-1">Click "Add Photo" to upload your first image.</p>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {galleryPhotos.map((photo: any) => (
                      <div
                        key={photo._id}
                        className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 shadow-sm"
                      >
                        <img
                          src={photo.imageUrl}
                          alt="Gallery"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={async () => {
                              if (!window.confirm("Delete this photo?")) return;
                              try {
                                await deleteGalleryPhotoFn({
                                  data: { adminToken: token, id: photo._id },
                                });
                                loadData();
                              } catch (e) {}
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
          ) : activeTab === "bookings" ? (
            <div className="flex flex-col gap-6 animate-reveal">
              {/* Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search bookings by customer, phone, booking ID, destination, etc..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue-deep/20 focus:border-brand-blue-deep transition-all text-sm font-medium"
                  />
                  {bookingSearch && (
                    <button
                      onClick={() => setBookingSearch("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-12 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No bookings yet.</p>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
                    <p className="text-lg font-medium">No match found.</p>
                    <p className="text-sm mt-1 text-slate-400">Try searching for something else.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                            <th className="px-6 py-4">Booking ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Trip Details</th>
                            <th className="px-6 py-4">Travel Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Payment Status</th>
                            <th className="px-6 py-4">Submitted On</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.map((bk, idx) => (
                            <tr
                              key={bk._id}
                              className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                            >
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {bk.generatedBookingId}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-brand-blue-deep">{bk.name}</p>
                              <p className="text-sm font-medium text-slate-500">{bk.phone}</p>
                              {bk.pickupLocation && (
                                <p className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-1 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 w-fit">
                                  <span className="text-slate-400">Pickup:</span> {bk.pickupLocation}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-700">
                                {bk.tripName === "custom" ? "Custom Trip" : bk.tripName}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded">
                                  {bk.persons} Persons
                                </span>
                                {bk.customDestination && (
                                  <span
                                    className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded max-w-[120px] truncate"
                                    title={bk.customDestination}
                                  >
                                    To: {bk.customDestination}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700 text-sm">
                              {bk.travelDate}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={bk.status}
                                onChange={async (e) => {
                                  try {
                                    await updateBookingStatusFn({
                                      data: { adminToken: token, id: bk._id, status: e.target.value },
                                    });
                                    loadData();
                                  } catch (err) {}
                                }}
                                className={`text-sm font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${
                                  bk.status === "Confirmed"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : bk.status === "Cancelled"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={bk.paymentStatus || "PENDING"}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  try {
                                    const res = await updateBookingPaymentStatusFn({
                                      data: {
                                        adminToken: token,
                                        id: bk._id,
                                        paymentStatus: newStatus,
                                      },
                                    });
                                    loadData();
                                    if (newStatus === "PAID") {
                                      if (res?.whatsappSent) {
                                        alert(
                                          "Payment status updated to PAID. Invoice PDF successfully sent to customer via WhatsApp.",
                                        );
                                      } else {
                                        alert(
                                          "Payment status updated to PAID, but WhatsApp invoice could not be sent. Make sure WhatsApp Engine is connected and customer phone number is correct.",
                                        );
                                      }
                                    } else {
                                      alert(`Payment status updated to ${newStatus}.`);
                                    }
                                  } catch (err: any) {
                                    alert(err.message || "Failed to update payment status.");
                                  }
                                }}
                                className={`text-sm font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${
                                  (bk.paymentStatus || "PENDING") === "PAID"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-orange-50 text-orange-700 border-orange-200"
                                }`}
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="PAID">PAID</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {new Date(bk.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setReplyModal({ isOpen: true, booking: bk });
                                    setReplyMessage(`Hi ${bk.name || "Customer"},\nWe received your inquiry regarding the ${bk.tripName === "custom" ? bk.customDestination || "Custom Trip" : bk.tripName || "Trip"}. `);
                                  }}
                                  className="p-2 text-slate-400 hover:text-green-500 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors cursor-pointer"
                                  title="Reply via WhatsApp"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({ isOpen: true, id: bk._id, type: "booking" })
                                  }
                                  className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors cursor-pointer"
                                  title="Delete Booking"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="md:hidden flex flex-col divide-y divide-slate-100">
                      {filteredBookings.map((bk) => (
                        <div key={bk._id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors animate-reveal">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {bk.generatedBookingId}
                              </span>
                              <h4 className="font-bold text-brand-blue-deep text-base mt-1.5">{bk.name}</h4>
                              <a href={`tel:${bk.phone}`} className="text-xs font-semibold text-slate-500 hover:text-brand-blue hover:underline">
                                {bk.phone}
                              </a>
                            </div>
                            <button
                              onClick={() => setDeleteConfirm({ isOpen: true, id: bk._id, type: "booking" })}
                              className="p-2.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-colors"
                              title="Delete Booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trip</span>
                              <p className="font-bold text-slate-700 mt-0.5">
                                {bk.tripName === "custom" ? "Custom Trip" : bk.tripName}
                              </p>
                              {bk.customDestination && (
                                <p className="text-[11px] text-brand-blue font-semibold mt-0.5 truncate" title={bk.customDestination}>
                                  To: {bk.customDestination}
                                </p>
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Travel Date</span>
                              <p className="font-semibold text-slate-700 mt-0.5">{bk.travelDate}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Persons</span>
                              <p className="font-bold text-slate-700 mt-0.5">{bk.persons} Persons</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted</span>
                              <p className="text-slate-500 mt-0.5">{new Date(bk.createdAt).toLocaleDateString()}</p>
                            </div>
                            {bk.pickupLocation && (
                              <div className="col-span-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pickup Point</span>
                                <p className="text-slate-600 font-semibold mt-0.5">{bk.pickupLocation}</p>
                              </div>
                            )}
                          </div>

                          {/* Quick Edit Status / Payment Dropdowns */}
                          <div className="grid grid-cols-2 gap-3 mt-1">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                              <select
                                value={bk.status}
                                onChange={async (e) => {
                                  try {
                                    await updateBookingStatusFn({
                                      data: { adminToken: token, id: bk._id, status: e.target.value },
                                    });
                                    loadData();
                                  } catch (err) {}
                                }}
                                className={`w-full text-xs font-bold px-2 py-2 rounded-lg border outline-none cursor-pointer ${
                                  bk.status === "Confirmed"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : bk.status === "Cancelled"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment</span>
                              <select
                                value={bk.paymentStatus || "PENDING"}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  try {
                                    const res = await updateBookingPaymentStatusFn({
                                      data: {
                                        adminToken: token,
                                        id: bk._id,
                                        paymentStatus: newStatus,
                                      },
                                    });
                                    loadData();
                                    if (newStatus === "PAID") {
                                      if (res?.whatsappSent) {
                                        alert(
                                          "Payment status updated to PAID. Invoice PDF successfully sent to customer via WhatsApp.",
                                        );
                                      } else {
                                        alert(
                                          "Payment status updated to PAID, but WhatsApp invoice could not be sent. Make sure WhatsApp Engine is connected and customer phone number is correct.",
                                        );
                                      }
                                    } else {
                                      alert(`Payment status updated to ${newStatus}.`);
                                    }
                                  } catch (err: any) {
                                    alert(err.message || "Failed to update payment status.");
                                  }
                                }}
                                className={`w-full text-xs font-bold px-2 py-2 rounded-lg border outline-none cursor-pointer ${
                                  (bk.paymentStatus || "PENDING") === "PAID"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-orange-50 text-orange-700 border-orange-200"
                                }`}
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="PAID">PAID</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : activeTab === "customers" ? (
            <CustomersView bookings={bookings} />
          ) : activeTab === "reports" ? (
            <ReportsView bookings={bookings} />
          ) : activeTab === "invoices" ? (
            <InvoicesView bookings={bookings} token={token} loadData={loadData} />
          ) : activeTab === "revenue" ? (
            <RevenueView bookings={bookings} />
          ) : activeTab === "whatsapp" ? (
            <WhatsAppEngineView token={token} />
          ) : activeTab === "blogs" ? (
            <BlogsAdminView
              token={token}
              blogs={customBlogs}
              setDeleteConfirm={setDeleteConfirm}
            />
          ) : null}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Delete</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to delete this {deleteConfirm.type}? This action cannot be
              undone.
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

      {/* Reply via WhatsApp Modal */}
      {replyModal && replyModal.isOpen && replyModal.booking && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-500" /> Reply to {replyModal.booking.name}
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Send a direct WhatsApp message to {replyModal.booking.phone}.
            </p>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue-deep focus:border-brand-blue-deep outline-none resize-none mb-6"
              placeholder="Type your message here..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReplyModal({ isOpen: false, booking: null })}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                disabled={replying}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setReplying(true);
                  try {
                    await sendBookingReplyFn({
                      data: {
                        adminToken: token,
                        id: replyModal.booking._id,
                        message: replyMessage,
                      },
                    });
                    setReplyModal({ isOpen: false, booking: null });
                    alert("Message sent successfully!");
                  } catch (err: any) {
                    alert(err.message || "Failed to send message.");
                  } finally {
                    setReplying(false);
                  }
                }}
                disabled={replying}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Message"}
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
  const [formData, setFormData] = useState<any>(
    initialData || {
      title: "",
      subtitle: "",
      durationBadge: "3D / 2N",
      location: "",
      schedule: "Every Friday",
      frequency: "",
      price: "₹9,999",
      image: "",
      images: [],
      route: "",
      tags: "",
      includes: "",
    },
  );

  const [itinerary, setItinerary] = useState<{ day: string; title: string }[]>(
    Array.isArray(initialData?.itinerary) ? initialData.itinerary : [],
  );

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddItineraryDay = () => {
    const nextDayNum = itinerary.length + 1;
    setItinerary([...itinerary, { day: `Day ${nextDayNum}`, title: "" }]);
  };

  const handleRemoveItineraryDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index);
    setItinerary(updated);
  };

  const handleItineraryChange = (index: number, field: "day" | "title", value: string) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convert comma-separated strings to arrays
    const payload = {
      ...formData,
      itinerary: itinerary
        .map((item) => ({ day: item.day.trim(), title: item.title.trim() }))
        .filter((item) => item.day || item.title),
    };
    if (typeof payload.route === "string")
      payload.route = payload.route
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    if (typeof payload.tags === "string")
      payload.tags = payload.tags
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    if (typeof payload.includes === "string")
      payload.includes = payload.includes
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

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
        route: Array.isArray(initialData.route) ? initialData.route.join(", ") : "",
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : "",
        includes: Array.isArray(initialData.includes) ? initialData.includes.join(", ") : "",
      });
      setItinerary(Array.isArray(initialData.itinerary) ? initialData.itinerary : []);
    }
  }, [initialData]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold font-display text-brand-blue-deep">
          {initialData ? "Edit Package" : "Create New Package"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Pune to Ujjain Mahakal Yatra"
            required
          />
          <Input
            label="Subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            placeholder="e.g. The holy journey"
          />
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Pune"
            required
          />
          <Input
            label="Duration Badge"
            name="durationBadge"
            value={formData.durationBadge}
            onChange={handleChange}
            placeholder="e.g. 3D / 2N"
            required
          />
          <Input
            label="Price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g. ₹9,999"
            required
          />
          <Input
            label="Schedule"
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            placeholder="e.g. Every Friday"
          />
          <div className="md:col-span-2">
            <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Package Images
            </label>
            <div className="flex flex-col gap-4">
              {formData.images && formData.images.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {formData.images.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200"
                    >
                      <img
                        src={img}
                        alt={`Preview ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...formData.images];
                          newImages.splice(idx, 1);
                          setFormData({
                            ...formData,
                            images: newImages,
                            image: newImages[0] || "",
                          });
                        }}
                        className="absolute top-1 right-1 bg-slate-900/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-500 transition-colors shadow-sm"
                      >
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

                    files.forEach((file) => {
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
                <p className="text-xs text-slate-400 mt-2">
                  Upload high-quality images from your device. Images are automatically backed up to
                  Cloudinary.
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <Input
              label="Route (comma separated)"
              name="route"
              value={formData.route}
              onChange={handleChange}
              placeholder="Pune, Omkareshwar, Ujjain"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Tags (comma separated)"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Mahakaleshwar, Bhasma Aarti"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Includes (comma separated)"
              name="includes"
              value={formData.includes}
              onChange={handleChange}
              placeholder="AC Bus, Hotel, Meals"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-4 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                Itinerary (Day by Day)
              </label>
              <button
                type="button"
                onClick={handleAddItineraryDay}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green rounded-xl transition-colors font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                Add Day
              </button>
            </div>

            {itinerary.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">
                No itinerary days added yet. Click "Add Day" to begin.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                {itinerary.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-brand-blue-deep uppercase tracking-wider">
                        Day {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItineraryDay(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-1">
                        <input
                          type="text"
                          placeholder="e.g. Day 1"
                          value={item.day}
                          onChange={(e) => handleItineraryChange(index, "day", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-blue-deep outline-none focus:ring-2 focus:ring-brand-green"
                          required
                        />
                      </div>
                      <div className="md:col-span-3">
                        <textarea
                          placeholder="Describe the plan for this day..."
                          value={item.title}
                          onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                          rows={2}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-brand-green resize-y"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-brand-green/20"
          >
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
      <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
        {label}
      </label>
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
    name: initialData?.name || "",
    schedule: initialData?.schedule || "",
    price: initialData?.price || "",
    image: initialData?.image || "",
    dates: initialData?.dates || [],
    route: Array.isArray(initialData?.route) ? initialData.route.join(", ") : "",
    includes: Array.isArray(initialData?.includes) ? initialData.includes.join(", ") : "",
  });

  const [datesInput, setDatesInput] = useState(
    Array.isArray(initialData?.dates) ? initialData.dates.join(", ") : "",
  );

  const [itinerary, setItinerary] = useState<{ day: string; title: string }[]>(
    Array.isArray(initialData?.itinerary) ? initialData.itinerary : [],
  );

  // Generator states
  const [genMode, setGenMode] = useState<'individual' | 'range'>('individual');
  const [selectedDays, setSelectedDays] = useState<number[]>([5, 6]); // Default Friday, Saturday
  const [rangeStartDay, setRangeStartDay] = useState<number>(5); // Default Friday
  const [rangeEndDay, setRangeEndDay] = useState<number>(0); // Default Sunday
  const [genMonth, setGenMonth] = useState<number>(new Date().getMonth());
  const [genYear, setGenYear] = useState<number>(new Date().getFullYear());
  const [previewDates, setPreviewDates] = useState<string[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isAutoRollover, setIsAutoRollover] = useState<boolean>(false);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateIndividualDates = (year: number, month: number, days: number[]) => {
    const dates: string[] = [];
    const daysInMonth = getDaysInMonth(year, month);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (days.includes(date.getDay())) {
        const dayName = dayNames[date.getDay()];
        const monthName = monthNames[month];
        dates.push(`${dayName} ${day} ${monthName} ${year}`);
      }
    }
    return dates;
  };

  const generateRangeDates = (year: number, month: number, startDay: number, endDay: number) => {
    const dates: string[] = [];
    const daysInMonth = getDaysInMonth(year, month);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === startDay) {
        let endDayOffset = (endDay - startDay + 7) % 7;
        if (endDayOffset === 0) endDayOffset = 7;
        
        const endDate = new Date(year, month, day + endDayOffset);
        
        const startDayName = dayNames[startDay];
        const startMonthName = monthNames[month];
        
        const endDayName = dayNames[endDay];
        const endMonthName = monthNames[endDate.getMonth()];
        
        dates.push(`${startDayName} ${day} ${startMonthName} to ${endDayName} ${endDate.getDate()} ${endMonthName} ${endDate.getFullYear()}`);
      }
    }
    return dates;
  };

  useEffect(() => {
    if (genMode === 'individual') {
      const dates = generateIndividualDates(genYear, genMonth, selectedDays);
      setPreviewDates(dates);
    } else {
      const dates = generateRangeDates(genYear, genMonth, rangeStartDay, rangeEndDay);
      setPreviewDates(dates);
    }
  }, [genMode, selectedDays, rangeStartDay, rangeEndDay, genMonth, genYear]);

  const handleAppendDates = () => {
    if (previewDates.length === 0) return;
    const current = datesInput.split(',').map((s: string) => s.trim()).filter(Boolean);
    const merged = [...current];
    previewDates.forEach(d => {
      if (!merged.includes(d)) {
        merged.push(d);
      }
    });
    setDatesInput(merged.join(', '));
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddItineraryDay = () => {
    const nextDayNum = itinerary.length + 1;
    setItinerary([...itinerary, { day: `Day ${nextDayNum}`, title: "" }]);
  };

  const handleRemoveItineraryDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index);
    setItinerary(updated);
  };

  const handleItineraryChange = (index: number, field: "day" | "title", value: string) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      dates: datesInput
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      route:
        typeof formData.route === "string"
          ? formData.route
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
      includes:
        typeof formData.includes === "string"
          ? formData.includes
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
      itinerary: itinerary
        .map((item) => ({ day: item.day.trim(), title: item.title.trim() }))
        .filter((item) => item.day || item.title),
      recurringPattern: {
        active: isAutoRollover,
        mode: genMode,
        days: selectedDays,
        startDay: rangeStartDay,
        endDay: rangeEndDay,
      },
    };

    try {
      if (initialData?._id) {
        await updateTripOptionFn({
          data: { adminToken: token, id: initialData._id, data: payload },
        });
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
        name: initialData.name || "",
        schedule: initialData.schedule || "",
        price: initialData.price || "",
        image: initialData.image || "",
        dates: initialData.dates || [],
        route: Array.isArray(initialData.route) ? initialData.route.join(", ") : "",
        includes: Array.isArray(initialData.includes) ? initialData.includes.join(", ") : "",
      });
      setDatesInput(Array.isArray(initialData.dates) ? initialData.dates.join(", ") : "");
      setItinerary(Array.isArray(initialData.itinerary) ? initialData.itinerary : []);
      
      // Load recurring pattern settings if present
      if (initialData.recurringPattern) {
        setIsAutoRollover(!!initialData.recurringPattern.active);
        setGenMode(initialData.recurringPattern.mode || 'individual');
        if (Array.isArray(initialData.recurringPattern.days)) {
          setSelectedDays(initialData.recurringPattern.days);
        }
        if (typeof initialData.recurringPattern.startDay === 'number') {
          setRangeStartDay(initialData.recurringPattern.startDay);
        }
        if (typeof initialData.recurringPattern.endDay === 'number') {
          setRangeEndDay(initialData.recurringPattern.endDay);
        }
        // If it was already active, show the generator open by default so they can configure it easily
        if (initialData.recurringPattern.active) {
          setShowGenerator(true);
        }
      } else {
        setIsAutoRollover(false);
      }
    }
  }, [initialData]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-reveal p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg transition-colors"
        >
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
            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
              Cover Image
            </label>
            <div className="flex items-center gap-4">
              {formData.image && (
                <div className="relative w-24 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="absolute top-1 right-1 bg-slate-900/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-500 transition-colors shadow-sm"
                  >
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
          <div className="flex flex-col gap-2">
            <Input
              label="Available Dates (comma separated)"
              name="dates"
              value={datesInput}
              onChange={(e: any) => setDatesInput(e.target.value)}
              placeholder="e.g. Sat 12 june to 13 june, 19 june to 20 june, 25 june to 26 june"
            />
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setShowGenerator(!showGenerator)}
                className="text-xs font-bold text-brand-blue hover:text-brand-blue-deep flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/5 hover:bg-brand-blue/10 rounded-xl transition-all border border-brand-blue/15 mt-1 cursor-pointer"
              >
                <span>📅 {showGenerator ? "Hide Recurring Date Generator" : "Use Recurring Date Generator"}</span>
              </button>
            </div>

            {showGenerator && (
              <div className="mt-2 p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-4 animate-reveal">
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-sm text-brand-blue-deep flex items-center gap-1.5">
                    <span>📅 Recurring Date Generator</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Select recurring days of the week, target month, and year to automatically generate dates.</p>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <input
                    type="checkbox"
                    id="autoRolloverCheckbox"
                    checked={isAutoRollover}
                    onChange={(e) => setIsAutoRollover(e.target.checked)}
                    className="w-5 h-5 text-brand-green border-slate-300 rounded focus:ring-brand-green accent-brand-green mt-0.5 cursor-pointer"
                  />
                  <div className="flex flex-col gap-1">
                    <label htmlFor="autoRolloverCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1.5">
                      🔄 Enable Dynamic Auto-Rollover for this trip option
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium font-sans">
                      When enabled, the website will dynamically generate and display travel dates for the current and next month based on the settings below. This ensures there are always active dates for customers to choose from, without requiring manual monthly updates.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Recurrence Mode</label>
                    <div className="flex gap-2 p-1 bg-slate-200/60 rounded-xl w-fit">
                      <button
                        type="button"
                        onClick={() => setGenMode("individual")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          genMode === "individual"
                            ? "bg-white text-brand-blue-deep shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Individual Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenMode("range")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          genMode === "range"
                            ? "bg-white text-brand-blue-deep shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Weekly Ranges
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Target Schedule</label>
                    {genMode === "individual" ? (
                      <div className="flex flex-wrap gap-1.5">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => {
                          const isSelected = selectedDays.includes(idx);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedDays(selectedDays.filter((d) => d !== idx));
                                } else {
                                  setSelectedDays([...selectedDays, idx]);
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                isSelected
                                  ? "bg-brand-green border-brand-green text-white shadow-sm shadow-brand-green/20"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {dayName}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-[10px] font-bold text-slate-500 font-sans">From</span>
                          <select
                            value={rangeStartDay}
                            onChange={(e) => setRangeStartDay(Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-brand-blue-deep focus:outline-none cursor-pointer"
                          >
                            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d, i) => (
                              <option key={i} value={i}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-[10px] font-bold text-slate-500 font-sans">To</span>
                          <select
                            value={rangeEndDay}
                            onChange={(e) => setRangeEndDay(Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-brand-blue-deep focus:outline-none cursor-pointer"
                          >
                            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d, i) => (
                              <option key={i} value={i}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Month</label>
                      <select
                        value={genMonth}
                        onChange={(e) => setGenMonth(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-brand-blue-deep focus:outline-none cursor-pointer w-full"
                      >
                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                          <option key={i} value={i}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Year</label>
                      <select
                        value={genYear}
                        onChange={(e) => setGenYear(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-brand-blue-deep focus:outline-none cursor-pointer w-full"
                      >
                        {[new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Generated Dates Preview ({previewDates.length})</label>
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 max-h-[85px] overflow-y-auto text-[11px] font-semibold text-slate-600 flex flex-wrap gap-1">
                      {previewDates.length === 0 ? (
                        <span className="text-slate-400 italic font-sans font-medium">No dates generated</span>
                      ) : (
                        previewDates.map((d, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200/50">
                            {d}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={previewDates.length === 0}
                    onClick={handleAppendDates}
                    className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-brand-green/10"
                  >
                    <span>Append Generated Dates</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <Input
            label="Route (comma separated)"
            name="route"
            value={formData.route}
            onChange={handleChange}
            placeholder="e.g. Pune, Omkareshwar, Ujjain, Pune"
          />
          <Input
            label="Includes (comma separated)"
            name="includes"
            value={formData.includes}
            onChange={handleChange}
            placeholder="e.g. AC Bus, Hotel Stay, VIP Darshan, Meals"
          />

          <div className="flex flex-col gap-4 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                Itinerary (Day by Day)
              </label>
              <button
                type="button"
                onClick={handleAddItineraryDay}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green rounded-xl transition-colors font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                Add Day
              </button>
            </div>

            {itinerary.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">
                No itinerary days added yet. Click "Add Day" to begin.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                {itinerary.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-brand-blue-deep uppercase tracking-wider">
                        Day {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItineraryDay(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-1">
                        <input
                          type="text"
                          placeholder="e.g. Day 1"
                          value={item.day}
                          onChange={(e) => handleItineraryChange(index, "day", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-blue-deep outline-none focus:ring-2 focus:ring-brand-green"
                          required
                        />
                      </div>
                      <div className="md:col-span-3">
                        <textarea
                          placeholder="Describe the plan for this day..."
                          value={item.title}
                          onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                          rows={2}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-brand-green resize-y"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-brand-green/20"
          >
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
  const [imageUrl, setImageUrl] = useState("");

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
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold font-display text-brand-blue-deep">Add New Photo</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
            Upload Photo
          </label>
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
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
              onLoad={(e) => (e.currentTarget.style.display = "block")}
            />
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !imageUrl}
            className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-brand-green/20"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Add Photo
          </button>
        </div>
      </form>
    </div>
  );
}

function DashboardOverview({ packages, bookings, reviews, photos }: any) {
  const pendingBookings = bookings.filter((b: any) => b.status === "Pending").length;

  return (
    <div className="flex flex-col gap-8 animate-reveal">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Total Bookings
            </p>
            <p className="text-3xl font-display font-bold text-brand-blue-deep">
              {bookings.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-3xl font-display font-bold text-brand-blue-deep">
              {pendingBookings}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Packages</p>
            <p className="text-3xl font-display font-bold text-brand-blue-deep">
              {packages.length}
            </p>
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
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">
            No bookings yet.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
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
                    <tr
                      key={bk._id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-brand-blue-deep text-sm">{bk.name}</p>
                        <p className="text-xs text-slate-500">{bk.phone}</p>
                        {bk.pickupLocation && (
                          <p className="text-[11px] text-slate-600 font-medium mt-1">
                            <span className="text-slate-400">Pickup:</span> {bk.pickupLocation}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 text-sm">
                          {bk.tripName === "custom" ? "Custom Trip" : bk.tripName}
                        </p>
                        <p className="text-xs text-slate-500">{bk.persons} Persons</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                            bk.status === "Confirmed"
                              ? "bg-green-50 text-green-700"
                              : bk.status === "Cancelled"
                                ? "bg-red-50 text-red-700"
                                : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
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
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {bookings.slice(0, 5).map((bk: any) => (
                <div key={bk._id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-blue-deep text-sm truncate">{bk.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{bk.phone}</p>
                    <p className="text-xs font-semibold text-slate-600 mt-1 truncate">
                      {bk.tripName === "custom" ? "Custom Trip" : bk.tripName}
                      {bk.persons ? ` · ${bk.persons} persons` : ""}
                    </p>
                    {bk.pickupLocation && (
                      <p className="text-[11px] text-slate-500 mt-0.5">📍 {bk.pickupLocation}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bk.status === "Confirmed"
                          ? "bg-green-50 text-green-700"
                          : bk.status === "Cancelled"
                            ? "bg-red-50 text-red-700"
                            : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {bk.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(bk.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CustomersView({ bookings = [] }: { bookings?: any[] }) {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  try {
    const customersMap = new globalThis.Map();
    (bookings || []).forEach((bk) => {
      if (!bk) return;
      const phone = bk.phone || "Unknown";
      if (!customersMap.has(phone)) {
        customersMap.set(phone, {
          name: bk.name || "Unknown",
          phone: phone,
          totalBookings: 1,
          latestBookingDate: bk.createdAt,
          firstBookingDate: bk.createdAt,
          allTrips: [
            {
              name:
                bk.tripName === "custom"
                  ? `Custom Trip${bk.customDestination ? ` to ${bk.customDestination}` : ""}`
                  : bk.tripName || "Unknown",
              date:
                bk.travelDate ||
                (bk.createdAt ? new Date(bk.createdAt).toLocaleDateString() : "Unknown Date"),
            },
          ],
        });
      } else {
        const cust = customersMap.get(phone);
        if (cust) {
          cust.totalBookings += 1;
          const currentLatest = cust.latestBookingDate
            ? new Date(cust.latestBookingDate).getTime()
            : 0;
          const currentFirst = cust.firstBookingDate
            ? new Date(cust.firstBookingDate).getTime()
            : Infinity;
          const newDate = bk.createdAt ? new Date(bk.createdAt).getTime() : 0;
          if (newDate > currentLatest) {
            cust.latestBookingDate = bk.createdAt;
          }
          if (newDate > 0 && newDate < currentFirst) {
            cust.firstBookingDate = bk.createdAt;
          }
          cust.allTrips.push({
            name:
              bk.tripName === "custom"
                ? `Custom Trip${bk.customDestination ? ` to ${bk.customDestination}` : ""}`
                : bk.tripName || "Unknown",
            date:
              bk.travelDate ||
              (bk.createdAt ? new Date(bk.createdAt).toLocaleDateString() : "Unknown Date"),
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
      cust.customerId = `cus-${String(index + 1).padStart(5, "0")}`;
    });

    // Reverse so newest customers appear at the top
    let displayCustomers = [...sortedCustomers].reverse();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      displayCustomers = displayCustomers.filter(
        (cust) =>
          (cust.name && cust.name.toLowerCase().includes(q)) ||
          (cust.customerId && cust.customerId.toLowerCase().includes(q)) ||
          (cust.phone && cust.phone.toLowerCase().includes(q)),
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
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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
                      <tr
                        key={i}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
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
                          {cust.latestBookingDate
                            ? new Date(cust.latestBookingDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden flex flex-col divide-y divide-slate-100">
                {displayCustomers.map((cust: any, i) => (
                  <div key={i} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {cust.customerId}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {cust.totalBookings} booking{cust.totalBookings !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="font-bold text-brand-blue-deep text-sm truncate">{cust.name}</p>
                      <a href={`tel:${cust.phone}`} className="text-xs text-slate-500 hover:text-brand-blue hover:underline">
                        {cust.phone}
                      </a>
                      {cust.latestBookingDate && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Last: {new Date(cust.latestBookingDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue-deep rounded-xl transition-colors font-bold text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Trips
                    </button>
                  </div>
                ))}
              </div>
            </>
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
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors self-start"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {selectedCustomer.allTrips?.map((trip: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl"
                  >
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

const applyTableStyles = (XLSX: any, ws: any, titleSz = 16, subtitleSz = 14) => {
  if (ws["A1"])
    ws["A1"].s = {
      font: { bold: true, sz: titleSz, color: { rgb: "1A237E" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: false },
      fill: { patternType: "solid", fgColor: { rgb: "E8EAF6" } },
    };
  if (ws["A2"])
    ws["A2"].s = {
      font: { bold: true, sz: subtitleSz, color: { rgb: "333333" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: false },
    };

  if (ws["!ref"]) {
    const range = XLSX.utils.decode_range(ws["!ref"]);
    // Set row heights: title row, subtitle row, blank row, header row
    ws["!rows"] = ws["!rows"] || [];
    ws["!rows"][0] = { hpt: 28 }; // Title row height
    ws["!rows"][1] = { hpt: 22 }; // Subtitle row height
    ws["!rows"][2] = { hpt: 6 };  // Blank spacer row
    ws["!rows"][3] = { hpt: 20 }; // Header row height

    for (let R = 3; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) ws[cellAddress] = { t: "s", v: "" };

        const isHeader = R === 3;
        ws[cellAddress].s = {
          border: {
            top: { style: "thin", color: { auto: 1 } },
            bottom: { style: "thin", color: { auto: 1 } },
            left: { style: "thin", color: { auto: 1 } },
            right: { style: "thin", color: { auto: 1 } },
          },
          alignment: { vertical: "center", wrapText: !isHeader },
          font: isHeader
            ? { bold: true, sz: 10, color: { rgb: "FFFFFF" } }
            : { sz: 9 },
          fill: isHeader ? { patternType: "solid", fgColor: { rgb: "1E3A8A" } } : undefined,
        };
      }
    }
  }
};

function ReportsView({ bookings = [] }: { bookings?: any[] }) {
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [dateFilterType, setDateFilterType] = React.useState<"all" | "custom" | "created" | "travel">("created");

  const exportBookings = async () => {
    const XLSX = await import('xlsx-js-style/dist/xlsx.bundle.js');
    let targetBookings = bookings;

    // Quick filters: All / Custom
    if (dateFilterType === "all") {
      // No filtering — export everything
    } else if (dateFilterType === "custom") {
      targetBookings = targetBookings.filter((bk) => bk.tripName === "custom");
    } else if (startDate || endDate) {
      targetBookings = targetBookings.filter((bk) => {
        if (dateFilterType === "created") {
          if (!bk.createdAt) return false;
          const bkDate = new Date(bk.createdAt);
          bkDate.setHours(0, 0, 0, 0);

          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (bkDate < start) return false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (bkDate > end) return false;
          }
          return true;
        } else {
          if (!bk.travelDate) return false;
          const tDate = new Date(bk.travelDate);
          if (isNaN(tDate.getTime())) return false;

          tDate.setHours(0, 0, 0, 0);
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (tDate < start) return false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (tDate > end) return false;
          }
          return true;
        }
      });
    }

    if (targetBookings.length === 0) {
      alert("No bookings found in this date range.");
      return;
    }

    const headers = [
      "Booking ID",
      "Cus_Name",
      "Contact",
      "Trip Name",
      "Persons",
      "Travel Date",
      "Status",
      "Sub date",
      "Pickup Point",
      "Custom Dest",
    ];

    const getBookingIndex = (bk: any) => {
      const match = (bk.generatedBookingId || "").match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    };

    const sortedTarget = [...targetBookings].sort((a, b) => {
      const idxA = getBookingIndex(a);
      const idxB = getBookingIndex(b);
      if (idxA !== idxB) return idxA - idxB;
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    });

    const rows = sortedTarget.map((bk, idx) => {
      const bId = bk.generatedBookingId;
      const phoneStr = (bk.phone || "").replace(/[\r\n]+/g, " ");
      const dateStr = bk.createdAt ? new Date(bk.createdAt).toLocaleDateString() : "";
      const custom = bk.invoiceCustomData || {};
      const pickupPoint = custom.pickupPoint || bk.pickupLocation || bk.pickupPoint || "Pune";
      return [
        bId,
        (bk.name || "").replace(/[\r\n]+/g, " "),
        phoneStr,
        (bk.tripName === "custom" ? "Custom Trip" : bk.tripName || "").replace(/[\r\n]+/g, " "),
        bk.persons || "",
        (bk.travelDate || "").replace(/[\r\n]+/g, " "),
        bk.status || "",
        dateStr,
        pickupPoint.replace(/[\r\n]+/g, " "),
        (bk.customDestination || "").replace(/[\r\n]+/g, " "),
      ];
    });

    let reportTitle = "Booking Report";
    if (dateFilterType === "all") {
      reportTitle = "Booking Report: All Bookings";
    } else if (dateFilterType === "custom") {
      reportTitle = "Booking Report for Custom Trips";
    } else if (dateFilterType === "created") {
      const startStr = startDate ? new Date(startDate).toLocaleDateString("en-GB") : "";
      const endStr = endDate ? new Date(endDate).toLocaleDateString("en-GB") : "";
      if (startStr && endStr) {
        reportTitle = `Booking Report: Submission Date from ${startStr} to ${endStr}`;
      } else if (startStr) {
        reportTitle = `Booking Report: Submission Date starting ${startStr}`;
      } else if (endStr) {
        reportTitle = `Booking Report: Submission Date ending ${endStr}`;
      } else {
        reportTitle = "Booking Report: Filter by Submission Date";
      }
    } else if (dateFilterType === "travel") {
      const startStr = startDate ? new Date(startDate).toLocaleDateString("en-GB") : "";
      const endStr = endDate ? new Date(endDate).toLocaleDateString("en-GB") : "";
      if (startStr && endStr) {
        reportTitle = `Booking Report: Travel Date from ${startStr} to ${endStr}`;
      } else if (startStr) {
        reportTitle = `Booking Report: Travel Date starting ${startStr}`;
      } else if (endStr) {
        reportTitle = `Booking Report: Travel Date ending ${endStr}`;
      } else {
        reportTitle = "Booking Report: Filter by Travel Date";
      }
    }

    const ws = XLSX.utils.aoa_to_sheet([
      ["SHAILRAJ TRAVELS PUNE"],
      [reportTitle],
      [],
      headers,
      ...rows,
    ]);

    applyTableStyles(XLSX, ws);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    ];

    ws["!cols"] = [
      { wch: 9  }, // Booking ID
      { wch: 14 }, // Cus_Name
      { wch: 11 }, // Contact
      { wch: 16 }, // Trip Name
      { wch: 7  }, // Persons
      { wch: 11 }, // Travel Date
      { wch: 9  }, // Status
      { wch: 11 }, // Sub date
      { wch: 14 }, // Pickup Point
      { wch: 15 }, // Custom Dest
    ];

    ws["!fitToPage"] = true;
    ws["!pageSetup"] = {
      orientation: "landscape",
      fitToWidth: 1,
      fitToHeight: 0,
    };
    ws["!margins"] = {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    } as any;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, `bookings_report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportCustomers = async () => {
    const XLSX = await import('xlsx-js-style/dist/xlsx.bundle.js');
    const customersMap = new globalThis.Map();
    (bookings || []).forEach((bk) => {
      if (!bk) return;
      const phone = bk.phone || "Unknown";
      if (!customersMap.has(phone)) {
        customersMap.set(phone, {
          name: bk.name || "Unknown",
          phone: phone,
          totalBookings: 1,
          firstBookingDate: bk.createdAt,
          latestBookingDate: bk.createdAt,
          allTrips: new Set([bk.tripName === "custom" ? "Custom Trip" : bk.tripName || "Unknown"]),
        });
      } else {
        const cust = customersMap.get(phone);
        if (cust) {
          cust.totalBookings += 1;
          const currentLatest = cust.latestBookingDate
            ? new Date(cust.latestBookingDate).getTime()
            : 0;
          const currentFirst = cust.firstBookingDate
            ? new Date(cust.firstBookingDate).getTime()
            : Infinity;
          const newDate = bk.createdAt ? new Date(bk.createdAt).getTime() : 0;
          if (newDate > currentLatest) cust.latestBookingDate = bk.createdAt;
          if (newDate > 0 && newDate < currentFirst) cust.firstBookingDate = bk.createdAt;
          cust.allTrips.add(bk.tripName === "custom" ? "Custom Trip" : bk.tripName || "Unknown");
        }
      }
    });

    const sortedCustomers = Array.from(customersMap.values()).sort((a, b) => {
      const timeA = a.firstBookingDate ? new Date(a.firstBookingDate).getTime() : 0;
      const timeB = b.firstBookingDate ? new Date(b.firstBookingDate).getTime() : 0;
      return timeA - timeB;
    });

    sortedCustomers.forEach((cust, index) => {
      cust.customerId = `cus-${String(index + 1).padStart(5, "0")}`;
    });

    const displayCustomers = [...sortedCustomers].reverse();

    const headers = [
      "Customer ID",
      "Cus_Name",
      "Contact",
      "Total Bookings",
      "First Booking Date",
      "Latest Booking Date",
      "Trips Taken",
    ];

    const rows = displayCustomers.map((cust: any) => {
      const tripsStr = Array.from(cust.allTrips).join("; ");
      const phoneStr = (cust.phone || "").replace(/[\r\n]+/g, " ");
      const firstDateStr = cust.firstBookingDate
        ? new Date(cust.firstBookingDate).toLocaleDateString()
        : "N/A";
      const lastDateStr = cust.latestBookingDate
        ? new Date(cust.latestBookingDate).toLocaleDateString()
        : "N/A";

      return [
        cust.customerId,
        (cust.name || "").replace(/[\r\n]+/g, " "),
        phoneStr,
        cust.totalBookings,
        firstDateStr,
        lastDateStr,
        tripsStr.replace(/[\r\n]+/g, " "),
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([
      ["SHAILRAJ TRAVELS PUNE"],
      ["Customer Report"],
      [],
      headers,
      ...rows,
    ]);

    applyTableStyles(XLSX, ws);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    ];

    ws["!cols"] = [
      { wch: 11 }, // Customer ID
      { wch: 18 }, // Customer Name
      { wch: 12 }, // Phone Number
      { wch: 13 }, // Total Bookings
      { wch: 14 }, // First Booking Date
      { wch: 14 }, // Latest Booking Date
      { wch: 35 }, // Trips Taken
    ];
    ws["!fitToPage"] = true;
    ws["!pageSetup"] = {
      orientation: "landscape",
      fitToWidth: 1,
      fitToHeight: 0,
    };
    ws["!margins"] = {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    } as any;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `customers_report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const groupsMap = new globalThis.Map<string, any[]>();
  (bookings || []).forEach((bk) => {
    if (bk.tripName && bk.tripName !== "custom") {
      const key = `${bk.tripName} (${bk.travelDate || "No Date"})`;
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key)!.push(bk);
    }
  });
  const tripGroups = Array.from(groupsMap.entries());

  const [selectedTripGroup, setSelectedTripGroup] = React.useState<string>("");

  React.useEffect(() => {
    if (tripGroups.length > 0 && !selectedTripGroup) {
      setSelectedTripGroup(tripGroups[0][0]);
    }
  }, [tripGroups, selectedTripGroup]);

  const exportSpecificTrip = async () => {
    if (!selectedTripGroup) return;
    const XLSX = await import('xlsx-js-style/dist/xlsx.bundle.js');
    const group = tripGroups.find((g) => g[0] === selectedTripGroup);
    if (!group) return;

    const [groupName, groupBks] = group;
    const headers = [
      "Booking ID",
      "Cus_Name",
      "Contact",
      "Trip Name",
      "Persons",
      "Travel Date",
      "Status",
      "Sub date",
      "Pickup Point",
    ];

    const getBookingIndex = (bk: any) => {
      const match = (bk.generatedBookingId || "").match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    };

    const sortedGroupBks = [...groupBks].sort((a, b) => {
      const idxA = getBookingIndex(a);
      const idxB = getBookingIndex(b);
      if (idxA !== idxB) return idxA - idxB;
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    });

    const rows = sortedGroupBks.map((bk: any) => {
      const bId = bk.generatedBookingId;
      const phoneStr = (bk.phone || "").replace(/[\r\n]+/g, " ");
      const dateStr = bk.createdAt ? new Date(bk.createdAt).toLocaleDateString() : "";
      const custom = bk.invoiceCustomData || {};
      const pickupPoint = custom.pickupPoint || bk.pickupLocation || bk.pickupPoint || "Pune";
      return [
        bId,
        (bk.name || "").replace(/[\r\n]+/g, " "),
        phoneStr,
        (bk.tripName === "custom" ? "Custom Trip" : bk.tripName || "").replace(/[\r\n]+/g, " "),
        bk.persons || "",
        (bk.travelDate || "").replace(/[\r\n]+/g, " "),
        bk.status || "",
        dateStr,
        pickupPoint.replace(/[\r\n]+/g, " "),
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([
      ["SHAILRAJ TRAVELS PUNE"],
      [`Booking Report: ${groupName}`],
      [],
      headers,
      ...rows,
    ]);

    applyTableStyles(XLSX, ws);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    ];

    ws["!cols"] = [
      { wch: 9  }, // Booking ID
      { wch: 15 }, // Customer Name
      { wch: 11 }, // Phone Number
      { wch: 18 }, // Trip Name
      { wch: 7  }, // Persons
      { wch: 12 }, // Travel Date
      { wch: 9  }, // Status
      { wch: 11 }, // Submission Date
      { wch: 14 }, // Pickup Location
    ];
    ws["!fitToPage"] = true;
    ws["!pageSetup"] = {
      orientation: "landscape",
      fitToWidth: 1,
      fitToHeight: 0,
    };
    ws["!margins"] = {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    } as any;

    const wb = XLSX.utils.book_new();
    const safeSheetName = groupName.replace(/[\\/*?:\[\]]/g, "").substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);

    const safeFileName = groupName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    XLSX.writeFile(
      wb,
      `trip_report_${safeFileName}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-reveal">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center mb-4">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-brand-blue-deep mb-2">Bookings Report</h3>
        <p className="text-slate-500 text-sm mb-4 max-w-xs">
          Download an Excel spreadsheet of your trip bookings.
        </p>

        <div className="w-full max-w-xs mb-4 text-left flex flex-col gap-2">
          <select
            value={dateFilterType}
            onChange={(e) => setDateFilterType(e.target.value as any)}
            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none"
          >
            <option value="all">All Bookings</option>
            <option value="custom">Custom Trip Bookings</option>
            <option value="created">Filter by Submission Date</option>
            <option value="travel">Filter by Travel Date</option>
          </select>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-bold ml-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-bold ml-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={exportBookings}
          className="w-full max-w-xs bg-brand-blue-deep hover:bg-brand-blue text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-blue/20 mt-auto"
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
          {tripGroups.map((g) => (
            <option key={g[0]} value={g[0]}>
              {g[0]} ({g[1].length} bookings)
            </option>
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
                <td className="p-4 font-medium text-slate-800 whitespace-nowrap">{log.action}</td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 text-xs">
                    {log.entityType}
                  </span>
                </td>
                <td className="p-4 pr-6 text-slate-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { InvoicePrint } from '@/frontend/shared/components/InvoicePrint';

function InvoicesView({
  bookings,
  token,
  loadData,
}: {
  bookings: any[];
  token: string | null;
  loadData: (t?: string) => Promise<void>;
}) {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter for confirmed bookings
  let generatedInvoices = bookings.filter((b) => b.status === "Confirmed");

  // Sort them chronologically by createdAt so older bookings get smaller IDs
  generatedInvoices.sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
  );

  // Assign sequential invoice ID
  generatedInvoices = generatedInvoices.map((bk, idx) => {
    const index = idx + 1;
    const letter = String.fromCharCode(65 + ((index - 1) % 26));
    const padded = String(index).padStart(4, "0");
    // Use custom invoice number if already locked/saved
    const customNo = bk.invoiceCustomData?.invoiceNo;
    return { ...bk, generatedInvoiceNo: customNo || `INV-${letter}${padded}` };
  });

  // Reverse so newest are shown first
  generatedInvoices.reverse();

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    generatedInvoices = generatedInvoices.filter((bk) => {
      const invoiceNo = bk.generatedInvoiceNo;
      const custom = bk.invoiceCustomData || {};
      const customerName = custom.customerName || bk.customerName || bk.name || "";
      return invoiceNo.toLowerCase().includes(q) || customerName.toLowerCase().includes(q);
    });
  }

  const selectedBooking = generatedInvoices.find((b) => b._id === selectedBookingId);

  if (selectedBookingId && selectedBooking) {
    return (
      <div className="animate-reveal">
        <div className="no-print flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setSelectedBookingId(null)}
            className="text-brand-blue-deep flex items-center font-bold hover:underline"
          >
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
            <p className="text-sm">
              Invoices are automatically generated for all confirmed bookings.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
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
                    const isCustomUnlocked = bk.tripName === "custom" && !bk.isInvoiceLocked;
                    const rate =
                      custom.rate !== undefined
                        ? Number(custom.rate)
                        : bk.tripName === "custom"
                          ? 0
                          : bk.defaultRate || 6000;
                    const persons =
                      custom.persons !== undefined ? Number(custom.persons) : Number(bk.persons) || 1;
                    const total = rate * persons;
                    const customerName = custom.customerName || bk.customerName || bk.name || "";
                    const tripName = custom.packageName || bk.packageName || bk.tripName || "";

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
                          {(() => {
                            const d = new Date(bk.travelDate);
                            return isNaN(d.getTime())
                              ? String(bk.travelDate || "")
                              : d.toLocaleDateString();
                          })()}
                        </td>
                        <td className="px-6 py-4 font-bold text-brand-green-dark">
                          {isCustomUnlocked ? (
                            <span className="text-slate-400 italic text-sm">On Request</span>
                          ) : (
                            `₹ ${total.toLocaleString()}`
                          )}
                        </td>
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

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {generatedInvoices.map((bk) => {
                const custom = bk.invoiceCustomData || {};
                const invoiceNo = bk.generatedInvoiceNo;
                const isCustomUnlocked = bk.tripName === "custom" && !bk.isInvoiceLocked;
                const rate =
                  custom.rate !== undefined
                    ? Number(custom.rate)
                    : bk.tripName === "custom"
                      ? 0
                      : bk.defaultRate || 6000;
                const persons =
                  custom.persons !== undefined ? Number(custom.persons) : Number(bk.persons) || 1;
                const total = rate * persons;
                const customerName = custom.customerName || bk.customerName || bk.name || "";
                const tripName = custom.packageName || bk.packageName || bk.tripName || "";
                const travelDateStr = (() => {
                  const d = new Date(bk.travelDate);
                  return isNaN(d.getTime()) ? String(bk.travelDate || "") : d.toLocaleDateString();
                })();

                return (
                  <div key={bk._id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-brand-blue-deep">{invoiceNo}</span>
                        {bk.isInvoiceLocked && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded">
                            <Lock size={9} className="text-slate-300" /> Locked
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-800 text-sm truncate">{customerName}</p>
                      <p className="text-xs text-slate-500 truncate">{tripName}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{travelDateStr}</p>
                      <p className={`text-sm font-bold mt-1 ${isCustomUnlocked ? "text-slate-400 italic" : "text-brand-green-dark"}`}>
                        {isCustomUnlocked ? "On Request" : `₹ ${total.toLocaleString()}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedBookingId(bk._id)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green-dark rounded-xl transition-colors font-bold text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

const ChartXAxisTick = ({ x, y, payload }: any) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="#64748b"
        style={{ fontSize: "11px", fontWeight: 600 }}
      >
        <tspan className="hidden sm:inline">{payload.value}</tspan>
        <tspan className="inline sm:hidden">{payload.value[0]}</tspan>
      </text>
    </g>
  );
};

function RevenueView({ bookings }: { bookings: any[] }) {
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "7days" | "30days">("all");
  const [yearFilter, setYearFilter] = useState<"thisYear" | "lastYear" | "all">("thisYear");

  const getBookingRevenue = (bk: any) => {
    const custom = bk.invoiceCustomData || {};
    if (bk.tripName === "custom" && !bk.isInvoiceLocked) {
      return 0;
    }
    const rate = custom.rate !== undefined ? Number(custom.rate) : bk.defaultRate || 6000;
    const persons = custom.persons !== undefined ? Number(custom.persons) : Number(bk.persons) || 1;
    return rate * persons;
  };

  const formatYAxis = (value: number) => {
    if (value === 0) return "₹ 0";
    if (value >= 100000) {
      return `₹ ${(value / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    }
    if (value >= 1000) {
      return `₹ ${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    }
    return `₹ ${value}`;
  };

  const formatBarLabel = (value: number) => {
    if (value === 0) return "";
    if (value >= 100000) {
      return `₹ ${(value / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    }
    if (value >= 1000) {
      return `₹ ${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    }
    return `₹ ${value}`;
  };

  // Get monthly data for the selected year
  const currentYear = new Date().getFullYear();
  const targetYear = yearFilter === "thisYear" ? currentYear : yearFilter === "lastYear" ? currentYear - 1 : null;
  const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const chartData = monthsShort.map((month, index) => {
    const monthBookings = bookings.filter((b) => {
      if (b.status !== "Confirmed") return false;
      const d = b.createdAt ? new Date(b.createdAt) : new Date();
      if (isNaN(d.getTime())) return false;
      
      const isMonthMatch = d.getMonth() === index;
      const isYearMatch = targetYear ? d.getFullYear() === targetYear : true;
      return isMonthMatch && isYearMatch;
    });
    
    const revenue = monthBookings.reduce((sum, b) => sum + getBookingRevenue(b), 0);
    return {
      name: month,
      revenue,
    };
  });

  // Filter bookings based on selected period
  const filteredBookings = bookings.filter((b) => {
    if (timeFilter === "all") return true;

    const d = b.createdAt ? new Date(b.createdAt) : new Date();
    if (isNaN(d.getTime())) return false;

    const now = new Date();
    const diffTime = now.getTime() - d.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (timeFilter === "today") return diffDays <= 1;
    if (timeFilter === "7days") return diffDays <= 7;
    if (timeFilter === "30days") return diffDays <= 30;
    return true;
  });

  const confirmedBookings = filteredBookings.filter((b) => b.status === "Confirmed");
  const confirmedRevenue = confirmedBookings.reduce((sum, b) => sum + getBookingRevenue(b), 0);

  const pendingBookings = filteredBookings.filter((b) => b.status === "Pending");
  const pendingRevenue = pendingBookings.reduce((sum, b) => sum + getBookingRevenue(b), 0);

  const totalPotentialRevenue = confirmedRevenue + pendingRevenue;
  const activeBookingsCount = confirmedBookings.length + pendingBookings.length;
  const averageBookingRevenue = confirmedBookings.length > 0 ? confirmedRevenue / confirmedBookings.length : 0;

  // Calculate Revenue This Month and Last Month using RAW bookings (unfiltered)
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const rawConfirmedBookings = bookings.filter((b) => b.status === "Confirmed");

  const bookingsThisMonth = rawConfirmedBookings.filter((b) => {
    const d = b.createdAt ? new Date(b.createdAt) : new Date();
    return !isNaN(d.getTime()) && d >= startOfThisMonth;
  });
  const revenueThisMonth = bookingsThisMonth.reduce((sum, b) => sum + getBookingRevenue(b), 0);

  const bookingsLastMonth = rawConfirmedBookings.filter((b) => {
    const d = b.createdAt ? new Date(b.createdAt) : new Date();
    return !isNaN(d.getTime()) && d >= startOfLastMonth && d <= endOfLastMonth;
  });
  const revenueLastMonth = bookingsLastMonth.reduce((sum, b) => sum + getBookingRevenue(b), 0);

  let growthPercent = 0;
  if (revenueLastMonth > 0) {
    growthPercent = Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);
  } else {
    // If no data for last month, default to +18% as requested
    growthPercent = 18;
  }

  // Destination Breakdown (using filtered bookings)
  const tripBreakdown: { [key: string]: { name: string; count: number; revenue: number } } = {};
  filteredBookings
    .filter((b) => b.status === "Confirmed")
    .forEach((b) => {
      const name = b.tripName === "custom" ? "Custom Trip" : b.tripName;
      const rev = getBookingRevenue(b);
      if (!tripBreakdown[name]) {
        tripBreakdown[name] = { name, count: 0, revenue: 0 };
      }
      tripBreakdown[name].revenue += rev;
      tripBreakdown[name].count += 1;
    });
  const tripList = Object.values(tripBreakdown).sort((a, b) => b.revenue - a.revenue);
  const totalBreakdownRevenue = tripList.reduce((sum, t) => sum + t.revenue, 0);

  // Monthly Breakdown (using filtered bookings)
  const monthlyData: { [key: string]: number } = {};
  filteredBookings
    .filter((b) => b.status === "Confirmed")
    .forEach((b) => {
      const d = b.createdAt ? new Date(b.createdAt) : new Date();
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthlyData[key] = (monthlyData[key] || 0) + getBookingRevenue(b);
    });
  const sortedMonths = Object.keys(monthlyData).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const maxMonthRevenue = sortedMonths.length > 0 ? Math.max(...Object.values(monthlyData)) : 1;

  return (
    <div className="flex flex-col gap-8 animate-reveal">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-brand-blue-deep">Revenue Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Track financial metrics and performance trends</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-600">Period:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-blue-deep focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today (Last 24 Hours)</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 animate-reveal">
        {/* Card 1: Total Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-2xl border border-indigo-700 shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <BadgeIndianRupee className="w-24 h-24 animate-pulse" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">
            Total Revenue
          </p>
          <p className="text-3xl font-display font-bold mt-2">
            ₹ {confirmedRevenue.toLocaleString("en-IN")}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-indigo-200">
            <span>All confirmed revenue</span>
            <span className="bg-indigo-500/30 px-2 py-0.5 rounded font-semibold">
              +{growthPercent}% vs Last Month
            </span>
          </div>
        </div>

        {/* Card 2: Revenue This Month */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl border border-emerald-700 shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <CalendarCheck className="w-24 h-24 animate-pulse" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-200">
            Revenue This Month
          </p>
          <p className="text-3xl font-display font-bold mt-2">
            ₹ {revenueThisMonth.toLocaleString("en-IN")}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-emerald-200">
            <span>Current month earnings</span>
            <span className="bg-emerald-500/30 px-2 py-0.5 rounded font-semibold">
              {bookingsThisMonth.length} bookings
            </span>
          </div>
        </div>

        {/* Card 3: Pending Payments */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl border border-amber-600 shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <CreditCard className="w-24 h-24 animate-pulse" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200">
            Pending Payments
          </p>
          <p className="text-3xl font-display font-bold mt-2">
            ₹ {pendingRevenue.toLocaleString("en-IN")}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-amber-200">
            <span>Amount customers still owe</span>
            <span className="bg-amber-500/30 px-2 py-0.5 rounded font-semibold">
              {pendingBookings.length} pending
            </span>
          </div>
        </div>

        {/* Card 4: Total Bookings */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 to-blue-700 text-white p-6 rounded-2xl border border-sky-700 shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Package className="w-24 h-24 animate-pulse" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-sky-200">
            Total Bookings
          </p>
          <p className="text-3xl font-display font-bold mt-2">
            {confirmedBookings.length}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-sky-200">
            <span>Total confirmed bookings</span>
            <span className="bg-sky-500/30 px-2 py-0.5 rounded font-semibold">
              Confirmed
            </span>
          </div>
        </div>

        {/* Card 5: Average Booking Value */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-cyan-700 text-white p-6 rounded-2xl border border-teal-700 shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Users className="w-24 h-24 animate-pulse" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-teal-200">
            Average Booking Value
          </p>
          <p className="text-3xl font-display font-bold mt-2">
            ₹ {Math.round(averageBookingRevenue).toLocaleString("en-IN")}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-teal-200">
            <span>Average revenue per booking</span>
            <span className="bg-teal-500/30 px-2 py-0.5 rounded font-semibold">
              Per booking
            </span>
          </div>
        </div>
      </div>

      {/* Charts / Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Destination performance */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-brand-blue-deep mb-6">Revenue by Destination</h2>
          <div className="flex-1 min-h-[300px] w-full">
            {tripList.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                No booking data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tripList.map((t) => ({ name: t.name, value: t.revenue }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {tripList.map((entry, index) => {
                      const colors = [
                        "#0ea5e9",
                        "#10b981",
                        "#f59e0b",
                        "#8b5cf6",
                        "#ec4899",
                        "#f43f5e",
                        "#14b8a6",
                      ];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => `₹ ${value.toLocaleString()}`}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-brand-blue-deep">Monthly Revenue Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {yearFilter === "thisYear" ? `This Year (${new Date().getFullYear()})` : yearFilter === "lastYear" ? `Last Year (${new Date().getFullYear() - 1})` : "All Years Combined"}
              </p>
            </div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-blue-deep focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all cursor-pointer"
            >
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 28, right: 10, left: 10, bottom: 0 }}
                barCategoryGap="25%"
              >
                <defs>
                  <linearGradient id="barGradientBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.85} />
                  </linearGradient>
                  <linearGradient id="barGradientEmpty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2e8f0" stopOpacity={1} />
                    <stop offset="100%" stopColor="#f1f5f9" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={<ChartXAxisTick />}
                  interval={0}
                  dy={10}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  width={55}
                />
                <RechartsTooltip
                  cursor={{ fill: "#f1f5f9", radius: 4 }}
                  formatter={(value: number) => [`₹ ${value.toLocaleString("en-IN")}`, "Revenue"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px -2px rgb(0 0 0 / 0.15)",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="revenue"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.revenue > 0 ? "url(#barGradientBlue)" : "url(#barGradientEmpty)"}
                    />
                  ))}
                  <LabelList
                    dataKey="revenue"
                    position="top"
                    content={({ x, y, width, value }: any) => {
                      const label = formatBarLabel(Number(value));
                      if (!label) return null;
                      return (
                        <text
                          x={Number(x) + Number(width) / 2}
                          y={Number(y) - 6}
                          fill="#1e40af"
                          textAnchor="middle"
                          fontSize={10}
                          fontWeight={700}
                        >
                          {label}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-brand-blue-deep">Booking Revenue Ledger</h2>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
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
              {bookings
                .filter((b) => b.status === "Confirmed")
                .map((bk) => {
                  const custom = bk.invoiceCustomData || {};
                  const isCustomUnlocked = bk.tripName === "custom" && !bk.isInvoiceLocked;
                  const rate =
                    custom.rate !== undefined
                      ? Number(custom.rate)
                      : bk.tripName === "custom"
                        ? 0
                        : bk.defaultRate || 6000;
                  const persons =
                    custom.persons !== undefined ? Number(custom.persons) : bk.persons || 1;
                  const total = rate * persons;
                  const customerName = custom.customerName || bk.customerName || bk.name || "";
                  const tripName = custom.packageName || bk.packageName || bk.tripName || "";

                  return (
                    <tr key={bk._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                        {bk.generatedBookingId || bk._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{customerName}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {tripName === "custom" ? "Custom Trip" : tripName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {isCustomUnlocked ? (
                          <span className="text-slate-400 italic">On Request</span>
                        ) : (
                          `₹ ${rate.toLocaleString()}`
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-center w-12">{persons}</td>
                      <td className="px-6 py-4 font-bold text-brand-blue-deep">
                        {isCustomUnlocked ? (
                          <span className="text-slate-400 italic">Pending Invoice</span>
                        ) : (
                          `₹ ${total.toLocaleString()}`
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            bk.status === "Confirmed"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          }`}
                        >
                          {bk.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-medium">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {bookings
            .filter((b) => b.status === "Confirmed")
            .map((bk) => {
              const custom = bk.invoiceCustomData || {};
              const isCustomUnlocked = bk.tripName === "custom" && !bk.isInvoiceLocked;
              const rate =
                custom.rate !== undefined
                  ? Number(custom.rate)
                  : bk.tripName === "custom"
                    ? 0
                    : bk.defaultRate || 6000;
              const persons =
                custom.persons !== undefined ? Number(custom.persons) : bk.persons || 1;
              const total = rate * persons;
              const customerName = custom.customerName || bk.customerName || bk.name || "";
              const tripName = custom.packageName || bk.packageName || bk.tripName || "";

              return (
                <div key={bk._id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {bk.generatedBookingId || bk._id.slice(-8).toUpperCase()}
                    </span>
                    <p className="font-bold text-slate-800 text-sm mt-1 truncate">{customerName}</p>
                    <p className="text-xs text-slate-500 truncate">{tripName === "custom" ? "Custom Trip" : tripName}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-slate-500">
                        {isCustomUnlocked ? "On Request" : `₹ ${rate.toLocaleString()} × ${persons}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-sm font-bold ${isCustomUnlocked ? "text-slate-400 italic" : "text-brand-blue-deep"}`}>
                      {isCustomUnlocked ? "Pending" : `₹ ${total.toLocaleString()}`}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                      {bk.status}
                    </span>
                  </div>
                </div>
              );
            })}
          {bookings.filter((b) => b.status === "Confirmed").length === 0 && (
            <div className="p-8 text-center text-slate-400 font-medium text-sm">No confirmed bookings yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

function WhatsAppEngineView({ token }: { token: string }) {
  const [status, setStatus] = useState<string>("Loading...");
  const [qrCode, setQrCode] = useState<string | null>(null);

  const [rules, setRules] = useState<any[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [ruleForm, setRuleForm] = useState<{ keywords: string; reply: string }>({ keywords: "", reply: "" });

  const fetchStatus = async () => {
    try {
      const res = await getWhatsAppStatusFn({ data: { adminToken: token } });
      setStatus(res.status);
      setQrCode(res.qr || null);
    } catch (e) {
      console.error(e);
      setStatus("Error fetching status");
    }
  };

  const fetchRules = async () => {
    try {
      setLoadingRules(true);
      const res = await getChatbotRulesFn({ data: { adminToken: token } });
      setRules(res.rules || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRules(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchRules();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleSaveRules = async (newRules: any[]) => {
    try {
      await saveChatbotRulesFn({ data: { adminToken: token, rules: newRules } });
      setRules(newRules);
      alert("Rules saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save rules.");
    }
  };

  const handleDeleteRule = (index: number) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    const newRules = [...rules];
    newRules.splice(index, 1);
    handleSaveRules(newRules);
  };

  const handleSaveForm = () => {
    const kws = ruleForm.keywords.split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
    if (kws.length === 0 || !ruleForm.reply.trim()) {
      alert("Keywords and reply are required.");
      return;
    }
    const newRules = [...rules];
    if (editingRuleIndex !== null && editingRuleIndex !== -1) {
      newRules[editingRuleIndex] = { keywords: kws, reply: ruleForm.reply };
    } else {
      newRules.push({ keywords: kws, reply: ruleForm.reply });
    }
    handleSaveRules(newRules);
    setEditingRuleIndex(null);
    setRuleForm({ keywords: "", reply: "" });
  };

  const handleRestart = async () => {
    setStatus("Connecting...");
    await restartWhatsAppFn({ data: { adminToken: token } });
    setTimeout(fetchStatus, 3000);
  };

  const handleLogout = async () => {
    if (
      !window.confirm(
        "Are you sure you want to log out the WhatsApp bot and reset the session? You will need to scan the QR code again.",
      )
    )
      return;
    setStatus("Logging out...");
    await logoutWhatsAppFn({ data: { adminToken: token } });
    setTimeout(fetchStatus, 3000);
  };

  return (
    <div className="space-y-8 animate-reveal">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-8 max-w-2xl mx-auto text-center">
        <Smartphone className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 text-brand-blue-deep" />
        <h2 className="text-xl sm:text-2xl font-bold font-display text-brand-blue-deep mb-2">WhatsApp Engine</h2>
        <p className="text-slate-500 mb-6 sm:mb-8 text-sm sm:text-base">
          Manage the WhatsApp bot connection. This bot automatically notifies you of new bookings and
          responds to commands.
        </p>

        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-100 mb-6 sm:mb-8 inline-block w-full max-w-sm mx-auto">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Status</p>
          <p
            className={`text-xl font-bold ${
              status === "Connected"
                ? "text-green-600"
                : status === "Error"
                  ? "text-red-600"
                  : "text-yellow-600"
            }`}
          >
            {status}
          </p>

          {status === "Awaiting QR" && qrCode && (
            <div className="mt-6 flex flex-col items-center">
              <p className="text-sm text-slate-600 mb-4">
                Scan this QR code with your WhatsApp app to link the bot.
              </p>
              {/* Generate QR image from string */}
              <QRCodeDisplay qr={qrCode} />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            {status === "Disconnected" || status === "Error" ? "Connect Bot" : "Restart Engine"}
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors"
          >
            Logout / Reset Bot
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-8 max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-brand-blue-deep mb-2">Chatbot Auto-Reply Rules</h2>
        <p className="text-slate-500 mb-6 text-sm sm:text-base">
          Manage the automated replies sent by the WhatsApp bot when customers message specific keywords.
        </p>

        {editingRuleIndex !== null ? (
          <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200 mb-6">
            <h3 className="font-bold text-lg mb-4">{editingRuleIndex === -1 ? "Add New Rule" : "Edit Rule"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Keywords (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. hello, hi, inquiry"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={ruleForm.keywords}
                  onChange={(e) => setRuleForm({ ...ruleForm, keywords: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Reply Message</label>
                <textarea
                  placeholder="Type the automated reply here..."
                  className="w-full px-4 py-2 border rounded-lg h-32 resize-y"
                  value={ruleForm.reply}
                  onChange={(e) => setRuleForm({ ...ruleForm, reply: e.target.value })}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => { setEditingRuleIndex(null); setRuleForm({ keywords: "", reply: "" }); }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveForm}
                  className="px-4 py-2 bg-brand-blue text-white rounded-lg font-bold hover:bg-brand-blue-deep transition-colors"
                >
                  Save Rule
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setEditingRuleIndex(-1);
              setRuleForm({ keywords: "", reply: "" });
            }}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-brand-blue-deep transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Rule
          </button>
        )}

        {loadingRules ? (
          <div className="py-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-blue" /></div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {rule.keywords.map((kw: string, i: number) => (
                      <span key={i} className="bg-brand-blue-light text-brand-blue-deep px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                        {kw}
                      </span>
                    ))}
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {rule.reply}
                  </pre>
                </div>
                <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() => {
                      setEditingRuleIndex(idx);
                      setRuleForm({ keywords: rule.keywords.join(", "), reply: rule.reply });
                    }}
                    className="p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-blue rounded-lg transition-colors"
                    title="Edit Rule"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(idx)}
                    className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {rules.length === 0 && !editingRuleIndex && (
              <div className="text-center py-8 text-slate-500 border border-dashed rounded-xl">
                No chatbot rules defined.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import QRCode from 'qrcode';
function QRCodeDisplay({ qr }: { qr: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(qr, { width: 256, margin: 2 }, (err: any, url: string) => {
      if (!err) setDataUrl(url);
    });
  }, [qr]);

  if (!dataUrl) return <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-blue" />;
  return (
    <img
      src={dataUrl}
      alt="QR Code"
      className="mx-auto rounded-xl shadow-sm border border-slate-200"
    />
  );
}

function BlogsAdminView({
  token,
  blogs,
  setDeleteConfirm,
}: {
  token: string;
  blogs: any[];
  setDeleteConfirm: (confirm: any) => void;
}) {
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", authorName: "", category: "", thumbnailBase64: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleEditClick = (blog: any) => {
    setEditingBlog(blog);
    setEditForm({
      title: blog.title,
      content: blog.content,
      authorName: blog.authorName,
      category: blog.category,
      thumbnailBase64: "",
    });
    setErrorMsg("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await updateCustomBlogFn({
        data: {
          adminToken: token,
          id: editingBlog._id,
          title: editForm.title,
          content: editForm.content,
          authorName: editForm.authorName,
          category: editForm.category,
          thumbnailBase64: editForm.thumbnailBase64 || undefined,
        }
      });
      setEditingBlog(null);
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update blog.");
      setIsSubmitting(false);
    }
  };

  const handleToggleVisibility = async (blog: any) => {
    try {
      await toggleBlogVisibilityFn({
        data: {
          adminToken: token,
          id: blog._id,
          isHidden: !blog.isHidden
        }
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to toggle visibility");
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Thumbnail size exceeds 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditForm({ ...editForm, thumbnailBase64: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 animate-reveal relative">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-xl font-bold font-display text-brand-blue-deep mb-1">
            Custom Yatri Blogs
          </h2>
          <p className="text-slate-500 text-sm">
            View, edit, and toggle visibility of custom travelogue blogs.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 border border-slate-100 rounded-xl custom-scrollbar">
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-600 mb-1">No custom blogs found</h3>
            <p className="text-slate-400 text-sm">Custom stories submitted from the front-end blog page will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-xs">
                <th className="p-4">Image</th>
                <th className="p-4">Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {blogs.map((blog) => (
                <tr key={blog._id} className={`hover:bg-slate-50/50 transition-colors ${blog.isHidden ? "opacity-60 bg-slate-50" : ""}`}>
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-bold text-brand-blue-deep max-w-xs truncate">
                    <a
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-brand-blue transition-colors font-semibold"
                    >
                      {blog.title}
                    </a>
                    {blog.isHidden && (
                      <span className="ml-2 inline-block px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] rounded uppercase font-bold tracking-widest">Hidden</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{blog.authorName}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                      {blog.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(blog.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-blue transition-colors"
                        title="View Blog"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleToggleVisibility(blog)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-blue transition-colors"
                        title={blog.isHidden ? "Unhide Blog" : "Hide Blog"}
                      >
                        {blog.isHidden ? <Eye className="w-4 h-4 text-slate-400" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEditClick(blog)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-blue transition-colors"
                        title="Edit Blog"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ isOpen: true, id: blog._id, type: "blog" })
                        }
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Blog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Blog Modal */}
      {editingBlog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-[650px] shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-reveal overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-2xl font-display font-bold text-brand-blue-deep">Edit Blog</h3>
              <button
                onClick={() => setEditingBlog(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-brand-blue hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {errorMsg && (
              <div className="px-6 md:px-8 pt-6">
                <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">!</div>
                  {errorMsg}
                </div>
              </div>
            )}

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <form id="editBlogForm" onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Blog Title</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
                    placeholder="Enter blog title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Author Name</label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
                      value={editForm.authorName}
                      onChange={(e) => setEditForm({ ...editForm, authorName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none bg-white"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      <option value="Travel Guides">Travel Guides</option>
                      <option value="Pilgrimage">Pilgrimage</option>
                      <option value="Experiences">Experiences</option>
                      <option value="Tips & Tricks">Tips & Tricks</option>
                      <option value="News">News</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Thumbnail Image</label>
                  <div className="flex items-center gap-4">
                    {editForm.thumbnailBase64 ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <img src={editForm.thumbnailBase64} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <img src={editingBlog.featuredImage} alt="Current" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer hover:bg-slate-200 transition-colors text-sm border border-slate-200">
                      Change Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                    </label>
                    <span className="text-xs text-slate-400">Max 5MB. Leave empty to keep current.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Content (HTML Supported)</label>
                  <textarea
                    required
                    minLength={10}
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none resize-y custom-scrollbar"
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  />
                </div>
              </form>
            </div>

            <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editBlogForm"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green-dark transition-all flex items-center gap-2 shadow-lg shadow-brand-green/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
