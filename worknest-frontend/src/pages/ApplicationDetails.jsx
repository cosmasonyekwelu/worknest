import { useApplicationDetails } from "@/hooks/useApplications";
import { formatDate, getStatusStyles } from "@/utils/constant";
import Avatar from "@/components/Avatar";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Calendar,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Loader2,
  MapPin,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

const detailCardClassName =
  "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6";

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: application, isLoading, isError } = useApplicationDetails(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#F57450]" size={36} />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-10 md:py-12">
        <button
          type="button"
          onClick={() => navigate("/my-applications")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to applications
        </button>

        <div className={`${detailCardClassName} text-center`}>
          <h1 className="text-2xl font-bold text-gray-900">Application not found</h1>
          <p className="mt-2 text-gray-600">
            We couldn&apos;t load this application. Try returning to your applications list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="container mx-auto max-w-5xl px-4 py-6 md:py-12">
        <button
          type="button"
          onClick={() => navigate("/my-applications")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to applications
        </button>

        <div className="grid gap-6">
          <section className={detailCardClassName}>
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                  <Avatar
                    src={application.job?.companyLogo}
                    name={application.job?.companyName}
                    alt={application.job?.companyName || "Company logo"}
                    size={64}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
                    Application Details
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                    {application.job?.title}
                  </h1>
                  <p className="mt-1 text-base font-medium text-gray-600">
                    {application.job?.companyName}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={16} />
                      Applied {formatDate(application.createdAt)}
                    </span>
                    {application.job?.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={16} />
                        {application.job.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {application.status === "interview" && (
                  <button
                    type="button"
                    onClick={() => navigate(`/applications/${application.id}/interview`)}
                    className="rounded-lg bg-[#F57450] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Take Interview
                  </button>
                )}
                <span
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${getStatusStyles(
                    application.status,
                  )}`}
                >
                  {String(application.status || "submitted").replaceAll("_", " ")}
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6">
              <div className={detailCardClassName}>
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness size={18} className="text-[#F57450]" />
                  <h2 className="text-lg font-bold text-gray-900">Application Summary</h2>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Applicant
                    </p>
                    <p className="mt-1 font-medium text-gray-900">{application.applicant?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Email
                    </p>
                    <p className="mt-1 break-all">{application.applicant?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Phone
                    </p>
                    <p className="mt-1">{application.applicant?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Location
                    </p>
                    <p className="mt-1">{application.applicant?.location}</p>
                  </div>
                </div>
              </div>

              {application.answers?.length > 0 && (
                <div className={detailCardClassName}>
                  <h2 className="text-lg font-bold text-gray-900">Application Responses</h2>
                  <div className="mt-4 space-y-4">
                    {application.answers.map((item, index) => (
                      <div
                        key={`${item.question || "question"}-${index}`}
                        className="rounded-xl bg-gray-50 p-4"
                      >
                        <p className="text-sm font-semibold text-gray-900">
                          {item.question || `Question ${index + 1}`}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                          {item.answer || "No response provided."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {application.interviewQuestions?.length > 0 && (
                <div className={detailCardClassName}>
                  <h2 className="text-lg font-bold text-gray-900">Interview Questions</h2>
                  <div className="mt-4 space-y-4">
                    {application.interviewQuestions.map((item, index) => (
                      <div
                        key={`${item.question || "interview-question"}-${index}`}
                        className="rounded-xl bg-gray-50 p-4"
                      >
                        <p className="text-sm font-semibold text-gray-900">
                          {item.question || `Interview question ${index + 1}`}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                          {item.answer || "Answer pending."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {application.aiFeedback && (
                <div className={detailCardClassName}>
                  <h2 className="text-lg font-bold text-gray-900">AI Feedback</h2>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {application.aiFeedback}
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-6">
              <div className={detailCardClassName}>
                <h2 className="text-lg font-bold text-gray-900">Quick Links</h2>
                <div className="mt-4 space-y-3">
                  {application.resumeUrl && (
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-[#F57450] hover:text-[#F57450]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FileText size={16} />
                        View Resume
                      </span>
                      <ExternalLink size={16} />
                    </a>
                  )}

                  {application.portfolioUrl && (
                    <a
                      href={application.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-[#F57450] hover:text-[#F57450]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LinkIcon size={16} />
                        Portfolio
                      </span>
                      <ExternalLink size={16} />
                    </a>
                  )}

                  {application.linkedinUrl && (
                    <a
                      href={application.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-[#F57450] hover:text-[#F57450]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LinkIcon size={16} />
                        LinkedIn
                      </span>
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              <div className={detailCardClassName}>
                <h2 className="text-lg font-bold text-gray-900">Scores</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      AI Score
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {application.aiScore ?? "N/A"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Interview Score
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {application.interviewScore ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
