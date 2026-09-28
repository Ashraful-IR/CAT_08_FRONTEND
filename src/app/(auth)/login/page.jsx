import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Sign in",
  description: "Sign in to manage your appointments and bookings.",
};

export default function LoginPage() {
  return (
    <section aria-labelledby="login-heading">
      <h1 id="login-heading" className="text-headline-lg text-on-surface">
        Welcome back
      </h1>
      <p className="text-body-md text-on-surface-variant mt-1">
        Sign in to book and manage your appointments.
      </p>

      <div className="mt-space-lg rounded-2xl bg-surface-container-lowest p-space-md shadow-level-1">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="text-body-sm text-on-surface-variant mt-space-md text-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-label-lg text-primary font-semibold hover:underline">
          Register
        </Link>
      </p>
    </section>
  );
}
