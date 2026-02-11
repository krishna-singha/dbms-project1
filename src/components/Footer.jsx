import Link from "next/link";

export default function Footer() {
  const y = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-bold text-gray-900">BongoDB</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering students worldwide with high-quality, accessible education and professional mentorship.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/courses" className="text-sm text-gray-500 hover:text-indigo-600 transition">All Courses</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-indigo-600 transition">Contact Us</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-500 hover:text-indigo-600 transition">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-indigo-600 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-indigo-600 transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; {y} BongoDB Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-indigo-600 transition text-xs font-medium">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-indigo-600 transition text-xs font-medium">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-indigo-600 transition text-xs font-medium">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}