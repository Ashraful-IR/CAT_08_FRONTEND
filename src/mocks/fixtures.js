/**
 * MSW fixtures — mirror docs/API_CONTRACT.md.
 * Doctor shape confirmed against the deployed backend (DECISIONS D-001).
 */

export const doctorFixtures = [
  {
    _id: "6a51ea90108e8a8b1caaf768",
    name: "Dr. Fatema Begum",
    specialty: "Gynecologist",
    fee: 1300,
    rating: 4.9,
    photoURL: "https://i.ibb.co/dr-fatema.jpg",
    description: "Expert in women's reproductive health and prenatal care.",
  },
  {
    _id: "6a51ea90108e8a8b1caaf765",
    name: "Dr. Karim Uddin",
    specialty: "Dermatologist",
    fee: 1000,
    rating: 4.7,
    photoURL: "https://i.ibb.co/dr-karim.jpg",
    description: "Skin care specialist with over 10 years of clinical practice.",
  },
  {
    _id: "6a51ea90108e8a8b1caaf764",
    name: "Dr. Ayesha Rahman",
    specialty: "Cardiologist",
    fee: 1500,
    rating: 4.9,
    photoURL: "https://i.ibb.co/dr-ayesha.jpg",
    description: "Interventional cardiologist focused on preventive heart care.",
  },
  {
    _id: "6a51ea90108e8a8b1caaf766",
    name: "Dr. Mahmud Hasan",
    specialty: "Orthopedic",
    fee: 1200,
    rating: 4.5,
    photoURL: "https://i.ibb.co/dr-mahmud.jpg",
    description: "Bone, joint and sports-injury specialist.",
  },
  {
    _id: "6a51ea90108e8a8b1caaf767",
    name: "Dr. Nusrat Jahan",
    specialty: "Pediatrician",
    fee: 900,
    rating: 4.8,
    photoURL: "https://i.ibb.co/dr-nusrat.jpg",
    description: "Child health specialist with a gentle, family-first approach.",
  },
];

/** Sorted by rating desc, sliced to 3 — matches GET /doctors/top-rated. */
export const topRatedFixtures = [...doctorFixtures]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 3);
