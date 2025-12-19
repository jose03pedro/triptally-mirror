"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loading } from "@/app/components/ui/loading";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ tripId: string; message: string } | null>(null);

  useEffect(() => {
    // Automatically try to accept the invite when page loads
    if (!token) return;

    const acceptInvite = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/invites/${token}/accept`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            // User needs to log in first
            setError("Please log in to accept this invite");
          } else {
            setError(data.error || "Failed to accept invite");
          }
          setLoading(false);
          return;
        }

        setSuccess({
          tripId: data.tripId,
          message: data.message || "Invite accepted successfully!",
        });
      } catch (err) {
        console.error("Error accepting invite:", err);
        setError("Failed to accept invite");
      } finally {
        setLoading(false);
      }
    };

    acceptInvite();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-8 text-center">
            <Loading />
            <p className="text-slate-600 mt-4">Accepting invite...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Unable to Accept Invite</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            {error.includes("log in") ? (
              <Link
                href={`/login?redirect=/invites/${token}`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log In
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Welcome to the Trip!</h1>
            <p className="text-slate-600 mb-6">{success.message}</p>
            <Link
              href={`/trips/${success.tripId}`}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Trip
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

