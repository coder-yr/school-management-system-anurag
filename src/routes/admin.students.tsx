import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Plus, Eye, UserPlus, X, Loader2 } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Students · Campus OS" }] }),
  component: Page,
});

function Page() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [viewStudent, setViewStudent] = useState<any | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient("/students");
      const data = res?.data !== undefined ? res.data : res;
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    const fullName = `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.toLowerCase();
    const rollNo = s.rollNumber || s.admissionNumber || "";
    const matchSearch = fullName.includes(search.toLowerCase()) || rollNo.includes(search);
    const matchGrade = gradeFilter === "all" || s.classDetails?.name === gradeFilter;
    return matchSearch && matchGrade;
  });

  const grades = [...new Set(students.map((s) => s.classDetails?.name).filter(Boolean))].sort();

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={loading ? "Loading students..." : `${students.length} students enrolled`}
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </td>
                  </tr>
                ) : filtered.map((s) => (
                  <tr key={s._id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-foreground">{s.user?.firstName} {s.user?.lastName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.rollNumber || s.admissionNumber}</td>
                    <td className="py-3 pr-4">
                      {s.classDetails?.name || "N/A"}-{s.sectionDetails?.name || "N/A"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`font-medium ${s.attendance >= 85 ? "text-[oklch(0.45_0.15_155)]" : s.attendance >= 75 ? "text-[oklch(0.50_0.15_75)]" : "text-destructive"}`}
                      >
                        {s.attendance || 100}%
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[oklch(0.45_0.15_155)]">Paid</span>
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
            key={s._id}
            onClick={() => setViewStudent(s)}
            className="rounded-xl border border-border bg-card p-4 shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-foreground">{s.user?.firstName} {s.user?.lastName}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-muted text-muted-foreground"}`}
              >
                {s.isActive ? "active" : "inactive"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>Roll: {s.rollNumber || s.admissionNumber}</span>
              <span>
                Grade: {s.classDetails?.name || "N/A"}-{s.sectionDetails?.name || "N/A"}
              </span>
              <span>Attendance: {s.attendance || 100}%</span>
              <span>Due: ₹0</span>
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
                {viewStudent.user?.firstName?.[0] || "?"}
              </div>
              <div>
                <div className="text-lg font-semibold">{viewStudent.user?.firstName} {viewStudent.user?.lastName}</div>
                <div className="text-sm text-muted-foreground">
                  Grade {viewStudent.classDetails?.name || "N/A"}-{viewStudent.sectionDetails?.name || "N/A"} · Roll #{viewStudent.rollNumber || viewStudent.admissionNumber}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Email", viewStudent.user?.email || "N/A"],
                ["Phone", viewStudent.emergencyContact || "N/A"],
                ["Guardian", viewStudent.parents?.[0]?.relationship || "N/A"],
                ["Address", viewStudent.address || "N/A"],
                ["Attendance", `${viewStudent.attendance || 100}%`],
                ["Fees Paid", `₹57,400`],
                ["Fees Due", `₹0`],
                ["Status", viewStudent.isActive ? "Active" : "Inactive"],
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
      {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} onRefresh={fetchStudents} />}
    </div>
  );
}

function AddStudentModal({
  onClose,
  onRefresh,
}: {
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    grade: "10",
    section: "A",
    rollNumber: "",
    email: "",
    password: "",
    phone: "",
    guardian: "",
    address: "",
    gender: "MALE",
    dob: "2010-01-01T00:00:00Z"
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient("/students/admission", {
        method: "POST",
        data: {
          admissionNumber: form.rollNumber || `ADM-${Date.now()}`,
          rollNumber: form.rollNumber,
          grade: form.grade,
          section: form.section,
          dob: new Date(form.dob).toISOString(),
          gender: form.gender,
          address: form.address,
          emergencyContact: form.phone,
          studentUser: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password
          }
        }
      });
      toast.success("Student added successfully");
      onRefresh();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">First Name</label>
              <input type="text" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Last Name</label>
              <input type="text" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none" />
            </div>
          </div>
          {[
            ["rollNumber", "Roll Number / Admission No", "text"],
            ["email", "Student Email", "email"],
            ["password", "Password", "password"],
            ["phone", "Emergency Contact", "tel"],
            ["address", "Address", "text"],
            ["dob", "Date of Birth", "date"],
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
          <div>
            <label className="mb-1 block text-sm font-medium">Gender</label>
            <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
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
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Enrolling..." : "Enroll Student"}
          </button>
        </form>
      </div>
    </div>
  );
}
