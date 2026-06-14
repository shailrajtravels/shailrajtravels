import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { MapPin, Phone, Mail, Globe, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import logo from "@/assets/Shailraj travels-Punelogo.png";
import onlyNameLogo from "@/assets/only-name-logo.png";
import stamp from "@/assets/stamp1.png";

const BLUE = "#0B3D91";
const DARK = "#082F70";
const BORDER = "#1E4D9E";
const GREEN = "#1E8E3E";

export function InvoicePrint({ booking }: { booking: any }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Auto fit to screen on mobile
    if (window.innerWidth < 800) {
      setScale(window.innerWidth / 840);
    }
  }, []);

  const safeDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };
  const invoiceNo = `INV-${safeDate(booking.createdAt).getFullYear()}-${booking._id ? booking._id.slice(-6).toUpperCase() : '0001'}`;
  const invoiceDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const dueDate = safeDate(booking.travelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Rate logic: we can just invent a dummy rate for now or calculate based on persons if it's missing
  const rate = 6000;
  const totalAmount = rate * (booking.persons || 1);

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

      {/* ZOOM CONTROLS */}
      <div className="no-print sticky top-4 z-50 mb-8 flex justify-center">
        <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 px-4 py-2 flex items-center gap-3">
          <button onClick={() => setScale(s => Math.max(0.3, s - 0.1))} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-700" title="Zoom Out">
            <ZoomOut size={20} />
          </button>
          <span className="font-semibold text-sm w-12 text-center text-slate-700">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-700" title="Zoom In">
            <ZoomIn size={20} />
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <button onClick={() => setScale(window.innerWidth < 800 ? window.innerWidth / 840 : 1)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-700" title="Fit to Screen">
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* SCALED WRAPPER */}
      <div
        className="relative mx-auto mb-10 transition-all duration-200 print-wrapper"
        style={{
          width: `calc(210mm * ${scale})`,
          height: `calc(297mm * ${scale})`
        }}
      >
        <div
          className="absolute top-0 left-0 print-scale"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
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
                <img src={logo} alt="Shailraj Travel" className="h-[150px] w-[150px] object-contain scale-[1.3] origin-top-left" />
              </div>

              {/* Middle Logo & Contact */}
              <div className="flex flex-col items-center">
                {/* Wrapper provides physical space for scaled logo */}
                <div className="h-[140px] flex items-center justify-center w-full">
                  <img src={onlyNameLogo} alt="Shailraj Travels" className="h-[190px] object-contain scale-[2.4] origin-center -ml-12" />
                </div>
                {/* Negative margin pulls contact info up to eliminate transparent gap from image */}
                <div className="-mt-5 text-[15px] font-medium text-slate-600 flex items-center justify-center gap-4 w-full">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Pune, Maharashtra, India</span>
                  <span className="opacity-50">|</span>
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> +91 98765 43210</span>
                </div>
                <div className="mt-1 text-[15px] font-medium text-slate-600 flex items-center justify-center gap-4 w-full">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> info@shailrajtravels.com</span>
                  <span className="opacity-50">|</span>
                  <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> www.shailrajtravels.com</span>
                </div>
              </div>
            </div>

            {/* INVOICE BADGE */}
            <div className="mt-4 flex justify-center">
              <div className="rounded-[8px] px-10 py-1.5 text-[22px] font-black tracking-widest text-white shadow-sm" style={{ background: DARK }}>
                INVOICE
              </div>
            </div>

            {/* INVOICE INFO CARD */}
            <div className="mt-6 rounded-[10px] border" style={{ borderColor: BORDER }}>
              <div className="grid grid-cols-2">
                <div className="p-3 border-r" style={{ borderColor: BORDER }}>
                  <InfoLine label="Invoice No." value={invoiceNo} />
                  <div className="mt-2" />
                  <InfoLine label="Invoice Date" value={format(safeDate(booking.createdAt), 'dd MMM yyyy')} />
                </div>
                <div className="p-3">
                  <InfoLine label="Booking ID" value={booking.bookingId || booking._id?.slice(-8).toUpperCase()} />
                  <div className="mt-2" />
                  <InfoLine label="Travel Date" value={format(safeDate(booking.travelDate), 'dd MMM yyyy')} />
                </div>
              </div>
            </div>

            {/* BILL TO + TRIP DETAILS */}
            <div className="mt-6 grid grid-cols-2 gap-6">
              <Card title="BILL TO">
                <div className="flex flex-col h-full gap-1">
                  <DetailRow label="Name" value={booking.customerName} />
                  <DetailRow label="Mobile" value={booking.customerPhone} />

                </div>
              </Card>

              <Card title="TRIP DETAILS">
                <DetailRow label="Package Name" value={booking.packageId?.name || booking.packageName || 'Custom Trip'} />
                <DetailRow label="Travel Date" value={format(safeDate(booking.travelDate), 'dd MMM yyyy, HH:mm')} />

                <DetailRow label="Pickup Point" value={booking.pickupPoint || 'Pune'} />
              </Card>
            </div>

            {/* TABLE */}
            <div className="mt-6 overflow-hidden rounded-[8px] border flex flex-col" style={{ borderColor: BORDER }}>
              <table className="w-full text-left text-[13px]">
                <thead className="text-white" style={{ background: DARK }}>
                  <tr>
                    <th className="px-5 py-3 text-left font-bold uppercase tracking-wide text-[12px]">Description</th>
                    <th className="px-5 py-3 text-center font-bold uppercase tracking-wide text-[12px] w-[100px]">Qty</th>
                    <th className="px-5 py-3 text-center font-bold uppercase tracking-wide text-[12px] w-[140px]">Rate (₹)</th>
                    <th className="px-5 py-3 text-center font-bold uppercase tracking-wide text-[12px] w-[160px]">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-5 py-4 font-medium text-[#222]">Package Price (Per Person)</td>
                    <td className="px-5 py-4 text-center font-medium text-[#222]">{booking.persons || 1}</td>
                    <td className="px-5 py-4 text-center font-medium text-[#222]">{rate.toLocaleString()}</td>
                    <td className="px-5 py-4 text-center font-medium text-[#222]">{totalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex bg-slate-50 border-t" style={{ borderColor: BORDER }}>
                <div className="flex-1" />
                <div className="w-[140px] px-5 py-1 flex items-center justify-center text-[15px] font-bold uppercase tracking-widest text-slate-700">
                  Total
                </div>
                <div className="w-[160px] px-5 py-1 flex items-center justify-center text-[22px] font-black leading-none" style={{ color: DARK }}>
                  ₹ {totalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* PAYMENT + SIGNATURE */}
            <div className="mt-6 grid grid-cols-2 gap-6">
              <Card title="PAYMENT DETAILS">
                <div className="flex flex-col h-full gap-1">
                  <DetailRow label="Payment Mode" value="Cash / Online" />
                  <DetailRow label="Paid Amount" value={`₹ ${totalAmount.toLocaleString()}`} />
                  <div className="mt-1 flex items-center text-[13px]">
                    <div className="w-[130px] font-medium">Payment Status</div>
                    <div className="w-3">:</div>
                    <span className={`ml-2 rounded-sm px-2 py-0.5 text-[11px] font-bold text-white ${booking.paymentStatus === 'Completed' ? 'bg-green-500' : 'bg-orange-500'}`}>
                      {booking.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>
              </Card>
              <Card title="AUTHORIZED SIGNATURE">
                <div className="flex flex-col h-full justify-between relative">


                  {/* STAMP */}
                  <div className="absolute bottom-3 right-22 w-[44%] opacity-85 pointer-events-none select-none mix-blend-multiply z-10">
                    <img src={stamp} alt="Official Seal" className="w-full h-auto object-contain drop-shadow-sm" />
                  </div>

                  <div className="mt-auto pt-22 relative z-0">
                    <div className="mx-auto h-px w-3/4 bg-slate-800" />
                    <p className="mt-2 text-center text-[12px] text-slate-600">Authorized Signatory</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* THANK YOU */}
            <div className="mt-auto flex w-full flex-col items-center pb-2 pt-6">
              <div className="flex w-[80%] items-center gap-6 opacity-60">
                <div className="h-[1px] flex-1" style={{ background: `linear-gradient(to right, transparent, ${BORDER})` }} />
                <div className="script text-[42px] leading-none" style={{ color: DARK }}>Thank You!</div>
                <div className="h-[1px] flex-1" style={{ background: `linear-gradient(to left, transparent, ${BORDER})` }} />
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
              <span className="flex items-center gap-2"><Phone className="h-4 w-4" />+91 72765 31897</span>
              <span className="opacity-50">|</span>
              <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> shailrajtravels9999@gmail.com.com</span>
              <span className="opacity-50">|</span>
              <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> www.shailrajtravels.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex text-[13px]">
      <div className="w-[120px] font-medium">{label}</div>
      <div className="w-3">:</div>
      <div className="ml-2 font-semibold">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[6px] border h-full" style={{ borderColor: BORDER }}>
      <div className="px-5 py-2.5 text-[14px] font-bold uppercase text-white" style={{ background: DARK }}>
        {title}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex py-1 text-[13px]">
      <div className="w-[130px] font-medium">{label}</div>
      <div className="w-3">:</div>
      <div className="ml-2">{value}</div>
    </div>
  );
}
