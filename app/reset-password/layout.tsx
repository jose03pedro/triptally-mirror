import { Navbar } from "../components/navigation/navbar";

export const metadata = {
  title: "Reset Password",
};

export default function ResetPasswordLayout({
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