import AddCriteriaCard from "./AddCriteriaCard";
import CriteriaCard from "./CriteriaCard";
import type { Criterion } from './types/criterion';


type CriteriaGridProps = {
  criteria: Criterion[];
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
};

function CriteriaGrid(props: CriteriaGridProps) {
  const { criteria, onToggle, onEdit, onDescriptionChange, onDelete, onCreate} = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AddCriteriaCard onCreate={onCreate} />
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
            onDelete={onDelete}
        />
      ))}
    </div>
  );
}


export default CriteriaGrid;
