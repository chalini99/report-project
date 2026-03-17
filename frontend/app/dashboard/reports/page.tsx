"use client";

import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/reports")
      .then(res => res.json())
      .then(data => {
        console.log("REPORTS:", data);
        setReports(data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Reports</h1>

      {reports.length === 0 ? (
        <p className="text-gray-500">No reports found.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              onClick={() => {
  window.open(`http://127.0.0.1:8000/api/reports/${r.id}/download-original`);
}}
              className="bg-white border rounded-xl p-5 shadow hover:shadow-lg cursor-pointer transition"
            >
              {/* FILE NAME */}
              <p className="font-semibold text-lg">{r.filename}</p>

              {/* ✅ FIXED SUMMARY */}
              <p className="text-gray-600 mt-2 text-sm">
                {r.patient_summary || "No summary available"}
              </p>

              {/* ✅ FIXED STATUS */}
              <div className="mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    r.overall_health_status === "Critical"
                      ? "bg-red-100 text-red-600"
                      : r.overall_health_status === "Attention Needed"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {r.overall_health_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}