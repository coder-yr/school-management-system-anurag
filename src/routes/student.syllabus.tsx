import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/module-shell";
import { useStore } from "@/lib/store";
import { BookOpen, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/student/syllabus")({ component: Page });

function Page() {
  const { store } = useStore();
  const subjects = [
    ...new Set(store.syllabusModules.filter((m) => m.grade === "10").map((s) => s.subject)),
  ];

  return (
    <div>
      <PageHeader title="Syllabus" subtitle="Track curriculum progress across subjects" />
      <div className="space-y-4">
        {subjects.map((sub) => {
          const mods = store.syllabusModules.filter((m) => m.subject === sub && m.grade === "10");
          const done = mods.filter((m) => m.completed).length;
          return (
            <Panel
              key={sub}
              title={sub}
              action={
                <span className="text-xs text-muted-foreground">
                  {done}/{mods.length} units
                </span>
              }
            >
              <div className="mb-3">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(done / mods.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {mods.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${m.completed ? "border-[oklch(0.65_0.15_155)]/30 bg-[oklch(0.65_0.15_155)]/5" : "border-border"}`}
                  >
                    <div
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-md mt-0.5 ${m.completed ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-muted text-muted-foreground"}`}
                    >
                      {m.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <BookOpen className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{m.unit}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {m.topics.join(" · ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
