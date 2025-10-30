import React from "react";
import { Navbar } from "../ui/navbar";

export const metadata = {
  title: "Profile",
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
