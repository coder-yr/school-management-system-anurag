import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Ticket,
  Image as ImageIcon,
  BookOpen,
  Plus,
  Users,
  Megaphone,
  UploadCloud,
} from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events & Culture · Campus OS" }] }),
  component: EventsPage,
});

function EventsPage() {
  const [tab, setTab] = useState<"events" | "gallery" | "magazine">("events");
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = async () => {
    try {
      const res = await apiClient<any>("/events");
      setEvents(res?.data || []);
    } catch (err) {
      toast.error("Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events & School Culture"
        subtitle="Publish school functions, manage parent RSVPs, and curate digital magazines."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming Events" value="2" icon={Calendar} tone="info" />
        <StatCard label="Total RSVPs (This Month)" value="1,270" icon={Ticket} tone="success" />
        <StatCard label="Gallery Uploads" value="340" icon={ImageIcon} tone="info" delta="Photos" />
        <StatCard
          label="Magazine Reads"
          value="8.5k"
          icon={BookOpen}
          tone="success"
          delta="Spring Edition"
        />
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 max-w-md">
        {(
          [
            ["events", "Event Scheduler", Calendar],
            ["gallery", "Photo Gallery", ImageIcon],
            ["magazine", "Digital Magazine", BookOpen],
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

      {tab === "events" && (
        <Panel
          title="Event Scheduler & Ticketing"
          action={
            <button className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
              <Plus className="h-3.5 w-3.5" /> Create Event
            </button>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {events.map((e) => (
              <div
                key={e._id}
                className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between hover:border-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent mb-2">
                      {e.type}
                    </span>
                    <h4 className="font-bold text-lg text-foreground leading-tight">{e.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(e.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                    <Megaphone className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-border pt-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Ticketing / Entry
                    </p>
                    <p className="text-sm font-bold">{e.tickets}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Current RSVPs
                    </p>
                    <p className="text-sm font-bold flex items-center gap-1.5 justify-end">
                      <Users className="h-4 w-4 text-emerald-500" /> {e.rsvpCount} Confirmed
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg text-xs font-semibold transition-colors">
                    Manage RSVP
                  </button>
                  <button className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent py-2 rounded-lg text-xs font-semibold transition-colors">
                    Volunteer Signup
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === "gallery" && (
        <Panel title="Event Photo Gallery">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-1/3 space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-6 w-6 text-accent" />
                </div>
                <p className="text-sm font-bold text-foreground">Upload Photos</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Drag & drop or click to select
                </p>
              </div>
              <div className="space-y-1 text-xs">
                <label className="font-semibold">Assign to Event</label>
                <select className="w-full rounded-lg border border-border bg-background p-2 outline-none focus:border-accent">
                  <option>Annual Science Fair</option>
                  <option>Spring Marathon</option>
                  <option>Convocation 2025</option>
                </select>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-muted relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="text-white text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      View Full
                    </button>
                  </div>
                  {/* Mock Image Placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 opacity-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {tab === "magazine" && (
        <Panel title="Digital School Magazine Publisher">
          <div className="flex items-center gap-6 p-6 rounded-xl border border-border bg-gradient-to-r from-muted/50 to-background shadow-inner">
            <div className="h-40 w-32 shrink-0 bg-white dark:bg-zinc-800 rounded shadow-md border-t-8 border-l-2 border-blue-600 flex flex-col items-center justify-center text-center p-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <BookOpen className="h-8 w-8 text-blue-500 mb-2" />
              <h3 className="font-serif font-bold text-[10px] uppercase">Spring Edition</h3>
              <p className="text-[8px] mt-1 text-muted-foreground">Vol. 12, Issue 3</p>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-xl">The Campus Chronicle (Spring)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                Publish the latest edition of the school's digital newsletter. Once published, it
                will appear in the Student and Parent feeds automatically.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => toast.success("Draft Saved")}
                  className="px-4 py-2 bg-muted text-foreground text-xs font-bold rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Edit Pages
                </button>
                <button
                  onClick={() =>
                    toast.success("Magazine Published Successfully", {
                      description: "Available now on student and parent apps.",
                    })
                  }
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Publish Now
                </button>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
