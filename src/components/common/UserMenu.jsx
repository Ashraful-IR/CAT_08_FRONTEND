"use client";

import Link from "next/link";
import { LogOut, User, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/features/auth/hooks";
import { getErrorMessage } from "@/lib/api/errors";

/**
 * Signed-in navbar area (roadmap 1.4): avatar + name trigger opening a menu
 * with Profile, Appointments, and Sign out. Focus management and Escape
 * handling come from the Radix-based dropdown primitive.
 */
export function UserMenu({ user }) {
  const signOut = useSignOut();

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    try {
      await signOut.mutateAsync();
      toast.success("Signed out");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${user.name}`}
        className="flex items-center gap-3 pl-2 min-w-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-label-md font-semibold"
        >
          {initials}
        </span>
        <span className="hidden sm:flex flex-col text-left min-w-0">
          <span className="text-label-lg text-on-surface leading-tight truncate">
            {user.name}
          </span>
          <span className="text-label-sm text-on-surface-variant leading-tight">Patient</span>
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate">{user.name}</span>
          <span className="text-label-sm text-on-surface-variant truncate font-normal">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User aria-hidden className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/appointments">
            <CalendarDays aria-hidden className="size-4" />
            My appointments
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={signOut.isPending}
          onSelect={(event) => {
            event.preventDefault();
            handleSignOut();
          }}
        >
          <LogOut aria-hidden className="size-4" />
          {signOut.isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
