"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/app/actions/auth/resetPassword";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ password?: string[]; token?: string[] }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setErrors({ token: ["Invalid reset link"] });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    const formData = new FormData();
    formData.append("token", token);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    const result = await resetPassword(formData);

    setLoading(false);

    if (result.success) {
      setMessage(result.message);
      setTimeout(() => router.push("/login"), 3000);
    } else {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        setErrors({ password: [result.message] });
      }
    }
  };

  return (
      <div style={{ maxWidth: "380px" }} className="w-100">
        <div className="text-center mb-4">
          <h1 className="h3 mb-2">Reset Password</h1>
          <p className="text-muted small">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <input
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || !!errors.token}
              placeholder="Enter new password"
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.join(", ")}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || !!errors.token}
              placeholder="Confirm new password"
            />
          </div>

          {message && (
            <div className="alert alert-success small" role="alert">
              {message}
            </div>
          )}

          {errors.token && (
            <div className="alert alert-danger small" role="alert">
              {errors.token.join(", ")}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading || !!errors.token}
          >
            {loading ? "Resetting..." : "Reset Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}