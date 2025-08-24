import React, { useState, useEffect, useCallback, useRef } from 'react';
import { parseResume, reconstructResume } from '../utils/resumeParser';
import type { ParsedResume, ResumeSection, StandardSection, SkillsSection } from '../types/resume';
import EditableSection from '../components/editor/EditableSection';
import ResumePreview from '../components/ResumePreview';
import Spinner from '../components/Spinner';
import { BoldIcon } from '../components/icons/BoldIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { DEFAULT_SECTION_TITLES } from '../constants/resume';

// --- Type Declarations for CDN Libraries ---
declare var html2canvas: any;
declare global {
    interface Window {
        jspdf: any;
    }
}

// --- Helper Components ---

const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const QuickTips: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
      <LightbulbIcon className="w-6 h-6 mr-2 text-yellow-500" />
      Resume Writing Tips
    </h3>
    <ul className="space-y-3 text-slate-600 text-sm">
      <li className="flex items-start">
        <span className="mr-2.5 mt-1 text-brand-primary font-bold">✓</span>
        <span>Start bullet points with strong <strong>action verbs</strong> (e.g., Managed, Created, Led).</span>
      </li>
      <li className="flex items-start">
        <span className="mr-2.5 mt-1 text-brand-primary font-bold">✓</span>
        <span><strong>Quantify achievements</strong> with numbers and metrics to show impact (e.g., "Increased revenue by 15%").</span>
      </li>
      <li className="flex items-start">
        <span className="mr-2.5 mt-1 text-brand-primary font-bold">✓</span>
        <span>Tailor your skills and experience to the <strong>job description's keywords</strong>.</span>
      </li>
    </ul>
  </div>
);

const MarginInput: React.FC<{ label: string; name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, onChange }) => (
    <div className="relative">
        <label htmlFor={name} className="absolute -top-1.5 left-2 text-[10px] bg-slate-100 px-1 text-slate-500">{label}</label>
        <input
            type="number"
            id={name} name={name} value={value} onChange={onChange}
            className="w-16 pl-2 pr-6 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-sm"
            step="0.1" title={`${label} margin`}
        />
        <span className="absolute inset-y-0 right-0 pr-1.5 flex items-center text-xs text-slate-500 pointer-events-none">cm</span>
    </div>
);


// --- Main Editor Page Component ---

interface EditorPageProps {
  initialResumeText: string;
  onSaveChanges: (newResumeText: string) => void;
  onCancel: () => void;
}

