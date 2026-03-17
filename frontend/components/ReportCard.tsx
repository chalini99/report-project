"use client";

interface Report {
  id: number;
  filename: string;
  overall_health_status: string;
  created_at: string;
}

interface ReportCardProps {
  report: Report;
}

const statusBadge: Record<string, string> = {
  Normal: "bg-green-100 text-green-800",
  "Attention Needed": "bg-yellow-100 text-yellow-800",
  Critical: "bg-red-100 text-red-800",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportCard({ report }: ReportCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md hover:border-teal-300 transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {report.filename}
          </p>
          <p className="text-xs text-gray-500 mt-1">{formatDate(report.created_at)}</p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusBadge[report.overall_health_status] ?? "bg-gray-100 text-gray-800"
          }`}
        >
          {report.overall_health_status}
        </span>
      </div>
    </div>
  );
}
