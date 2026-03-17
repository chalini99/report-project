"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LabTable from "@/components/LabTable";
import ReportCard from "@/components/ReportCard";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface LabResult {
  test: string;
  value: number;
  status: string;
  normal_range: string;
}

interface UploadResult {
  report_id: number;
  patient_summary: string;
  clinical_summary: string;
  lab_results: LabResult[];
  health_tips: string[];
  overall_health_status: string;
}

interface Report {
  id: number;
  filename: string;
  overall_health_status: string;
  created_at: string;
}

const statusBadgeClass: Record<string, string> = {
  Normal: "bg-green-100 text-green-800",
  "Attention Needed": "bg-yellow-100 text-yellow-800",
  Critical: "bg-red-100 text-red-800",
};

export default function PatientDashboard() {
  const router = useRouter();
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  // Report history
  const [reports, setReports] = useState<Report[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Upload form
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  // Download
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!getToken()) {
      router.push("/");
    }
  }, [router]);

  // Fetch report history on mount
  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await apiFetch("/api/reports");
        if (!res.ok) throw new Error("Failed to load reports.");
        const data: Report[] = await res.json();
        setReports(data);
      } catch {
        setHistoryError("Could not load report history. Please try again.");
      }
    }
    fetchReports();
  }, []);

  function scrollToUpload() {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setResult(null);
    setDownloadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch("/api/upload-report", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed. Please try again.");
      }

      const data: UploadResult = await res.json();
      setResult(data);

      // Refresh report history
      const histRes = await apiFetch("/api/reports");
      if (histRes.ok) setReports(await histRes.json());
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload() {
    if (!result) return;
    setDownloadError(null);

    try {
      const res = await apiFetch("/api/download-report", {
        method: "POST",
        body: JSON.stringify({ report_id: result.report_id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Download failed. Please try again.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${result.report_id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setDownloadError(err instanceof Error ? err.message : "Could not download the report.");
    }
  }

  const latestStatus = reports[0]?.overall_health_status ?? "—";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Dashboard</h2>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Reports</p>
            <p className="text-3xl font-bold text-teal-700">{reports.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Latest Health Status</p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mt-1 ${
                statusBadgeClass[latestStatus] ?? "bg-gray-100 text-gray-800"
              }`}
            >
              {latestStatus}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center">
            <button
              onClick={scrollToUpload}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              Upload New Report
            </button>
          </div>
        </section>

        {/* Upload Form */}
        <section ref={uploadSectionRef} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Analyze a Report</h3>
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-start">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
              required
            />
            <button
              type="submit"
              disabled={uploading || !file}
              className="shrink-0 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {uploading ? "Analyzing…" : "Analyze Report"}
            </button>
          </form>

          {uploadError && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {uploadError}
            </p>
          )}
        </section>

        {/* Results Section */}
        {result && (
          <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  statusBadgeClass[result.overall_health_status] ?? "bg-gray-100 text-gray-800"
                }`}
              >
                {result.overall_health_status}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Patient Summary</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{result.patient_summary}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Lab Results</h4>
              <LabTable labResults={result.lab_results} />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Health Tips</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.health_tips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-700">{tip}</li>
                ))}
              </ul>
            </div>

            <div>
              <button
                onClick={handleDownload}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Download PDF Report
              </button>
              {downloadError && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {downloadError}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Report History */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Report History</h3>

          {historyError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
              {historyError}
            </p>
          )}

          {reports.length === 0 && !historyError ? (
            <p className="text-sm text-gray-500">No reports yet.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
