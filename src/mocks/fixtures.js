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
    photoURL: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=256&q=80",
    description: "Expert in women's reproductive health and prenatal care.",
  },
  {
    _id: "6a51ea90108e8a8b1caaf765",
    name: "Dr. Karim Uddin",
    specialty: "Dermatologist",
    fee: 1000,
    rating: 4.7,
    photoURL: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=256&q=80",
    description: "Skin care specialist with over 10 years of clinical practice.",
  },
  {
    _id: "6a51ea90108e8a8b1caaf764",
    name: "Dr. Ayesha Rahman",
    specialty: "Cardiologist",
    fee: 1500,
    rating: 4.9,
    photoURL: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=256&q=80",
    description: "Interventional cardiologist focused on preventive heart care.",
  },
  {
    _id: "6a51ea90108e8a8b1caaf766",
    name: "Dr. Mahmud Hasan",
    specialty: "Orthopedic",
    fee: 1200,
    rating: 4.5,
    photoURL: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=256&q=80",
    description: "Bone, joint and sports-injury specialist.",
  },
  {
    _id: "6a51ea90108e8a8b1caaf767",
    name: "Dr. Nusrat Jahan",
    specialty: "Pediatrician",
    fee: 900,
    rating: 4.8,
    photoURL: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=256&q=80",
    description: "Child health specialist with a gentle, family-first approach.",
  },
];

/** Sorted by rating desc, sliced to 3 — matches GET /doctors/top-rated. */
export const topRatedFixtures = [...doctorFixtures]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 3);

/** Shape per API_CONTRACT → Review (for Dr. Fatema Begum, doctor 768). */
export const reviewFixtures = [
  {
    _id: "6a51ea90108e8a8b1cab0001",
    doctorId: "6a51ea90108e8a8b1caaf768",
    appointmentId: "6a51ea90108e8a8b1cab1001",
    rating: 5,
    comment: "Very caring and thorough. Everything was explained clearly.",
    userEmail: "patient1@example.com",
    userName: "Tania Akter",
    userPhotoURL: "https://randomuser.me/api/portraits/women/65.jpg",
    createdAt: "2026-09-20T10:00:00.000Z",
  },
  {
    _id: "6a51ea90108e8a8b1cab0002",
    doctorId: "6a51ea90108e8a8b1caaf768",
    appointmentId: "6a51ea90108e8a8b1cab1002",
    rating: 4,
    comment: "Great consultation, slightly long wait time.",
    userEmail: "patient2@example.com",
    userName: "Rahim Mia",
    userPhotoURL: "",
    createdAt: "2026-09-22T15:30:00.000Z",
  },
];

/**
 * Public appointment list (GET /appointments) — B-001: client code may only
 * use doctorId + date + time (to grey out booked slots), never display it.
 * The endpoint returns full Appointment objects (contract), so the fixtures
 * mirror that shape; dates are future-relative to the frozen test clock
 * (2026-09-28).
 */
export const publicAppointmentFixtures = [
  {
    _id: "6a51ea90108e8a8b1cab2001",
    userEmail: "patient1@example.com",
    doctorId: "6a51ea90108e8a8b1caaf768",
    doctorName: "Dr. Fatema Begum",
    fee: 1300,
    rating: 4.9,
    patientName: "Tania Akter",
    gender: "Female",
    phone: "01710000001",
    appointmentDate: "2026-09-30",
    appointmentTime: "11:00 AM",
    createdAt: "2026-09-27T09:00:00.000Z",
  },
  {
    _id: "6a51ea90108e8a8b1cab2002",
    userEmail: "patient2@example.com",
    doctorId: "6a51ea90108e8a8b1caaf768",
    doctorName: "Dr. Fatema Begum",
    fee: 1300,
    rating: 4.9,
    patientName: "Rahim Mia",
    gender: "Male",
    phone: "01710000002",
    appointmentDate: "2026-09-30",
    appointmentTime: "02:00 PM",
    createdAt: "2026-09-27T10:00:00.000Z",
  },
  {
    _id: "6a51ea90108e8a8b1cab2003",
    userEmail: "patient3@example.com",
    doctorId: "6a51ea90108e8a8b1caaf764",
    doctorName: "Dr. Ayesha Rahman",
    fee: 1500,
    rating: 4.9,
    patientName: "Kamal Hossain",
    gender: "Male",
    phone: "01710000003",
    appointmentDate: "2026-09-30",
    appointmentTime: "10:00 AM",
    createdAt: "2026-09-27T11:00:00.000Z",
  },
];

/** Shape per API_CONTRACT → User. */
export const userFixture = {
  id: "u-123",
  name: "Rifat Hossain",
  email: "rifat@example.com",
  photoURL: "https://randomuser.me/api/portraits/men/32.jpg",
};

/** Response body of POST /auth/sign-in/email (token is ignored by the frontend). */
export const signInResponseFixture = {
  message: "Sign-in successful",
  token: "mock.jwt.token",
  user: userFixture,
};

/** Response body of GET /auth/session. */
export const sessionResponseFixture = { user: userFixture };

/**
 * Response body of GET /appointments/mine (Rifat's own bookings; frozen test
 * clock is 2026-09-28): one upcoming (2026-09-30 10:00 AM with doctor 768,
 * matching a slot the public list marks booked for that doctor) and one past
 * (2026-09-20 09:00 AM) so the Upcoming/Past tabs both have content.
 */
export const myAppointmentFixtures = [
  {
    _id: "6a51ea90108e8a8b1cab3001",
    userEmail: "rifat@example.com",
    doctorId: "6a51ea90108e8a8b1caaf768",
    doctorName: "Dr. Fatema Begum",
    fee: 1300,
    rating: 4.9,
    patientName: "Rifat Hossain",
    gender: "Male",
    phone: "01712345678",
    appointmentDate: "2026-09-30",
    appointmentTime: "10:00 AM",
    createdAt: "2026-09-27T09:30:00.000Z",
  },
  {
    _id: "6a51ea90108e8a8b1cab3002",
    userEmail: "rifat@example.com",
    doctorId: "6a51ea90108e8a8b1caaf765",
    doctorName: "Dr. Karim Uddin",
    fee: 1000,
    rating: 4.7,
    patientName: "Rifat Hossain",
    gender: "Male",
    phone: "01712345678",
    appointmentDate: "2026-09-20",
    appointmentTime: "09:00 AM",
    createdAt: "2026-09-15T11:00:00.000Z",
  },
];
