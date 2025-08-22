
import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import AnalyzerPage from './pages/AnalyzerPage';
import EditorPage from './pages/EditorPage';
import { defaultResume } from './constants/resume';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'analyzer' | 'editor'>('landing');
  const [resumeText, setResumeText] = useState<string>(defaultResume);

  const navigateToAnalyzer = () => {
    setCurrentPage('analyzer');
  };

  const navigateToEditor = () => {
    setCurrentPage('editor');
  };

  const handleSaveChanges = (newResumeText: string) => {
    setResumeText(newResumeText);
    setCurrentPage('analyzer');
  };

  // Conditionally render the page based on state
  switch (currentPage) {
    case 'landing':
      return <LandingPage onNavigateToAnalyzer={navigateToAnalyzer} />;
    case 'analyzer':
      return (
        <AnalyzerPage
          resumeText={resumeText}
          onSetResumeText={setResumeText}
          onNavigateToEditor={navigateToEditor}
        />
      );
    case 'editor':
      return (
        <EditorPage
          initialResumeText={resumeText}
          onSaveChanges={handleSaveChanges}
          onCancel={() => setCurrentPage('analyzer')}
        />
      );
    default:
      return <LandingPage onNavigateToAnalyzer={navigateToAnalyzer} />;
  }
};

export default App;
