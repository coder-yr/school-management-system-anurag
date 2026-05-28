import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Utensils,
  Calendar,
  AlertTriangle,
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  FileText,
  DollarSign,
  ShieldAlert,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
} from "lucide-react";
import { PageHeader, StatCard, Panel, EmptyState } from "@/components/module-shell";

const genId = () => Math.random().toString(36).substr(2, 9);

export const Route = createFileRoute("/admin/canteen")({
  head: () => ({ meta: [{ title: "Canteen & Mess OS · Campus OS" }] }),
  component: CanteenMessPage,
});

interface MealMenu {
  id: string;
  day: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
}

interface AllergyRecord {
  id: string;
  studentName: string;
  grade: string;
  allergens: string[];
  severity: "High" | "Medium" | "Low";
  status: "Active" | "Monitored";
}

interface RFIDTransaction {
  id: string;
  studentName: string;
  grade: string;
  rfidTag: string;
  amount: number;
  item: string;
  type: "Debit" | "Credit";
  timestamp: string;
}

interface RFIDWallet {
  id: string;
  studentName: string;
  grade: string;
  rfidTag: string;
  balance: number;
  status: "Active" | "Frozen";
}

function CanteenMessPage() {
  const [tab, setTab] = useState<"menu" | "allergies" | "rfid">("menu");

  // State: Mess Menu
  const [weeklyMenu, setWeeklyMenu] = useState<MealMenu[]>([
    {
      id: "m1",
      day: "Monday",
      breakfast: "Idli Sambar, Chutney, Milk",
      lunch: "Paneer Butter Masala, Roti, Dal, Rice, Curd",
      snacks: "Tea, Samosa",
      dinner: "Veg Pulao, Kadhi, Roti, Kheer",
    },
    {
      id: "m2",
      day: "Tuesday",
      breakfast: "Aloo Paratha, Butter, Curd",
      lunch: "Mix Veg, Tadka Dal, Jeera Rice, Phulka, Salad",
      snacks: "Milk, Cookies",
      dinner: "Chole Bhature, Rice, Halwa",
    },
    {
      id: "m3",
      day: "Wednesday",
      breakfast: "Poha, Sev, Sprouts, Tea",
      lunch: "Bhindi Masala, Sambhar Rice, Chapati, Papad",
      snacks: "Juice, Veg Cutlet",
      dinner: "Egg Curry / Malai Kofta, Rice, Roti, Custard",
    },
    {
      id: "m4",
      day: "Thursday",
      breakfast: "Veg Sandwich, Fruits, Juice",
      lunch: "Rajma Masala, Steamed Rice, Butter Roti, Raita",
      snacks: "Tea, Veg Puff",
      dinner: "Aloo Gobi, Moong Dal, Roti, Kheer",
    },
    {
      id: "m5",
      day: "Friday",
      breakfast: "Upma, Kesari Bath, Coffee",
      lunch: "Veg Biryani, Salan, Mirchi Raita, Fryums",
      snacks: "Milk, Banana Cakes",
      dinner: "Palak Paneer, Phulka, Rice, Gulab Jamun",
    },
    {
      id: "m6",
      day: "Saturday",
      breakfast: "Puri Bhaji, Fruit Platter, Milk",
      lunch: "Dal Makhani, Jeera Aloo, Tandoori Roti, Salad",
      snacks: "Coffee, Pakora",
      dinner: "Hakka Noodles, Manchurian, Fried Rice",
    },
    {
      id: "m7",
      day: "Sunday",
      breakfast: "Pancakes, Maple Syrup, Juice",
      lunch: "Shahi Paneer, Pulao, Butter Naan, Ice Cream",
      snacks: "Tea, Sandwiches",
      dinner: "Khichdi Kadhi, Papad, Pickle, Fruit Salad",
    },
  ]);

  // State: Allergy Records
  const [allergies, setAllergies] = useState<AllergyRecord[]>([
    {
      id: "a1",
      studentName: "Aarav Sharma",
      grade: "Grade 6-A",
      allergens: ["Peanuts", "Gluten"],
      severity: "High",
      status: "Active",
    },
    {
      id: "a2",
      studentName: "Ananya Sharma",
      grade: "Grade 9-B",
      allergens: ["Dairy"],
      severity: "Medium",
      status: "Active",
    },
    {
      id: "a3",
      studentName: "Rohan Das",
      grade: "Grade 11-C",
      allergens: ["Soy", "Seafood"],
      severity: "High",
      status: "Active",
    },
    {
      id: "a4",
      studentName: "Meera Nair",
      grade: "Grade 8-A",
      allergens: ["Tree Nuts"],
      severity: "Low",
      status: "Monitored",
    },
  ]);

  // State: RFID Transactions Ledger
  const [transactions, setTransactions] = useState<RFIDTransaction[]>([
    {
      id: "t1",
      studentName: "Aarav Sharma",
      grade: "Grade 6-A",
      rfidTag: "RFID-9981-A",
      amount: 4.5,
      item: "Paneer Biryani Lunch",
      type: "Debit",
      timestamp: "Today, 12:45 PM",
    },
    {
      id: "t2",
      studentName: "Ananya Sharma",
      grade: "Grade 9-B",
      rfidTag: "RFID-4412-B",
      amount: 2.0,
      item: "Apple Juice & Muffin",
      type: "Debit",
      timestamp: "Today, 11:15 AM",
    },
    {
      id: "t3",
      studentName: "Kabir Mehta",
      grade: "Grade 12-A",
      rfidTag: "RFID-1029-X",
      amount: 50.0,
      item: "Online Parent Top-up",
      type: "Credit",
      timestamp: "Yesterday, 06:30 PM",
    },
    {
      id: "t4",
      studentName: "Sanya Gupta",
      grade: "Grade 10-A",
      rfidTag: "RFID-5522-Y",
      amount: 5.5,
      item: "Canteen Buffet Meal",
      type: "Debit",
      timestamp: "Yesterday, 01:10 PM",
    },
  ]);

  // State: RFID Wallets Registry
  const [wallets, setWallets] = useState<RFIDWallet[]>([
    {
      id: "w1",
      studentName: "Aarav Sharma",
      grade: "Grade 6-A",
      rfidTag: "RFID-9981-A",
      balance: 35.5,
      status: "Active",
    },
    {
      id: "w2",
      studentName: "Ananya Sharma",
      grade: "Grade 9-B",
      rfidTag: "RFID-4412-B",
      balance: 48.0,
      status: "Active",
    },
    {
      id: "w3",
      studentName: "Rohan Das",
      grade: "Grade 11-C",
      rfidTag: "RFID-1029-A",
      balance: 12.5,
      status: "Active",
    },
    {
      id: "w4",
      studentName: "Meera Nair",
      grade: "Grade 8-A",
      rfidTag: "RFID-9812-C",
      balance: 5.0,
      status: "Active",
    },
    {
      id: "w5",
      studentName: "Kabir Mehta",
      grade: "Grade 12-A",
      rfidTag: "RFID-1029-X",
      balance: 114.5,
      status: "Active",
    },
    {
      id: "w6",
      studentName: "Sanya Gupta",
      grade: "Grade 10-A",
      rfidTag: "RFID-5522-Y",
      balance: 8.2,
      status: "Frozen",
    },
  ]);

  // Search filter for RFID
  const [rfidSearch, setRfidSearch] = useState("");

  // Modal controls
  const [editingMenu, setEditingMenu] = useState<MealMenu | null>(null);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState("");

  // Handlers
  const handleUpdateMenu = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMenu) return;

    setWeeklyMenu((prev) => prev.map((m) => (m.id === editingMenu.id ? editingMenu : m)));
    toast.success(`Mess menu for ${editingMenu.day} updated successfully!`);
    setEditingMenu(null);
  };

  const handleAddAllergy = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const studentName = fd.get("studentName") as string;
    const grade = fd.get("grade") as string;
    const allergenStr = fd.get("allergens") as string;
    const severity = fd.get("severity") as "High" | "Medium" | "Low";

    const newRecord: AllergyRecord = {
      id: genId(),
      studentName,
      grade,
      allergens: allergenStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      severity,
      status: "Active",
    };

    setAllergies((prev) => [newRecord, ...prev]);
    toast.success(`Dietary warning listed for ${studentName}!`);
    setShowAllergyModal(false);
  };

  const handleTopup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const walletId = fd.get("walletId") as string;
    const amount = Number(fd.get("amount"));

    const wallet = wallets.find((w) => w.id === walletId);
    if (!wallet) return;

    setWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, balance: w.balance + amount } : w)),
    );

    // Register transaction
    const newTx: RFIDTransaction = {
      id: genId(),
      studentName: wallet.studentName,
      grade: wallet.grade,
      rfidTag: wallet.rfidTag,
      amount,
      item: "Front Desk Top-Up",
      type: "Credit",
      timestamp: "Just Now",
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Deposited $${amount} into ${wallet.studentName}'s RFID wallet!`);
    setShowTopupModal(false);
  };

  const handleToggleFreeze = (id: string) => {
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const nextStatus = w.status === "Active" ? "Frozen" : "Active";
          toast.info(`RFID Tag status changed: ${w.studentName}'s tag is now ${nextStatus}.`);
          return { ...w, status: nextStatus };
        }
        return w;
      }),
    );
  };

  const filteredWallets = wallets.filter(
    (w) =>
      w.studentName.toLowerCase().includes(rfidSearch.toLowerCase()) ||
      w.rfidTag.toLowerCase().includes(rfidSearch.toLowerCase()) ||
      w.grade.toLowerCase().includes(rfidSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess & Cafeteria Administration"
        subtitle="Manage weekly hosteller meals, active student allergies, and RFID contactless digital wallets"
      />

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Meal Services"
          value="4 (B, L, S, D)"
          icon={Utensils}
          tone="info"
        />
        <StatCard
          label="High Risk Allergy Alerts"
          value={String(allergies.filter((a) => a.severity === "High").length)}
          icon={ShieldAlert}
          tone="warning"
        />
        <StatCard
          label="Active RFID Tags"
          value={String(wallets.filter((w) => w.status === "Active").length)}
          icon={CreditCard}
          tone="success"
        />
        <StatCard
          label="Total Wallet Reserves"
          value={`$${wallets.reduce((acc, w) => acc + w.balance, 0).toFixed(2)}`}
          icon={DollarSign}
          tone="success"
        />
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 max-w-md">
        {(
          [
            ["menu", "Mess Menu Scheduler", Utensils],
            ["allergies", "Dietary & Allergies", AlertTriangle],
            ["rfid", "RFID Card Wallets", CreditCard],
          ] as const
        ).map(([k, l, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all ${
              tab === k
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {l}
          </button>
        ))}
      </div>

      {/* TAB 1: Weekly Mess Menu Scheduler */}
      {tab === "menu" && (
        <div className="space-y-6">
          <Panel
            title="Weekly Catering Calendar (Boarding Hostel & Day School Canteen)"
            action={
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Calendar className="h-4 w-4 text-accent" />
                Cycle: Term 1 Active Mess Menu
              </span>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase bg-muted/30">
                    <th className="py-3 px-4 rounded-tl-lg">Day</th>
                    <th className="py-3 px-4">Breakfast (07:30 - 08:30)</th>
                    <th className="py-3 px-4">Lunch (12:30 - 13:45)</th>
                    <th className="py-3 px-4">High Tea / Snacks (16:30)</th>
                    <th className="py-3 px-4">Dinner (19:30 - 21:00)</th>
                    <th className="py-3 px-4 text-right rounded-tr-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {weeklyMenu.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-foreground">{m.day}</td>
                      <td className="py-4 px-4 text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                        {m.breakfast}
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                        {m.lunch}
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground leading-relaxed max-w-[150px]">
                        {m.snacks}
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                        {m.dinner}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setEditingMenu(m)}
                          className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent hover:bg-accent hover:text-white transition-all"
                        >
                          Modify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 2: Student Allergies Index Matrix */}
      {tab === "allergies" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Panel
              title="Dietary Hazards & Allergy Screening Registry"
              action={
                <button
                  onClick={() => setShowAllergyModal(true)}
                  className="flex items-center gap-1.5 text-xs text-accent hover:underline font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Allergy Warning
                </button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                      <th className="pb-3 pr-4">Student Profile</th>
                      <th className="pb-3 px-4">Class</th>
                      <th className="pb-3 px-4">Allergen Flags</th>
                      <th className="pb-3 px-4">Risk Severity</th>
                      <th className="pb-3 px-4">Verification</th>
                      <th className="pb-3 pl-4 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allergies.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                              {a.studentName
                                .split(" ")
                                .map((w) => w[0])
                                .join("")}
                            </div>
                            <span className="font-semibold text-foreground">{a.studentName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-muted-foreground">
                          {a.grade}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {a.allergens.map((alg, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-red-100 dark:bg-red-950/40 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-300"
                              >
                                {alg}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              a.severity === "High"
                                ? "bg-red-500/15 text-red-500"
                                : a.severity === "Medium"
                                  ? "bg-orange-500/15 text-orange-500"
                                  : "bg-blue-500/15 text-blue-500"
                            }`}
                          >
                            {a.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Parent Certified
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <button
                            onClick={() => {
                              setAllergies((prev) => prev.filter((item) => item.id !== a.id));
                              toast.info(`Removed allergy card for ${a.studentName}`);
                            }}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Panel title="Catering Kitchen Safety Protocol">
              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Severe Alert Matching</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      RFID wallet swipes of students with <strong>High Severity</strong>{" "}
                      peanuts/gluten allergies automatically block corresponding food categories at
                      canteen POS registers.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <div className="font-bold text-foreground">Kitchen Safety Checklists:</div>
                  {[
                    "Separate utensils used for nut/peanut-free meals",
                    "Allergy matrix updated on the main chef's kitchen board",
                    "EpiPen stored in infirmary and canteen warden desk",
                    "Ingredient labeling checked for cross-contamination",
                  ].map((chk, i) => (
                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <span>{chk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 3: RFID Canteen Wallet Transactions Ledger */}
      {tab === "rfid" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallets Directory list */}
          <div className="lg:col-span-2 space-y-6">
            <Panel
              title="RFID Smart-Card Wallets Registry"
              action={
                <div className="relative w-48 sm:w-60">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    placeholder="Search by student or tag…"
                    value={rfidSearch}
                    onChange={(e) => setRfidSearch(e.target.value)}
                    className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs outline-none focus:border-accent"
                  />
                </div>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                      <th className="pb-3 pr-4">Student Name</th>
                      <th className="pb-3 px-4">RFID UID Code</th>
                      <th className="pb-3 px-4 text-center">Balance</th>
                      <th className="pb-3 px-4">Card Status</th>
                      <th className="pb-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredWallets.map((w) => (
                      <tr key={w.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 pr-4 font-semibold text-foreground">
                          {w.studentName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">{w.rfidTag}</td>
                        <td className="py-3.5 px-4 text-center font-bold">
                          <span className={w.balance < 10 ? "text-red-500" : "text-foreground"}>
                            ${w.balance.toFixed(2)}
                          </span>
                          {w.balance < 10 && (
                            <span className="ml-1 text-[9px] font-bold text-red-500 uppercase tracking-wide">
                              Low
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              w.status === "Active"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300"
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedWalletId(w.id);
                              setShowTopupModal(true);
                            }}
                            disabled={w.status === "Frozen"}
                            className="rounded bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent hover:bg-accent hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Top Up
                          </button>
                          <button
                            onClick={() => handleToggleFreeze(w.id)}
                            className={`rounded p-1 text-xs ${
                              w.status === "Active"
                                ? "text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/30"
                                : "text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/30"
                            }`}
                          >
                            {w.status === "Active" ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          {/* Transactions Ledger log */}
          <div className="lg:col-span-1">
            <Panel title="Real-time POS Canteen Taps">
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-[13px]">
                        {t.studentName}
                      </span>
                      <span
                        className={`font-bold ${t.type === "Debit" ? "text-red-500" : "text-emerald-500"}`}
                      >
                        {t.type === "Debit" ? "-" : "+"}${t.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{t.item}</span>
                      <span className="font-mono text-[10px]">{t.timestamp}</span>
                    </div>
                    <div className="pt-1.5 border-t border-border/50 flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>UID: {t.rfidTag}</span>
                      <span>{t.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* Modal: Edit Mess Menu */}
      {editingMenu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditingMenu(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-accent animate-pulse" />
                Update {editingMenu.day} Mess Menu
              </h2>
              <button
                onClick={() => setEditingMenu(null)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <Lock className="hidden" />
                <span>✕</span>
              </button>
            </div>
            <form onSubmit={handleUpdateMenu} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Breakfast (07:30 AM)</label>
                <textarea
                  required
                  rows={2}
                  value={editingMenu.breakfast}
                  onChange={(e) => setEditingMenu({ ...editingMenu, breakfast: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent resize-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Lunch (12:30 PM)</label>
                <textarea
                  required
                  rows={2}
                  value={editingMenu.lunch}
                  onChange={(e) => setEditingMenu({ ...editingMenu, lunch: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Snacks & Beverages (04:30 PM)
                  </label>
                  <input
                    required
                    value={editingMenu.snacks}
                    onChange={(e) => setEditingMenu({ ...editingMenu, snacks: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Dinner (07:30 PM)</label>
                  <input
                    required
                    value={editingMenu.dinner}
                    onChange={(e) => setEditingMenu({ ...editingMenu, dinner: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all font-semibold"
              >
                Save Schedule Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Allergy Warning */}
      {showAllergyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAllergyModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Log New Allergy Alert</h2>
              <button
                onClick={() => setShowAllergyModal(false)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <span>✕</span>
              </button>
            </div>
            <form onSubmit={handleAddAllergy} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Student Full Name</label>
                <input
                  name="studentName"
                  required
                  placeholder="e.g. Sanya Gupta"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Grade / Section</label>
                <input
                  name="grade"
                  required
                  placeholder="e.g. Grade 10-A"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Allergen Flags (comma separated)
                </label>
                <input
                  name="allergens"
                  required
                  placeholder="e.g. Peanuts, Gluten, Seafood"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Risk Severity</label>
                <select
                  name="severity"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="High">High (Instant POS block)</option>
                  <option value="Medium">Medium (System Flag)</option>
                  <option value="Low">Low (Monitored)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all font-semibold"
              >
                Register Medical Guard
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Top-up RFID Wallet */}
      {showTopupModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowTopupModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Load RFID Cash Balance</h2>
              <button
                onClick={() => setShowTopupModal(false)}
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              >
                <span>✕</span>
              </button>
            </div>
            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Select Student Wallet</label>
                <select
                  name="walletId"
                  defaultValue={selectedWalletId}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.studentName} ({w.grade}) - Balance: ${w.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Load Amount ($)</label>
                <input
                  name="amount"
                  type="number"
                  required
                  defaultValue="20"
                  min="5"
                  max="500"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all font-semibold"
              >
                Load Balance Immediately
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
