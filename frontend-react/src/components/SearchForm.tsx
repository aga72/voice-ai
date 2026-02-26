import { useState, useEffect } from "react";
import type { SearchFilters } from "./types/search";

const REGIONS = [
  "Global",
  "USA",
  "Canada",
  "Europe",
  "Australia",
  "Latin America",
];


const HEADCOUNTS = ["Any", "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

const MAX_COMPANIES = [5, 10, 15, 20, 25];

const EXAMPLE_QUERIES = [
  "Vertical market B2B SaaS for the construction industry",
  "Nordic health and safety compliance software companies",
  "Facility management and maintenance operations software",
  "Electrical estimating software for trade contractors",
];

type SearchFormProps = {
  onSearch: (query: string, filters: SearchFilters) => void;
  isLoading: boolean;
};

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Global");
  const [headcount, setHeadcount] = useState("Any");
  const [maxCompanies, setMaxCompanies] = useState(10);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Rotate placeholder every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_QUERIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (!query.trim() || isLoading) return;
    onSearch(query, { region, headcount, maxCompanies });
  };

  const selectClass =
    "bg-white rounded-lg border border-gray-200 px-3 py-2 font-heading text-sm text-brand-grey outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors cursor-pointer";

  return (
    <div className="bg-white rounded-lg border-gray-300 border drop-shadow-xl px-3 py-4 flex flex-col gap-3 mb-6">
      <textarea
        placeholder={EXAMPLE_QUERIES[placeholderIndex]}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
        className="bg-white rounded-lg border-gray-200 border p-2 w-full h-14 font-heading text-brand-grey placeholder:text-gray-400 font-semibold text-base resize-none outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
      />

      <div className="flex flex-wrap items-center gap-2">
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select value={headcount} onChange={(e) => setHeadcount(e.target.value)} className={selectClass}>
          {HEADCOUNTS.map((h) => <option key={h} value={h}>{h} employees</option>)}
        </select>

        <select value={maxCompanies} onChange={(e) => setMaxCompanies(Number(e.target.value))} className={selectClass}>
          {MAX_COMPANIES.map((n) => <option key={n} value={n}>{n} companies</option>)}
        </select>

        <div className="flex-1" />

        <button
          onClick={handleSubmit}
          disabled={!query.trim() || isLoading}
          className={`rounded-lg border-3 px-5 py-2 h-10 whitespace-nowrap flex items-center justify-center shadow-md transition-all duration-200
            ${!query.trim() || isLoading
              ? "bg-gray-200 border-gray-200 cursor-not-allowed opacity-80"
              : "bg-brand-gold hover:bg-amber-500 border-brand-gold hover:border-amber-500 hover:-translate-y-0.5 hover:shadow-lg"
            }`}
        >
          <span className={`font-heading text-base font-bold ${isLoading ? "animate-pulse text-gray-500" : "text-brand-grey"}`}>
            {isLoading ? "Searching..." : "Search"}
          </span>
        </button>
      </div>
    </div>
  );
}
