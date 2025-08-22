
import React from 'react';
import type { ResumeEntry, ResumeEntryContent, ResumeEntryBullet, ResumeEntrySubheading, ResumeEntryPlaintext } from '../../types/resume';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface EditableEntryProps {
    entry: ResumeEntry;
    updateEntry: (updatedEntry: ResumeEntry) => void;
    deleteEntry: () => void;
}

const EditableContentItem: React.FC<{
    item: ResumeEntryContent;
    updateItem: (updatedItem: ResumeEntryContent) => void;
    deleteItem: () => void;
}> = ({ item, updateItem, deleteItem }) => {
    
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>, field: 'content' | 'title') => {
        updateItem({ ...item, [field]: e.currentTarget.textContent || '' });
    };

    const handleSubBulletChange = (subBulletId: string, newText: string) => {
        if(item.type !== 'subheading') return;
        const newBullets = item.bullets.map(b => b.id === subBulletId ? { ...b, content: newText } : b);
        updateItem({ ...item, bullets: newBullets });
    };

    const deleteSubBullet = (subBulletId: string) => {
        if(item.type !== 'subheading') return;
        const newBullets = item.bullets.filter(b => b.id !== subBulletId);
        updateItem({ ...item, bullets: newBullets });
    };
    
    const addSubBullet = () => {
        if(item.type !== 'subheading') return;
        const newBullet: ResumeEntryBullet = { id: self.crypto.randomUUID(), type: 'bullet', style: 'o', content: 'New detail...' };
        updateItem({ ...item, bullets: [...item.bullets, newBullet] });
    };

    const renderContent = () => {
        switch (item.type) {
            case 'bullet':
                return (
                    <div className="flex items-start w-full">
                        <span className="mr-2 mt-1 select-none">{item.style}</span>
                        <div 
                            contentEditable suppressContentEditableWarning
                            onBlur={e => handleBlur(e, 'content')}
                            className="flex-1 focus:outline-none focus:bg-indigo-50 rounded px-1"
                        >{item.content}</div>
                    </div>
                );
            case 'subheading':
                return (
                     <div className="pl-5 my-1 w-full">
                        <div className="flex items-start">
                             <span className="mr-2 mt-1 font-bold italic select-none">•</span>
                             <div 
                                contentEditable suppressContentEditableWarning
                                onBlur={e => handleBlur(e, 'title')}
                                className="font-bold italic flex-1 focus:outline-none focus:bg-indigo-50 rounded px-1"
                            >{item.title}:</div>
                        </div>
                        {item.bullets.map(b => (
                            <div key={b.id} className="flex items-start pl-5 my-1 group/sub-bullet relative">
                                <span className="mr-2 mt-1 select-none">o</span>
                                <div 
                                    contentEditable suppressContentEditableWarning
                                    onBlur={e => handleSubBulletChange(b.id, e.currentTarget.textContent || '')}
                                    className="flex-1 focus:outline-none focus:bg-indigo-50 rounded px-1"
                                >{b.content}</div>
                                 <div 
                                    onClick={() => deleteSubBullet(b.id)}
                                    className="absolute top-0 right-0 p-0.5 bg-slate-100 text-slate-400 rounded-full cursor-pointer opacity-0 group-hover/sub-bullet:opacity-100 hover:bg-red-100 hover:text-red-500 transition-opacity"
                                    title="Delete detail"
                                >
                                    <TrashIcon className="w-3 h-3" />
                                </div>
                            </div>
                        ))}
                         <div className="pl-5 mt-1">
                            <button onClick={addSubBullet} className="text-xs text-slate-500 hover:text-brand-primary font-semibold flex items-center gap-1">
                                <PlusIcon className="w-3 h-3" /> Add Detail
                            </button>
                        </div>
                    </div>
                );
            case 'plaintext':
                return (
                    <div className="w-full">
                        <div 
                            contentEditable suppressContentEditableWarning
                            onBlur={e => handleBlur(e, 'content')}
                            className="flex-1 focus:outline-none focus:bg-indigo-50 rounded px-1"
                        >{item.content}</div>
                    </div>
                );
        }
    }

    return (
        <div className="my-1 group/bullet relative flex items-start w-full">
            {renderContent()}
            <div 
                onClick={deleteItem}
                className="absolute top-1/2 -right-1 -translate-y-1/2 p-0.5 bg-slate-100 text-slate-400 rounded-full cursor-pointer opacity-0 group-hover/bullet:opacity-100 hover:bg-red-100 hover:text-red-500 transition-opacity"
                title="Delete item"
            >
                <TrashIcon className="w-3 h-3" />
            </div>
        </div>
    );
};


