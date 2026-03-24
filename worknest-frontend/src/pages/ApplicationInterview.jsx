import { useApplicationDetails, useSubmitInterviewAnswers } from "@/hooks/useApplications";
import { Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

export default function ApplicationInterview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: application, isLoading } = useApplicationDetails(id);
  const submitMutation = useSubmitInterviewAnswers();

  const questions = useMemo(() => application?.interviewQuestions || [], [application]);
  const [answers, setAnswers] = useState([]);

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = questions.map((question, index) => ({
      answer: (answers[index] || "").trim(),
      question: question.question,
    }));

    submitMutation.mutate(
      {
        applicationId: id,
        answers: payload,
      },
      {
        onSuccess: () => {
          navigate("/my-applications");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#F57450]" />
      </div>
    );
  }

  if (!application || application.status !== "interview") {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4">
        <p className="text-gray-600">Interview is not available for this application.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Interview</h1>
      <p className="text-gray-600 mb-8">Answer all questions to complete your screening.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="font-semibold text-gray-900 mb-3">{index + 1}. {item.question}</p>
            <textarea
              required
              rows={4}
              value={answers[index] || ""}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F57450]/30 focus:border-[#F57450]"
              placeholder="Type your answer"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="px-6 py-3 rounded-lg bg-[#F57450] text-white font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {submitMutation.isPending ? "Submitting..." : "Submit Interview"}
        </button>
      </form>
    </div>
  );
}
