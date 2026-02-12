import { useState } from "react";
import Header from './components/Header';
import Hero from './components/Hero';
import CriteriaGrid from "./components/CriteriaGrid";
import EditCriterionModal from "./components/EditCriterionModal";
import type { Criterion } from "./components/types/criterion";
// import MessageForm from './components/MessageForm';
// import ChatForm from './components/ChatForm';

function App() {
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: "1", title: "Market Sizing & Growth", description: "Your custom prompt instructions here...", isActive: true },
    { id: "2", title: "Competitive Landscape", description: "Your custom prompt instructions here...", isActive: true },
  ]);
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  

  const handleToggle = (id: string) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleEdit = (id: string) => {
    setEditingCriterionId(id);
  };

  const handleDescriptionChange = (id: string, description: string) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, description } : c))
    );
  };

  const closeEditing = () => {
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
  };


  const editingCriterion = criteria.find(c => c.id === editingCriterionId) ?? null;
  const isEditModalOpen = editingCriterionId !== null && editingCriterion !== null;

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
        criteria={criteria}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDescriptionChange={handleDescriptionChange}
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
