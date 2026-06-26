import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import clientPromise from "./db";
import { getAdminToken } from "./token";
import { ObjectId } from "mongodb";
import { logAuditAction } from "./audit";
import { uploadImageToCloudinary } from "./cloudinary";
import { getCachedData, setCachedData, invalidateCache, rateLimiters, redis } from "./redis";
import { z } from "zod";

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

export const getTripOptionsFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const cached = await getCachedData<any[]>("admin:trip_options");
    if (cached) return cached;

    const client = await clientPromise;
    const db = client.db("shailraj");
    const options = await db.collection("trip_options").find({}).toArray();
    const mapped = options.map((o: any) => ({
      _id: o._id.toString(),
      name: o.name,
      dates: Array.isArray(o.dates)
        ? o.dates.map((d: any) => formatDateSafe(d))
        : typeof o.dates === "string"
          ? o.dates
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
      schedule: o.schedule || "",
      price: o.price || "",
      image: o.image || "",
      route: o.route || [],
      itinerary: o.itinerary || [],
      includes: o.includes || [],
    }));
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
    const client = await clientPromise;
    const db = client.db("shailraj");
    const processedData = await processTripImages(data.data);
    const res = await db.collection("trip_options").insertOne(processedData);
    await logAuditAction({
      data: {
        action: "Create Trip Option",
        entityType: "TripOption",
        details: `Added new trip option: ${processedData.name}`,
        entityId: res.insertedId.toString(),
      },
    });
    await invalidateCache("admin:trip_options");
    return { success: true, _id: res.insertedId.toString() };
  });

export const updateTripOptionFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string; data: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db("shailraj");
    const processedData = await processTripImages(data.data);
    delete processedData._id; // Prevent MongoDB immutable field error
    await db
      .collection("trip_options")
      .updateOne({ _id: new ObjectId(data.id) }, { $set: processedData });
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
    const client = await clientPromise;
    const db = client.db("shailraj");
    const trip = await db.collection("trip_options").findOne({ _id: new ObjectId(data.id) });
    await db.collection("trip_options").deleteOne({ _id: new ObjectId(data.id) });
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
      const { initWhatsApp, getStatus } = await import("./whatsapp");
      if (getStatus().status === "Disconnected") {
        initWhatsApp().catch((err) => console.error("WhatsApp background auto-start error:", err));
      }
    } catch (e) {
      console.error("Failed to trigger WhatsApp background auto-start:", e);
    }

    try {
      const cached = await getCachedData<any[]>("admin:bookings");
      if (cached) return cached;

      const client = await clientPromise;
      const db = client.db("shailraj");
      const bookings = await db.collection("bookings").find({}).sort({ createdAt: -1 }).toArray();
      const trips = await db.collection("trip_options").find({}).toArray();
      const packages = await db.collection("packages").find({}).toArray();

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
    const client = await clientPromise;
    const db = client.db("shailraj");
    await db.collection("bookings").updateOne(
      { _id: new ObjectId(data.bookingId) },
      {
        $set: {
          isInvoiceLocked: true,
          invoiceCustomData: data.invoiceCustomData,
          paymentStatus: data.invoiceCustomData?.paymentStatus || "PENDING",
        },
      },
    );
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
        const booking = await db
          .collection("bookings")
          .findOne({ _id: new ObjectId(data.bookingId) });
        if (booking) {
          const { sendBookingInvoicePDF } = await import("./whatsapp");
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
    const client = await clientPromise;
    const db = client.db("shailraj");
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(data.bookingId) });
    if (!booking) throw new Error("Booking not found");

    if (data.phone) {
      booking.phone = data.phone;
    }

    const { sendBookingInvoicePDF } = await import("./whatsapp");
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

      const client = await clientPromise;
      const db = client.db("shailraj");

      const requestedPersons = Number(data.persons) || 1;

      // Determine dynamic seats limit based on database or frontend fallback
      let seatsLimit = 16;
      const pkg = await db.collection("packages").findOne({ title: data.tripName });
      if (pkg) {
        seatsLimit =
          pkg.seatsTotal !== undefined && pkg.seatsTotal !== null ? Number(pkg.seatsTotal) : 16;
      } else {
        const tripOption = await db.collection("trip_options").findOne({ name: data.tripName });
        if (tripOption) {
          seatsLimit =
            tripOption.seatsTotal !== undefined && tripOption.seatsTotal !== null
              ? Number(tripOption.seatsTotal)
              : 20;
        }
      }

      // Prevent overbooking
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

      const newBooking = {
        ...data,
        persons: requestedPersons,
        status: "Pending",
        paymentStatus: data.paymentStatus || "PENDING",
        createdAt: new Date(),
      };
      const res = await db.collection("bookings").insertOne(newBooking);
      // Save Idempotency Key
      if (data.idempotencyKey && redis) {
        await redis.set(`idempotency:booking:${data.idempotencyKey}`, res.insertedId.toString(), {
          ex: 86400,
        }); // 24 hours
      }

      // Send WhatsApp Notification
      try {
        const { sendAdminNotification } = await import("./whatsapp");
        const msg = `*New Booking Received!*\nName: ${newBooking.name}\nPhone: ${newBooking.phone}\nTrip: ${newBooking.tripName || newBooking.customDestination}\nPersons: ${newBooking.persons}\nDate: ${newBooking.travelDate || "N/A"}${newBooking.pickupLocation ? `\nPickup: ${newBooking.pickupLocation}` : ""}`;
        await sendAdminNotification(msg);
      } catch (waErr) {
        console.error("Failed to send WhatsApp notification", waErr);
      }

      await invalidateCache("admin:bookings");
      return { success: true, _id: res.insertedId.toString() };
    } catch (error: any) {
      console.error("Failed to submit booking", error);
      throw new Error(error.message || "Failed to submit booking");
    }
  });

