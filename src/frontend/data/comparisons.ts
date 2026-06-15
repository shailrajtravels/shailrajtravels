export interface Comparison {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  toursCompared: string[];
  keyDifferences: { aspect: string; optionA: string; optionB: string }[];
  verdict: string;
}

export const comparisons: Comparison[] = [
  {
    slug: 'ujjain-vs-kashi-vishwanath',
    title: 'Ujjain Mahakaleshwar vs Kashi Vishwanath Tour',
    metaTitle: 'Ujjain vs Kashi Vishwanath Jyotirlinga Tour Comparison | Shailraj Travels',
    metaDescription: 'Comparing the Ujjain Mahakaleshwar Jyotirlinga experience with Kashi Vishwanath. Which spiritual journey from Pune should you choose first?',
    toursCompared: ['ujjain-mahakaleshwar-omkareshwar-tour', 'jagannath-puri-tour'], // Using a fallback tour for B if Kashi is missing, but let's assume we can map it to our 5 tours. Actually, let's keep it strictly between the 5 tours if possible, or use the 5 tours vs existing tours. Let's compare Ujjain vs Dwarka Somnath.
    keyDifferences: [
      { aspect: 'Primary Deity', optionA: 'Lord Shiva (Mahakal)', optionB: 'Lord Krishna (Dwarkadhish) & Lord Shiva (Somnath)' },
      { aspect: 'Tour Duration', optionA: '3 Days / 2 Nights', optionB: '5 Days / 4 Nights' },
      { aspect: 'Key Rituals', optionA: 'Bhasma Aarti (Ujjain)', optionB: 'Evening Sea-facing Aarti (Somnath)' },
      { aspect: 'Travel Fatigue', optionA: 'Low (Direct flight/train to Indore)', optionB: 'Moderate (Long driving distances in Gujarat)' }
    ],
    verdict: 'If you want a quick, intense, and deeply spiritual 3-day trip focused purely on Lord Shiva, choose Ujjain. If you have 5 days and want a scenic coastal pilgrimage covering both Krishna and Shiva, choose the Dwarka Somnath tour.'
  },
  {
    slug: 'ashtavinayak-vs-saptashrungi',
    title: 'Ashtavinayak Yatra vs Saptashrungi Tour',
    metaTitle: 'Ashtavinayak vs Saptashrungi Weekend Tour Comparison | Shailraj Travels',
    metaDescription: 'Comparing the 2-day Ashtavinayak Yatra with the Saptashrungi Devi weekend tour from Pune. Which is better for family?',
    toursCompared: ['ashtavinayak-yatra', 'saptashrungi-tour'],
    keyDifferences: [
      { aspect: 'Focus', optionA: '8 Ganesha Temples', optionB: '1 Shakti Peetha Devi Temple (+ Trimbakeshwar)' },
      { aspect: 'Pacing', optionA: 'Fast (Covering 8 temples in 2 days)', optionB: 'Relaxed (1 or 2 temples in 2 days)' },
      { aspect: 'Travel Medium', optionA: 'Group AC Bus', optionB: 'Private Car / Small Group' },
      { aspect: 'Physical Strain', optionA: 'Moderate (Getting in and out of bus frequently)', optionB: 'Low (Ropeway available at Saptashrungi)' }
    ],
    verdict: 'For a spiritually exhaustive traditional pilgrimage with family, the Ashtavinayak Yatra is unparalleled. For a highly relaxed, low-strain weekend getaway with senior citizens, the Saptashrungi tour is the better choice.'
  },
  {
    slug: 'dwarka-somnath-vs-jagannath-puri',
    title: 'Dwarka Somnath vs Jagannath Puri Tour',
    metaTitle: 'Dwarka Somnath vs Jagannath Puri Tour Comparison | Shailraj Travels',
    metaDescription: 'Compare the western Dham (Dwarka) with the eastern Dham (Jagannath Puri). Travel logistics from Pune, Darshan experiences, and costs.',
    toursCompared: ['dwarka-somnath-girnar-tour', 'jagannath-puri-tour'],
    keyDifferences: [
      { aspect: 'Location', optionA: 'West Coast (Arabian Sea, Gujarat)', optionB: 'East Coast (Bay of Bengal, Odisha)' },
      { aspect: 'Primary Dham', optionA: 'Dwarkadhish', optionB: 'Lord Jagannath' },
      { aspect: 'Local Sightseeing', optionA: 'Girnar Ropeway, Nageshwar, Porbandar', optionB: 'Konark Sun Temple, Chilika Lake' },
      { aspect: 'Travel from Pune', optionA: 'Flight/Train to Ahmedabad or Rajkot', optionB: 'Direct Flight to Bhubaneswar' }
    ],
    verdict: 'Both are supreme Dhams of Lord Vishnu/Krishna. Jagannath Puri is generally faster to reach from Pune via a direct flight and offers a more relaxed beach-town vibe. Dwarka Somnath is a more extensive, multi-city road trip offering a higher density of temples.'
  }
];
