import { DoctorsBrowser } from "@/features/doctors/DoctorsBrowser";
import { getDoctors } from "@/features/doctors/api";

export const metadata = {
  title: "Find doctors",
  description:
    "Search and filter verified doctors by name, specialty, consultation fee, and rating.",
};

/**
 * /doctors (design → docappoint_doctor_search_filters). The page fetches the
 * full list once on the server; all search/filter/sort happens client-side
 * from the URL params (DECISIONS D-002 — the backend has no query params,
 * see B-003).
 */
export default async function DoctorsPage() {
  const doctors = await getDoctors();

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-space-lg md:px-margin">
      <DoctorsBrowser doctors={doctors} />
    </div>
  );
}
