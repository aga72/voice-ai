export interface CriterionAnalysis {
  criterionId: string;
  criterionTitle: string;
  criterionDescription: string;
  matchPercentage: number;
  confidenceScore: number;
  reasoning: string;
  quotedEvidence: string[];
  sources: string[];
}
