

import React from 'react';

// Inline SVG icons for simplicity and to avoid creating multiple small files
const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 animate-fade-in">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-5 md:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="ml-3 text-2xl md:text-3xl font-bold text-slate-800">AI Resume Analyzer</h1>
          </div>
          <button
            onClick={onGetStarted}
            className="hidden sm:inline-flex items-center justify-center px-6 py-2 font-semibold text-white bg-brand-primary rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24">
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4">Stop Guessing. Start Landing Interviews.</h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 mb-8">
            Build a job-winning resume with our powerful editor, then get instant AI-powered feedback against any job description to help you stand out.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center justify-center px-8 py-4 font-semibold text-lg text-white bg-brand-primary rounded-lg shadow-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300"
          >
            Start Building Your Resume
          </button>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-20 bg-white rounded-lg shadow-lg">
          <div className="max-w-5xl mx-auto px-6">
            <h3 className="text-3xl font-bold text-center text-slate-800 mb-12">Why Use Our Analyzer?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <TargetIcon />
                <h4 className="text-xl font-bold mt-4 mb-2">Keyword Optimization</h4>
                <p className="text-slate-600">Pinpoint missing keywords and align your resume with what recruiters are searching for.</p>
              </div>
              <div className="flex flex-col items-center">
                <TrendingUpIcon />
                <h4 className="text-xl font-bold mt-4 mb-2">Strength & Weakness Breakdown</h4>
                <p className="text-slate-600">Get a bullet-by-bullet analysis of your experience, highlighting what's strong and where you can improve.</p>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircleIcon />
                <h4 className="text-xl font-bold mt-4 mb-2">Actionable Suggestions</h4>
                <p className="text-slate-600">Receive concrete suggestions to rewrite weak points and better showcase your achievements.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 mt-12">
        <p className="text-slate-500">&copy; 2024 AI Resume Analyzer. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default LandingPage;