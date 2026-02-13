import CriteriaAnalysisCard from "./CriteriaAnalysisCard";
import type { CriterionAnalysis } from "./types/analysis";
import type { Criterion } from "./types/criterion";

type CriteriaAnalysisGridProps = {
  analyses: Record<string, CriterionAnalysis>;
  analysisQueue: Criterion[];
  // currentIndex is no longer needed here
};

function CriteriaAnalysisGrid({ analyses, analysisQueue }: CriteriaAnalysisGridProps) {
  if (analysisQueue.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6">
      {analysisQueue.map((crit) => {
        const analysis = analyses[crit.id];
        
        // If it hasn't been seeded by the parent loop yet, don't render it
        if (!analysis) return null;

        return (
          <CriteriaAnalysisCard 
            key={crit.id} 
            analysis={analysis} 
          />
        );
      })}
    </div>
  );
}

export default CriteriaAnalysisGrid;