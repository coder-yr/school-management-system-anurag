import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, GraduationCap, PartyPopper, Sun, Clock } from "lucide-react";
import { PageHeader, Panel } from "@/components/module-shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/student/calendar")({ component: Page });

const typeConfig = {
  exam: { icon: GraduationCap, color: "bg-destructive/10 text-destructive" },
  event: { icon: PartyPopper, color: "bg-accent/10 text-accent" },
  holiday: { icon: Sun, color: "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]" },
  deadline: { icon: Clock, color: "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" },
};

function Page() {
  const { store } = useStore();
  const [month] = useState(4); // May = 4
  const events = store.calendarEvents;
  const daysInMonth = 31;
  const firstDay = 3; // May 2025 starts on Thursday

  const getEventsForDay = (day: number) => {
    const dateStr = `2025-05-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  return (
    <div>
      <PageHeader
        title="Calendar & Events"
        subtitle="Upcoming exams, events, and important dates"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="May 2025">
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = day === 14;
                return (
                  <div
                    key={day}
                    className={`rounded-lg p-1.5 min-h-[60px] text-xs border transition-all ${isToday ? "border-accent bg-accent/5" : dayEvents.length > 0 ? "border-border bg-card" : "border-transparent"}`}
                  >
                    <div className={`font-medium mb-0.5 ${isToday ? "text-accent" : ""}`}>
                      {day}
                    </div>
                    {dayEvents.slice(0, 2).map((e) => {
                      const cfg = typeConfig[e.type];
                      return (
                        <div
                          key={e.id}
                          className={`rounded px-1 py-0.5 text-[9px] truncate mt-0.5 ${cfg.color}`}
                        >
                          {e.title}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
        <Panel title="Upcoming">
          <div className="space-y-3">
            {events
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((e) => {
                const cfg = typeConfig[e.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={e.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${cfg.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.date} · {e.description}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
