import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  GraduationCap,
  Download,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  Video,
  User,
  Star,
  X,
} from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/module-shell";

export const Route = createFileRoute("/parent/academics")({
  component: ParentAcademics,
});

interface PtmMeeting {
  id: string;
  teacherName: string;
  subject: string;
  dateTime: string;
  type: "Video Call" | "In-Person";
  status: "scheduled" | "completed";
}

function ParentAcademics() {
  const [activeChild, setActiveChild] = useState<"aarav" | "ananya">("aarav");
  const [showPtmModal, setShowPtmModal] = useState(false);
  const [viewingReportCard, setViewingReportCard] = useState<any | null>(null);

  const [meetings, setMeetings] = useState<PtmMeeting[]>([
    {
      id: "PTM-849",
      teacherName: "Mrs. Anita Iyer",
      subject: "Mathematics (HOD)",
      dateTime: "May 22, 10:30 AM",
      type: "Video Call",
      status: "scheduled",
    },
  ]);

  // Sync sibling state
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
      hod: "Mrs. Anita Iyer",
      gpa: "8.6 CGPA",
      rank: "Rank 4 / 45",
      homeworkDiary: [
        {
          subject: "Mathematics",
          desc: "Solve problems 1-15 on Quadratic equations",
          assigned: "May 19",
          teacher: "Anita Iyer",
          grade: "A+",
          feedback: "Excellent clarity on root formulas",
        },
        {
          subject: "Physics",
          desc: "Submit reflection lab report with ray diagrams",
          assigned: "May 18",
          teacher: "Rajesh Rao",
          grade: "B",
          feedback: "Lacks detail on focal length calculations",
        },
        {
          subject: "History",
          desc: "Write essay (500 words) on Indian independence acts",
          assigned: "May 17",
          teacher: "Priya Desai",
          grade: "Pending",
          feedback: "Awaiting submission",
        },
      ],
      reportCards: [
        {
          term: "Term-1 Examinations",
          date: "Dec 12, 2025",
          grades: { Math: "A", Sci: "A+", Eng: "A", Hist: "B+", Art: "A+" },
          cgpa: "8.8",
          summary:
            "Aarav shows great discipline in scientific subjects. Focus on improving history essay structure.",
        },
        {
          term: "Mid-Term Evaluations",
          date: "Oct 05, 2025",
          grades: { Math: "B+", Sci: "A", Eng: "A-", Hist: "B", Art: "A+" },
          cgpa: "8.2",
          summary:
            "Satisfactory overall. Mathematics scores require focused home practice on algebra.",
        },
      ],
    },
    ananya: {
      name: "Ananya Sharma",
      hod: "Ms. Anita Iyer", // Let's say Ms. Sen is HOD, or Mrs. Iyer HOD
      gpa: "9.2 CGPA",
      rank: "Rank 2 / 42",
      homeworkDiary: [
        {
          subject: "English Grammar",
          desc: "Write composition on My Favourite Historic Hero",
          assigned: "May 19",
          teacher: "Ms. Kapoor",
          grade: "A++",
          feedback: "Remarkable vocabulary and story depth!",
        },
        {
          subject: "Biology",
          desc: "Diagram of Plant Cell with all labels",
          assigned: "May 18",
          teacher: "Dr. Nair",
          grade: "A",
          feedback: "Very neat labelling. Keep it up.",
        },
        {
          subject: "Biology",
          desc: "Review syllabus chapters 3-4 for pop quiz",
          assigned: "May 15",
          teacher: "Dr. Nair",
          grade: "A-",
          feedback: "Good conceptual clarity.",
        },
      ],
      reportCards: [
        {
          term: "Term-1 Examinations",
          date: "Dec 12, 2025",
          grades: { Math: "A+", Sci: "A+", Eng: "A++", Hist: "A", Art: "A" },
          cgpa: "9.4",
          summary:
            "Ananya is an exemplary student. Her English language and analysis are outstanding.",
        },
        {
          term: "Mid-Term Evaluations",
          date: "Oct 05, 2025",
          grades: { Math: "A", Sci: "A", Eng: "A+", Hist: "A-", Art: "B+" },
          cgpa: "9.0",
          summary:
            "Outstanding performance across all main subjects. Focus on physical art execution.",
        },
      ],
    },
  };

  const child = childDetails[activeChild];

  const handleBookMeeting = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newMeeting: PtmMeeting = {
      id: "PTM-" + Math.floor(100 + Math.random() * 900),
      teacherName: fd.get("teacher") as string,
      subject: fd.get("subject") as string,
      dateTime: fd.get("dateTime") as string,
      type: fd.get("type") as "Video Call" | "In-Person",
      status: "scheduled",
    };

    setMeetings([...meetings, newMeeting]);
    setShowPtmModal(false);
    toast.success("Parent-Teacher Conference Booked!");
  };

  return (
    <div>
      <PageHeader
        title="Sibling Academic Performance & Oversight"
        subtitle={`Report card vaults, digital homework diaries, and Parent-Teacher meetings schedules for ${child.name}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <StatCard
          label="Yearly Average Performance"
          value={child.gpa}
          icon={GraduationCap}
          tone="success"
        />
        <StatCard label="Class Rank Standing" value={child.rank} icon={Star} tone="info" />
        <StatCard
          label="Homework Completion"
          value={`${child.homeworkDiary.filter((h) => h.grade !== "Pending").length} / ${child.homeworkDiary.length}`}
          icon={CheckCircle}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Card Vault & Homework Diary */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Homework Diary & Teacher Assessments">
            <div className="space-y-4">
              {child.homeworkDiary.map((hw, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border p-4 bg-card/75 flex flex-col md:flex-row md:items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider bg-accent/15 text-accent px-2.5 py-0.5 rounded-full">
                        {hw.subject}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Assigned: {hw.assigned} · by {hw.teacher}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{hw.desc}</p>
                    {hw.grade !== "Pending" && (
                      <div className="mt-2 bg-muted/40 p-2.5 rounded-lg border border-border flex items-start gap-2 text-xs">
                        <span className="font-bold text-[oklch(0.45_0.15_155)] uppercase">
                          Teacher Feedback:
                        </span>
                        <span className="text-muted-foreground">"{hw.feedback}"</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Grade / Status
                    </div>
                    <span
                      className={`text-base font-bold ${
                        hw.grade === "Pending" ? "text-amber-500" : "text-[oklch(0.45_0.15_155)]"
                      }`}
                    >
                      {hw.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Report Card Vault */}
          <Panel title="Report Card Vault">
            <div className="space-y-3">
              {child.reportCards.map((rc, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border p-4 bg-card/70 flex items-center justify-between shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-9 w-9 text-accent/80" />
                    <div>
                      <div className="text-sm font-bold text-foreground">{rc.term}</div>
                      <div className="text-[10px] text-muted-foreground">
                        Issued: {rc.date} · Overall CGPA:{" "}
                        <span className="text-foreground font-semibold">{rc.cgpa}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingReportCard(rc)}
                    className="flex items-center gap-1 text-xs text-accent hover:underline font-semibold bg-accent/5 hover:bg-accent/10 px-3.5 py-2 rounded-lg border border-accent/15 transition-all active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    View Certificate
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* PTM Scheduler */}
        <div>
          <Panel
            title="PTM Meeting Conferences"
            action={
              <button
                onClick={() => setShowPtmModal(true)}
                className="flex items-center gap-1 text-xs text-accent hover:underline font-semibold"
              >
                <Calendar className="h-4 w-4" />
                Book PTM Slot
              </button>
            }
          >
            <div className="space-y-4">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-border p-3.5 bg-card/85 space-y-2"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      {m.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      {m.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-foreground">{m.teacherName}</div>
                  <div className="text-xs text-muted-foreground">{m.subject}</div>
                  <div className="flex justify-between items-center border-t border-border pt-2 text-[10px] text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {m.dateTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="h-3.5 w-3.5" />
                      {m.type}
                    </span>
                  </div>
                </div>
              ))}
              {meetings.length === 0 && (
                <EmptyState
                  icon={Calendar}
                  title="No PTM Booked"
                  description="Use the button above to schedule a Parent-Teacher conference."
                />
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* Book PTM Slot modal */}
      {showPtmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowPtmModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-foreground">Schedule PTM Conference</h2>
              <button
                onClick={() => setShowPtmModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleBookMeeting} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Select Subject HOD Teacher</label>
                <select
                  name="teacher"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
                >
                  <option value="Mrs. Anita Iyer">Mrs. Anita Iyer (Mathematics HOD)</option>
                  <option value="Mr. Rajesh Rao">Mr. Rajesh Rao (Physics HOD)</option>
                  <option value="Dr. Amit Khan">Dr. Amit Khan (Chemistry HOD)</option>
                  <option value="Ms. Sunita Singh">Ms. Sunita Singh (English HOD)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Select Date & Time Slot</label>
                <select
                  name="dateTime"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
                >
                  <option value="May 22, 10:00 AM">Thursday May 22: 10:00 AM - 10:30 AM</option>
                  <option value="May 22, 11:30 AM">Thursday May 22: 11:30 AM - 12:00 PM</option>
                  <option value="May 23, 09:30 AM">Friday May 23: 09:30 AM - 10:00 AM</option>
                  <option value="May 23, 14:00 PM">Friday May 23: 02:00 PM - 02:30 PM</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Conference Modality</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="type" value="Video Call" defaultChecked />
                    Virtual Google Meet / Zoom
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="type" value="In-Person" />
                    In-Person Campus Visit
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow active:scale-95 transition-all text-xs"
              >
                Confirm Conference Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Signed Report Certificate Modal */}
      {viewingReportCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setViewingReportCard(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border text-foreground font-serif animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-start border-b-2 border-primary pb-3 font-sans">
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-primary">
                  CAMPUS OS ACADEMY
                </h1>
                <p className="text-[9px] text-muted-foreground">Certified Term Record Archive</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20">
                  OFFICIAL TRANSCRIPT
                </span>
              </div>
            </div>

            <div className="my-5 text-center font-sans">
              <h2 className="text-base font-bold text-foreground uppercase">
                {viewingReportCard.term}
              </h2>
              <p className="text-xs text-muted-foreground">
                Student Name: <span className="font-semibold text-foreground">{child.name}</span> ·
                Grade: {child.grade}
              </p>
            </div>

            <table className="w-full text-left text-xs font-sans border-collapse mb-5">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-bold">
                  <th className="py-2 px-3">Subject Name</th>
                  <th className="py-2 px-3 text-right">Earned Grade</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(viewingReportCard.grades).map(([subj, gr]: any) => (
                  <tr key={subj} className="border-b border-border">
                    <td className="py-2 px-3">
                      {subj === "Math"
                        ? "Mathematics HOD"
                        : subj === "Sci"
                          ? "Physical Sciences"
                          : subj === "Eng"
                            ? "English Literature"
                            : subj === "Hist"
                              ? "Social Studies & History"
                              : "Art & Studio"}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-accent">{gr}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-muted/40 p-3 rounded-lg border border-border text-xs mb-5 font-sans leading-relaxed">
              <div className="font-bold text-foreground">Principal Evaluation Summary:</div>
              <p className="text-muted-foreground italic mt-0.5">"{viewingReportCard.summary}"</p>
            </div>

            <div className="flex justify-between items-center border-t border-border pt-4 text-xs font-sans">
              <div>
                <p className="text-[8px] text-muted-foreground">Digitally Signed & Validated</p>
                <div className="flex items-center gap-1.5 mt-1 font-semibold text-[oklch(0.45_0.15_155)]">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Mrs. Priya Menon (Principal)
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase">Overall GPA</div>
                <div className="text-lg font-extrabold text-primary">
                  {viewingReportCard.cgpa} CGPA
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border flex justify-end gap-2 font-sans">
              <button
                onClick={() => window.print()}
                className="rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground px-4 py-2 text-xs font-semibold shadow-sm"
              >
                Print Report
              </button>
              <button
                onClick={() => setViewingReportCard(null)}
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
