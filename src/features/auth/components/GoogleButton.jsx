"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "../api";
import { redirectToExternal } from "../redirect";
import { safeNextPath } from "../next-path";
import { getErrorMessage } from "@/lib/api/errors";

/**
 * "Continue with Google" (API_CONTRACT → Auth → social sign-in). POSTs the
 * contract body through the /api proxy, then sends the browser to the
 * returned consent URL — the OAuth round trip (Google → backend callback →
 * callbackURL) happens entirely as top-level navigations, so no SPA state
 * survives it. Endpoint failures (403 INVALID_ORIGIN from an untrusted
 * origin, 500 when the backend lacks GOOGLE_CLIENT_ID/SECRET) surface as a
 * toast. DECISIONS → B-009 tracks the session-handoff gap for the proxy
 * session model.
 *
 * The Google "G" keeps its official four-colour brand artwork — brand marks
 * are exempt from the theme tokens (same as the logo), everything else uses
 * Button's outline variant.
 *
 * @param {{ callbackPath?: string, className?: string }} props
 */
export function GoogleButton({ callbackPath = "/", className = "" }) {
  const [redirecting, setRedirecting] = useState(false);

  async function handleClick() {
    setRedirecting(true);
    try {
      const callbackURL = `${window.location.origin}${safeNextPath(callbackPath)}`;
      const { url } = await signInWithGoogle(callbackURL);
      redirectToExternal(url);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setRedirecting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={redirecting}
      className={`h-12 w-full rounded-full ${className}`}
    >
      {redirecting ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          Redirecting…
        </>
      ) : (
        <>
          <GoogleMark aria-hidden="true" />
          Continue with Google
        </>
      )}
    </Button>
  );
}

/** The official four-colour Google "G". */
function GoogleMark(props) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" {...props}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.97 11.97 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
