import React from "react";

export const metadata = {
  title: "Signup",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <main>{children}</main>
    </div>
  );
}
