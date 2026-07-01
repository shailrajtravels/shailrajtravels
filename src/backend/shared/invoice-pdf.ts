/**
 * invoice-pdf.ts
 *
 * Uses Puppeteer to visit the /invoice-print route (which renders the EXISTING
 * InvoicePrint React component) and captures the page as a PDF.
 *
 * This guarantees: customer PDF === admin invoice section view (no mismatch).
 */

/** Try to find which port the dev server is using */
async function detectServerPort(): Promise<number> {
  const candidates = [8080, 8081, 3000, 5173, 4173];
  for (const port of candidates) {
    try {
      const res = await fetch(`http://localhost:${port}/`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.status < 500) return port;
    } catch (_) {
      // not running on this port, try next
    }
  }
  return 8080; // fallback
}

/**
 * Generate a PDF by rendering the InvoicePrint component in a headless browser.
 *
 * @param bookingId          MongoDB _id of the booking
 * @param adminToken         Admin token (for server fn auth)
 * @param generatedInvoiceNo Sequential invoice number like "INV-V0048"
 */
export async function generateInvoicePDFViaPuppeteer(
  bookingId: string,
  adminToken: string,
  generatedInvoiceNo: string,
): Promise<Buffer> {
  const { default: puppeteer } = await import('puppeteer');

  const port = await detectServerPort();
  const url =
    `http://localhost:${port}/invoice-print` +
    `?bookingId=${encodeURIComponent(bookingId)}` +
    `&adminToken=${encodeURIComponent(adminToken)}` +
    `&generatedInvoiceNo=${encodeURIComponent(generatedInvoiceNo)}`;

  console.log(`[InvoicePDF] Rendering invoice via: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });

    // Navigate and wait for the InvoicePrint component to fully render
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });

    // Wait for the invoice div to appear (InvoicePrint renders id="invoice-{bookingId}")
    try {
      await page.waitForSelector(`[id^="invoice-"]`, { timeout: 10_000 });
    } catch (_) {
      // Continue even if selector not found — component might use a different id
    }

    // Extra wait to ensure images (logos, stamp) are fully loaded
    await new Promise((r) => setTimeout(r, 1500));

    // Print to PDF — Puppeteer uses @media print rules,
    // which hides .no-print elements (Edit/Send/Print buttons) automatically
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    console.log(`[InvoicePDF] PDF generated successfully (${pdfBuffer.byteLength} bytes)`);
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
