import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import CriteriaAnalysisCard from "../components/CriteriaAnalysisCard";
import type { CriterionAnalysis } from "../components/types/analysis";

type EvaluationResult = {
  companyName: string;
  companyWebsite: string;
  criterionId: string;
  criterionTitle: string;
  matchPercentage: number;
  confidenceScore: string;
  reasoning: string;
  quotedEvidence: string[];
  sources: string[];
};

type EvaluationDoc = {
  id: string;
  name: string;
  status: "running" | "complete" | "failed";
  companies: { name: string; website: string }[];
  criteria: { id: string; title: string; description: string }[];
  totalItems: number;
  completedItems: number;
  results: EvaluationResult[];
};

export default function EvaluationResultsPage() {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const [evaluation, setEvaluation] = useState<EvaluationDoc | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvaluation = async () => {
    try {
      const res = await fetch(`/api/evaluations/${evaluationId}`);
      if (!res.ok) return;
      const data: EvaluationDoc = await res.json();
      setEvaluation(data);
      if (!nameInput) setNameInput(data.name);

      if (data.status === "complete" && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch (err) {
      console.error("Error fetching evaluation:", err);
    }
  };

  useEffect(() => {
    fetchEvaluation();
    pollRef.current = setInterval(fetchEvaluation, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [evaluationId]);

  const handleNameSave = async () => {
    if (!nameInput.trim() || !evaluationId) return;
    setIsEditingName(false);
    setEvaluation((prev) => prev ? { ...prev, name: nameInput } : prev);
    await fetch(`/api/evaluations/${evaluationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput }),
    });
  };

  if (!evaluation) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="font-heading text-base font-semibold text-brand-grey animate-pulse">
          Loading evaluation...
        </span>
      </div>
    );
  }

  const { companies, criteria, results, totalItems, completedItems, status } = evaluation;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Index completed results by companyWebsite + criterionId for fast lookup
  const resultIndex: Record<string, EvaluationResult> = {};
  for (const r of results) {
    resultIndex[`${r.companyWebsite}__${r.criterionId}`] = r;
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Evaluation name + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
              className="font-heading text-xl font-bold text-brand-blue border-b-2 border-brand-gold outline-none bg-transparent"
            />
          ) : (
            <h1
              onClick={() => setIsEditingName(true)}
              title="Click to rename"
              className="font-heading text-xl font-bold text-brand-blue cursor-pointer hover:text-brand-gold transition-colors"
            >
              {evaluation.name}
            </h1>
          )}
          {!isEditingName && (
            <span className="font-body text-xs text-gray-400">click to rename</span>
          )}
        </div>

        {status === "running" && (
          <span className="font-body text-sm text-brand-grey animate-pulse">
            {completedItems} / {totalItems} complete
          </span>
        )}
        {status === "complete" && (
          <span className="font-body text-sm font-semibold text-green-500">
            ✓ Complete
          </span>
        )}
      </div>

      {/* Overall progress bar */}
      {status === "running" && (
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-brand-blue transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* One section per company */}
      {companies.map((company) => (
        <div key={company.website} className="flex flex-col gap-3">

          {/* Company header — matches card styling */}
          <div className="bg-white rounded-lg border-gray-300 border drop-shadow px-4 py-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-brand-blue text-base">
                {company.name}
              </span>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-brand-grey hover:text-brand-blue hover:underline"
              >
                {company.website}
              </a>
            </div>
            <span className="font-body text-xs text-gray-400">
              {results.filter((r) => r.companyWebsite === company.website).length} / {criteria.length} criteria
            </span>
          </div>

          {/* One CriteriaAnalysisCard per criterion — reused completely unchanged */}
          <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-gray-200">
            {criteria.map((criterion) => {
              const result = resultIndex[`${company.website}__${criterion.id}`];

              // Build CriterionAnalysis shape — either real result or "Analyzing…" placeholder
              const analysis: CriterionAnalysis = result
                ? {
                    criterionId: result.criterionId,
                    criterionTitle: result.criterionTitle,
                    criterionDescription: criterion.description ?? "",  // ← was ""
                    matchPercentage: result.matchPercentage,
                    confidenceScore: result.confidenceScore,
                    reasoning: result.reasoning,
                    quotedEvidence: result.quotedEvidence,
                    sources: result.sources,
                  }
                : {
                    criterionId: criterion.id,
                    criterionTitle: criterion.title,
                    criterionDescription: criterion.description ?? "",  // ← was ""
                    matchPercentage: 0,
                    confidenceScore: "",
                    reasoning: "Analyzing…",
                    quotedEvidence: [],
                    sources: [],
                  };

              return (
                <CriteriaAnalysisCard key={criterion.id} analysis={analysis} />
              );
            })}
          </div>

        </div>
      ))}
    </div>
  );
}
