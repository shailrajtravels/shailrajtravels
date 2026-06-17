import { createServerFn } from '@tanstack/react-start';
import clientPromise from './db';
import { getAdminToken } from './token';
import { ObjectId } from 'mongodb';
import { logAuditAction } from './audit';
import { uploadImageToCloudinary } from './cloudinary';

// ---- TRIP OPTIONS ----

const formatDateSafe = (d: any): string => {
  if (!d) return '';
  if (d instanceof Date) {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  if (typeof d === 'object') {
    try {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) {}
  }
  return String(d);
};

export const getTripOptionsFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const client = await clientPromise;
    const db = client.db('shailraj');
    const options = await db.collection('trip_options').find({}).toArray();
    return options.map((o: any) => ({
      _id: o._id.toString(),
      name: o.name,
      dates: Array.isArray(o.dates)
        ? o.dates.map((d: any) => formatDateSafe(d))
        : typeof o.dates === 'string'
        ? o.dates.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      schedule: o.schedule || '',
      price: o.price || '',
      image: o.image || '',
      route: o.route || [],
      itinerary: o.itinerary || [],
      includes: o.includes || [],
    }));
  } catch (error) {
    console.error("Failed to fetch trip options", error);
    return [];
  }
});

const processTripImages = async (tripData: any) => {
  const newData = { ...tripData };
  if (newData.image && newData.image.startsWith('data:image')) {
    newData.image = await uploadImageToCloudinary(newData.image, "trips");
  }
  return newData;
};

export const createTripOptionFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, data: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db('shailraj');
    const processedData = await processTripImages(data.data);
    const res = await db.collection('trip_options').insertOne(processedData);
    await logAuditAction({ data: { action: "Create Trip Option", entityType: "TripOption", details: `Added new trip option: ${processedData.name}`, entityId: res.insertedId.toString() } });
    return { success: true, _id: res.insertedId.toString() };
  });

export const updateTripOptionFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, id: string, data: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db('shailraj');
    const processedData = await processTripImages(data.data);
    delete processedData._id; // Prevent MongoDB immutable field error
    await db.collection('trip_options').updateOne(
      { _id: new ObjectId(data.id) },
      { $set: processedData }
    );
    await logAuditAction({ data: { action: "Update Trip Option", entityType: "TripOption", details: `Updated trip option: ${processedData.name}`, entityId: data.id } });
    return { success: true };
  });

export const deleteTripOptionFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db('shailraj');
    const trip = await db.collection('trip_options').findOne({ _id: new ObjectId(data.id) });
    await db.collection('trip_options').deleteOne({ _id: new ObjectId(data.id) });
    if (trip) {
      await logAuditAction({ data: { action: "Delete Trip Option", entityType: "TripOption", details: `Deleted trip option: ${trip.name}`, entityId: data.id } });
    }
    return { success: true };
  });

// ---- BOOKINGS ----

export const getBookingsFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    try {
      const client = await clientPromise;
      const db = client.db('shailraj');
      const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();
      const trips = await db.collection('trip_options').find({}).toArray();
      const packages = await db.collection('packages').find({}).toArray();

      const getBookingDefaultRate = (tripName: string) => {
        const trip = trips.find((t: any) => t.name === tripName);
        if (trip && trip.price) {
          const parsed = parseFloat(trip.price.replace(/[^\d.]/g, ''));
          if (!isNaN(parsed)) return parsed;
        }
        const pkg = packages.find((p: any) => p.title === tripName);
        if (pkg && pkg.price) {
          const parsed = parseFloat(pkg.price.replace(/[^\d.]/g, ''));
          if (!isNaN(parsed)) return parsed;
        }
        return 6000;
      };

      return bookings.map((b: any) => ({
        _id: b._id.toString(),
        name: b.name,
        phone: b.phone,
        tripName: b.tripName,
        customDestination: b.customDestination,
        persons: b.persons,
        travelDate: b.travelDate,
        status: b.status || 'Pending',
        createdAt: b.createdAt,
        isInvoiceLocked: b.isInvoiceLocked || false,
        invoiceCustomData: b.invoiceCustomData || null,
        defaultRate: getBookingDefaultRate(b.tripName),
      }));
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      return [];
    }
  });

export const saveInvoiceFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, bookingId: string, invoiceCustomData: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db('shailraj');
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(data.bookingId) },
      { $set: { isInvoiceLocked: true, invoiceCustomData: data.invoiceCustomData } }
    );
    await logAuditAction({ data: { action: "Lock Invoice", entityType: "Booking", details: `Saved custom invoice data and locked invoice`, entityId: data.bookingId } });
    return { success: true };
  });

export const createBookingFn = createServerFn({ method: 'POST' })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    try {
      const client = await clientPromise;
      const db = client.db('shailraj');

      const requestedPersons = Number(data.persons) || 1;

      // Prevent overbooking (Max 16 seats)
      const existingBookings = await db.collection('bookings').find({
        tripName: data.tripName,
        travelDate: data.travelDate,
        status: { $ne: 'Cancelled' }
      }).toArray();

      const totalExistingPersons = existingBookings.reduce((sum: number, b: any) => sum + (Number(b.persons) || 1), 0);
      
      if (totalExistingPersons + requestedPersons > 16) {
        throw new Error(`Not enough seats available. Only ${Math.max(0, 16 - totalExistingPersons)} seats left.`);
      }

      const newBooking = {
        ...data,
        persons: requestedPersons,
        status: 'Pending',
        createdAt: new Date(),
      };
      const res = await db.collection('bookings').insertOne(newBooking);

      // Send WhatsApp Notification
      try {
        const { sendAdminNotification } = await import('./whatsapp');
        const msg = `*New Booking Received!*\nName: ${newBooking.name}\nPhone: ${newBooking.phone}\nTrip: ${newBooking.tripName || newBooking.customDestination}\nPersons: ${newBooking.persons}\nDate: ${newBooking.travelDate || 'N/A'}`;
        await sendAdminNotification(msg);
      } catch (waErr) {
        console.error("Failed to send WhatsApp notification", waErr);
      }

      return { success: true, _id: res.insertedId.toString() };
    } catch (error: any) {
      console.error("Failed to submit booking", error);
      throw new Error(error.message || "Failed to submit booking");
    }
  });

export const updateBookingStatusFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, id: string, status: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db('shailraj');
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(data.id) },
      { $set: { status: data.status } }
    );
    await logAuditAction({ data: { action: "Update Booking", entityType: "Booking", details: `Changed booking status to ${data.status}`, entityId: data.id } });
    return { success: true };
  });

export const deleteBookingFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, id: string }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db('shailraj');
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(data.id) });
    await db.collection('bookings').deleteOne({ _id: new ObjectId(data.id) });
    if (booking) {
      await logAuditAction({ data: { action: "Delete Booking", entityType: "Booking", details: `Deleted booking for ${booking.name}`, entityId: data.id } });
    }
    return { success: true };
  });
