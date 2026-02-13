import { useState, useEffect } from "react";
import Header from './components/Header';
import Hero from './components/Hero';
import CriteriaGrid from "./components/CriteriaGrid";
import EditCriterionModal from "./components/EditCriterionModal";
import type { Criterion } from "./components/types/criterion";
// import MessageForm from './components/MessageForm';
// import ChatForm from './components/ChatForm';

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";


function App() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
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


  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Hero />
        <h2 className="font-heading text-xl font-semibold text-brand-blue">
            Custom Analysis Criteria (LLM Prompts)
        </h2>
        <p className="text-sm text-gray-500 mb-6">
            Choose your prompts for a criteria...
        </p>
        <CriteriaGrid
        criteria={criteria.filter(c => !c.isDeleted)}
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
    </div>
  );
}

export default App;
