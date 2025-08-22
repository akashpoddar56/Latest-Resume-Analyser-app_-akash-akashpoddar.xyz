import React, { useState, useEffect, useCallback } from 'react';
import { parseResume, reconstructResume } from '../utils/resumeParser';
import type { ParsedResume } from '../types/resume';
import EditableSection from '../components/editor/EditableSection';

interface EditorPageProps {
  initialResumeText: string;
  onSaveChanges: (newResumeText: string) => void;
  onCancel: () => void;
}

const EditorPage: React.FC<EditorPageProps> = ({ initialResumeText, onSaveChanges, onCancel }) => {
  const [resume, setResume] = useState<ParsedResume>({ header: null, sections: [] });

  useEffect(() => {
    setResume(parseResume(initialResumeText));
  }, [initialResumeText]);

  const handleResumeChange = useCallback((newResumeState: ParsedResume) => {
    setResume(newResumeState);
  }, []);

  const handleSave = () => {
    const reconstructedText = reconstructResume(resume);
    onSaveChanges(reconstructedText);
  };

  const addSection = () => {
    const title = prompt("Enter new section title (e.g., PROJECTS):");
    if (title) {
      setResume(prev => ({
        ...prev,
        sections: [
          ...prev.sections,
          {
            id: self.crypto.randomUUID(),
            title: title.toUpperCase(),
            entries: [],
          },
        ],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 animate-fade-in">
      <header className="sticky top-0 bg-white shadow-md z-10">
        <div className="container mx-auto px-4 py-4 md:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Resume Editor</h1>
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
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg p-12" style={{ fontFamily: 'Calibri, sans-serif' }}>
              {/* Header Editor */}
              {resume.header && (
                  <div className="mb-4 pb-2 border-b-[1.5px] border-gray-400">
                      <div className="flex justify-between items-center py-1">
                          <div 
                              contentEditable 
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                  const newName = e.currentTarget.textContent || '';
                                  setResume(prev => ({ ...prev, header: { ...prev.header!, name: newName }}));
                              }}
                              style={{ fontSize: '16pt' }} 
                              className="font-bold text-gray-900 tracking-wider focus:outline-none focus:bg-indigo-50 rounded px-1"
                          >{resume.header.name}</div>
                          <div 
                              contentEditable 
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                  const newContact = e.currentTarget.textContent || '';
                                  setResume(prev => ({ ...prev, header: { ...prev.header!, contact: newContact }}));
                              }}
                              className="text-right text-gray-700 focus:outline-none focus:bg-indigo-50 rounded px-1"
                              style={{ fontSize: '11pt' }}
                          >{resume.header.contact}</div>
                      </div>
                  </div>
              )}

              {/* Sections Editor */}
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
      </main>
    </div>
  );
};

export default EditorPage;