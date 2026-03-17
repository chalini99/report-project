"use client";

interface LabResult {
  test: string;
  value: number;
  status: string;
  normal_range: string;
}

interface LabTableProps {
  labResults: LabResult[];
}

const statusBadge: Record<string, string> = {
  Normal: "bg-green-100 text-green-800",
  Low: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

export default function LabTable({ labResults }: LabTableProps) {
  if (labResults.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4">No lab results available.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {["Test", "Value", "Status", "Normal Range"].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {labResults.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{row.test}</td>
              <td className="px-4 py-3 text-gray-700">{row.value}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusBadge[row.status] ?? "bg-gray-100 text-gray-800"
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{row.normal_range}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