export const updateBookingStatusFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string; status: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db("shailraj");

    // Fetch booking details first to send WhatsApp to target phone
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(data.id) });
    if (!booking) throw new Error("Booking not found");

    await db
      .collection("bookings")
      .updateOne({ _id: new ObjectId(data.id) }, { $set: { status: data.status } });

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
          const { sendWhatsAppMessage } = await import("./whatsapp");
          await sendWhatsAppMessage(booking.phone, msg);
        } catch (waErr) {
          console.error("Failed to send status update WhatsApp notification", waErr);
        }
      }
    }

    await invalidateCache("admin:bookings");
    return { success: true };
  });

export const updateBookingPaymentStatusFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string; paymentStatus: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db("shailraj");

    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(data.id) });
    if (!booking) throw new Error("Booking not found");

    const updateFields: any = { paymentStatus: data.paymentStatus };
    if (booking.invoiceCustomData) {
      updateFields["invoiceCustomData.paymentStatus"] = data.paymentStatus;
      booking.invoiceCustomData.paymentStatus = data.paymentStatus;
    }
    booking.paymentStatus = data.paymentStatus;

    await db
      .collection("bookings")
      .updateOne({ _id: new ObjectId(data.id) }, { $set: updateFields });

    await logAuditAction({
      data: {
        action: "Update Booking Payment Status",
        entityType: "Booking",
        details: `Changed payment status to ${data.paymentStatus}`,
        entityId: data.id,
      },
    });

    // Auto-send PDF invoice via WhatsApp if status is PAID
    let whatsappSent = false;
    let whatsappError = undefined;

    if (data.paymentStatus === "PAID") {
      try {
        const { sendBookingInvoicePDF } = await import("./whatsapp");
        whatsappSent = await sendBookingInvoicePDF(booking);
      } catch (err: any) {
        console.error("Failed to auto-send PDF invoice from updateBookingPaymentStatusFn:", err);
        whatsappError = err.message || String(err);
      }
    }

    await invalidateCache("admin:bookings");
    return { success: true, whatsappSent, whatsappError };
  });

export const deleteBookingFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db("shailraj");
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(data.id) });
    await db.collection("bookings").deleteOne({ _id: new ObjectId(data.id) });
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
