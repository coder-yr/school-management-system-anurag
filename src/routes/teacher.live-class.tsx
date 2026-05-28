import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  MonitorUp,
  MessageSquare,
  Users,
  Hand,
  Settings,
  PhoneOff,
  LayoutGrid,
  BarChart,
  UserCheck,
  Maximize2,
} from "lucide-react";

export const Route = createFileRoute("/teacher/live-class")({
  head: () => ({ meta: [{ title: "Live Virtual Classroom · Campus OS" }] }),
  component: LiveClassPage,
});

function LiveClassPage() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "participants" | "polls">("participants");
  const [handRaised, setHandRaised] = useState(false);

  const students = [
    { id: 1, name: "Aarav Sharma", status: "talking" },
    { id: 2, name: "Riya Verma", status: "muted" },
    { id: 3, name: "Kabir Singh", status: "muted", hand: true },
    { id: 4, name: "Zara Khan", status: "muted" },
    { id: 5, name: "Ishaan Patel", status: "muted" },
    { id: 6, name: "Ananya Iyer", status: "muted" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-zinc-950 text-zinc-100 -mx-4 -mt-4 sm:-mx-6 lg:-mx-8 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="flex h-14 items-center justify-between border-b border-white/10 bg-zinc-900/50 px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 items-center rounded bg-red-500/20 px-2 text-xs font-bold text-red-500 gap-1.5 animate-pulse">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            REC 45:12
          </div>
          <div>
            <h1 className="text-sm font-semibold">Grade 10 Physics - Thermodynamics (Section B)</h1>
            <p className="text-[10px] text-zinc-400">Host: Mr. Sharma • 24 Participants</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="grid h-8 w-8 place-items-center rounded bg-white/5 hover:bg-white/10 text-zinc-400">
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button className="grid h-8 w-8 place-items-center rounded bg-white/5 hover:bg-white/10 text-zinc-400">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Video Grid */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
          <div
            className={`grid w-full max-w-6xl gap-4 ${screenShare ? "grid-cols-4" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}
          >
            {/* Screen Share Dominant View (if active) */}
            {screenShare && (
              <div className="col-span-4 aspect-video rounded-xl border border-blue-500/30 bg-zinc-900 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
                <MonitorUp className="h-20 w-20 text-blue-500/30 mb-4" />
                <h3 className="font-bold text-xl">You are sharing your screen</h3>
                <p className="text-sm text-zinc-400 mt-2">Whiteboard Application Active</p>
                <div className="absolute top-4 left-4 bg-blue-500 px-3 py-1 rounded text-xs font-bold text-white">
                  Presenting
                </div>
              </div>
            )}

            {/* Teacher Self View */}
            <div className="aspect-video relative rounded-xl border border-white/10 bg-zinc-900 shadow-sm overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                {camOn ? (
                  <div className="text-zinc-500 font-bold opacity-30 tracking-widest text-lg">
                    TEACHER CAM
                  </div>
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-zinc-700 text-2xl font-bold">
                    M
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-xs backdrop-blur">
                <span className="font-semibold">You (Host)</span>
                {!micOn && <MicOff className="h-3 w-3 text-red-400" />}
              </div>
            </div>

            {/* Student Grid */}
            {students.slice(0, screenShare ? 3 : 6).map((s) => (
              <div
                key={s.id}
                className={`aspect-video relative rounded-xl border ${s.status === "talking" ? "border-green-500" : "border-white/10"} bg-zinc-900 shadow-sm overflow-hidden`}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-zinc-700 text-lg font-bold text-zinc-300">
                    {s.name.charAt(0)}
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-[10px] backdrop-blur">
                  <span>{s.name}</span>
                  {s.status === "muted" ? (
                    <MicOff className="h-3 w-3 text-red-400" />
                  ) : (
                    <Mic className="h-3 w-3 text-green-400 animate-pulse" />
                  )}
                </div>
                {s.hand && (
                  <div className="absolute top-2 right-2 rounded-full bg-yellow-500 p-1.5 shadow-lg animate-bounce">
                    <Hand className="h-4 w-4 text-black" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-white/10 bg-zinc-900/50 flex flex-col shrink-0 h-full">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-white/10 shrink-0">
            {(
              [
                ["participants", "Roster", Users],
                ["chat", "Chat", MessageSquare],
                ["polls", "Polls", BarChart],
              ] as const
            ).map(([k, l, Icon]) => (
              <button
                key={k}
                onClick={() => setActiveTab(k as any)}
                className={`flex-1 flex flex-col items-center justify-center py-3 text-[10px] font-bold uppercase tracking-wider transition-colors gap-1.5 ${
                  activeTab === k
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {l}
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "participants" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                  <span>In Call (24)</span>
                  <button className="text-blue-400 hover:underline">Mute All</button>
                </div>
                <div className="space-y-1">
                  {students.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded hover:bg-white/5 p-2 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-zinc-800 text-[10px] font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <span className="text-xs">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.hand && <Hand className="h-3 w-3 text-yellow-500" />}
                        {s.status === "muted" ? (
                          <MicOff className="h-3 w-3 text-red-500/50" />
                        ) : (
                          <Mic className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 mt-4 border-t border-white/10">
                  <button className="w-full flex justify-center items-center gap-2 bg-blue-500/20 text-blue-400 font-bold text-xs py-2.5 rounded-lg hover:bg-blue-500/30 transition-all">
                    <Users className="h-4 w-4" /> Breakout Rooms
                  </button>
                </div>
              </div>
            )}
            {activeTab === "chat" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4">
                  <div className="text-xs text-zinc-400 mb-2">
                    10:15 AM - Aarav: Is the syllabus same?
                  </div>
                  <div className="text-xs text-zinc-400">10:16 AM - Riya: Yes, chapters 1-4</div>
                </div>
                <div className="mt-4 shrink-0">
                  <input
                    type="text"
                    placeholder="Message everyone..."
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg h-9 px-3 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
            {activeTab === "polls" && (
              <div className="space-y-4">
                <div className="bg-zinc-800 rounded-lg p-3 border border-white/10">
                  <h4 className="text-xs font-bold mb-2">Pop Quiz: Thermodynamics</h4>
                  <p className="text-[10px] text-zinc-400 mb-3">Which law defines entropy?</p>
                  <div className="space-y-2 text-[10px]">
                    <div className="bg-white/5 p-2 rounded flex justify-between">
                      <span>First Law</span> <span>10%</span>
                    </div>
                    <div className="bg-blue-500/20 text-blue-400 border border-blue-500/50 p-2 rounded flex justify-between font-bold">
                      <span>Second Law</span> <span>85%</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded flex justify-between">
                      <span>Third Law</span> <span>5%</span>
                    </div>
                  </div>
                  <button className="w-full mt-3 bg-white/10 hover:bg-white/20 text-xs font-bold py-1.5 rounded transition-all">
                    End Poll
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="h-20 shrink-0 bg-zinc-950 border-t border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
          <button className="flex flex-col items-center gap-1 hover:text-white transition-colors">
            <Settings className="h-5 w-5" />
            Options
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Mute Button */}
          <button
            onClick={() => setMicOn(!micOn)}
            className={`grid h-12 w-12 place-items-center rounded-full transition-all ${
              micOn
                ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                : "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50"
            }`}
          >
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          {/* Camera Button */}
          <button
            onClick={() => setCamOn(!camOn)}
            className={`grid h-12 w-12 place-items-center rounded-full transition-all ${
              camOn
                ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                : "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50"
            }`}
          >
            {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={() => setScreenShare(!screenShare)}
            className={`grid h-12 w-12 place-items-center rounded-full transition-all ${
              screenShare
                ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                : "bg-zinc-800 hover:bg-zinc-700 text-white"
            }`}
          >
            <MonitorUp className="h-5 w-5" />
          </button>

          {/* Hand Raise */}
          <button
            onClick={() => setHandRaised(!handRaised)}
            className={`grid h-12 w-12 place-items-center rounded-full transition-all ${
              handRaised
                ? "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                : "bg-zinc-800 hover:bg-zinc-700 text-white"
            }`}
          >
            <Hand className="h-5 w-5" />
          </button>

          {/* End Call Button */}
          <button
            onClick={() => {
              toast.error("Class Session Ended", {
                description: "Attendance auto-marked and recording saved to cloud.",
              });
            }}
            className="flex h-12 items-center gap-2 rounded-full bg-red-600 px-6 font-bold text-white shadow-lg hover:bg-red-500 transition-all ml-2"
          >
            <PhoneOff className="h-5 w-5" />
            End Class
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
          <button className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors">
            <UserCheck className="h-4 w-4" />
            Auto-Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