const EditableEntry: React.FC<EditableEntryProps> = ({ entry, updateEntry, deleteEntry }) => {
    
    const handleFieldChange = (field: 'title' | 'subtitle' | 'date', value: string) => {
        updateEntry({ ...entry, [field]: value });
    };

    const updateContentItem = (itemId: string, updatedItem: ResumeEntryContent) => {
        const newContent = entry.content.map(item => item.id === itemId ? updatedItem : item);
        updateEntry({ ...entry, content: newContent });
    };

    const deleteContentItem = (itemId: string) => {
        const newContent = entry.content.filter(item => item.id !== itemId);
        updateEntry({ ...entry, content: newContent });
    }

    const addContentItem = (type: 'bullet' | 'subheading') => {
        let newItem: ResumeEntryContent;
        if(type === 'bullet') {
            newItem = { id: self.crypto.randomUUID(), type: 'bullet', style: '•', content: 'New accomplishment...' };
        } else {
            newItem = { id: self.crypto.randomUUID(), type: 'subheading', title: 'New Subheading', bullets: [] };
        }
        updateEntry({ ...entry, content: [...entry.content, newItem] });
    }
    
    return (
        <div className="mb-4 p-3 relative group border border-transparent hover:border-slate-200 rounded-md">
             <div 
                onClick={deleteEntry}
                className="absolute top-2 right-2 p-1 bg-slate-100 text-slate-500 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-opacity"
                title="Delete this entire entry"
             >
                <TrashIcon className="w-4 h-4" />
            </div>

            <div className="flex justify-between" style={{ fontSize: '11pt' }}>
                <div>
                    <span 
                        contentEditable suppressContentEditableWarning 
                        onBlur={e => handleFieldChange('title', e.currentTarget.textContent || '')} 
                        className="font-bold text-gray-800 focus:outline-none focus:bg-indigo-50 rounded px-1"
                    >{entry.title}</span>
                    <span className="text-gray-700"> | </span>
                    <span 
                        contentEditable suppressContentEditableWarning 
                        onBlur={e => handleFieldChange('subtitle', e.currentTarget.textContent || '')}
                        className="text-gray-700 focus:outline-none focus:bg-indigo-50 rounded px-1"
                    >{entry.subtitle}</span>
                </div>
                <span 
                    contentEditable suppressContentEditableWarning 
                    onBlur={e => handleFieldChange('date', e.currentTarget.textContent || '')}
                    className="italic text-gray-600 text-right pl-4 focus:outline-none focus:bg-indigo-50 rounded px-1"
                >{entry.date}</span>
            </div>
            
            <div style={{ fontSize: '11pt' }}>
                {entry.content.map(item => (
                    <EditableContentItem
                        key={item.id}
                        item={item}
                        updateItem={(updated) => updateContentItem(item.id, updated)}
                        deleteItem={() => deleteContentItem(item.id)}
                    />
                ))}
                 <div className="pl-5 mt-2 flex gap-4">
                    <button onClick={() => addContentItem('bullet')} className="text-xs text-slate-500 hover:text-brand-primary font-semibold flex items-center gap-1">
                        <PlusIcon className="w-3 h-3" /> Add Bullet
                    </button>
                    <button onClick={() => addContentItem('subheading')} className="text-xs text-slate-500 hover:text-brand-primary font-semibold flex items-center gap-1">
                        <PlusIcon className="w-3 h-3" /> Add Subheading
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditableEntry;