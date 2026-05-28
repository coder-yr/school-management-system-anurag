import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";
import { TrendingUp, Users, GraduationCap, Wallet } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Campus OS" }] }),
  component: Page,
});

const gradePerf = [
  { g: "9-A", avg: 79 },
  { g: "9-B", avg: 74 },
  { g: "10-A", avg: 82 },
  { g: "10-B", avg: 76 },
  { g: "10-C", avg: 71 },
];
const monthly = [
  { m: "Jan", students: 3200, fees: 18 },
  { m: "Feb", students: 3250, fees: 22 },
  { m: "Mar", students: 3300, fees: 28 },
  { m: "Apr", students: 3380, fees: 35 },
  { m: "May", students: 3420, fees: 42 },
  { m: "Jun", students: 3482, fees: 48 },
];
const deptDist = [
  { name: "Teaching", value: 60, color: "oklch(0.55 0.13 255)" },
  { name: "Admin", value: 20, color: "oklch(0.65 0.15 155)" },
  { name: "Support", value: 15, color: "oklch(0.75 0.15 75)" },
  { name: "Other", value: 5, color: "oklch(0.58 0.22 27)" },
];

function Page() {
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Campus-wide insights and trends" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Enrollment Growth"
          value="+8.8%"
          delta="YoY"
          icon={TrendingUp}
          tone="success"
        />
        <StatCard label="Avg Attendance" value="91.2%" icon={Users} tone="info" />
        <StatCard label="Academic Avg" value="78.4%" icon={GraduationCap} />
        <StatCard
          label="Fee Collection"
          value="78%"
          delta="Of annual target"
          icon={Wallet}
          tone="success"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel
          title="Grade-wise Performance"
          action={<span className="text-xs text-muted-foreground">Pre-final avg</span>}
        >
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={gradePerf}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.91 0.015 255)"
                  vertical={false}
                />
                <XAxis
                  dataKey="g"
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
                <Bar dataKey="avg" fill="oklch(0.55 0.13 255)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel
          title="Enrollment & Fee Trend"
          action={<span className="text-xs text-muted-foreground">6 months</span>}
        >
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.91 0.015 255)"
                  vertical={false}
                />
                <XAxis
                  dataKey="m"
                  stroke="oklch(0.50 0.03 260)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.50 0.03 260)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="oklch(0.55 0.13 255)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="fees"
                  stroke="oklch(0.65 0.15 155)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Staff Distribution">
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={deptDist}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {deptDist.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {deptDist.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value}%)
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Key Metrics Summary">
          <div className="space-y-3">
            {[
              { label: "Student-Teacher Ratio", value: "14:1", bar: 70 },
              { label: "Infrastructure Utilization", value: "87%", bar: 87 },
              { label: "Digital Adoption", value: "92%", bar: 92 },
              { label: "Parent Satisfaction", value: "4.2/5", bar: 84 },
              { label: "Placement Rate", value: "96%", bar: 96 },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">{m.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${m.bar}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
