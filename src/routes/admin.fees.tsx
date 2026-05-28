import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Wallet, AlertTriangle, CheckCircle, Search, Plus, X, Settings } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PageHeader, StatCard, Panel, EmptyState } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/fees")({
  head: () => ({ meta: [{ title: "Fees & Finance · Campus OS" }] }),
  component: Page,
});

function Page() {
  const [tab, setTab] = useState<"overview" | "dues" | "categories">("overview");
  const [search, setSearch] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<any[]>([]);
  const [feeCategories, setFeeCategories] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [feesRes, payRes, structRes] = await Promise.all([
        apiClient<any>("/fees"),
        apiClient<any>("/fees/payments"),
        apiClient<any>("/fees/structures")
      ]);
      setFeeRecords(feesRes?.data || []);
      setPaymentTransactions(payRes?.data || []);
      setFeeCategories(structRes?.data || []);
    } catch (err) {
      toast.error("Failed to load fee data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCollected = feeRecords.reduce((a, f) => a + (f.paidAmount || 0), 0);
  const totalDue = feeRecords.reduce((a, f) => a + ((f.amount || 0) - (f.discountAmount || 0) - (f.paidAmount || 0)), 0);
  const overdue = feeRecords.filter((f) => f.status === "OVERDUE").length;
  const paid = feeRecords.filter((f) => f.status === "PAID").length;

  const pieData = [
    { name: "Collected", value: totalCollected, color: "oklch(0.55 0.15 155)" },
    { name: "Pending", value: totalDue, color: "oklch(0.75 0.15 75)" },
  ];

  const filteredDues = feeRecords.filter((f) => {
    const dueAmount = (f.amount || 0) - (f.discountAmount || 0) - (f.paidAmount || 0);
    const sName = `${f.studentId?.user?.firstName || ''} ${f.studentId?.user?.lastName || ''}`.toLowerCase();
    return dueAmount > 0 && sName.includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader title="Fees & Finance" subtitle="Track collections, dues, and fee categories" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Total Collected"
          value={`₹${(totalCollected / 100000).toFixed(1)}L`}
          icon={Wallet}
          tone="success"
        />
        <StatCard
          label="Outstanding Dues"
          value={`₹${(totalDue / 100000).toFixed(1)}L`}
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          label="Overdue Accounts"
          value={String(overdue)}
          delta="Needs follow-up"
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard label="Fully Paid" value={String(paid)} icon={CheckCircle} tone="success" />
      </div>

      <div className="flex gap-1 mb-4 rounded-lg bg-muted p-1">
        {(
          [
            ["overview", "Overview"],
            ["dues", "Outstanding Dues"],
            ["categories", "Fee Categories"],
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

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Collection Breakdown">
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                  {d.name}: ₹{(d.value / 100000).toFixed(1)}L
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Recent Payments">
            {paymentTransactions.length > 0 ? (
              <div className="space-y-3">
                {paymentTransactions.slice(0, 5).map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{p.studentId?.user?.firstName} {p.studentId?.user?.lastName}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(p.paymentDate).toLocaleDateString()} · {p.paymentMethod}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[oklch(0.45_0.15_155)]">
                        ₹{p.amountPaid?.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">{p.receiptNumber}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wallet}
                title="No payments yet"
                description="Payments will appear here."
              />
            )}
          </Panel>
        </div>
      )}

      {tab === "dues" && (
        <Panel title="Outstanding Dues">
          <div className="mb-4 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student…"
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Student</th>
                  <th className="pb-3 pr-4">Grade</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Paid</th>
                  <th className="pb-3 pr-4">Due</th>
                  <th className="pb-3 pr-4">Due Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDues.map((f) => {
                  const due = (f.amount || 0) - (f.discountAmount || 0) - (f.paidAmount || 0);
                  return (
                    <tr key={f._id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 pr-4 font-medium">{f.studentId?.user?.firstName} {f.studentId?.user?.lastName}</td>
                      <td className="py-3 pr-4">{f.feeType}</td>
                      <td className="py-3 pr-4">₹{f.amount?.toLocaleString()}</td>
                      <td className="py-3 pr-4">₹{f.paidAmount?.toLocaleString()}</td>
                      <td className="py-3 pr-4 font-medium text-destructive">
                        ₹{due.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{new Date(f.dueDate).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${f.status === "OVERDUE" ? "bg-destructive/10 text-destructive" : "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]"}`}
                        >
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {filteredDues.map((f) => {
              const due = (f.amount || 0) - (f.discountAmount || 0) - (f.paidAmount || 0);
              return (
                <div key={f._id} className="rounded-lg border border-border p-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{f.studentId?.user?.firstName} {f.studentId?.user?.lastName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${f.status === "OVERDUE" ? "bg-destructive/10 text-destructive" : "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]"}`}
                    >
                      {f.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Due: ₹{due.toLocaleString()} · By {new Date(f.dueDate).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
          {filteredDues.length === 0 && (
            <EmptyState
              icon={CheckCircle}
              title="No outstanding dues"
              description="All fees are cleared!"
            />
          )}
        </Panel>
      )}

      {tab === "categories" && (
        <Panel
          title="Fee Categories"
          action={
            <button
              onClick={() => setShowAddCat(true)}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Category
            </button>
          }
        >
          <div className="space-y-3">
            {feeCategories.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-accent" />
                  <div>
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">₹{c.amount?.toLocaleString()}</span>
                  <button
                    onClick={() => {
                      toast.error("Deleting fee structures not implemented in backend API yet");
                    }}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {showAddCat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAddCat(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Fee Category</h2>
              <button
                onClick={() => setShowAddCat(false)}
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
                  await apiClient("/fees/structures", {
                    method: "POST",
                    data: {
                      name: fd.get("name") as string,
                      amount: Number(fd.get("amount")),
                      description: fd.get("description") as string,
                      feeType: "TUITION",
                      dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
                    }
                  });
                  toast.success("Category added");
                  setShowAddCat(false);
                  fetchData();
                } catch (err) {
                  toast.error("Failed to add category");
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  name="name"
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Amount (₹)</label>
                <input
                  name="amount"
                  type="number"
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Frequency</label>
                <select
                  name="frequency"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option>Annual</option>
                  <option>Semi-Annual</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <input
                  name="description"
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Add Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
