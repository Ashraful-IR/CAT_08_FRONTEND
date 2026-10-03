"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useSignUp } from "../hooks";
import { GoogleButton } from "./GoogleButton";
import { registerSchema } from "../schemas";
import { getErrorMessage } from "@/lib/api/errors";

/**
 * Registration form per API_CONTRACT → Auth (Better Auth). Photo URL is
 * optional (mapped to the wire `image`); confirm-password is a client-side
 * check stripped before sending; a 200 also signs the user in (useSignUp
 * navigates straight to the `?next=` target). Inputs are 48px high per the
 * design system; errors are announced via role="alert" (FieldError) and
 * linked to inputs through aria-describedby/aria-invalid.
 */
export function RegisterForm() {
  const searchParams = useSearchParams();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      photoURL: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signUp = useSignUp();
  const errors = form.formState.errors;

  const fieldErrorId = (name) => `register-${name}-error`;

  const inputAria = (name) => ({
    "aria-invalid": Boolean(errors[name]) || undefined,
    "aria-describedby": errors[name] ? fieldErrorId(name) : undefined,
  });

  async function onSubmit(values) {
    try {
      await signUp.mutateAsync(values);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const pending = signUp.isPending;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-space-md"
    >
      <FieldGroup>
        <Field data-invalid={errors.name ? "true" : undefined}>
          <FieldLabel htmlFor="register-name">Full name</FieldLabel>
          <Input
            id="register-name"
            className="h-12"
            autoComplete="name"
            placeholder="Your full name"
            {...form.register("name")}
            {...inputAria("name")}
          />
          {errors.name && (
            <FieldError id={fieldErrorId("name")}>{errors.name.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={errors.email ? "true" : undefined}>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <Input
            id="register-email"
            type="email"
            className="h-12"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register("email")}
            {...inputAria("email")}
          />
          {errors.email && (
            <FieldError id={fieldErrorId("email")}>{errors.email.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={errors.photoURL ? "true" : undefined}>
          <FieldLabel htmlFor="register-photoURL">Photo URL (optional)</FieldLabel>
          <Input
            id="register-photoURL"
            type="url"
            className="h-12"
            autoComplete="url"
            placeholder="https://example.com/your-photo.jpg"
            {...form.register("photoURL")}
            {...inputAria("photoURL")}
          />
          <FieldError id={fieldErrorId("photoURL")}>
            {errors.photoURL?.message}
          </FieldError>
        </Field>

        <Field data-invalid={errors.password ? "true" : undefined}>
          <FieldLabel htmlFor="register-password">Password</FieldLabel>
          <Input
            id="register-password"
            type="password"
            className="h-12"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            {...form.register("password")}
            {...inputAria("password")}
          />
          {errors.password && (
            <FieldError id={fieldErrorId("password")}>{errors.password.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={errors.confirmPassword ? "true" : undefined}>
          <FieldLabel htmlFor="register-confirmPassword">Confirm password</FieldLabel>
          <Input
            id="register-confirmPassword"
            type="password"
            className="h-12"
            autoComplete="new-password"
            placeholder="Repeat your password"
            {...form.register("confirmPassword")}
            {...inputAria("confirmPassword")}
          />
          {errors.confirmPassword && (
            <FieldError id={fieldErrorId("confirmPassword")}>
              {errors.confirmPassword.message}
            </FieldError>
          )}
        </Field>
      </FieldGroup>

      <Button type="submit" className="h-12 rounded-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 aria-hidden className="size-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-outline-variant" />
        <span className="text-label-md text-on-surface-variant">or continue with</span>
        <span aria-hidden="true" className="h-px flex-1 bg-outline-variant" />
      </div>

      <GoogleButton callbackPath={searchParams.get("next") ?? "/"} />
    </form>
  );
}
