import React from "react";
import { Link } from "react-router-dom";
import { Rocket, Target } from "lucide-react"; // Optional icons (use `lucide-react`)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 via-white to-gray-100 text-gray-900">
      <main className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 items-center gap-16">
        {/* Left Text Section */}
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
            Level Up Your <span className="text-indigo-600">DSA Skills</span>
          </h1>
          <p className="text-lg text-gray-700">
            Solve real-world coding problems in C++, Python, or Java. Compete
            with peers, climb leaderboards, and become interview-ready.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <Link
              to="/problem-dashboard"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-base font-semibold hover:bg-indigo-700 transition"
            >
              <Rocket className="inline mr-2 -mt-1" size={18} />
              Get Started
            </Link>
            <Link
              to="/problem-dashboard"
              className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg text-base font-semibold hover:bg-indigo-50 transition"
            >
              <Target className="inline mr-2 -mt-1" size={18} />
              Browse Problems
            </Link>
          </div>
        </div>

       
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} ByteBattle. Built with 💻 and ☕
      </footer>
    </div>
  );
}
