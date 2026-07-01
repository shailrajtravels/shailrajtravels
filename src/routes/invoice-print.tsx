/**
 * /invoice-print route
 *
 * A minimal, print-only page that renders the EXISTING InvoicePrint component
 * with the booking data fetched from the database.
 *
 * Used by the WhatsApp pipeline: Puppeteer visits this URL → prints to PDF →
 * sends to customer. This guarantees the PDF the customer receives is EXACTLY
 * the same invoice the admin sees in the Invoices section.
 *
 * URL: /invoice-print?bookingId=XXX&adminToken=YYY&generatedInvoiceNo=INV-V0048
 */
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { InvoicePrint } from '@/frontend/shared/components/InvoicePrint';
import { getBookingForPrintFn } from '@/backend/shared/bookings';

export const Route = createFileRoute("/invoice-print")({
  validateSearch: (s: Record<string, unknown>) => ({
    bookingId: String(s.bookingId || ""),
    adminToken: String(s.adminToken || ""),
    // Sequential invoice number computed client-side (e.g., INV-V0048)
    generatedInvoiceNo: String(s.generatedInvoiceNo || ""),
  }),
  component: InvoicePrintPage,
});

function InvoicePrintPage() {
  const { bookingId, adminToken, generatedInvoiceNo } = Route.useSearch();
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId || !adminToken) {
      setError("Missing bookingId or adminToken");
      return;
    }
    getBookingForPrintFn({ data: { bookingId, adminToken } })
      .then((b: any) => {
        // Inject the sequential invoice number so InvoicePrint shows INV-V0048
        // (same as shown in the Invoices section list)
        if (generatedInvoiceNo) b.generatedInvoiceNo = generatedInvoiceNo;
        setBooking(b);
      })
      .catch((e: any) => setError(e.message || "Failed to load booking"));
  }, [bookingId, adminToken, generatedInvoiceNo]);

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif", color: "#c00" }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif", color: "#555" }}>
        Loading invoice…
      </div>
    );
  }

  return (
    <>
      {/* Hide ALL interactive controls — Puppeteer uses print media,
          but this extra rule ensures nothing unexpected shows. */}
      <style>{`
        body { margin: 0; background: white; }
        .no-print { display: none !important; }
      `}</style>

      {/* THE EXISTING InvoicePrint component — no new template, no mismatch */}
      <InvoicePrint
        booking={booking}
        token={null}    /* read-only — no save/send buttons needed */
        onSuccess={() => {}}
      />
    </>
  );
}
