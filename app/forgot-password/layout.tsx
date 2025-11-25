import { Navbar } from "../components/navigation/navbar";

export const metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordLayout({
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