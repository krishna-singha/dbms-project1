"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, CheckCircle } from "lucide-react";

export default function EnrollButton({ courseId }) {
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });

      if (res.ok) {
        setEnrolled(true);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to enroll");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (enrolled) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-6 py-3.5 font-bold text-emerald-600">
        <CheckCircle size={20} />
        Enrolled
      </div>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          <UserPlus size={20} />
          Enroll in Course
        </>
      )}
    </button>
  );
}