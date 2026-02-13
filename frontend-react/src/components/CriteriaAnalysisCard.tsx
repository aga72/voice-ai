import { useEffect, useState } from "react";
import type { CriterionAnalysis } from "./types/analysis";

type CriteriaAnalysisCardProps = {
  analysis: CriterionAnalysis;
};

function CriteriaAnalysisCard({ analysis }: CriteriaAnalysisCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const durationMS = 15000; 

    const isLoaded = analysis.reasoning !== "Analyzing…";

    const getConfidenceStyles = (score: string | number) => {
        // Normalize to lowercase in case the API returns "High" or "HIGH"
        const normalizedScore = String(score).toLowerCase();
        
        if (normalizedScore === "high") return "bg-green-500 text-white";
        if (normalizedScore === "med" || normalizedScore === "medium") return "bg-brand-gold text-gray-900"; // Dark text for readability
        if (normalizedScore === "low") return "bg-brand-red text-white";
        
        return "bg-gray-400 text-white"; // Fallback just in case
    };

    useEffect(() => {
        if (isLoaded) {
            // Complete the progress bar first
            setProgress(100);
            
            // After a brief delay, fade in the results
            const fadeTimer = setTimeout(() => {
                setShowResults(true);
            }, 400); // Wait for progress bar to reach 100%
            
            return () => clearTimeout(fadeTimer);
        } else {
            // Reset states when loading
            setShowResults(false);
            setProgress(0);
            
            const maxFakeProgress = 99;
            const stepMs = 100;
            const steps = durationMS / stepMs;
            const increment = 100 / steps;

            const id = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + increment;
                    if (next >= maxFakeProgress) {
                        clearInterval(id);
                        return maxFakeProgress;
                    }
                    return next;
                });
            }, stepMs);
        
            return () => clearInterval(id);
        }
    }, [durationMS, isLoaded]);

    return (
        <div className="bg-white rounded-lg border-gray-300 hover:border-brand-gold border drop-shadow hover:drop-shadow-xl p-2 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1">
        
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold text-brand-blue">{expanded ? "▾" : "▸"}</span>
                    <span className="font-heading text-left text-base font-semibold text-brand-grey">
                        {analysis.criterionTitle}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {isLoaded ? (
        <>
                            <span className="font-heading text-lg font-bold text-brand-blue">
                                {analysis.matchPercentage}%
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold hover:drop-shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${getConfidenceStyles(analysis.confidenceScore)}`}>
                                {analysis.confidenceScore}
                            </span>
                        </>
                    ) : (
                        <div className="text-gray-400 text-sm font-medium animate-pulse">
                            Analyzing Criteria... {Math.round(progress)}% Complete
                        </div>
                    )}
                </div>
            </button>

            <div className="bg-gray-100 rounded-lg border-gray-200 border drop-shadow hover:drop-shadow-xl p-2 flex items-center transition-all duration-300 hover:-translate-y-0.5">
                <span className="font-body text-sm text-brand-grey">
                    {analysis.criterionDescription}
                </span>
            </div>

            {/* Progress bar - shows during loading OR completing after load */}
            {(!showResults || progress < 100) && (
                <div className={`w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-2 mt-2 transition-opacity duration-500 ${showResults ? 'opacity-0' : 'opacity-100'}`}>
                    <div
                        className="h-full bg-brand-blue transition-all duration-400 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Reasoning section with fade-in */}
            {expanded && showResults && (
                <div className="bg-gray-100 rounded-lg border-gray-200 border drop-shadow hover:drop-shadow-xl p-2 flex flex-col gap-2 transition-all duration-300 hover:-translate-y-0.5">
                    <span className="w-full p-2 rounded-lg text-base font-semibold bg-brand-gold text-gray-900">
                                Match Reasoning
                    </span>
                    <span className="p-2 font-body text-sm text-brand-grey">
                        {analysis.reasoning}
                    </span>
                </div>)}

            {expanded && showResults && (
                <div className="bg-gray-100 rounded-lg border-gray-200 border drop-shadow hover:drop-shadow-xl p-2 flex flex-col gap-2 transition-all duration-300 hover:-translate-y-0.5">
                    <span className="w-full p-2 rounded-lg text-base font-semibold bg-brand-gold text-gray-900">
                        Sources & Evidence
                    </span>
                    
                    <div className="flex flex-col gap-3">
                        {analysis.quotedEvidence && analysis.quotedEvidence.length > 0 ? (
                            analysis.quotedEvidence.map((quote, index) => {
                                const sourceUrl = analysis.sources?.[index];
                                
                                return (
                                    <div 
                                        key={index} 
                                        className="bg-white rounded-md p-4 shadow-sm border border-gray-200 flex flex-col gap-2 transition-shadow hover:shadow-md"
                                    >
                                        <blockquote className="border-l-2 border-brand-blue pl-3 font-body text-sm italic text-gray-700">
                                            "{quote}"
                                        </blockquote>
                                        
                                        {sourceUrl && (
                                            <div className="text-xs font-medium mt-1 flex items-start gap-1">
                                                <span className="text-gray-400 shrink-0">Source:</span>
                                                {sourceUrl.startsWith('http') ? (
                                                    <a 
                                                        href={sourceUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-brand-blue hover:underline break-all"
                                                    >
                                                        {sourceUrl}
                                                    </a>
                                                ) : (
                                                    <span className="text-brand-grey">{sourceUrl}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="p-2 font-body text-sm text-brand-grey italic">
                                No specific quotes or sources were returned for this analysis.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


export default CriteriaAnalysisCard;