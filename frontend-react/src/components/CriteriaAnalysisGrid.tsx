import CriteriaAnalysisCard from "./CriteriaAnalysisCard";
import type { CriterionAnalysis } from "./types/analysis";

type CriteriaAnalysisGridProps = {
  analyses: Record<string, CriterionAnalysis>;
};

function CriteriaAnalysisGrid({ analyses }: CriteriaAnalysisGridProps) {
  const items = Object.values(analyses);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {items.map((a) => (
        <CriteriaAnalysisCard key={a.criterionId} analysis={a} />
      ))}
    </div>
  );
}

export default CriteriaAnalysisGrid;