const EditorPage: React.FC<EditorPageProps> = ({ initialResumeText, onSaveChanges, onCancel }) => {
  const [resume, setResume] = useState<ParsedResume>({ header: null, sections: [] });
  const [margins, setMargins] = useState({ top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 });
  const [isDownloading, setIsDownloading] = useState(false);
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parsed = parseResume(initialResumeText);
    const parsedSectionsMap = new Map<string, ResumeSection>();
    parsed.sections.forEach(section => {
      parsedSectionsMap.set(section.title.toUpperCase(), section);
    });

    const structuredSections: ResumeSection[] = DEFAULT_SECTION_TITLES.map(defaultSection => {
      const parsedSection = parsedSectionsMap.get(defaultSection.title);
      parsedSectionsMap.delete(defaultSection.title);

      if (defaultSection.title === 'EDUCATION') {
        const educationSectionTemplate: StandardSection = {
            id: parsedSection?.id || self.crypto.randomUUID(),
            title: 'EDUCATION',
            entries: [
                { 
                    id: self.crypto.randomUUID(),
                    title: "<b>MSc. Strategic Entrepreneurship & Innovation | King's College London | 4/4 GPA, distinction (top 5% of 200)</b>",
                    subtitle: '',
                    date: "<b>Sep 19 – Sep 20</b>",
                    content: [],
                    isBoxed: true,
                },
                {
                    id: self.crypto.randomUUID(),
                    title: "<b>B.B.A. (International Business) | Pune University | 7/10 GPA, first-class distinction (top 10% of 350)</b>",
                    subtitle: '',
                    date: "<b>Jun 15 – Jun 18</b>",
                    content: [],
                    isBoxed: true,
                },
                { id: self.crypto.randomUUID(), title: "Class 12th", subtitle: "School Name, City", date: "Year", content: [{ id: self.crypto.randomUUID(), type: 'bullet', style: 'o', content: 'Optional: Percentage/GPA or key achievements.' }] },
                { id: self.crypto.randomUUID(), title: "Class 10th", subtitle: "School Name, City", date: "Year", content: [{ id: self.crypto.randomUUID(), type: 'bullet', style: 'o', content: 'Optional: Percentage/GPA.' }] }
            ]
        };
        return educationSectionTemplate;
      }
      
      if (parsedSection) {
        return parsedSection;
      } else {
        return defaultSection.type === 'skills'
          ? { id: self.crypto.randomUUID(), title: defaultSection.title, skills: [] } as SkillsSection
          : { id: self.crypto.randomUUID(), title: defaultSection.title, entries: [] } as StandardSection;
      }
    });

    const remainingSections = Array.from(parsedSectionsMap.values());
    const fixedName = 'AKASH PODDAR';
    const fixedContactInfo = '<b><a href="tel:+91-7771989777" class="text-blue-600 hover:underline">+91-7771989777</a> | <a href="mailto:akashpoddar.strategy@gmail.com" class="text-blue-600 hover:underline">akashpoddar.strategy@gmail.com</a> | <a href="https://linkedin.com/in/akashpoddar56" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">linkedin.com/in/akashpoddar56</a></b>';
    
    setResume({
      header: { name: fixedName, contact: fixedContactInfo },
      sections: [...structuredSections, ...remainingSections],
    });
  }, [initialResumeText]);

  const handleSave = () => {
    const reconstructedText = reconstructResume(resume);
    onSaveChanges(reconstructedText);
  };

  const addSection = () => {
    const title = prompt("Enter new section title (e.g., AWARDS, VOLUNTEER WORK):");
    if (title && title.trim()) {
      const newEntry: StandardSection['entries'][0] = {
            id: self.crypto.randomUUID(),
            title: "Role, Project, or Degree Title",
            subtitle: "Company, Organization, or University",
            date: "Month Year - Month Year",
            content: [{ 
                id: self.crypto.randomUUID(), 
                type: 'bullet', 
                style: '•', 
                content: "Describe your key achievement or responsibility. Start with an action verb and quantify your impact when possible." 
            }],
      };
      
      setResume(prev => ({
        ...prev,
        sections: [
          ...prev.sections,
          {
            id: self.crypto.randomUUID(),
            title: title.trim().toUpperCase(),
            entries: [newEntry],
          },
        ],
      }));
    }
  };

  const handleBoldClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.execCommand('bold');
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMargins(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleDownloadPdf = async () => {
    if (!resumePreviewRef.current || typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
        alert("PDF generation library is not loaded. Please refresh the page and try again.");
        return;
    }
    
    setIsDownloading(true);
    try {
        const canvas = await html2canvas(resumePreviewRef.current, {
            scale: 2, // Using a slightly lower scale to prevent memory issues on large documents.
            useCORS: true,
            logging: false,
            // Let html2canvas automatically determine the width and height from the element.
            // Explicitly setting windowWidth/Height can sometimes be less reliable.
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('resume.pdf');
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while generating the PDF. Please check the console for details.");
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-100 animate-fade-in">
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-md z-20">
        <div className="container mx-auto px-4 py-3 md:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Resume Editor</h1>
          <div className="flex gap-2 sm:gap-4 items-center">
             <div className="hidden xl:flex items-center gap-2 border-r border-slate-200 pr-3">
                <SettingsIcon className="w-5 h-5 text-slate-500" title="Page Margins" />
                <MarginInput label="Top" name="top" value={margins.top} onChange={handleMarginChange} />
                <MarginInput label="Bottom" name="bottom" value={margins.bottom} onChange={handleMarginChange} />
                <MarginInput label="Left" name="left" value={margins.left} onChange={handleMarginChange} />
                <MarginInput label="Right" name="right" value={margins.right} onChange={handleMarginChange} />
            </div>
             <button
              type="button"
              onMouseDown={handleBoldClick}
              className="p-2 h-9 w-9 flex items-center justify-center font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all"
              title="Bold"
            >
              <BoldIcon className="w-5 h-5" />
            </button>
            <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-brand-primary bg-white border-2 border-brand-primary rounded-lg shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:border-slate-300 disabled:cursor-not-allowed"
                aria-label="Download as PDF"
            >
                {isDownloading ? <Spinner className="text-brand-primary" /> : <DownloadIcon className="w-5 h-5" />}
                <span className="hidden sm:inline ml-2">Download</span>
            </button>
            <button
              onClick={onCancel}
              className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all"
            >
              Save
            </button>
          </div>
        </div>
      </header>

      <main className="w-full overflow-auto p-4 md:p-8">
        <div className="flex flex-row gap-8 mx-auto" style={{ width: 'fit-content' }}>
            {/* Editor Pane */}
            <div>
                <div 
                  className="bg-white shadow-lg"
                  style={{
                    fontFamily: 'Calibri, sans-serif',
                    width: '216mm',
                    minHeight: '279mm',
                    padding: '0.5cm',
                    boxSizing: 'border-box',
                  }}
                >
                  {resume.header && (
                      <div className="mb-4 pb-2 border-b-[1.5px] border-gray-400">
                          <div className="flex justify-between items-center py-1">
                              <div 
                                  style={{ fontSize: '16pt' }} 
                                  className="font-bold text-gray-900 tracking-wider px-1"
                                  dangerouslySetInnerHTML={{ __html: resume.header.name }}
                              />
                              <div 
                                  className="text-right text-gray-700 px-1"
                                  style={{ fontSize: '11pt' }}
                                  dangerouslySetInnerHTML={{ __html: resume.header.contact }}
                              />
                          </div>
                      </div>
                  )}

                  {resume.sections.map((section, index) => (
                      <EditableSection 
                          key={section.id}
                          section={section}
                          updateSection={(updatedSection) => {
                              const newSections = [...resume.sections];
                              newSections[index] = updatedSection;
                              setResume(prev => ({ ...prev, sections: newSections }));
                          }}
                          deleteSection={() => {
                              if(confirm(`Are you sure you want to delete the "${section.title}" section?`)) {
                                  const newSections = resume.sections.filter(s => s.id !== section.id);
                                  setResume(prev => ({ ...prev, sections: newSections }));
                              }
                          }}
                      />
                  ))}
                  
                  <div className="text-center mt-8">
                    <button
                      onClick={addSection}
                      className="px-4 py-2 text-sm font-semibold text-brand-primary bg-indigo-100 rounded-md hover:bg-indigo-200"
                    >
                      + Add New Section
                    </button>
                  </div>
                </div>
            </div>
            {/* Preview Pane */}
            <div className="hidden lg:block">
                <ResumePreview 
                    parsedResume={resume}
                    margins={margins}
                    contentRef={resumePreviewRef}
                />
            </div>
        </div>
        <div className="max-w-[calc(216mm)] mx-auto mt-8 xl:hidden">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-4 rounded-lg">
                <strong>Note:</strong> The live preview is hidden on smaller screens. Please widen your browser window to see the editor and preview side-by-side.
            </div>
        </div>
      </main>
    </div>
  );
};

export default EditorPage;