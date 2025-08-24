import React from 'react';
import type { ResumeSection, StandardSection, SkillsSection, Skill, ResumeEntry } from '../../types/resume';
import EditableEntry from './EditableEntry';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface EditableSectionProps {
    section: ResumeSection;
    updateSection: (updatedSection: ResumeSection) => void;
    deleteSection: () => void;
}

const isStandardSection = (section: ResumeSection): section is StandardSection => 'entries' in section;
const isSkillsSection = (section: ResumeSection): section is SkillsSection => 'skills' in section;


const EditableSkillsContent: React.FC<{
    skills: Skill[];
    updateSkills: (skills: Skill[]) => void;
}> = ({ skills, updateSkills }) => {

    const handleSkillChange = (id: string, field: 'category' | 'details', value: string) => {
        const newSkills = skills.map(s => s.id === id ? { ...s, [field]: value } : s);
        updateSkills(newSkills);
    };

    const addSkill = () => {
        const newSkill: Skill = { id: self.crypto.randomUUID(), category: "Skill Category", details: "List your skills here, separated by commas." };
        updateSkills([...skills, newSkill]);
    };

    const deleteSkill = (id: string) => {
        updateSkills(skills.filter(s => s.id !== id));
    };

    return (
         <div className="my-1" style={{ fontSize: '11pt' }}>
            {skills.map(skill => (
                <div key={skill.id} className="flex items-center group/skill relative p-1 hover:bg-slate-50 rounded">
                    <div 
                        contentEditable suppressContentEditableWarning
                        onBlur={e => handleSkillChange(skill.id, 'category', e.currentTarget.innerHTML || '')}
                        className="font-bold focus:outline-none focus:bg-indigo-50 rounded px-1"
                        dangerouslySetInnerHTML={{ __html: skill.category }}
                    />
                    <span className="font-bold mx-1">:</span>
                    <div 
                        contentEditable suppressContentEditableWarning
                        onBlur={e => handleSkillChange(skill.id, 'details', e.currentTarget.innerHTML || '')}
                        className="flex-1 focus:outline-none focus:bg-indigo-50 rounded px-1"
                        dangerouslySetInnerHTML={{ __html: skill.details }}
                    />
                     <div 
                        onClick={() => deleteSkill(skill.id)}
                        className="absolute top-1/2 -right-1 -translate-y-1/2 p-0.5 bg-slate-100 text-slate-400 rounded-full cursor-pointer opacity-0 group-hover/skill:opacity-100 hover:bg-red-100 hover:text-red-500 transition-opacity"
                        title="Delete skill"
                    >
                        <TrashIcon className="w-3 h-3" />
                    </div>
                </div>
            ))}
             <div className="mt-4">
                <button onClick={addSkill} className="px-3 py-1.5 text-xs font-semibold text-brand-primary bg-indigo-100 rounded-md hover:bg-indigo-200 flex items-center gap-1">
                    <PlusIcon className="w-4 h-4" /> Add Skill
                </button>
            </div>
        </div>
    );
};


