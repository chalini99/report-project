"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/upload-report", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("API RESPONSE:", data);

      // ✅ SAFE RESULT STRUCTURE (VERY IMPORTANT)
      setResult({
        summary: data.summary || "",
        critical_values: data.critical_values || [],
        diet: data.diet || [],
        exercise: data.exercise || [],
        overall_health_status: data.overall_health_status || "Normal",
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        📤 Upload Report
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

        <h2 className="text-lg font-semibold mb-4">
          Analyze a Medical Report
        </h2>

        <div className="flex flex-col md:flex-row gap-4 items-center">

          <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 transition w-full">
            📄
            <span className="text-gray-600">
              {file ? file.name : "Choose your PDF report"}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
            />
          </label>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-white font-medium transition ${
              loading
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? "Analyzing..." : "Analyze Report"}
          </button>
        </div>

        {loading && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-green-600 h-3 animate-pulse w-full"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              AI is analyzing your report...
            </p>
          </div>
        )}
      </div>

      {/* RESULT */}
      {result && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 border">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Report Analysis Results</h2>

            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
              ⚠ {result.overall_health_status}
            </span>
          </div>

          {/* SUMMARY */}
          <div className="mb-6">
            <p className="font-semibold mb-2">Summary</p>
            <textarea
              className="w-full border rounded-lg p-3 text-sm"
              value={result.summary}
              readOnly
            />
          </div>

          {/* CRITICAL */}
          <div className="mb-6">
            <p className="font-semibold mb-2">Critical Values Found</p>

            <div className="flex flex-wrap gap-2">
              {result.critical_values.length > 0 ? (
                result.critical_values.map((item: string, i: number) => (
                  <span
                    key={i}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                  >
                    ⚠ {item}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No critical values</p>
              )}
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div>
            <p className="font-semibold mb-2">Health Recommendations</p>

            <div className="space-y-3">

              {result.diet.map((d: string, i: number) => (
                <div
                  key={i}
                  className="bg-blue-50 border border-blue-200 p-3 rounded-lg"
                >
                  {d}
                </div>
              ))}

              {result.exercise.map((e: string, i: number) => (
                <div
                  key={i}
                  className="bg-green-50 border border-green-200 p-3 rounded-lg"
                >
                  {e}
                </div>
              ))}

            </div>
          </div>

        </div>
      )}
    </div>
  );
}