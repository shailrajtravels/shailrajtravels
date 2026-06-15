import { Author } from '../frontend/types/author';

export const authors: Record<string, Author> = {
  'shailesh-raj': {
    id: 'shailesh-raj',
    name: 'Shailesh Raj',
    role: 'Founder & Chief Pilgrimage Guide',
    yearsOfExperience: 15,
    bio: 'Shailesh Raj is the founder of Shailraj Travels and a veteran in the Indian pilgrimage tourism sector. Having personally led over 500 Char Dham and Ashtavinayak yatras, he ensures that every journey prioritizes spiritual authenticity, comfort, and safety. He regularly audits routes and accommodations to maintain the highest service standards.',
    avatarUrl: '/images/authors/shailesh-raj.jpg',
    expertiseAreas: ['Hindu Pilgrimages', 'High-Altitude Trekking', 'Senior Citizen Travel Planning', 'Vedic Temple History'],
    regionsCovered: ['Maharashtra', 'Uttarakhand', 'Gujarat', 'Andhra Pradesh', 'Uttar Pradesh'],
    languages: ['Marathi', 'Hindi', 'English'],
    contactProfileUrl: '/about',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/shailrajtravels',
      twitter: 'https://twitter.com/shailrajtravels'
    }
  },
  'priya-deshmukh': {
    id: 'priya-deshmukh',
    name: 'Priya Deshmukh',
    role: 'Senior Travel Consultant & Reviewer',
    yearsOfExperience: 8,
    bio: 'Priya is a cultural historian and senior travel planner specializing in Maharashtra’s Jyotirlinga and Ashtavinayak circuits. She fact-checks all itineraries for historical accuracy and logistical feasibility, ensuring our pilgrims have a seamless Darshan experience.',
    avatarUrl: '/images/authors/priya-deshmukh.jpg',
    expertiseAreas: ['Cultural History', 'Tour Logistics', 'Family Travel'],
    regionsCovered: ['Maharashtra', 'Madhya Pradesh'],
    languages: ['Marathi', 'English', 'Hindi'],
    contactProfileUrl: '/about'
  }
};
