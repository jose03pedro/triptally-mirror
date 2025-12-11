import Link from "next/link";
import {FooterLink} from "@/app/components/footer/footerLink";
import {Logo} from "@/app/components/navigation/logo";
import {FooterSeparator} from "@/app/components/footer/footerSeparator";

export function Footer() {
    return (
        <footer className="my-4" style={{ backgroundColor: "white" }}>
            <div className="d-flex align-items-center justify-content-center gap-2">
                <FooterLink text="About Us" href="/about-us"/>
                <FooterSeparator />
                <FooterLink text="Contacts" href="/contacts"/>
                <FooterSeparator />
                <p style={{ fontSize: "0.7rem", color: "#6c757d"}} className="m-0">&#10686;	2026 TRIPTALLY</p>
            </div>
        </footer>
    )
}
