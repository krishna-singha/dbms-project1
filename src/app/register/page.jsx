"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  GraduationCap,
  ChevronRight,
  ArrowLeft,
  Mail,
  Lock,
  UserCircle,
  EyeOff,
  Eye,
} from "lucide-react";
import { isValidEmail, isValidPassword } from "@/lib/apiHelpers";

const BASE_FORM = {
  name: "",
  email: "",
  password: "",
};

const STUDENT_FORM = {
  age: "",
  country: "",
  skill_level: "",
  category: "",
};

const INSTRUCTOR_FORM = {
  experience: "",
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [show, setShow] = useState(false);

  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const [form, setForm] = useState({
    ...BASE_FORM,
    ...STUDENT_FORM,
  });

  const h = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setValidationErrors({});
  };

  const switchRole = (nextRole) => {
    setRole(nextRole);

    setForm((prev) => ({
      ...BASE_FORM,
      name: prev.name,
      email: prev.email,
      password: prev.password,
      ...(nextRole === "STUDENT" ? STUDENT_FORM : INSTRUCTOR_FORM),
    }));
  };

  const validateStep1 = () => {
    const errors = {};

    if (!form.name || form.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!form.email) {
      errors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      errors.email = "Invalid email format";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (!isValidPassword(form.password)) {
      errors.password = "Password must be at least 8 characters and include uppercase, lowercase, and a number";
    }

    return errors;
  };

  const validateStep2 = () => {
    const errors = {};

    if (role === "STUDENT") {
      if (form.age && (Number(form.age) < 1 || Number(form.age) > 120)) {
        errors.age = "Age must be between 1 and 120";
      }
    } else if (role === "INSTRUCTOR") {
      if (
        form.experience &&
        (Number(form.experience) < 0 || Number(form.experience) > 50)
      ) {
        errors.experience = "Experience must be between 0 and 50 years";
      }
    }

    return errors;
  };

  const s = async (e) => {
    e.preventDefault();

    if (step === 1) {
      setError("");
      setValidationErrors({});

      // Validate step 1
      const errors = validateStep1();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setValidationErrors({});

    // Validate step 2
    const errors = validateStep2();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...form,
      role,
      age: form.age ? parseInt(form.age) : null,
      experience: form.experience ? parseInt(form.experience) : null,
    };

    const result = await register(payload);

    if (result.success) {
      router.replace("/");
    } else {
      setError(result.error || "Registration failed");
      setIsSubmitting(false);
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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-125">
        {/* Progress Header */}
        <div className="flex items-center justify-center mb-10 gap-3">
          <div
            className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 1 ? "bg-indigo-600 w-20" : "bg-gray-100"}`}
          />
          <div
            className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 2 ? "bg-indigo-600 w-20" : "bg-gray-100"}`}
          />
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {step === 1 ? "Join BongoDB" : "Almost there!"}
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              {step === 1
                ? "Start your learning journey today."
                : "Tell us a bit more about yourself."}
            </p>
          </div>

          <form onSubmit={s} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => switchRole("STUDENT")}
                    disabled={isSubmitting}
                    className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
                      role === "STUDENT"
                        ? "bg-white shadow-sm text-indigo-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <User size={18} /> Student
                  </button>

                  <button
                    type="button"
                    onClick={() => switchRole("INSTRUCTOR")}
                    disabled={isSubmitting}
                    className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
                      role === "INSTRUCTOR"
                        ? "bg-white shadow-sm text-indigo-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <GraduationCap size={18} /> Instructor
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelStyle}>Full Name</label>
                    <div className="relative">
                      <UserCircle
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        name="name"
                        placeholder="Krishna Singha"
                        value={form.name}
                        onChange={h}
                        className={`${inputStyle} ${validationErrors.name ? "border-red-300 focus:ring-red-500" : ""}`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {validationErrors.name && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

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

                  <div>
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
              </>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                {role === "STUDENT" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelStyle}>Age</label>
                        <input
                          name="age"
                          type="number"
                          placeholder="22"
                          value={form.age || ""}
                          onChange={h}
                          className={`${inputStyle.replace("pl-11", "pl-4")} ${validationErrors.age ? "border-red-300 focus:ring-red-500" : ""}`}
                          disabled={isSubmitting}
                        />
                        {validationErrors.age && (
                          <p className="text-xs text-red-500 mt-1 ml-1">
                            {validationErrors.age}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelStyle}>Country</label>
                        <input
                          name="country"
                          placeholder="India"
                          value={form.country || ""}
                          onChange={h}
                          className={inputStyle.replace("pl-11", "pl-4")}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}>Skill Level</label>
                      <select
                        name="skill_level"
                        value={form.skill_level || ""}
                        onChange={h}
                        className={`${inputStyle.replace("pl-11", "pl-4")}`}
                        disabled={isSubmitting}
                      >
                        <option value="">Select level</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelStyle}>Interest Category</label>
                      <input
                        name="category"
                        placeholder="e.g. Computer Science"
                        value={form.category || ""}
                        onChange={h}
                        className={inputStyle.replace("pl-11", "pl-4")}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className={labelStyle}>
                      Years of Professional Experience
                    </label>
                    <input
                      name="experience"
                      type="number"
                      placeholder="10"
                      value={form.experience || ""}
                      onChange={h}
                      className={`${inputStyle.replace("pl-11", "pl-4")} ${validationErrors.experience ? "border-red-300 focus:ring-red-500" : ""}`}
                      disabled={isSubmitting}
                    />
                    {validationErrors.experience && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {validationErrors.experience}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4 pt-4">
              <button
                type="submit"
                className="cursor-pointer w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Creating Account..."
                  : step === 1
                    ? "Continue to Profile"
                    : "Create My Account"}
                {!isSubmitting && (
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="cursor-pointer w-full py-2 text-sm text-gray-400 hover:text-gray-600 font-bold flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={14} /> Go back
                </button>
              )}
            </div>
          </form>
        </div>

        {step === 1 && (
          <p className="mt-8 text-center text-sm text-gray-400 font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 font-bold hover:text-indigo-700 transition"
            >
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
