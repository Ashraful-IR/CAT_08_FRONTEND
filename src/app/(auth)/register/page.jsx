import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = {
  title: "Create your account",
  description: "Register to book verified doctors with clear upfront fees.",
};

export default function RegisterPage() {
  return (
    <section aria-labelledby="register-heading">
      <h1 id="register-heading" className="text-headline-lg text-on-surface">
        Create your account
      </h1>
      <p className="text-body-md text-on-surface-variant mt-1">
        Book verified doctors in minutes — no hidden charges.
      </p>

      <div className="mt-space-lg rounded-2xl bg-surface-container-lowest p-space-md shadow-level-1">
        <RegisterForm />
      </div>

      <p className="text-body-sm text-on-surface-variant mt-space-md text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-label-lg text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
