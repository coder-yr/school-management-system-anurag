import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, MessageSquare, Mail, Smartphone, Check } from "lucide-react";
import { PageHeader, Panel } from "@/components/module-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/student/notifications")({ component: Page });

const notifications = [
  {
    id: "n1",
    title: "Fee Payment Reminder",
    body: "Your fee payment of ₹12,400 is due by June 5.",
    time: "2h ago",
    channel: "app",
    read: false,
    priority: "high",
  },
  {
    id: "n2",
    title: "Assignment Due Tomorrow",
    body: "Quadratic Equations Set 4 is due tomorrow.",
    time: "5h ago",
    channel: "app",
    read: false,
    priority: "medium",
  },
  {
    id: "n3",
    title: "PTM Scheduled",
    body: "Parent-Teacher Meeting on May 22.",
    time: "1d ago",
    channel: "sms",
    read: true,
    priority: "normal",
  },
  {
    id: "n4",
    title: "Sports Day Registration",
    body: "Register for Annual Sports Day by May 20.",
    time: "2d ago",
    channel: "email",
    read: true,
    priority: "normal",
  },
  {
    id: "n5",
    title: "Library Book Overdue",
    body: "Calculus: Early Transcendentals is overdue.",
    time: "3d ago",
    channel: "app",
    read: false,
    priority: "high",
  },
];

function Page() {
  const [filter, setFilter] = useState<"all" | "app" | "sms" | "email">("all");
  const [readSet, setReadSet] = useState<Set<string>>(
    new Set(notifications.filter((n) => n.read).map((n) => n.id)),
  );

  const filtered = notifications.filter((n) => filter === "all" || n.channel === filter);
  const channelIcon = { app: Smartphone, sms: MessageSquare, email: Mail };

  const markRead = (id: string) => {
    setReadSet((prev) => new Set([...prev, id]));
    toast.success("Marked as read");
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${notifications.filter((n) => !readSet.has(n.id)).length} unread`}
      />
      <div className="flex gap-2 mb-4">
        {(["all", "app", "sms", "email"] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => setFilter(ch)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${filter === ch ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}
          >
            {ch === "all" ? "All" : ch.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="max-w-2xl space-y-3">
        {filtered.map((n) => {
          const Icon = channelIcon[n.channel as keyof typeof channelIcon] || Bell;
          const isRead = readSet.has(n.id);
          return (
            <div
              key={n.id}
              className={`rounded-xl border p-4 shadow-sm transition-all ${!isRead ? "border-accent/30 bg-accent/5" : "border-border bg-card"}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${n.priority === "high" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${!isRead ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {n.title}
                    </span>
                    {!isRead && <span className="h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {n.time} · via {n.channel}
                  </div>
                </div>
                {!isRead && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border hover:bg-muted"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
