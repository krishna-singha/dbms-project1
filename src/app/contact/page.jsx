export const metadata = {
  title: "Contact Us - BongoDB",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <p className="text-gray-600 leading-relaxed mb-6">
            Have questions? We'd love to hear from you.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
              <a href="mailto:support@bongodb.com" className="text-indigo-600 hover:underline">
                support@bongodb.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
