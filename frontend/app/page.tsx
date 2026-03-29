"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-teal-700">
          🏥 Medical Insight AI
        </h1>

        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-black">
            Login
          </Link>

          <Link
            href="/login"
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="text-center py-24 px-6">

        <h2 className="text-5xl font-bold mb-6 text-gray-800">
          Understand Your Medical Reports Instantly 🧠
        </h2>

        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Upload your lab reports and get AI-powered insights, health tips,
          and easy-to-understand explanations in seconds.
        </p>

        <Link
          href="/login"
          className="bg-teal-600 text-white px-8 py-3 rounded-lg text-lg shadow hover:bg-teal-700"
        >
          Get Started →
        </Link>

      </section>

      {/* FEATURES */}
      <section className="grid md:grid-cols-3 gap-6 px-10 pb-20">

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="font-bold text-xl mb-2">🧠 AI Summarization</h3>
          <p className="text-gray-600">
            Converts complex medical terms into simple language.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="font-bold text-xl mb-2">📊 Health Insights</h3>
          <p className="text-gray-600">
            Detect risks like diabetes, anemia, and cholesterol issues.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="font-bold text-xl mb-2">💡 Smart Recommendations</h3>
          <p className="text-gray-600">
            Get personalized health tips instantly.
          </p>
        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-20 text-center">

        <h2 className="text-3xl font-bold mb-10 text-gray-800">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-6 px-10">

          <div>
            <h4 className="font-semibold text-lg">1. Upload</h4>
            <p className="text-gray-600">Upload your medical report</p>
          </div>

          <div>
            <h4 className="font-semibold text-lg">2. Analyze</h4>
            <p className="text-gray-600">AI processes your report</p>
          </div>

          <div>
            <h4 className="font-semibold text-lg">3. Understand</h4>
            <p className="text-gray-600">Get clear insights & tips</p>
          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="text-center py-20">

        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Take Control of Your Health Today 🚀
        </h2>

        <Link
          href="/login"
          className="bg-teal-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-teal-700"
        >
          Login Now
        </Link>

      </section>

    </div>
  );
}