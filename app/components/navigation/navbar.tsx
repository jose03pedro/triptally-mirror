"use client";

import { useAuth } from "@/lib/hook/useAuth";
import Link from "next/link";
import {NavDropdown} from "@/app/components/navigation/nav-dropdown";

export function Navbar() {
  const session = useAuth();
  const user = session?.user;

  return (
    <nav className="navbar fixed-top py-3 px-4" style={{ backgroundColor: "#fff" }}>
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
              <NavDropdown firstName={user?.first_name} lastName={user?.last_name} />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
