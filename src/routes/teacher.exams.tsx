import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PageHeader, Panel } from "@/components/module-shell";
import { useState } from "react";

export const Route = createFileRoute("/teacher/exams")({ component: Page });

const overall = [
  { cls: "10-A", avg: 82 },
  { cls: "10-B", avg: 76 },
  { cls: "10-C", avg: 71 },
  { cls: "9-A", avg: 79 },
  { cls: "9-B", avg: 74 },
];
const examwise = [
  { exam: "UT1", avg: 72 },
  { exam: "UT2", avg: 76 },
  { exam: "Mid", avg: 78 },
  { exam: "UT3", avg: 81 },
  { exam: "Pre", avg: 83 },
];
const subwise = [
  { sub: "Algebra", avg: 85 },
  { sub: "Geometry", avg: 78 },
  { sub: "Trigonometry", avg: 72 },
  { sub: "Probability", avg: 80 },
  { sub: "Calculus", avg: 76 },
];

function Page() {
  const [view, setView] = useState<"overall" | "examwise" | "subjectwise">("overall");
  return (
    <div>
      <PageHeader title="Exam Insights" subtitle="Multi-dimensional performance analytics" />
      <div className="flex gap-1 mb-4 rounded-lg bg-muted p-1">
        {(
          [
            ["overall", "Overall"],
            ["examwise", "Exam-wise"],
            ["subjectwise", "Subject-wise"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${view === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>
      {view === "overall" && (
        <Panel title="Class-wise Average">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={overall}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.91 0.015 255)"
                  vertical={false}
                />
                <XAxis dataKey="cls" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="avg" fill="oklch(0.55 0.13 255)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}
      {view === "examwise" && (
        <Panel title="Exam Trend">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={examwise}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.91 0.015 255)"
                  vertical={false}
                />
                <XAxis dataKey="exam" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="oklch(0.55 0.13 255)"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}
      {view === "subjectwise" && (
        <Panel title="Topic-wise Performance">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={subwise} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.91 0.015 255)"
                  horizontal={false}
                />
                <YAxis
                  dataKey="sub"
                  type="category"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <XAxis
                  type="number"
                  domain={[60, 100]}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar dataKey="avg" fill="oklch(0.65 0.15 155)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}
    </div>
  );
}
