import type { CriterionAnalysis } from "./types/analysis";

type CriteriaAnalysisCardProps = {
  analysis: CriterionAnalysis;
};

function CriteriaAnalysisCard({ analysis }: CriteriaAnalysisCardProps) {
    return (
        <div className="bg-white rounded-lg border-gray-300 border drop-shadow p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-md text-brand-grey">
            {analysis.criterionTitle}
            </h3>
            <span className="text-xs text-gray-500">
            Match {analysis.matchPercentage}% · Confidence {analysis.confidenceScore}%
            </span>
        </div>

        <div className="text-xs text-gray-500">
            Criterion: {analysis.criterionDescription}
        </div>

        <div className="text-sm text-brand-grey">
            <span className="font-semibold">Reasoning: </span>
            <span className="whitespace-pre-line">{analysis.reasoning}</span>
        </div>

        <div className="text-xs text-gray-700">
            <div className="font-semibold mb-1">Quoted Evidence & Sources</div>
            <ul className="space-y-1">
            {analysis.quotedEvidence.map((q, idx) => {
                const [quote, url] = q.split(" - ");
                return (
                <li key={idx}>
                    <span className="italic">"{quote}"</span>{" "}
                    {url && (
                    <>
                        {"— "}
                        <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-blue underline"
                        >
                        Source
                        </a>
                    </>
                    )}
                </li>
                );
            })}
            </ul>
        </div>
        </div>
    )
}

export default CriteriaAnalysisCard;