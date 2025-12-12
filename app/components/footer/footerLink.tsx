import Link from "next/link";

interface FooterLinkProps {
    text: string;
    href: string;
}

export function FooterLink({ text, href }: FooterLinkProps) {
    return (
        <Link href={href} style={{ textDecoration: "none" }} className="d-flex align-items-center">
            <span style={{ fontSize: "0.7rem", color: "#6c757d"}}>{text}</span>
        </Link>
    )
}