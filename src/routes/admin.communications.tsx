import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Mail, Bell, Plus, X, Send, LifeBuoy, Megaphone } from "lucide-react";
import { PageHeader, StatCard, Panel, EmptyState } from "@/components/module-shell";
import { useStore, genId } from "@/lib/store";

export const Route = createFileRoute("/admin/communications")({
  head: () => ({ meta: [{ title: "Communications · Campus OS" }] }),
  component: Page,
});

function Page() {
  const { store, dispatch } = useStore();
  const [tab, setTab] = useState<"notices" | "broadcast" | "tickets">("notices");
  const [showAdd, setShowAdd] = useState(false);
  const [broadcastType, setBroadcastType] = useState<"sms" | "email">("sms");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all");

  return (
    <div>
      <PageHeader title="Communications" subtitle="Notices, broadcasts, and IT support" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Announcements"
          value={String(store.announcements.length)}
          icon={Megaphone}
          tone="info"
        />
        <StatCard
          label="Open Tickets"
          value={String(store.supportTickets.filter((t) => t.status === "open").length)}
          icon={LifeBuoy}
          tone="warning"
        />
        <StatCard label="SMS Sent Today" value="142" icon={MessageSquare} tone="success" />
        <StatCard label="Emails Queued" value="28" icon={Mail} />
      </div>

      <div className="flex gap-1 mb-4 rounded-lg bg-muted p-1">
        {(
          [
            ["notices", "Notice Board"],
            ["broadcast", "Broadcast"],
            ["tickets", "IT Help Desk"],
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

      {tab === "notices" && (
        <Panel
          title="Announcements"
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Post Notice
            </button>
          }
        >
          <div className="space-y-3">
            {store.announcements.map((a) => (
              <div
                key={a.id}
                className={`rounded-lg border p-4 ${a.priority === "urgent" ? "border-destructive/50 bg-destructive/5" : a.priority === "important" ? "border-accent/30 bg-accent/5" : "border-border"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{a.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${a.priority === "urgent" ? "bg-destructive/10 text-destructive" : a.priority === "important" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}
                      >
                        {a.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {a.author} · {a.date} · {a.target}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      dispatch({ type: "DELETE_ANNOUNCEMENT", payload: a.id });
                      toast.success("Notice removed");
                    }}
                    className="text-xs text-destructive hover:underline shrink-0"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          {store.announcements.length === 0 && (
            <EmptyState
              icon={Megaphone}
              title="No announcements"
              description="Post a notice to get started."
            />
          )}
        </Panel>
      )}

      {tab === "broadcast" && (
        <Panel title="Send Broadcast">
          <div className="max-w-lg space-y-4">
            <div className="flex gap-2">
              {(["sms", "email"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setBroadcastType(t)}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${broadcastType === t ? "border-accent bg-accent/10 text-accent" : "border-border hover:bg-muted"}`}
                >
                  {t === "sms" ? "📱 SMS" : "📧 Email"}
                </button>
              ))}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Target Audience</label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="students">Students Only</option>
                <option value="teachers">Teachers Only</option>
                <option value="staff">Staff Only</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Message</label>
              <textarea
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                placeholder="Type your message…"
              />
            </div>
            <button
              onClick={() => {
                if (!broadcastMsg.trim()) return;
                toast.success(`${broadcastType.toUpperCase()} sent!`, {
                  description: `Message broadcast to ${broadcastTarget}.`,
                });
                setBroadcastMsg("");
              }}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Send className="h-4 w-4" />
              Send {broadcastType.toUpperCase()}
            </button>
          </div>
        </Panel>
      )}

      {tab === "tickets" && (
        <Panel title="IT Help Desk">
          <div className="space-y-3">
            {store.supportTickets.map((t) => (
              <div key={t.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="font-medium text-sm">{t.title}</span>
                    <div className="text-xs text-muted-foreground">
                      {t.submittedBy} · {t.category} · {t.createdAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.priority === "high" ? "bg-destructive/10 text-destructive" : t.priority === "medium" ? "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]" : "bg-muted text-muted-foreground"}`}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.status === "open" ? "bg-accent/10 text-accent" : t.status === "resolved" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]"}`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{t.description}</p>
                {t.responses.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {t.responses.map((r, i) => (
                      <div key={i} className="rounded-md bg-muted p-2 text-xs">
                        <span className="font-medium">{r.author}:</span> {r.message}
                      </div>
                    ))}
                  </div>
                )}
                {t.status !== "resolved" && t.status !== "closed" && (
                  <button
                    onClick={() => {
                      dispatch({
                        type: "UPDATE_SUPPORT_TICKET",
                        payload: { id: t.id, updates: { status: "resolved" } },
                      });
                      toast.success("Ticket resolved");
                    }}
                    className="mt-3 rounded-lg bg-[oklch(0.65_0.15_155)]/15 px-3 py-1.5 text-xs font-medium text-[oklch(0.45_0.15_155)] hover:bg-[oklch(0.65_0.15_155)]/25 transition-all active:scale-95"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
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
              <h2 className="text-lg font-semibold">Post Notice</h2>
              <button
                onClick={() => setShowAdd(false)}
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
                  type: "ADD_ANNOUNCEMENT",
                  payload: {
                    id: genId(),
                    title: fd.get("title") as string,
                    content: fd.get("content") as string,
                    author: "Admin",
                    date: new Date().toISOString().split("T")[0],
                    target: fd.get("target") as "all",
                    priority: fd.get("priority") as "normal",
                  },
                });
                toast.success("Notice posted");
                setShowAdd(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                  name="title"
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Content</label>
                <textarea
                  name="content"
                  required
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none resize-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Target</label>
                  <select
                    name="target"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="students">Students</option>
                    <option value="teachers">Teachers</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Priority</label>
                  <select
                    name="priority"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Post Notice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
