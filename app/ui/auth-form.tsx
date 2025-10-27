"use client";

import { useActionState, useState } from "react";
import { signup } from "../actions/signup";

type AuthFormProps = {
  mode: "login" | "signup";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const actionFn = signup;
  const [state, action, pending] = useActionState(actionFn, undefined);

  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form action={action}>
      <header>
        <h2 className="h5 mb-1">Your smart travel planner.</h2>
        <h3 className="h5 text-secondary">
          {mode === "login" ? "Login" : "Create"} your TripTally account
        </h3>
      </header>

      {/* Email Field */}
      <div className="my-3">
        <div className="mb-2">
          <label
            htmlFor="email"
            className="form-label text-secondary mb-0 fs-7"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address..."
            value={formValues.email}
            onChange={handleChange}
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
          <label
            htmlFor="password"
            className="form-label text-secondary mb-0 fs-7"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password..."
            value={formValues.password}
            onChange={handleChange}
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

        {/* Extra fields for signup */}
        {mode === "signup" && (
          <div>
            {/* First Name Field */}
            <div className="mb-2">
              <label
                htmlFor="first_name"
                className="form-label text-secondary mb-0 fs-7"
              >
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                placeholder="Enter your first name..."
                value={formValues.first_name}
                onChange={handleChange}
                className={`form-control fs-6 ${
                  state?.errors?.first_name ? "is-invalid" : ""
                }`}
              />
              {state?.errors?.first_name &&
                state.errors.first_name.map((err, i) => (
                  <div key={i} className="invalid-feedback">
                    {err}
                  </div>
                ))}
            </div>

            {/* Last Name Field */}
            <div className="mb-2">
              <label
                htmlFor="last_name"
                className="form-label text-secondary mb-0 fs-7"
              >
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Enter your last name..."
                value={formValues.last_name}
                onChange={handleChange}
                className={`form-control fs-6 ${
                  state?.errors?.last_name ? "is-invalid" : ""
                }`}
              />
              {state?.errors?.last_name &&
                state.errors.last_name.map((err, i) => (
                  <div key={i} className="invalid-feedback">
                    {err}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary w-100">
        Continue
      </button>
    </form>
  );
}
