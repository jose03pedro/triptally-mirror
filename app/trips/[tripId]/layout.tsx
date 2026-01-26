import React from "react";
import { Navbar } from "@/app/components/navigation/navbar";

export const metadata = {
    title: "TripTally: Trip",
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
                    margin: "auto",
                }}
                className="container position-relative"
            >
                {children}
            </main>
        </>
    );
}
