"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function TrendsPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/reports")
      .then((res) => res.json())
      .then((reports) => {
        function extractValue(text: string, label: string) {
          const regex = new RegExp(label + "\\s*(\\d+\\.?\\d*)");
          const match = text.match(regex);
          return match ? parseFloat(match[1]) : 0;
        }

        const formatted = reports.map((r: any, index: number) => ({
          date: `Report ${index + 1}`,
          Hemoglobin: extractValue(r.patient_summary || "", "Hemoglobin"),
          WBC: extractValue(r.patient_summary || "", "WBC"),
          Cholesterol: extractValue(r.patient_summary || "", "Cholesterol"),
        }));

        setData(formatted);
      })
      .catch((err) => {
        console.error("Error fetching reports:", err);
      });
  }, []);

  function generateInsights(data: any[]) {
    if (!data.length) return [];

    const latest = data[data.length - 1];
    const insights = [];

    if (latest.Hemoglobin < 12)
      insights.push("Hemoglobin is low → possible anemia");

    if (latest.WBC > 11)
      insights.push("WBC is high → possible infection");

    if (latest.Cholesterol > 200)
      insights.push("Cholesterol is high → risk of heart disease");

    return insights;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Health Trends</h1>

      {/* LINE CHART */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="font-semibold mb-4">📈 Trend Over Time</h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="Hemoglobin" stroke="#16a34a" strokeWidth={3} />
            <Line type="monotone" dataKey="WBC" stroke="#dc2626" strokeWidth={3} />
            <Line type="monotone" dataKey="Cholesterol" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* BAR CHART */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
        <h2 className="font-semibold mb-4">📊 Report Comparison</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="Hemoglobin" fill="#16a34a" />
            <Bar dataKey="WBC" fill="#dc2626" />
            <Bar dataKey="Cholesterol" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI INSIGHTS */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
        <h2 className="font-semibold mb-4">🧠 AI Insights</h2>

        <ul className="list-disc ml-5 text-sm space-y-2">
          {generateInsights(data).length > 0 ? (
            generateInsights(data).map((tip, i) => <li key={i}>{tip}</li>)
          ) : (
            <li>All parameters look normal 👍</li>
          )}
        </ul>
      </div>
    </div>
  );
}