"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Plus, Trash2, UserPlus, Search, ArrowLeft, User, Mail } from "lucide-react";

export default function ManageCourseUsers({ course, instructors, allInstructors, students, allStudents }) {
  const router = useRouter();
  const [showIModal, setIModal] = useState(false);
  const [showSModal, setSModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableInst = allInstructors.filter(inst => !instructors.find(i => i.id === inst.id));
  const availableStud = allStudents.filter(stud => !students.find(s => s.id === stud.id));

  const apiCall = async (endpoint, method, body) => {
    setLoading(true);
    const res = await fetch(`/api/courses/${course.id}/${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setIModal(false);
      setSModal(false);
      setSelectedId("");
      router.refresh();
    } else {
      alert("Action failed");
    }
    setLoading(false);
  };

  const removeUser = async (endpoint, userId) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/courses/${course.id}/${endpoint}?${endpoint.slice(0, -1)}Id=${userId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <main className="mx-auto max-w-7xl px-6 pt-10">
        <Link href={`/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-6">
          <ArrowLeft size={16} /> Back to Course
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900">{course.name}</h1>
          <p className="text-slate-500 font-medium">User Management Portal</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Instructors</h2>
                <button onClick={() => setIModal(true)} className="rounded-xl bg-indigo-600 p-2 text-white hover:bg-indigo-700">
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {instructors.map(inst => (
                  <div key={inst.id} className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-indigo-100 hover:bg-white">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">{inst.name[0]}</div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{inst.name}</div>
                        <div className="text-xs text-slate-500">{inst.email}</div>
                      </div>
                    </div>
                    <button onClick={() => removeUser("instructors", inst.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-7">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm min-h-[500px] flex flex-col">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Enrolled Students</h2>
                  <p className="text-sm text-slate-500 font-medium">{students.length} Total</p>
                </div>
                <button onClick={() => setSModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-all">
                  <UserPlus size={18} /> Add Student
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                {filteredStudents.map(stud => (
                  <div key={stud.id} className="flex items-center justify-between rounded-2xl border border-transparent p-3 hover:border-slate-100 hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{stud.name}</div>
                        <div className="text-xs text-slate-500">{stud.email}</div>
                      </div>
                    </div>
                    <button onClick={() => removeUser("students", stud.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="py-20 text-center text-slate-400 font-medium">No students found</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {(showIModal || showSModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">{showIModal ? "Add Instructor" : "Add Student"}</h2>
              <button onClick={() => { setIModal(false); setSModal(false); }} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <div className="space-y-4">
              <select 
                value={selectedId} 
                onChange={e => setSelectedId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="">Select a user...</option>
                {(showIModal ? availableInst : availableStud).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <button
                disabled={loading || !selectedId}
                onClick={() => showIModal ? apiCall("instructors", "POST", { instructorId: selectedId }) : apiCall("students", "POST", { studentId: selectedId })}
                className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Confirm Addition"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}