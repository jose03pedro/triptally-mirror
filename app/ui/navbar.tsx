"use client";

import { useAuth } from "@/lib/hook/useAuth";
import Link from "next/link";

export function Navbar() {
  const user = useAuth();

  return (
    <nav className="navbar fixed-top my-2 mx-4">
      <div className="container-fluid">
        <Link className="navbar-brand" href="\">
          TripTally
        </Link>

        {/*Render log in and signup buttons when user is a logged out*/}
        {!user ? (
          <div className="d-flex gap-2">
            <Link href="/login" className="btn">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Get started
            </Link>
          </div>
        ) : (
          <></>
        )}
      </div>
    </nav>
  );
}
