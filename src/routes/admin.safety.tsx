import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ShieldAlert,
  Radio,
  Flame,
  AlertTriangle,
  Siren,
  Camera,
  Lock,
  Unlock,
  Shield,
  PhoneCall,
  BellRing,
} from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";

export const Route = createFileRoute("/admin/safety")({
  head: () => ({ meta: [{ title: "Safety & Emergency · Campus OS" }] }),
  component: SafetyPage,
});

function SafetyPage() {
  const [lockdown, setLockdown] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const handleBroadcast = () => {
    if (!broadcastMessage) {
      toast.error("Message required");
      return;
    }
    toast.error(`EMERGENCY BROADCAST SENT!`, {
      description: "Push notifications and SMS dispatched to all registered parents instantly.",
    });
    setBroadcastMessage("");
  };

  const toggleLockdown = () => {
    setLockdown(!lockdown);
    if (!lockdown) {
      toast.error("SYSTEM LOCKDOWN INITIATED", {
        description: "All electronic gates locked. Security alerted. Campus is in lockdown mode.",
      });
    } else {
      toast.success("LOCKDOWN LIFTED", {
        description: "Normal campus operations have resumed.",
      });
    }
  };

  return (
    <div className={`space-y-6 transition-colors duration-1000 ${lockdown ? "bg-red-950/20" : ""}`}>
      {lockdown && (
        <div className="rounded-lg bg-red-600 p-3 text-center text-white font-bold animate-pulse flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 mb-6 border border-red-500">
          <Siren className="h-5 w-5" />
          ACTIVE CAMPUS LOCKDOWN IN EFFECT
          <Siren className="h-5 w-5" />
        </div>
      )}

      <PageHeader
        title="Safety & Emergency Response"
        subtitle="Manage SOS alerts, initiate broadcasts, and trigger campus-wide security protocols."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Campus Status"
          value={lockdown ? "LOCKDOWN" : "SECURE"}
          icon={lockdown ? Lock : Shield}
          tone={lockdown ? "warning" : "success"}
        />
        <StatCard label="SOS Alerts (Today)" value="0" icon={ShieldAlert} tone="success" />
        <StatCard label="Next Fire Drill" value="Oct 15" icon={Flame} tone="info" />
        <StatCard label="Active CCTV Cams" value="124" icon={Camera} tone="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: EMERGENCY BROADCAST */}
        <Panel
          title="Priority Emergency Broadcast"
          action={<Radio className="h-4 w-4 text-red-500 animate-pulse" />}
        >
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use this tool ONLY for critical emergencies. Messages are instantly sent to all
              parents, staff, and students via Push Notification, SMS, and Email, overriding
              Do-Not-Disturb settings.
            </p>
            <textarea
              rows={3}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-foreground outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-red-500/40"
              placeholder="Enter critical broadcast message..."
            />
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setBroadcastMessage(
                    "ALERT: Campus closed due to severe weather. Please arrange pickup immediately.",
                  )
                }
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-muted hover:bg-muted/80 rounded"
              >
                Weather Alert
              </button>
              <button
                onClick={() =>
                  setBroadcastMessage(
                    "ALERT: School buses are delayed by 45 minutes due to heavy traffic on Route 9.",
                  )
                }
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-muted hover:bg-muted/80 rounded"
              >
                Bus Delay
              </button>
            </div>
            <button
              onClick={handleBroadcast}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
            >
              <BellRing className="h-4 w-4" />
              Transmit Emergency Broadcast
            </button>
          </div>
        </Panel>

        {/* PANEL 2: CAMPUS LOCKDOWN */}
        <Panel title="Extreme Measures: Campus Lockdown">
          <div className="flex flex-col h-full justify-center items-center text-center p-6 border-2 border-dashed border-red-500/30 rounded-xl bg-red-500/5">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-red-500/20 text-red-600 mb-4 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              <Lock className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Initiate Full Lockdown</h3>
            <p className="text-xs text-muted-foreground mb-6 max-w-sm leading-relaxed">
              This will lock all electronic doors, secure the perimeter, alert local law
              enforcement, and restrict movement. This action is logged.
            </p>
            <button
              onClick={toggleLockdown}
              className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-widest transition-all ${
                lockdown
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
              }`}
            >
              {lockdown ? "LIFT LOCKDOWN" : "TRIGGER LOCKDOWN ALARM"}
            </button>
          </div>
        </Panel>

        {/* PANEL 3: CCTV INTEGRATION */}
        <Panel title="CCTV Live Feed Monitor">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 1, label: "Main Gate Entry", active: true },
              { id: 2, label: "Cafeteria Hall", active: true },
              { id: 3, label: "Playground Zone", active: true },
              { id: 4, label: "Rear Exit / Parking", active: false },
            ].map((cam) => (
              <div
                key={cam.id}
                className="aspect-video relative rounded-lg bg-zinc-900 border border-border overflow-hidden group"
              >
                {cam.active ? (
                  <>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-[10px] font-mono text-white font-bold bg-black/50 px-1 rounded">
                        REC
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white/70 bg-black/50 px-1 rounded">
                      {cam.label}
                    </div>
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white/20" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1">
                    <AlertTriangle className="h-5 w-5 opacity-50" />
                    <span className="text-[10px] font-bold uppercase">Signal Lost</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-muted hover:bg-muted/80 text-xs font-semibold py-2 rounded-lg transition-colors">
            View All 124 Cameras
          </button>
        </Panel>

        {/* PANEL 4: INCIDENTS & DRILLS */}
        <Panel title="Safety Incidents & Drills">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Next Fire Drill</h4>
                  <p className="text-[10px] text-muted-foreground">Scheduled for Oct 15, 2026</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-accent hover:underline">
                Reschedule
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Missing Student Protocols</h4>
                  <p className="text-[10px] text-muted-foreground">Quick Action Sheet</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-accent hover:underline">View</button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-600">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground text-red-600 dark:text-red-400">
                    Direct Line: Law Enforcement
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Connects to local precinct immediately
                  </p>
                </div>
              </div>
              <button className="text-xs font-semibold bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700">
                Dial
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
