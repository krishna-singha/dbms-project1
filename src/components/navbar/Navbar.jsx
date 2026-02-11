import Link from "next/link";
import { getServerUser } from "@/lib/serverAuth";
import { NAV_BY_ROLE } from "@/lib/navConfig";
import NavbarClient from "./NavbarClient";

export const dynamic = "force-dynamic";

export default async function Navbar() {
  const user = await getServerUser();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              BongoDB
            </span>
          </Link>

          {!user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <NavbarClient user={user} items={NAV_BY_ROLE[user.role] || []} />
          )}
        </div>
      </div>
    </nav>
  );
}
