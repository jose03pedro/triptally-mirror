import React from "react";
import { Navbar } from "@/app/components/navigation/navbar";

export const metadata = {
  title: "Saved Trips",
};

export default function SavedTripsLayout({
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
          marginTop: "4rem",
        }}
        className="container position-relative"
      >
        {children}
      </main>
    </>
  );
}
