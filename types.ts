

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

export interface KeywordAnalysis {
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface AnalysisResult {
  overallSummary: string;
  keywordAnalysis: KeywordAnalysis;
  misalignedPoints: MisalignedPoint[];
  categorizedPoints: ResumePointAnalysis[];
}
