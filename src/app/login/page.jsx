"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { isValidEmail, isValidPassword } from "@/lib/apiHelpers";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [changePasswordForm, setChangePasswordForm] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
  });
  const [show, setShow] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [error, setError] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [changePasswordValidationErrors, setChangePasswordValidationErrors] =
    useState({});
  const [showChangePassword, setShowChangePassword] = useState(false);

  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const h = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setValidationErrors({});
  };

  const handleChangePasswordForm = (e) => {
    setChangePasswordForm({
      ...changePasswordForm,
      [e.target.name]: e.target.value,
    });
    setChangePasswordError("");
    setChangePasswordSuccess("");
    setChangePasswordValidationErrors({});
  };

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!form.email) {
      errors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      errors.email = "Invalid email format";
    }

    // Password validation
    if (!form.password) {
      errors.password = "Password is required";
    } else if (!isValidPassword(form.password)) {
      errors.password = "Password must be at least 8 characters";
    }

    return errors;
  };

  const validateChangePasswordForm = () => {
    const errors = {};

    // Email validation
    if (!changePasswordForm.email) {
      errors.email = "Email is required";
    } else if (!isValidEmail(changePasswordForm.email)) {
      errors.email = "Invalid email format";
    }

    // Old password validation
    if (!changePasswordForm.oldPassword) {
      errors.oldPassword = "Old password is required";
    }

    // New password validation
    if (!changePasswordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (!isValidPassword(changePasswordForm.newPassword)) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    // Check if passwords are the same
    if (
      changePasswordForm.oldPassword &&
      changePasswordForm.newPassword &&
      changePasswordForm.oldPassword === changePasswordForm.newPassword
    ) {
      errors.newPassword = "New password must be different from old password";
    }

    return errors;
  };

  const s = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setValidationErrors({});

    // Client-side validation
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    const result = await login(form.email, form.password);

    if (result.success) {
      router.replace("/");
    } else {
      setError(result.error || "Login failed");
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setChangePasswordError("");
    setChangePasswordSuccess("");
    setChangePasswordValidationErrors({});

    // Client-side validation
    const errors = validateChangePasswordForm();
    if (Object.keys(errors).length > 0) {
      setChangePasswordValidationErrors(errors);
      setIsChangingPassword(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: changePasswordForm.email,
          oldPassword: changePasswordForm.oldPassword,
          newPassword: changePasswordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setChangePasswordSuccess("Password changed successfully!");
        setChangePasswordForm({
          email: "",
          oldPassword: "",
          newPassword: "",
        });
        setTimeout(() => {
          setShowChangePassword(false);
          setChangePasswordSuccess("");
        }, 2000);
      } else {
        setChangePasswordError(
          data.error || "Failed to change password. Please try again."
        );
      }
    } catch (error) {
      setChangePasswordError("An error occurred. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const inputStyle =
    "w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400";
  const labelStyle =
    "block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white overflow-hidden">
      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-10 space-y-8 border border-gray-100">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {showChangePassword ? "Change Password" : "Welcome Back"}
            </h1>
            <p className="text-gray-500 font-medium">
              {showChangePassword
                ? "Enter your credentials to change your password"
                : "Please enter your details to sign in"}
            </p>
            <button
              type="button"
              onClick={() => {
                setShowChangePassword(!showChangePassword);
                setError("");
                setChangePasswordError("");
                setChangePasswordSuccess("");
                setValidationErrors({});
                setChangePasswordValidationErrors({});
              }}
              className="text-sm text-indigo-600 hover:underline font-semibold pt-2"
            >
              {showChangePassword ? "← Back to Sign In" : "Change Password?"}
            </button>
          </div>

          {!showChangePassword ? (
            /* Login Form */
            <form onSubmit={s} className="space-y-6">
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="">
                  <label className={labelStyle}>Email Address</label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="krishna@example.com"
                      value={form.email}
                      onChange={h}
                      className={`${inputStyle} ${validationErrors.email ? "border-red-300 focus:ring-red-500" : ""}`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div className="">
                  <label className={labelStyle}>Password</label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type={show ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={h}
                      className={`${inputStyle} pr-12 ${validationErrors.password ? "border-red-300 focus:ring-red-500" : ""}`}
                      disabled={isSubmitting}
                    />

                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                      disabled={isSubmitting}
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {validationErrors.password}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="cursor-pointer w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>

              <p className="text-center text-sm text-gray-600">
                New here?{" "}
                <Link
                  href="/register"
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Create account
                </Link>
              </p>
            </form>
          ) : (
            /* Change Password Form */
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-4">
                {changePasswordSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                    {changePasswordSuccess}
                  </div>
                )}

                {changePasswordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {changePasswordError}
                  </div>
                )}

                <div>
                  <label className={labelStyle}>Email Address</label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="krishna@example.com"
                      value={changePasswordForm.email}
                      onChange={handleChangePasswordForm}
                      className={`${inputStyle} ${changePasswordValidationErrors.email ? "border-red-300 focus:ring-red-500" : ""}`}
                      disabled={isChangingPassword}
                    />
                  </div>
                  {changePasswordValidationErrors.email && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {changePasswordValidationErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Old Password</label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type={showOldPass ? "text" : "password"}
                      name="oldPassword"
                      placeholder="••••••••"
                      value={changePasswordForm.oldPassword}
                      onChange={handleChangePasswordForm}
                      className={`${inputStyle} pr-12 ${changePasswordValidationErrors.oldPassword ? "border-red-300 focus:ring-red-500" : ""}`}
                      disabled={isChangingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                      disabled={isChangingPassword}
                    >
                      {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {changePasswordValidationErrors.oldPassword && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {changePasswordValidationErrors.oldPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>New Password</label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type={showNewPass ? "text" : "password"}
                      name="newPassword"
                      placeholder="••••••••"
                      value={changePasswordForm.newPassword}
                      onChange={handleChangePasswordForm}
                      className={`${inputStyle} pr-12 ${changePasswordValidationErrors.newPassword ? "border-red-300 focus:ring-red-500" : ""}`}
                      disabled={isChangingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                      disabled={isChangingPassword}
                    >
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {changePasswordValidationErrors.newPassword && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {changePasswordValidationErrors.newPassword}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="cursor-pointer w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
