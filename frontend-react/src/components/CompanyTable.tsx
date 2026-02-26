import type { Company } from "./types/company";

type CompanyTableProps = {
  companies: Company[];
  selectedWebsites: Set<string>;
  onSelectionChange: (websites: Set<string>) => void;
};

export default function CompanyTable({ companies, selectedWebsites, onSelectionChange }: CompanyTableProps) {
  const allSelected = companies.length > 0 && selectedWebsites.size === companies.length;
  const someSelected = selectedWebsites.size > 0 && selectedWebsites.size < companies.length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(companies.map((c) => c.website)));
    }
  };

  const toggleOne = (website: string) => {
    const next = new Set(selectedWebsites);
    next.has(website) ? next.delete(website) : next.add(website);
    onSelectionChange(next);
  };

  return (
    <div className="bg-white rounded-lg border-gray-300 border drop-shadow hover:drop-shadow-xl overflow-hidden transition-all duration-300">
      <table className="w-full text-sm">

        {/* Header */}
        <thead>
          <tr className="bg-brand-gold">
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected; }}
                onChange={toggleAll}
                className="cursor-pointer accent-brand-blue w-4 h-4"
              />
            </th>
            {["Company", "Website", "Industry", "Region", "Headcount"].map((col) => (
              <th key={col} className="px-4 py-3 text-left font-heading font-semibold text-sm text-gray-900">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* Rows */}
        <tbody className="divide-y divide-gray-100">
          {companies.map((company) => {
            const isSelected = selectedWebsites.has(company.website);
            return (
              <tr
                key={company.website}
                onClick={() => toggleOne(company.website)}
                className={`cursor-pointer transition-all duration-150
                  ${isSelected
                    ? "bg-blue-50 border-l-4 border-l-brand-blue"
                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(company.website)}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer accent-brand-blue w-4 h-4"
                  />
                </td>
                <td className="px-4 py-3 font-heading font-semibold text-brand-grey">
                  {company.name}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-body text-brand-blue hover:underline text-sm"
                  >
                    {company.website}
                  </a>
                </td>
                <td className="px-4 py-3 font-body text-sm text-brand-grey">{company.industry}</td>
                <td className="px-4 py-3 font-body text-sm text-brand-grey">{company.region}</td>
                <td className="px-4 py-3 font-body text-sm text-brand-grey">{company.headcount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
