import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, EmptyState } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";
import { AlertCircle, Calendar, Plus, Users, CheckCircle, X } from "lucide-react";

export const Route = createFileRoute("/student/hostel")({
  head: () => ({ meta: [{ title: "Hostel · Campus OS" }] }),
  component: Page,
});

function Page() {
  const [tab, setTab] = useState<"room" | "leaves" | "complaints" | "notices">("room");
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  const [leaves, setLeaves] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  
  // Hardcoded for demo, would fetch from API
  const myRoom = { block: "A", roomNo: "101", capacity: 4, occupied: 2, status: "available" };

  const fetchData = async () => {
    try {
      const [lRes, cRes, nRes] = await Promise.all([
        apiClient<any>("/hostel/leaves"), // Would be filtered to 'my' in backend
        apiClient<any>("/hostel/complaints"),
        apiClient<any>("/hostel/notices"),
      ]);
      setLeaves(Array.isArray(lRes) ? lRes : lRes?.data || []);
      setComplaints(Array.isArray(cRes) ? cRes : cRes?.data || []);
      setNotices(Array.isArray(nRes) ? nRes : nRes?.data || []);
    } catch (err) {
      toast.error("Failed to load hostel data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <PageHeader
        title="My Hostel"
        subtitle="Manage your room, gatepasses, and view notices"
      />

      <div className="flex flex-wrap gap-1 mb-6 rounded-lg bg-muted p-1">
        {(
          [
            ["room", "My Room"],
            ["leaves", "Gatepass"],
            ["complaints", "Complaints"],
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

      {tab === "room" && (
        <Panel title="Room Details">
          <div className="rounded-xl border border-border p-6 shadow-sm bg-card max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Block {myRoom.block} · Room {myRoom.roomNo}</h3>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-3 py-1 text-xs font-medium">Allocated</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-medium">{myRoom.capacity} Beds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Occupied</span>
                <span className="font-medium">{myRoom.occupied} Students</span>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {tab === "leaves" && (
        <Panel
          title="My Gatepasses"
          action={
            <button onClick={() => setShowLeaveForm(true)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Plus className="h-4 w-4" /> Apply for Gatepass
            </button>
          }
        >
          <div className="space-y-3">
            {leaves.map((l) => (
              <div key={l.id || l._id} className="rounded-lg border border-border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{l.reason}</div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${l.status === 'pending' ? 'bg-amber-100 text-amber-800' : l.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}`}>
                    {l.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Out: {new Date(l.outTime).toLocaleString()} <br/> Expected In: {new Date(l.expectedInTime).toLocaleString()}
                </div>
              </div>
            ))}
            {leaves.length === 0 && <EmptyState icon={Calendar} title="No active gatepasses" description="Apply for a gatepass to leave the campus." />}
          </div>
        </Panel>
      )}

      {tab === "notices" && (
        <Panel title="Hostel Notices">
          <div className="grid grid-cols-1 gap-4">
            {notices.map((n) => (
              <div key={n.id || n._id} className="rounded-lg border border-border p-4 bg-card">
                <h3 className="font-semibold">{n.title}</h3>
                <div className="text-xs text-muted-foreground mb-2">{new Date(n.createdAt).toLocaleDateString()}</div>
                <p className="text-sm">{n.content}</p>
              </div>
            ))}
            {notices.length === 0 && <EmptyState icon={AlertCircle} title="No notices" description="There are no recent notices from the warden." />}
          </div>
        </Panel>
      )}

      {tab === "complaints" && (
        <Panel
          title="My Complaints"
          action={
            <button onClick={() => setShowComplaintForm(true)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Plus className="h-4 w-4" /> Log Complaint
            </button>
          }
        >
          <div className="space-y-3">
            {complaints.filter(c => c.student_name === "Current User").map((c) => (
              <div key={c.id || c._id} className="rounded-lg border border-border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{c.category} Issue</div>
                  <span className="rounded-full px-2 py-1 text-xs font-medium capitalize bg-muted text-muted-foreground">
                    {c.status}
                  </span>
                </div>
                <div className="text-sm">{c.description}</div>
              </div>
            ))}
            {complaints.filter(c => c.student_name === "Current User").length === 0 && <EmptyState icon={CheckCircle} title="No complaints" description="You have not logged any complaints." />}
          </div>
        </Panel>
      )}

      {showLeaveForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowLeaveForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Apply for Gatepass</h2>
              <button onClick={() => setShowLeaveForm(false)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                try {
                  await apiClient("/hostel/leaves", {
                    method: "POST",
                    data: {
                      outTime: new Date(fd.get("outTime") as string).toISOString(),
                      expectedInTime: new Date(fd.get("inTime") as string).toISOString(),
                      reason: fd.get("reason"),
                    }
                  });
                  toast.success("Gatepass request submitted");
                  setShowLeaveForm(false);
                  fetchData();
                } catch (err) {
                  toast.error("Failed to submit request");
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">Out Time</label>
                <input name="outTime" type="datetime-local" required className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Expected In Time</label>
                <input name="inTime" type="datetime-local" required className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Reason</label>
                <textarea name="reason" required rows={3} className="w-full rounded-lg border border-border bg-background p-3 text-sm"></textarea>
              </div>
              <button type="submit" className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
