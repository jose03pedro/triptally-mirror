"use client";

import { useAuth } from "@/lib/hook/useAuth";
import Link from "next/link";
import { NavDropdown } from "@/app/components/navigation/nav-dropdown";
import Tooltip from "@mui/material/Tooltip";

export function Navbar() {
  const session = useAuth();
  const user = session?.user;

  return (
    <nav className="navbar navbar-expand-sm navbar-light bg-white border-bottom fixed-top">
      <div className="container-fluid px-4">
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="rounded-circle bg-primary p-1"
            style={{ color: "white" }}
          >
            <path d="M2 12L22 3L14 22L11 13L2 12Z" fill="white" />
          </svg>
          <span className="fw-semibold text-dark">TripTally</span>
        </Link>

        <div className="d-flex align-items-center">
          {/* Saved trips navigation */}
          <Link
            href="/profile/saved-trips"
            className="d-inline-block me-3 nav-link"
          >
            <Tooltip
              title="Your saved trips"
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -10],
                      },
                    },
                  ],
                },
              }}
            >
              <button
                type="button"
                className="btn btn-outline-secondary  p-1 d-flex align-items-center justify-content-center"
              >
                <span className="material-symbols-outlined">bookmark</span>
              </button>
            </Tooltip>
          </Link>

          {/* Mobile CTA visible only on small screens */}
          <Link href="/trips" className="btn btn-primary d-sm-none me-2">
            My Trips
          </Link>

          {session === undefined ? (
            <div className="d-flex align-items-center gap-2">
              <span
                className="placeholder col-4 me-2"
                style={{ height: 28, display: "inline-block" }}
              />
              <span
                className="placeholder col-6 d-none d-md-inline-block"
                style={{ height: 36, display: "inline-block" }}
              />
            </div>
          ) : !user ? (
            <>
              <Link href="/login" className="btn btn-link me-2">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Get started
              </Link>
            </>
          ) : (
            <NavDropdown
              firstName={user.first_name}
              lastName={user.last_name}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
