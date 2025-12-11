import Link from "next/link";
import {FooterLink} from "@/app/components/footer/footerLink";
import {Logo} from "@/app/components/navigation/logo";

export function Footer() {
    return (
        <footer className="my-4" style={{ backgroundColor: "white" }}>
            <div className="d-flex align-items-center justify-content-center gap-2">
                <FooterLink text="About Us" href="/about-us"/>
                <span style={{ fontSize: "0.2rem", color: "#6c757d"}}>&#9679;</span>
                <p style={{ fontSize: "0.7rem", color: "#6c757d"}} className="m-0">&#10686;	2026 TRIPTALLY</p>
            </div>
        </footer>
    )
}
