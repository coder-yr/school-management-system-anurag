import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ClipboardCheck, Check, X as XIcon, Clock, Users, Loader2 } from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/teacher/attendance")({ component: Page });

function Page() {
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [grade, section] = selectedClass.split("-");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // In a real app we'd filter by class in the API, fetching all for now
        const res: any = await apiClient("/students");
        setStudents(res?.data || []);
      } catch (err) {
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const classStudents = students.filter(
    (s) => (s.classDetails?.name || "").includes(grade) && (s.sectionDetails?.name || "") === section
  );

  const [records, setRecords] = useState<Record<string, "present" | "absent" | "late" | "leave">>({});

  // Initialize records when classStudents changes
  useEffect(() => {
    const init: Record<string, "present" | "absent" | "late" | "leave"> = {};
    classStudents.forEach((s) => {
      init[s._id] = "present";
    });
    setRecords(init);
  }, [selectedClass, students]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const payload = classStudents.map((s) => ({
        session_date: new Date().toISOString().split("T")[0],
        grade,
        section,
        student_id: s._id,
        student_name: `${s.user?.firstName} ${s.user?.lastName}`,
        status: records[s._id] || "present",
      }));
      await apiClient("/attendance/bulk", { method: "POST", data: payload });
      toast.success("Attendance saved!", { description: `${selectedClass} attendance recorded.` });
    } catch (err) {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const present = Object.values(records).filter((v) => v === "present").length;
  const absent = Object.values(records).filter((v) => v === "absent").length;

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark daily class attendance" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
        <StatCard label="Present" value={String(present)} icon={Check} tone="success" />
        <StatCard label="Absent" value={String(absent)} icon={XIcon} tone="warning" />
        <StatCard
          label="Late"
          value={String(Object.values(records).filter((v) => v === "late").length)}
          icon={Clock}
        />
        <StatCard label="Total" value={String(classStudents.length)} icon={Users} tone="info" />
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {["10-A", "10-B", "10-C", "9-A", "9-B"].map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${selectedClass === cls ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}
          >
            {cls}
          </button>
        ))}
      </div>

      <Panel
        title={`Roll Call — ${selectedClass}`}
        action={
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
          >
            <ClipboardCheck className="h-4 w-4" />
            Save
          </button>
        }
      >
        <div className="space-y-2">
          {classStudents.map((s) => {
            const fullName = `${s.user?.firstName} ${s.user?.lastName}`;
            return (
              <div
                key={s._id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-muted text-xs font-semibold">
                    {fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{fullName}</div>
                    <div className="text-xs text-muted-foreground">Roll #{s.rollNumber || s.admissionNumber}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {(["present", "absent", "late", "leave"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setRecords((p) => ({ ...p, [s._id]: status }))}
                      className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${records[s._id] === status ? (status === "present" ? "bg-[oklch(0.65_0.15_155)] text-white" : status === "absent" ? "bg-destructive text-white" : status === "late" ? "bg-[oklch(0.75_0.15_75)] text-white" : "bg-accent text-white") : "border border-border hover:bg-muted"}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {classStudents.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              No students found in {selectedClass}.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
