"use client";

import { useAuth } from "@/lib/hook/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const user = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    router.push("/login"); // Redirect
  };

  return (
    <nav className="navbar fixed-top my-2 mx-4">
      <div className="container-fluid">
        <Link className="navbar-brand" href="\">
          TripTally
        </Link>

        <div className="d-flex gap-2">
          {!user ? (
            <>
              <Link href="/login" className="btn">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Get started
              </Link>
            </>
          ) : (
            <>
              <button onClick={handleLogout} className="btn btn-primary">
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
