"use client";

import {UserNameImage} from "@/app/components/user/user-name-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {logoutHandler} from "@/app/actions/logout";
import IconText from "@/app/components/ui/icon-text";

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
                    <UserNameImage firstName={firstName} lastName={lastName} />
                </div>
                <div className="dropdown-menu w-100" aria-labelledby="dropdownNavbar">
                    <Link className="dropdown-item" href="/profile">
                        <IconText icon={"person"} text={"Profile"} />
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleLogout}>
                        <IconText icon={"logout"} text={"Log out"} />
                    </button>
                </div>
            </div>

        </>
    );
}