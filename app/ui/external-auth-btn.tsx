"use client";
import { useEffect } from "react";

export function ExternalAuthBtn({ provider }: { provider: string }) {
  const handleGoogleLogin = () => {
    if (typeof window === "undefined" || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response: any) => {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential }),
        });
        const data = await res.json();
      },
    });

    window.google.accounts.id.prompt(); // show popup
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="btn btn-outline-secondary w-100 position-relative"
    >
      <img
        src={`/icons/${provider.toLowerCase()}.png`}
        alt={`${provider} logo`}
        width={18}
        className="position-absolute start-3 top-50 translate-middle-y"
      />
      <span className="d-block text-center w-100">
        Continue with {provider}
      </span>
    </button>
  );
}
