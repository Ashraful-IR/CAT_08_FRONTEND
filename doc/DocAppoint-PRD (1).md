# Product Requirements Document (PRD)
## DocAppoint — Doctor Appointment Booking System

**Category:** CAT_08
**Document Version:** 1.0
**Status:** Draft — ready for review

---

## 1. Overview

### 1.1 Project Summary
DocAppoint is a full-stack Doctor Appointment Booking web application. Users can browse available doctors from the home page, view doctor details, and book appointments. Authenticated users can manage their own bookings and profile through a private dashboard. The system uses secure authentication (Better Auth with JWT/session-based access) and persists all data in MongoDB.

### 1.2 Goals
- Let patients discover doctors and book appointments with minimal friction.
- Give logged-in users full self-service control over their own bookings and profile.
- Protect private routes and user-specific data via JWT-based authentication.
- Ship a fully responsive, SEO-aware, production-deployed single-page application with no reload/route errors.

### 1.3 Assumptions & Decisions Made for This PRD
> These were confirmed with the requester before drafting:
- **Scope:** All optional features are included (doctor reviews, search, sorting, theme toggle).
- **Tech stack:** Next.js (fullstack: App Router for both client UI and API routes) + Tailwind CSS + MongoDB.
- **Social login provider:** Google (via Better Auth's Google OAuth provider). GitHub login will not be implemented, per the "only one provider" rule.

> Confirmed with the requester:
- **Two additional home page sections:** (1) "How It Works" (3–4 step process: Search → Select Doctor → Book → Get Confirmation) and (2) "Why Choose Us" (trust badges: verified doctors, secure booking, 24/7 support, patient reviews).
- **Unique design direction:** a clean, medical-trust-oriented theme (soft blues/teals, generous whitespace, card-based layouts) — final visual identity to be defined during UI design, distinct from course examples/prior projects as required.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router), fullstack — client + API routes in a single repo (see repo structure note below) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix + Tailwind) — Form, Dialog/Modal, Button, Card, Input, Select, Dropdown, Toast (Sonner), Avatar, Badge, Skeleton (loading states), etc. |
| Database | MongoDB via Mongoose (see §7.1 for setup details) |
| Authentication | Better Auth (Google OAuth + Email/Password), JWT/session-based |
| Notifications | shadcn/ui `toast` (Sonner-based) — no native `alert()` allowed |
| Image slider | Swiper.js (hero banner, optional) |
| Deployment | Vercel (recommended for Next.js) |
| State/data fetching | Native `fetch` / React Query (optional) for client-server communication |

> **Repo structure (decided):** A **single Next.js repository** will be used. Client work (pages, components, UI) and server work (API routes under `app/api/**`, database logic, auth handlers) will be organized in clearly separated folders (`app/(client)` vs `app/api`, `lib/db`, `lib/models`) and committed separately, so commit history can be filtered/counted to satisfy the "15+ client commits / 8+ server commits" rule at submission time.

---

## 3. User Roles

| Role | Description |
|---|---|
| Guest (unauthenticated) | Can browse home page and all appointments listing, but cannot view doctor details or book. Redirected to Login when attempting protected actions. |
| Registered User (authenticated) | Full access: view doctor details, book appointments, manage own bookings, manage own profile, leave reviews after booking. |

---

## 4. Functional Requirements

### 4.1 Global Layout

**Navbar**
- Logo + site name (DocAppoint)
- Links: Home, All Appointments, Dashboard
- If not logged in: show Login and Register buttons
- If logged in: show user's profile picture + Logout button
- **Theme switcher** with three modes: **Light / Dark / System** (System follows the OS preference via `prefers-color-scheme`). Selection persists across sessions.

**Footer**
- Website name + logo
- Social icons (including the **new X logo**, not the legacy Twitter bird)

---

### 4.2 Home Page

1. **Hero Banner**
   - Modern banner introducing the platform's value proposition
   - Swiper.js slider for interactive engagement (e.g., rotating featured doctors or promotions)

2. **Top Rated Doctors**
   - Dynamically display exactly 3 top-rated doctors in a card layout
   - Each card: doctor photo, name, specialty, rating, "View Details" button
   - "View Details" click behavior:
     - Logged in → navigate to Doctor Details page
     - Not logged in → redirect to Login page

3. **How It Works**
   - Simple 3–4 step visual walkthrough of the booking process

4. **Why Choose Us**
   - Trust-building highlights: verified doctors, secure data, easy scheduling, patient reviews

