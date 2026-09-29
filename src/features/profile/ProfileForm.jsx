"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Avatar } from "@/components/common/Avatar";
import { useSession } from "@/features/auth/hooks";
import { getErrorMessage } from "@/lib/api/errors";
import { useUpdateProfile } from "./hooks";
import { profileSchema } from "./schemas";

/**
 * /profile form (roadmap 5.1; API_CONTRACT → Users): name + photoURL,
 * prefilled from the session and patched by URL-encoded email. Success
 * writes the session cache (navbar re-renders instantly); documented
 * failures render inline. The email itself is not editable (no endpoint for
 * it, API_CONTRACT → Users).
 */
export function ProfileForm() {
  const { user } = useSession();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: { name: "", photoURL: "" },
  });

  // Prefill once the session arrives (values may load after first render).
  useEffect(() => {
    if (user) {
      form.reset({ name: user.name, photoURL: user.photoURL });
    }
  }, [user, form]);

  const updateProfile = useUpdateProfile();
  const errors = form.formState.errors;

  async function onSubmit(values) {
    try {
      await updateProfile.mutateAsync({ email: user.email, ...values });
    } catch {
      // Documented 400/403 render inline below.
    }
  }

  if (!user) {
    // Middleware guards the route; this covers a briefly-expired session.
    return (
      <p role="status" className="text-body-md text-on-surface-variant">
        Loading your profile…
      </p>
    );
  }

  const pending = updateProfile.isPending;
  const fieldAria = (name) => ({
    "aria-invalid": Boolean(errors[name]) || undefined,
    "aria-describedby": errors[name] ? `profile-${name}-error` : undefined,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="flex items-center gap-space-md">
        <Avatar
          name={form.watch("name") || user.name}
          src={form.watch("photoURL") || user.photoURL}
          className="size-16"
          textClassName="text-headline-sm"
        />
        <div>
          <p className="text-headline-sm text-on-surface">{user.name}</p>
          <p className="text-body-sm text-on-surface-variant">{user.email}</p>
        </div>
      </div>

      <FieldGroup className="mt-space-lg">
        <Field data-invalid={errors.name ? true : undefined}>
          <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
          <Input
            id="profile-name"
            className="h-12"
            autoComplete="name"
            {...form.register("name")}
            {...fieldAria("name")}
          />
          {errors.name && (
            <FieldError id="profile-name-error">{errors.name.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={errors.photoURL ? true : undefined}>
          <FieldLabel htmlFor="profile-photoURL">Photo URL</FieldLabel>
          <Input
            id="profile-photoURL"
            type="url"
            className="h-12"
            autoComplete="url"
            placeholder="https://i.ibb.co/your-photo.jpg"
            {...form.register("photoURL")}
            {...fieldAria("photoURL")}
          />
          {errors.photoURL && (
            <FieldError id="profile-photoURL-error">
              {errors.photoURL.message}
            </FieldError>
          )}
        </Field>
      </FieldGroup>

      {updateProfile.isError && (
        <p role="alert" className="mt-space-md text-body-sm text-error">
          {getErrorMessage(updateProfile.error)}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="mt-space-lg h-12 rounded-full"
      >
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </form>
  );
}
