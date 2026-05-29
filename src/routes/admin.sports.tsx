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

import { useEffect } from "react";
import { fetchSportsTeams, fetchTournaments, fetchActivities, createTeam, createTournament } from "@/lib/sports-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/sports")({
  head: () => ({ meta: [{ title: "Sports & Extracurriculars · Campus OS" }] }),
  component: SportsPage,
});

function SportsPage() {
  const [tab, setTab] = useState<"teams" | "tournaments" | "enrollment">("teams");
  
  const [teams, setTeams] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddMatch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name"),
      date: fd.get("date"),
      location: fd.get("location"),
      teams: Number(fd.get("teams")),
    };
    try {
      await createTournament(data);
      toast.success("Match scheduled successfully");
      setIsMatchModalOpen(false);
      const newMatches = await fetchTournaments();
      setTournaments(newMatches);
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule match");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name"),
      coach: fd.get("coach"),
      members: Number(fd.get("members")),
      status: fd.get("status"),
      nextMatch: fd.get("nextMatch") || "TBD"
    };
    try {
      await createTeam(data);
      toast.success("Team added successfully");
      setIsTeamModalOpen(false);
      const newTeams = await fetchSportsTeams();
      setTeams(newTeams);
    } catch (err: any) {
      toast.error(err.message || "Failed to add team");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    fetchSportsTeams().then(setTeams).catch(console.error);
    fetchTournaments().then(setTournaments).catch(console.error);
    fetchActivities().then(setActivities).catch(console.error);
  }, []);

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
            <button onClick={() => setIsTeamModalOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
              <Plus className="h-3.5 w-3.5" /> New Team
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team._id}
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
            <button onClick={() => setIsMatchModalOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
              <Plus className="h-3.5 w-3.5" /> Schedule Match
            </button>
          }
        >
          <div className="space-y-4">
            {tournaments.map((t) => (
              <div
                key={t._id}
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
                <div key={a._id} className="p-4 rounded-xl border border-border bg-card shadow-sm">
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

      <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTeam} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input id="name" name="name" required placeholder="e.g. Varsity Basketball" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coach">Coach Name</Label>
              <Input id="coach" name="coach" required placeholder="e.g. John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="members">Members Count</Label>
                <Input id="members" name="members" type="number" min="1" required placeholder="15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextMatch">Next Match (Optional)</Label>
              <Input id="nextMatch" name="nextMatch" placeholder="e.g. vs Oakridge High - Oct 12" />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsTeamModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isMatchModalOpen} onOpenChange={setIsMatchModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Match</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMatch} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament / Match Name</Label>
              <Input id="match-name" name="name" required placeholder="e.g. Inter-school Basketball Finals" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input id="date" name="date" required placeholder="e.g. Oct 15, 2024 at 10:00 AM" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" required placeholder="Main Stadium" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teams">Number of Teams</Label>
                <Input id="teams" name="teams" type="number" min="2" required placeholder="2" />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsMatchModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Match"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
