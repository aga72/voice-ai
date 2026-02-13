import AddIcon from './icons/AddIcon';

type AddCriterionProps = {
  onCreate: () => void;
};

function AddCriteriaCard({ onCreate }: AddCriterionProps) {

    return (
    <div className="bg-white rounded-lg border-gray-300 border-2 border-dashed hover:border-brand-gold drop-shadow hover:drop-shadow-xl p-2 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1">
        <button 
            onClick={onCreate}
            className="flex-shrink-0 text-brand-grey hover:text-brand-blue transition-all duration-300 hover:-translate-y-0.5 h-32 md:h-16 my-4">
                <AddIcon className="w-24 h-24 md:h-16 md:w-16" />
        </button>
    </div>
    );
}

export default AddCriteriaCard;
