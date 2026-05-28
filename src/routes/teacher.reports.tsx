import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";
import { Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/teacher/reports")({ component: Page });

function Page() {
  const [search, setSearch] = useState("");
  const [allStudents, setAllStudents] = useState<any[]>([]);

  useEffect(() => {
    apiClient<any>("/users?role=STUDENT")
      .then((res) => setAllStudents(res?.data || []))
      .catch(() => {});
  }, []);

  const students = allStudents.filter((s: any) => {
    const name = `${s.user?.firstName || s.firstName || ""} ${s.user?.lastName || s.lastName || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const getTrend = (att: number) =>
    att >= 85
      ? { icon: TrendingUp, color: "text-[oklch(0.45_0.15_155)]", label: "Good" }
      : att >= 75
        ? { icon: Minus, color: "text-[oklch(0.50_0.15_75)]", label: "Average" }
        : { icon: TrendingDown, color: "text-destructive", label: "At Risk" };

  return (
    <div>
      <PageHeader title="Student Reports" subtitle="Individual student performance tracking" />
      <div className="mb-4 relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student…"
          className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((s: any) => {
          const name = `${s.user?.firstName || s.firstName || "?"} ${s.user?.lastName || s.lastName || ""}`.trim();
          const rollNo = s.rollNumber || s.admissionNumber || "—";
          const grade = s.classDetails?.name || s.class || "—";
          const section = s.sectionDetails?.name || s.section || "";
          const attendance = s.attendance || 0;
          const feesDue = s.feesDue || 0;
          const trend = getTrend(attendance);
          const Icon = trend.icon;
          return (
            <div
              key={s._id || s.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                  {name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{name}</div>
                  <div className="text-xs text-muted-foreground">
                    {grade}{section ? `-${section}` : ""} · #{rollNo}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted p-2">
                  <div className="text-xs text-muted-foreground">Attendance</div>
                  <div className="font-semibold">{attendance}%</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="text-xs text-muted-foreground">Fees Due</div>
                  <div className="font-semibold">₹{feesDue.toLocaleString()}</div>
                </div>
              </div>
              <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${trend.color}`}>
                <Icon className="h-3.5 w-3.5" />
                {trend.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
