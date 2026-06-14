import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Globe, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/shailraj-logo.png";
import vehicle from "@/assets/force-urbania.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shailraj Travels — Invoice" },
      { name: "description", content: "Force Urbania Luxury Tour Services invoice." },
    ],
  }),
  component: Index,
});

function Editable({ id, defaultValue, className, style }: { id: string; defaultValue: string; className?: string; style?: React.CSSProperties }) {
  const [val, setVal] = useState(defaultValue);
  useEffect(() => {
    const s = typeof window !== "undefined" ? localStorage.getItem("inv:" + id) : null;
    if (s !== null) setVal(s);
  }, [id]);
  return (
    <span
      className={className}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        const v = e.currentTarget.textContent ?? "";
        setVal(v);
        localStorage.setItem("inv:" + id, v);
      }}
    >
      {val}
    </span>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-[#eef0f3] py-6 print:p-0 print:bg-white">
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
        .script { font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; }
        [contenteditable="true"] { outline: 1px dashed #94a3b8; outline-offset: 2px; border-radius: 2px; min-width: 8px; display: inline-block; }
        [contenteditable="true"]:focus { outline: 2px solid #0B3D91; background: #f1f5ff; }
      `}</style>

      <Invoice />
    </div>
  );
}

const BLUE = "#0B3D91";
const DARK = "#082F70";
const BORDER = "#1E4D9E";
const GREEN = "#1E8E3E";

function Invoice() {
  return (
    <div
      className="mx-auto bg-white text-[#222] shadow-lg print:shadow-none"
      style={{ width: "210mm", minHeight: "297mm", padding: "10mm 10mm 0" }}
    >
      {/* HEADER */}
      <div className="grid grid-cols-[110px_1fr_230px] items-center gap-4">
        <img src={logo} alt="Shailraj Travel" width={110} height={110} className="h-[110px] w-[110px] object-contain" />
        <div className="pl-1">
          <h1
            className="font-extrabold uppercase leading-none"
            style={{ color: DARK, fontSize: "46px", letterSpacing: "-0.5px" }}
          >
            Shailraj Travels
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-[2px] w-6" style={{ background: GREEN }} />
            <span className="text-[14px] font-semibold uppercase tracking-wide" style={{ color: GREEN }}>
              Force Urbania Luxury Tour Services
            </span>
            <span className="h-[2px] w-6" style={{ background: GREEN }} />
          </div>
        </div>
        <div className="relative h-[110px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent z-10" />
          <img src={vehicle} alt="Force Urbania" width={230} height={110} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* CONTACT ROW */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[13px] font-medium" style={{ color: "#222" }}>
        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" style={{ color: DARK }} /> Pune, Maharashtra, India</span>
        <span style={{ color: "#bbb" }}>|</span>
        <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" style={{ color: DARK }} /> +91 98765 43210</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[13px] font-medium">
        <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" style={{ color: DARK }} /> info@shailrajtravels.com</span>
        <span style={{ color: "#bbb" }}>|</span>
        <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" style={{ color: DARK }} /> www.shailrajtravels.com</span>
      </div>

      {/* INVOICE BADGE */}
      <div className="mt-5 flex justify-center">
        <div
          className="rounded-[10px] px-16 py-2 text-white"
          style={{ background: DARK, boxShadow: "0 6px 14px rgba(8,47,112,0.25)" }}
        >
          <span className="text-[36px] font-extrabold uppercase tracking-wide">Invoice</span>
        </div>
      </div>

      {/* INVOICE INFO CARD */}
      <div className="mt-4 rounded-[10px] border" style={{ borderColor: BORDER }}>
        <div className="grid grid-cols-2">
          <div className="px-6 py-4 border-r" style={{ borderColor: BORDER }}>
            <InfoLine label="Invoice No." value="INV-2026-001" />
            <div className="h-3" />
            <InfoLine label="Invoice Date" value="04 June 2026" />
          </div>
          <div className="px-6 py-4">
            <InfoLine label="Booking ID" value="BK-1001" />
            <div className="h-3" />
            <InfoLine label="Due Date" value="10 June 2026" />
          </div>
        </div>
      </div>

      {/* BILL TO + TRIP DETAILS */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card title="BILL TO">
          <DetailRow label="Name" value="Rahul Sharma" />
          <DetailRow label="Mobile" value="+91 98765 43210" />
          <DetailRow label="Email" value="rahulsharma@gmail.com" />
          <div className="h-16" />
        </Card>
        <Card title="TRIP DETAILS">
          <DetailRow label="Package Name" value="Ujjain Spiritual Tour" />
          <DetailRow label="Duration" value="3 Days / 2 Nights" />
          <DetailRow label="Travel Date" value="15 June 2026 to 17 June 2026" />
          <DetailRow label="Vehicle Type" value="Force Urbania AC" />
          <DetailRow label="Pickup Point" value="Pune" />
        </Card>
      </div>

      {/* TABLE */}
      <div className="mt-4 overflow-hidden rounded-[6px] border" style={{ borderColor: BORDER }}>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr style={{ background: DARK, color: "white" }}>
              <th className="px-5 py-3 text-left text-[13px] font-bold uppercase">Description</th>
              <th className="px-5 py-3 text-center text-[13px] font-bold uppercase w-[120px]">Qty</th>
              <th className="px-5 py-3 text-center text-[13px] font-bold uppercase w-[140px]">Rate (₹)</th>
              <th className="px-5 py-3 text-right text-[13px] font-bold uppercase w-[160px]">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t" style={{ borderColor: BORDER }}>
              <td className="px-5 py-3">Package Price (Per Person)</td>
              <td className="px-5 py-3 text-center">4</td>
              <td className="px-5 py-3 text-center">6,000</td>
              <td className="px-5 py-3 text-right">24,000</td>
            </tr>
            <tr className="border-t" style={{ borderColor: BORDER }}><td className="px-5 py-5">&nbsp;</td><td /><td /><td /></tr>
            <tr className="border-t" style={{ borderColor: BORDER }}><td className="px-5 py-5">&nbsp;</td><td /><td /><td /></tr>
            <tr className="border-t" style={{ borderColor: BORDER }}>
              <td className="px-5 py-4" colSpan={2} />
              <td className="px-5 py-4 text-right text-[15px] font-bold uppercase" style={{ color: DARK }}>Total Amount</td>
              <td className="px-5 py-4 text-right text-[26px] font-extrabold" style={{ color: DARK }}>₹ 24,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PAYMENT + SIGNATURE */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card title="PAYMENT DETAILS">
          <DetailRow label="Payment Mode" value="Cash + Online" />
          <DetailRow label="Paid Amount" value="₹ 10,000" />
          <DetailRow label="Balance Amount" value="₹ 14,000" />
          <div className="mt-2 flex items-center text-[13px]">
            <div className="w-[130px] font-medium">Payment Status</div>
            <div className="w-3">:</div>
            <span
              className="ml-2 rounded-md px-4 py-1.5 text-[13px] font-bold uppercase text-white"
              style={{ background: GREEN }}
            >
              Partially Paid
            </span>
          </div>
        </Card>
        <Card title="AUTHORIZED SIGNATURE">
          <p className="text-[13px]">For Shailraj Tours and Travels</p>
          <div className="h-12" />
          <div className="mx-auto h-px w-3/4 bg-black" />
          <p className="mt-1 text-center text-[13px]">Authorized Signatory</p>
        </Card>
      </div>

      {/* THANK YOU */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <span style={{ color: GREEN }}>→</span>
        <div className="text-center">
          <div className="script text-[32px] leading-none" style={{ color: DARK }}>Thank You!</div>
          <div className="mt-1 text-[12px]">We look forward to serve you again.</div>
        </div>
        <span style={{ color: GREEN }}>←</span>
      </div>

      {/* FOOTER */}
      <div
        className="mt-4 -mx-[10mm] flex items-center justify-around px-6 py-3 text-[13px] font-medium text-white"
        style={{ background: DARK }}
      >
        <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</span>
        <span className="opacity-50">|</span>
        <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@shailrajtravels.com</span>
        <span className="opacity-50">|</span>
        <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> www.shailrajtravels.com</span>
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
    <div className="overflow-hidden rounded-[6px] border" style={{ borderColor: BORDER }}>
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
