
import React from 'react';
import { XIcon } from './icons/XIcon';
import { parseResume } from '../utils/resumeParser';
import type { ParsedResume, ResumeSection as ResumeSectionType, StandardSection, SkillsSection, ResumeEntry, ResumeEntryContent } from '../types/resume';

interface ResumePreviewProps {
  resumeText: string;
  onClose: () => void;
}

// --- Resume Rendering Components (No Parsing Logic) ---

const RenderedHeader: React.FC<{ header: ParsedResume['header'] }> = ({ header }) => {
  if (!header) return null;
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center py-1">
        <h1 style={{ fontSize: '16pt' }} className="font-bold text-gray-900 tracking-wider">
          {header.name}
        </h1>
        <p className="text-right text-gray-700">
          {header.contact}
        </p>
      </div>
      <div className="border-b-[1.5px] border-gray-400" />
    </div>
  );
};

const RenderedContentItem: React.FC<{ item: ResumeEntryContent }> = ({ item }) => {
  switch (item.type) {
    case 'bullet':
      return (
        <div className={`flex items-start my-1 ${item.style === 'o' ? 'pl-5' : ''}`}>
          <span className="mr-2 mt-1">{item.style}</span>
          <p className="flex-1">{item.content}</p>
        </div>
      );
    case 'subheading':
      return (
        <div className="my-2">
          <div className="flex items-start">
            <span className="mr-2 mt-1 font-bold italic">•</span>
            <p className="font-bold italic flex-1">{item.title}:</p>
          </div>
          {item.bullets.map(bullet => <RenderedContentItem key={bullet.id} item={bullet} />)}
        </div>
      );
    case 'plaintext':
      return <p className="my-1">{item.content}</p>;
    default:
      return null;
  }
};


const RenderedEntry: React.FC<{ entry: ResumeEntry }> = ({ entry }) => (
    <div className="mb-3">
        <div className="flex justify-between">
            <div>
                <span className="font-bold text-gray-800">{entry.title}</span>
                {entry.subtitle && <span className="text-gray-700"> | {entry.subtitle}</span>}
            </div>
            <span className="italic text-gray-600 text-right pl-4">{entry.date}</span>
        </div>
        <div>
            {entry.content.map(item => <RenderedContentItem key={item.id} item={item} />)}
        </div>
    </div>
);


const RenderedSection: React.FC<{ section: ResumeSectionType }> = ({ section }) => {
    const isStandard = 'entries' in section;
    const isSkills = 'skills' in section;

    return (
        <div className="mt-2">
            <h2 className="font-bold uppercase tracking-wider text-gray-800 mt-3 mb-1 pt-1 border-b-2 border-gray-300">
                {section.title}
            </h2>
            {isStandard && (section as StandardSection).entries.map(entry => <RenderedEntry key={entry.id} entry={entry} />)}
            {isSkills && (
                 <div className="my-1">
                    {(section as SkillsSection).skills.map(skill => (
                        <p key={skill.id}>
                            <span className="font-bold">{skill.category}:</span> {skill.details}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};


const FormattedResume: React.FC<{ parsedResume: ParsedResume }> = ({ parsedResume }) => {
  return (
    <div style={{ fontFamily: 'Calibri, sans-serif', fontSize: '11pt' }} className="leading-snug text-gray-800">
      <RenderedHeader header={parsedResume.header} />
      {parsedResume.sections.map(section => <RenderedSection key={section.id} section={section} />)}
    </div>
  );
};


const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeText, onClose }) => {
  const parsedResume = parseResume(resumeText);

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
          <h2 id="resume-preview-title" className="text-lg font-bold text-slate-800">Resume Preview</h2>
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
                <FormattedResume parsedResume={parsedResume} />
           </div>
        </main>
      </div>
    </div>
  );
};

export default ResumePreview;