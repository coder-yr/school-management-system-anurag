import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/module-shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/student/timetable")({ component: Page });

function Page() {
  const { store } = useStore();
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const entries = store.timetableEntries.filter((t) => t.grade === "10" && t.section === "A");
  const times = [...new Set(entries.map((t) => t.time))].sort();

  return (
    <div>
      <PageHeader title="Timetable" subtitle="Your weekly class schedule" />
      {/* Desktop grid */}
      <div className="hidden md:block">
        <Panel title="Weekly Schedule">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border border-border p-2.5 bg-muted text-xs text-muted-foreground">
                    Time
                  </th>
                  {days.map((d) => (
                    <th
                      key={d}
                      className="border border-border p-2.5 bg-muted text-xs text-muted-foreground"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {times.map((time) => (
                  <tr key={time}>
                    <td className="border border-border p-2.5 font-semibold text-accent text-xs">
                      {time}
                    </td>
                    {days.map((day) => {
                      const e = entries.find((t) => t.day === day && t.time === time);
                      return (
                        <td key={day} className="border border-border p-2.5">
                          {e ? (
                            <div>
                              <div className="text-sm font-medium">{e.subject}</div>
                              <div className="text-xs text-muted-foreground">
                                {e.teacher} · {e.room}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      {/* Mobile list */}
      <div className="md:hidden space-y-4">
        {days.map((day) => {
          const dayEntries = entries
            .filter((e) => e.day === day)
            .sort((a, b) => a.time.localeCompare(b.time));
          if (dayEntries.length === 0) return null;
          return (
            <Panel key={day} title={day}>
              <div className="space-y-2">
                {dayEntries.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="text-sm font-semibold text-accent w-14 shrink-0">{e.time}</div>
                    <div>
                      <div className="text-sm font-medium">{e.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.teacher} · Room {e.room}
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
