import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Plus, Eye, X, Users, Loader2 } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff · Campus OS" }] }),
  component: Page,
});

function Page() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [viewStaff, setViewStaff] = useState<any | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient("/employees");
      const data = res?.data !== undefined ? res.data : res;
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const depts = [...new Set(staff.map((s) => s.department).filter(Boolean))].sort();
  const filtered = staff.filter((s) => {
    const fullName = `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.toLowerCase();
    const m1 = fullName.includes(search.toLowerCase());
    const m2 = deptFilter === "all" || s.department === deptFilter;
    return m1 && m2;
  });

  return (
    <div>
      <PageHeader
        title="Staff Directory"
        subtitle={loading ? "Loading staff..." : `${staff.length} staff members`}
        actions={
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Staff
          </button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff…"
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm"
        >
          <option value="all">All Departments</option>
          {depts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden md:block">
        <Panel title={`${filtered.length} staff`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Department</th>
                <th className="pb-3 pr-4">Attendance</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </td>
                </tr>
              ) : filtered.map((s) => (
                <tr key={s._id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 font-medium">{s.user?.firstName} {s.user?.lastName}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.designation}</td>
                  <td className="py-3 pr-4">{s.department || "N/A"}</td>
                  <td className="py-3 pr-4">
                    <span className="text-[oklch(0.45_0.15_155)]">100%</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-muted text-muted-foreground"}`}
                    >
                      {s.isActive ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => setViewStaff(s)}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-muted"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <EmptyState
              icon={Users}
              title="No staff found"
              description="Adjust search or filters."
            />
          )}
        </Panel>
      </div>
      <div className="md:hidden space-y-3">
        {filtered.map((s) => (
          <div
            key={s._id}
            onClick={() => setViewStaff(s)}
            className="rounded-xl border border-border bg-card p-4 shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="flex justify-between mb-1">
              <span className="font-semibold">{s.user?.firstName} {s.user?.lastName}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-muted text-muted-foreground"}`}
              >
                {s.isActive ? "active" : "inactive"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {s.designation} · {s.department || "N/A"} · 100%
            </div>
          </div>
        ))}
      </div>

      {viewStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewStaff(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Staff Profile</h2>
              <button
                onClick={() => setViewStaff(null)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Name", `${viewStaff.user?.firstName} ${viewStaff.user?.lastName}`],
                ["Role", viewStaff.designation],
                ["Department", viewStaff.department || "N/A"],
                ["Email", viewStaff.user?.email || "N/A"],
                ["Phone", viewStaff.phone || "N/A"],
                ["Join Date", new Date(viewStaff.joiningDate).toLocaleDateString()],
                ["Salary", `₹${(viewStaff.basicSalary || 0).toLocaleString()}`],
                ["Status", viewStaff.isActive ? "Active" : "Inactive"],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{l}</div>
                  <div className="mt-1 font-medium">{v as React.ReactNode}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAdd(false)}
        >
          <AddStaffForm onClose={() => setShowAdd(false)} onRefresh={fetchStaff} />
        </div>
      )}
    </div>
  );
}

function AddStaffForm({ onClose, onRefresh }: { onClose: () => void; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl max-h-[80vh] overflow-y-auto"
    >
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Add Staff Member</h2>
        <button
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setLoading(true);
          try {
            await apiClient("/employees", {
              method: "POST",
              data: {
                employeeId: `EMP-${Date.now()}`,
                employeeType: fd.get("employeeType") as string,
                designation: fd.get("designation") as string,
                department: fd.get("department") as string,
                joiningDate: new Date().toISOString(),
                basicSalary: Number(fd.get("salary")),
                user: {
                  firstName: fd.get("firstName") as string,
                  lastName: fd.get("lastName") as string,
                  email: fd.get("email") as string,
                  password: fd.get("password") as string,
                  role: fd.get("role") as string,
                }
              }
            });
            toast.success("Staff added successfully");
            onRefresh();
            onClose();
          } catch (error: any) {
            toast.error(error.message || "Failed to add staff");
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">First Name</label>
            <input name="firstName" required className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Last Name</label>
            <input name="lastName" required className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none" />
          </div>
        </div>
        {[
          ["email", "Email", "email"],
          ["password", "Password", "password"],
          ["designation", "Designation", "text"],
          ["department", "Department", "text"],
          ["salary", "Salary", "number"],
        ].map(([k, l, t]) => (
          <div key={k}>
            <label className="mb-1 block text-sm font-medium">{l}</label>
            <input
              name={k}
              type={t}
              required
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">System Role</label>
            <select name="role" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
              <option value="TEACHER">Teacher</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="DRIVER">Driver</option>
              <option value="SCHOOL_ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Employee Type</label>
            <select name="employeeType" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
              <option value="TEACHING">Teaching</option>
              <option value="NON_TEACHING">Non-Teaching</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Staff"}
        </button>
      </form>
    </div>
  );
}
