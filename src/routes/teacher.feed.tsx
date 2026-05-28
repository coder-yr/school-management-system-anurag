import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/module-shell";
import { useStore, genId } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { toast } from "sonner";
import { Megaphone, Calendar, Send, Award, CalendarClock, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/teacher/feed")({
  head: () => ({ meta: [{ title: "Campus Feed · Campus OS" }] }),
  component: Page,
});

function Page() {
  const { store, dispatch } = useStore();
  const { user } = useAuth();
  const [quickPost, setQuickPost] = useState("");

  const visible = store.announcements.filter((a) => a.target === "all" || a.target === "teachers");

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPost.trim()) return;

    const newAnnouncement = {
      id: genId(),
      title: "Teacher Quick Update",
      content: quickPost,
      author: user?.name || "Anita Iyer",
      date: new Date().toISOString().split("T")[0],
      target: "all" as const,
      priority: "normal" as const,
    };

    dispatch({ type: "ADD_ANNOUNCEMENT", payload: newAnnouncement });
    toast.success("Post shared to public feed!");
    setQuickPost("");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Feed" subtitle="Browse campus-wide announcements and faculty bulletins." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Post Box */}
          <Panel title="Share something with the School">
            <form onSubmit={handleQuickSubmit} className="mt-2 space-y-3">
              <textarea
                value={quickPost}
                onChange={(e) => setQuickPost(e.target.value)}
                placeholder="What's happening in your classroom today? Share an update, event, or reminder..."
                rows={3}
                className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!quickPost.trim()}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Post Update
                </button>
              </div>
            </form>
          </Panel>

          {/* Feed Posts */}
          <div className="space-y-4">
            {visible.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
                  a.priority === "urgent"
                    ? "border-destructive/40 bg-destructive/5"
                    : a.priority === "important"
                      ? "border-accent/30 bg-accent/5"
                      : "border-border bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                      a.priority === "urgent"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-base text-foreground">{a.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          a.priority === "urgent"
                            ? "bg-destructive/10 text-destructive"
                            : a.priority === "important"
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {a.priority}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                      {a.content}
                    </p>
                    <div className="mt-4 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {a.date}
                      </span>
                      <span>By {a.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {visible.length === 0 && (
              <Panel title="Feed Empty">
                <p className="text-sm text-muted-foreground">
                  No announcements found at this time.
                </p>
              </Panel>
            )}
          </div>
        </div>

        {/* Right Info Widgets Column */}
        <div className="lg:col-span-1 space-y-4">
          <Panel title="Upcoming School Events">
            <div className="space-y-3 mt-2">
              <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3 border border-border">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Science Exhibition</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    May 24, 2026 • Main Hall
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3 border border-border">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Annual Sports Day</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    June 02, 2026 • Campus Grounds
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Faculty Announcements">
            <div className="space-y-3 mt-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-accent" />
                  Staff Meeting
                </span>
                <span className="text-[10px] text-muted-foreground">Today</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                A brief staff meeting will be held today at 4:00 PM in the Conference Room.
                Attendance is mandatory.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
