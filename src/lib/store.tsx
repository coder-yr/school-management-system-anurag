import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

// ── Types ──
export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  rollNo: string;
  email: string;
  phone: string;
  guardian: string;
  address: string;
  attendance: number;
  feesPaid: number;
  feesDue: number;
  status: "active" | "inactive";
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  joinDate: string;
  salary: number;
  status: "active" | "on-leave" | "resigned";
  attendance: number;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  type: string;
  from: string;
  to: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  category: string;
  amount: number;
  paid: number;
  due: number;
  dueDate: string;
  status: "paid" | "partial" | "overdue" | "pending";
}

export interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  description: string;
}

export interface HostelRoom {
  id: string;
  block: string;
  roomNo: string;
  capacity: number;
  occupied: number;
  students: string[];
  status: "available" | "full" | "maintenance";
}

export interface HostelComplaint {
  id: string;
  studentName: string;
  room: string;
  category: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "emergency";
  createdAt: string;
}

export interface HostelVisitor {
  id: string;
  visitorName: string;
  studentName: string;
  room: string;
  purpose: string;
  checkIn: string;
  checkOut: string;
  status: "checked-in" | "checked-out" | "pending";
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  available: number;
  shelf: string;
}

export interface BookCirculation {
  id: string;
  bookId: string;
  bookTitle: string;
  studentName: string;
  issuedDate: string;
  dueDate: string;
  returnedDate: string;
  status: "issued" | "returned" | "overdue";
}

export interface BusRoute {
  id: string;
  routeNo: string;
  driver: string;
  phone: string;
  stops: { name: string; time: string; lat: number; lng: number }[];
  busNo: string;
  capacity: number;
  students: number;
  currentLat: number;
  currentLng: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  target: "all" | "students" | "teachers" | "staff";
  priority: "normal" | "important" | "urgent";
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  submittedBy: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  responses: { author: string; message: string; date: string }[];
}

export interface ExamSchedule {
  id: string;
  name: string;
  subject: string;
  grade: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  grade: string;
  section: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
  dueDate: string;
  createdBy: string;
  attachments: string[];
  maxScore: number;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  studentName: string;
  studentId: string;
  submittedAt: string;
  files: string[];
  score: number | null;
  feedback: string;
  status: "submitted" | "graded" | "late";
}

export interface AttendanceRecord {
  id: string;
  date: string;
  grade: string;
  section: string;
  records: {
    studentId: string;
    studentName: string;
    status: "present" | "absent" | "late" | "leave";
  }[];
  markedBy: string;
}

