export interface ResumeHeader {
  name: string;
  contact: string;
}

export interface ResumeEntryBullet {
    id: string;
    type: 'bullet';
    style: '•' | 'o';
    content: string;
}

export interface ResumeEntrySubheading {
    id:string;
    type: 'subheading';
    title: string;
    bullets: ResumeEntryBullet[];
}

export interface ResumeEntryPlaintext {
    id: string;
    type: 'plaintext';
    content: string;
}

export type ResumeEntryContent = ResumeEntryBullet | ResumeEntrySubheading | ResumeEntryPlaintext;

export interface ResumeEntry {
  id: string;
  title: string; // e.g., "Founding Business Manager"
  subtitle: string; // e.g., "Saraswati Material Science (Saraswati Group of Companies)"
  date: string;
  content: ResumeEntryContent[];
}

export interface Skill {
    id: string;
    category: string; // e.g., "Tools"
    details: string; // e.g., "Excel (Pivot, Macros), SQL..."
}

export interface SkillsSection {
    id: string;
    title: string;
    skills: Skill[];
}

export interface StandardSection {
  id: string;
  title: string;
  entries: ResumeEntry[];
}

export type ResumeSection = StandardSection | SkillsSection;

export interface ParsedResume {
  header: ResumeHeader | null;
  sections: ResumeSection[];
}