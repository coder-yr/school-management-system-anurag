import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdmissionEnquiryForm } from "@/components/admissions/admission-form";
import { AdmissionApplicationTracker } from "@/components/admissions/admission-tracker";
import { PageHeader, Panel } from "@/components/module-shell";
import { AdmissionApplication } from "@/lib/schemas";

export const Route = createFileRoute("/parent/admissions")({
  component: ParentAdmissionsPage,
});

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────

const MOCK_PARENT_APPLICATIONS: AdmissionApplication[] = [
  {
    id: "app_aarav",
    studentName: "Aarav Sharma",
    fatherName: "Rohit Sharma",
    motherName: "Priya Sharma",
    dateOfBirth: "2011-03-10",
    gender: "Male",
    email: "aarav.sharma@example.com",
    phone: "9876543210",
    currentSchool: "City Public School",
    currentGrade: "9",
    applyingForGrade: "10",
    address: "24 Evergreen Terrace, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400053",
    applicationStatus: "Approved",
    appliedAt: "2026-05-15T10:00:00Z",
    reviewedAt: "2026-05-20T14:30:00Z",
    reviewedBy: "principal@school.com",
    documents: [
      {
        id: "doc_ar1",
        documentType: "Birth Certificate",
        fileName: "aarav_birth_cert.pdf",
        fileUrl: "/uploads/aarav_birth_cert.pdf",
        uploadedAt: "2026-05-15T10:05:00Z",
        verificationStatus: "Verified",
        verifiedBy: "principal@school.com",
        verifiedAt: "2026-05-16T09:00:00Z",
      },
      {
        id: "doc_ar2",
        documentType: "Previous Marksheet",
        fileName: "aarav_class9_marksheet.pdf",
        fileUrl: "/uploads/aarav_class9_marksheet.pdf",
        uploadedAt: "2026-05-15T10:05:00Z",
        verificationStatus: "Verified",
        verifiedBy: "principal@school.com",
        verifiedAt: "2026-05-16T09:15:00Z",
      },
      {
        id: "doc_ar3",
        documentType: "Transfer Certificate",
        fileName: "aarav_tc.pdf",
        fileUrl: "/uploads/aarav_tc.pdf",
        uploadedAt: "2026-05-15T10:05:00Z",
        verificationStatus: "Verified",
        verifiedBy: "principal@school.com",
        verifiedAt: "2026-05-16T09:30:00Z",
      },
      {
        id: "doc_ar4",
        documentType: "Photo",
        fileName: "aarav_photo.jpg",
        fileUrl: "/uploads/aarav_photo.jpg",
        uploadedAt: "2026-05-15T10:05:00Z",
        verificationStatus: "Verified",
        verifiedBy: "principal@school.com",
        verifiedAt: "2026-05-16T10:00:00Z",
      },
    ],
    admissionFeeStatus: "Paid",
    admissionFeeAmount: 5000,
    notes: "Excellent academic record. Merit scholarship eligible.",
    parentEmail: "rohit.sharma@example.com",
    parentPhone: "9876543209",
    createdAt: "2026-05-15T10:00:00Z",
    updatedAt: "2026-05-20T14:30:00Z",
  },
  {
    id: "app_ananya",
    studentName: "Ananya Sharma",
    fatherName: "Rohit Sharma",
    motherName: "Priya Sharma",
    dateOfBirth: "2013-07-22",
    gender: "Female",
    email: "ananya.sharma@example.com",
    phone: "9876543211",
    currentSchool: "City Public School",
    currentGrade: "7",
    applyingForGrade: "8",
    address: "24 Evergreen Terrace, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400053",
    applicationStatus: "Submitted",
    appliedAt: "2026-05-17T11:00:00Z",
    reviewedAt: undefined,
    reviewedBy: undefined,
    documents: [
      {
        id: "doc_an1",
        documentType: "Birth Certificate",
        fileName: "ananya_birth_cert.pdf",
        fileUrl: "/uploads/ananya_birth_cert.pdf",
        uploadedAt: "2026-05-17T11:05:00Z",
        verificationStatus: "Verified",
        verifiedBy: "principal@school.com",
        verifiedAt: "2026-05-18T09:00:00Z",
      },
      {
        id: "doc_an2",
        documentType: "Previous Marksheet",
        fileName: "ananya_class7_marksheet.pdf",
        fileUrl: "/uploads/ananya_class7_marksheet.pdf",
        uploadedAt: "2026-05-17T11:05:00Z",
        verificationStatus: "Pending",
      },
    ],
    admissionFeeStatus: "Pending",
    admissionFeeAmount: 5000,
    notes: "",
    parentEmail: "rohit.sharma@example.com",
    parentPhone: "9876543209",
    createdAt: "2026-05-17T11:00:00Z",
    updatedAt: "2026-05-18T11:00:00Z",
  },
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

function ParentAdmissionsPage() {
  const [view, setView] = useState<"list" | "details" | "new">("list");
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);

  const handleViewDetails = (app: AdmissionApplication) => {
    setSelectedApp(app);
    setActiveChild(app.id);
    setView("details");
  };

  return (
    <div>
      {view === "list" && (
        <>
          <PageHeader
            title="Admission Status"
            subtitle="Track your children's admission applications"
            actions={
              <button
                onClick={() => setView("new")}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                New Application
              </button>
            }
          />

          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold">Your Applications</h2>

            {MOCK_PARENT_APPLICATIONS.length === 0 ? (
              <Panel className="text-center">
                <p className="text-sm text-muted-foreground">No applications yet</p>
                <button
                  onClick={() => setView("new")}
                  className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Create New Application
                </button>
              </Panel>
            ) : (
              <div className="grid gap-4">
                {MOCK_PARENT_APPLICATIONS.map((app) => (
                  <Panel
                    key={app.id}
                    className="cursor-pointer transition hover:border-primary/50"
                    onClick={() => handleViewDetails(app)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{app.studentName}</h3>
                          <span className="text-xs font-medium text-muted-foreground">
                            ({app.gender === "Male" ? "Son" : "Daughter"})
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Applying for Grade {app.applyingForGrade}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Applied: {new Date(app.appliedAt || "").toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <StatusBadge status={app.applicationStatus} />
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Documents:{" "}
                            {
                              app.documents.filter((d) => d.verificationStatus === "Verified")
                                .length
                            }
                            /{app.documents.length}
                          </p>
                          {app.admissionFeeStatus === "Pending" && (
                            <p className="mt-1 text-xs text-orange-600">
                              Fee: ₹{app.admissionFeeAmount} pending
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Panel>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {view === "details" && selectedApp && (
        <>
          <button
            onClick={() => setView("list")}
            className="mb-4 text-sm font-medium text-primary hover:underline"
          >
            ← Back to Applications
          </button>
          <AdmissionApplicationTracker application={selectedApp} isAdmin={false} />

          {selectedApp.admissionFeeStatus === "Pending" && (
            <Panel className="mt-6 border-orange-200 bg-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-orange-900">Admission Fee Payment Due</h3>
                  <p className="text-sm text-orange-800">
                    Please complete the admission fee payment to confirm admission
                  </p>
                </div>
                <button className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
                  Pay ₹{selectedApp.admissionFeeAmount}
                </button>
              </div>
            </Panel>
          )}

          {selectedApp.applicationStatus === "Approved" &&
            selectedApp.admissionFeeStatus === "Paid" && (
              <Panel className="mt-6 border-green-200 bg-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-900">✓ Admission Confirmed!</h3>
                    <p className="text-sm text-green-800">
                      Congratulations! Your admission has been confirmed. Welcome to our school!
                    </p>
                  </div>
                  <button className="rounded-md border border-green-600 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50">
                    Download Confirmation
                  </button>
                </div>
              </Panel>
            )}
        </>
      )}

      {view === "new" && (
        <>
          <button
            onClick={() => setView("list")}
            className="mb-4 text-sm font-medium text-primary hover:underline"
          >
            ← Back
          </button>
          <Panel>
            <h2 className="mb-4 text-lg font-semibold">New Admission Application</h2>
            <AdmissionEnquiryForm onSuccess={() => setView("list")} />
          </Panel>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
    Draft: { bg: "bg-gray-100", text: "text-gray-700", icon: "✏️" },
    Submitted: { bg: "bg-blue-100", text: "text-blue-700", icon: "📨" },
    "Under Review": { bg: "bg-yellow-100", text: "text-yellow-700", icon: "👀" },
    Approved: { bg: "bg-green-100", text: "text-green-700", icon: "✅" },
    Rejected: { bg: "bg-red-100", text: "text-red-700", icon: "❌" },
    Waitlisted: { bg: "bg-orange-100", text: "text-orange-700", icon: "⏳" },
  };

  const config = statusConfig[status] || statusConfig.Draft;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span>{config.icon}</span>
      {status}
    </div>
  );
}
