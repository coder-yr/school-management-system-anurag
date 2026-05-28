import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Bus,
  Play,
  Square,
  AlertOctagon,
  CheckCircle,
  AlertTriangle,
  Clock,
  Compass,
  Check,
  User,
  ShieldCheck,
  MapPin,
  ClipboardList,
  Wrench,
  History,
  Phone,
  CornerUpLeft,
} from "lucide-react";
import { PageHeader, Panel } from "@/components/module-shell";

// ── ROUTE DEFINITION ──
export const Route = createFileRoute("/driver/")({
  head: () => ({
    meta: [
      { title: "Driver Workspace · Campus OS" },
      { name: "description", content: "Bus Driver Mobile Cockpit & Security Hub" },
    ],
  }),
  component: DriverCockpit,
});

// ── MOCK DATA ──
const INITIAL_STUDENTS = [
  {
    id: "st-101",
    name: "Aarav Sharma",
    stop: "Sector 8 Stop",
    boarded: false,
    deboarded: false,
    status: "pending",
  },
  {
    id: "st-102",
    name: "Ananya Sharma",
    stop: "Sector 8 Stop",
    boarded: false,
    deboarded: false,
    status: "pending",
  },
  {
    id: "st-103",
    name: "Rohan Kapoor",
    stop: "Metro Station Gate 2",
    boarded: false,
    deboarded: false,
    status: "pending",
  },
  {
    id: "st-104",
    name: "Kiara Advani",
    stop: "Orchard Avenue Heights",
    boarded: false,
    deboarded: false,
    status: "pending",
  },
  {
    id: "st-105",
    name: "Kabir Sen",
    stop: "Downing Square",
    boarded: false,
    deboarded: false,
    status: "pending",
  },
];

const PRE_TRIP_CHECKLIST = [
  { id: "chk-1", text: "Brakes & Air Pressure Check", checked: false },
  { id: "chk-2", text: "Tire Pressure & Tread Wear", checked: false },
  { id: "chk-3", text: "Emergency Doors & SOS Toggle", checked: false },
  { id: "chk-4", text: "RFID Scanner Node Booted", checked: false },
  { id: "chk-5", text: "First Aid Kit & Extinguisher Loaded", checked: false },
];

