"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LabTable from "@/components/LabTable";
import ReportCard from "@/components/ReportCard";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Report {
  id: number;
  filename: string;
  patient_summary: string;
  clinical_summary: string;
  overall_health_status: string;
  created_at: string;
}

const statusBadge: Record<string, string> = {
  Normal: "bg-green-100 text-green-800",
  "Attention Needed": "bg-yellow-100 text-yellow-800",
  Critical: "bg-red-100 text-red-800",
};

export default function DoctorDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await apiFetch("/api/reports");
      if (!res.ok) {
        setError("Failed to load reports. Please try again.");
        return;
      }
      const data: Report[] = await res.json();
      setReports(data);
    } catch {
      setError("Unable to connect to the server. Please check your connection.");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex overflow-hidden">
        {/* Left panel — report list */}
        <aside className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Patient Reports</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            {!error && reports.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No reports found.</p>
            )}
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`cursor-pointer rounded-xl transition-all ${
                  selectedReport?.id === report.id
                    ? "ring-2 ring-teal-500"
                    : ""
                }`}
              >
                <ReportCard report={report} />
              </div>
            ))}
          </div>
        </aside>

        {/* Right panel — report details */}
        <section className="flex-1 overflow-y-auto p-8">
          {selectedReport ? (
            <div className="max-w-3xl space-y-8">
              {/* Heading + status badge */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 break-all">
                  {selectedReport.filename}
                </h1>
                <span
                  className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    statusBadge[selectedReport.overall_health_status] ??
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedReport.overall_health_status}
                </span>
              </div>

              {/* Clinical Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-700 mb-3">
                  Clinical Summary
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.clinical_summary}
                </p>
              </div>

              {/* Lab Analysis */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-700 mb-3">
                  Lab Analysis
                </h2>
                <LabTable labResults={[]} />
                <p className="text-xs text-gray-400 mt-3">
                  Lab results are available immediately after upload.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">
                Select a report from the list to view details.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
