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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "7rem",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {children}
      </main>
    </>
  );
}
