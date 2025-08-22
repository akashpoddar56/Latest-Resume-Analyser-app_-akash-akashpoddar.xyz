
import React, { useState, useEffect } from 'react';
import { parseResumeToSections, reconstructResumeFromSections } from '../utils/resumeParser';
import type { ResumeSection } from '../utils/resumeParser';

interface EditorPageProps {
  initialResumeText: string;
  onSaveChanges: (newResumeText: string) => void;
  onCancel: () => void;
}

// A custom text area that automatically adjusts its height based on content.
const AutoGrowTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    const ref = React.useRef<HTMLTextAreaElement>(null);
  
    useEffect(() => {
      const element = ref.current;
      if (element) {
        element.style.height = 'auto'; // Reset height
        element.style.height = `${element.scrollHeight}px`; // Set to content height
      }
    }, [props.value]); // Re-run this effect when the text area's value changes
  
    return <textarea ref={ref} {...props} />;
};

const EditorPage: React.FC<EditorPageProps> = ({ initialResumeText, onSaveChanges, onCancel }) => {
  const [sections, setSections] = useState<ResumeSection[]>([]);

  useEffect(() => {
    setSections(parseResumeToSections(initialResumeText));
  }, [initialResumeText]);

  const handleContentChange = (sectionId: string, newContent: string) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, content: newContent } : section
      )
    );
  };

  const handleSave = () => {
    const reconstructedText = reconstructResumeFromSections(sections);
    onSaveChanges(reconstructedText);
  };

  return (
    <div className="min-h-screen bg-slate-100 animate-fade-in">
        <header className="sticky top-0 bg-white shadow-md z-10">
            <div className="container mx-auto px-4 py-4 md:px-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Edit Resume Sections</h1>
                <div className="flex gap-4">
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
            <div className="max-w-4xl mx-auto space-y-6">
                <p className="text-center text-slate-600 mb-8">
                    Edit the content of each resume section below. The titles are fixed based on the parser. Click "Save Changes" when you're done to update your resume.
                </p>
                {sections.map(section => (
                    <div key={section.id} className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold text-slate-800 mb-3 pb-2 border-b-2 border-slate-200">
                            {section.title}
                        </h2>
                        <AutoGrowTextArea
                            value={section.content}
                            onChange={(e) => handleContentChange(section.id, e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 text-sm font-mono resize-none overflow-hidden"
                            rows={5}
                            aria-label={`Content for section ${section.title}`}
                        />
                    </div>
                ))}
            </div>
        </main>
    </div>
  );
};

export default EditorPage;
