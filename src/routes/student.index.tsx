import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, CalendarDays, Wallet, TrendingUp, Bus, Clock } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";

export const Route = createFileRoute("/student/")({
  component: StudentDashboard,
});

const attendance = [{ name: "Attendance", value: 92, fill: "oklch(0.55 0.13 255)" }];

const grades = [
  { test: "T1", score: 72 },
  { test: "T2", score: 78 },
  { test: "Mid", score: 81 },
  { test: "T3", score: 85 },
  { test: "T4", score: 83 },
  { test: "Pre-Final", score: 88 },
];

const timetable = [
  { time: "08:30", subject: "Mathematics", room: "201", teacher: "Mrs. Iyer" },
  { time: "09:30", subject: "Physics", room: "Lab-2", teacher: "Mr. Rao" },
  { time: "10:30", subject: "English", room: "108", teacher: "Ms. Singh" },
  { time: "11:45", subject: "Chemistry", room: "Lab-1", teacher: "Dr. Khan" },
  { time: "12:45", subject: "History", room: "204", teacher: "Mr. Verma" },
];

const assignments = [
  {
    subject: "Mathematics",
    title: "Quadratic Equations — Set 4",
    due: "Tomorrow",
    status: "pending",
  },
  { subject: "Science", title: "Lab report: Reflection", due: "In 3 days", status: "pending" },
  { subject: "English", title: "Essay on environment", due: "Submitted", status: "done" },
];

function StudentDashboard() {
  return (
    <div>
      <PageHeader
        title="Hi Aarav 👋"
        subtitle="Here's everything you need today — Wednesday, May 14"
        actions={
          <button className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
            View timetable
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Attendance"
          value="92%"
          delta="Above 75% target"
          icon={Clock}
          tone="success"
        />
        <StatCard
          label="Pending assignments"
          value="4"
          delta="2 due this week"
          icon={ClipboardList}
          tone="warning"
        />
        <StatCard
          label="Average score"
          value="83%"
          delta="+5 from last term"
          icon={TrendingUp}
          tone="info"
        />
        <StatCard label="Fee dues" value="₹12,400" delta="Due Jun 5" icon={Wallet} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Attendance summary">
          <div className="h-56">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={attendance}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar background dataKey="value" cornerRadius={12} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="-mt-44 text-center">
            <div className="text-3xl font-semibold text-foreground">92%</div>
            <div className="text-xs text-muted-foreground">Present this term</div>
          </div>
          <div className="mt-32 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md bg-muted p-2">
              <div className="font-semibold text-foreground">112</div>Present
            </div>
            <div className="rounded-md bg-muted p-2">
              <div className="font-semibold text-foreground">9</div>Absent
            </div>
            <div className="rounded-md bg-muted p-2">
              <div className="font-semibold text-foreground">3</div>Leave
            </div>
          </div>
        </Panel>

        <div className="lg:col-span-2">
          <Panel
            title="Performance trend"
            action={<span className="text-xs text-muted-foreground">All subjects average</span>}
          >
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={grades}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.91 0.015 255)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="test"
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
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="oklch(0.55 0.13 255)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "oklch(0.55 0.13 255)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Today's classes"
            action={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
          >
            <ul className="divide-y divide-border">
              {timetable.map((c) => (
                <li key={c.time} className="flex items-center gap-4 py-3">
                  <div className="w-16 shrink-0 text-sm font-semibold text-accent">{c.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{c.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.teacher} · Room {c.room}
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    60 min
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Assignments">
            <ul className="space-y-3">
              {assignments.map((a) => (
                <li key={a.title} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wide text-accent">
                      {a.subject}
                    </div>
                    <span
                      className={`text-xs ${a.status === "done" ? "text-[oklch(0.45_0.15_155)]" : "text-[oklch(0.50_0.15_75)]"}`}
                    >
                      {a.due}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-foreground">{a.title}</div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Bus tracker">
            <div className="flex items-center gap-3 rounded-md bg-muted p-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-accent-foreground">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Route 12 · Sector 8</div>
                <div className="text-xs text-muted-foreground">Arriving in ~ 8 min</div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
