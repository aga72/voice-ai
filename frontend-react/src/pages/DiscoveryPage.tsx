import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchForm from "../components/SearchForm";
import CompanyTable from "../components/CompanyTable";
import CriteriaGrid from "../components/CriteriaGrid";
import EditCriterionModal from "../components/EditCriterionModal";
import type { Company } from "../components/types/company";
import type { Criterion } from "../components/types/criterion";

type Filters = {
  region: string;
  headcount: string;
  maxCompanies: number;
};

function DiscoveryPage() {
  const navigate = useNavigate();

  // ── Search state ──────────────────────────────────────────
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedWebsites, setSelectedWebsites] = useState<Set<string>>(
    new Set()
  );

  // ── Collapse state ────────────────────────────────────────
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isCriteriaExpanded, setIsCriteriaExpanded] = useState(false);

  // ── Criteria state ────────────────────────────────────────
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ── Fetch criteria on mount ───────────────────────────────
  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        const res = await fetch("/api/criteria");
        if (!res.ok) return;
        const data: Criterion[] = await res.json();
        const normalized = data.map((c) => ({
          ...c,
          isDeleted: c.isDeleted ?? false,
        }));
        setCriteria(normalized);
      } catch (err) {
        console.error("Error fetching criteria", err);
      }
    };
    fetchCriteria();
}, []);

  // ── Search handler ────────────────────────────────────────
  const handleSearch = async (query: string, filters: Filters) => {
    setIsSearching(true);
    setCompanies([]);
    setSelectedWebsites(new Set());
    setSearchId(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, filters }),
      });

      if (!res.ok) {
        console.error("Search failed", res.status);
        return;
      }

      const data = await res.json();
      setCompanies(data.companies ?? []);
      setSearchId(data.searchId);
      setIsTableExpanded(true); // ← auto-expand table when results arrive
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // ── Criteria handlers ─────────────────────────────────────
  const patchCriterion = async (id: string, updates: Partial<Criterion>) => {
    try {
      await fetch(`/api/criteria/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Failed to patch criterion:", err);
    }
  };

  const handleToggle = (id: string) => {
    setCriteria((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, isActive: !c.isActive };
        patchCriterion(id, { isActive: updated.isActive });
        return updated;
      })
    );
  };

  const handleEdit = (id: string) => {
    setEditingCriterionId(id);
    setIsEditModalOpen(true);
  };

  const handleDescriptionChange = (id: string, description: string) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, description } : c))
    );
    patchCriterion(id, { description });
  };

  const handleDeleteCriterion = (id: string) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isDeleted: true } : c))
    );
    patchCriterion(id, { isDeleted: true });
  };

  const handleCreateCriterion = async () => {
    try {
      const res = await fetch("/api/criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Criterion",
          description: "",
          isActive: true,
        }),
      });
      const data = await res.json();
      setCriteria((prev) => [...prev, data]);
      setEditingCriterionId(data.id);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Failed to create criterion:", err);
    }
  };

  const handleModalChange = (
    id: string,
    updates: { title?: string; description?: string }
  ) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    patchCriterion(id, updates);
  };


  // ── Evaluate handler ──────────────────────────────────────
  const handleEvaluate = async () => {
    if (selectedWebsites.size === 0 || !searchId) return;

    const selectedCompanies = companies
      .filter((c) => selectedWebsites.has(c.website))
      .map((c) => ({ name: c.name, website: c.website }));

    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId, companies: selectedCompanies }),
      });

      if (!res.ok) {
        console.error("Failed to start evaluation", res.status);
        return;
      }

      const data = await res.json();
      navigate(`/evaluations/${data.evaluationId}/results`);
    } catch (err) {
      console.error("Error starting evaluation:", err);
    }
  };

  // ── Derived ───────────────────────────────────────────────
  const activeCriteriaCount = criteria.filter(
    (c) => c.isActive && !c.isDeleted
  ).length;
  const editingCriterion = criteria.find((c) => c.id === editingCriterionId);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col gap-6">

      {/* Search Form */}
      <SearchForm onSearch={handleSearch} isLoading={isSearching} />

      {/* ── Collapsible Company Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 drop-shadow overflow-hidden">
        <button
          onClick={() => setIsTableExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="font-heading font-semibold text-brand-grey text-lg">
              Search Results
            </span>
            {isSearching && (
              <span className="text-sm text-brand-gold animate-pulse">
                Searching…
              </span>
            )}
            {!isSearching && companies.length > 0 && (
              <span className="text-sm bg-brand-gold/10 text-brand-gold font-medium px-2 py-0.5 rounded-full">
                {companies.length} found · {selectedWebsites.size} selected
              </span>
            )}
            {!isSearching && companies.length === 0 && (
              <span className="text-sm text-gray-400">No results yet</span>
            )}
          </div>
          <span className="text-xl text-gray-400">
            {isTableExpanded ? "▾" : "▸"}
          </span>
        </button>

        {isTableExpanded && (
          <div className="border-t border-gray-100 px-5 py-4">
            {companies.length > 0 ? (
              <CompanyTable
                companies={companies}
                selectedWebsites={selectedWebsites}
                onSelectionChange={setSelectedWebsites}
              />
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                Run a search above to see results here.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Collapsible Criteria Panel ── */}
      <div className="bg-white rounded-xl border border-gray-200 drop-shadow overflow-hidden">
        <button
          onClick={() => setIsCriteriaExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="font-heading font-semibold text-brand-grey text-lg">
              Evaluation Criteria
            </span>
            <span className="text-sm bg-brand-gold/10 text-brand-gold font-medium px-2 py-0.5 rounded-full">
              {activeCriteriaCount} active
            </span>
          </div>
          <span className="text-xl text-gray-400">
            {isCriteriaExpanded ? "▾" : "▸"}
          </span>
        </button>

        {isCriteriaExpanded && (
          <div className="border-t border-gray-100 px-5 py-4">
            <p className="text-sm text-gray-500 mb-4">
              Edit your criteria while the search runs. Only active criteria
              will be used in the evaluation.
            </p>
            <CriteriaGrid
              criteria={criteria.filter((c) => !c.isDeleted)}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDescriptionChange={handleDescriptionChange}
              onDelete={handleDeleteCriterion}
              onCreate={handleCreateCriterion}
            />
          </div>
        )}
      </div>

      {/* ── Evaluate Button ── */}
      <div className="flex justify-end">
        <button
          onClick={handleEvaluate}
          disabled={selectedWebsites.size === 0 || !searchId}
          className="px-8 py-3 bg-brand-gold text-white font-heading font-semibold rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
        >
          Evaluate {selectedWebsites.size > 0 ? `${selectedWebsites.size} ` : ""}
          {selectedWebsites.size === 1 ? "Company" : "Companies"} →
        </button>
      </div>

      {/* ── Edit Criterion Modal ── */}
      {isEditModalOpen && editingCriterion && (
        <EditCriterionModal
          isOpen={isEditModalOpen}
          criterion={editingCriterion ?? null}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCriterionId(null);
          }}
          onChange={handleModalChange}
        />
      )}
    </div>
  );
}

export default DiscoveryPage;
