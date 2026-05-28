import { createFileRoute } from "@tanstack/react-router";
import { Users, ClipboardCheck, FileText, MessageSquare, TrendingUp, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";

export const Route = createFileRoute("/teacher/")({
  component: TeacherDashboard,
});

const classPerf = [
  { cls: "10-A", avg: 82 },
  { cls: "10-B", avg: 76 },
  { cls: "10-C", avg: 71 },
  { cls: "9-A", avg: 79 },
  { cls: "9-B", avg: 74 },
];

const submissions = [
  { week: "W1", on: 88, late: 12 },
  { week: "W2", on: 91, late: 9 },
  { week: "W3", on: 85, late: 15 },
  { week: "W4", on: 93, late: 7 },
  { week: "W5", on: 89, late: 11 },
  { week: "W6", on: 95, late: 5 },
];

const schedule = [
  { time: "08:30", cls: "10-A", topic: "Quadratic equations", room: "201" },
  { time: "10:30", cls: "9-B", topic: "Linear graphs", room: "108" },
  { time: "12:45", cls: "10-C", topic: "Probability — recap", room: "204" },
  { time: "14:30", cls: "9-A", topic: "Practice test", room: "201" },
];

const inbox = [
  { from: "Principal", subject: "Faculty meeting at 4 PM", time: "9:12 AM", unread: true },
  { from: "Parent · Mrs. Rao", subject: "Re: Aarav's progress", time: "Yesterday", unread: true },
  { from: "Admin", subject: "Submit term plan by Friday", time: "Yesterday", unread: false },
  {
    from: "Library",
    subject: "Reserved book ready: Algebra Vol II",
    time: "2 days",
    unread: false,
  },
];

function TeacherDashboard() {
  return (
    <div>
      <PageHeader
        title="Welcome back, Anita"
        subtitle="4 classes today · 2 assignments to grade"
        actions={
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Take attendance
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="My students"
          value="187"
          delta="Across 5 classes"
          icon={Users}
          tone="info"
        />
        <StatCard label="Today's classes" value="4" delta="Next at 10:30" icon={Clock} />
        <StatCard
          label="Assignments to grade"
          value="23"
          delta="6 overdue"
          icon={FileText}
          tone="warning"
        />
        <StatCard
          label="Class avg score"
          value="78%"
          delta="+3 from last test"
          icon={TrendingUp}
          tone="success"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Class performance"
            action={<span className="text-xs text-muted-foreground">Pre-final exam</span>}
          >
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={classPerf}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.91 0.015 255)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="cls"
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
        </div>

        <Panel
          title="Submissions"
          action={<span className="text-xs text-muted-foreground">6 weeks</span>}
        >
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={submissions}>
                <defs>
                  <linearGradient id="ton" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.15 155)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.55 0.15 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.91 0.015 255)"
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
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
                <Area dataKey="on" stroke="oklch(0.55 0.15 155)" fill="url(#ton)" strokeWidth={2} />
                <Area
                  dataKey="late"
                  stroke="oklch(0.75 0.15 75)"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Today's schedule"
            action={<ClipboardCheck className="h-4 w-4 text-muted-foreground" />}
          >
            <ul className="divide-y divide-border">
              {schedule.map((s) => (
                <li key={s.time} className="flex items-center gap-4 py-3">
                  <div className="w-16 shrink-0 text-sm font-semibold text-accent">{s.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      Class {s.cls} · {s.topic}
                    </div>
                    <div className="text-xs text-muted-foreground">Room {s.room}</div>
                  </div>
                  <button className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                    Mark attendance
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Inbox" action={<MessageSquare className="h-4 w-4 text-muted-foreground" />}>
          <ul className="space-y-3">
            {inbox.map((m, i) => (
              <li key={i} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{m.from}</span>
                  <span className="text-xs text-muted-foreground">{m.time}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                  {m.unread && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  <span className="truncate">{m.subject}</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
