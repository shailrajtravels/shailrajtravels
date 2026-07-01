import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { tripOptionRepository } from '@/backend/shared/repositories/TripOptionRepository';
import { bookingRepository } from '@/backend/shared/repositories/BookingRepository';
import { packageRepository } from '@/backend/shared/repositories/PackageRepository';
import { getAdminToken } from '@/backend/infrastructure/token';
import { ObjectId } from 'mongodb';
import { logAuditAction } from '@/backend/shared/audit';
import { uploadImageToCloudinary } from '@/backend/shared/cloudinary';
import { getCachedData, setCachedData, invalidateCache, rateLimiters, redis } from '@/backend/infrastructure/redis';
import { z } from 'zod';

// ---- TRIP OPTIONS ----

const formatDateSafe = (d: any): string => {
  if (!d) return "";
  if (d instanceof Date) {
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  if (typeof d === "object") {
    try {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch (e) {}
  }
  return String(d);
};

export const isUpcomingDate = (dateStr: string): boolean => {
  if (typeof dateStr !== 'string') return false;
  
  const cleanStr = dateStr.trim();
  
  // Extract year from string if present, otherwise default to current year
  const yearMatch = cleanStr.match(/\b(\d{4})\b/);
  const year = yearMatch ? yearMatch[1] : String(new Date().getFullYear());
  
  // Parse start date from range if it's a range
  const startPart = cleanStr.split(/\s+to\s+/i)[0].trim();
  
  // Clean startPart: remove day names (Sun, Mon, etc.) to help parser
  const cleanStart = startPart.replace(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\.?\s+/i, '').trim();
  
  // If the cleanStart doesn't end with a year, append the extracted year
  const finalParseString = /\b\d{4}\b/.test(cleanStart) 
    ? cleanStart 
    : `${cleanStart} ${year}`;
    
  const parsedDate = new Date(finalParseString);
  
  if (!isNaN(parsedDate.getTime())) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return parsedDate >= now;
  }
  
  return true;
};

const generateRecurringDatesForCurrentAndNextMonth = (pattern: any): string[] => {
  if (!pattern || !pattern.active) return [];
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthsToGenerate = [
    { month: currentMonth, year: currentYear },
    { month: (currentMonth + 1) % 12, year: currentMonth === 11 ? currentYear + 1 : currentYear }
  ];
  
  const generated: string[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (const item of monthsToGenerate) {
    const { month, year } = item;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    if (pattern.mode === 'individual' && Array.isArray(pattern.days)) {
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (pattern.days.includes(date.getDay())) {
          const dayName = dayNames[date.getDay()];
          const monthName = monthNames[month];
          generated.push(`${dayName} ${day} ${monthName} ${year}`);
        }
      }
    } else if (pattern.mode === 'range') {
      const { startDay, endDay } = pattern;
      if (typeof startDay === 'number' && typeof endDay === 'number') {
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
            
            generated.push(`${startDayName} ${day} ${startMonthName} to ${endDayName} ${endDate.getDate()} ${endMonthName} ${endDate.getFullYear()}`);
          }
        }
      }
    }
  }
  
  return generated;
};

export const getTripOptionsFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const cached = await getCachedData<any[]>("admin:trip_options");
    if (cached) return cached;

    const options = await tripOptionRepository.findAll();
    const mapped = options.map((o: any) => {
      let combinedDates = Array.isArray(o.dates)
        ? o.dates.map((d: any) => formatDateSafe(d))
        : typeof o.dates === "string"
          ? o.dates.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];
      
      if (o.recurringPattern && o.recurringPattern.active) {
        const generated = generateRecurringDatesForCurrentAndNextMonth(o.recurringPattern);
        generated.forEach((d: string) => {
          if (!combinedDates.includes(d)) {
            combinedDates.push(d);
          }
        });
      }

      const upcomingDates = combinedDates.filter(isUpcomingDate);

      return {
        _id: o._id.toString(),
        name: o.name,
        dates: upcomingDates,
        recurringPattern: o.recurringPattern || null,
        schedule: o.schedule || "",
        price: o.price || "",
        image: o.image || "",
        route: o.route || [],
        itinerary: o.itinerary || [],
        includes: o.includes || [],
      };
    });
    await setCachedData("admin:trip_options", mapped);
    return mapped;
  } catch (error) {
    console.error("Failed to fetch trip options", error);
    return [];
  }
});

const processTripImages = async (tripData: any) => {
  const newData = { ...tripData };
  if (newData.image && newData.image.startsWith("data:image")) {
    newData.image = await uploadImageToCloudinary(newData.image, "trips");
  }
  return newData;
};

