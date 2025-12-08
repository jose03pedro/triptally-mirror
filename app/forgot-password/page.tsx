"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/app/actions/auth/forgotPassword";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("email", email);

    const result = await forgotPassword(formData);

    setLoading(false);

    if (result.success) {
      setMessage(result.message);
      setEmail("");
    } else {
      setError(result.message);
    }
  };

  return (
      <div style={{ maxWidth: "380px" }} className="w-100">
        <div className="text-center mb-4">
          <h1 className="h3 mb-2">Forgot Password</h1>
          <p className="text-muted small">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          {message && (
            <div className="alert alert-success small" role="alert">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger small" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-decoration-none">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
  );
}