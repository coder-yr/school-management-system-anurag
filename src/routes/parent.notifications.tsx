import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  MessageSquare,
  Plus,
  X,
  Volume2,
  AlertTriangle,
  LifeBuoy,
  CheckCircle,
  Clock,
} from "lucide-react";
import { PageHeader, StatCard, Panel, EmptyState } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/parent/notifications")({
  component: ParentNotifications,
});

interface Ticket {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "open" | "in-progress" | "resolved";
  createdAt: string;
}

function ParentNotifications() {
  const [activeChild, setActiveChild] = useState<"aarav" | "ananya">("aarav");
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [liveAnnouncements, setLiveAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    apiClient<any>("/notifications/announcements")
      .then((res) => setLiveAnnouncements(res?.data || []))
      .catch(() => {});
  }, []);

  // Sync active child state
  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem("parent_active_child") as "aarav" | "ananya";
      if (stored) setActiveChild(stored);
    };
    handleSync();
    window.addEventListener("activeChildChanged", handleSync);
    return () => window.removeEventListener("activeChildChanged", handleSync);
  }, []);

  const activeChildName = activeChild === "aarav" ? "Aarav Sharma" : "Ananya Sharma";

  // Merge live + static alerts
  const alertsFeed = [
    ...liveAnnouncements.slice(0, 3).map((a: any) => ({
      id: a.id,
      title: a.title,
      body: a.content,
      time: new Date(a.date).toLocaleDateString(),
      type: "info" as const,
    })),
    {
      id: "al-static-1",
      title: "School Bus Delay: Route R-12",
      body: "Route R-12 is running 10 minutes late today due to heavy freeway traffic. Apologies for the inconvenience.",
      time: "20 min ago",
      type: "warning" as const,
    },
  ];

  // Notices board — show live announcements
  const noticeBoard = liveAnnouncements.length
    ? liveAnnouncements.map((a: any) => ({
        title: a.title,
        content: a.content,
        date: a.date,
        author: a.author,
      }))
    : [
        {
          title: "Campus Closure: Summer Vacation Term",
          content:
            "School campus operations will be suspended starting June 15 for the summer recess. Fall term reopens August 10.",
          date: "May 14",
          author: "Principal Menon",
        },
        {
          title: "Annual Science Fair Participation",
          content:
            "Registrations are open for the junior scientist science fair projects. Contact science HOD Rao.",
          date: "May 12",
          author: "Academic Dean",
        },
      ];

  const handleCreateTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newTicket: Ticket = {
      id: "TCK-" + Math.floor(100 + Math.random() * 900),
      title: fd.get("title") as string,
      category: fd.get("category") as string,
      description: fd.get("description") as string,
      status: "open",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTickets([newTicket, ...tickets]);
    setShowTicketModal(false);
    toast.success("Helpdesk support ticket submitted successfully!", {
      description: "Admin support officers have been alerted.",
    });
  };

  return (
    <div>
      <PageHeader
        title="Alerts, Notices & Helpdesk Support"
        subtitle={`Review broadcast notices, system warnings, and log helpdesk assistance tickets for ${activeChildName}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <StatCard
          label="Broadcast Notices"
          value={String(noticeBoard.length)}
          icon={Volume2}
          tone="info"
        />
        <StatCard label="Critical Alerts" value={String(alertsFeed.length)} icon={AlertTriangle} tone="warning" />
        <StatCard
          label="Support Tickets"
          value={String(tickets.length)}
          icon={LifeBuoy}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Feed and Notice Board */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Alerts Feed */}
          <Panel title="Instant Critical System Warnings">
            <div className="space-y-3">
              {alertsFeed.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-4 flex gap-3.5 items-start ${
                    alert.type === "warning"
                      ? "border-destructive/40 bg-destructive/5"
                      : alert.type === "info"
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-accent/40 bg-accent/5"
                  }`}
                >
                  <Bell
                    className={`h-5 w-5 shrink-0 ${alert.type === "warning" ? "text-destructive" : "text-accent"}`}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{alert.title}</span>
                      <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{alert.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* School Notice Board */}
          <Panel title="Pinned Notice Board Announcements">
            <div className="space-y-4">
              {noticeBoard.map((notice, i) => (
                <div key={i} className="rounded-xl border border-border p-4 bg-card/70 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-foreground">{notice.title}</h3>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {notice.date}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notice.content}</p>
                  <div className="text-[10px] font-bold text-accent uppercase tracking-wider">
                    Published by: {notice.author}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Support Helpdesk Ticket Flow */}
        <div>
          <Panel
            title="Helpdesk Support Tickets"
            action={
              <button
                onClick={() => setShowTicketModal(true)}
                className="flex items-center gap-1 text-xs text-accent hover:underline font-semibold"
              >
                <Plus className="h-4 w-4" />
                Submit Ticket
              </button>
            }
          >
            <div className="space-y-3.5">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border bg-card/80 p-3.5 space-y-1.5 shadow-sm"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground bg-muted border px-2 py-0.5 rounded">
                      {t.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        t.status === "resolved"
                          ? "bg-green-100 text-green-700"
                          : t.status === "in-progress"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-foreground leading-snug">{t.title}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                    {t.category}
                  </div>
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                    "{t.description}"
                  </p>
                  <div className="text-[9px] text-muted-foreground border-t border-border pt-1.5 mt-1">
                    Submitted on: {t.createdAt}
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <EmptyState
                  icon={LifeBuoy}
                  title="No Active Support Tickets"
                  description="Log technical, hostel, or billing queries directly to our resolving admins."
                />
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* Submit Ticket Modal */}
      {showTicketModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowTicketModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-foreground">Log Support Helpdesk Ticket</h2>
              <button
                onClick={() => setShowTicketModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Issue Category Department</label>
                <select
                  name="category"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
                >
                  <option value="Billing & Finance">Billing & Finance (Accountant Desk)</option>
                  <option value="Transport Operations">Transport Operations (Logistics HOD)</option>
                  <option value="Library Circulation">Library Circulation (Librarian Desk)</option>
                  <option value="Hostel Utilities">Hostel & Mess Utilities (Hostel Warden)</option>
                  <option value="LMS Software Issues">LMS Software Technical Support</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Brief Summary of Issue</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Incomplete sibling discount credit"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Detailed Description</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe your issue in detail. Add sibling roll numbers if billing-related..."
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow active:scale-95 transition-all text-xs"
              >
                File Helpdesk Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
