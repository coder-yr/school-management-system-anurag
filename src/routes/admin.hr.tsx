import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Users, CheckCircle, XCircle, Clock, Wallet, CalendarDays } from "lucide-react";
import { PageHeader, StatCard, Panel } from "@/components/module-shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/hr")({
  head: () => ({ meta: [{ title: "HR & Payroll · Campus OS" }] }),
  component: Page,
});

function Page() {
  const { store, dispatch } = useStore();
  const [tab, setTab] = useState<"leave" | "payroll" | "attendance">("leave");
  const activeStaff = store.staff.filter((s) => s.status === "active").length;
  const onLeave = store.staff.filter((s) => s.status === "on-leave").length;
  const pendingLeaves = store.leaveRequests.filter((l) => l.status === "pending").length;
  const totalPayroll = store.staff.reduce((a, s) => a + s.salary, 0);

  const handleLeaveAction = (id: string, status: "approved" | "rejected") => {
    dispatch({ type: "UPDATE_LEAVE_REQUEST", payload: { id, updates: { status } } });
    toast.success(`Leave ${status}`, { description: `Leave request has been ${status}.` });
  };

  const tabs = [
    { key: "leave" as const, label: "Leave Requests", icon: CalendarDays },
    { key: "payroll" as const, label: "Payroll", icon: Wallet },
    { key: "attendance" as const, label: "Staff Attendance", icon: Users },
  ];

  return (
    <div>
      <PageHeader title="HR & Payroll" subtitle="Staff management, leave approvals, and payroll" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Active Staff" value={String(activeStaff)} icon={Users} tone="info" />
        <StatCard label="On Leave" value={String(onLeave)} icon={CalendarDays} tone="warning" />
        <StatCard
          label="Pending Leaves"
          value={String(pendingLeaves)}
          delta="Needs action"
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Monthly Payroll"
          value={`₹${(totalPayroll / 100000).toFixed(1)}L`}
          icon={Wallet}
          tone="success"
        />
      </div>

      <div className="flex gap-1 mb-4 rounded-lg bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "leave" && (
        <Panel title="Leave Requests">
          <div className="space-y-3">
            {store.leaveRequests.map((l) => (
              <div
                key={l.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div>
                  <div className="font-medium text-foreground">{l.staffName}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.type} · {l.from} to {l.to}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{l.reason}</div>
                </div>
                <div className="flex items-center gap-2">
                  {l.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleLeaveAction(l.id, "approved")}
                        className="flex items-center gap-1 rounded-lg bg-[oklch(0.65_0.15_155)]/15 px-3 py-1.5 text-xs font-medium text-[oklch(0.45_0.15_155)] hover:bg-[oklch(0.65_0.15_155)]/25 transition-all active:scale-95"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleLeaveAction(l.id, "rejected")}
                        className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-all active:scale-95"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${l.status === "approved" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-destructive/10 text-destructive"}`}
                    >
                      {l.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === "payroll" && (
        <Panel title="Payroll Overview">
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 pr-4">Monthly Salary</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {store.staff.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-medium">{s.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.role}</td>
                    <td className="py-3 pr-4">{s.department}</td>
                    <td className="py-3 pr-4 font-medium">₹{s.salary.toLocaleString()}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "active" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]"}`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {store.staff.map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-3">
                <div className="flex justify-between">
                  <span className="font-medium">{s.name}</span>
                  <span className="font-medium">₹{s.salary.toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {s.role} · {s.department}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between font-semibold">
            <span>Total Monthly Payroll</span>
            <span>₹{totalPayroll.toLocaleString()}</span>
          </div>
        </Panel>
      )}

      {tab === "attendance" && (
        <Panel title="Staff Attendance">
          <div className="space-y-2">
            {store.staff.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <div className="font-medium text-sm">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.department}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${s.attendance}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{s.attendance}%</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
