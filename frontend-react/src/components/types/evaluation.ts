export type EvaluationStatus = "running" | "complete" | "failed";

export type EvaluationResult = {
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

export type Evaluation = {
  id: string;
  name: string;           // auto-named, user-editable
  searchId: string;       // which search spawned this
  createdAt: string;
  status: EvaluationStatus;
  results: EvaluationResult[];
};
