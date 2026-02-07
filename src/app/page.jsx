import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  Rocket,
  Star,
  ArrowRight
} from "lucide-react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/serverAuth";


export const metadata = {
  title: "EduPlatform - Home",
  description: "Welcome to EduPlatform, your learning platform",
};

export default async function Home() {
  const user = await getServerUser();
  
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-white text-gray-900">
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Learn Skills That <span className="text-indigo-600">Actually Matter</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500">
            A modern learning platform for students who want real skills
            and instructors who want real impact.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-4xl font-black text-center">How It Works</h2>

          <div className="mt-16 grid md:grid-cols-3 gap-10">
            <Feature
              icon={<Users />}
              title="Join as a Student or Instructor"
              text="Create an account that matches your goals — learning or teaching."
            />
            <Feature
              icon={<BookOpen />}
              title="Learn or Teach Real Skills"
              text="Hands-on courses, structured paths, and practical projects."
            />
            <Feature
              icon={<Rocket />}
              title="Grow Faster"
              text="Track progress, earn recognition, and build real expertise."
            />
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black">For Students</h2>
            <p className="mt-4 text-gray-500">
              Learn at your pace with structured content designed to
              help you actually master skills.
            </p>

            <ul className="mt-6 space-y-3 font-medium">
              <li>✅ Beginner to advanced learning paths</li>
              <li>✅ Practical, real-world projects</li>
              <li>✅ Track your progress and growth</li>
              <li>✅ Learn from industry professionals</li>
            </ul>
          </div>

          <div className="bg-indigo-600/10 rounded-3xl p-10">
            <GraduationCap className="text-indigo-600" size={48} />
            <p className="mt-4 font-bold text-lg">
              “This platform helped me go from beginner to confident
              in just a few months.”
            </p>
            <p className="mt-2 text-sm text-gray-500">— Verified Student</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
          <div className="bg-indigo-600/10 rounded-3xl p-10 order-2 md:order-1">
            <Star className="text-indigo-600" size={48} />
            <p className="mt-4 font-bold text-lg">
              “Teaching here lets me focus on quality content,
              not marketing nonsense.”
            </p>
            <p className="mt-2 text-sm text-gray-500">— Instructor</p>
          </div>

          <div className="order-1 md:order-2">
            <h2 className="text-4xl font-black">For Instructors</h2>
            <p className="mt-4 text-gray-500">
              Share your knowledge, grow your audience,
              and make a real impact.
            </p>

            <ul className="mt-6 space-y-3 font-medium">
              <li>✅ Build and manage courses easily</li>
              <li>✅ Reach motivated learners</li>
              <li>✅ Track engagement and success</li>
              <li>✅ Get rewarded for quality teaching</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-4xl font-black text-center">
            Popular Categories
          </h2>

          <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Computer Science",
              "Web Development",
              "Data Science",
              "Design",
              "AI & ML",
              "Business",
              "Cybersecurity",
              "Marketing"
            ].map((cat) => (
              <div
                key={cat}
                className="p-6 border border-gray-200 rounded-2xl font-bold text-center hover:shadow-lg transition"
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-indigo-600 text-white">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-black">
            Start Learning or Teaching Today
          </h2>
          <p className="mt-4 text-indigo-100">
            Join thousands of learners and instructors growing together.
          </p>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-gray-100 transition"
          >
            Create Free Account <ArrowRight />
          </Link>
        </div>
      </section>

    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="text-indigo-600">{icon}</div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-gray-500">{text}</p>
    </div>
  );
}
