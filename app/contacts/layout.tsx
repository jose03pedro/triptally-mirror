import React from "react";
import {Navbar} from "@/app/components/navigation/navbar";

export const metadata = {
    title: "Contacts",
};

export default function ContactsLayout({children}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main
                style={{
                    margin: "auto",
                    marginBottom: "4rem",
                }}
                className="position-relative"
            >
                {children}
            </main>
        </>
    );
}