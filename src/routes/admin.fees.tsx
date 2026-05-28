import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Wallet, AlertTriangle, CheckCircle, Search, Plus, X, Settings } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PageHeader, StatCard, Panel, EmptyState } from "@/components/module-shell";
import { useStore, genId } from "@/lib/store";

export const Route = createFileRoute("/admin/fees")({
  head: () => ({ meta: [{ title: "Fees & Finance · Campus OS" }] }),
  component: Page,
});

function Page() {
  const { store, dispatch } = useStore();
  const [tab, setTab] = useState<"overview" | "dues" | "categories">("overview");
  const [search, setSearch] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  const totalCollected = store.feeRecords.reduce((a, f) => a + f.paid, 0);
  const totalDue = store.feeRecords.reduce((a, f) => a + f.due, 0);
  const overdue = store.feeRecords.filter((f) => f.status === "overdue").length;
  const paid = store.feeRecords.filter((f) => f.status === "paid").length;

  const pieData = [
    { name: "Collected", value: totalCollected, color: "oklch(0.55 0.15 155)" },
    { name: "Pending", value: totalDue, color: "oklch(0.75 0.15 75)" },
  ];

  const filteredDues = store.feeRecords.filter(
    (f) => f.due > 0 && f.studentName.toLowerCase().includes(search.toLowerCase()),
  );

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
            {store.paymentTransactions.length > 0 ? (
              <div className="space-y-3">
                {store.paymentTransactions.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{p.studentName}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.date} · {p.method}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[oklch(0.45_0.15_155)]">
                        ₹{p.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">{p.receiptNo}</div>
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
                {filteredDues.map((f) => (
                  <tr key={f.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-medium">{f.studentName}</td>
                    <td className="py-3 pr-4">{f.grade}</td>
                    <td className="py-3 pr-4">₹{f.amount.toLocaleString()}</td>
                    <td className="py-3 pr-4">₹{f.paid.toLocaleString()}</td>
                    <td className="py-3 pr-4 font-medium text-destructive">
                      ₹{f.due.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{f.dueDate}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${f.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]"}`}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {filteredDues.map((f) => (
              <div key={f.id} className="rounded-lg border border-border p-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{f.studentName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${f.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]"}`}
                  >
                    {f.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Due: ₹{f.due.toLocaleString()} · By {f.dueDate}
                </div>
              </div>
            ))}
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
            {store.feeCategories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-accent" />
                  <div>
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.description} · {c.frequency}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">₹{c.amount.toLocaleString()}</span>
                  <button
                    onClick={() => {
                      dispatch({ type: "DELETE_FEE_CATEGORY", payload: c.id });
                      toast.success("Category deleted");
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
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                dispatch({
                  type: "ADD_FEE_CATEGORY",
                  payload: {
                    id: genId(),
                    name: fd.get("name") as string,
                    amount: Number(fd.get("amount")),
                    frequency: fd.get("frequency") as string,
                    description: fd.get("description") as string,
                  },
                });
                toast.success("Category added");
                setShowAddCat(false);
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