const EditableSection: React.FC<EditableSectionProps> = ({ section, updateSection, deleteSection }) => {

    const addEntry = () => {
        if (!isStandardSection(section)) return;
        const newEntry: StandardSection['entries'][0] = {
            id: self.crypto.randomUUID(),
            title: "Degree or Certificate Title",
            subtitle: "School or Institution",
            date: "Year",
            content: [{ id: self.crypto.randomUUID(), type: 'bullet', style: 'o', content: "Optional: Add any details here." }],
        };
        const updatedSection = { ...section, entries: [...section.entries, newEntry] };
        updateSection(updatedSection);
    };

    const updateEntry = (index: number, updatedEntry: ResumeEntry) => {
        if (!isStandardSection(section)) return;
        const newEntries = [...section.entries];
        newEntries[index] = updatedEntry;
        updateSection({ ...section, entries: newEntries });
    };

    const deleteEntry = (index: number) => {
        if (!isStandardSection(section)) return;
        const newEntries = section.entries.filter((_, i) => i !== index);
        updateSection({ ...section, entries: newEntries });
    };
    
    const isMainHeading = section.title === 'EDUCATION' || section.title === 'PROFESSIONAL EXPERIENCE';

    // Special rendering for the EDUCATION section
    if (section.title === 'EDUCATION' && isStandardSection(section)) {
        return (
            <div className="mt-4 relative group">
                <div 
                    onClick={deleteSection}
                    className="absolute -top-2 -right-2 p-1.5 bg-slate-200 text-slate-600 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-opacity"
                    title={`Delete ${section.title} section`}
                >
                    <TrashIcon className="w-5 h-5" />
                </div>
                 <h2 
                    className={`font-bold uppercase tracking-wider mt-3 mb-2 ${isMainHeading ? 'text-black px-2' : 'text-gray-800 pt-1 border-b-2 border-gray-300'}`}
                    style={{
                        fontSize: '11pt',
                        ...(isMainHeading && {
                            backgroundColor: '#bfbfbf',
                            height: '0.22in',
                            display: 'flex',
                            alignItems: 'center'
                        })
                    }}
                 >
                    {section.title}
                </h2>

                {section.entries.map((entry, index) => {
                    if (entry.isBoxed) {
                        return (
                             <div 
                                key={entry.id}
                                className="flex justify-between items-center text-black px-2 mt-3"
                                style={{
                                    backgroundColor: '#d9d9d9',
                                    height: '0.22in',
                                    fontSize: '11pt'
                                }}
                            >
                                <span dangerouslySetInnerHTML={{ __html: entry.title }} />
                                <span className="italic pl-4" dangerouslySetInnerHTML={{ __html: entry.date }} />
                            </div>
                        )
                    }
                    return (
                         <div className="mt-4" key={entry.id}>
                            <EditableEntry
                                entry={entry}
                                updateEntry={(updated) => updateEntry(index, updated)}
                                deleteEntry={() => deleteEntry(index)}
                                isDeletable={true}
                            />
                        </div>
                    );
                })}

                <div className="mt-4">
                    <button onClick={addEntry} className="px-3 py-1.5 text-xs font-semibold text-brand-primary bg-indigo-100 rounded-md hover:bg-indigo-200 flex items-center gap-1">
                        <PlusIcon className="w-4 h-4" /> Add Other Education
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="mt-4 relative group">
             <div 
                onClick={deleteSection}
                className="absolute -top-2 -right-2 p-1.5 bg-slate-200 text-slate-600 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-opacity"
                title={`Delete ${section.title} section`}
             >
                <TrashIcon className="w-5 h-5" />
            </div>

            <h2 
                className={`font-bold uppercase tracking-wider mt-3 mb-2 ${isMainHeading ? 'text-black px-2' : 'text-gray-800 pt-1 border-b-2 border-gray-300'}`}
                style={{
                    fontSize: '11pt',
                    ...(isMainHeading && {
                        backgroundColor: '#bfbfbf',
                        height: '0.22in',
                        display: 'flex',
                        alignItems: 'center'
                    })
                }}
            >
                {section.title}
            </h2>

            {isStandardSection(section) && (
                <div>
                    {section.entries.map((entry, index) => (
                        <EditableEntry
                            key={entry.id}
                            entry={entry}
                            updateEntry={(updated) => updateEntry(index, updated)}
                            deleteEntry={() => deleteEntry(index)}
                        />
                    ))}
                    <div className="mt-4">
                        <button onClick={addEntry} className="px-3 py-1.5 text-xs font-semibold text-brand-primary bg-indigo-100 rounded-md hover:bg-indigo-200 flex items-center gap-1">
                            <PlusIcon className="w-4 h-4" /> Add Experience
                        </button>
                    </div>
                </div>
            )}
            
            {isSkillsSection(section) && (
                <EditableSkillsContent 
                    skills={section.skills} 
                    updateSkills={(newSkills) => updateSection({ ...section, skills: newSkills })}
                />
            )}
        </div>
    );
};

export default EditableSection;