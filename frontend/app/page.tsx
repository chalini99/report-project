"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || "Login failed. Please try again.");
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      if (data.role === "patient") {
        router.push("/dashboard/patient");
      } else if (data.role === "doctor") {
        router.push("/dashboard/doctor");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-5xl mb-3">🏥</span>
          <h1 className="text-2xl font-bold text-teal-700">Medical Insight AI</h1>
          <p className="text-sm text-gray-500 mt-1">AI-powered medical report analysis</p>
        </div>

        {/* Quick-select buttons */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setUsername("patient")}
            className="flex-1 py-2 rounded-lg border-2 border-teal-200 text-teal-700 text-sm font-medium hover:bg-teal-50 transition-colors"
          >
            👤 Login as Patient
          </button>
          <button
            type="button"
            onClick={() => setUsername("doctor")}
            className="flex-1 py-2 rounded-lg border-2 border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            🩺 Login as Doctor
          </button>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-gray-800"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
