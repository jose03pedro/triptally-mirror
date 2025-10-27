import AuthForm from "./auth-form";
import { ExternalAuthBtn } from "./external-auth-btn";

type AuthProps = {
  mode: "login" | "signup";
};

export default function Auth({ mode }: AuthProps) {
  return (
    <div style={{ maxWidth: "380px" }} className="w-100">
      <header>
        <h2 className="h5 mb-1">Your smart travel planner.</h2>
        <h3 className="h5 text-secondary">
          {mode === "login" ? "Login" : "Create"} your TripTally account
        </h3>
      </header>
      <div className="w-100">
        <section className="my-6 d-flex flex-column gap-2">
          <ExternalAuthBtn provider={"Google"} />
        </section>
        <div className="border-bottom"></div>
        <AuthForm mode={mode} />
      </div>
    </div>
  );
}
