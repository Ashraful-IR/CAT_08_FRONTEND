import { ProfileForm } from "@/features/profile/ProfileForm";

/**
 * Profile (roadmap 5.1). Protected route (middleware): a client island holds
 * the form because it reads the session and mutates via the browser proxy.
 * Design has no profile screen — derived from tokens and existing form
 * styles (DECISIONS D-007).
 */

export async function generateMetadata() {
  return {
    title: "Your Profile — DocAppoint",
    description: "Update your name and profile photo.",
  };
}

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-margin-mobile py-space-lg md:px-margin">
      <header>
        <h1 className="text-headline-lg text-on-surface">Your profile</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Keep your name and photo up to date — doctors see them on your
          bookings.
        </p>
      </header>

      <div className="mt-space-lg rounded-2xl bg-surface-container-lowest p-space-md shadow-level-1 sm:p-space-lg">
        <ProfileForm />
      </div>
    </div>
  );
}
