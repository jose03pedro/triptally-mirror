import Link from "next/link";
import {FooterLink} from "@/app/components/footer/footerLink";
import {Logo} from "@/app/components/navigation/logo";

export function Footer() {
    return (
        <footer className="border-top fixed-bottom py-1" style={{ backgroundColor: "white" }}>
            <div className="d-flex align-items-center justify-content-center gap-5">
                <FooterLink text="About Us" href="/about-us"/>
                <FooterLink text="Contacts" href=""/>
            </div>
        </footer>
    )
}
