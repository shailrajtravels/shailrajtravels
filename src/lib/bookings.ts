import { createServerFn } from '@tanstack/react-start';
import clientPromise from './db';
import { getAdminToken } from './token';
import { ObjectId } from 'mongodb';
import { logAuditAction } from './audit';

// ---- TRIP OPTIONS ----

export const getTripOptionsFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const client = await clientPromise;
    const db = client.db('shailraj');
    const options = await db.collection('trip_options').find({}).toArray();
    return options.map(o => ({
      _id: o._id.toString(),
      name: o.name,
      dates: o.dates || [],
    }));
  } catch (error) {
    console.error("Failed to fetch trip options", error);
    return [];
  }
});

export const createTripOptionFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, data: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db('shailraj');
    const res = await db.collection('trip_options').insertOne(data.data);
    await logAuditAction({ data: { action: "Create Trip Option", entityType: "TripOption", details: `Added new trip option: ${data.data.name}`, entityId: res.insertedId.toString() } });
    return { success: true, _id: res.insertedId.toString() };
  });

export const updateTripOptionFn = createServerFn({ method: 'POST' })
  .validator((data: { adminToken: string, id: string, data: any }) => data)
  .handler(async ({ data }) => {
    if (data.adminToken !== getAdminToken()) throw new Error("Unauthorized");
    const client = await clientPromise;
    const db = client.db('shailraj');
    await db.collection('trip_options').updateOne(
      { _id: new ObjectId(data.id) },
      { $set: data.data }
    );
    await logAuditAction({ data: { action: "Update Trip Option", entityType: "TripOption", details: `Updated trip option: ${data.data.name}`, entityId: data.id } });
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
      return bookings.map(b => ({
        _id: b._id.toString(),
        name: b.name,
        phone: b.phone,
        tripName: b.tripName,
        customDestination: b.customDestination,
        persons: b.persons,
        travelDate: b.travelDate,
        status: b.status || 'Pending',
        createdAt: b.createdAt,
      }));
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      return [];
    }
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

      const totalExistingPersons = existingBookings.reduce((sum, b) => sum + (Number(b.persons) || 1), 0);
      
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
