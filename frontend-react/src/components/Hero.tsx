import { useState } from 'react';

type HeroProps = {
  onEvaluate: (url: string) => void;
  isAnalyzing: boolean;
hasAnalyzed: boolean;
};

function Hero({ onEvaluate, isAnalyzing, hasAnalyzed }: HeroProps) {
    const [url, setUrl] = useState("");

    // Determine the button text based on the current state
    let buttonText = "Evaluate Company";
    if (isAnalyzing) {
        buttonText = "Evaluating...";
    } else if (hasAnalyzed) {
        buttonText = "Run Again";
    }

    return (
        <div className="bg-white rounded-lg border-gray-300 border drop-shadow-xl px-3 py-4 flex flex-col md:flex-row gap-1 justify-between mb-14">
            {/* URL Input Box */}
            <textarea 
                placeholder="Paste Company URL (e.g., www.stripe.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-white rounded-lg border-gray-200 border-1 p-2 w-full h-36 md:h-12 font-heading text-brand-grayplaceholder:text-gray-400 font-semibold text-lg resize-none outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors">
            </textarea>

            {/* Analyze Button */}
            <button 
                onClick={() => onEvaluate(url)}
                disabled={isAnalyzing || !url.trim()} 
                className={`rounded-lg border-3 px-4 py-2 w-full md:w-auto h-12 whitespace-nowrap flex items-center justify-center shadow-md transition-all duration-200 
                ${isAnalyzing || !url.trim() 
                    ? 'bg-gray-200 border-gray-200 cursor-not-allowed opacity-80' 
                    : 'bg-brand-gold hover:bg-amber-500 border-brand-gold hover:border-amber-500 hover:-translate-y-0.25 hover:shadow-lg' 
                }`}
            >
                <span className={`font-heading text-lg font-bold ${isAnalyzing ? 'animate-pulse text-gray-500' : 'text-brand-grey'}`}>
                    {buttonText}
                </span>
            </button>
        </div>
    )

}

export default Hero;