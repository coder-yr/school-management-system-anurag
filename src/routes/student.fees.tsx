import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Wallet, CheckCircle, CreditCard } from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";
import { useStore, genId } from "@/lib/store";
import { DEMO_STUDENT_ID } from "@/lib/demo-ids";

export const Route = createFileRoute("/student/fees")({ component: Page });

function Page() {
  const { store, dispatch } = useStore();
  const myFees = store.feeRecords.filter((f) => f.studentId === DEMO_STUDENT_ID);
  const myPayments = store.paymentTransactions.filter((p) => p.studentId === DEMO_STUDENT_ID);
  const totalDue = myFees.reduce((a, f) => a + f.due, 0);
  const totalPaid = myFees.reduce((a, f) => a + f.paid, 0);
  const [paying, setPaying] = useState(false);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);

  const handlePay = (feeId: string, amount: number) => {
    setPaying(true);
    setTimeout(() => {
      const receiptNo = `RCP-2025-${String(store.paymentTransactions.length + 1).padStart(3, "0")}`;
      dispatch({
        type: "ADD_PAYMENT",
        payload: {
          id: genId(),
          studentId: DEMO_STUDENT_ID,
          studentName: "Aarav Sharma",
          amount,
          date: new Date().toISOString().split("T")[0],
          method: "Online",
          receiptNo,
          category: "Tuition",
          status: "success",
        },
      });
      dispatch({
        type: "UPDATE_FEE_RECORD",
        payload: {
          id: feeId,
          updates: {
            paid: myFees.find((f) => f.id === feeId)!.paid + amount,
            due: myFees.find((f) => f.id === feeId)!.due - amount,
            status: myFees.find((f) => f.id === feeId)!.due - amount <= 0 ? "paid" : "partial",
          },
        },
      });
      toast.success("Payment successful!", {
        description: `₹${amount.toLocaleString()} paid. Receipt: ${receiptNo}`,
      });
      setShowReceipt(receiptNo);
      setPaying(false);
    }, 1000);
  };

  return (
    <div>
      <PageHeader title="Fees & Payments" subtitle="View dues and make payments" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <StatCard
          label="Total Paid"
          value={`₹${totalPaid.toLocaleString()}`}
          icon={CheckCircle}
          tone="success"
        />
        <StatCard
          label="Outstanding"
          value={`₹${totalDue.toLocaleString()}`}
          icon={Wallet}
          tone={totalDue > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Transactions"
          value={String(myPayments.length)}
          icon={CreditCard}
          tone="info"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Outstanding Dues">
          {myFees.filter((f) => f.due > 0).length > 0 ? (
            <div className="space-y-3">
              {myFees
                .filter((f) => f.due > 0)
                .map((f) => (
                  <div key={f.id} className="rounded-lg border border-border p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{f.category}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${f.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-[oklch(0.75_0.15_75)]/15 text-[oklch(0.50_0.15_75)]"}`}
                      >
                        {f.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Due: ₹{f.due.toLocaleString()} · By {f.dueDate}
                    </div>
                    <button
                      onClick={() => handlePay(f.id, f.due)}
                      disabled={paying}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {paying ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Pay ₹{f.due.toLocaleString()}
                        </>
                      )}
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle className="h-12 w-12 text-[oklch(0.45_0.15_155)] mb-3" />
              <div className="font-semibold">All Clear!</div>
              <div className="text-sm text-muted-foreground">No outstanding dues.</div>
            </div>
          )}
        </Panel>
        <Panel title="Payment History">
          <div className="space-y-3">
            {myPayments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <div className="text-sm font-medium">₹{p.amount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.date} · {p.method}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-[oklch(0.45_0.15_155)]">
                    {p.receiptNo}
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]">
                    Success
                  </span>
                </div>
              </div>
            ))}
          </div>
          {myPayments.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No transactions yet.
            </div>
          )}
        </Panel>
      </div>
      {showReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowReceipt(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl text-center"
          >
            <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)] mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold">Payment Confirmed</h2>
            <p className="text-sm text-muted-foreground mt-1">Receipt: {showReceipt}</p>
            <button
              onClick={() => setShowReceipt(null)}
              className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
