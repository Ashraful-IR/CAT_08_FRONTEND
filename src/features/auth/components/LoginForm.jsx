"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useSignIn } from "../hooks";
import { signInSchema } from "../schemas";
import { safeNextPath } from "../next-path";
import { getErrorMessage } from "@/lib/api/errors";

/**
 * Sign-in form per API_CONTRACT → Auth. Bad credentials (401) render inline
 * above the submit button; the backend sets the httpOnly cookie on success.
 * Honours a validated `?next=` redirect target.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const signIn = useSignIn();
  const errors = form.formState.errors;

  async function onSubmit(values) {
    try {
      await signIn.mutateAsync(values);
      // mutateAsync resolves after the hook's onSuccess invalidated ['session'],
      // so the navbar renders signed-in immediately after this navigation.
      router.replace(safeNextPath(searchParams.get("next")));
    } catch {
      // 401 (and any other failure) renders inline via signIn.error below.
    }
  }

  const pending = signIn.isPending;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-space-md"
    >
      <FieldGroup>
        <Field data-invalid={errors.email ? "true" : undefined}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
            type="email"
            className="h-12"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register("email")}
            aria-invalid={Boolean(errors.email) || undefined}
            aria-describedby={errors.email ? "login-email-error" : undefined}
          />
          {errors.email && (
            <FieldError id="login-email-error">{errors.email.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={errors.password ? "true" : undefined}>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <Input
            id="login-password"
            type="password"
            className="h-12"
            autoComplete="current-password"
            placeholder="Your password"
            {...form.register("password")}
            aria-invalid={Boolean(errors.password) || undefined}
            aria-describedby={errors.password ? "login-password-error" : undefined}
          />
          {errors.password && (
            <FieldError id="login-password-error">{errors.password.message}</FieldError>
          )}
        </Field>
      </FieldGroup>

      {signIn.isError && (
        <div role="alert" className="text-body-sm text-destructive">
          {getErrorMessage(signIn.error)}
        </div>
      )}

      <Button type="submit" className="h-12 rounded-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 aria-hidden className="size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-body-sm text-on-surface-variant text-center">
        New to DocAppoint?{" "}
        <Link href="/register" className="text-label-lg text-primary font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
