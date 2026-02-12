import CriteriaCard from "./CriteriaCard";
import type { Criterion } from './types/criterion';

type CriteriaGridProps = {
  criteria: Criterion[];
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
};

function CriteriaGrid(props: CriteriaGridProps) {
  const { criteria, onToggle, onEdit, onDescriptionChange } = props;

  if (criteria.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
        No criteria yet. Use “Create new” to add one.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {criteria.map((c) => (
        <CriteriaCard
            key={c.id}
            id={c.id}
            title={c.title}
            description={c.description}
            isActive={c.isActive}
            onToggle={onToggle}
            onEdit={onEdit}
            onDescriptionChange={onDescriptionChange}
        />
      ))}
    </div>
  );
}


export default CriteriaGrid;
