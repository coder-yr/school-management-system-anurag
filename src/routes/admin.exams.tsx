import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Plus, X, Clock } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/exams")({
  head: () => ({ meta: [{ title: "Exams & Timetable · Campus OS" }] }),
  component: Page,
});

function Page() {
  const [tab, setTab] = useState<"exams" | "timetable">("exams");
  const [showAdd, setShowAdd] = useState(false);
  const [exams, setExams] = useState<any[]>([]);

  const loadExams = async () => {
    try {
      const res = await apiClient<any>("/exams");
      setExams(res?.data || []);
    } catch {}
  };

  useEffect(() => { loadExams(); }, []);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const times: string[] = [];

  return (
    <div>
      <PageHeader title="Exams & Timetable" subtitle="Schedule exams and manage class timetables" />
      <div className="flex gap-1 mb-4 rounded-lg bg-muted p-1">
        {(
          [
            ["exams", "Exam Schedule"],
            ["timetable", "Timetable Grid"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${tab === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "exams" && (
        <Panel
          title="Upcoming Exams"
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Exam
            </button>
          }
        >
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Exam</th>
                  <th className="pb-3 pr-4">Subject</th>
                  <th className="pb-3 pr-4">Grade</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3">Room</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e: any) => (
                  <tr key={e._id || e.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-medium">{e.name || e.title}</td>
                    <td className="py-3 pr-4">{e.subject?.name || e.subject}</td>
                    <td className="py-3 pr-4">{e.class?.name || e.grade}</td>
                    <td className="py-3 pr-4">{new Date(e.date || e.examDate).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {e.startTime}–{e.endTime}
                    </td>
                    <td className="py-3">{e.room || e.venue || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {exams.map((e: any) => (
              <div key={e._id || e.id} className="rounded-lg border border-border p-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">
                    {e.name || e.title} — {e.subject?.name || e.subject}
                  </span>
                  <span className="text-xs text-muted-foreground">{e.class?.name || e.grade}</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {new Date(e.date || e.examDate).toLocaleDateString()} · {e.startTime}–{e.endTime} · {e.room || e.venue || "—"}
                </div>
              </div>
            ))}
          </div>
          {exams.length === 0 && (
            <EmptyState
              icon={CalendarDays}
              title="No exams scheduled"
              description="Add an exam to get started."
            />
          )}
        </Panel>
      )}

      {tab === "timetable" && (
        <Panel title="Class Timetable — Grade 10-A">
          <EmptyState
            icon={CalendarDays}
            title="Timetable coming soon"
            description="Timetable data will be loaded from the backend API."
          />
        </Panel>
      )}

      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Schedule Exam</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                try {
                  await apiClient("/exams", {
                    method: "POST",
                    data: {
                      title: fd.get("name") as string,
                      subject: fd.get("subject") as string,
                      class: fd.get("grade") as string,
                      date: fd.get("date") as string,
                      startTime: fd.get("start") as string,
                      endTime: fd.get("end") as string,
                      room: fd.get("room") as string,
                    },
                  });
                  toast.success("Exam scheduled");
                  setShowAdd(false);
                  loadExams();
                } catch {
                  toast.error("Failed to schedule exam");
                }
              }}
              className="space-y-3"
            >
              {[
                ["name", "Exam Name"],
                ["subject", "Subject"],
                ["grade", "Grade"],
                ["date", "Date", "date"],
                ["start", "Start Time", "time"],
                ["end", "End Time", "time"],
                ["room", "Room"],
              ].map(([k, l, t]) => (
                <div key={k}>
                  <label className="mb-1 block text-sm font-medium">{l}</label>
                  <input
                    name={k}
                    type={t || "text"}
                    required
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Schedule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