---

### 4.3 All Appointments Page
- Displays all available appointment slots/doctors dynamically in a responsive card grid
- Each card includes relevant info (doctor name, specialty, fee, availability) + "View Details" button
- Click behavior mirrors Home page: authenticated → Doctor Details, unauthenticated → Login
- **Search:** search bar to filter by Doctor Name
- **Sort:** sorting control (e.g., by fee, rating, or name)
- Loading spinner shown while data is fetched

---

### 4.4 Doctor Details Page
- Displays full doctor profile dynamically: name, specialty, image, experience, availability slots, description, hospital, location, consultation fee
- "Book Appointment" button → opens a booking modal or navigates to a booking page
- **Review section** *(optional feature — included per scope decision):*
  - Displays existing reviews for this doctor
  - A user who has booked an appointment with this doctor can submit a review (rating + comment)
  - **Multiple reviews allowed:** a user may leave a separate review for each distinct booking/appointment they've had with the same doctor (not limited to one review per doctor)

**Example doctor data shape:**
```json
{
  "id": "d1",
  "name": "Dr. Ayesha Rahman",
  "specialty": "Cardiologist",
  "image": "https://i.ibb.co/doctor-demo.jpg",
  "experience": "10 years",
  "availability": ["09:00 AM - 12:00 PM", "04:00 PM - 07:00 PM"],
  "description": "Highly experienced cardiologist specializing in heart diseases, preventive care, and patient-centered treatment.",
  "hospital": "Labaid Cardiac Hospital",
  "location": "Dhanmondi, Dhaka",
  "fee": 800
}
```

---

### 4.5 Appointment Booking (Modal or Page)
- Form fields (based on preference), at minimum:
  - Patient Name
  - Gender
  - Phone Number
  - Appointment Date
  - Appointment Time
  - (User email and doctor name auto-filled from logged-in user / selected doctor, not manually entered)
- Submit button saves the record to MongoDB
- **Double-booking prevention:** before saving, the server checks whether the selected doctor already has an appointment at the same `appointmentDate` + `appointmentTime`. If a conflict exists, the booking is rejected with a `409 Conflict` and a clear inline/toast error (e.g., "This slot is already booked. Please choose another time.") instead of being saved.
- On success: toast message — **"Appointment booked successfully!"**

**Example appointment data shape (as saved to MongoDB):**
```json
{
  "userEmail": "user@gmail.com",
  "doctorName": "Dr. Ayesha Rahman",
  "patientName": "Rahim Uddin",
  "gender": "Male",
  "phone": "01712345678",
  "appointmentDate": "2026-05-12",
  "appointmentTime": "10:30 AM"
}
```

---

### 4.6 Authentication

**Login Page**
- Title: "Login"
- Fields: Email, Password
- "Forgot Password" link (UI only — **no working reset flow required**, per spec)
- Link: "Don't have an account? Register"
- Social login: **Google** button only
- Login button

**Behavior:**
- Success → redirect to previously requested protected route, or Home (`/`) if none
- Failure → show inline or toast error message (no native `alert()`)

**Register Page**
- Title: "Register"
- Fields: Name, Email, Photo URL, Password, **Confirm Password**
- Link: "Already have an account? Login"
- Social signup: **Google** button only
- Register button

**Behavior:**
- **Password validation (regex-enforced):** `^(?=.*[a-z])(?=.*[A-Z]).{6,}$`
  - At least 1 uppercase letter, at least 1 lowercase letter, minimum 6 characters
  - Validated on the client (inline, on blur/submit) and re-validated server-side before saving
- **Confirm Password:** must exactly match the Password field; mismatch blocks submission with an inline error ("Passwords do not match")
- Invalid password or mismatched confirmation → inline error, registration blocked
- Success → redirect to Login page
- Failure (e.g., duplicate email, server error) → inline or toast error
- Social signup success → redirect to Home page

**Explicitly out of scope (confirmed, per spec):**
- **Email verification** — not implemented
- Working "Forgot Password" flow — UI link present but no functional reset
> These may be added later, after assignment evaluation.

---

### 4.7 Dashboard (Private Route)
Access rule: only visible to logged-in users. Unauthenticated access → redirect to Login. **Logged-in users must not be redirected to Login on page reload of any private route** (session/JWT must persist and be verified correctly on refresh).

**4.7.1 My Bookings**
- Lists only the appointments belonging to the currently logged-in user
- Each booking card: relevant appointment details + Update and Delete buttons

