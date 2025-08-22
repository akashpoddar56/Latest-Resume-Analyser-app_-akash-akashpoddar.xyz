
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Header from './components/Header';
import TextAreaInput from './components/TextAreaInput';
import AnalysisResult from './components/AnalysisResult';
import Spinner from './components/Spinner';
import { SparklesIcon } from './components/icons/SparklesIcon';
import type { AnalysisResult as AnalysisResultType } from './types';

// --- Gemini AI Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallSummary: {
            type: Type.STRING,
            description: "A high-level summary of how well the resume aligns with the job description. Should be 2-4 sentences."
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
    required: ['overallSummary', 'misalignedPoints', 'categorizedPoints']
};
// --- End Gemini AI Setup ---


const defaultResume = `AKASH PODDAR        	+91-7771989777 | akashpoddar.strategy@gmail.com | linkedin.com/in/akashpoddar56

EDUCATION	
MSc. Strategic Entrepreneurship & Innovation | King's College London | 4/4 GPA, distinction (top 5% of 200)	Sep 19 – Sep 20
o	Awarded distinction for business model innovation thesis: P2P solar microgrid powering rural electrification & kerosene phase-out
o	Designed PAYG lease-to-own pricing model through financial modeling, DCF & scenario analysis, projecting 30% ROI & 19% IRR
o	Integrated CapEx-OpEx trade-off analysis into infrastructure planning, enabling asset-light rollout strategy tailored for rural context

B.B.A. (International Business) | Pune University | 7/10 GPA, first-class distinction (top 10% of 350) 	Jun 15 – Jun 18
Capstone: Executed M&A transaction diligence for Disney’s $52.4B Fox deal, analyzing 7K+ IP assets for strategic fit & integration 
o	Projected ~35% global box office share & 3% growth via portfolio-synergy modeling, competitive benchmarking & risk assessment

Tools: Excel (Pivot, Macros), SQL, Power BI, Python, Alteryx, PowerPoint, ERP (Tally, SAP) | Analytical Skills: Primary & Secondary Research, Financial Modelling, Market Sizing, Business Case Development, Root Cause Analysis, Competitive Benchmarking, IP Commercialization, Business Model Innovation | Frameworks: PESTLE, Porter’s five Forces, SWOT, Business Model Canvas

PROFESSIONAL EXPERIENCE
Founding Business Manager | Saraswati Material Science (Saraswati Group of Companies) 		May 21 – Present

•	Delivery & Operations Leadership: 
o	Reduced order-to-delivery cycle from 15 to ~2 days, driving 80% improvement in On Time Deliveries through bottleneck removal
o	Cut shipment errors by 90% and improved accuracy through implementation of real-time inventory tracking and quality checks
o	Boosted OTD by 80% by eliminating bottlenecks while leading 12-member team driving last-mile fulfillment across 5+ states
o	Increased 15K-tons extrusion line utilization by 7% by applying Lean principles, critical for private labeling transition
o	Boosted order values by 20% via refined last-mile distribution to indirect B2B clients with 20+ 3PL support via multi-stop routing
o	Reduced stockouts by 30% & inventory waste by ₹2.5 Cr/year by developing aggregate demand plans & enabling pull-based planning
o	Hit 100% inventory accuracy by deploying Python-based ETL workflows, standardizing raw purchase inputs for 400+ SKUs in Tally ERP
o	Generated ₹4.18 Cr & cut ~1.1K tons CO₂ by recycling 380 tons (9.5% of input) of polymer waste for downstream suitcase production
o	Achieved 90% reduction in shipment errors & material damage by enforcing SOP-driven inspection & structured loading processes 
•	Strategy/GTM: Led Corporate strategy & portfolio management by launching & scaling Polymers & Agrochemicals industrial vertical
o	Orchestrated ₹24 Cr+ annual revenue growth initiative, achieving 28% YoY revenue uplift and scaled polymer sales to 920+ tons
o	Authored GTM playbooks & ‘Polymer Market Insights’ deck; adopted by 4+ regional teams for pricing & strategy planning across India
o	Enhanced purchasing for 5K+ clients by co-developing sample catalogs, driving product visibility & GTM precision across 5 categories
o	Acquired all mandatory licenses (GST, MSME, FCO, EHS) for 2 new BUs & fast-tracking approvals to initiate agrochemical distribution

Pricing & Revenue Optimization: Formulated revenue models for new regions, optimizing competitiveness, margins and value capture
o	Engineered segmented pricing framework for 40+ B2B clients covering 6 product lines using cost-, competitor-, & value-based models
o	Extracted pricing elasticity & customer sensitivity insights from 250+ dealer data points to inform margin-optimized pricing decisions
o	Streamlined ₹18.5 Cr in transactions by creating data-driven pricing tool, improving accuracy by 30% & saving 150 hours annually
o	Standardized portfolio pricing logic by aligning plant costs (kg) with retail units (sq. mtr.) through DMAIC-based tool

•	FP&A: Took P&L ownership & delivered strategic financial analyses to CXOs, informing critical business decisions & resource allocation
o	Directed annual operating plan & rolling forecasts across revenue, margins & cost centers, guiding strategic & budgetary planning 
o	Automated invoicing via Tally-GST API integration, enhancing finance efficiency & establishing scalable billing processes
o	Managed month-end & quarter-end closings including accruals, adjustments, & ledger finalization, ensuring accuracy & timeliness
o	Delivered CXO-facing review deck integrating sales, logistics, & vendor metrics via Excel & PowerPoint 

•	Brand Awareness: Drove 3X ROI & 8% MQL-SQL conversion (~300 MQLs) by managing ₹1.5L/month ad spend across digital channels

Management Trainee | Saraswati Group of Companies	Apr 21 – May 21
o	Secured CXO buy-in for South India GTM expansion, targeting ₹990Cr TAM across 5 states to regain post-COVID revenue momentum
o	Built strategic & financial models to evaluate facility acquisition/lease options, forecasting ROI & cost implications for lean scale-up
o	Led ₹12Cr investment (CapEx & OpEx) & 10+ headcount plan to activate warehousing, scale supply chain, & onboard 40+ B2B clients
o	Devised ₹30Cr recovery plan to resolve legacy debt & prevent ₹9Cr+ in order disruptions via phased collections & pricing resets
o	Proposed unified revenue models & SAP–Salesforce integration to unlock automation, decision visibility, & cross-BU collaboration

IT Business Analyst | Accenture	Dec 18 – Apr 19
o	Enabled multi-year digital banking transformation project for European financial institution, in FinTech Joint Venture with Accenture
o	Provided actionable insights to 3 enterprise clients by building BI dashboard to track 15+ KPIs & analyze time, cost, & quality variances
o	Trimmed 70+ hours/month & improved SLA reporting precision by 95% through VBA-Excel automation, ensuring zero-defect analysis
o	Collaborated with onsite clients in agile sprints to capture evolving requirements & align solutions for enhanced service delivery agility
o	Selected as (1/350+ staff) to lead tech stack discovery & usage analysis under guidance of senior management & offshore clients
o	Steered coordination across siloed IT & business units (PMO, SMO, Product) by liaising with CFTs under Chinese wall protocols
	Cut onboarding time by 30% for new Analysts by creating SOPs & process documentation in ServiceNow & mentoring 2 new hires

Extracurricular Involvement: Project Manager | KCL Alumni Association (Hyderabad Chapter)	Sep 22 – Present
o	Mobilized 5 civic organizations to champion local implementation of the UN’s Global Agenda 2030 across Telangana & Karnataka
o	Engaged 750+ people & advanced 9 SDGs by leading natural farming workshops & mental health campaigns across local communities`;

const App: React.FC = () => {
  const [resumeText, setResumeText] = useState<string>(defaultResume);
  const [jdText, setJdText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!result.overallSummary || !Array.isArray(result.misalignedPoints) || !Array.isArray(result.categorizedPoints)) {
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
              onChange={(e) => setResumeText(e.target.value)}
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
          <div className="text-center mb-8">
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
  );
};

export default App;
