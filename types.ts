
export interface ResumePointAnalysis {
  point: string;
  strength: 'strong' | 'medium' | 'weak';
  justification: string;
  suggestion?: string;
}

export interface MisalignedPoint {
  point: string;
  reason: string;
  suggestion: string;
}

export interface AnalysisResult {
  overallSummary: string;
  misalignedPoints: MisalignedPoint[];
  categorizedPoints: ResumePointAnalysis[];
}
