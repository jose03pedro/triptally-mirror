import AuthForm from "./auth-form";
import { ExternalAuthBtn } from "./external-auth-btn";

type AuthProps = {
  mode: "login" | "signup";
};

export default function Auth({ mode }: AuthProps) {
  return (
    <>
      <header>
        <h2 className="h5 mb-1">Your smart travel planner.</h2>
        <h3 className="h5 text-secondary">
          {mode === "login" ? "Login" : "Create"} your TripTally account
        </h3>
      </header>
      <section className="my-6 d-flex flex-column gap-2">
        <ExternalAuthBtn provider={"Google"} />
      </section>
      <AuthForm mode={mode} />
    </>
  );
}
