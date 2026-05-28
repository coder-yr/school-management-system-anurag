import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  GraduationCap,
  Wallet,
  Building2,
  Bus,
  BookOpen,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import { PageHeader, Panel, StatCard } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const admissionsData = [
  { month: "Jan", new: 42, churn: 6 },
  { month: "Feb", new: 51, churn: 8 },
  { month: "Mar", new: 60, churn: 5 },
  { month: "Apr", new: 73, churn: 9 },
  { month: "May", new: 88, churn: 7 },
  { month: "Jun", new: 96, churn: 11 },
  { month: "Jul", new: 110, churn: 6 },
];

const feeData = [
  { name: "Collected", value: 78, color: "oklch(0.55 0.15 155)" },
  { name: "Pending", value: 16, color: "oklch(0.75 0.15 75)" },
  { name: "Overdue", value: 6, color: "oklch(0.58 0.22 27)" },
];

const attendanceData = [
  { day: "Mon", present: 92 },
  { day: "Tue", present: 94 },
  { day: "Wed", present: 89 },
  { day: "Thu", present: 95 },
  { day: "Fri", present: 91 },
  { day: "Sat", present: 86 },
];

const activity = [
  { tag: "Admission", text: "12 new admissions approved for Grade 9", time: "10m ago" },
  { tag: "Fees", text: "₹4.2L collected today across 86 transactions", time: "32m ago" },
  { tag: "Hostel", text: "Block-C room 214 marked for maintenance", time: "1h ago" },
  { tag: "HR", text: "Leave request from Mr. Rahul Iyer pending approval", time: "2h ago" },
  { tag: "Library", text: "27 books due for return today", time: "3h ago" },
];

function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ students: 0, staff: 0 });

  useEffect(() => {
    setMounted(true);
    
    Promise.all([
      apiClient<any>("/students?limit=1"),
      apiClient<any>("/employees?limit=1")
    ]).then(([studentsRes, staffRes]) => {
      const sData: any = studentsRes;
      const tData: any = staffRes;
      const parsedStudents = sData?.data !== undefined ? sData.data : sData;
      const parsedStaff = tData?.data !== undefined ? tData.data : tData;
      setStats({
        students: parsedStudents?.total || 0,
        staff: parsedStaff?.total || 0
      });
    }).catch(console.error);
  }, []);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Live overview of campus operations · Academic Year 2025–26"
        actions={
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Generate report
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={stats.students.toString()}
          delta="Enrolled"
          icon={GraduationCap}
          tone="info"
        />
        <StatCard label="Total Staff" value={stats.staff.toString()} delta="Active" icon={Users} />
        <StatCard
          label="Fees Collected"
          value="₹2.84 Cr"
          delta="78% of target"
          icon={Wallet}
          tone="success"
        />
        <StatCard
          label="Pending Dues"
          value="₹62.4 L"
          delta="312 students"
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Admissions trend"
            action={<span className="text-xs text-muted-foreground">Last 7 months</span>}
          >
            <div className="h-72">
              <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-muted-foreground">
                Chart Placeholder
              </div>
            </div>
          </Panel>
        </div>

        <Panel
          title="Fee status"
          action={<span className="text-xs text-muted-foreground">This term</span>}
        >
          <div className="h-56">
            <div className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-border bg-muted/20 text-muted-foreground">
              Pie Placeholder
            </div>
          </div>
          <ul className="mt-2 space-y-2 text-sm">
            {feeData.map((f) => (
              <li key={f.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />
                  {f.name}
                </span>
                <span className="font-medium">{f.value}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Weekly attendance">
          <div className="h-56">
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-muted-foreground">
              Bar Placeholder
            </div>
          </div>
        </Panel>

        <Panel title="Operations snapshot">
          <ul className="space-y-3 text-sm">
            {[
              { icon: Building2, label: "Hostel occupancy", value: "92%" },
              { icon: Bus, label: "Buses on route", value: "18 / 20" },
              { icon: BookOpen, label: "Library books out", value: "1,240" },
              { icon: TrendingUp, label: "Avg academic score", value: "78.4%" },
            ].map((r) => (
              <li
                key={r.label}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <span className="flex items-center gap-3 text-foreground">
                  <r.icon className="h-4 w-4 text-accent" />
                  {r.label}
                </span>
                <span className="font-semibold">{r.value}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Recent activity"
          action={<button className="text-xs text-accent hover:underline">View all</button>}
        >
          <ul className="space-y-3">
            {activity.map((a, i) => (
              <li
                key={i}
                className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <span className="mt-0.5 inline-flex shrink-0 rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                  {a.tag}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
