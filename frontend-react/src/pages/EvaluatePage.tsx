import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from '../components/Hero';
import CriteriaGrid from "../components/CriteriaGrid";
// import CriteriaAnalysisGrid from "../components/CriteriaAnalysisGrid";
import EditCriterionModal from "../components/EditCriterionModal";
import type { Criterion } from "../components/types/criterion";
// import type { CriterionAnalysis } from "../components/types/analysis";
// import MessageForm from './components/MessageForm';
// import ChatForm from './components/ChatForm';

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";


export default function EvaluatePage() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [analyses, setAnalyses] = useState<Record<string, CriterionAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // const [hasAnalysis, setHasAnalysis] = useState(false);
  // const [analysisQueue, setAnalysisQueue] = useState<Criterion[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        const res = await fetch("/api/criteria");
        if (!res.ok) {
          console.error("Failed to fetch criteria", res.status);
          return;
        }

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

  async function patchCriterion(
    id: string,
    updates: Partial<Pick<Criterion, "title" | "description" | "isActive" | "isDeleted">>
  ) {
    try {
      await fetch(`/api/criteria/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Failed to persist criterion updates", err);
    }
  }


  const handleToggle = (id: string) => {
    setCriteria((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    );

    // Persist to Firestore (best effort)
    const criterion = criteria.find((c) => c.id === id);
    if (criterion) {
      patchCriterion(id, { isActive: !criterion.isActive });
    }
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

  const closeEditing = () => {
    setIsEditModalOpen(false);
    setEditingCriterionId(null);
  };

  const handleEditCriterionChange = (
    id: string,
    updates: { title?: string; description?: string }
  ) => {
    setCriteria((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      )
    );
    patchCriterion(id, updates);
  };

  const handleDeleteCriterion = (id: string) => {
  // Optimistic UI: mark as deleted locally
    setCriteria((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isDeleted: true } : c
      )
    );

    // Persist to Firestore (best effort)
    patchCriterion(id, { isDeleted: true });
  };

  const handleCreateCriterion = async () => {
    const res = await fetch("/api/criteria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "",
        description: "",
        isActive: true,
      }),
    });

    if (!res.ok) {
      console.error("Failed to create criterion", res.status);
      return;
    }

    const created: Criterion = await res.json(); // gets id, title, description, isActive

    // include isDeleted on the client
    const createdWithDeleted: Criterion = { ...created, isDeleted: false };

    setCriteria((prev) => [...prev, createdWithDeleted]);
    setEditingCriterionId(createdWithDeleted.id);
    setIsEditModalOpen(true);
  };


  const editingCriterion =
    editingCriterionId !== null
      ? criteria.find((c) => c.id === editingCriterionId) ?? null
      : null;

  // const handleEvaluateCompany = async (companyUrl: string) => {
  //   if (!companyUrl.trim()) return;

  //   const activeCriteria = criteria.filter((c) => c.isActive && !c.isDeleted);
  //   if (activeCriteria.length === 0) {
  //     console.warn("No active criteria to analyze");
  //     return;
  //   }

  //   setHasAnalysis(true);
  //   setIsAnalyzing(true);
  //   setAnalyses({});
  //   setAnalysisQueue(activeCriteria);

  //   for (let i = 0; i < activeCriteria.length; i++) {
  //     const crit = activeCriteria[i];

  //     // 1) Seed placeholder for the current card
  //     setAnalyses((prev) => ({
  //       ...prev,
  //       [crit.id]: {
  //         criterionId: crit.id,
  //         criterionTitle: crit.title,
  //         criterionDescription: crit.description,
  //         matchPercentage: 0,
  //         confidenceScore: 0,
  //         reasoning: "Analyzing…",
  //         quotedEvidence: [],
  //         sources: [],
  //       },
  //     }));


  //     // 2) Await the API call ONLY
  //     let result = null;
  //     try {
  //       const res = await fetch("/api/chat", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ company_url: companyUrl, criterion_id: crit.id }),
  //       });

  //       if (res.ok) {
  //         const data = await res.json();
  //         result = data.analysis;
  //       } else {
  //         console.error(`Fetch failed: ${res.status}`);
  //       }
  //     } catch (err) {
  //       console.error("Error calling /api/chat:", err);
  //     }

  //     // 3) INSTANTLY update the UI with the result (or error state)
  //     if (!result) {
  //       setAnalyses((prev) => ({
  //         ...prev,
  //         [crit.id]: { ...prev[crit.id], reasoning: "Failed to load analysis." },
  //       }));
  //     } else {
  //       setAnalyses((prev) => ({
  //         ...prev,
  //         [crit.id]: {
  //           ...prev[crit.id],
  //           matchPercentage: result.match_percentage,
  //           confidenceScore: result.confidence_score,
  //           reasoning: result.reasoning,
  //           quotedEvidence: result.quoted_evidence,
  //           sources: result.sources,
  //         },
  //       }));
  //     }

  //   }

  //   setIsAnalyzing(false);
  //   console.log("Currently analyzing:", isAnalyzing);
  // };

  const extractCompanyName = (url: string): string => {
    try {
      const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
      return hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  const handleEvaluateCompany = async (companyUrl: string) => {
    if (!companyUrl.trim()) return;

    const activeCriteria = criteria.filter((c) => c.isActive && !c.isDeleted);
    if (activeCriteria.length === 0) {
      console.warn("No active criteria to analyze");
      return;
    }

    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchId: null,
          companies: [{
            name: extractCompanyName(companyUrl),  // ← "projectsimpel.com" instead of full URL
            website: companyUrl.startsWith("http") ? companyUrl : `https://${companyUrl}`,
          }],
        }),
      });

      if (!res.ok) {
        console.error("Failed to start evaluation", res.status);
        return;
      }

      const data = await res.json();
      navigate(`/evaluations/${data.evaluationId}/results`);
    } catch (err) {
      console.error("Error starting evaluation:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };



 return (
  <main className="max-w-4xl mx-auto px-6 py-12">
    <Hero
      onEvaluate={handleEvaluateCompany}
      isAnalyzing={isAnalyzing}
      hasAnalyzed={false}
    />
    <h2 className="font-heading text-xl font-semibold text-brand-blue">
      Custom Analysis Criteria (LLM Prompts)
    </h2>
    <p className="text-sm text-gray-500 mb-6">
      Choose your prompts for a criteria...
    </p>
    <CriteriaGrid
      criteria={criteria.filter((c) => !c.isDeleted)}
      onToggle={handleToggle}
      onEdit={handleEdit}
      onDescriptionChange={handleDescriptionChange}
      onDelete={handleDeleteCriterion}
      onCreate={handleCreateCriterion}
    />
    <EditCriterionModal
      isOpen={isEditModalOpen}
      criterion={editingCriterion}
      onClose={closeEditing}
      onChange={handleEditCriterionChange}
    />
  </main>
);

}