export interface PaymentTransaction {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  method: string;
  receiptNo: string;
  category: string;
  status: "success" | "pending" | "failed";
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "exam" | "holiday" | "event" | "deadline";
  description: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SyllabusModule {
  id: string;
  subject: string;
  grade: string;
  unit: string;
  topics: string[];
  completed: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  grade: string;
  type: "pdf" | "video" | "doc" | "link";
  uploadedBy: string;
  uploadDate: string;
  size: string;
  downloaded: boolean;
}

// ── Store Shape ──
interface AppStore {
  students: Student[];
  staff: StaffMember[];
  leaveRequests: LeaveRequest[];
  feeRecords: FeeRecord[];
  feeCategories: FeeCategory[];
  hostelRooms: HostelRoom[];
  hostelComplaints: HostelComplaint[];
  hostelVisitors: HostelVisitor[];
  libraryBooks: LibraryBook[];
  bookCirculations: BookCirculation[];
  busRoutes: BusRoute[];
  announcements: Announcement[];
  supportTickets: SupportTicket[];
  examSchedules: ExamSchedule[];
  timetableEntries: TimetableEntry[];
  assignments: Assignment[];
  attendanceRecords: AttendanceRecord[];
  paymentTransactions: PaymentTransaction[];
  calendarEvents: CalendarEvent[];
  chatMessages: ChatMessage[];
  syllabusModules: SyllabusModule[];
  studyMaterials: StudyMaterial[];
}

interface StoreContextValue {
  store: AppStore;
  dispatch: (action: StoreAction) => void;
}

type StoreAction =
  | { type: "SET_STUDENTS"; payload: Student[] }
  | { type: "ADD_STUDENT"; payload: Student }
  | { type: "UPDATE_STUDENT"; payload: { id: string; updates: Partial<Student> } }
  | { type: "SET_STAFF"; payload: StaffMember[] }
  | { type: "ADD_STAFF"; payload: StaffMember }
  | { type: "UPDATE_STAFF"; payload: { id: string; updates: Partial<StaffMember> } }
  | { type: "ADD_LEAVE_REQUEST"; payload: LeaveRequest }
  | { type: "UPDATE_LEAVE_REQUEST"; payload: { id: string; updates: Partial<LeaveRequest> } }
  | { type: "SET_FEE_RECORDS"; payload: FeeRecord[] }
  | { type: "UPDATE_FEE_RECORD"; payload: { id: string; updates: Partial<FeeRecord> } }
  | { type: "ADD_FEE_CATEGORY"; payload: FeeCategory }
  | { type: "UPDATE_FEE_CATEGORY"; payload: { id: string; updates: Partial<FeeCategory> } }
  | { type: "DELETE_FEE_CATEGORY"; payload: string }
  | { type: "UPDATE_HOSTEL_ROOM"; payload: { id: string; updates: Partial<HostelRoom> } }
  | { type: "ADD_HOSTEL_COMPLAINT"; payload: HostelComplaint }
  | { type: "UPDATE_HOSTEL_COMPLAINT"; payload: { id: string; updates: Partial<HostelComplaint> } }
  | { type: "ADD_HOSTEL_VISITOR"; payload: HostelVisitor }
  | { type: "UPDATE_HOSTEL_VISITOR"; payload: { id: string; updates: Partial<HostelVisitor> } }
  | { type: "ADD_LIBRARY_BOOK"; payload: LibraryBook }
  | { type: "UPDATE_LIBRARY_BOOK"; payload: { id: string; updates: Partial<LibraryBook> } }
  | { type: "ADD_CIRCULATION"; payload: BookCirculation }
  | { type: "UPDATE_CIRCULATION"; payload: { id: string; updates: Partial<BookCirculation> } }
  | { type: "ADD_BUS_ROUTE"; payload: BusRoute }
  | { type: "UPDATE_BUS_ROUTE"; payload: { id: string; updates: Partial<BusRoute> } }
  | { type: "ADD_ANNOUNCEMENT"; payload: Announcement }
  | { type: "DELETE_ANNOUNCEMENT"; payload: string }
  | { type: "ADD_SUPPORT_TICKET"; payload: SupportTicket }
  | { type: "UPDATE_SUPPORT_TICKET"; payload: { id: string; updates: Partial<SupportTicket> } }
  | { type: "ADD_EXAM_SCHEDULE"; payload: ExamSchedule }
  | { type: "UPDATE_EXAM_SCHEDULE"; payload: { id: string; updates: Partial<ExamSchedule> } }
  | { type: "SET_TIMETABLE"; payload: TimetableEntry[] }
  | { type: "ADD_ASSIGNMENT"; payload: Assignment }
  | { type: "UPDATE_ASSIGNMENT"; payload: { id: string; updates: Partial<Assignment> } }
  | { type: "ADD_SUBMISSION"; payload: { assignmentId: string; submission: AssignmentSubmission } }
  | {
      type: "GRADE_SUBMISSION";
      payload: { assignmentId: string; submissionId: string; score: number; feedback: string };
    }
  | { type: "ADD_ATTENDANCE_RECORD"; payload: AttendanceRecord }
  | { type: "ADD_PAYMENT"; payload: PaymentTransaction }
  | { type: "ADD_CALENDAR_EVENT"; payload: CalendarEvent }
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "CLEAR_CHAT"; payload: undefined }
  | { type: "ADD_SYLLABUS_MODULE"; payload: SyllabusModule }
  | { type: "UPDATE_SYLLABUS_MODULE"; payload: { id: string; updates: Partial<SyllabusModule> } }
  | { type: "ADD_STUDY_MATERIAL"; payload: StudyMaterial }
  | { type: "UPDATE_STUDY_MATERIAL"; payload: { id: string; updates: Partial<StudyMaterial> } };

const STORE_KEY = "campus_os_store";

const StoreContext = createContext<StoreContextValue | null>(null);

// ── Seed Data (imported from separate file) ──
import { getInitialStore } from "./seed-data";

function loadStore(): AppStore {
  if (typeof window === "undefined") {
    return getInitialStore();
  }

  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as AppStore;
  } catch {
    /* ignore */
  }
  return getInitialStore();
}