export const createTripOptionFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; data: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const processedData = await processTripImages(data.data);
    const insertedId = await tripOptionRepository.insertOne(processedData);
    await logAuditAction({
      data: {
        action: "Create Trip Option",
        entityType: "TripOption",
        details: `Added new trip option: ${processedData.name}`,
        entityId: insertedId,
      },
    });
    await invalidateCache("admin:trip_options");
    return { success: true, _id: insertedId };
  });

export const updateTripOptionFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string; data: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const processedData = await processTripImages(data.data);
    delete processedData._id; // Prevent MongoDB immutable field error
    await tripOptionRepository.updateOne(data.id, processedData);
    await logAuditAction({
      data: {
        action: "Update Trip Option",
        entityType: "TripOption",
        details: `Updated trip option: ${processedData.name}`,
        entityId: data.id,
      },
    });
    await invalidateCache("admin:trip_options");
    return { success: true };
  });

export const deleteTripOptionFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const trip = await tripOptionRepository.findById(data.id);
    await tripOptionRepository.deleteOne(data.id);
    if (trip) {
      await logAuditAction({
        data: {
          action: "Delete Trip Option",
          entityType: "TripOption",
          details: `Deleted trip option: ${trip.name}`,
          entityId: data.id,
        },
      });
    }
    await invalidateCache("admin:trip_options");
    return { success: true };
  });

// ---- BOOKINGS ----

export const getBookingsFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");

    // Background lazy-start WhatsApp engine if disconnected
    try {
      const { initWhatsApp, getStatus } = await import('@/backend/infrastructure/whatsapp');
      if (getStatus().status === "Disconnected") {
        initWhatsApp().catch((err) => console.error("WhatsApp background auto-start error:", err));
      }
    } catch (e) {
      console.error("Failed to trigger WhatsApp background auto-start:", e);
    }

    try {
      const cached = await getCachedData<any[]>("admin:bookings");
      if (cached) return cached;

      const bookings = await bookingRepository.findAllSorted();
      const trips = await tripOptionRepository.findAll();
      const packages = await packageRepository.findAllSorted();

      const getBookingDefaultRate = (tripName: string) => {
        const trip = trips.find((t: any) => t.name === tripName);
        if (trip && trip.price) {
          const parsed = parseFloat(trip.price.replace(/[^\d.]/g, ""));
          if (!isNaN(parsed)) return parsed;
        }
        const pkg = packages.find((p: any) => p.title === tripName);
        if (pkg && pkg.price) {
          const parsed = parseFloat(pkg.price.replace(/[^\d.]/g, ""));
          if (!isNaN(parsed)) return parsed;
        }
        return 6000;
      };

      const mapped = bookings.map((b: any) => ({
        _id: b._id.toString(),
        name: b.name,
        phone: b.phone,
        pickupLocation: b.pickupLocation,
        tripName: b.tripName,
        customDestination: b.customDestination,
        persons: b.persons,
        travelDate: b.travelDate,
        status: b.status || "Pending",
        paymentStatus: b.paymentStatus || "PENDING",
        createdAt: b.createdAt,
        isInvoiceLocked: b.isInvoiceLocked || false,
        invoiceCustomData: b.invoiceCustomData || null,
        defaultRate: getBookingDefaultRate(b.tripName),
      }));

      await setCachedData("admin:bookings", mapped);
      return mapped;
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      return [];
    }
  });

export const saveInvoiceFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; bookingId: string; invoiceCustomData: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    await bookingRepository.updateOne(data.bookingId, {
      isInvoiceLocked: true,
      invoiceCustomData: data.invoiceCustomData,
      paymentStatus: data.invoiceCustomData?.paymentStatus || "PENDING",
    });
    await logAuditAction({
      data: {
        action: "Lock Invoice",
        entityType: "Booking",
        details: `Saved custom invoice data and locked invoice`,
        entityId: data.bookingId,
      },
    });

    // Auto-send PDF invoice via WhatsApp if status is PAID
    let whatsappSent = false;
    let whatsappError = undefined;

    if (data.invoiceCustomData?.paymentStatus === "PAID") {
      try {
        const booking = await bookingRepository.findById(data.bookingId);
        if (booking) {
          const { sendBookingInvoicePDF } = await import('@/backend/infrastructure/whatsapp');
          whatsappSent = await sendBookingInvoicePDF(booking);
        }
      } catch (err: any) {
        console.error("Failed to auto-send PDF invoice from saveInvoiceFn:", err);
        whatsappError = err.message || String(err);
      }
    }

    await invalidateCache("admin:bookings");
    return { success: true, whatsappSent, whatsappError };
  });

export const sendInvoiceWhatsAppFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; bookingId: string; phone?: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const booking = await bookingRepository.findById(data.bookingId);
    if (!booking) throw new Error("Booking not found");

    if (data.phone) {
      booking.phone = data.phone;
    }

    const { sendBookingInvoicePDF } = await import('@/backend/infrastructure/whatsapp');
    const success = await sendBookingInvoicePDF(booking);
    if (!success) {
      throw new Error(
        "Failed to send WhatsApp invoice. Make sure WhatsApp Engine is connected and customer phone number is correct.",
      );
    }
    return { success: true };
  });

const bookingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  tripName: z.string().min(1, "Trip name is required"),
  travelDate: z.string().optional(),
  persons: z.union([z.string(), z.number()]).optional(),
  customDestination: z.string().optional(),
  pickupLocation: z.string().optional(),
  paymentStatus: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const createBookingFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => bookingSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      // Rate Limiting Check
      if (rateLimiters.booking) {
        const req = getRequest();
        const ip =
          req?.headers.get("x-forwarded-for") ||
          req?.headers.get("x-real-ip") ||
          data.phone ||
          "unknown";
        const { success } = await rateLimiters.booking.limit(`booking:${ip}`);
        if (!success) {
          throw new Error("Too many booking requests. Please try again later.");
        }
      }

      // Idempotency Check
      if (data.idempotencyKey && redis) {
        const isDuplicate = await redis.get(`idempotency:booking:${data.idempotencyKey}`);
        if (isDuplicate) {
          return { success: true, cached: true, _id: isDuplicate };
        }
      }

      const requestedPersons = Number(data.persons) || 1;

      // Determine dynamic seats limit based on database or frontend fallback
      let seatsLimit = 16;
      const pkg = await packageRepository.findByQuery({ title: data.tripName }).then((r: any[]) => r[0]);
      if (pkg) {
        seatsLimit =
          pkg.seatsTotal !== undefined && pkg.seatsTotal !== null ? Number(pkg.seatsTotal) : 16;
      } else {
        const tripOption = await tripOptionRepository.findByQuery({ name: data.tripName }).then((r: any[]) => r[0]);
        if (tripOption) {
          seatsLimit =
            tripOption.seatsTotal !== undefined && tripOption.seatsTotal !== null
              ? Number(tripOption.seatsTotal)
              : 20;
        }
      }

      // Prevent overbooking (Disabled to allow unlimited capacity)
      /*
      const existingBookings = await db
        .collection("bookings")
        .find({
          tripName: data.tripName,
          travelDate: data.travelDate,
          status: { $ne: "Cancelled" },
        })
        .toArray();

      const totalExistingPersons = existingBookings.reduce(
        (sum: number, b: any) => sum + (Number(b.persons) || 1),
        0,
      );

      if (totalExistingPersons + requestedPersons > seatsLimit) {
        throw new Error(
          `Not enough seats available. Only ${Math.max(0, seatsLimit - totalExistingPersons)} seats left.`,
        );
      }
      */

      const newBooking = {
        ...data,
        persons: requestedPersons,
        status: "Pending",
        paymentStatus: data.paymentStatus || "PENDING",
        createdAt: new Date(),
      };
      const insertedId = await bookingRepository.insertOne(newBooking);
      // Save Idempotency Key
      if (data.idempotencyKey && redis) {
        await redis.set(`idempotency:booking:${data.idempotencyKey}`, insertedId, {
          ex: 86400,
        }); // 24 hours
      }

      // Send WhatsApp Notification to Admin
      try {
        const { sendAdminNotification, sendWhatsAppMessage } = await import('@/backend/infrastructure/whatsapp');
        const msg = `*New Booking Received!*\nName: ${newBooking.name}\nPhone: ${newBooking.phone}\nTrip: ${newBooking.tripName || newBooking.customDestination}\nPersons: ${newBooking.persons}\nDate: ${newBooking.travelDate || "N/A"}${newBooking.pickupLocation ? `\nPickup: ${newBooking.pickupLocation}` : ""}`;
        await sendAdminNotification(msg);
        
        // Send Automated Welcome/Acknowledgment to Customer
        if (newBooking.phone) {
          const tripName = newBooking.tripName === "custom" ? newBooking.customDestination || "Custom Trip" : newBooking.tripName;
          const customerMsg = `*Welcome to Shailraj Travels!* 🙏\n\nHi *${newBooking.name}*,\nThank you for reaching out to us regarding the *${tripName}*. We have successfully received your inquiry.\n\nOur team will review your request and get back to you shortly with the best package options and details.\n\nIf you have any urgent queries, feel free to reply to this message or call us!\n\n— Shailraj Travels, Pune 🚩`;
          await sendWhatsAppMessage(newBooking.phone, customerMsg);
        }
      } catch (waErr) {
        console.error("Failed to send WhatsApp notification", waErr);
      }

      await invalidateCache("admin:bookings");
      return { success: true, _id: insertedId };
    } catch (error: any) {
      console.error("Failed to submit booking", error);
      throw new Error(error.message || "Failed to submit booking");
    }
  });

