
export interface ResumeSection {
    id: string;
    title: string;
    content: string;
}

// A shared list of headers for consistent parsing across the app.
export const SECTION_HEADERS = [
  'EDUCATION',
  'PROFESSIONAL EXPERIENCE',
  'EXPERIENCE',
  'SKILLS',
  'TECHNICAL SKILLS',
  'PROJECTS',
  'EXTRACURRICULAR INVOLVEMENT',
  'LEADERSHIP',
  'SUMMARY',
  'OBJECTIVE',
  'PUBLICATIONS',
  'CERTIFICATIONS',
  'AWARDS',
];

// Checks if an entire line is a section header.
const isSectionHeaderLine = (line: string): string | null => {
    const trimmedLine = line.trim();
    const foundHeader = SECTION_HEADERS.find(header => trimmedLine === header);
    return foundHeader || null;
}

export const parseResumeToSections = (text: string): ResumeSection[] => {
    if (!text) return [];

    const sections: ResumeSection[] = [];
    const lines = text.split('\n');

    let currentSectionContent: string[] = [];
    // The first block of text before any recognized header is the 'Header'.
    let currentTitle = 'Header'; 

    lines.forEach((line) => {
        const headerMatch = isSectionHeaderLine(line);

        if (headerMatch) {
            // Found a new section header, so save the previous section's content.
            sections.push({
                id: `${currentTitle}-${sections.length}`,
                title: currentTitle,
                content: currentSectionContent.join('\n').trim(),
            });

            // Start the new section
            currentTitle = headerMatch;
            currentSectionContent = [];
        } else {
            currentSectionContent.push(line);
        }
    });

    // Add the last processed section to the array
    sections.push({
        id: `${currentTitle}-${sections.length}`,
        title: currentTitle,
        content: currentSectionContent.join('\n').trim(),
    });

    // Filter out any empty sections that might have been created
    return sections.filter(s => s.title || s.content);
};

export const reconstructResumeFromSections = (sections: ResumeSection[]): string => {
    return sections.map(section => {
        if (section.title === 'Header') {
            return section.content;
        }
        // Add the title back, followed by its content
        return `${section.title}\n${section.content}`;
    }).join('\n\n'); // Re-join sections with double newlines for spacing
};