function applyAction(state: AppStore, action: StoreAction): AppStore {
  switch (action.type) {
    case "SET_STUDENTS":
      return { ...state, students: action.payload };
    case "ADD_STUDENT":
      return { ...state, students: [...state.students, action.payload] };
    case "UPDATE_STUDENT":
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s,
        ),
      };
    case "SET_STAFF":
      return { ...state, staff: action.payload };
    case "ADD_STAFF":
      return { ...state, staff: [...state.staff, action.payload] };
    case "UPDATE_STAFF":
      return {
        ...state,
        staff: state.staff.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s,
        ),
      };
    case "ADD_LEAVE_REQUEST":
      return { ...state, leaveRequests: [...state.leaveRequests, action.payload] };
    case "UPDATE_LEAVE_REQUEST":
      return {
        ...state,
        leaveRequests: state.leaveRequests.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload.updates } : l,
        ),
      };
    case "SET_FEE_RECORDS":
      return { ...state, feeRecords: action.payload };
    case "UPDATE_FEE_RECORD":
      return {
        ...state,
        feeRecords: state.feeRecords.map((f) =>
          f.id === action.payload.id ? { ...f, ...action.payload.updates } : f,
        ),
      };
    case "ADD_FEE_CATEGORY":
      return { ...state, feeCategories: [...state.feeCategories, action.payload] };
    case "UPDATE_FEE_CATEGORY":
      return {
        ...state,
        feeCategories: state.feeCategories.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c,
        ),
      };
    case "DELETE_FEE_CATEGORY":
      return {
        ...state,
        feeCategories: state.feeCategories.filter((c) => c.id !== action.payload),
      };
    case "UPDATE_HOSTEL_ROOM":
      return {
        ...state,
        hostelRooms: state.hostelRooms.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r,
        ),
      };
    case "ADD_HOSTEL_COMPLAINT":
      return { ...state, hostelComplaints: [...state.hostelComplaints, action.payload] };
    case "UPDATE_HOSTEL_COMPLAINT":
      return {
        ...state,
        hostelComplaints: state.hostelComplaints.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c,
        ),
      };
    case "ADD_HOSTEL_VISITOR":
      return { ...state, hostelVisitors: [...state.hostelVisitors, action.payload] };
    case "UPDATE_HOSTEL_VISITOR":
      return {
        ...state,
        hostelVisitors: state.hostelVisitors.map((v) =>
          v.id === action.payload.id ? { ...v, ...action.payload.updates } : v,
        ),
      };
    case "ADD_LIBRARY_BOOK":
      return { ...state, libraryBooks: [...state.libraryBooks, action.payload] };
    case "UPDATE_LIBRARY_BOOK":
      return {
        ...state,
        libraryBooks: state.libraryBooks.map((b) =>
          b.id === action.payload.id ? { ...b, ...action.payload.updates } : b,
        ),
      };
    case "ADD_CIRCULATION":
      return { ...state, bookCirculations: [...state.bookCirculations, action.payload] };
    case "UPDATE_CIRCULATION":
      return {
        ...state,
        bookCirculations: state.bookCirculations.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c,
        ),
      };
    case "ADD_BUS_ROUTE":
      return { ...state, busRoutes: [...state.busRoutes, action.payload] };
    case "UPDATE_BUS_ROUTE":
      return {
        ...state,
        busRoutes: state.busRoutes.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r,
        ),
      };
    case "ADD_ANNOUNCEMENT":
      return { ...state, announcements: [action.payload, ...state.announcements] };
    case "DELETE_ANNOUNCEMENT":
      return {
        ...state,
        announcements: state.announcements.filter((a) => a.id !== action.payload),
      };
    case "ADD_SUPPORT_TICKET":
      return { ...state, supportTickets: [...state.supportTickets, action.payload] };
    case "UPDATE_SUPPORT_TICKET":
      return {
        ...state,
        supportTickets: state.supportTickets.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t,
        ),
      };
    case "ADD_EXAM_SCHEDULE":
      return { ...state, examSchedules: [...state.examSchedules, action.payload] };
    case "UPDATE_EXAM_SCHEDULE":
      return {
        ...state,
        examSchedules: state.examSchedules.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload.updates } : e,
        ),
      };
    case "SET_TIMETABLE":
      return { ...state, timetableEntries: action.payload };
    case "ADD_ASSIGNMENT":
      return { ...state, assignments: [...state.assignments, action.payload] };
    case "UPDATE_ASSIGNMENT":
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload.updates } : a,
        ),
      };
    case "ADD_SUBMISSION":
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.id === action.payload.assignmentId
            ? { ...a, submissions: [...a.submissions, action.payload.submission] }
            : a,
        ),
      };
    case "GRADE_SUBMISSION":
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.id === action.payload.assignmentId
            ? {
                ...a,
                submissions: a.submissions.map((s) =>
                  s.id === action.payload.submissionId
                    ? {
                        ...s,
                        score: action.payload.score,
                        feedback: action.payload.feedback,
                        status: "graded" as const,
                      }
                    : s,
                ),
              }
            : a,
        ),
      };
    case "ADD_ATTENDANCE_RECORD":
      return { ...state, attendanceRecords: [...state.attendanceRecords, action.payload] };
    case "ADD_PAYMENT":
      return { ...state, paymentTransactions: [...state.paymentTransactions, action.payload] };
    case "ADD_CALENDAR_EVENT":
      return { ...state, calendarEvents: [...state.calendarEvents, action.payload] };
    case "ADD_CHAT_MESSAGE":
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case "CLEAR_CHAT":
      return { ...state, chatMessages: [] };
    case "ADD_SYLLABUS_MODULE":
      return { ...state, syllabusModules: [...state.syllabusModules, action.payload] };
    case "UPDATE_SYLLABUS_MODULE":
      return {
        ...state,
        syllabusModules: state.syllabusModules.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload.updates } : m,
        ),
      };
    case "ADD_STUDY_MATERIAL":
      return { ...state, studyMaterials: [...state.studyMaterials, action.payload] };
    case "UPDATE_STUDY_MATERIAL":
      return {
        ...state,
        studyMaterials: state.studyMaterials.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload.updates } : m,
        ),
      };
    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<AppStore>(() => loadStore());

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
      } catch (e) {
        console.error("Failed to persist store to localStorage:", e);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [store]);

  const dispatch = useCallback((action: StoreAction) => {
    setStore((prev) => applyAction(prev, action));
  }, []);

  const contextValue = useMemo(() => ({ store, dispatch }), [store, dispatch]);

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function genId() {
  return Math.random().toString(36).slice(2, 11);
}
