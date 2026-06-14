import { Tour } from '../types/tour';
import { generateProductSchema } from '../lib/schema-generators';

export const tours: Tour[] = [
  {
    slug: 'ashtavinayak-yatra',
    title: 'Ashtavinayak Yatra',
    metaTitle: 'Ashtavinayak Yatra Package | Shailraj Travels',
    metaDescription: 'Book Ashtavinayak Yatra with AC bus, guided darshan & stay. Trusted pilgrimage tours from Pune. Call Shailraj Travels today.',
    canonicalUrl: 'https://www.shailrajtravels.com/tours/ashtavinayak-yatra',
    heroContent: {
      image: '/images/ashtavinayak.jpg', // Placeholder image
      description: 'Visit all 8 sacred Ganesha temples in Maharashtra with our premium AC bus package from Pune.'
    },
    overview: '<p>The Ashtavinayak Yatra covers eight ancient holy temples of Ganesha which are situated around Pune. Each of these temples has its own individual legend and history.</p>',
    highlights: [
      'AC Bus Travel from Pune',
      'Comfortable 1-night accommodation',
      'All meals included (Breakfast, Lunch, Dinner)',
      'VIP Darshan assistance at all 8 temples'
    ],
    destinations: ['Moreshwar', 'Siddhivinayak', 'Ballaleshwar', 'Varadvinayak', 'Chintamani', 'Girijatmaj', 'Vighneshwar', 'Mahaganapati'],
    packages: [
      {
        title: 'Standard AC Package',
        price: '4500',
        inclusions: ['AC Bus', 'Standard Hotel', 'All Meals', 'Darshan Guide'],
        exclusions: ['Personal Expenses', 'Prasad Offerings']
      }
    ],
    faq: [
      { question: 'What is included in the Ashtavinayak Yatra package?', answer: 'The package includes AC bus travel from Pune, 1 night accommodation, all meals, and darshan assistance.' },
      { question: 'How many days does the Ashtavinayak Yatra take?', answer: 'The complete tour takes 2 days and 1 night from Pune.' },
      { question: 'Is food and accommodation included?', answer: 'Yes, pure veg breakfast, lunch, and dinner along with comfortable hotel stay are included.' },
      { question: 'Can senior citizens join the tour?', answer: 'Absolutely. Our buses are comfortable and our guides assist senior citizens at the temples.' },
      { question: 'What is the best time for Ashtavinayak Yatra?', answer: 'The best time is between August to March when the weather is pleasant.' },
      { question: 'Is the tour suitable for families with children?', answer: 'Yes, the itinerary is perfectly paced for families and children.' },
      { question: 'What transport is used?', answer: 'We use premium AC pushback 2x2 or 2x1 buses depending on group size.' },
      { question: 'How do I book and what is the cancellation policy?', answer: 'You can book by paying an advance. Cancellations made 7 days prior get a full refund.' }
    ],
    schemaData: generateProductSchema({
      name: 'Ashtavinayak Yatra Package',
      description: 'Book Ashtavinayak Yatra with AC bus, guided darshan & stay.',
      image: 'https://www.shailrajtravels.com/images/ashtavinayak.jpg',
      price: '4500',
      ratingValue: 4.8,
      reviewCount: 156
    }),
    relatedTours: [
      { title: 'Jyotirlinga Darshan', slug: 'jyotirlinga-darshan' },
      { title: 'Pandharpur Wari', slug: 'pandharpur-wari' }
    ],
    relatedBlogs: [
      { title: 'Complete Ashtavinayak Yatra Guide 2026', slug: 'ashtavinayak-yatra-complete-guide' }
    ]
  },
  {
    slug: 'jyotirlinga-darshan',
    title: 'Jyotirlinga Darshan',
    metaTitle: '12 Jyotirlinga Darshan Tour Package | Shailraj Travels',
    metaDescription: 'Explore all 12 Jyotirlinga temples with comfortable travel & guided darshan. Book Jyotirlinga tour packages from Pune with Shailraj Travels.',
    canonicalUrl: 'https://www.shailrajtravels.com/tours/jyotirlinga-darshan',
    heroContent: {
      image: '/images/jyotirlinga.jpg',
      description: 'Embark on the ultimate spiritual journey covering the 12 Jyotirlingas of Lord Shiva across India.'
    },
    overview: '<p>Our carefully planned Jyotirlinga Darshan packages offer a peaceful and organized spiritual journey to the most revered Shiva temples in the country.</p>',
    highlights: ['Train/Flight arrangements', 'Premium accommodations', 'Local AC transport', 'Darshan assistance'],
    destinations: ['Somnath', 'Nageshwar', 'Bhimashankar', 'Trimbakeshwar', 'Grishneshwar', 'Vaidyanath', 'Mahakaleshwar', 'Omkareshwar', 'Kashi Vishwanath', 'Kedarnath', 'Rameshwaram', 'Mallikarjuna'],
    packages: [
      {
        title: 'Maharashtra 5 Jyotirlinga',
        price: '9500',
        inclusions: ['AC Transport from Pune', 'Hotel Stay', 'Meals', 'Guide'],
        exclusions: ['Train/Flight Tickets to other states']
      }
    ],
    faq: [
      { question: 'What is included in the Jyotirlinga Darshan package?', answer: 'Travel, stay, food, and darshan arrangements are completely taken care of.' },
      { question: 'How many days does the Jyotirlinga Darshan take?', answer: 'The Maharashtra 5 Jyotirlinga takes 4 days. All 12 takes about 18-20 days.' },
      { question: 'Is food and accommodation included?', answer: 'Yes, pure vegetarian meals and comfortable stays are provided.' },
      { question: 'Can senior citizens join the tour?', answer: 'Yes, special care and assistance are provided for seniors.' },
      { question: 'What is the best time for Jyotirlinga Darshan?', answer: 'September to March is generally best, avoiding peak monsoons.' },
      { question: 'Is the tour suitable for families with children?', answer: 'Yes, it is family friendly.' },
      { question: 'What transport is used?', answer: 'AC Buses for Maharashtra, Trains/Flights for out of state.' },
      { question: 'How do I book and what is the cancellation policy?', answer: 'Bookings require 50% advance. Cancellation policy varies by package.' }
    ],
    schemaData: generateProductSchema({
      name: '12 Jyotirlinga Darshan Tour Package',
      description: 'Explore all 12 Jyotirlinga temples with comfortable travel.',
      image: 'https://www.shailrajtravels.com/images/jyotirlinga.jpg',
      price: '9500',
      ratingValue: 4.9,
      reviewCount: 120
    }),
    relatedTours: [
      { title: 'Ashtavinayak Yatra', slug: 'ashtavinayak-yatra' },
      { title: 'Char Dham Yatra', slug: 'char-dham-yatra' }
    ],
    relatedBlogs: [
      { title: 'All 12 Jyotirlinga Temples: Complete Information', slug: 'all-12-jyotirlinga-information' }
    ]
  },
  {
    slug: 'pandharpur-wari',
    title: 'Pandharpur Wari',
    metaTitle: 'Pandharpur Wari Yatra Package | Shailraj Travels',
    metaDescription: 'Join Pandharpur Wari Yatra with comfortable bus travel & guided darshan. Book Wari pilgrimage packages from Pune. Call us today.',
    canonicalUrl: 'https://www.shailrajtravels.com/tours/pandharpur-wari',
    heroContent: {
      image: '/images/pandharpur.jpg',
      description: 'Experience the devotion of the Pandharpur Wari with our perfectly organized travel packages.'
    },
    overview: '<p>The Pandharpur Wari is a magnificent pilgrimage of devotion. We provide hassle-free transport and stay so you can focus entirely on Vitthal darshan.</p>',
    highlights: ['Direct AC Bus to Pandharpur', 'Comfortable Stay', 'Fasting food arrangements if needed', 'Guided Darshan'],
    destinations: ['Pandharpur'],
    packages: [
      {
        title: 'Ashadhi Ekadashi Special',
        price: '3500',
        inclusions: ['Bus Travel', '1 Night Stay', 'Meals'],
        exclusions: ['Special VIP Darshan tickets (if applicable)']
      }
    ],
    faq: [
      { question: 'What is included in the Pandharpur Wari package?', answer: 'Travel, stay, and food.' },
      { question: 'How many days does the Pandharpur Wari tour take?', answer: 'Usually 2 Days and 1 Night from Pune.' },
      { question: 'Is food and accommodation included?', answer: 'Yes.' },
      { question: 'Can senior citizens join the tour?', answer: 'Yes, we provide comfortable seating and assistance.' },
      { question: 'What is the best time for Pandharpur Wari?', answer: 'Ashadhi and Kartiki Ekadashi are the main events.' },
      { question: 'Is the tour suitable for families with children?', answer: 'Yes.' },
      { question: 'What transport is used?', answer: 'AC Pushback Buses.' },
      { question: 'How do I book and what is the cancellation policy?', answer: 'Advance booking is required due to high demand.' }
    ],
    schemaData: generateProductSchema({
      name: 'Pandharpur Wari Yatra Package',
      description: 'Join Pandharpur Wari Yatra with comfortable bus travel.',
      image: 'https://www.shailrajtravels.com/images/pandharpur.jpg',
      price: '3500',
      ratingValue: 4.7,
      reviewCount: 95
    }),
    relatedTours: [
      { title: 'Ashtavinayak Yatra', slug: 'ashtavinayak-yatra' },
      { title: 'Shirdi Tour', slug: 'shirdi-tour' }
    ],
    relatedBlogs: [
      { title: 'Pandharpur Wari Yatra 2026 — Dates, Route, Tips', slug: 'pandharpur-wari-yatra-2026' }
    ]
  },
  {
    slug: 'char-dham-yatra',
    title: 'Char Dham Yatra',
    metaTitle: 'Char Dham Yatra Package from Pune | Shailraj Travels',
    metaDescription: 'Book Char Dham Yatra with flights, accommodation & guided darshan. Kedarnath, Badrinath, Gangotri, Yamunotri — book now.',
    canonicalUrl: 'https://www.shailrajtravels.com/tours/char-dham-yatra',
    heroContent: {
      image: '/images/chardham.jpg',
      description: 'A life-transforming journey to the Himalayas covering Kedarnath, Badrinath, Gangotri, and Yamunotri.'
    },
    overview: '<p>The complete Char Dham yatra package starting from Pune, managing all flights, local transport, helicopter tickets, and premium stays in Uttarakhand.</p>',
    highlights: ['Pune to Delhi Flights', 'Helicopter booking assistance for Kedarnath', 'Premium Hotels', 'Medical assistance on standby'],
    destinations: ['Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'],
    packages: [
      {
        title: 'Complete Char Dham (12 Days)',
        price: '35000',
        inclusions: ['Flights', 'Hotels', 'All Meals', 'Local Transport'],
        exclusions: ['Helicopter tickets', 'Pony/Palki charges']
      }
    ],
    faq: [
      { question: 'What is included in the Char Dham Yatra package?', answer: 'Flights from Pune, hotels, food, and local transport.' },
      { question: 'How many days does the Char Dham Yatra take?', answer: '12 to 14 days.' },
      { question: 'Is food and accommodation included?', answer: 'Yes, premium stays and pure veg food.' },
      { question: 'Can senior citizens join the tour?', answer: 'Yes, but a medical fitness certificate is highly recommended.' },
      { question: 'What is the best time for Char Dham Yatra?', answer: 'May-June and September-October.' },
      { question: 'Is the tour suitable for families with children?', answer: 'Older children yes, very young infants are not recommended due to altitude.' },
      { question: 'What transport is used?', answer: 'Flights to Dehradun/Delhi, followed by Innova/Tempo Traveller.' },
      { question: 'How do I book and what is the cancellation policy?', answer: 'Early booking is required. Cancellation terms apply.' }
    ],
    schemaData: generateProductSchema({
      name: 'Char Dham Yatra Package',
      description: 'Book Char Dham Yatra with flights, accommodation & guided darshan.',
      image: 'https://www.shailrajtravels.com/images/chardham.jpg',
      price: '35000',
      ratingValue: 4.9,
      reviewCount: 210
    }),
    relatedTours: [
      { title: 'Jyotirlinga Darshan', slug: 'jyotirlinga-darshan' }
    ],
    relatedBlogs: [
      { title: 'Char Dham Yatra Travel Tips for First-Timers', slug: 'char-dham-yatra-tips' }
    ]
  },
  {
    slug: 'shirdi-tour',
    title: 'Shirdi Tour',
    metaTitle: 'Shirdi Tour Package from Pune | Shailraj Travels',
    metaDescription: 'One day & overnight Shirdi tour packages from Pune with AC travel & Sai Baba darshan assistance. Book with Shailraj Travels.',
    canonicalUrl: 'https://www.shailrajtravels.com/tours/shirdi-tour',
    heroContent: {
      image: '/images/shirdi.jpg',
      description: 'Peaceful Shirdi Sai Baba darshan tour from Pune, including Shani Shingnapur.'
    },
    overview: '<p>Convenient one-day and overnight tour packages from Pune to Shirdi and Shani Shingnapur.</p>',
    highlights: ['AC Travel from Pune', 'VIP Darshan pass assistance', 'Visit to Shani Shingnapur'],
    destinations: ['Shirdi', 'Shani Shingnapur'],
    packages: [
      {
        title: 'Shirdi 1 Day Tour',
        price: '1500',
        inclusions: ['AC Bus Travel', 'Breakfast & Lunch'],
        exclusions: ['VIP Darshan Tickets']
      }
    ],
    faq: [
      { question: 'What is included in the Shirdi Tour package?', answer: 'Travel and meals.' },
      { question: 'How many days does the Shirdi Tour take?', answer: '1 Day or 2 Day options available.' },
      { question: 'Is food and accommodation included?', answer: 'Yes, based on package selected.' },
      { question: 'Can senior citizens join the tour?', answer: 'Yes.' },
      { question: 'What is the best time for Shirdi Tour?', answer: 'Year-round.' },
      { question: 'Is the tour suitable for families with children?', answer: 'Yes.' },
      { question: 'What transport is used?', answer: 'AC Bus or Private Car.' },
      { question: 'How do I book and what is the cancellation policy?', answer: 'Book online or via WhatsApp.' }
    ],
    schemaData: generateProductSchema({
      name: 'Shirdi Tour Package',
      description: 'One day & overnight Shirdi tour packages from Pune.',
      image: 'https://www.shailrajtravels.com/images/shirdi.jpg',
      price: '1500',
      ratingValue: 4.8,
      reviewCount: 320
    }),
    relatedTours: [
      { title: 'Ashtavinayak Yatra', slug: 'ashtavinayak-yatra' },
      { title: 'Pandharpur Wari', slug: 'pandharpur-wari' }
    ],
    relatedBlogs: [
      { title: 'Shirdi Darshan Guide: How to Book, Best Time, Tips', slug: 'shirdi-darshan-guide' }
    ]
  },
  {
    slug: 'tirupati-balaji-tour',
    title: 'Tirupati Balaji Tour',
    metaTitle: 'Tirupati Balaji Tour from Pune | Shailraj Travels',
    metaDescription: 'Book Tirupati Balaji darshan tour from Pune with flight, stay & VIP darshan tickets. Trusted pilgrimage operator — Shailraj Travels.',
    canonicalUrl: 'https://www.shailrajtravels.com/tours/tirupati-balaji-tour',
    heroContent: {
      image: '/images/tirupati.jpg',
      description: 'Hassle-free Tirupati Balaji Darshan packages from Pune with confirmed VIP tickets.'
    },
    overview: '<p>Getting Tirupati Balaji darshan tickets can be difficult. We manage flights, local transport, accommodation, and guaranteed darshan passes.</p>',
    highlights: ['Direct Flights from Pune', 'Confirmed VIP Darshan', 'Premium AC Stay', 'Local Sightseeing'],
    destinations: ['Tirupati', 'Tirumala', 'Kalahasti'],
    packages: [
      {
        title: 'Tirupati Flight Package (2N/3D)',
        price: '16500',
        inclusions: ['Return Flights', 'AC Hotel', 'Special Entry Darshan', 'Local Cabs'],
        exclusions: ['Personal Expenses']
      }
    ],
    faq: [
      { question: 'What is included in the Tirupati Tour package?', answer: 'Flights, hotel, cabs, and Darshan tickets.' },
      { question: 'How many days does the Tirupati Tour take?', answer: '3 Days and 2 Nights.' },
      { question: 'Is food and accommodation included?', answer: 'Accommodation is included. Breakfast is included.' },
      { question: 'Can senior citizens join the tour?', answer: 'Yes, special queue access is arranged if eligible.' },
      { question: 'What is the best time for Tirupati Tour?', answer: 'Year-round.' },
      { question: 'Is the tour suitable for families with children?', answer: 'Yes.' },
      { question: 'What transport is used?', answer: 'Flights from Pune, AC Sedans locally.' },
      { question: 'How do I book and what is the cancellation policy?', answer: 'Darshan tickets are non-refundable once booked.' }
    ],
    schemaData: generateProductSchema({
      name: 'Tirupati Balaji Tour Package',
      description: 'Book Tirupati Balaji darshan tour from Pune with flight.',
      image: 'https://www.shailrajtravels.com/images/tirupati.jpg',
      price: '16500',
      ratingValue: 4.9,
      reviewCount: 185
    }),
    relatedTours: [
      { title: 'Jyotirlinga Darshan', slug: 'jyotirlinga-darshan' }
    ],
    relatedBlogs: [
      { title: 'Tirupati Balaji Darshan: VIP Tickets, Travel Guide', slug: 'tirupati-darshan-guide' }
    ]
  }
];
