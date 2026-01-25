import React from "react";
import { Navbar } from "@/app/components/navigation/navbar";

export const metadata = {
  title: "TripTally: User Profile",
};

export default function ProfileLayout({
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
          margin: "auto"
      }}
        className="container position-relative"
      >
        {children}
      </main>
    </>
  );
}