function DriverCockpit() {
  const [activeTab, setActiveTab] = useState<"cockpit" | "checklist" | "logs">("cockpit");
  const [tripActive, setTripActive] = useState(false);
  const [activeStudents, setActiveStudents] = useState(INITIAL_STUDENTS);
  const [preChecklist, setPreChecklist] = useState(PRE_TRIP_CHECKLIST);

  // Breakdown & Delay States
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayReason, setDelayReason] = useState("Traffic Congestion");
  const [delayMinutes, setDelayMinutes] = useState(15);

  // SOS Panic Counter
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);

  // Sync Simulated GPS movement when trip is active
  const [gpsCoords, setGpsCoords] = useState({ lat: 18.528, lng: 73.849 });
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (tripActive) {
      interval = setInterval(() => {
        setGpsCoords((prev) => {
          const next = {
            lat: prev.lat + (Math.random() - 0.5) * 0.0004,
            lng: prev.lng + (Math.random() - 0.5) * 0.0004,
          };
          // Save coordinates in localStorage for the parent UI to sync in real-time
          localStorage.setItem("mock_bus_coords", JSON.stringify(next));
          return next;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [tripActive]);

  // Handle SOS button hold/countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosCountdown !== null) {
      if (sosCountdown > 0) {
        timer = setTimeout(() => setSosCountdown(sosCountdown - 1), 1000);
      } else {
        // Countdown reached 0 - Trigger Emergency alert
        setSosCountdown(null);
        toast.error("🚨 SOS PANIC ALERT DISPATCHED!", {
          description:
            "Emergency coordinates and delay warnings pushed to security gate and all parents immediately.",
          duration: 6000,
        });
      }
    }
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  const handleStartTrip = () => {
    // Check if checklist is completed first
    const uncompleted = preChecklist.filter((c) => !c.checked).length;
    if (uncompleted > 0) {
      toast.warning("Checklist Incomplete", {
        description: `Please verify and tick off all ${uncompleted} safety protocols under the 'Safety Checklist' tab before rolling.`,
      });
      setActiveTab("checklist");
      return;
    }

    setTripActive(true);
    toast.success("School Trip Initiated!", {
      description: "Live GPS coordinates broadcast and RFID scanner initialized for Route R-12.",
    });
  };

  const handleEndTrip = () => {
    setTripActive(false);
    toast.info("School Trip Terminated", {
      description: "GPS broadcast stopped. Trip summary logged inside history database.",
    });
    // Reset students status
    setActiveStudents(INITIAL_STUDENTS);
  };

  const toggleChecklist = (id: string) => {
    setPreChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  };

  const handleBoardStudent = (id: string) => {
    setActiveStudents((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextBoarded = !item.boarded;
          if (nextBoarded) {
            toast.success(`RFID Scanned: ${item.name} Boarded`, {
              description: `Boarding update SMS notification pushed to parents successfully.`,
            });
            return { ...item, boarded: true, status: "boarded" };
          } else {
            return { ...item, boarded: false, status: "pending" };
          }
        }
        return item;
      }),
    );
  };

  const handleDeboardStudent = (id: string) => {
    setActiveStudents((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextDeboarded = !item.deboarded;
          if (nextDeboarded) {
            toast.success(`RFID Scanned: ${item.name} Deboarded`, {
              description: `Drop-off SMS notification pushed to parents successfully.`,
            });
            return { ...item, deboarded: true, status: "deboarded" };
          } else {
            return { ...item, deboarded: false, status: "boarded" };
          }
        }
        return item;
      }),
    );
  };

  const handleReportDelay = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDelayModal(false);
    toast.warning(`Delay Notification Pushed!`, {
      description: `Alert sent to parents: "Route R-12 delayed by ${delayMinutes} mins due to ${delayReason}."`,
      duration: 5000,
    });
  };

  return (
    <div className="mx-auto max-w-lg min-h-screen bg-slate-950 text-slate-100 p-4 space-y-5 flex flex-col justify-between">
      {/* Mobile Shell Header */}
      <div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-indigo-400"
            >
              <CornerUpLeft className="h-4 w-4" />
            </Link>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <Bus className="h-4 w-4 text-indigo-400" /> Route R-12 Cockpit
              </h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Operator: Suresh Kumar
              </span>
            </div>
          </div>
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
            Bus MH-12-AB-1234
          </span>
        </div>

        {/* TABS SELECT */}
        <div className="grid grid-cols-3 gap-1.5 my-4 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("cockpit")}
            className={`py-2 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === "cockpit" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Compass className="h-4 w-4" /> Console
          </button>
          <button
            onClick={() => setActiveTab("checklist")}
            className={`py-2 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === "checklist" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
          >
            <ClipboardList className="h-4 w-4" /> Safety Checklist
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`py-2 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === "logs" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
          >
            <History className="h-4 w-4" /> Logs & Shift
          </button>
        </div>

        {/* ── CONSOLE PANEL VIEW ── */}
        {activeTab === "cockpit" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* TRIP CONTROLLER */}
            <div
              className={`p-4 rounded-2xl border transition-all ${tripActive ? "border-emerald-500/30 bg-emerald-950/10 shadow-lg" : "border-slate-800 bg-slate-900/60"}`}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    School Trip Status
                  </h3>
                  <p
                    className={`text-base font-extrabold mt-0.5 ${tripActive ? "text-emerald-400 animate-pulse" : "text-slate-400"}`}
                  >
                    {tripActive
                      ? "● Active & Transmitting GPS"
                      : "○ Idle - Pre-trip checklist required"}
                  </p>
                </div>
                <div
                  className={`h-2.5 w-2.5 rounded-full ${tripActive ? "bg-emerald-400 animate-ping" : "bg-slate-700"}`}
                />
              </div>

              {!tripActive ? (
                <button
                  onClick={handleStartTrip}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white py-3 rounded-xl font-extrabold uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
                >
                  <Play className="h-4 w-4" /> Start Active Trip R-12
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleEndTrip}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-[0.97] text-white py-3 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                  >
                    <Square className="h-4 w-4" /> Complete Trip
                  </button>
                  <button
                    onClick={() => setShowDelayModal(true)}
                    className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 py-3 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Clock className="h-4 w-4" /> Report Delay
                  </button>
                </div>
              )}
            </div>

            {/* GPS LOCATION BROADCAST MODULE */}
            {tripActive && (
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2 text-[10px] animate-in slide-in-from-top duration-300">
                <div className="flex justify-between items-center text-slate-400 font-bold uppercase">
                  <span>GPS Broadcast telemetry</span>
                  <span className="text-emerald-400 font-extrabold tracking-wide uppercase">
                    Broadcasting Live
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded">
                    Lat: {gpsCoords.lat.toFixed(5)}
                  </div>
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded">
                    Lng: {gpsCoords.lng.toFixed(5)}
                  </div>
                </div>
              </div>
            )}

            {/* STUDENT RFID BOARDING ROSTER */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Roster RFID Check-ins
              </h3>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden">
                {activeStudents.map((st) => {
                  const studentStatusColor = st.boarded
                    ? "bg-emerald-500/10 border-emerald-500/25"
                    : "border-slate-800 bg-slate-950/20";
                  return (
                    <div
                      key={st.id}
                      className={`p-3.5 flex items-center justify-between gap-3 text-xs ${studentStatusColor}`}
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{st.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
                          {st.stop}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Board Switch */}
                        <button
                          disabled={!tripActive}
                          onClick={() => handleBoardStudent(st.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border cursor-pointer select-none transition-all disabled:opacity-40 ${
                            st.boarded
                              ? "bg-emerald-600 border-emerald-500 text-white"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          {st.boarded ? "Boarded ✓" : "Board"}
                        </button>

                        {/* Deboard Switch */}
                        <button
                          disabled={!tripActive || !st.boarded}
                          onClick={() => handleDeboardStudent(st.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border cursor-pointer select-none transition-all disabled:opacity-40 ${
                            st.deboarded
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          {st.deboarded ? "Dropped ✓" : "Drop"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── SAFETY CHECKLIST VIEW ── */}
        {activeTab === "checklist" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-indigo-950/10 border border-indigo-900/30 p-4 rounded-2xl space-y-1.5">
              <h3 className="font-bold text-xs text-white uppercase flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" /> Pre-Trip Safety Regulations
              </h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Platform protocols require the operator to run diagnostic controls on the vehicle
                daily before starting school transport routes.
              </p>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden">
              {preChecklist.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleChecklist(c.id)}
                  className="w-full p-4 flex items-center justify-between text-left text-xs text-slate-300 hover:bg-slate-800/40 cursor-pointer"
                >
                  <span className={cn(c.checked && "line-through text-slate-500", "font-medium")}>
                    {c.text}
                  </span>
                  <div
                    className={`h-5 w-5 border rounded-md flex items-center justify-center shrink-0 ${c.checked ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700 bg-slate-950"}`}
                  >
                    {c.checked && <Check className="h-3.5 w-3.5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── LOGS & HISTORY VIEW ── */}
        {activeTab === "logs" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* WORK STATISTICS */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Trips</span>
                <div className="text-xl font-extrabold text-white">124 completed</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  Shift Attendance
                </span>
                <div className="text-xl font-extrabold text-emerald-400">98.2% (Present)</div>
              </div>
            </div>

            {/* VEHICLE MAINTENANCE REPORT FORM */}
            <Panel
              title="Vehicle Maintenance Log & Alert Reporting"
              className="border-slate-800 bg-slate-900/40"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Maintenance alert generated!", {
                    description: "Report written to garage queue and vehicle admin ledger.",
                  });
                }}
                className="space-y-3 text-xs mt-2"
              >
                <div>
                  <label className="font-semibold block mb-1 text-slate-400">
                    Maintenance Area issue
                  </label>
                  <select className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 outline-none focus:border-indigo-500 cursor-pointer">
                    <option>Brakes Wear & Squeak</option>
                    <option>Engine Oil / Filter Replacement</option>
                    <option>AC Cooling Issue</option>
                    <option>Cabin Cleaning / Seat tear</option>
                    <option>Other minor defect</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-400">
                    Fault Description Notes
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="State fault details clearly..."
                    className="w-full border border-slate-800 bg-slate-950 p-2.5 rounded-lg outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl cursor-pointer flex items-center justify-center gap-1"
                >
                  <Wrench className="h-3.5 w-3.5" /> Submit Defect Report
                </button>
              </form>
            </Panel>

            {/* SHIFT LOGS */}
            <Panel title="Driver Shift Logs (Recent)" className="border-slate-800 bg-slate-900/40">
              <div className="space-y-2 text-xs">
                {[
                  {
                    date: "May 25, 2026",
                    shift: "Morning & Afternoon",
                    status: "Present",
                    duration: "7.5 hrs",
                  },
                  {
                    date: "May 24, 2026",
                    shift: "Morning & Afternoon",
                    status: "Present",
                    duration: "7.4 hrs",
                  },
                  {
                    date: "May 23, 2026",
                    shift: "Morning & Afternoon",
                    status: "Present",
                    duration: "7.6 hrs",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2.5 border border-slate-800 bg-slate-950/40 rounded-lg"
                  >
                    <div>
                      <div className="font-bold text-white">{item.date}</div>
                      <div className="text-[10px] text-slate-500">{item.shift}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">{item.status}</div>
                      <div className="text-[10px] text-slate-500">{item.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </div>

      {/* SOS EMERGENCY PANIC BUTTON */}
      <div className="pt-4 border-t border-slate-800 shrink-0">
        {sosCountdown === null ? (
          <button
            onMouseDown={() => setSosCountdown(3)}
            onTouchStart={() => setSosCountdown(3)}
            onMouseUp={() => setSosCountdown(null)}
            onTouchEnd={() => setSosCountdown(null)}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3.5 rounded-2xl font-extrabold uppercase text-xs tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/20 transition-all transform active:scale-95 border-b-4 border-rose-800 active:border-b-0"
          >
            <AlertOctagon className="h-5 w-5 animate-pulse shrink-0" /> Hold to Trigger SOS Panic
          </button>
        ) : (
          <div className="w-full bg-rose-950 border-2 border-rose-500 text-rose-300 py-3.5 rounded-2xl font-extrabold uppercase text-xs tracking-widest text-center animate-pulse flex items-center justify-center gap-2">
            <AlertOctagon className="h-5 w-5 shrink-0" /> Triggering SOS in {sosCountdown}...
            Release to Cancel!
          </div>
        )}
      </div>

      {/* DELAY REPORT MODAL */}
      {showDelayModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowDelayModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-slate-900 p-5 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200 text-xs text-slate-300 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
                Report Traffic/Route Delay
              </h3>
              <button
                onClick={() => setShowDelayModal(false)}
                className="h-8 w-8 bg-slate-950 rounded-lg flex items-center justify-center border border-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportDelay} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold block text-slate-400">Delay Reason Category</label>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option>Traffic Congestion</option>
                  <option>Engine Breakdown / Flat Tire</option>
                  <option>Heavy Rainfall / Waterlogging</option>
                  <option>Route Deviation / Road Closure</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-slate-400 font-bold">
                  <span>Estimated Delay duration:</span>
                  <span className="text-amber-400">{delayMinutes} Minutes</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-2.5 rounded-xl uppercase tracking-wider text-xs shadow cursor-pointer transition-all active:scale-95"
              >
                Broadcast Delay Alert
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
