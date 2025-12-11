import React from "react";
import { Navbar } from "@/app/components/navigation/navbar";

export const metadata = {
    title: "About Us",
};

export default function AboutUsLayout({
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
                    marginTop: "5rem",
                    marginBottom: "4rem",
                }}
                className="container position-relative"
            >
                {children}
            </main>
        </>
    );
}