*Update Appointment*
- Opens a pre-filled form modal
- Doctor info and user email fields are **read-only** (cannot be edited)
- Editable fields: patient name, gender, phone, appointment date/time (or similar, per preference)
- On Save: update MongoDB record → update UI instantly (no reload) → close modal → toast: **"Appointment updated successfully!"**

*Delete Appointment*
- Deletes from MongoDB → removes from UI instantly → toast: **"Appointment deleted successfully!"**

**4.7.2 My Profile**
- Displays: Name, Email, Profile Photo
- "Update Profile" button → opens pre-filled modal
  - Editable fields: Name, Photo (URL)
- On Submit: update user record → instant UI update (no refresh) → close modal → toast: **"Profile updated successfully!"**

---

## 5. Optional / Challenge Features (In Scope)

| Feature | Description |
|---|---|
| JWT-based authentication | Secure token issuance/verification for protected routes and API calls |
| SEO metadata | Meaningful `<title>` and meta description per page (Next.js `metadata` API) |
| Search | Search All Appointments by Doctor Name |
| Doctor Reviews | Users who booked an appointment can leave a rating/comment on the doctor's page |
| Sorting | Sort All Appointments (e.g., by fee, rating, name) |
| Theme toggle | Light/dark mode switch |

---

## 6. Non-Functional Requirements

- **No Lorem Ipsum** anywhere in the UI — all copy must be realistic/purpose-written.
- **No native `alert()`** for success/error messages — use toast notifications or inline UI.
- **Responsive design** across mobile, tablet, and desktop.
- **No errors on page reload** from any route (deep-linking must work).
- **Persistent auth on reload** — private routes must not bounce a logged-in user to Login.
- **Loading states** — spinner shown during data fetches.
- **Custom 404 page** for invalid/unmatched routes.
- **Consistent design system** — consistent heading styles, button styles, spacing, image sizing, and card dimensions across all sections/pages, per UI guidelines in the spec.
- **Unique visual design** — not a reused/duplicate of prior course projects or example modules.

### 6.1 Design System

**Theme modes:** Light, Dark, and System (auto-detects OS preference). Implemented via a CSS-variable-based Tailwind theme (`dark:` variants + a `data-theme` or `class` strategy) so all colors, borders, and surfaces adapt consistently across modes.

**Color palette (minimalistic, medical/healthcare-appropriate):**

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| Primary | `#0F766E` (teal-700) | `#2DD4BF` (teal-400) | Buttons, links, active nav, brand accents |
| Primary Hover | `#0D5D57` | `#5EEAD4` | Hover/active states |
| Secondary/Accent | `#3B82F6` (soft clinical blue) | `#60A5FA` | Secondary actions, info badges |
| Background | `#FFFFFF` / `#F8FAFC` | `#0B1220` / `#111827` | Page and card backgrounds |
| Surface/Card | `#FFFFFF` with subtle shadow | `#1E293B` | Cards, modals |
| Text Primary | `#0F172A` | `#F1F5F9` | Headings, body text |
| Text Muted | `#64748B` | `#94A3B8` | Secondary text, labels |
| Success | `#16A34A` | `#4ADE80` | Success toasts, confirmations |
| Error | `#DC2626` | `#F87171` | Error toasts, validation messages |
| Border | `#E2E8F0` | `#334155` | Card borders, dividers |

**Design principles:**
- Generous whitespace, soft shadows, rounded corners (`rounded-xl`/`rounded-2xl`) for a calm, trustworthy clinical feel — avoiding saturated or alarming colors.
- One consistent heading scale (e.g., `text-3xl/font-bold` for section titles) and one button style (solid primary + outline secondary) reused everywhere, per the spec's consistency rules.
- Icons kept simple/line-style (e.g., `lucide-react`) to match the minimalist tone.

---

## 7. Data Models (MongoDB)

**User**
```
{
  _id,
  name,
  email,
  photoURL,
  provider: "credentials" | "google",
  createdAt
}
```

**Doctor**
```
{
  _id,
  name,
  specialty,
  image,
  experience,
  availability: [String],
  description,
  hospital,
  location,
  fee,
  rating (avg, derived from reviews)
}
```

**Appointment**
```
{
  _id,
  userEmail,
  doctorId,
  doctorName,
  patientName,
  gender,
  phone,
  appointmentDate,
  appointmentTime,
  createdAt
}
```

