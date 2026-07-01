export interface FactPage {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keyFacts: { label: string; value: string }[];
  content: string;
}

export const factPages: FactPage[] = [
  {
    slug: "ashtavinayak-yatra-facts",
    title: "Ashtavinayak Yatra Statistics & Facts",
    metaTitle: "Ashtavinayak Yatra Facts & Route Distances | Shailraj Travels",
    metaDescription:
      "Detailed statistics, temple distances, and historical facts about the Ashtavinayak Yatra in Maharashtra.",
    keyFacts: [
      { label: "Total Temples", value: "8" },
      { label: "Total Route Distance (from Pune)", value: "650 km" },
      { label: "Standard Duration", value: "2 Days / 1 Night" },
      { label: "Cave Temples", value: "1 (Lenyadri)" },
      { label: "Number of Steps at Lenyadri", value: "283" },
    ],
    content: `
      <h2>Historical Significance</h2>
      <p>The Ashtavinayak (Sanskrit for "Eight Ganeshas") temples are mentioned in the Mudgala Purana. These temples are revered as Swayambhu (self-manifested) murtis.</p>
      <h2>Geographical Distribution</h2>
      <p>All eight temples are located in the state of Maharashtra, specifically spanning the Pune, Raigad, and Ahmednagar districts. Pune is considered the central hub for starting this pilgrimage.</p>
    `,
  },
  {
    slug: "shirdi-facts",
    title: "Shirdi Sai Baba Temple Facts",
    metaTitle: "Shirdi Sai Temple Facts & Footfall Statistics | Shailraj Travels",
    metaDescription:
      "Fascinating facts, historical timeline, and visitor statistics of the Shirdi Sai Baba Temple in Maharashtra.",
    keyFacts: [
      { label: "Average Daily Visitors", value: "25,000+" },
      { label: "Peak Festival Visitors", value: "100,000+" },
      { label: "Prasadalaya Capacity", value: "5,500 people per sitting" },
      { label: "Temple Trust Established", value: "1922" },
      { label: "Distance from Pune", value: "185 km" },
    ],
    content: `
      <h2>The Prasadalaya</h2>
      <p>The Shri Saibaba Sansthan Trust operates one of the largest solar-powered kitchens in the world. It provides free meals to thousands of devotees daily, running entirely on solar energy for steam cooking.</p>
      <h2>Historical Context</h2>
      <p>Sai Baba arrived in Shirdi as a young ascetic in 1858 and stayed there until his Mahasamadhi in 1918. The Samadhi Mandir was originally constructed as a wada by Shreemant Gopalrao Buti of Nagpur.</p>
    `,
  },
  {
    slug: "jyotirlinga-facts",
    title: "12 Jyotirlinga Facts & Locations",
    metaTitle: "12 Jyotirlinga Statistics & Geography | Shailraj Travels",
    metaDescription:
      "Comprehensive facts, locations, and geographical data of the 12 Jyotirlinga temples of Lord Shiva across India.",
    keyFacts: [
      { label: "Total Jyotirlingas", value: "12" },
      { label: "Maharashtra Jyotirlingas", value: "5 (Highest in any state)" },
      { label: "Highest Altitude", value: "Kedarnath (3,583 m)" },
      { label: "Southernmost Temple", value: "Rameshwaram (Tamil Nadu)" },
    ],
    content: `
      <h2>The Concept of Jyotirlinga</h2>
      <p>In Hindu mythology, a Jyotirlinga represents the radiant sign of the Almighty Shiva. It is believed that Lord Shiva manifested himself as a towering column of light (Jyotirlinga) at these 12 places.</p>
      <h2>State Distribution</h2>
      <ul>
        <li><strong>Maharashtra:</strong> 5 (Bhimashankar, Trimbakeshwar, Grishneshwar, Vaidyanath*, Aundha Nagnath*) *Note: Exact claims vary by tradition.</li>
        <li><strong>Gujarat:</strong> 2 (Somnath, Nageshwar)</li>
        <li><strong>Madhya Pradesh:</strong> 2 (Mahakaleshwar, Omkareshwar)</li>
        <li><strong>Uttarakhand:</strong> 1 (Kedarnath)</li>
        <li><strong>Uttar Pradesh:</strong> 1 (Kashi Vishwanath)</li>
        <li><strong>Tamil Nadu:</strong> 1 (Rameshwaram)</li>
        <li><strong>Jharkhand / Andhra Pradesh:</strong> Mallikarjuna (AP), Vaidyanath (Jharkhand - Deoghar) depending on textual interpretation.</li>
      </ul>
    `,
  },
];
