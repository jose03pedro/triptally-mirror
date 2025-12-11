import Link from "next/link";
import {JSX} from "react";

interface LogoProps {
    size?: number;
}

export function Logo({ size = 36}: LogoProps) {
    return (
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="rounded-circle bg-primary p-1"
                style={{ color: "white" }}
            >
                <path d="M2 12L22 3L14 22L11 13L2 12Z" fill="white" />
            </svg>
            <span className="fw-semibold text-dark" style={{ fontSize: `${size / 1.8}px`}}>TripTally</span>
        </Link>
    )
}