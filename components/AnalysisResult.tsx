import React from 'react';
import type { AnalysisResult as AnalysisResultType, ResumePointAnalysis } from '../types';

const getStrengthColorClasses = (strength: 'strong' | 'medium' | 'weak') => {
  switch (strength) {
    case 'strong':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'weak':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const StrengthBadge: React.FC<{ strength: 'strong' | 'medium' | 'weak' }> = ({ strength }) => {
  const baseClasses = 'px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize';
  const colorClasses = getStrengthColorClasses(strength);
  return <span className={`${baseClasses} ${colorClasses}`}>{strength}</span>;
};

const CharacterCount: React.FC<{ length: number }> = ({ length }) => (
  <span className="relative group text-slate-500 text-xs ml-2 font-normal whitespace-nowrap not-italic">
    ({length} chars)
    <span
      role="tooltip"
      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-60
                 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity
                 bg-slate-800 text-white text-center text-xs rounded py-2 px-3 z-10"
    >
      This count includes all letters, symbols, and spaces. Leading bullets (e.g., 'o', '•') and indentation are excluded for an accurate content length.
    </span>
  </span>
);

const AnalysisSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
    <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-brand-primary">{title}</h2>
    {children}
  </div>
);

const PointCard: React.FC<{ point: ResumePointAnalysis }> = ({ point }) => (
  <div className={`border-l-4 p-4 mb-4 rounded-r-lg ${getStrengthColorClasses(point.strength)}`}>
    <div className="flex justify-between items-start mb-2">
      <p className="font-semibold text-base flex-1 pr-4">
        "{point.point}"
        <CharacterCount length={point.point.length} />
      </p>
      <StrengthBadge strength={point.strength} />
    </div>
    <p className="text-sm mb-2"><strong className="font-semibold">Justification:</strong> {point.justification}</p>
    {point.suggestion && (
      <div className="text-sm bg-slate-50 p-2 rounded border border-slate-200">
        <strong className="font-semibold text-brand-secondary">Suggestion:</strong> {point.suggestion}
        <CharacterCount length={point.suggestion.length} />
      </div>
    )}
  </div>
);

const MisalignedPointCard: React.FC<{ item: { point: string; reason: string; suggestion: string } }> = ({ item }) => (
  <div className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50/50">
     <p className="text-slate-600 mb-2 text-sm italic">
        Original: "{item.point}"
        <CharacterCount length={item.point.length} />
     </p>
     <p className="mb-2"><strong className="font-semibold text-red-600">Reason for Misalignment:</strong> {item.reason}</p>
     <div className="bg-green-50 p-3 rounded-md border border-green-200">
        <p className="font-semibold text-green-800">💡 Suggested Improvement:</p>
        <p className="text-green-700">
            {item.suggestion}
            <CharacterCount length={item.suggestion.length} />
        </p>
     </div>
  </div>
);

interface AnalysisResultProps {
  result: AnalysisResultType;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  return (
    <div className="mt-8 space-y-8 animate-fade-in">
      <AnalysisSection title="Executive Summary">
        <p className="text-slate-600 text-base">{result.overallSummary}</p>
      </AnalysisSection>

      {result.misalignedPoints && result.misalignedPoints.length > 0 && (
         <AnalysisSection title="Alignment Gaps & Suggestions">
            {result.misalignedPoints.map((item, index) => (
                <MisalignedPointCard key={index} item={item} />
            ))}
        </AnalysisSection>
      )}

      {result.categorizedPoints && result.categorizedPoints.length > 0 && (
        <AnalysisSection title="Strengths & Weaknesses Breakdown">
          {result.categorizedPoints.map((point, index) => (
            <PointCard key={index} point={point} />
          ))}
        </AnalysisSection>
      )}
    </div>
  );
};

export default AnalysisResult;