**Review** *(optional feature — multiple reviews per doctor allowed, one per appointment)*
```
{
  _id,
  doctorId,
  appointmentId,
  userEmail,
  userName,
  rating (1–5),
  comment,
  createdAt
}
```

### 7.1 Database Setup Requirements

- **Cluster:** MongoDB Atlas (free M0 tier), or local MongoDB for early development
- **Env variable:** `MONGODB_URI` stored in `.env.local` (never committed to the repo)
- **Database name:** `docappoint`
- **ODM:** Mongoose — provides schema validation and consistent error objects that feed directly into the REST error format below (§8)
- **Indexes:**
  - Unique index on `users.email`
  - Text index on `doctors.name` (powers the All Appointments search-by-doctor-name feature)
  - Standard index on `appointments.userEmail` (speeds up "My Bookings" queries)
  - **Compound unique index on `appointments.doctorId + appointmentDate + appointmentTime`** — enforces double-booking prevention at the database level as a safety net beneath the application-level check
- **Seeding:** No admin UI is required by the spec, so doctor records will be seeded via a one-time script (`scripts/seed.js`) containing realistic demo doctor data, run manually with `node scripts/seed.js` during initial setup — not exposed to end users. Appointments and reviews are created organically through normal app usage, so no seed data is needed for those collections.

---

## 8. API Design Principles

All server routes follow REST conventions with predictable status codes and a consistent error shape:

| Status Code | Meaning | Example Case |
|---|---|---|
| `200 OK` | Successful GET/PATCH | Fetching doctors, updating a booking |
| `201 Created` | Resource created | New appointment or review saved |
| `400 Bad Request` | Validation failure | Missing required field, invalid date format |
| `401 Unauthorized` | No/invalid session or token | Accessing `/api/appointments/mine` while logged out |
| `403 Forbidden` | Authenticated but not permitted | Trying to update another user's booking |
| `404 Not Found` | Resource doesn't exist | Doctor ID or appointment ID not found |
| `409 Conflict` | Duplicate/conflicting resource | Attempting to book a doctor's date/time slot that's already taken |
| `500 Internal Server Error` | Unexpected server/DB failure | DB connection failure |

**Standard success response shape:**
```json
{ "success": true, "data": { ... }, "message": "Appointment created successfully" }
```

**Standard error response shape:**
```json
{ "success": false, "message": "Doctor not found", "error": "DOCTOR_NOT_FOUND" }
```

Every API route validates input (via Mongoose schema validation and/or manual checks) before touching the database, and wraps DB calls in try/catch to always return the standard error shape rather than leaking raw stack traces.

---

## 9. API Endpoints (Server-Side, Draft)

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/doctors` | Public | List all doctors |
| GET | `/api/doctors/:id` | Private* | Get single doctor details |
| GET | `/api/doctors/top-rated` | Public | Top 3 rated doctors for Home |
| GET | `/api/appointments` | Public | All appointments listing (search/sort via query params) |
| POST | `/api/appointments` | Private | Book a new appointment |
| GET | `/api/appointments/mine` | Private | Get current user's bookings |
| PATCH | `/api/appointments/:id` | Private (owner only) | Update own booking |
| DELETE | `/api/appointments/:id` | Private (owner only) | Delete own booking |
| GET | `/api/reviews/:doctorId` | Public | Get all reviews for a doctor (a user may appear multiple times, once per appointment reviewed) |
| POST | `/api/reviews` | Private (must have a completed booking for that doctor) | Submit a review tied to a specific `appointmentId` |
| PATCH | `/api/users/:email` | Private (self only) | Update profile (name, photo) |

*Doctor Details page itself gate-checks auth on the client (redirect to Login if unauthenticated), while the underlying data endpoint may remain public or protected depending on final auth design.

---

## 10. Deliverables & Submission Requirements

- **Client GitHub Repository** — 15+ notable commits, `README.md` with:
  - Website name
  - Live site URL
  - 5+ bullet points describing key features
- **Server GitHub Repository** — 8+ notable commits
- **Live deployed link** (Vercel recommended)

---

## 11. Status: All Open Questions Resolved

Every decision point has been confirmed: repo structure, doctor seeding, REST API conventions, design system/theme modes, UI component library (shadcn/ui), registration form (regex + confirm password, no email verification), review policy (multiple reviews per doctor across bookings), double-booking prevention, and home page section content. This PRD is ready to move into technical planning (component/folder structure, sprint breakdown).

---

*End of PRD.*
