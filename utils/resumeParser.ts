import type { ParsedResume, ResumeHeader, ResumeSection, StandardSection, SkillsSection, ResumeEntry, ResumeEntryBullet, ResumeEntrySubheading, Skill, ResumeEntryContent, ResumeEntryPlaintext } from '../types/resume';

// A shared list of headers for consistent parsing across the app.
export const SECTION_HEADERS = [
  'EDUCATION',
  'PROFESSIONAL EXPERIENCE',
  'EXPERIENCE',
  'SKILLS',
  'TECHNICAL SKILLS',
  'TOOLS',
  'FRAMEWORKS',
  'ANALYTICAL SKILLS',
  'PROJECTS',
  'EXTRACURRICULAR INVOLVEMENT',
  'LEADERSHIP',
  'SUMMARY',
  'OBJECTIVE',
  'PUBLICATIONS',
  'CERTIFICATIONS',
  'AWARDS',
];

// --- Type Guards ---
const isSkillsSection = (section: ResumeSection): section is SkillsSection => 'skills' in section;
const isStandardSection = (section: ResumeSection): section is StandardSection => 'entries' in section;


// --- Helper Functions for Parsing ---

const isSectionHeaderLine = (line: string): string | null => {
    const trimmedLine = line.trim();
    // A section header must be the only thing on the line and all caps.
    if (trimmedLine.toUpperCase() === trimmedLine) {
        return SECTION_HEADERS.find(header => trimmedLine === header) || null;
    }
    return null;
}

const isDateOnRight = (line: string): { main: string; date: string } | null => {
    // Regex to find a date pattern at the end of the line, possibly preceded by a tab or multiple spaces.
    const datePattern = /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|Current)[\w\s,–-]*\d{2,4})\s*$/i;
    const match = line.match(datePattern);
    if (match && match[0]) {
        const date = match[0].trim();
        const main = line.substring(0, match.index).trim();
        // Avoid matching section headers as entries
        if (isSectionHeaderLine(main)) return null;
        return { main, date };
    }
    return null;
}

const parseHeader = (line: string): ResumeHeader | null => {
    // Look for a distinct separation (pipe or multiple spaces/tab) between what looks like a name and contact info.
    const parts = line.split(/\|| \t+| {3,}/);
    if (parts.length > 1 && isNaN(parseInt(parts[0].trim()))) { // Ensure the first part isn't just a number
        return {
            name: parts[0].trim(),
            contact: parts.slice(1).join(' | ').trim(),
        };
    }
    return null;
}

const parseSkillLine = (line: string): Skill | null => {
    const parts = line.split(':');
    if (parts.length > 1) {
        return {
            id: self.crypto.randomUUID(),
            category: parts[0].trim(),
            details: parts.slice(1).join(':').trim(),
        };
    }
    return null;
}

// --- Core Parsing Logic ---

