import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bus, Phone, User, Plus, QrCode, MapPin, Clock, X, Bell, ShieldCheck } from "lucide-react";
import { PageHeader, StatCard, Panel, EmptyState } from "@/components/module-shell";

export const Route = createFileRoute("/parent/transport")({
  component: ParentTransport,
});

interface GatePass {
  id: string;
  visitorName: string;
  relationship: string;
  pickupTime: string;
  status: "active" | "scanned" | "expired";
  qrCodeValue: string;
}

function ParentTransport() {
  const [activeChild, setActiveChild] = useState<"aarav" | "ananya">("aarav");
  const [showGatePassModal, setShowGatePassModal] = useState(false);
  const [createdPass, setCreatedPass] = useState<GatePass | null>(null);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([
    {
      id: "GP-9832",
      visitorName: "Sunil Sharma",
      relationship: "Uncle",
      pickupTime: "15:30 Today",
      status: "active",
      qrCodeValue: "CAMPUSOS_GATEPASS_GP-9832_SUNIL",
    },
  ]);

  // Simulate Live GPS Map tracking movement
  const [busCoords, setBusCoords] = useState({ lat: 18.528, lng: 73.849 });
  useEffect(() => {
    const interval = setInterval(() => {
      setBusCoords((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0006,
        lng: prev.lng + (Math.random() - 0.5) * 0.0006,
      }));
    }, 2000);
    return () => clearInterval(interval);
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

  const childDetails = {
    aarav: {
      name: "Aarav Sharma",
      route: "R-12",
      busNo: "MH-12-AB-1234",
      driver: "Suresh Kumar",
      phone: "+91 99001 10011",
      stopName: "Sector 8 Stop",
      stopTime: "07:45 AM / 03:15 PM",
    },
    ananya: {
      name: "Ananya Sharma",
      route: "R-12",
      busNo: "MH-12-AB-1234",
      driver: "Suresh Kumar",
      phone: "+91 99001 10011",
      stopName: "Sector 8 Stop",
      stopTime: "07:45 AM / 03:15 PM",
    },
  };

  const info = childDetails[activeChild];

  const handleCreateGatePass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const passId = "GP-" + Math.floor(1000 + Math.random() * 9000);
    const newPass: GatePass = {
      id: passId,
      visitorName: fd.get("visitorName") as string,
      relationship: fd.get("relationship") as string,
      pickupTime: fd.get("pickupTime") as string,
      status: "active",
      qrCodeValue: `CAMPUSOS_GATEPASS_${passId}_${fd.get("visitorName")}`,
    };

    setGatePasses([newPass, ...gatePasses]);
    setCreatedPass(newPass);
    setShowGatePassModal(false);
    toast.success("Gate Pass authorized successfully!");
  };

  return (
    <div>
      <PageHeader
        title="Live School Bus & Security Hub"
        subtitle={`Track the assigned transport route and configure guest authorizations for ${info.name}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Assigned Route" value={info.route} icon={Bus} tone="info" />
        <StatCard label="Live Driver Line" value={info.driver} delta={info.phone} icon={Phone} />
        <StatCard
          label="Pickup/Drop Stop"
          value={info.stopName}
          delta={info.stopTime}
          icon={MapPin}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Tracking Map */}
        <div className="lg:col-span-2 space-y-6">
          <Panel
            title="Assigned Bus Live GPS Map"
            action={
              <span className="flex items-center gap-1 text-xs text-[oklch(0.45_0.15_155)] font-bold uppercase animate-pulse">
                <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.65_0.15_155)]" />
                Live Broadcast
              </span>
            }
          >
            <div className="relative h-80 rounded-xl bg-gradient-to-br from-[#1a2e5a]/15 to-accent/5 border border-border overflow-hidden">
              {/* Map grids */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, oklch(0.55 0.13 255) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* School stop */}
              <div className="absolute left-[30%] top-[40%] flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-white ring-4 ring-accent/20">
                  🏫
                </div>
                <span className="text-[10px] font-bold text-foreground mt-1 bg-card border px-1.5 py-0.5 rounded shadow">
                  School Campus
                </span>
              </div>

              {/* Student pickup stop */}
              <div className="absolute left-[65%] top-[70%] flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-[oklch(0.65_0.15_155)] flex items-center justify-center text-white ring-4 ring-[oklch(0.65_0.15_155)]/20">
                  📍
                </div>
                <span className="text-[10px] font-bold text-foreground mt-1 bg-card border px-1.5 py-0.5 rounded shadow">
                  {info.stopName}
                </span>
              </div>

              {/* Simulated Moving Bus Pin */}
              <div
                className="absolute flex flex-col items-center transition-all duration-1000"
                style={{
                  left: `${((busCoords.lng - 73.84) / 0.02) * 100}%`,
                  top: `${((18.535 - busCoords.lat) / 0.015) * 100}%`,
                }}
              >
                <div className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-2.5 py-1 text-xs font-bold shadow-2xl ring-4 ring-primary/30">
                  <Bus className="h-3.5 w-3.5" />
                  {info.route} Active
                </div>
                <span className="absolute -bottom-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-t-primary border-l-transparent border-r-transparent" />
              </div>
            </div>
          </Panel>

          {/* Quick pick-up gate pass authorizations list */}
          <Panel
            title="Authorized Gate Passes (Early Pickups)"
            action={
              <button
                onClick={() => setShowGatePassModal(true)}
                className="flex items-center gap-1 text-xs text-accent hover:underline font-semibold"
              >
                <Plus className="h-4 w-4" />
                Authorize Relative
              </button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gatePasses.map((pass) => (
                <div
                  key={pass.id}
                  className="rounded-xl border border-border p-4 bg-card/85 flex items-center justify-between gap-3 shadow-sm hover:shadow"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">{pass.visitorName}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Relation: {pass.relationship} · Time: {pass.pickupTime}
                    </div>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[10px] bg-accent/10 text-accent font-semibold px-2 py-0.5 rounded-full">
                        {pass.id}
                      </span>
                      <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        {pass.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setCreatedPass(pass)}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-muted hover:bg-accent hover:text-white transition-all shadow-sm"
                  >
                    <QrCode className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Safety & Geofencing notifications setup */}
        <div className="space-y-6">
          <Panel title="Transport Safety Settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground">Proximity Alert Geofence</div>
                  <div className="text-[10px] text-muted-foreground">
                    Get notify when the bus is within 500m of Sector 8.
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-8 rounded-full bg-accent/40 accent-accent cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <div className="text-xs font-bold text-foreground">Boarding Updates SMS</div>
                  <div className="text-[10px] text-muted-foreground">
                    Receive immediate text alerts when child checks-in on bus RFID.
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-8 rounded-full bg-accent/40 accent-accent cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <div className="text-xs font-bold text-foreground">Trip Delay Bulletins</div>
                  <div className="text-[10px] text-muted-foreground">
                    Alerts for route deviations or traffic delays of over 10 minutes.
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-8 rounded-full bg-accent/40 accent-accent cursor-pointer"
                />
              </div>
            </div>
          </Panel>

          <Panel title="Emergency Contacts">
            <div className="space-y-3.5">
              <a
                href={`tel:${info.phone}`}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded bg-accent/10 text-accent font-bold">
                    📞
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Designated Driver</div>
                    <div className="text-[10px] text-muted-foreground">{info.driver}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-accent uppercase hover:underline">
                  Call now
                </span>
              </a>

              <a
                href="tel:+918005551212"
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded bg-destructive/10 text-destructive font-bold">
                    📞
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Security Gate Ops</div>
                    <div className="text-[10px] text-muted-foreground">Emergency Helpdesk Line</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-destructive uppercase hover:underline">
                  Call now
                </span>
              </a>
            </div>
          </Panel>
        </div>
      </div>

      {/* Relative gate pass modal */}
      {showGatePassModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowGatePassModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-foreground">Authorize Visitor / Relative</h2>
              <button
                onClick={() => setShowGatePassModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGatePass} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Visitor / Relative Full Name</label>
                <input
                  name="visitorName"
                  required
                  placeholder="e.g. Sunil Sharma"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Relationship to Sibling</label>
                <input
                  name="relationship"
                  required
                  placeholder="e.g. Uncle / Aunt / Driver"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Planned Pick-up Time</label>
                <input
                  name="pickupTime"
                  required
                  placeholder="e.g. 15:30 Today"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow active:scale-95 transition-all text-xs"
              >
                Generate Security Gate Pass
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Gate Pass QR Display modal */}
      {createdPass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setCreatedPass(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs rounded-2xl bg-card p-6 shadow-2xl border border-border text-center animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Authorized Pass QR
              </span>
              <button
                onClick={() => setCreatedPass(null)}
                className="grid h-6 w-6 place-items-center rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="bg-muted p-4 border border-dashed border-border rounded-xl flex items-center justify-center mb-4">
              <QrCode className="h-32 w-32 text-foreground" />
            </div>
            <div className="text-sm font-bold text-foreground">{createdPass.visitorName}</div>
            <div className="text-xs text-muted-foreground">
              {createdPass.relationship} · Early Pickup
            </div>
            <div className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full inline-block mt-2 font-semibold border border-accent/20">
              Valid: {createdPass.pickupTime}
            </div>
            <div className="mt-4 border-t border-border pt-3 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-[oklch(0.45_0.15_155)]" />
              Encrypted Security Gate clearance token
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
