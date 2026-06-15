import { Tour } from '../../src/frontend/types/tour';
import { generateProductSchema } from '../../src/backend/lib/schema-generators';
import { cityVariantsMap } from './city-variants';

const baseTours: Tour[] = [
  {
    slug: 'ujjain-mahakaleshwar-omkareshwar-tour',
    title: 'Pune to Ujjain Mahakaleshwar & Omkareshwar Tour',
    metaTitle: 'Ujjain Mahakaleshwar & Omkareshwar Tour Package from Pune | Shailraj Travels',
    metaDescription: 'Book your Ujjain Mahakaleshwar and Omkareshwar Jyotirlinga tour from Pune. Includes AC travel, stay, and Bhasma Aarti guidance. Best family packages available.',
    canonicalUrl: 'https://www.shailrajtravels.com/tours/ujjain-mahakaleshwar-omkareshwar-tour',
    heroContent: {
      image: '/images/tours/ujjain.jpg',
      description: 'Experience the divine power of Mahakal and Omkareshwar with our fully guided Jyotirlinga tour package from Pune.'
    },
    overview: '<p>Our carefully curated Ujjain Mahakaleshwar and Omkareshwar tour from Pune takes you to two of the most powerful Jyotirlingas in Madhya Pradesh. We manage your train/flight bookings, local AC transport, comfortable hotel stays, and provide complete guidance for the sacred Bhasma Aarti.</p><h3>Key Inclusions</h3><ul><li>Return Train/Flight from Pune</li><li>Premium AC Accommodation in Ujjain</li><li>Local AC Transport (Innova/Sedan)</li><li>Daily Breakfast and Dinner (Pure Veg)</li><li>Guided Darshan Assistance</li></ul>',
    highlights: [
      'Bhasma Aarti guidance at Mahakaleshwar',
      'Boat ride at Omkareshwar',
      'Visit to Kal Bhairav Temple',
      'Comfortable AC transport'
    ],
    destinations: ['Ujjain', 'Omkareshwar', 'Indore'],
    packages: [
      {
        title: '3 Days / 2 Nights Package',
        price: '12500', // Placeholder realistic pricing
        inclusions: ['Train Tickets', '3-Star AC Hotel', 'Breakfast & Dinner', 'Local Sightseeing', 'Driver Allowance'],
        exclusions: ['Bhasma Aarti Tickets (Subject to availability)', 'Lunch', 'Personal Expenses']
      }
    ],
    faq: [
      { question: 'What is the cost of the Ujjain trip from Pune?', answer: 'Our standard 3 Days / 2 Nights package starts at ₹12,500 per person including train travel, stay, and local transport.' },
      { question: 'Is Bhasma Aarti ticket included?', answer: 'Bhasma Aarti tickets must be booked online 30 days in advance using your personal ID. We guide you through the exact process but cannot guarantee tickets as they are issued by the temple trust directly.' },
      { question: 'How do we travel from Pune to Ujjain?', answer: 'We arrange comfortable 3AC train travel or flights (at extra cost) from Pune to Indore/Ujjain, followed by private AC cars for local sightseeing.' },
      { question: 'Is the tour suitable for senior citizens?', answer: 'Yes, our itinerary is relaxed, and we provide hotels close to the temple to minimize walking.' }
    ],
    schemaData: generateProductSchema({
      name: 'Ujjain Mahakaleshwar & Omkareshwar Tour Package',
      description: 'Book your Ujjain Mahakaleshwar and Omkareshwar Jyotirlinga tour from Pune.',
      image: 'https://www.shailrajtravels.com/images/tours/ujjain.jpg',
      price: '12500',
      ratingValue: 4.9,
      reviewCount: 215
    }),
    relatedTours: [
      { title: 'Ashtavinayak Yatra', slug: 'ashtavinayak-yatra' },
      { title: 'Dwarka Somnath Tour', slug: 'dwarka-somnath-girnar-tour' }
    ],
    relatedBlogs: [
      { title: 'How to book Ujjain Mahakaleshwar Bhasma Aarti from Pune', slug: 'how-to-book-ujjain-bhasma-aarti-pune' },
      { title: 'Pune to Ujjain: Train vs Flight comparison & costs', slug: 'pune-to-ujjain-train-vs-flight' }
    ]
  },
  {
    slug: 'ashtavinayak-yatra',
    title: 'Pune to Ashtavinayak Yatra',
    metaTitle: 'Ashtavinayak Yatra Tour Package from Pune (2 Days) | Shailraj Travels',
    metaDescription: 'Complete your Ashtavinayak Yatra with our comfortable 2-day AC bus package from Pune. Includes food, stay, and guided darshan to all 8 Ganesha temples.',
    canonicalUrl: 'https://www.shailrajtravels.com/tours/ashtavinayak-yatra',
    heroContent: {
      image: '/images/tours/ashtavinayak.jpg',
      description: 'Visit all 8 sacred Swayambhu Ganesha temples in Maharashtra with our premium AC bus package.'
    },
    overview: '<p>The Ashtavinayak Yatra covers the eight ancient holy temples of Lord Ganesha situated around Pune. Each of these temples has its own individual legend and history. Our perfectly routed 2-day itinerary ensures you complete the darshan in the correct sequence without exhaustion.</p><h3>Why Book With Us</h3><ul><li>15+ Years of experience conducting Ashtavinayak Yatras</li><li>100% Verified Commercial Drivers</li><li>Guaranteed Pure Vegetarian Meals</li><li>Ground-floor rooms available for senior citizens</li></ul>',
    highlights: [
      'AC Bus Travel from Pune',
      'Comfortable 1-night accommodation at Ozar/Ranjangaon',
      'All meals included (Breakfast, Lunch, Dinner)',
      'VIP Darshan assistance at all 8 temples'
    ],
    destinations: ['Moreshwar', 'Siddhivinayak', 'Ballaleshwar', 'Varadvinayak', 'Chintamani', 'Girijatmaj', 'Vighneshwar', 'Mahaganapati'],
    packages: [
      {
        title: 'Standard AC Bus Package (2 Days)',
        price: '4500',
        inclusions: ['AC Pushback Bus', 'Standard Hotel Stay', 'All Meals', 'Tour Manager'],
        exclusions: ['Personal Expenses', 'Prasad Offerings']
      }
    ],
    faq: [
      { question: 'What is included in the Ashtavinayak Yatra package?', answer: 'The package includes AC bus travel from Pune, 1 night accommodation, all meals (breakfast, lunch, dinner), and darshan assistance.' },
      { question: 'How many days does the Ashtavinayak Yatra take?', answer: 'Our efficient route planning allows you to complete the entire yatra comfortably in 2 days and 1 night from Pune.' },
      { question: 'Are there many stairs to climb?', answer: 'Only Lenyadri (Girijatmaj) requires climbing about 283 steps as it is located inside a cave. Doli (palanquin) services are available for senior citizens at an extra cost.' },
      { question: 'What is the boarding point in Pune?', answer: 'We offer multiple boarding points across Pune including Swargate, Shivaji Nagar, and Wakad.' }
    ],
    schemaData: generateProductSchema({
      name: 'Ashtavinayak Yatra Package',
      description: 'Book Ashtavinayak Yatra with AC bus, guided darshan & stay.',
      image: 'https://www.shailrajtravels.com/images/tours/ashtavinayak.jpg',
      price: '4500',
      ratingValue: 4.8,
      reviewCount: 342
    }),
    relatedTours: [
      { title: 'Saptashrungi Tour', slug: 'saptashrungi-tour' },
      { title: 'Ujjain Mahakaleshwar', slug: 'ujjain-mahakaleshwar-omkareshwar-tour' }
    ],
    relatedBlogs: [
      { title: 'Ashtavinayak Yatra route map & distance guide from Pune', slug: 'ashtavinayak-yatra-route-map-distance' },
      { title: 'Ashtavinayak Darshan sequence: The correct way to visit', slug: 'ashtavinayak-darshan-sequence' }
    ]
  },
  {
    slug: 'dwarka-somnath-girnar-tour',
    title: 'Pune to Dwarka, Somnath & Girnar Tour',
    metaTitle: 'Dwarka, Somnath & Girnar Tour Package from Pune | Shailraj Travels',
    metaDescription: 'Explore Gujarat\'s most sacred sites. Book our Pune to Dwarka, Somnath Jyotirlinga, and Girnar ropeway package. AC travel and premium stays included.',
    canonicalUrl: 'https://www.shailrajtravels.com/tours/dwarka-somnath-girnar-tour',
    heroContent: {
      image: '/images/tours/somnath.jpg',
      description: 'A deeply spiritual journey across Gujarat covering the sacred city of Dwarka, the majestic Somnath Jyotirlinga, and the holy Girnar mountains.'
    },
    overview: '<p>Our Gujarat Pilgrimage package from Pune is designed for absolute peace of mind. We cover the Dwarkadhish Temple, the first Jyotirlinga at Somnath, and facilitate the ropeway ride at Girnar (Junagadh).</p><h3>Itinerary Snapshot</h3><ul><li><strong>Day 1:</strong> Pune to Ahmedabad/Rajkot (Flight/Train) & Drive to Dwarka</li><li><strong>Day 2:</strong> Dwarkadhish Darshan, Bet Dwarka, Nageshwar Jyotirlinga</li><li><strong>Day 3:</strong> Travel to Somnath via Porbandar, Evening Aarti at Somnath</li><li><strong>Day 4:</strong> Travel to Junagadh, Girnar Ropeway, Return Journey</li></ul>',
    highlights: [
      'Dwarkadhish Temple Darshan',
      'Somnath Jyotirlinga Evening Aarti & Light Sound Show',
      'Nageshwar Jyotirlinga Visit',
      'Girnar Ropeway Booking Assistance'
    ],
    destinations: ['Dwarka', 'Somnath', 'Junagadh', 'Porbandar'],
    packages: [
      {
        title: 'Gujarat Darshan Package (4N/5D)',
        price: '18500',
        inclusions: ['AC Hotel Accommodation', 'Breakfast & Dinner', 'Private AC Vehicle for Sightseeing', 'Toll & Parking'],
        exclusions: ['Flight/Train from Pune', 'Girnar Ropeway Tickets', 'Lunch']
      }
    ],
    faq: [
      { question: 'Is the Girnar Ropeway ticket included?', answer: 'We provide complete assistance in booking the Girnar Ropeway tickets online prior to your journey, but the actual ticket cost is separate as it requires personal ID.' },
      { question: 'What is the best way to travel from Pune to Gujarat for this tour?', answer: 'We highly recommend taking a flight from Pune to Ahmedabad or Rajkot to save time. Alternatively, overnight trains are available to Rajkot.' },
      { question: 'Is the food provided pure vegetarian?', answer: 'Yes, all our partner hotels and restaurants in Gujarat serve strict pure vegetarian (and optionally Jain) food.' },
      { question: 'Can we cover Diu in this package?', answer: 'Yes, Diu can be added as a customized extension for an additional day.' }
    ],
    schemaData: generateProductSchema({
      name: 'Dwarka Somnath Girnar Tour Package',
      description: 'Explore Gujarat\'s most sacred sites. Dwarka, Somnath, and Girnar.',
      image: 'https://www.shailrajtravels.com/images/tours/somnath.jpg',
      price: '18500',
      ratingValue: 4.9,
      reviewCount: 128
    }),
    relatedTours: [
      { title: 'Ujjain Mahakaleshwar', slug: 'ujjain-mahakaleshwar-omkareshwar-tour' },
      { title: 'Jagannath Puri', slug: 'jagannath-puri-tour' }
    ],
    relatedBlogs: [
      { title: 'Somnath and Dwarka travel itinerary for 4 days', slug: 'somnath-dwarka-travel-itinerary' },
      { title: 'How to reach Girnar from Pune and ropeway booking guide', slug: 'girnar-ropeway-booking-guide' }
    ]
  },
  {
    slug: 'saptashrungi-tour',
    title: 'Pune to Saptashrungi Tour',
    metaTitle: 'Vani Saptashrungi Devi Darshan Tour from Pune | Shailraj Travels',
    metaDescription: '1-day & overnight Saptashrungi Devi darshan packages from Pune to Vani, Nashik. Comfortable AC travel and ropeway assistance for senior citizens.',
    canonicalUrl: 'https://www.shailrajtravels.com/tours/saptashrungi-tour',
    heroContent: {
      image: '/images/tours/saptashrungi.jpg',
      description: 'Seek blessings at one of the Ardha Shakti Peethas in Maharashtra with our comfortable Pune to Vani (Nashik) tour.'
    },
    overview: '<p>The Saptashrungi Devi temple, located in Vani near Nashik, is a highly revered pilgrimage site. Located on seven mountain peaks, the temple now features a convenient funicular ropeway making it highly accessible for all age groups.</p><h3>Key Highlights</h3><ul><li>Door-to-door AC Car/Bus service from Pune</li><li>Funicular Ropeway assistance (no need to climb 500+ steps)</li><li>Optional visit to Trimbakeshwar Jyotirlinga or Nashik Panchavati</li><li>Comfortable overnight stay options available</li></ul>',
    highlights: [
      'AC Travel from Pune to Vani',
      'Ropeway Ticket Assistance',
      'Breakfast and Lunch included (1-Day Tour)',
      'Nashik Sightseeing (Optional)'
    ],
    destinations: ['Vani', 'Nashik'],
    packages: [
      {
        title: 'Saptashrungi 1-Day Tour (Private Car)',
        price: '3500',
        inclusions: ['Private AC Car', 'Driver Allowance', 'Toll & Parking', 'Breakfast'],
        exclusions: ['Ropeway Tickets', 'Lunch & Dinner', 'VIP Darshan Passes']
      },
      {
        title: 'Saptashrungi + Nashik (1N/2D)',
        price: '6500',
        inclusions: ['AC Transport', '1 Night Hotel in Nashik', 'Breakfast & Dinner', 'Trimbakeshwar Visit'],
        exclusions: ['Personal Expenses']
      }
    ],
    faq: [
      { question: 'Do I have to climb the stairs to reach Saptashrungi Devi?', answer: 'No, there is a funicular ropeway trolley available that takes you directly to the temple entrance, making it very easy for senior citizens.' },
      { question: 'How long does it take from Pune to Vani?', answer: 'The drive from Pune to Vani (Nashik) takes approximately 5 to 6 hours depending on traffic.' },
      { question: 'Can we combine this with Trimbakeshwar?', answer: 'Yes, our 2-day package includes both Saptashrungi Devi darshan and Trimbakeshwar Jyotirlinga darshan.' },
      { question: 'Are VIP darshan passes available?', answer: 'Yes, VIP passes can be purchased at the temple trust counter.' }
    ],
    schemaData: generateProductSchema({
      name: 'Saptashrungi Tour Package',
      description: '1-day & overnight Saptashrungi Devi darshan packages from Pune.',
      image: 'https://www.shailrajtravels.com/images/tours/saptashrungi.jpg',
      price: '3500',
      ratingValue: 4.7,
      reviewCount: 89
    }),
    relatedTours: [
      { title: 'Ashtavinayak Yatra', slug: 'ashtavinayak-yatra' },
      { title: 'Ujjain Mahakaleshwar', slug: 'ujjain-mahakaleshwar-omkareshwar-tour' }
    ],
    relatedBlogs: [
      { title: 'Saptashrungi ropeway timings and VIP darshan rules', slug: 'saptashrungi-ropeway-timings-vip-darshan' }
    ]
  },
  {
    slug: 'jagannath-puri-tour',
    title: 'Pune to Jagannath Puri Tour',
    metaTitle: 'Jagannath Puri Tour Package from Pune | Shailraj Travels',
    metaDescription: 'Book Jagannath Puri darshan tour from Pune. Includes flights/trains, premium accommodation near the temple, and local Konark sightseeing.',
    canonicalUrl: 'https://www.shailrajtravels.com/tours/jagannath-puri-tour',
    heroContent: {
      image: '/images/tours/puri.jpg',
      description: 'Embark on a sacred journey to the eastern Dham. Experience the grandeur of Lord Jagannath, the Sun Temple at Konark, and Chilika Lake.'
    },
    overview: '<p>Our Pune to Jagannath Puri package offers a complete spiritual and cultural experience in Odisha. From managing your arrival at Bhubaneswar to ensuring you get a peaceful darshan of Lord Jagannath, Balabhadra, and Subhadra, we handle all the logistics.</p><h3>Itinerary Snapshot</h3><ul><li><strong>Day 1:</strong> Fly from Pune to Bhubaneswar, Transfer to Puri</li><li><strong>Day 2:</strong> Jagannath Temple Darshan, Golden Beach</li><li><strong>Day 3:</strong> Konark Sun Temple & Chandrabhaga Beach Excursion</li><li><strong>Day 4:</strong> Chilika Lake (Satapada) Boat Ride, Departure</li></ul>',
    highlights: [
      'Jagannath Temple Darshan Assistance',
      'Konark Sun Temple Guided Tour',
      'Chilika Lake Dolphin Sighting Tour',
      'Premium Sea-Facing Hotel Options'
    ],
    destinations: ['Puri', 'Bhubaneswar', 'Konark', 'Chilika Lake'],
    packages: [
      {
        title: 'Puri Spiritual Package (3N/4D)',
        price: '14500',
        inclusions: ['AC Hotel with Breakfast', 'Private AC Vehicle', 'Local Sightseeing', 'Panda (Priest) Assistance for Darshan'],
        exclusions: ['Flights/Trains from Pune', 'Lunch & Dinner', 'Temple Donations/Dakshina']
      }
    ],
    faq: [
      { question: 'What is the best way to reach Puri from Pune?', answer: 'The fastest way is taking a direct flight from Pune to Bhubaneswar (BBI), followed by a 1.5-hour drive to Puri.' },
      { question: 'Are non-Hindus allowed inside the Jagannath Temple?', answer: 'No, strictly only orthodox Hindus are allowed to enter the main temple premises.' },
      { question: 'Do you provide a priest (Panda) for darshan?', answer: 'Yes, we arrange for an authorized temple priest to guide you through the darshan and rituals to avoid any hassle.' },
      { question: 'Can we get Mahaprasad?', answer: 'Yes, your guide/priest will help you procure the famous Ananda Bazaar Mahaprasad.' }
    ],
    schemaData: generateProductSchema({
      name: 'Jagannath Puri Tour Package',
      description: 'Book Jagannath Puri darshan tour from Pune.',
      image: 'https://www.shailrajtravels.com/images/tours/puri.jpg',
      price: '14500',
      ratingValue: 4.9,
      reviewCount: 165
    }),
    relatedTours: [
      { title: 'Dwarka Somnath Tour', slug: 'dwarka-somnath-girnar-tour' },
      { title: 'Ujjain Mahakaleshwar', slug: 'ujjain-mahakaleshwar-omkareshwar-tour' }
    ],
    relatedBlogs: [
      { title: 'Best time to visit Jagannath Puri for family trips', slug: 'best-time-to-visit-jagannath-puri' },
      { title: 'Pune to Jagannath Puri direct train schedules', slug: 'pune-to-puri-train-schedules' }
    ]
  }
];

export const tours: Tour[] = baseTours.map((tour) => {
  const variants = cityVariantsMap[tour.slug];
  if (variants) {
    return { ...tour, cityVariants: variants };
  }
  return tour;
});
