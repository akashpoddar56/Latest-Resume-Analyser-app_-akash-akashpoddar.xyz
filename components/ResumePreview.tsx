import React from 'react';
import { parseResume } from '../utils/resumeParser';
import type { ParsedResume, ResumeSection as ResumeSectionType, StandardSection, SkillsSection, ResumeEntry, ResumeEntryContent } from '../types/resume';

// --- Type Declarations for CDN Libraries ---
declare var html2canvas: any;
declare global {
    interface Window {
        jspdf: any;
    }
}

interface ResumePreviewProps {
  parsedResume: ParsedResume;
  margins: { top: number; right: number; bottom: number; left: number };
  contentRef: React.RefObject<HTMLDivElement>;
}

// --- Resume Rendering Components (No Parsing Logic) ---

const RenderedHeader: React.FC<{ header: ParsedResume['header'] }> = ({ header }) => {
  if (!header) return null;
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center py-1">
        <h1 
          style={{ fontSize: '16pt' }} 
          className="font-bold text-gray-900 tracking-wider"
          dangerouslySetInnerHTML={{ __html: header.name }}
        />
        <p 
          className="text-right text-gray-700"
          dangerouslySetInnerHTML={{ __html: header.contact }}
        />
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
          <p className="flex-1" dangerouslySetInnerHTML={{ __html: item.content }} />
        </div>
      );
    case 'subheading':
      return (
        <div className="my-2">
          <div className="flex items-start">
            <span className="mr-2 mt-1 font-bold italic">•</span>
            <p className="font-bold italic flex-1" dangerouslySetInnerHTML={{ __html: item.title + ':'}} />
          </div>
          {item.bullets.map(bullet => <RenderedContentItem key={bullet.id} item={bullet} />)}
        </div>
      );
    case 'freestanding_subheading':
        return <p className="my-2 font-bold" dangerouslySetInnerHTML={{ __html: item.content }} />;
    case 'plaintext':
      return <p className="my-1" dangerouslySetInnerHTML={{ __html: item.content }} />;
    default:
      return null;
  }
};


const RenderedEntry: React.FC<{ entry: ResumeEntry }> = ({ entry }) => {
    if (entry.isBoxed) {
        return (
            <div 
                className="flex justify-between items-center text-black px-2 mt-3"
                style={{
                    backgroundColor: '#d9d9d9',
                    height: '0.22in',
                    // @ts-ignore
                    printColorAdjust: 'exact',
                    WebkitPrintColorAdjust: 'exact',
                }}
            >
                <span dangerouslySetInnerHTML={{ __html: entry.title }} />
                <span className="italic pl-4" dangerouslySetInnerHTML={{ __html: entry.date }} />
            </div>
        );
    }
    
    return (
        <div className="mb-3">
            <div className="flex justify-between">
                <div>
                    <span className="font-bold text-gray-800" dangerouslySetInnerHTML={{ __html: entry.title }} />
                    {entry.subtitle && <span className="text-gray-700" dangerouslySetInnerHTML={{__html: ` | ${entry.subtitle}`}} />}
                </div>
                <span className="italic text-gray-600 text-right pl-4" dangerouslySetInnerHTML={{ __html: entry.date }} />
            </div>
            <div>
                {entry.content.map(item => <RenderedContentItem key={item.id} item={item} />)}
            </div>
        </div>
    );
};


const RenderedSection: React.FC<{ section: ResumeSectionType }> = ({ section }) => {
    const isStandard = 'entries' in section;
    const isSkills = 'skills' in section;
    const isMainHeading = section.title === 'EDUCATION' || section.title === 'PROFESSIONAL EXPERIENCE';

    return (
        <div className="mt-4">
            <h2
                className={`font-bold uppercase tracking-wider mt-3 mb-2 ${isMainHeading ? 'text-black px-2' : 'text-gray-800 pt-1 border-b-2 border-gray-300'}`}
                style={{
                    ...(isMainHeading && {
                        backgroundColor: '#bfbfbf',
                        height: '0.22in',
                        display: 'flex',
                        alignItems: 'center',
                        // @ts-ignore
                        printColorAdjust: 'exact',
                        WebkitPrintColorAdjust: 'exact',
                    })
                }}
            >
                {section.title}
            </h2>
            {isStandard && (section as StandardSection).entries.map(entry => <RenderedEntry key={entry.id} entry={entry} />)}
            {isSkills && (
                 <div className="my-1">
                    {(section as SkillsSection).skills.map(skill => (
                        <p key={skill.id}>
                            <span className="font-bold" dangerouslySetInnerHTML={{ __html: skill.category }} />:&#160;
                            <span dangerouslySetInnerHTML={{ __html: skill.details }} />
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


const ResumePreview: React.FC<ResumePreviewProps> = ({ parsedResume, margins, contentRef }) => {
  return (
    <div
      ref={contentRef}
      className="bg-white shadow-lg"
      style={{
        width: '216mm',
        minHeight: '279mm',
        boxSizing: 'border-box',
        paddingTop: `${margins.top}cm`,
        paddingRight: `${margins.right}cm`,
        paddingBottom: `${margins.bottom}cm`,
        paddingLeft: `${margins.left}cm`,
      }}
    >
      <FormattedResume parsedResume={parsedResume} />
    </div>
  );
};

export default ResumePreview;