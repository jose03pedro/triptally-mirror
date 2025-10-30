import React from "react";
import { Navbar } from "@/app/components/navigation/navbar";

export const metadata = {
  title: "Signup",
};

export default function SignupLayout({
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
