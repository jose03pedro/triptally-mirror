import React from "react";
import { Navbar } from "@/app/components/navigation/navbar";

export const metadata = {
    title: "Trip",
};

export default function TripLayout({
   children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main
                style={{
                    maxWidth: "1400px",
                    margin: "auto",
                    marginTop: "7rem",
                }}
                className="container position-relative"
            >
                {children}
            </main>
        </>
    );
}
