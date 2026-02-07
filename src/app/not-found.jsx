import Link from "next/link";
import { MoveLeft, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-6">
          <BookOpen className="text-indigo-600" size={32} />
        </div>
        <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Page not found</h2>
        <p className="text-gray-500 mb-10 leading-relaxed">
          The lesson or page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all active:scale-95"
          >
            <MoveLeft size={18} />
            Back to Home
          </Link>
          <Link
            href="/courses"
            className="w-full sm:w-auto text-gray-600 hover:text-indigo-600 font-semibold px-8 py-3 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}