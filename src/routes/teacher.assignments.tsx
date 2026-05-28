import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, FileText, Eye, CheckCircle, Clock } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/module-shell";
import { useStore, genId } from "@/lib/store";

export const Route = createFileRoute("/teacher/assignments")({ component: Page });

function Page() {
  const { store, dispatch } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const myAssignments = store.assignments.filter(
    (a) =>
      a.createdBy === "Anita Iyer" ||
      a.createdBy === "Rajesh Rao" ||
      a.createdBy === "Sunita Singh",
  );
  const viewing = myAssignments.find((a) => a.id === viewId);

  const handleGrade = (assignmentId: string, submissionId: string, score: number) => {
    dispatch({
      type: "GRADE_SUBMISSION",
      payload: { assignmentId, submissionId, score, feedback: "Good work!" },
    });
    toast.success("Submission graded");
  };

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Create, review, and grade student work"
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {myAssignments.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                {a.subject}
              </span>
              <span className="text-xs text-muted-foreground">Due {a.dueDate}</span>
            </div>
            <div className="text-base font-semibold mb-1">{a.title}</div>
            <div className="text-sm text-muted-foreground mb-3">{a.description}</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{a.submissions.length} submissions</span>
                <span>{a.submissions.filter((s) => s.status === "graded").length} graded</span>
              </div>
              <button
                onClick={() => setViewId(a.id)}
                className="flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <Eye className="h-3.5 w-3.5" />
                Review
              </button>
            </div>
          </div>
        ))}
        {myAssignments.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No assignments"
            description="Create your first assignment."
          />
        )}
      </div>

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Submissions — {viewing.title}</h2>
              <button
                onClick={() => setViewId(null)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {viewing.submissions.length > 0 ? (
              <div className="space-y-3">
                {viewing.submissions.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{s.studentName}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "graded" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-accent/10 text-accent"}`}
                      >
                        {s.status === "graded" ? `${s.score}/${viewing.maxScore}` : "Pending"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.submittedAt || "Not yet"}
                      {s.files.length > 0 ? ` · ${s.files.join(", ")}` : ""}
                    </div>
                    {s.status !== "graded" && (
                      <div className="mt-2 flex gap-2">
                        {[
                          viewing.maxScore,
                          Math.round(viewing.maxScore * 0.8),
                          Math.round(viewing.maxScore * 0.6),
                        ].map((score) => (
                          <button
                            key={score}
                            onClick={() => handleGrade(viewing.id, s.id, score)}
                            className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted transition-all"
                          >
                            {score}/{viewing.maxScore}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Clock}
                title="No submissions yet"
                description="Students haven't submitted work."
              />
            )}
          </div>
        </div>
      )}

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Assignment</h2>
              <button
                onClick={() => setShowCreate(false)}
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
                  type: "ADD_ASSIGNMENT",
                  payload: {
                    id: genId(),
                    title: fd.get("title") as string,
                    subject: fd.get("subject") as string,
                    grade: "10",
                    description: fd.get("desc") as string,
                    dueDate: fd.get("due") as string,
                    createdBy: "Anita Iyer",
                    attachments: [],
                    maxScore: Number(fd.get("score")),
                    submissions: [],
                  },
                });
                toast.success("Assignment created");
                setShowCreate(false);
              }}
              className="space-y-3"
            >
              {[
                ["title", "Title"],
                ["subject", "Subject"],
                ["desc", "Description"],
                ["due", "Due Date", "date"],
                ["score", "Max Score", "number"],
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
                Create
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
