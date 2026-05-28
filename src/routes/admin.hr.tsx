import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, CheckCircle, XCircle, Clock, Wallet, CalendarDays, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Panel } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/admin/hr")({
  head: () => ({ meta: [{ title: "HR & Payroll · Campus OS" }] }),
  component: Page,
});

function Page() {
  const [tab, setTab] = useState<"leave" | "payroll" | "attendance">("leave");
  const [staff, setStaff] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const res: any = await apiClient("/employees");
        setStaff(res?.data || []);
      } catch (err) {
        toast.error("Failed to load staff");
      } finally {
        setLoading(false);
      }
    };
    const fetchLeaves = async () => {
      try {
        const res: any = await apiClient("/leaves");
        setLeaveRequests(res?.data || []);
      } catch {}
    };
    fetchStaff();
    fetchLeaves();
  }, []);

  const activeStaff = staff.filter((s) => s.isActive).length;
  const onLeave = staff.filter((s) => s.status === "on-leave").length;
  const pendingLeaves = leaveRequests.filter((l: any) => l.status === "pending").length;
  const totalPayroll = staff.reduce((a, s) => a + (s.basicSalary || 0), 0);

  const handleLeaveAction = async (id: string, status: "approved" | "rejected") => {
    try {
      await apiClient(`/leaves/${id}`, { method: "PATCH", data: { status } });
      setLeaveRequests(prev => prev.map((l: any) => l._id === id || l.id === id ? { ...l, status } : l));
      toast.success(`Leave ${status}`, { description: `Leave request has been ${status}.` });
    } catch {
      toast.error("Failed to update leave request");
    }
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
            {leaveRequests.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">No leave requests found.</div>
            )}
            {leaveRequests.map((l: any) => (
              <div
                key={l._id || l.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div>
                  <div className="font-medium text-foreground">{l.staffName || `${l.employee?.user?.firstName || ""} ${l.employee?.user?.lastName || ""}`.trim() || "Staff"}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.type || l.leaveType} · {new Date(l.from || l.startDate).toLocaleDateString()} to {new Date(l.to || l.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{l.reason}</div>
                </div>
                <div className="flex items-center gap-2">
                  {l.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleLeaveAction(l._id || l.id, "approved")}
                        className="flex items-center gap-1 rounded-lg bg-[oklch(0.65_0.15_155)]/15 px-3 py-1.5 text-xs font-medium text-[oklch(0.45_0.15_155)] hover:bg-[oklch(0.65_0.15_155)]/25 transition-all active:scale-95"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleLeaveAction(l._id || l.id, "rejected")}
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </td>
                  </tr>
                ) : staff.map((s) => (
                  <tr key={s._id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-medium">{s.user?.firstName} {s.user?.lastName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.designation}</td>
                    <td className="py-3 pr-4">{s.department || "N/A"}</td>
                    <td className="py-3 pr-4 font-medium">₹{(s.basicSalary || 0).toLocaleString()}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]"}`}
                      >
                        {s.isActive ? "active" : "inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {staff.map((s) => (
              <div key={s._id} className="rounded-lg border border-border p-3">
                <div className="flex justify-between">
                  <span className="font-medium">{s.user?.firstName} {s.user?.lastName}</span>
                  <span className="font-medium">₹{(s.basicSalary || 0).toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {s.designation} · {s.department || "N/A"}
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
            {staff.map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <div className="font-medium text-sm">{s.user?.firstName} {s.user?.lastName}</div>
                  <div className="text-xs text-muted-foreground">{s.department || "N/A"}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[oklch(0.65_0.15_155)]"
                      style={{ width: `100%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">100%</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
