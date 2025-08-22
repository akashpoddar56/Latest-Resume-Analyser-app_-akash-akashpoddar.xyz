


import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Header from '../components/Header';
import TextAreaInput from '../components/TextAreaInput';
import AnalysisResult from '../components/AnalysisResult';
import Spinner from '../components/Spinner';
import ResumePreview from '../components/ResumePreview';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EditIcon } from '../components/icons/EditIcon';
import type { AnalysisResult as AnalysisResultType } from '../types';

// --- Gemini AI Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallSummary: {
            type: Type.STRING,
            description: "A high-level summary of how well the resume aligns with the job description. Should be 2-4 sentences."
        },
        keywordAnalysis: {
            type: Type.OBJECT,
            description: "An analysis of key terms. Extract the top 10-15 most important keywords/skills from the job description. Then, provide a list of those keywords that are also present in the resume, and a list of those that are missing.",
            properties: {
                matchedKeywords: {
                    type: Type.ARRAY,
                    description: "A list of important keywords from the job description that were also found in the resume.",
                    items: { type: Type.STRING }
                },
                missingKeywords: {
                    type: Type.ARRAY,
                    description: "A list of important keywords from the job description that were NOT found in the resume.",
                    items: { type: Type.STRING }
                }
            },
            required: ['matchedKeywords', 'missingKeywords']
        },
        misalignedPoints: {
            type: Type.ARRAY,
            description: "List of 2-3 key points from the resume that are most misaligned with the job description or could be significantly improved.",
            items: {
                type: Type.OBJECT,
                properties: {
                    point: { type: Type.STRING, description: "The original bullet point from the resume." },
                    reason: { type: Type.STRING, description: "The reason why this point is misaligned with the job description." },
                    suggestion: { type: Type.STRING, description: "A suggested rewrite of the bullet point to better align with the job description." }
                },
                required: ['point', 'reason', 'suggestion']
            }
        },
        categorizedPoints: {
            type: Type.ARRAY,
            description: "A breakdown of each relevant experience bullet point in the resume, categorized by its strength. Exclude education and skills sections.",
            items: {
                type: Type.OBJECT,
                properties: {
                    point: { type: Type.STRING, description: "The bullet point from the resume's professional experience section." },
                    strength: { type: Type.STRING, enum: ['strong', 'medium', 'weak'], description: "Categorization of the point's strength (strong, medium, weak) against the job description." },
                    justification: { type: Type.STRING, description: "Explanation for why the point was categorized with that strength." },
                    suggestion: { type: Type.STRING, description: "Optional suggestion for improvement, especially for 'weak' or 'medium' points. Provide suggestions for all 'weak' points." }
                },
                required: ['point', 'strength', 'justification']
            }
        }
    },
    required: ['overallSummary', 'keywordAnalysis', 'misalignedPoints', 'categorizedPoints']
};
// --- End Gemini AI Setup ---

interface AnalyzerPageProps {
  resumeText: string;
  onSetResumeText: (text: string) => void;
  onNavigateToEditor: () => void;
}

const AnalyzerPage: React.FC<AnalyzerPageProps> = ({ resumeText, onSetResumeText, onNavigateToEditor }) => {
  const [jdText, setJdText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim() || !jdText.trim()) {
      setError("Please provide both a resume and a job description.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const prompt = `
        Analyze the following resume against the provided job description. Provide a detailed analysis to help the candidate improve their application.

        **Resume:**
        ---
        ${resumeText}
        ---

        **Job Description:**
        ---
        ${jdText}
        ---

        Provide your analysis in a structured JSON format.
      `;

      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: analysisSchema,
              systemInstruction: "You are an expert career coach and resume writer. Your task is to analyze a candidate's resume against a given job description and provide a detailed, constructive analysis. Your analysis should be objective, focusing on quantifiable achievements and direct relevance to the job description. Avoid vague praise and focus on actionable feedback.",
          }
      });
      
      const jsonText = response.text.trim();
      const result = JSON.parse(jsonText);

      // Basic validation to ensure the result matches the expected structure
      if (!result.overallSummary || !result.keywordAnalysis || !Array.isArray(result.misalignedPoints) || !Array.isArray(result.categorizedPoints)) {
          throw new Error("Invalid analysis result structure from API.");
      }
      
      setAnalysisResult(result as AnalysisResultType);
    } catch (err) {
      console.error("Analysis Error:", err);
      let errorMessage = "An error occurred during analysis. Please check the console for details and try again.";
      if (err instanceof Error) {
        errorMessage = err.message.includes("API key not valid") 
          ? "The provided API key is not valid. Please check your configuration."
          : `An error occurred during analysis: ${err.message}. Please try again.`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [resumeText, jdText]);

  return (
    <>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Header />
        <main className="container mx-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-slate-600 mb-8 max-w-3xl mx-auto">
              Paste your resume and the target job description below. Our AI will analyze how well they align and provide actionable feedback to improve your chances.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <TextAreaInput
                id="resume"
                label="Your Resume"
                value={resumeText}
                onChange={(e) => onSetResumeText(e.target.value)}
                placeholder="Paste your resume here..."
                rows={20}
              />
              <TextAreaInput
                id="job-description"
                label="Job Description"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description here..."
                rows={20}
              />
            </div>
            <div className="text-center mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
               <button
                onClick={onNavigateToEditor}
                disabled={!resumeText.trim()}
                className="inline-flex items-center justify-center px-8 py-3 font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-lg shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300 disabled:bg-slate-100 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed"
                aria-label="Edit Resume Sections"
              >
                <EditIcon className="w-5 h-5 mr-2" />
                Edit Sections
              </button>
              <button
                onClick={() => setShowPreview(true)}
                disabled={!resumeText.trim()}
                className="inline-flex items-center justify-center px-8 py-3 font-semibold text-brand-primary bg-white border-2 border-brand-primary rounded-lg shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300 disabled:bg-slate-100 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed"
                aria-label="Preview Resume"
              >
                <EyeIcon className="w-5 h-5 mr-2" />
                Preview Resume
              </button>
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !resumeText.trim() || !jdText.trim()}
                className="inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-brand-primary rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Analyze and Suggest
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {!isLoading && analysisResult && <AnalysisResult result={analysisResult} />}
          </div>
        </main>
      </div>
      {showPreview && (
        <ResumePreview 
          resumeText={resumeText} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </>
  );
};

export default AnalyzerPage;
