export interface CriterionAnalysis {
  criterionId: string;
  criterionTitle: string;
  criterionDescription: string;
  matchPercentage: number;
  confidenceScore: string;
  reasoning: string;
  quotedEvidence: string[];
  sources: string[];
}
