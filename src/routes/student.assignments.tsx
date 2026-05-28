import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Upload, CheckCircle, Clock } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/module-shell";
import { DEMO_STUDENT_ID } from "@/lib/demo-ids";
import { fetchHomeworkItems, submitHomeworkAssignment } from "@/lib/homework-api";

export const Route = createFileRoute("/student/assignments")({ component: Page });

function Page() {
  const [apiAssignments, setApiAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchHomeworkItems()
      .then((items) => {
        if (mounted) setApiAssignments(items || []);
      })
      .catch(() => {
        if (mounted) setApiAssignments([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const myAssignments = apiAssignments;

  const handleSubmit = async (assignmentId: string) => {
    try {
      await submitHomeworkAssignment(assignmentId, "Submitted from the web portal.");
      toast.success("Assignment submitted!", { description: "Your work has been uploaded." });
    } catch (error) {
      toast.error("Submission failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
    
    // Refresh list
    try {
      const items = await fetchHomeworkItems();
      setApiAssignments(items || []);
    } catch {}
  };

  return (
    <div>
      <PageHeader title="Assignments" subtitle="View, submit, and track your homework" />
      {loading && <div className="text-sm text-muted-foreground">Loading assignments…</div>}
      <div className="space-y-4">
        {myAssignments.map((a) => {
          const assignmentId = a._id || a.id;
          const mySub = a.submissions?.find((s: { studentId: string }) => s.studentId === DEMO_STUDENT_ID);
          return (
            <div key={assignmentId} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                      {a.subject || a.subjectId || "Homework"}
                    </span>
                    <span className="text-xs text-muted-foreground">· Due {a.dueDate || a.deadline || "TBD"}</span>
                  </div>
                  <div className="text-base font-semibold">{a.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{a.description}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {a.maxScore ? `Max Score: ${a.maxScore} · ` : ""}By {a.createdBy || "Teacher"}
                  </div>
                </div>
                <div className="shrink-0">
                  {mySub ? (
                    <div className="text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${mySub.status === "graded" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-accent/10 text-accent"}`}
                      >
                        {mySub.status === "graded" ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            {mySub.score ?? 0}/{a.maxScore ?? "—"}
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            Submitted
                          </>
                        )}
                      </span>
                      {mySub.feedback && (
                        <div className="mt-2 text-xs text-muted-foreground max-w-[200px]">
                          "{mySub.feedback}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubmit(assignmentId)}
                      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
                    >
                      <Upload className="h-4 w-4" />
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {myAssignments.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="No assignments"
            description="You're all caught up!"
          />
        )}
      </div>
    </div>
  );
}
