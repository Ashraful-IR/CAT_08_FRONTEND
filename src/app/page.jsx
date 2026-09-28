import { HeroSection } from "@/features/doctors/HeroSection";
import { TopRatedSection } from "@/features/doctors/TopRatedSection";
import { getDoctors, getTopRated } from "@/features/doctors/api";
import { specialtiesOf } from "@/features/doctors/filters";

/**
 * Home (design → docappoint_home_doctor_discovery). Server Component: both
 * sections' data is fetched on the server; the hero only ships its client
 * search card. Public data — no auth involved (DECISIONS D-010).
 */
export default async function HomePage() {
  const [doctors, topRated] = await Promise.all([
    getDoctors(),
    getTopRated(),
  ]);

  return (
    <>
      <HeroSection specialties={specialtiesOf(doctors)} />
      <TopRatedSection doctors={topRated} />
    </>
  );
}
