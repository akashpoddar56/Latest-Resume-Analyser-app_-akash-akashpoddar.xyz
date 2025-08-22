import React, { useState, useEffect, useCallback } from 'react';
import { parseResume, reconstructResume } from '../utils/resumeParser';
import type { ParsedResume, ResumeSection, StandardSection, SkillsSection } from '../types/resume';
import EditableSection from '../components/editor/EditableSection';
import { BoldIcon } from '../components/icons/BoldIcon';
import { DEFAULT_SECTION_TITLES } from '../constants/resume';

// --- Helper Components ---

const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const QuickTips: React.FC = () => (
  <div className="sticky top-24 bg-white p-6 rounded-lg shadow-lg border border-slate-200">
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
      <li className="flex items-start">
        <span className="mr-2.5 mt-1 text-brand-primary font-bold">✓</span>
        <span>Keep the resume concise. Aim for <strong>one page</strong> if you have under 10 years of experience.</span>
      </li>
      <li className="flex items-start">
        <span className="mr-2.5 mt-1 text-brand-primary font-bold">✓</span>
        <span><strong>Proofread</strong> multiple times to eliminate any spelling or grammar errors.</span>
      </li>
    </ul>
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
                // Masters
                { id: self.crypto.randomUUID(), title: "Master's Degree Title", subtitle: "University Name", date: "Month Year - Month Year", content: [{ id: self.crypto.randomUUID(), type: 'bullet', style: 'o', content: 'Optional: GPA, relevant coursework, or honors.' }] },
                // Bachelors
                { id: self.crypto.randomUUID(), title: "Bachelor's Degree Title", subtitle: "University Name", date: "Month Year - Month Year", content: [{ id: self.crypto.randomUUID(), type: 'bullet', style: 'o', content: 'Optional: GPA, relevant coursework, or honors.' }] },
                // 12th
                { id: self.crypto.randomUUID(), title: "Class 12th", subtitle: "School Name, City", date: "Year", content: [{ id: self.crypto.randomUUID(), type: 'bullet', style: 'o', content: 'Optional: Percentage/GPA or key achievements.' }] },
                // 10th
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


  const handleResumeChange = useCallback((newResumeState: ParsedResume) => {
    setResume(newResumeState);
  }, []);

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
  }

  return (
    <div className="min-h-screen bg-slate-100 animate-fade-in">
      <header className="sticky top-0 bg-white shadow-md z-10">
        <div className="container mx-auto px-4 py-4 md:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Resume Editor</h1>
          <div className="flex gap-2 sm:gap-4 items-center">
             <button
              type="button"
              onMouseDown={handleBoldClick}
              className="inline-flex items-center justify-center p-2 h-10 w-10 font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all"
              title="Bold"
            >
              <BoldIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center px-6 py-2 font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center px-6 py-2 font-semibold text-white bg-brand-primary rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <div className="bg-white shadow-lg p-12" style={{ fontFamily: 'Calibri, sans-serif' }}>
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
            <div className="lg:col-span-1">
              <QuickTips />
            </div>
        </div>
      </main>
    </div>
  );
};

export default EditorPage;