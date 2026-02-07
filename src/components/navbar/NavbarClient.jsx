"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function NavbarClient({ user, items }) {
  const { logout } = useAuth();

  return (
    <div className="flex items-center gap-6">
      <div className="hidden md:flex items-center gap-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="border-l border-gray-400 border-2 h-6" />

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-indigo-700">
          {user.name}
        </span>

        <button
          onClick={logout}
          className="cursor-pointer text-sm px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
