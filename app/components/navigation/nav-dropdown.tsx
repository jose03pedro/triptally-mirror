"use client";

import { UserNameImage } from "@/app/components/user/userNameImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutHandler } from "@/app/actions/auth/logout";
import IconText from "@/app/components/ui/icon-text";
import {useUserStore} from "@/lib/store/userStore";

type NavDropdownProps = {
  firstName: string;
  lastName: string;
};

export function NavDropdown({ firstName, lastName }: NavDropdownProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    useUserStore.getState().clearUser(); // Clear user from the state
    logoutHandler(); // Remove 'session' cookie
    router.push("/login"); // Redirect
  };

  return (
    <>
      <div className="dropdown">
        <div
          className="p-1 dropdown-toggle d-flex align-items-center justify-content-between gap-1"
          id="dropdownNavbar"
          style={{ cursor: "pointer" }}
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
          <Link className="dropdown-item" href="/trips">
            <IconText icon={"travel"} type={"outlined"} text={"My Trips"} />
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
