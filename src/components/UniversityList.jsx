"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  X,
  Edit,
  Trash2,
  GraduationCap,
  MapPin,
  BookOpen,
  ChevronRight,
  Globe,
  Search,
} from "lucide-react";

export default function UniversityList({ universities, userRole }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [form, setForm] = useState({ name: "", country: "" });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const url = editingUniversity
      ? `/api/universities/${editingUniversity.id}`
      : "/api/universities";
    const res = await fetch(url, {
      method: editingUniversity ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      setForm({ name: "", country: "" });
      router.refresh();
    } else {
      alert("Error saving university");
    }
    setSubmitting(false);
  };

  const handleDelete = async (university, e) => {
    if (
      !confirm(
        `Are you sure you want to delete ${university.name}? This will remove all associated courses.`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/universities/${university.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete university");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting.");
    }
  };

  const openCreateModal = () => {
    setEditingUniversity(null);
    setForm({ name: "", country: "" });
    setShowModal(true);
  };

  const filteredUniversities = useMemo(() => {
    if (!search.trim()) return universities;

    const q = search.toLowerCase();
    return universities.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.country.toLowerCase().includes(q),
    );
  }, [universities, search]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <main className="mx-auto max-w-7xl px-6 pt-12">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Partner Institutions
          </h1>

          {userRole === "ADMIN" && (
            <button
              onClick={openCreateModal}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95"
            >
              <Plus size={20} strokeWidth={2.5} />
              Add University
            </button>
          )}
        </div>

        <div className="relative w-full mt-4 mb-6 flex">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by university name or country..."
            className="w-1/2 px-3 py-2 pl-10 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {universities.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white py-32 text-center text-slate-400">
            No universities found.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.map((uni) => (
              <Link
                key={uni.id}
                href={`/university/${uni.id}`}
                className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-all duration-300 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)]"
              >
                <div className="p-8">
                  {userRole === "ADMIN" && (
                    <div className="absolute right-6 top-6 flex gap-2 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingUniversity(uni);
                          setForm({ name: uni.name, country: uni.country });
                          setShowModal(true);
                        }}
                        className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        title="Edit University"
                      >
                        <Edit size={16} />
                      </button>

                      {Number(uni.course_count) === 0 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(uni, e);
                          }}
                          className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-red-500 shadow-sm hover:bg-red-50 transition-colors"
                          title="Delete University"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      {Number(uni.course_count) > 0 && (
                        <div
                          className="cursor-not-allowed flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-300"
                          title="Cannot delete university with active courses"
                        >
                          <Trash2 size={16} className="opacity-50" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <GraduationCap size={28} />
                  </div>

                  <h2 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {uni.name}
                  </h2>

                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    <MapPin size={16} className="text-indigo-400" />
                    {uni.country}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-50 bg-slate-50/50 px-8 py-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                    <BookOpen size={16} className="text-indigo-500" />
                    {uni.course_count} Programs
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-slate-300 group-hover:translate-x-1 group-hover:text-indigo-500 transition-all"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
              <h2 className="text-xl font-extrabold text-slate-900">
                {editingUniversity ? "Edit Institution" : "Add Institution"}
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
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  University Name
                </label>
                <input
                  required
                  placeholder="IIT Kharagpur"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Country
                </label>
                <div className="relative">
                  <Globe
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    required
                    placeholder="India"
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <button
                disabled={submitting}
                className="cursor-pointer w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Confirm Institution"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
