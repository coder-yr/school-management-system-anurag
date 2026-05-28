import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Trophy,
  Users,
  Calendar,
  Medal,
  Activity,
  Plus,
  Swords,
  Dumbbell,
  Clock,
} from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";

export const Route = createFileRoute("/admin/sports")({
  head: () => ({ meta: [{ title: "Sports & Extracurriculars · Campus OS" }] }),
  component: SportsPage,
});

function SportsPage() {
  const [tab, setTab] = useState<"teams" | "tournaments" | "enrollment">("teams");

  const teams = [
    {
      id: "t1",
      name: "Varsity Basketball",
      coach: "Mr. Sharma",
      members: 15,
      nextMatch: "vs St. Jude (Tomorrow)",
      status: "Active",
    },
    {
      id: "t2",
      name: "Junior Soccer (U-14)",
      coach: "Mr. D'Souza",
      members: 22,
      nextMatch: "vs City High (May 30)",
      status: "Active",
    },
    {
      id: "t3",
      name: "Track & Field",
      coach: "Ms. Iyer",
      members: 30,
      nextMatch: "State Qualifiers (June 5)",
      status: "Training",
    },
  ];

  const tournaments = [
    {
      id: "tm1",
      name: "Inter-School Basketball Cup",
      date: "May 27 - May 29",
      teams: 8,
      location: "Main Campus Indoor Court",
    },
    {
      id: "tm2",
      name: "City High Soccer League",
      date: "May 30 - June 15",
      teams: 12,
      location: "City Sports Complex",
    },
  ];

  const activities = [
    { id: "a1", name: "Debate Club", instructor: "Mrs. Gupta", enrolled: 45, max: 50 },
    { id: "a2", name: "Robotics & AI", instructor: "Mr. Nair", enrolled: 30, max: 30 },
    { id: "a3", name: "Classical Music", instructor: "Ms. Pandit", enrolled: 18, max: 25 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sports & Extracurriculars"
        subtitle="Manage teams, coach assignments, tournaments, and student activity enrollments."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Sports Teams" value="12" icon={Dumbbell} tone="info" />
        <StatCard label="Upcoming Matches" value="5" icon={Swords} tone="warning" />
        <StatCard label="Trophies Won (Year)" value="8" icon={Trophy} tone="success" />
        <StatCard
          label="Students Enrolled"
          value="450"
          icon={Activity}
          tone="success"
          delta="In Extracurriculars"
        />
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 max-w-md">
        {(
          [
            ["teams", "Teams & Coaches", Users],
            ["tournaments", "Match Schedule", Calendar],
            ["enrollment", "Activity Enrollment", Medal],
          ] as const
        ).map(([k, l, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k as any)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all ${
              tab === k
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {l}
          </button>
        ))}
      </div>

      {tab === "teams" && (
        <Panel
          title="Sports Teams & Coach Assignments"
          action={
            <button className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
              <Plus className="h-3.5 w-3.5" /> New Team
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-foreground text-base">{team.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Coach: {team.coach}</p>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-medium bg-muted/50 p-2 rounded-lg">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4 text-foreground" /> {team.members} Members
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full ${team.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"}`}
                  >
                    {team.status}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground pt-2 border-t border-border flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Swords className="h-3.5 w-3.5 text-destructive" /> Next Match:
                  </span>
                  {team.nextMatch}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === "tournaments" && (
        <Panel
          title="Tournament & Match Calendar"
          action={
            <button className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
              <Plus className="h-3.5 w-3.5" /> Schedule Match
            </button>
          }
        >
          <div className="space-y-4">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm gap-4 hover:border-accent transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{t.name}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Clock className="h-3.5 w-3.5" /> {t.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="text-right">
                    <div className="text-foreground">{t.location}</div>
                    <div className="text-muted-foreground">{t.teams} Teams Competing</div>
                  </div>
                  <button className="h-8 px-4 rounded-lg bg-accent text-white font-semibold text-[10px] hover:bg-accent/90 transition-all uppercase tracking-wider">
                    View Bracket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === "enrollment" && (
        <Panel title="Extracurricular Activity Enrollment">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((a) => {
              const isFull = a.enrolled >= a.max;
              return (
                <div key={a.id} className="p-4 rounded-xl border border-border bg-card shadow-sm">
                  <h4 className="font-bold text-foreground mb-1">{a.name}</h4>
                  <p className="text-xs text-muted-foreground mb-4">Instructor: {a.instructor}</p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Enrollment</span>
                      <span className={isFull ? "text-destructive" : "text-foreground"}>
                        {a.enrolled} / {a.max}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isFull ? "bg-destructive" : "bg-emerald-500"}`}
                        style={{ width: `${(a.enrolled / a.max) * 100}%` }}
                      />
                    </div>
                  </div>

                  <button
                    disabled={isFull}
                    className="w-full h-8 rounded-lg bg-muted text-foreground text-xs font-bold disabled:opacity-50 hover:bg-accent hover:text-white transition-all uppercase tracking-wider"
                  >
                    {isFull ? "Waitlist Full" : "Manage Roster"}
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
