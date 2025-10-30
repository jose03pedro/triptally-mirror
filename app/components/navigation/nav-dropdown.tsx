"use client";

import {UserImage} from "@/app/components/user/user-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {logoutHandler} from "@/app/actions/logout";

type NavDropdownProps = {
    firstName: string;
    lastName: string;
}

export function NavDropdown({firstName, lastName}: NavDropdownProps) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token"); // Remove token
        logoutHandler(); // Remove 'session' cookie
        router.push("/login"); // Redirect
    };

    return (
        <>
            <div className="dropdown">
                <div
                    className="p-1 dropdown-toggle d-flex align-items-center justify-content-between gap-1"
                    id="dropdownNavbar"
                    style={{ cursor: "pointer"}}
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    <UserImage firstName={firstName} lastName={lastName} />
                </div>
                <div className="dropdown-menu w-100" aria-labelledby="dropdownNavbar">
                    <Link className="dropdown-item d-flex gap-2" href="/profile">
                        <span className="material-icons md-dark">person</span>
                        <span>Profile</span>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item d-flex gap-2" onClick={handleLogout}>
                        <span className="material-icons md-dark">logout</span>
                        <span>Log out</span>
                    </button>
                </div>
            </div>

        </>
    );
}