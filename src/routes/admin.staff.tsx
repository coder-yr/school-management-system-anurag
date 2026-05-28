import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Eye, X, Users } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/module-shell";
import { useStore, genId } from "@/lib/store";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff · Campus OS" }] }),
  component: Page,
});

function Page() {
  const { store, dispatch } = useStore();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [viewStaff, setViewStaff] = useState<(typeof store.staff)[0] | null>(null);

  const depts = [...new Set(store.staff.map((s) => s.department))].sort();
  const filtered = store.staff.filter((s) => {
    const m1 = s.name.toLowerCase().includes(search.toLowerCase());
    const m2 = deptFilter === "all" || s.department === deptFilter;
    return m1 && m2;
  });

  return (
    <div>
      <PageHeader
        title="Staff Directory"
        subtitle={`${store.staff.length} staff members`}
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
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 font-medium">{s.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.role}</td>
                  <td className="py-3 pr-4">{s.department}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        s.attendance >= 90
                          ? "text-[oklch(0.45_0.15_155)]"
                          : "text-[oklch(0.50_0.15_75)]"
                      }
                    >
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "active" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : s.status === "on-leave" ? "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]" : "bg-muted text-muted-foreground"}`}
                    >
                      {s.status}
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
            key={s.id}
            onClick={() => setViewStaff(s)}
            className="rounded-xl border border-border bg-card p-4 shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="flex justify-between mb-1">
              <span className="font-semibold">{s.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "active" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]"}`}
              >
                {s.status}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {s.role} · {s.department} · {s.attendance}%
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
                ["Name", viewStaff.name],
                ["Role", viewStaff.role],
                ["Department", viewStaff.department],
                ["Email", viewStaff.email],
                ["Phone", viewStaff.phone],
                ["Join Date", viewStaff.joinDate],
                ["Salary", `₹${viewStaff.salary.toLocaleString()}`],
                ["Attendance", `${viewStaff.attendance}%`],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{l}</div>
                  <div className="mt-1 font-medium">{v}</div>
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
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Staff Member</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                dispatch({
                  type: "ADD_STAFF",
                  payload: {
                    id: genId(),
                    name: fd.get("name") as string,
                    role: fd.get("role") as string,
                    department: fd.get("department") as string,
                    email: fd.get("email") as string,
                    phone: fd.get("phone") as string,
                    joinDate: new Date().toISOString().split("T")[0],
                    salary: Number(fd.get("salary")),
                    status: "active",
                    attendance: 100,
                  },
                });
                toast.success("Staff added");
                setShowAdd(false);
              }}
              className="space-y-3"
            >
              {[
                ["name", "Name"],
                ["role", "Role"],
                ["department", "Department"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["salary", "Salary"],
              ].map(([k, l]) => (
                <div key={k}>
                  <label className="mb-1 block text-sm font-medium">{l}</label>
                  <input
                    name={k}
                    required
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Add Staff
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
