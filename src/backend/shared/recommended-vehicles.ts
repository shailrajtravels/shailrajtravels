import { createServerFn } from "@tanstack/react-start";
import { getAdminToken } from "./bookings";
import { recommendedVehicleRepository } from "./repositories/RecommendedVehicleRepository";

const DEFAULT_RECOMMENDED_VEHICLES = [
  {
    id: "swift-dzire",
    name: "Swift Dzire",
    capacityStr: "1–4 Travelers",
    minCap: 1,
    maxCap: 4,
    description: "Perfect for couples and small families.",
    amenities: ["Air Conditioning", "Comfortable Seating", "Driver Included", "Luggage Space", "Fuel Included", "Toll Included", "Parking Included"],
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
    order: 0,
  },
  {
    id: "ertiga",
    name: "Ertiga",
    capacityStr: "5–7 Travelers",
    minCap: 5,
    maxCap: 7,
    description: "Best for medium-sized families.",
    amenities: ["Air Conditioning", "Spacious Cabin", "Driver Included", "Large Luggage Capacity", "Fuel Included", "Toll Included", "Parking Included"],
    image: "https://images.unsplash.com/photo-1513681414995-777174eec705?auto=format&fit=crop&w=600&q=80",
    order: 1,
  },
  {
    id: "innova-crysta",
    name: "Innova Crysta",
    capacityStr: "5–7 Travelers",
    minCap: 5,
    maxCap: 7,
    badge: "Premium Choice",
    description: "Luxury travel experience with extra comfort.",
    amenities: ["Premium Seats", "Air Conditioning", "Driver Included", "Large Luggage Space", "Fuel Included", "Toll Included", "Parking Included"],
    image: "https://images.unsplash.com/photo-1605810736025-0d3210438ec3?auto=format&fit=crop&w=600&q=80",
    order: 2,
  },
  {
    id: "urbania-12",
    name: "Urbania 12 Seater",
    capacityStr: "8–12 Travelers",
    minCap: 8,
    maxCap: 12,
    description: "Ideal for group tours and pilgrimages.",
    amenities: ["Pushback Seats", "Air Conditioning", "Driver Included", "Extra Luggage", "Fuel Included", "Toll Included", "Parking Included"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    order: 3,
  },
  {
    id: "urbania-16",
    name: "Urbania 16 Seater",
    capacityStr: "13–16 Travelers",
    minCap: 13,
    maxCap: 16,
    description: "Perfect for large groups.",
    amenities: ["Premium Interior", "Air Conditioning", "Pushback Seats", "Driver Included", "Large Storage", "Fuel Included", "Toll Included", "Parking Included"],
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80",
    order: 4,
  },
];

export const getRecommendedVehiclesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const vehicles = await recommendedVehicleRepository.findAllSorted();
      if (!vehicles || vehicles.length === 0) {
        return DEFAULT_RECOMMENDED_VEHICLES;
      }
      return vehicles.map(v => ({
        id: v.id,
        name: v.name,
        capacityStr: v.capacityStr,
        minCap: v.minCap,
        maxCap: v.maxCap,
        description: v.description,
        amenities: v.amenities,
        image: v.image,
        badge: v.badge,
        order: v.order
      }));
    } catch (err) {
      console.error("Failed to fetch recommended vehicles", err);
      return [];
    }
  });

export const saveRecommendedVehiclesFn = createServerFn({ method: "POST" })
  .validator((data: { adminToken: string; vehicles: any[] }) => data)
  .handler(async ({ data }: { data: { adminToken: string; vehicles: any[] } }) => {
    if (data.adminToken !== getAdminToken()) {
      throw new Error("Unauthorized");
    }
    
    // Validate we have exactly 6 vehicles if required by business logic, 
    // or just let them save however many. The UI will enforce 6 slots.
    await recommendedVehicleRepository.replaceAll(data.vehicles);
    
    return { success: true };
  });
