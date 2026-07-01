export interface Resource {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  content: string;
  faqs: { question: string; answer: string }[];
  relatedTours: string[]; // slugs
}

export const resources: Resource[] = [
  {
    slug: "ujjain-mahakaleshwar-darshan-guide",
    title: "Ujjain Mahakaleshwar Darshan & Bhasma Aarti Guide",
    metaTitle: "Ujjain Mahakaleshwar Darshan Guide | Shailraj Travels",
    metaDescription:
      "Complete guide for Ujjain Mahakaleshwar darshan. Learn about Bhasma Aarti booking, VIP passes, and temple timings.",
    category: "Temple Guides",
    content: `
      <h2>Bhasma Aarti Details</h2>
      <p>The Bhasma Aarti is the most sought-after ritual at Mahakaleshwar, performed daily at 4:00 AM. The booking opens exactly 30 days in advance on the official website. You must carry the same original ID used for booking. Women must wear sarees, and men must wear dhoti (without any stitched upper garment) to enter the Nandi hall.</p>
      <h2>General Darshan Timings</h2>
      <p>The temple opens at 4:00 AM and closes at 11:00 PM. The best time for normal darshan is between 1:00 PM to 3:00 PM when crowds are relatively lower.</p>
    `,
    faqs: [
      {
        question: "What is the dress code for Bhasma Aarti?",
        answer:
          "Men must wear only a dhoti (unstitched cloth). Women must wear a saree. Salwar suits or jeans are strictly not allowed for the Aarti.",
      },
      {
        question: "Can we get VIP Darshan at Mahakaleshwar?",
        answer:
          "Yes, a ₹250 VIP Darshan pass is available from the temple counters which significantly reduces waiting time.",
      },
    ],
    relatedTours: ["ujjain-mahakaleshwar-omkareshwar-tour"],
  },
  {
    slug: "dwarka-somnath-travel-checklist",
    title: "Dwarka & Somnath Travel Checklist",
    metaTitle: "Dwarka & Somnath Packing List & Checklist | Shailraj Travels",
    metaDescription:
      "What to pack and know before traveling to Gujarat for the Dwarka and Somnath Jyotirlinga tour.",
    category: "Travel Checklists",
    content: `
      <h2>Weather & Clothing</h2>
      <p>Gujarat coastal regions are extremely hot and humid during summer and very pleasant in winter. Pack light, breathable cotton clothes. The temples require modest dressing.</p>
      <h2>Temple Security Rules</h2>
      <p>At both Dwarkadhish and Somnath temples, electronics (phones, cameras, smartwatches) and leather items (belts, wallets) are strictly prohibited. Free locker facilities are available outside.</p>
    `,
    faqs: [
      {
        question: "Are phones allowed in Somnath Temple?",
        answer:
          "No, mobile phones and all electronics are strictly banned inside the Somnath temple premises. You must deposit them in lockers.",
      },
      {
        question: "Do we need to walk a lot in Dwarka?",
        answer:
          "Yes, the Dwarkadhish temple involves walking up 56 steps (Swarg Dwar) and walking around the temple complex.",
      },
    ],
    relatedTours: ["dwarka-somnath-girnar-tour"],
  },
  {
    slug: "saptashrungi-vani-ropeway-guide",
    title: "Saptashrungi Vani Ropeway Guide",
    metaTitle: "Saptashrungi Ropeway Timings & Tickets Guide | Shailraj Travels",
    metaDescription:
      "Complete guide to the Saptashrungi Funicular Ropeway at Vani, Nashik. Timings, ticket prices, and accessibility.",
    category: "Route Maps",
    content: `
      <h2>Funicular Ropeway Details</h2>
      <p>The funicular trolley at Saptashrungi has made the darshan highly accessible. It climbs the 500+ steps in just 3 minutes.</p>
      <ul>
        <li><strong>Timings:</strong> 6:00 AM to 9:30 PM daily.</li>
        <li><strong>Ticket Cost:</strong> Approximately ₹100 per adult (two-way).</li>
        <li><strong>Accessibility:</strong> Highly recommended for senior citizens, pregnant women, and children.</li>
      </ul>
    `,
    faqs: [
      {
        question: "Can wheelchairs go into the ropeway?",
        answer:
          "Yes, the funicular trolley is wheelchair accessible to a certain point, but some walking/assistance is required inside the main temple area.",
      },
      {
        question: "Is parking available near the ropeway?",
        answer:
          "Yes, there is a large parking area near the base station of the funicular trolley.",
      },
    ],
    relatedTours: ["saptashrungi-tour"],
  },
  {
    slug: "jagannath-puri-temple-rules",
    title: "Jagannath Puri Temple Rules & Darshan Guide",
    metaTitle: "Jagannath Puri Temple Darshan Rules | Shailraj Travels",
    metaDescription:
      "Essential rules, dress codes, and Mahaprasad guide for the Jagannath Puri temple in Odisha.",
    category: "Temple Guides",
    content: `
      <h2>Entry Restrictions</h2>
      <p>Only orthodox Hindus are allowed to enter the Jagannath Temple. Non-Hindus must view the temple from the Raghunandan Library platform opposite the main gate.</p>
      <h2>The Mahaprasad (Abhada)</h2>
      <p>The food cooked in the temple kitchen is considered the most sacred Mahaprasad. It is available for purchase at the Ananda Bazaar inside the temple complex. You should consume it with utmost respect.</p>
    `,
    faqs: [
      {
        question: "What is the dress code for Jagannath Temple?",
        answer:
          "Traditional Indian attire is mandatory. Men should wear dhoti/kurta or formal trousers. Women should wear sarees or salwar kameez. Jeans and shorts are not allowed.",
      },
      {
        question: "Can we carry leather items?",
        answer: "No, leather belts, wallets, and bags are prohibited inside the temple.",
      },
    ],
    relatedTours: ["jagannath-puri-tour"],
  },
  {
    slug: "ashtavinayak-yatra-packing-list",
    title: "Ashtavinayak Yatra Packing List",
    metaTitle: "Ashtavinayak Yatra Essential Packing List | Shailraj Travels",
    metaDescription:
      "What to pack for your 2-day Ashtavinayak yatra from Pune. Essential items for a comfortable bus journey.",
    category: "Travel Checklists",
    content: `
      <h2>Bus Travel Essentials</h2>
      <p>Since you will spend a lot of time in the AC bus traveling between the 8 temples, packing smart is crucial.</p>
      <ul>
        <li>Neck pillow and light blanket/shawl (AC buses get cold)</li>
        <li>Slip-on shoes or sandals (you have to remove shoes 8 times)</li>
        <li>Small day-bag for carrying water and prasad to the temple</li>
        <li>Personal medications and motion sickness pills for the ghat sections (Lenyadri route)</li>
      </ul>
    `,
    faqs: [
      {
        question: "Do we need warm clothes for Ashtavinayak?",
        answer:
          "If traveling between November and February, carrying a light sweater is recommended, especially for the early morning visits to Lenyadri and Ozar.",
      },
      {
        question: "Can we carry our own food?",
        answer:
          "Yes, carrying dry snacks is perfectly fine for the bus journey, though all main meals are provided in our package.",
      },
    ],
    relatedTours: ["ashtavinayak-yatra"],
  },
];
