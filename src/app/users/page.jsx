"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, Search, Plus, X, Lock, Eye, EyeOff, Mail, UserCircle} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN", "DATA_ANALYST"];

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  const [activeRole, setActiveRole] = useState("ADMIN");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newRole, setNewRole] = useState("ADMIN");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      fetchUsers(activeRole);
    }
  }, [activeRole, currentUser]);

  const fetchUsers = async (role) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?role=${role}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (targetUser) => {
    if (targetUser.id === currentUser.id) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${targetUser.name}?`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          role: newRole,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setForm({ name: "", email: "", password: "" });
        setNewRole("ADMIN");
        fetchUsers(activeRole);
      } else {
        alert("Failed to create user");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-semibold">
        Access denied
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-nowrap">User Management</h1>

          <button
            onClick={() => setShowModal(true)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full mt-4 mb-6 flex justify-end">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-1/2 px-3 py-2 pr-10 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeRole === role
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {role.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-gray-500 font-semibold">
                Loading users…
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-10 text-center text-gray-500 font-semibold">
                No users found
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-indigo-600">
                  <tr className="text-left text-white uppercase text-xs">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser.id;

                    return (
                      <tr
                        key={u.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-semibold">
                          {u.name}
                          {isSelf && (
                            <span className="ml-2 text-xs text-indigo-600 font-bold">
                              (You)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => deleteUser(u)}
                            disabled={isSelf}
                            className={`p-2 rounded-lg ${
                              isSelf
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50 cursor-pointer"
                            }`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Add new Admin or Data analyst */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  Add New User
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="mb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Select Role
                </p>
                <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                  {["ADMIN", "DATA_ANALYST"].map((role) => {
                    const active = newRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setNewRole(role)}
                        className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
                          active
                            ? "bg-white shadow-sm text-indigo-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {role.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={createUser} className="space-y-5">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Full Name
                  </label>
                  <div className="relative">
                      <UserCircle
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        name="name"
                        placeholder="Krishna Singha"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Email Address
                  </label>
                  <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="krishna@example.com"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Password
                  </label>
                  <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type={show ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                </div>

                <button
                  disabled={creating}
                  className="cursor-pointer mt-2 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating user..." : "Create User"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
