import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Eye, UserPlus, X } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/module-shell";
import { useStore, genId, type Student } from "@/lib/store";

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Students · Campus OS" }] }),
  component: Page,
});

function Page() {
  const { store, dispatch } = useStore();
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  const filtered = store.students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.includes(search);
    const matchGrade = gradeFilter === "all" || s.grade === gradeFilter;
    return matchSearch && matchGrade;
  });

  const grades = [...new Set(store.students.map((s) => s.grade))].sort();

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${store.students.length} students enrolled`}
        actions={
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Student
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or roll no…"
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none"
        >
          <option value="all">All Grades</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Panel title={`Showing ${filtered.length} students`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Roll</th>
                  <th className="pb-3 pr-4">Grade</th>
                  <th className="pb-3 pr-4">Attendance</th>
                  <th className="pb-3 pr-4">Fees Due</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-foreground">{s.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.rollNo}</td>
                    <td className="py-3 pr-4">
                      {s.grade}-{s.section}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`font-medium ${s.attendance >= 85 ? "text-[oklch(0.45_0.15_155)]" : s.attendance >= 75 ? "text-[oklch(0.50_0.15_75)]" : "text-destructive"}`}
                      >
                        {s.attendance}%
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {s.feesDue > 0 ? (
                        `₹${s.feesDue.toLocaleString()}`
                      ) : (
                        <span className="text-[oklch(0.45_0.15_155)]">Paid</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "active" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-muted text-muted-foreground"}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setViewStudent(s)}
                        className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-muted transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <EmptyState
              icon={UserPlus}
              title="No students found"
              description="Try adjusting your search or filters."
            />
          )}
        </Panel>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((s) => (
          <div
            key={s.id}
            onClick={() => setViewStudent(s)}
            className="rounded-xl border border-border bg-card p-4 shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-foreground">{s.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "active" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-muted text-muted-foreground"}`}
              >
                {s.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>Roll: {s.rollNo}</span>
              <span>
                Grade: {s.grade}-{s.section}
              </span>
              <span>Attendance: {s.attendance}%</span>
              <span>Due: ₹{s.feesDue.toLocaleString()}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <EmptyState
            icon={UserPlus}
            title="No students found"
            description="Try adjusting your search."
          />
        )}
      </div>

      {/* View Modal */}
      {viewStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewStudent(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Student Profile</h2>
              <button
                onClick={() => setViewStudent(null)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                {viewStudent.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="text-lg font-semibold">{viewStudent.name}</div>
                <div className="text-sm text-muted-foreground">
                  Grade {viewStudent.grade}-{viewStudent.section} · Roll #{viewStudent.rollNo}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Email", viewStudent.email],
                ["Phone", viewStudent.phone],
                ["Guardian", viewStudent.guardian],
                ["Address", viewStudent.address],
                ["Attendance", `${viewStudent.attendance}%`],
                ["Fees Paid", `₹${viewStudent.feesPaid.toLocaleString()}`],
                ["Fees Due", `₹${viewStudent.feesDue.toLocaleString()}`],
                ["Status", viewStudent.status],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{l}</div>
                  <div className="mt-1 font-medium text-foreground">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} dispatch={dispatch} />}
    </div>
  );
}

function AddStudentModal({
  onClose,
  dispatch,
}: {
  onClose: () => void;
  dispatch: ReturnType<typeof useStore>["dispatch"];
}) {
  const [form, setForm] = useState({
    name: "",
    grade: "10",
    section: "A",
    rollNo: "",
    email: "",
    phone: "",
    guardian: "",
    address: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: "ADD_STUDENT",
      payload: {
        id: genId(),
        ...form,
        attendance: 100,
        feesPaid: 0,
        feesDue: 57400,
        status: "active",
      },
    });
    toast.success("Student added", { description: `${form.name} has been enrolled.` });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add New Student</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            ["name", "Full Name", "text"],
            ["rollNo", "Roll Number", "text"],
            ["email", "Email", "email"],
            ["phone", "Phone", "tel"],
            ["guardian", "Guardian Name", "text"],
            ["address", "Address", "text"],
          ].map(([k, l, t]) => (
            <div key={k}>
              <label className="mb-1 block text-sm font-medium">{l}</label>
              <input
                type={t}
                required
                value={form[k as keyof typeof form]}
                onChange={(e) => set(k, e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Grade</label>
              <select
                value={form.grade}
                onChange={(e) => set("grade", e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option>9</option>
                <option>10</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Section</label>
              <select
                value={form.section}
                onChange={(e) => set("section", e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            Enroll Student
          </button>
        </form>
      </div>
    </div>
  );
}
