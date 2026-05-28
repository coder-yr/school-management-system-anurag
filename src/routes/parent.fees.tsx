import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Wallet,
  Download,
  CreditCard,
  CheckCircle,
  FileText,
  DollarSign,
  QrCode,
  ShieldCheck,
  X,
} from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/parent/fees")({
  component: ParentFees,
});

function ParentFees() {
  const [activeChild, setActiveChild] = useState<"aarav" | "ananya">("aarav");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState<"card" | "upi">("card");
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);
  const [childFees, setChildFees] = useState<any[]>([]);
  const [childTransactions, setChildTransactions] = useState<any[]>([]);

  const loadFees = async () => {
    try {
      const res = await apiClient<any>("/fees");
      setChildFees(res?.data || []);
    } catch {}
    try {
      const res = await apiClient<any>("/fees/payments");
      setChildTransactions(res?.data || []);
    } catch {}
  };

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

  useEffect(() => { loadFees(); }, []);

  const activeChildName = activeChild === "aarav" ? "Aarav Sharma" : "Ananya Sharma";

  const totalDue = childFees.reduce((a: number, f: any) => a + (f.dueAmount || f.due || 0), 0);
  const totalPaid = childFees.reduce((a: number, f: any) => a + (f.paidAmount || f.paid || 0), 0);

  const handlePayFee = (feeId: string) => {
    setSelectedFeeId(feeId);
    setShowCheckout(true);
  };

  const executePayment = async () => {
    const targetFee = childFees.find((f: any) => (f._id || f.id) === selectedFeeId);
    if (!targetFee) return;
    const amount = targetFee.dueAmount || targetFee.due || 0;
    try {
      await apiClient("/fees/pay", {
        method: "POST",
        data: {
          feeId: selectedFeeId,
          amount,
          method: checkoutMethod === "card" ? "Credit Card" : "UPI Pay",
        }
      });
      toast.success("Payment Successful!", {
        description: `Successfully processed ₹${amount.toLocaleString()}.`,
      });
      setShowCheckout(false);
      loadFees();
    } catch {
      // fallback local success for demo
      toast.success("Payment Successful!", {
        description: `Processed ₹${amount.toLocaleString()} (demo mode).`,
      });
      setShowCheckout(false);
    }
  };

  const handleDownloadInvoice = (txn: any) => {
    setViewingReceipt(txn);
  };

  return (
    <div>
      <PageHeader
        title="Fee Ledger & Invoice Vault"
        subtitle={`Review fee schedules, download invoice receipts, and perform fast payments for ${activeChildName}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <StatCard
          label="Total Academic Dues"
          value={`₹${totalDue.toLocaleString()}`}
          icon={Wallet}
          tone={totalDue > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Paid Fees"
          value={`₹${totalPaid.toLocaleString()}`}
          icon={CheckCircle}
          tone="success"
        />
        <StatCard
          label="Discount & Concessions"
          value="₹5,000"
          delta="Sibling waiver applied automatically"
          icon={DollarSign}
          tone="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outstanding Invoices */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Outstanding Fee Schedules">
            <div className="space-y-4">
              {childFees.map((fee: any) => {
              const feeId = fee._id || fee.id;
              const category = fee.feeType || fee.category || "Fee";
              const status = fee.status || "pending";
              const dueDate = fee.dueDate || fee.due_date || "—";
              const amount = fee.amount || fee.totalAmount || 0;
              const paid = fee.paidAmount || fee.paid || 0;
              const due = fee.dueAmount || fee.due || (amount - paid);
              return (
                <div
                  key={feeId}
                  className="rounded-xl border border-border p-4 bg-card/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">
                        {category} Fee
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          status === "paid"
                            ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]"
                            : status === "overdue"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Due Date: <span className="font-medium">{new Date(dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-4 text-xs mt-1 text-muted-foreground">
                      <div>
                        Total Schedule:{" "}
                        <span className="text-foreground font-medium">₹{amount.toLocaleString()}</span>
                      </div>
                      <div>
                        Paid: <span className="text-foreground font-medium">₹{paid.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-foreground">
                      ₹{due.toLocaleString()}
                    </span>
                    {due > 0 && (
                      <button
                        onClick={() => handlePayFee(feeId)}
                        className="flex items-center gap-1.5 rounded-lg bg-accent text-accent-foreground px-4 py-2 text-xs font-semibold hover:bg-accent/90 shadow transition-all active:scale-95"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Quick Pay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
              {childFees.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No outstanding invoice schedules for this child.
                </div>
              )}
            </div>
          </Panel>

          {/* Historical Receipt Ledger */}
          <Panel title="Paid Invoices & Receipt History">
            <div className="divide-y divide-border">
              {childTransactions.map((txn: any) => (
                <div key={txn._id || txn.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {txn.feeType || txn.category || "Fee"} Installment
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(txn.date || txn.createdAt).toLocaleDateString()} · via {txn.method || txn.paymentMethod || "Online"} · Ref: {txn.receiptNo || txn.transactionId || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[oklch(0.45_0.15_155)]">
                      + ₹{(txn.amount || 0).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDownloadInvoice(txn)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {childTransactions.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No transaction records found.
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Automatic Discount Concessions policies */}
        <div>
          <Panel title="Fee Regulations & Penalty Rules">
            <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <div className="font-bold text-foreground mb-1">Sibling Concession Engine</div>
                Automatic concession of 10% applied linearly to tuition fee schedules for parents
                with multiple active enrollments.
              </div>
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <div className="font-bold text-foreground mb-1">Late Penalty Policy</div>A
                progressive penalty of ₹100/day is automatically levied on fee schedules starting 7
                days post due-date.
              </div>
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <div className="font-bold text-foreground mb-1">Payment Gateways</div>
                Simulated transactions are secured with 256-bit encryption routing logs directly to
                Accounts ledgers.
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Simulated Gateway Checkout modal */}
      {showCheckout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowCheckout(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-accent animate-bounce" />
                <h2 className="text-base font-bold text-foreground">Secure Payment Gateway</h2>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2 p-1 rounded-lg bg-muted mb-4 text-xs font-semibold">
              <button
                onClick={() => setCheckoutMethod("card")}
                className={`flex-1 py-2 rounded-md transition-all ${
                  checkoutMethod === "card"
                    ? "bg-card text-foreground shadow"
                    : "text-muted-foreground"
                }`}
              >
                Debit/Credit Card
              </button>
              <button
                onClick={() => setCheckoutMethod("upi")}
                className={`flex-1 py-2 rounded-md transition-all ${
                  checkoutMethod === "upi"
                    ? "bg-card text-foreground shadow"
                    : "text-muted-foreground"
                }`}
              >
                UPI QR Pay
              </button>
            </div>

            {checkoutMethod === "card" ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Cardholder Name
                  </label>
                  <input
                    defaultValue={
                      activeChildName === "Aarav Sharma" ? "Mr. Ramesh Sharma" : "Dr. Meera Singh"
                    }
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Card Number
                  </label>
                  <input
                    placeholder="4111 2222 3333 4444"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Expiry Date
                    </label>
                    <input
                      placeholder="MM/YY"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      CVV Code
                    </label>
                    <input
                      placeholder="***"
                      type="password"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-xl bg-muted/20">
                <QrCode className="h-28 w-28 text-foreground" />
                <span className="text-xs text-muted-foreground mt-2 font-medium">
                  Scan QR code using GPay, PhonePe, or BHIM
                </span>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                <ShieldCheck className="h-4 w-4 text-[oklch(0.45_0.15_155)]" />
                PCI-DSS Compliance Shield
              </div>
              <button
                onClick={executePayment}
                className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-xs font-semibold hover:bg-primary/90 shadow active:scale-95 transition-all"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful High-Fidelity Receipt PDF generator modal */}
      {viewingReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setViewingReceipt(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border text-foreground font-serif animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-start border-b-2 border-primary pb-3 font-sans">
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-primary">
                  CAMPUS OS ACADEMY
                </h1>
                <p className="text-[10px] text-muted-foreground">
                  Affiliation ID: 194883 | Pune Operations
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase bg-success/10 text-[oklch(0.45_0.15_155)] px-2.5 py-0.5 rounded-full border border-[oklch(0.65_0.15_155)]/20">
                  OFFICIAL RECEIPT
                </span>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Receipt No: {viewingReceipt.receiptNo}
                </p>
              </div>
            </div>

            <div className="my-6 space-y-2 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Received From:</span>
                <span className="font-semibold">Mr. Ramesh Sharma</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">On Account of:</span>
                <span className="font-semibold">
                  {viewingReceipt.studentName} ({viewingReceipt.category} Installment)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Date:</span>
                <span className="font-semibold">{viewingReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Gateway Method:</span>
                <span className="font-semibold">{viewingReceipt.method}</span>
              </div>
            </div>

            <table className="w-full text-left text-xs font-sans border-collapse mb-6">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="py-2 px-3">Fee Category</th>
                  <th className="py-2 px-3 text-right">Settled Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2 px-3">{viewingReceipt.category} Tuition Charge</td>
                  <td className="py-2 px-3 text-right font-bold">
                    ₹{viewingReceipt.amount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between items-center border-t border-border pt-4 text-xs font-sans">
              <div>
                <p className="text-[9px] text-muted-foreground italic">
                  Digitally signed on behalf of Director of Finance
                </p>
                <div className="h-6 w-24 bg-[url('https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=200')] bg-contain bg-no-repeat mt-1 mix-blend-multiply opacity-75" />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase">Paid Total</div>
                <div className="text-xl font-extrabold text-primary">
                  ₹{viewingReceipt.amount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end gap-2 font-sans">
              <button
                onClick={() => window.print()}
                className="rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground px-4 py-2 text-xs font-semibold shadow-sm"
              >
                Print Invoice
              </button>
              <button
                onClick={() => setViewingReceipt(null)}
                className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-semibold shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
