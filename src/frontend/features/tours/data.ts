export type TourData = {
  id: string;
  image: string;
  durationBadge: string;
  subtitle: string;
  title: string;
  location: string;
  schedule: string;
  frequency: string;
  route: string[];
  tags: string[];
  seatsAvailable: number;
  seatsTotal: number;
  price: string;
  itinerary: { day: string; title: string }[];
  includes: string[];
};

export function getMockTours(lang: "mr" | "en"): TourData[] {
  return [
    {
      id: "ujjain-1",
      image: "https://images.unsplash.com/photo-1698223126743-3b10b78df025?q=80&w=1470&auto=format&fit=crop",
      durationBadge: "3D / 2N",
      subtitle: "Pune to Ujjain Mahakal Yatra",
      title: "Pune to Ujjain Mahakal Yatra",
      location: "Pune",
      schedule: "Every Friday",
      frequency: "Every Friday - Sunday (Weekly)",
      route: ["Pune", "Omkareshwar", "Mamleshwar", "Mahakaleshwar (Ujjain)", "Grishneshwar", "Pune"],
      tags: ["Mahakaleshwar", "Bhasma Aarti", "Omkareshwar", "Grishneshwar"],
      seatsAvailable: 11,
      seatsTotal: 17,
      price: "₹9,999",
      itinerary: [
        { day: "Day 1 (Fri)", title: "Pune departure → Omkareshwar & Mamleshwar darshan" },
        { day: "Day 2 (Sat)", title: "Mahakaleshwar Ujjain darshan & Bhasma Aarti" },
        { day: "Day 3 (Sun)", title: "Grishneshwar Jyotirlinga → Return to Pune" }
      ],
      includes: [
        "AC Force Urbania",
        "Hotel Accommodation",
        "Pure Veg Meals",
        "Tea & Breakfast",
        "Travel Insurance",
        "Tour Manager"
      ]
    }
  ];
}
