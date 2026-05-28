import { createFileRoute } from "@tanstack/react-router";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";
import { Clock, TrendingUp, Award, BookOpen } from "lucide-react";

export const Route = createFileRoute("/student/academics")({ component: Page });

const attendance = [
  { name: "Present", value: 112, color: "oklch(0.55 0.13 255)" },
  { name: "Absent", value: 9, color: "oklch(0.58 0.22 27)" },
  { name: "Leave", value: 3, color: "oklch(0.75 0.15 75)" },
];
const subjects = [
  { s: "Maths", score: 88 },
  { s: "Physics", score: 82 },
  { s: "English", score: 91 },
  { s: "Chemistry", score: 78 },
  { s: "History", score: 85 },
];

function Page() {
  const total = attendance.reduce((a, d) => a + d.value, 0);
  const pct = Math.round((attendance[0].value / total) * 100);

  return (
    <div>
      <PageHeader
        title="Academics & Attendance"
        subtitle="Your academic performance and attendance analytics"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Attendance"
          value={`${pct}%`}
          delta="Above 75% target"
          icon={Clock}
          tone="success"
        />
        <StatCard
          label="Present Days"
          value={String(attendance[0].value)}
          icon={Clock}
          tone="info"
        />
        <StatCard
          label="Overall Score"
          value="83%"
          delta="+5 from last term"
          icon={TrendingUp}
          tone="success"
        />
        <StatCard label="Class Rank" value="#4" delta="Out of 42" icon={Award} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Attendance Breakdown">
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={attendance}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {attendance.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6">
            {attendance.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Subject-wise Performance">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={subjects}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.91 0.015 255)"
                  vertical={false}
                />
                <XAxis
                  dataKey="s"
                  stroke="oklch(0.50 0.03 260)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[60, 100]}
                  stroke="oklch(0.50 0.03 260)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar dataKey="score" fill="oklch(0.55 0.13 255)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
