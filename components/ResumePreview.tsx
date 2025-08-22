import React from 'react';
import { XIcon } from './icons/XIcon';
import { SECTION_HEADERS } from '../utils/resumeParser';

interface ResumePreviewProps {
  resumeText: string;
  onClose: () => void;
}

// --- Resume Parsing Logic ---

// Rule 1: Identify common section headers using the shared utility constant.
const isSectionHeader = (line: string): boolean => {
  const trimmedLine = line.trim();
  return SECTION_HEADERS.includes(trimmedLine);
};

// Rule 2: Identify bullet points.
const isBulletPoint = (line: string): boolean => {
  const trimmedLine = line.trim();
  return ['•', 'o', '*', '-'].some(bullet => trimmedLine.startsWith(bullet));
};


// Rule 3: Identify experience/education entries (e.g., "Title | Company | Date").
const isExperienceEntry = (line: string): boolean => {
    const hasDate = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|Current|\d{4})\b/i.test(line);
    const hasLocationOrCompany = /\b(London|University|Ltd|Inc|Group)\b/i.test(line);
    // This rule is a heuristic. It checks for a date-like and company/location-like word.
    // We also check length to avoid matching short, irrelevant lines.
    return (hasDate && hasLocationOrCompany && line.length > 20);
}


// A more sophisticated parser component that applies the rules.
const FormattedResume: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
  
    let isFirstLine = true;
  
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine === '') {
        elements.push(<div key={`space-${index}`} className="h-2" />);
        return;
      }
  
      // Rule: The very first non-empty line is the header, containing the name and contact info.
      if (isFirstLine) {
        const parts = line.split('\t');
        const name = parts[0]?.trim() || '';
        const contactInfo = parts[1]?.trim() || '';

        elements.push(
          <div key={`header-container-${index}`}>
            <div className="flex justify-between items-center py-1">
              <h1 style={{ fontSize: '16pt' }} className="font-bold text-gray-900 tracking-wider">
                {name}
              </h1>
              <p className="text-right text-gray-700">
                {contactInfo}
              </p>
            </div>
            <div className="border-b-[1.5px] border-gray-400" />
          </div>
        );
        isFirstLine = false;
        return;
      }
  
      // Apply other rules in order of precedence.
      if (isSectionHeader(line)) {
        elements.push(
          <h2 key={`header-${index}`} className="font-bold uppercase tracking-wider text-gray-800 mt-5 mb-1 pt-1 border-b-2 border-gray-300">
            {trimmedLine}
          </h2>
        );
      } else if (isBulletPoint(line)) {
        elements.push(
          <div key={`bullet-${index}`} className="flex items-start pl-5 my-1">
            <span className="mr-2 mt-1">&#8226;</span>
            <p className="flex-1">{trimmedLine.substring(1).trim()}</p>
          </div>
        );
      } else if(isExperienceEntry(line)) {
        // Simple split for Job | Company | Date format
        const parts = line.split('|');
        if (parts.length >= 2) {
             elements.push(
                <div key={`exp-${index}`} className="mb-1">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-800">{parts[0].trim()}</span>
                        <span className="italic text-gray-600">{parts[parts.length - 1].trim()}</span>
                    </div>
                    {parts.length > 2 && <p className="italic text-gray-600">{parts.slice(1, -1).join(', ').trim()}</p>}
                </div>
             );
        } else {
             elements.push(<p key={`exp-fallback-${index}`} className="font-semibold">{line}</p>)
        }
      } 
      else {
        elements.push(
          <p key={`text-${index}`} className="mb-1">
            {line}
          </p>
        );
      }
    });
  
    return <div style={{ fontFamily: 'Calibri, sans-serif', fontSize: '11pt' }} className="leading-snug text-gray-800">{elements}</div>;
};


const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeText, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-preview-title"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <header className="flex justify-between items-center p-4 border-b bg-slate-50 rounded-t-lg">
          <h2 id="resume-preview-title" className="text-lg font-semibold text-slate-800">Resume Preview</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            aria-label="Close preview"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-slate-100">
           <div className="bg-white shadow-lg p-12 mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                <FormattedResume text={resumeText} />
           </div>
        </main>
      </div>
    </div>
  );
};

export default ResumePreview;