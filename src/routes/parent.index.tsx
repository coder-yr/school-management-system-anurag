import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  CalendarDays,
  Wallet,
  TrendingUp,
  Bus,
  Clock,
  Heart,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";

export const Route = createFileRoute("/parent/")({
  component: ParentDashboard,
});

function ParentDashboard() {
  const [activeChild, setActiveChild] = useState<"aarav" | "ananya">("aarav");

  // Sync sibling state dynamically
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
      grade: "Grade 10 · A",
      rollNo: "1001",
      attendance: "92%",
      avgScore: "83%",
      feeDue: "₹12,400",
      busTime: "Arriving in ~ 8 min",
      nextClass: "Mathematics with Mrs. Iyer · Room 201",
      todayClasses: [
        { time: "08:30", subject: "Mathematics", room: "201", teacher: "Mrs. Iyer" },
        { time: "09:30", subject: "Physics", room: "Lab-2", teacher: "Mr. Rao" },
        { time: "10:30", subject: "English", room: "108", teacher: "Ms. Singh" },
        { time: "11:45", subject: "Chemistry", room: "Lab-1", teacher: "Dr. Khan" },
      ],
      homeworks: [
        { subject: "Mathematics", title: "Quadratic Equations — Set 4", due: "Tomorrow" },
        { subject: "Science", title: "Lab report: Reflection experiment", due: "In 3 days" },
      ],
      canteenMenu: {
        lunch: "Paneer Butter Masala, Roti, Dal Fry, Steamed Rice, Curd",
        restriction: "Vegetarian · No Peanuts",
      },
      healthRecord: {
        blood: "O+ Pos",
        allergy: "Peanut allergy",
        lastVisit: "May 10: Dispensed paracetamol for minor headache. Rested: 20m.",
      },
    },
    ananya: {
      name: "Ananya Sharma",
      grade: "Grade 8 · B",
      rollNo: "8024",
      attendance: "96%",
      avgScore: "89%",
      feeDue: "₹4,200",
      busTime: "Arriving in ~ 15 min",
      nextClass: "English Grammar with Ms. Kapoor · Room 104",
      todayClasses: [
        { time: "08:30", subject: "English Grammar", room: "104", teacher: "Ms. Kapoor" },
        { time: "09:30", subject: "History", room: "102", teacher: "Mr. Joshi" },
        { time: "10:30", subject: "Biology", room: "Bio-Lab", teacher: "Dr. Nair" },
        { time: "11:45", subject: "Art & Craft", room: "Studio", teacher: "Mrs. Sen" },
      ],
      homeworks: [
        { subject: "English", title: "Composition: My Favourite Historic Hero", due: "Friday" },
        { subject: "Biology", title: "Diagram of Plant Cell Structure", due: "Monday" },
      ],
      canteenMenu: {
        lunch: "Chole Bhature, Veg Pulav, Boondi Raita, Sweet Lassi",
        restriction: "Vegetarian · No Restrictions",
      },
      healthRecord: {
        blood: "O+ Pos",
        allergy: "No known allergies",
        lastVisit: "April 22: Routine height & weight checkup. Vaccinations up-to-date.",
      },
    },
  };

  const child = childDetails[activeChild];

  return (
    <div>
      <PageHeader
        title={`Welcome Back, Ramesh 👋`}
        subtitle={`Parent Overview · Active child: ${child.name}`}
      />

      {/* Quick stats for active sibling */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Attendance"
          value={child.attendance}
          delta="Above target limits (75%)"
          icon={Clock}
          tone="success"
        />
        <StatCard
          label="Average Score"
          value={child.avgScore}
          delta="Exceeding Class Median"
          icon={TrendingUp}
          tone="info"
        />
        <StatCard
          label="Fee Balance"
          value={child.feeDue}
          delta="Term-2 Academic installment"
          icon={Wallet}
          tone={child.feeDue === "₹0" ? "success" : "warning"}
        />
        <StatCard
          label="Assigned Bus Status"
          value={child.busTime}
          delta="Route R-12 live stream active"
          icon={Bus}
          tone="info"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Timetable Panel */}
        <div className="lg:col-span-2">
          <Panel
            title={`Today's Classes — ${child.name}`}
            action={
              <span className="text-xs rounded-full bg-accent/10 px-2 py-0.5 text-accent font-semibold">
                {child.grade}
              </span>
            }
          >
            <div className="divide-y divide-border">
              {child.todayClasses.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3.5 hover:bg-accent/5 px-2 rounded-lg transition-colors"
                >
                  <div className="w-16 shrink-0 text-sm font-bold text-accent">{c.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{c.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      Room {c.room} · taught by {c.teacher}
                    </div>
                  </div>
                  <span className="rounded-full bg-muted border border-border px-2.5 py-1 text-xs text-muted-foreground font-semibold">
                    60m class
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Infirmary Clinic & Health Record */}
          <div className="mt-6">
            <Panel
              title="Health Status & Infirmary Log"
              action={<Heart className="h-4 w-4 text-rose-500" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border rounded-xl p-3 bg-muted/30">
                  <div className="text-xs text-muted-foreground uppercase font-semibold">
                    Blood Group
                  </div>
                  <div className="text-lg font-bold text-rose-600 mt-1">
                    {child.healthRecord.blood}
                  </div>
                </div>
                <div className="border border-border rounded-xl p-3 bg-muted/30">
                  <div className="text-xs text-muted-foreground uppercase font-semibold">
                    Allergies / Restrictions
                  </div>
                  <div className="text-sm font-semibold text-amber-600 mt-1">
                    {child.healthRecord.allergy}
                  </div>
                </div>
                <div className="border border-border rounded-xl p-3 bg-muted/30">
                  <div className="text-xs text-muted-foreground uppercase font-semibold">
                    Vaccinations
                  </div>
                  <div className="text-xs font-semibold text-[oklch(0.45_0.15_155)] mt-1">
                    Fully Immunized ✅
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t border-border pt-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldAlert className="h-4 w-4 text-accent" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Last Infirmary Visit Log
                  </span>
                </div>
                <p className="text-sm text-foreground bg-card p-3 rounded-lg border border-border">
                  {child.healthRecord.lastVisit}
                </p>
              </div>
            </Panel>
          </div>
        </div>

        {/* Right sidebars */}
        <div className="space-y-6">
          {/* Homeworks */}
          <Panel title="Homework Diary Snippet">
            <div className="space-y-3">
              {child.homeworks.map((hw, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-4 hover:border-accent/30 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      {hw.subject}
                    </span>
                    <span className="text-xs text-amber-600 font-semibold">{hw.due}</span>
                  </div>
                  <div className="text-sm font-medium text-foreground">{hw.title}</div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Canteen & Daily Meal Menu */}
          <Panel title="Canteen & Mess Meal Schedule">
            <div className="space-y-3.5">
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Today's Lunch Menu
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {child.canteenMenu.lunch}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Dietary Restriction Link
                </div>
                <div className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded inline-block mt-1">
                  {child.canteenMenu.restriction}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
