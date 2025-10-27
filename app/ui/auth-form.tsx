"use client";

import { useActionState } from "react";
import { signup } from "../actions/signup";

type AuthFormProps = {
  submitType: string;
};

export default function AuthForm({ submitType }: AuthFormProps) {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action}>
      <header>
        <h2 className="h5 mb-1">Your smart travel planner.</h2>
        <h3 className="h5 text-secondary">
          {submitType} your TripTally account
        </h3>
      </header>

      {/* Email Field */}
      <div className="my-3">
        <div className="mb-2">
          <label htmlFor="email" className="form-label text-secondary fs-7">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address..."
            className={`form-control fs-6 ${
              state?.errors?.email ? "is-invalid" : ""
            }`}
          />
          {state?.errors?.email &&
            state.errors.email.map((err, i) => (
              <div key={i} className="invalid-feedback">
                {err}
              </div>
            ))}
        </div>

        {/* Password Field */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label text-secondary fs-7">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password..."
            className={`form-control fs-6 ${
              state?.errors?.password ? "is-invalid" : ""
            }`}
          />

          {state?.errors?.password && (
            <div className="invalid-feedback">
              <p>Password must:</p>
              <ul className="mb-0">
                {state.errors.password.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-100">
        Continue
      </button>
    </form>
  );
}