export const parseResume = (text: string): ParsedResume => {
    if (!text) return { header: null, sections: [] };

    const lines = text.split('\n');
    let header: ResumeHeader | null = null;
    const sections: ResumeSection[] = [];
    
    let currentSection: StandardSection | SkillsSection | null = null;
    let currentEntry: ResumeEntry | null = null;
    
    let lineIndex = 0;

    // First, try to parse the header from the first non-empty line
    while (lineIndex < lines.length && !lines[lineIndex].trim()) lineIndex++;
    if(lineIndex < lines.length) {
        const parsed = parseHeader(lines[lineIndex]);
        if (parsed) {
            header = parsed;
            lineIndex++;
        }
    }

    // Process the rest of the lines
    for (; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const sectionHeader = isSectionHeaderLine(trimmedLine);
        if (sectionHeader) {
            if (currentSection) sections.push(currentSection);
            currentEntry = null;
            const isSkillType = ['SKILLS', 'TOOLS', 'FRAMEWORKS', 'ANALYTICAL SKILLS'].includes(sectionHeader);
            currentSection = isSkillType
              ? { id: self.crypto.randomUUID(), title: sectionHeader, skills: [] }
              : { id: self.crypto.randomUUID(), title: sectionHeader, entries: [] };
            continue;
        }

        if (!currentSection) continue;

        if (isSkillsSection(currentSection)) {
            const skill = parseSkillLine(trimmedLine);
            if (skill) {
                currentSection.skills.push(skill);
            } else if (trimmedLine) {
                 // Handle skills that might not have a colon, treat the whole line as details
                 currentSection.skills.push({ id: self.crypto.randomUUID(), category: 'General', details: trimmedLine });
            }
        } 
        else if (isStandardSection(currentSection)) {
            const dateMatch = isDateOnRight(line);
            if (dateMatch) {
                currentEntry = {
                    id: self.crypto.randomUUID(),
                    title: '',
                    subtitle: '',
                    date: dateMatch.date,
                    content: [],
                };
                const parts = dateMatch.main.split('|');
                currentEntry.title = parts[0]?.trim() || '';
                currentEntry.subtitle = parts.slice(1).join(' | ').trim();
                currentSection.entries.push(currentEntry);
                continue;
            }

            if (currentEntry) {
                // This line belongs to the current entry.
                // More robust bullet/subheading detection.
                const mainBulletMatch = trimmedLine.match(/^[•*]\s?(.*)/);
                const subBulletMatch = trimmedLine.match(/^[o]\s?(.*)/);
                const subheadingMatch = mainBulletMatch?.[1]?.match(/(.+?):(.*)/);

                if (subheadingMatch) {
                    const newSubheading: ResumeEntrySubheading = {
                        id: self.crypto.randomUUID(),
                        type: 'subheading',
                        title: subheadingMatch[1].trim(),
                        bullets: [],
                    };
                    if (subheadingMatch[2].trim()) {
                        newSubheading.bullets.push({ id: self.crypto.randomUUID(), type: 'bullet', style: 'o', content: subheadingMatch[2].trim() });
                    }
                    currentEntry.content.push(newSubheading);
                } else if (mainBulletMatch) {
                    currentEntry.content.push({ id: self.crypto.randomUUID(), type: 'bullet', style: '•', content: mainBulletMatch[1].trim() });
                } else if (subBulletMatch) {
                     // Find the last subheading to append to, otherwise append to main content
                    const lastContentItem = currentEntry.content[currentEntry.content.length - 1];
                    if (lastContentItem?.type === 'subheading') {
                        lastContentItem.bullets.push({ id: self.crypto.randomUUID(), type: 'bullet', style: 'o', content: subBulletMatch[1].trim() });
                    } else {
                        currentEntry.content.push({ id: self.crypto.randomUUID(), type: 'bullet', style: 'o', content: subBulletMatch[1].trim() });
                    }
                } else {
                     // This is a plaintext line, preserve it!
                    currentEntry.content.push({ id: self.crypto.randomUUID(), type: 'plaintext', content: trimmedLine });
                }
            }
        }
    }

    if (currentSection) sections.push(currentSection);

    return { header, sections };
};


// --- Reconstruction Logic ---

const reconstructEntryContent = (item: ResumeEntryContent): string => {
    switch (item.type) {
        case 'subheading':
            let subText = `• ${item.title}:\n`;
            item.bullets.forEach(b => { subText += `  o ${b.content}\n` });
            return subText;
        case 'bullet':
            return `${item.style === 'o' ? '  o' : '•'} ${item.content}\n`;
        case 'plaintext':
            return `${item.content}\n`;
        default:
            return '';
    }
};

export const reconstructResume = (parsed: ParsedResume): string => {
    let text = '';
    
    // Reconstruct Header
    if (parsed.header) {
        // Using tabs for alignment, which is common in text-based resumes
        text += `${parsed.header.name}\t${parsed.header.contact}\n\n`;
    }

    // Reconstruct Sections
    parsed.sections.forEach((section, index) => {
        text += `${section.title.toUpperCase()}\n`;
        
        if (isStandardSection(section)) {
            section.entries.forEach(entry => {
                const titleLine = [entry.title, entry.subtitle].filter(Boolean).join(' | ');
                text += `${titleLine}\t${entry.date}\n`;
                entry.content.forEach(item => {
                    text += reconstructEntryContent(item);
                });
            });
        }

        if (isSkillsSection(section)) {
            section.skills.forEach(skill => {
                 if (skill.category && skill.category !== 'General') {
                    text += `${skill.category}: ${skill.details}\n`;
                 } else {
                    text += `${skill.details}\n`;
                 }
            });
        }

        if (index < parsed.sections.length - 1) {
            text += '\n';
        }
    });

    return text.trim() + '\n';
};