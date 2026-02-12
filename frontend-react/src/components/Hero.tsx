import { useState } from 'react';

function Hero() {
    const [url, setUrl] = useState('');

    return (
        <div className="bg-white rounded-lg border-gray-300 border drop-shadow-xl px-3 py-4 flex flex-col md:flex-row gap-1 justify-between mb-12">
            {/* URL Input Box */}
            <textarea 
                placeholder="Paste Company URL (e.g., www.stripe.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-white rounded-lg border-gray-200 border-1 p-2 w-full h-36 md:h-12 font-heading text-brand-grayplaceholder:text-gray-400 font-semibold text-lg resize-none outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors">
            </textarea>

            {/* Analyze Button */}
            <button className="bg-brand-gold hover:bg-amber-500 rounded-lg border-brand-gold hover:border-amber-500 border-3 px-4 py-2 w-full md:w-auto h-12 whitespace-nowrap duration-200 flex items-center justify-center hover:-translate-y-0.25 shadow-md hover:shadow-lg transition-all duration-100">
                <span className="font-heading text-lg text-brand-grey font-bold">
                    Evaluate Company
                </span>
            </button>
        </div>
    )

}

export default Hero;