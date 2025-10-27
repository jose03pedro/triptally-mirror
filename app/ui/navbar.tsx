"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="navbar fixed-top my-2 mx-4">
      <div className="container-fluid">
        <Link className="navbar-brand" href="\">
          TripTally
        </Link>
        <div className="d-flex gap-2">
          <Link href="\" className="btn">
            Log in
          </Link>
          <Link href="\" className="btn btn-primary">
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
