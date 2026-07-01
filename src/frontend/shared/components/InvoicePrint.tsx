import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Phone, Mail, Globe, ZoomIn, ZoomOut, Maximize, Lock, Send } from 'lucide-react';
import logo from '@/frontend/shared/assets/Shailraj travels-Punelogo.png';
import onlyNameLogo from '@/frontend/shared/assets/only-name-logo.png';
import stamp from '@/frontend/shared/assets/stamp1.png';
import { saveInvoiceFn, sendInvoiceWhatsAppFn } from '@/backend/shared/bookings';

const BLUE = "#0B3D91";
const DARK = "#082F70";
const BORDER = "#1E4D9E";
const GREEN = "#1E8E3E";

export function InvoicePrint({
  booking,
  token,
  onSuccess,
}: {
  booking: any;
  token?: string | null;
  onSuccess?: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const safeDate = (dateStr: any) => {
    if (!dateStr) return new Date();
    let d = new Date(dateStr);
    if (isNaN(d.getTime()) && typeof dateStr === "string") {
      const cleaned = dateStr.replace(/\s*\(.*\)\s*/g, "");
      d = new Date(cleaned);
    }
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const getInitialData = (b: any) => {
    const custom = b.invoiceCustomData || {};
    // Root-level paymentStatus is always the source of truth — it's updated
    // by the Bookings tab dropdown. invoiceCustomData.paymentStatus may be stale
    // if the invoice was locked before payment was marked as PAID.
    const livePaymentStatus = b.paymentStatus || custom.paymentStatus || "PENDING";
    return {
      invoiceNo:
        custom.invoiceNo ||
        b.generatedInvoiceNo ||
        `INV-${safeDate(b.createdAt).getFullYear()}-${b._id ? b._id.slice(-6).toUpperCase() : "0001"}`,
      invoiceDate:
        custom.invoiceDate ||
        safeDate(b.createdAt || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      bookingId:
        custom.bookingId ||
        b.generatedBookingId ||
        b.bookingId ||
        b._id?.slice(-8).toUpperCase() ||
        "",
      travelDate: (() => {
        if (custom.travelDate) return custom.travelDate;
        if (!b.travelDate) return "";
        const parsed = new Date(b.travelDate);
        if (isNaN(parsed.getTime())) {
          return b.travelDate; // Return raw string (e.g. "Fri 3 Jul to Sun 5 Jul 2026")
        }
        return format(parsed, "dd MMM yyyy");
      })(),
      customerName: custom.customerName || b.customerName || b.name || "",
      customerPhone: custom.customerPhone || b.customerPhone || b.phone || "",
      packageName: custom.packageName || b.tripName || b.packageId?.name || b.packageName || "Custom Trip",
      travelDateTime: (() => {
        if (custom.travelDateTime) return custom.travelDateTime;
        if (!b.travelDate) return "";
        const parsed = new Date(b.travelDate);
        if (isNaN(parsed.getTime())) {
          return b.travelDate;
        }
        return format(parsed, "dd MMM yyyy, HH:mm");
      })(),
      pickupPoint: custom.pickupPoint || b.pickupLocation || b.pickupPoint || "Pune",
      rate:
        custom.rate !== undefined
          ? Number(custom.rate)
          : b.tripName === "custom"
            ? 0
            : b.defaultRate || 6000,
      persons: custom.persons !== undefined ? Number(custom.persons) : b.persons || 1,
      paymentStatus: livePaymentStatus,
    };
  };

  const [data, setData] = useState(() => getInitialData(booking));

  useEffect(() => {
    setData(getInitialData(booking));
  }, [booking]);

  useEffect(() => {
    // Auto fit to screen on mobile
    if (window.innerWidth < 800) {
      setScale(window.innerWidth / 840);
    }
  }, []);

  const totalAmount = data.rate * data.persons;

  const updateData = (key: string, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const getCreatedAtDate = (dateStr: any) => {
    if (!dateStr) return null;
    let d = new Date(dateStr);
    if (isNaN(d.getTime()) && typeof dateStr === "string") {
      const cleaned = dateStr.replace(/\s*\(.*\)\s*/g, "");
      d = new Date(cleaned);
    }
    return isNaN(d.getTime()) ? null : d;
  };

  const isLocked = !!booking.isInvoiceLocked;
  const isEditable = !isLocked;

  const handleSaveAndLock = async () => {
    if (!token) {
      alert("Unauthorized: No admin token found.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to Save & Lock this invoice? After locking, you will not be able to edit it again.",
      )
    ) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await saveInvoiceFn({
        data: {
          adminToken: token,
          bookingId: booking._id,
          invoiceCustomData: data,
        },
      });
      if (res?.success) {
        setIsEditing(false);
        if (onSuccess) onSuccess();
        if (data.paymentStatus === "PAID") {
          if (res.whatsappSent) {
            alert("Invoice saved, locked, and sent successfully via WhatsApp.");
          } else {
            alert(
              "Invoice saved and locked, but WhatsApp invoice could not be sent. Make sure WhatsApp Engine is connected and customer phone number is correct.",
            );
          }
        } else {
          alert("Invoice saved and locked successfully.");
        }
      } else {
        alert("Failed to save and lock invoice.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save and lock invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!token) {
      alert("Unauthorized: No admin token found.");
      return;
    }

    const inputPhone = window.prompt(
      "Confirm or enter the WhatsApp number to send this invoice to (digits only, with country code, e.g. 919763433556):",
      data.customerPhone || "",
    );

    if (inputPhone === null) return; // User cancelled

    const sanitizedPhone = inputPhone.replace(/\D/g, "");
    if (!sanitizedPhone) {
      alert("Please enter a valid phone number.");
      return;
    }

    setIsSendingWhatsApp(true);
    try {
      const res = await sendInvoiceWhatsAppFn({
        data: {
          adminToken: token,
          bookingId: booking._id,
          phone: sanitizedPhone,
        },
      });
      if (res?.success) {
        alert("Invoice successfully sent via WhatsApp!");
      } else {
        alert("Failed to send WhatsApp invoice.");
      }
    } catch (err: any) {
      alert(
        err.message || "Failed to send WhatsApp invoice. Make sure WhatsApp Engine is connected.",
      );
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f3] py-6 print:p-0 print:bg-white w-full overflow-x-auto print:overflow-visible relative flex flex-col items-center">
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; height: auto !important; overflow: visible !important; }
          .print-wrapper { width: 210mm !important; height: 297mm !important; position: static !important; margin: 0 !important; }
          .print-scale { transform: none !important; position: static !important; }
        }
        .script { font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; }
      `}</style>

      {/* CONTROLS */}
      <div className="no-print sticky top-4 z-50 mb-8 flex justify-center gap-4">
        <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => setScale((s) => Math.max(0.3, s - 0.1))}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <span className="font-semibold text-sm w-12 text-center text-slate-700">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <button
            onClick={() => setScale(window.innerWidth < 800 ? window.innerWidth / 840 : 1)}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
            title="Fit to Screen"
          >
            <Maximize size={18} />
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 px-4 py-2 flex items-center gap-3">
          {isEditable ? (
            isEditing ? (
              <>
                <button
                  onClick={handleSaveAndLock}
                  disabled={isSaving}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-sm disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save & Lock Invoice"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setData(getInitialData(booking));
                  }}
                  disabled={isSaving}
                  className="px-3 py-1 bg-slate-400 hover:bg-slate-500 text-white rounded font-bold text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-[#0B3D91] hover:bg-[#082F70] text-white rounded font-bold text-sm"
              >
                Edit Invoice
              </button>
            )
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 px-3 py-1 bg-slate-100 rounded border border-slate-200 select-none">
                <Lock size={14} className="text-slate-400" />
                Invoice Locked
              </div>
              <button
                onClick={handleSendWhatsApp}
                disabled={isSendingWhatsApp}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded font-bold text-sm flex items-center gap-1.5 transition-colors"
              >
                <Send size={14} />
                {isSendingWhatsApp ? "Sending..." : "Send via WhatsApp"}
              </button>
            </>
          )}
          <button
            onClick={() => window.print()}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-sm"
          >
            Print
          </button>
        </div>
      </div>

      {/* SCALED WRAPPER */}
      <div
        className="relative mx-auto mb-10 transition-all duration-200 print-wrapper"
        style={{
          width: `calc(210mm * ${scale})`,
          height: `calc(297mm * ${scale})`,
        }}
      >
        <div
          className="absolute top-0 left-0 print-scale"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            className="bg-white text-[#222] shadow-xl print:shadow-none relative shrink-0 flex flex-col"
            style={{ width: "210mm", height: "297mm", padding: "10mm 10mm 50px" }}
            id={`invoice-${booking._id}`}
          >
            {/* HEADER */}
            <div className="w-full pt-2">
              {/* Left Logo */}
              <div className="absolute top-1 left-1">
                <img
                  src={logo}
                  alt="Shailraj Travel"
                  className="h-[150px] w-[150px] object-contain scale-[1.3] origin-top-left"
                />
              </div>

              {/* Middle Logo & Contact */}
              <div className="flex flex-col items-center">
                {/* Wrapper provides physical space for scaled logo */}
                <div className="h-[140px] flex items-center justify-center w-full">
                  <img
                    src={onlyNameLogo}
                    alt="Shailraj Travels"
                    className="h-[190px] object-contain scale-[2.4] origin-center -ml-12"
                  />
                </div>
                {/* Negative margin pulls contact info up to eliminate transparent gap from image */}
                <div className="-mt-5 text-[15px] font-medium text-slate-600 flex items-center justify-center gap-4 w-full">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Pune, Maharashtra, India
                  </span>
                  <span className="opacity-50">|</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> +91 97634 33556
                  </span>
                </div>
                <div className="mt-1 text-[15px] font-medium text-slate-600 flex items-center justify-center gap-4 w-full">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> shailrajtravels9999@gmail.com
                  </span>
                  <span className="opacity-50">|</span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" /> www.shailrajtravels.com
                  </span>
                </div>
              </div>
            </div>

            {/* INVOICE BADGE */}
            <div className="mt-4 flex justify-center">
              <div
                className="rounded-[8px] px-10 py-1.5 text-[22px] font-black tracking-widest text-white shadow-sm"
                style={{ background: DARK }}
              >
                INVOICE
              </div>
            </div>

            {/* INVOICE INFO CARD */}
            <div className="mt-4 rounded-[10px] border shrink-0" style={{ borderColor: BORDER }}>
              <div className="grid grid-cols-2">
                <div className="p-3 border-r" style={{ borderColor: BORDER }}>
                  <InfoLine
                    label="Invoice No."
                    value={data.invoiceNo}
                    isEditing={isEditing}
                    onChange={(v: string) => updateData("invoiceNo", v)}
                  />
                  <div className="mt-2" />
                  <InfoLine
                    label="Invoice Date"
                    value={data.invoiceDate}
                    isEditing={isEditing}
                    onChange={(v: string) => updateData("invoiceDate", v)}
                  />
                </div>
                <div className="p-3">
                  <InfoLine
                    label="Booking ID"
                    value={data.bookingId}
                    isEditing={isEditing}
                    onChange={(v: string) => updateData("bookingId", v)}
                  />
                  <div className="mt-2" />
                  <InfoLine
                    label="Travel Date"
                    value={data.travelDate}
                    isEditing={isEditing}
                    onChange={(v: string) => updateData("travelDate", v)}
                  />
                </div>
              </div>
            </div>

            {/* BILL TO + TRIP DETAILS */}
            <div className="mt-4 grid grid-cols-2 gap-4 shrink-0">
              <Card title="BILL TO">
                <div className="flex flex-col h-full gap-1">
                  <DetailRow
                    label="Name"
                    value={data.customerName}
                    isEditing={isEditing}
                    onChange={(v: string) => updateData("customerName", v)}
                  />
                  <DetailRow
                    label="Mobile"
                    value={data.customerPhone}
                    isEditing={isEditing}
                    onChange={(v: string) => updateData("customerPhone", v)}
                  />
                </div>
              </Card>

              <Card title="TRIP DETAILS">
                <DetailRow
                  label="Package Name"
                  value={data.packageName}
                  isEditing={isEditing}
                  onChange={(v: string) => updateData("packageName", v)}
                />
                <DetailRow
                  label="Travel Date"
                  value={data.travelDateTime}
                  isEditing={isEditing}
                  onChange={(v: string) => updateData("travelDateTime", v)}
                />

                <DetailRow
                  label="Pickup Point"
                  value={data.pickupPoint}
                  isEditing={isEditing}
                  onChange={(v: string) => updateData("pickupPoint", v)}
                />
              </Card>
            </div>

            {/* TABLE */}
            <div
              className="mt-4 overflow-hidden rounded-[8px] border flex flex-col shrink-0"
              style={{ borderColor: BORDER }}
            >
              <table className="w-full text-left text-[13px]">
                <thead className="text-white" style={{ background: DARK }}>
                  <tr>
                    <th className="px-5 py-3 text-left font-bold uppercase tracking-wide text-[12px]">
                      Description
                    </th>
                    <th className="px-5 py-3 text-center font-bold uppercase tracking-wide text-[12px] w-[100px]">
                      Qty
                    </th>
                    <th className="px-5 py-3 text-center font-bold uppercase tracking-wide text-[12px] w-[140px]">
                      Rate (₹)
                    </th>
                    <th className="px-5 py-3 text-center font-bold uppercase tracking-wide text-[12px] w-[160px]">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-5 py-4 font-medium text-[#222]">
                      Package Price (Per Person)
                    </td>
                    <td className="px-5 py-4 text-center font-medium text-[#222]">
                      {isEditing ? (
                        <input
                          id="invoice-persons"
                          name="persons"
                          type="number"
                          className="w-16 text-center border border-slate-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-brand-blue"
                          value={data.persons}
                          onChange={(e) => updateData("persons", parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        data.persons
                      )}
                    </td>
                    <td className="px-5 py-4 text-center font-medium text-[#222]">
                      {isEditing ? (
                        <input
                          id="invoice-rate"
                          name="rate"
                          type="number"
                          className="w-20 text-center border border-slate-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-brand-blue"
                          value={data.rate}
                          onChange={(e) => updateData("rate", parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        data.rate.toLocaleString()
                      )}
                    </td>
                    <td className="px-5 py-4 text-center font-medium text-[#222]">
                      {totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t" style={{ borderColor: BORDER }}>
                    <td colSpan={2} className="px-5 py-3"></td>
                    <td className="px-5 py-3 text-center font-bold uppercase tracking-wider text-slate-700 text-[13px] border-l border-r" style={{ borderColor: BORDER }}>
                      Total
                    </td>
                    <td
                      className="px-5 py-3 text-center text-[20px] font-extrabold leading-normal"
                      style={{ color: DARK }}
                    >
                      ₹ {totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* PAYMENT + SIGNATURE */}
            <div className="mt-4 grid grid-cols-2 gap-4 shrink-0">
              <Card title="PAYMENT DETAILS">
                <div className="flex flex-col h-full gap-1">
                  <DetailRow label="Payment Mode" value="Cash / Online" />
                  <DetailRow label="Paid Amount" value={`₹ ${totalAmount.toLocaleString()}`} />
                  <div className="mt-1 flex items-center text-[13px]">
                    <div className="w-[130px] font-medium">Payment Status</div>
                    <div className="w-3">:</div>
                    {isEditing ? (
                      <select
                        className="ml-2 flex-1 border border-slate-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer font-semibold"
                        value={data.paymentStatus?.toUpperCase() || "PENDING"}
                        onChange={(e) => updateData("paymentStatus", e.target.value)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                      </select>
                    ) : (
                      <span
                        className={`ml-2 rounded-sm px-2 py-0.5 text-[11px] font-bold text-white ${data.paymentStatus?.toLowerCase() === "completed" || data.paymentStatus?.toLowerCase() === "paid" ? "bg-green-500" : "bg-orange-500"}`}
                      >
                        {data.paymentStatus?.toUpperCase() || "PENDING"}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
              <Card title="AUTHORIZED SIGNATURE">
                <div className="flex flex-col h-full justify-between relative">
                  {/* STAMP */}
                  <div className="absolute bottom-3 right-22 w-[44%] opacity-85 pointer-events-none select-none mix-blend-multiply z-10">
                    <img
                      src={stamp}
                      alt="Official Seal"
                      className="w-full h-auto object-contain drop-shadow-sm"
                    />
                  </div>

                  <div className="mt-auto pt-22 relative z-0">
                    <div className="mx-auto h-px w-3/4 bg-slate-800" />
                    <p className="mt-2 text-center text-[12px] text-slate-600">
                      Authorized Signatory
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* THANK YOU */}
            <div className="mt-auto flex w-full flex-col items-center pb-2 pt-6">
              <div className="flex w-[80%] items-center gap-6 opacity-60">
                <div
                  className="h-[1px] flex-1"
                  style={{ background: `linear-gradient(to right, transparent, ${BORDER})` }}
                />
                <div className="script text-[42px] leading-none" style={{ color: DARK }}>
                  Thank You!
                </div>
                <div
                  className="h-[1px] flex-1"
                  style={{ background: `linear-gradient(to left, transparent, ${BORDER})` }}
                />
              </div>
              <div className="mt-3 flex flex-col items-center text-center">
                <div className="text-[13px] font-bold tracking-widest" style={{ color: DARK }}>
                  Wings_of_mayur_9999
                </div>
                <div className="mt-1 text-[9px] font-medium tracking-[0.2em] text-slate-400 uppercase">
                  Powered by
                </div>
                <div className="text-[14px] font-semibold tracking-wider text-slate-600">
                  Shailraj Travels,Pune
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="absolute bottom-0 left-0 w-full flex items-center justify-around px-6 py-3 text-[13px] font-medium text-white"
              style={{ background: DARK }}
            >
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +91 97634 33556
              </span>
              <span className="opacity-50">|</span>
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> shailrajtravels9999@gmail.com
              </span>
              <span className="opacity-50">|</span>
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> www.shailrajtravels.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value, isEditing, onChange }: any) {
  return (
    <div className="flex text-[13px] items-center">
      <div className="w-[120px] font-medium">{label}</div>
      <div className="w-3">:</div>
      <div className="ml-2 font-semibold flex-1">
        {isEditing ? (
          <input
            id={`info-${label.replace(/\s+/g, '-').toLowerCase()}`}
            name={`info-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="w-full border border-slate-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-brand-blue"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[6px] border h-full" style={{ borderColor: BORDER }}>
      <div
        className="px-5 py-2.5 text-[14px] font-bold uppercase text-white"
        style={{ background: DARK }}
      >
        {title}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, isEditing, onChange }: any) {
  return (
    <div className="flex py-1 text-[13px] items-center">
      <div className="w-[130px] font-medium">{label}</div>
      <div className="w-3">:</div>
      <div className="ml-2 flex-1">
        {isEditing ? (
          <input
            id={`detail-${label.replace(/\s+/g, '-').toLowerCase()}`}
            name={`detail-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="w-full border border-slate-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-brand-blue"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          value
        )}
      </div>
    </div>
  );
}
