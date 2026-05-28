import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Users,
  AlertTriangle,
  Wrench,
  Plus,
  X,
  Eye,
  CheckCircle,
  Phone,
  ShieldAlert,
  Zap,
  Wifi,
  Check,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { PageHeader, StatCard, Panel, EmptyState } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/hostel")({
  head: () => ({ meta: [{ title: "Hostel · Campus OS" }] }),
  component: Page,
});

function Page() {
  const [tab, setTab] = useState<"rooms" | "complaints" | "visitors" | "assets" | "utilities" | "leaves" | "attendance" | "notices">("rooms");
  const [showComplaint, setShowComplaint] = useState(false);
  const [showVisitor, setShowVisitor] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  // Asset Checklist State
  const [selectedAssetRoom, setSelectedAssetRoom] = useState("A-101");
  const [assetStatuses, setAssetStatuses] = useState<
    Record<string, Record<string, "working" | "needs-repair" | "missing">>
  >({
    "A-101": {
      "Bed Frame": "working",
      "Study Table": "working",
      "Ceiling Fan": "working",
      "AC Unit": "working",
      "Wi-Fi Router": "needs-repair",
      Wardrobe: "working",
    },
    "A-102": {
      "Bed Frame": "working",
      "Study Table": "working",
      "Ceiling Fan": "working",
      "AC Unit": "working",
      "Wi-Fi Router": "working",
      Wardrobe: "working",
    },
    "B-201": {
      "Bed Frame": "working",
      "Study Table": "needs-repair",
      "Ceiling Fan": "working",
      "AC Unit": "missing",
      "Wi-Fi Router": "working",
      Wardrobe: "working",
    },
    "B-202": {
      "Bed Frame": "working",
      "Study Table": "working",
      "Ceiling Fan": "working",
      "AC Unit": "working",
      "Wi-Fi Router": "working",
      Wardrobe: "working",
    },
  });
  const [lastVerified, setLastVerified] = useState<Record<string, string>>({
    "A-101": "2026-05-18",
    "A-102": "2026-05-19",
    "B-201": "2026-05-15",
    "B-202": "2026-05-20",
  });

  // Utility Bills State
  const [utilityBills, setUtilityBills] = useState([
    {
      id: "u1",
      room: "A-101",
      block: "A",
      type: "Electricity",
      amount: 120,
      dueDate: "2026-06-05",
      status: "due",
    },
    {
      id: "u2",
      room: "A-101",
      block: "A",
      type: "Wi-Fi",
      amount: 40,
      dueDate: "2026-06-05",
      status: "paid",
    },
    {
      id: "u3",
      room: "B-201",
      block: "B",
      type: "Electricity",
      amount: 155,
      dueDate: "2026-05-28",
      status: "overdue",
    },
    {
      id: "u4",
      room: "B-202",
      block: "B",
      type: "Wi-Fi",
      amount: 40,
      dueDate: "2026-06-05",
      status: "due",
    },
  ]);
  const [utilityFilter, setUtilityFilter] = useState<"all" | "paid" | "due" | "overdue">("all");

  const [rooms, setRooms] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [rRes, cRes, vRes, lRes, aRes, nRes] = await Promise.all([
        apiClient<any>("/hostel/rooms"),
        apiClient<any>("/hostel/complaints"),
        apiClient<any>("/hostel/visitors"),
        apiClient<any>("/hostel/leaves"),
        apiClient<any>("/hostel/attendance"),
        apiClient<any>("/hostel/notices"),
      ]);
      setRooms(Array.isArray(rRes) ? rRes : rRes?.data || []);
      setComplaints(Array.isArray(cRes) ? cRes : cRes?.data || []);
      setVisitors(Array.isArray(vRes) ? vRes : vRes?.data || []);
      setLeaves(Array.isArray(lRes) ? lRes : lRes?.data || []);
      setAttendance(Array.isArray(aRes) ? aRes : aRes?.data || []);
      setNotices(Array.isArray(nRes) ? nRes : nRes?.data || []);
    } catch (err) {
      toast.error("Failed to fetch hostel data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalBeds = rooms.reduce((a, r) => a + (r.capacity || 0), 0);
  const occupiedBeds = rooms.reduce((a, r) => a + (r.occupied || 0), 0);
  const openComplaints = complaints.filter(
    (c) => c.status === "open" || c.status === "emergency",
  ).length;

  const handleAssetStatusChange = (
    asset: string,
    newStatus: "working" | "needs-repair" | "missing",
  ) => {
    setAssetStatuses((prev) => ({
      ...prev,
      [selectedAssetRoom]: {
        ...prev[selectedAssetRoom],
        [asset]: newStatus,
      },
    }));
  };

  const verifyAssets = () => {
    setLastVerified((prev) => ({
      ...prev,
      [selectedAssetRoom]: new Date().toISOString().split("T")[0],
    }));
    toast.success(`Room ${selectedAssetRoom} asset checklist verified successfully!`);
  };

  return (
    <div>
      <PageHeader
        title="Hostel Management"
        subtitle="Room occupancy, visitor tracking, complaints, and asset tracking"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Total Beds" value={String(totalBeds)} icon={Building2} tone="info" />
        <StatCard
          label="Occupied"
          value={String(occupiedBeds)}
          delta={`${Math.round((occupiedBeds / totalBeds) * 100)}% occupancy`}
          icon={Users}
          tone="success"
        />
        <StatCard
          label="Under Maintenance"
          value={String(rooms.filter((r) => r.status === "maintenance").length)}
          icon={Wrench}
          tone="warning"
        />
        <StatCard
          label="Open Complaints"
          value={String(openComplaints)}
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      <div className="flex flex-wrap gap-1 mb-4 rounded-lg bg-muted p-1">
        {(
          [
            ["rooms", "Room Layout"],
            ["complaints", "Complaints"],
            ["visitors", "Visitors"],
            ["assets", "Asset Checklist"],
            ["utilities", "Utility Billing"],
            ["leaves", "In/Out Register"],
            ["attendance", "Attendance"],
            ["notices", "Notices"],
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

      {tab === "rooms" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <div
              key={r.id}
              className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${r.status === "maintenance" ? "border-[oklch(0.75_0.15_75)]/50 bg-[oklch(0.75_0.15_75)]/5" : r.status === "full" ? "border-accent/30 bg-accent/5" : "border-border bg-card"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">
                  Block {r.block} · {r.room_no}
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${r.status === "available" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : r.status === "full" ? "bg-accent/10 text-accent" : "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]"}`}
                >
                  {r.status}
                </span>
              </div>
              <div className="flex gap-2 mb-2">
                {Array.from({ length: r.capacity || 0 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium ${i < (r.occupied || 0) ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {i < (r.occupied || 0) ? "●" : "○"}
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                {r.occupied || 0}/{r.capacity || 0} beds occupied
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "complaints" && (
        <Panel
          title="Complaints"
          action={
            <button
              onClick={() => setShowComplaint(true)}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          }
        >
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 ${c.status === "emergency" ? "border-destructive/50 bg-destructive/5" : "border-border"}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{c.student_name}</span>
                    {c.status === "emergency" && (
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.room} · {c.category} · {new Date(c.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm mt-1">{c.description}</div>
                </div>
                <div className="flex gap-2">
                  {c.status === "open" && (
                    <>
                      <button
                        onClick={async () => {
                          await apiClient(`/hostel/complaints/${c.id}`, { method: "PATCH", data: { status: "in-progress" } });
                          toast.success("Complaint updated");
                          fetchData();
                        }}
                        className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-all"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={async () => {
                          await apiClient(`/hostel/complaints/${c.id}`, { method: "PATCH", data: { status: "emergency" } });
                          toast.error("Emergency flagged!");
                          fetchData();
                        }}
                        className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-all"
                      >
                        Emergency
                      </button>
                    </>
                  )}
                  {c.status === "in-progress" && (
                    <button
                      onClick={async () => {
                        await apiClient(`/hostel/complaints/${c.id}`, { method: "PATCH", data: { status: "resolved" } });
                        toast.success("Complaint resolved");
                        fetchData();
                      }}
                      className="rounded-lg bg-[oklch(0.65_0.15_155)]/15 px-3 py-1.5 text-xs font-medium text-[oklch(0.45_0.15_155)]"
                    >
                      Resolve
                    </button>
                  )}
                  {(c.status === "resolved" || c.status === "emergency") && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${c.status === "resolved" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-destructive/10 text-destructive"}`}
                    >
                      {c.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {complaints.length === 0 && (
              <EmptyState icon={CheckCircle} title="No complaints" description="All clear!" />
            )}
          </div>
        </Panel>
      )}

      {tab === "visitors" && (
        <Panel
          title="Visitor Log"
          action={
            <button
              onClick={() => setShowVisitor(true)}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Visitor
            </button>
          }
        >
          <div className="space-y-3">
            {visitors.map((v) => (
              <div
                key={v._id || v.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div>
                  <div className="font-medium text-sm">{v.visitorName}</div>
                  <div className="text-xs text-muted-foreground">
                    Visiting {v.studentName} · Room {v.room} · {v.purpose}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    In: {new Date(v.checkIn).toLocaleString()}
                    {v.checkOut ? ` · Out: ${new Date(v.checkOut).toLocaleString()}` : ""}
                  </div>
                </div>
                <div>
                  {v.status === "checked-in" ? (
                    <button
                      onClick={async () => {
                        await apiClient(`/hostel/visitors/${v._id || v.id}`, {
                          method: "PATCH",
                          data: { status: "checked-out", checkOut: new Date().toISOString() }
                        });
                        toast.success("Visitor checked out");
                        fetchData();
                      }}
                      className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-all"
                    >
                      Check Out
                    </button>
                  ) : (
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-muted text-muted-foreground">
                      {v.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {visitors.length === 0 && (
            <EmptyState
              icon={Users}
              title="No visitors"
              description="Visitor logs will appear here."
            />
          )}
        </Panel>
      )}

      {tab === "assets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Panel title="Select Room">
              <p className="text-xs text-muted-foreground mb-4">
                Select a hostel room to verify or update its dynamic asset status register.
              </p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {["A-101", "A-102", "B-201", "B-202"].map((room) => {
                  const items = assetStatuses[room] || {};
                  const itemsCount = Object.keys(items).length;
                  const damagedCount = Object.values(items).filter((v) => v !== "working").length;
                  return (
                    <button
                      key={room}
                      onClick={() => setSelectedAssetRoom(room)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${selectedAssetRoom === room ? "border-accent bg-accent/5" : "border-border hover:bg-muted"}`}
                    >
                      <div>
                        <div className="font-semibold text-sm">Room {room}</div>
                        <div className="text-xs text-muted-foreground">
                          Last Verified: {lastVerified[room] || "Never"}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${damagedCount > 0 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"}`}
                      >
                        {damagedCount > 0 ? `${damagedCount} issues` : "All Clear"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          </div>
          <div className="lg:col-span-2">
            <Panel
              title={`Room ${selectedAssetRoom} Asset Audit`}
              action={
                <button
                  onClick={verifyAssets}
                  className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Mark Verified & Sign Off
                </button>
              }
            >
              <div className="divide-y divide-border">
                {Object.entries(assetStatuses[selectedAssetRoom] || {}).map(([asset, status]) => (
                  <div
                    key={asset}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-8 w-8 place-items-center rounded-lg ${status === "working" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20" : status === "needs-repair" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20" : "bg-red-100 text-red-600 dark:bg-red-900/20"}`}
                      >
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">{asset}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          Status: {status.replace("-", " ")}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {(["working", "needs-repair", "missing"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleAssetStatusChange(asset, s)}
                          className={`rounded px-2.5 py-1 text-xs font-semibold capitalize transition-all border ${status === s ? (s === "working" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" : s === "needs-repair" ? "bg-amber-500/10 text-amber-600 border-amber-500/25" : "bg-red-500/10 text-red-600 border-red-500/25") : "bg-background text-muted-foreground border-border hover:bg-muted"}`}
                        >
                          {s.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === "utilities" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Pending Utility Invoices"
              value={String(utilityBills.filter((b) => b.status !== "paid").length)}
              icon={Zap}
              tone="warning"
            />
            <StatCard
              label="Overdue Utilities"
              value={String(utilityBills.filter((b) => b.status === "overdue").length)}
              icon={AlertCircle}
              tone="critical"
            />
            <StatCard
              label="Total Monthly Billing"
              value={`$${utilityBills.reduce((acc, b) => acc + b.amount, 0)}`}
              icon={Building2}
              tone="info"
            />
          </div>

          <Panel
            title="Utility Billing & Invoices Tracker"
            action={
              <div className="flex items-center gap-3">
                <div className="flex bg-muted rounded-lg p-0.5 text-xs">
                  {(["all", "paid", "due", "overdue"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setUtilityFilter(f)}
                      className={`px-2 py-1 rounded capitalize font-medium ${utilityFilter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowUtilityModal(true)}
                  className="flex items-center gap-1 text-xs text-accent hover:underline font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Issue New Bill
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                    <th className="pb-3 pr-4">Room & Block</th>
                    <th className="pb-3 px-4">Utility Type</th>
                    <th className="pb-3 px-4">Due Date</th>
                    <th className="pb-3 px-4">Amount</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {utilityBills
                    .filter((b) => utilityFilter === "all" || b.status === utilityFilter)
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="font-semibold">Room {b.room}</div>
                          <div className="text-xs text-muted-foreground">Block {b.block}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium">
                          <div className="flex items-center gap-1.5">
                            {b.type === "Electricity" ? (
                              <Zap className="h-3.5 w-3.5 text-amber-500" />
                            ) : (
                              <Wifi className="h-3.5 w-3.5 text-blue-500" />
                            )}
                            {b.type}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">{b.dueDate}</td>
                        <td className="py-3.5 px-4 font-bold text-foreground">${b.amount}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${b.status === "paid" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300" : b.status === "overdue" ? "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"}`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right space-x-2">
                          {b.status !== "paid" && (
                            <>
                              <button
                                onClick={() => {
                                  setUtilityBills((prev) =>
                                    prev.map((bill) =>
                                      bill.id === b.id
                                        ? { ...bill, status: "paid" as const }
                                        : bill,
                                    ),
                                  );
                                  toast.success(
                                    `Payment recorded for Room ${b.room} ${b.type} bill.`,
                                  );
                                }}
                                className="rounded bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20"
                              >
                                Record Paid
                              </button>
                              <button
                                onClick={() => {
                                  toast.success(
                                    `Utility alert notice triggered & sent to Room ${b.room} guardian (Ramesh Sharma)!`,
                                  );
                                }}
                                className="rounded bg-accent/10 px-2 py-1 text-xs font-semibold text-accent hover:bg-accent/20"
                              >
                                Alert Parent
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setUtilityBills((prev) => prev.filter((bill) => bill.id !== b.id));
                              toast.info("Invoice deleted.");
                            }}
                            className="text-muted-foreground hover:text-red-500 p-1"
                          >
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {utilityBills.length === 0 && (
                <EmptyState
                  icon={Zap}
                  title="No invoices found"
                  description="Create a new utility invoice to get started."
                />
              )}
            </div>
          </Panel>
        </div>
      )}

      {tab === "leaves" && (
        <Panel title="In/Out Register (Gatepass)">
          <div className="space-y-3">
            {leaves.map((l) => (
              <div key={l._id || l.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4">
                <div>
                  <div className="font-medium text-sm">{l.studentName}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Out: {new Date(l.outTime).toLocaleString()} · Expected In: {new Date(l.expectedInTime).toLocaleString()}
                    {l.actualInTime ? ` · Actual In: ${new Date(l.actualInTime).toLocaleString()}` : ""}
                  </div>
                  <div className="text-sm mt-1">{l.reason}</div>
                </div>
                <div className="flex gap-2">
                  {l.status === "pending" ? (
                    <>
                      <button
                        onClick={async () => {
                          await apiClient(`/hostel/leaves/${l._id || l.id}/status`, { method: "PATCH", data: { status: "approved" } });
                          toast.success("Leave approved");
                          fetchData();
                        }}
                        className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          await apiClient(`/hostel/leaves/${l._id || l.id}/status`, { method: "PATCH", data: { status: "rejected" } });
                          toast.error("Leave rejected");
                          fetchData();
                        }}
                        className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/20"
                      >
                        Reject
                      </button>
                    </>
                  ) : l.status === "approved" && !l.actualInTime ? (
                    <button
                      onClick={async () => {
                        await apiClient(`/hostel/leaves/${l._id || l.id}/status`, { method: "PATCH", data: { status: "completed", actualInTime: new Date().toISOString() } });
                        toast.success("Student marked as returned");
                        fetchData();
                      }}
                      className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20"
                    >
                      Mark Returned
                    </button>
                  ) : (
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-muted text-muted-foreground capitalize">
                      {l.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {leaves.length === 0 && (
              <EmptyState icon={Users} title="No gatepasses" description="Students can apply for gatepasses from their portal." />
            )}
          </div>
        </Panel>
      )}

      {tab === "attendance" && (
        <Panel title="Daily Hostel Attendance">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Select session and date to view or mark attendance.</div>
            <button
              onClick={() => toast.success("Attendance marked for today's session!")}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Take Roll Call
            </button>
          </div>
          <div className="space-y-3">
            {attendance.map((a) => (
              <div key={a._id || a.id} className="rounded-lg border border-border p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">{new Date(a.date).toLocaleDateString()} · {a.session.charAt(0).toUpperCase() + a.session.slice(1)} Session</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Present: {a.presentIds?.length || 0} · Absent: {a.absentIds?.length || 0}
                </div>
              </div>
            ))}
            {attendance.length === 0 && (
              <EmptyState icon={CheckCircle} title="No attendance records" description="Start a new roll call to keep track of students." />
            )}
          </div>
        </Panel>
      )}

      {tab === "notices" && (
        <Panel
          title="Notice Board & Warden Communication"
          action={
            <button
              onClick={() => setShowNoticeForm(true)}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              New Notice
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notices.map((n) => (
              <div key={n._id || n.id} className="rounded-xl border border-border p-4 shadow-sm bg-card">
                <div className="font-semibold text-sm mb-1">{n.title}</div>
                <div className="text-xs text-muted-foreground mb-3">{new Date(n.createdAt).toLocaleDateString()} · Target: {n.target}</div>
                <div className="text-sm">{n.content}</div>
              </div>
            ))}
            {notices.length === 0 && (
              <EmptyState icon={AlertCircle} title="No notices" description="Post a notice to communicate with hostel students." />
            )}
          </div>
        </Panel>
      )}

      {showComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowComplaint(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">New Complaint</h2>
              <button
                onClick={() => setShowComplaint(false)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                try {
                  await apiClient("/hostel/complaints", {
                    method: "POST",
                    data: {
                      student_name: fd.get("student") as string,
                      room: fd.get("room") as string,
                      category: fd.get("category") as string,
                      description: fd.get("desc") as string,
                      status: "open"
                    }
                  });
                  toast.success("Complaint filed");
                  setShowComplaint(false);
                  fetchData();
                } catch (err) {
                  toast.error("Failed to file complaint");
                }
              }}
              className="space-y-3"
            >
              {[
                ["student", "Student Name"],
                ["room", "Room (e.g. A-101)"],
                ["desc", "Description"],
              ].map(([k, l]) => (
                <div key={k}>
                  <label className="mb-1 block text-sm font-medium">{l}</label>
                  <input
                    name={k}
                    required
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <select
                  name="category"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Pest Control</option>
                  <option>Furniture</option>
                  <option>Other</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Submit Complaint
              </button>
            </form>
          </div>
        </div>
      )}

      {showVisitor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowVisitor(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Log Visitor</h2>
              <button
                onClick={() => setShowVisitor(false)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                try {
                  await apiClient("/hostel/visitors", {
                    method: "POST",
                    data: {
                      visitorName: fd.get("visitor") as string,
                      studentName: fd.get("student") as string,
                      room: fd.get("room") as string,
                      purpose: fd.get("purpose") as string,
                      status: "checked-in"
                    }
                  });
                  toast.success("Visitor checked in");
                  setShowVisitor(false);
                  fetchData();
                } catch (err) {
                  toast.error("Failed to log visitor");
                }
              }}
              className="space-y-3"
            >
              {[
                ["visitor", "Visitor Name"],
                ["student", "Student Name"],
                ["room", "Room"],
                ["purpose", "Purpose"],
              ].map(([k, l]) => (
                <div key={k}>
                  <label className="mb-1 block text-sm font-medium">{l}</label>
                  <input
                    name={k}
                    required
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Check In
              </button>
            </form>
          </div>
        </div>
      )}
      {showUtilityModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowUtilityModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Issue New Utility Bill</h2>
              <button
                onClick={() => setShowUtilityModal(false)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const room = fd.get("room") as string;
                const type = fd.get("type") as string;
                const amount = Number(fd.get("amount"));
                const dueDate = fd.get("dueDate") as string;
                const block = room.startsWith("A") ? "A" : "B";

                setUtilityBills((prev) => [
                  ...prev,
                  {
                    id: genId(),
                    room,
                    block,
                    type,
                    amount,
                    dueDate,
                    status: "due" as const,
                  },
                ]);

                toast.success(
                  `New ${type} bill of $${amount} issued successfully for Room ${room}!`,
                );
                setShowUtilityModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">Room (e.g. A-101, B-201)</label>
                <select
                  name="room"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option>A-101</option>
                  <option>A-102</option>
                  <option>B-201</option>
                  <option>B-202</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Utility Type</label>
                <select
                  name="type"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option>Electricity</option>
                  <option>Wi-Fi</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Billing Amount ($)</label>
                <input
                  name="amount"
                  type="number"
                  required
                  defaultValue="100"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Due Date</label>
                <input
                  name="dueDate"
                  type="date"
                  required
                  defaultValue="2026-06-15"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Issue Bill
              </button>
            </form>
          </div>
        </div>
      )}

      {showNoticeForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowNoticeForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Post Notice</h2>
              <button
                onClick={() => setShowNoticeForm(false)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                try {
                  await apiClient("/hostel/notices", {
                    method: "POST",
                    data: {
                      title: fd.get("title") as string,
                      content: fd.get("content") as string,
                      target: fd.get("target") as string,
                    }
                  });
                  toast.success("Notice posted successfully");
                  setShowNoticeForm(false);
                  fetchData();
                } catch (err) {
                  toast.error("Failed to post notice");
                }
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
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Target Audience</label>
                <select
                  name="target"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="ALL">All Hostel Students</option>
                  <option value="BLOCK">Specific Block</option>
                </select>
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