export const updateBookingStatusFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string; status: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");

    // Fetch booking details first to send WhatsApp to target phone
    const booking = await bookingRepository.findById(data.id);
    if (!booking) throw new Error("Booking not found");

    await bookingRepository.updateOne(data.id, { status: data.status });

    await logAuditAction({
      data: {
        action: "Update Booking",
        entityType: "Booking",
        details: `Changed booking status to ${data.status}`,
        entityId: data.id,
      },
    });

    if (booking && booking.phone) {
      const customerName = booking.name || "Customer";
      const tripName =
        booking.tripName === "custom"
          ? booking.customDestination || "Custom Trip"
          : booking.tripName;
      const travelDate = booking.travelDate || "N/A";

      let msg = "";
      if (data.status === "Confirmed") {
        msg = `*Booking Confirmed!* 🚩\n\nHello *${customerName}*,\nYour booking with *Shailraj Travels* for *${tripName}* (Date: ${travelDate}) has been *Confirmed*. \n\nThank you for choosing us for your spiritual journey! 🙏`;
      } else if (data.status === "Cancelled") {
        msg = `*Booking Cancelled*\n\nHello *${customerName}*,\nYour booking with *Shailraj Travels* for *${tripName}* (Date: ${travelDate}) has been *Cancelled*.\n\nFor any queries or refund information, please contact us. 🙏`;
      }

      if (msg) {
        try {
          const { sendWhatsAppMessage } = await import('@/backend/infrastructure/whatsapp');
          await sendWhatsAppMessage(booking.phone, msg);
        } catch (waErr) {
          console.error("Failed to send status update WhatsApp notification", waErr);
        }
      }
    }

    await invalidateCache("admin:bookings");
    return { success: true };
  });

export const sendBookingReplyFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string; message: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const booking = await bookingRepository.findById(data.id);
    if (!booking) throw new Error("Booking not found");
    if (!booking.phone) throw new Error("Customer phone number is missing");

    try {
      const { sendWhatsAppMessage } = await import('@/backend/infrastructure/whatsapp');
      await sendWhatsAppMessage(booking.phone, data.message);

      await logAuditAction({
        data: {
          action: "Reply to Booking",
          entityType: "Booking",
          details: `Sent custom WhatsApp reply to ${booking.name || "Customer"}`,
          entityId: data.id,
        },
      });
      return { success: true };
    } catch (waErr: any) {
      console.error("Failed to send WhatsApp reply", waErr);
      throw new Error(waErr.message || "Failed to send WhatsApp reply. Make sure the engine is connected.");
    }
  });

export const updateBookingPaymentStatusFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string; paymentStatus: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const booking = await bookingRepository.findById(data.id);
    if (!booking) throw new Error("Booking not found");

    // Always sync both root paymentStatus AND invoiceCustomData.paymentStatus
    // so the invoice PDF always reflects the correct status whether locked or not
    const updateFields: any = { paymentStatus: data.paymentStatus };
    // Always update invoiceCustomData.paymentStatus if invoiceCustomData exists
    if (booking.invoiceCustomData) {
      updateFields["invoiceCustomData.paymentStatus"] = data.paymentStatus;
    }

    await bookingRepository.updateOne(data.id, updateFields);

    await logAuditAction({
      data: {
        action: "Update Booking Payment Status",
        entityType: "Booking",
        details: `Changed payment status to ${data.paymentStatus}`,
        entityId: data.id,
      },
    });

    // ── PIPELINE: Pending → PAID ────────────────────────────────────────────
    // Re-fetch AFTER the DB write so the invoice reflects the new PAID status
    let whatsappSent = false;
    let whatsappError: string | undefined = undefined;

    if (data.paymentStatus === "PAID") {
      try {
        const updatedBooking = await bookingRepository.findById(data.id);

        if (updatedBooking) {
          const { sendBookingInvoicePDF, sendWhatsAppMessage } = await import('@/backend/infrastructure/whatsapp');

          // Compute the sequential invoice number the same way the Invoices section does.
          // We pass this to the /invoice-print route so Puppeteer renders INV-V0048 etc.
          const invoiceNo =
            updatedBooking.invoiceCustomData?.invoiceNo ||
            updatedBooking.generatedInvoiceNo ||
            `INV-${new Date(updatedBooking.createdAt || Date.now()).getFullYear()}-${updatedBooking._id.toString().slice(-6).toUpperCase()}`;

          // 1. Open the /invoice-print route in Puppeteer and capture the EXACT
          //    same invoice the admin sees → send PDF to customer via WhatsApp
          whatsappSent = await sendBookingInvoicePDF(
            updatedBooking,
            data.adminToken,
            invoiceNo,
          );

          // 2. Also send a payment confirmation text message to the customer
          if (whatsappSent && updatedBooking.phone) {
            const customerName = updatedBooking.name || "Customer";
            const tripName =
              updatedBooking.invoiceCustomData?.packageName ||
              (updatedBooking.tripName === "custom"
                ? updatedBooking.customDestination || "Custom Trip"
                : updatedBooking.tripName || "Your Trip");
            const travelDate = updatedBooking.travelDate || "N/A";

            const confirmationMsg =
              `✅ *Payment Confirmed — Shailraj Travels* 🙏\n\n` +
              `Hello *${customerName}*,\n\n` +
              `Your payment for *${tripName}* (Travel Date: ${travelDate}) has been marked as *PAID*.\n\n` +
              `📄 Invoice No: *${invoiceNo}*\n\n` +
              `The official invoice PDF is attached above. Please keep it for your records.\n\n` +
              `We wish you a blessed and comfortable journey! 🚩\n\n` +
              `— Shailraj Travels, Pune`;

            await sendWhatsAppMessage(updatedBooking.phone, confirmationMsg);
          }
        }
      } catch (err: any) {
        console.error("[Pipeline] Failed to send PAID invoice via WhatsApp:", err);
        whatsappError = err.message || String(err);
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    await invalidateCache("admin:bookings");
    return { success: true, whatsappSent, whatsappError };
  });

export const deleteBookingFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const booking = await bookingRepository.findById(data.id);
    await bookingRepository.deleteOne(data.id);
    if (booking) {
      await logAuditAction({
        data: {
          action: "Delete Booking",
          entityType: "Booking",
          details: `Deleted booking for ${booking.name}`,
          entityId: data.id,
        },
      });
    }
    await invalidateCache("admin:bookings");
    return { success: true };
  });

// ── Invoice Print Route — fetch booking for PDF generation ───────────────────
// Used by the /invoice-print route so Puppeteer can render InvoicePrint exactly
export const getBookingForPrintFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; bookingId: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const booking = await bookingRepository.findById(data.bookingId);
    if (!booking) throw new Error("Booking not found");
    // Return as plain JSON (no MongoDB ObjectId)
    return JSON.parse(JSON.stringify(booking));
  });

export const getPublicStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const bookingsCol = await (await import('@/backend/shared/database/StorageManager')).storageManager.getCollectionForRead("booking", "dummy", "bookings");
    const confirmedBookings = await bookingsCol
      .find({ status: "Confirmed" }, { projection: { persons: 1 } })
      .toArray();
      
    const travelersCount = confirmedBookings.reduce((sum: number, b: any) => {
      const p = parseInt(b.persons);
      return sum + (isNaN(p) ? 1 : p);
    }, 0);
    
    // Total destinations / packages / tours
    const storage = (await import('@/backend/shared/database/StorageManager')).storageManager;
    const packagesCount = await (await storage.getGlobalCollection("packages")).countDocuments();
    const toursCount = await (await storage.getGlobalCollection("tours")).countDocuments();
    const tripOptionsCount = await (await storage.getGlobalCollection("trip_options")).countDocuments();

    // Average rating
    const reviewsCollection = await storage.getGlobalCollection("reviews");
    const reviews = await reviewsCollection
      .find({}, { projection: { rating: 1 } })
      .toArray();
    const totalRating = reviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 5), 0);
    const avgRating = reviews.length > 0 ? (totalRating / reviews.length) : 4.9;

    return {
      travelersCount,
      packagesCount,
      toursCount,
      tripOptionsCount,
      avgRating,
    };
  } catch (error) {
    console.error("Failed to fetch public stats", error);
    return {
      travelersCount: 0,
      packagesCount: 0,
      toursCount: 0,
      tripOptionsCount: 0,
      avgRating: 4.9,
    };
  }
});
