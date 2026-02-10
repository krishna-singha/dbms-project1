"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  X,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  GraduationCap,
  Layers,
  ChevronRight,
  Search,
} from "lucide-react";

export default function CourseList({ courses, universities, userRole }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    program_type: "",
    duration: "",
    university_id: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      program_type: "",
      duration: "",
      university_id: "",
    });
    setEditingCourse(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (course, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCourse(course);
    setForm({
      name: course.name,
      description: course.description || "",
      program_type: course.program_type,
      duration: String(course.duration),
      university_id: course.university_id,
    });
    setShowModal(true);
  };

  const handleDelete = async (course, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${course.name}"?`)) return;
    await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const url = editingCourse
      ? `/api/courses/${editingCourse.id}`
      : "/api/courses";
    const method = editingCourse ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, duration: Number(form.duration) }),
    });

    setSubmitting(false);
    setShowModal(false);
    resetForm();
    router.refresh();
  };

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;

    const q = search.toLowerCase();
    return courses.filter((c) => c.name.toLowerCase().includes(q));
  }, [courses, search]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <main className="mx-auto max-w-7xl px-6 pt-12">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Explore Courses
          </h1>

          {userRole === "ADMIN" && (
            <button
              onClick={openCreateModal}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95"
            >
              <Plus size={20} strokeWidth={2.5} />
              Add New Course
            </button>
          )}
        </div>

        <div className="relative w-full mt-4 mb-6 flex">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course name..."
            className="w-1/2 px-3 py-2 pl-10 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white py-32 text-center">
            <div className="rounded-full bg-slate-50 p-6 text-slate-300">
              <Layers size={48} />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">
              No courses yet
            </h3>
            <p className="mt-2 text-slate-500">
              Get started by creating your first program.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-all duration-300 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)]"
              >
                <div className="relative p-8">
                  {userRole === "ADMIN" && (
                    <div className="absolute right-6 top-6 flex gap-2">
                      <button
                        onClick={(e) => handleEdit(course, e)}
                        className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(course, e)}
                        className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-red-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <BookOpen size={24} />
                  </div>

                  <h2 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-indigo-600">
                    {course.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-400">
                    <GraduationCap size={16} />
                    {course.university}
                  </div>

                  <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-slate-600">
                    {course.description ||
                      "Comprehensive curriculum designed for future industry leaders and specialists."}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-50 bg-slate-50/50 px-8 py-5">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <Clock size={14} className="text-indigo-500" />
                      {course.duration} Months
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <Layers size={14} className="text-indigo-500" />
                      {course.program_type}
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="translate-x-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
              <h2 className="text-xl font-extrabold text-slate-900">
                {editingCourse ? "Edit Course Details" : "Create New Course"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-8 py-8">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">
                  Course Name
                </label>
                <input
                  required
                  placeholder="e.g. Advanced Machine Learning"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">
                  Description
                </label>
                <textarea
                  placeholder="Briefly describe the curriculum..."
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">
                    Program Type
                  </label>
                  <select
                    required
                    value={form.program_type}
                    onChange={(e) =>
                      setForm({ ...form, program_type: e.target.value })
                    }
                    className="cursor-pointer w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option value="">Select Type</option>
                    <option value="CERTIFICATE">Certificate</option>
                    <option value="DIPLOMA">Diploma</option>
                    <option value="DEGREE">Degree</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="12"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">
                  Partner University
                </label>
                <select
                  required
                  value={form.university_id}
                  onChange={(e) =>
                    setForm({ ...form, university_id: e.target.value })
                  }
                  className="cursor-pointer w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="">Choose University</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                disabled={submitting}
                className="cursor-pointer w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-indigo-200 disabled:opacity-50"
              >
                {submitting
                  ? "Processing..."
                  : editingCourse
                    ? "Save Changes"
                    : "Create Course"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
