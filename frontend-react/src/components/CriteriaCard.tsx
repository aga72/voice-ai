import { useState } from 'react';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';

type CriteriaCardProps = {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
};


function CriteriaCard(props: CriteriaCardProps) {
    const { 
        description: descriptionFromProps, // <--- This is the magic rename
        isActive: initialIsActive,       // <--- Renaming this one too
        id, 
        title, 
        onToggle, 
        onEdit,
        onDescriptionChange 
    } = props;

    const [isActive, setIsActive] = useState(initialIsActive);

    return (
    <div className="bg-white rounded-lg border-gray-300 border drop-shadow p-2 flex flex-col transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center gap-3 mb-2">
            <button
                onClick={() => {
                    setIsActive((prev) => !prev);
                    onToggle(id);
                }}
                className="flex-shrink-0"
            >
                <div className={`relative w-11 h-5.5 rounded-full shadow-sm hover:shadow-lg transition-all duration-200 flex items-center ${isActive ? 'bg-brand-gold' : 'bg-brand-grey-dark'}`}>
                    <div className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-6' :'translate-x-1'}`}>
                    </div>
                </div>
            </button>
            <h3 className="font-heading font-semibold text-md text-brand-grey flex-1">
                {title}
            </h3>
            <button 
                onClick={() => {
                    if (isActive) {
                    onEdit(id);
                    } else {
                    console.log("trash clicked", id);
                    }
                }} 
                className="flex-shrink-0 text-brand-grey hover:text-brand-blue transition-all duration-300 hover:-translate-y-0.5">
                {isActive ? (
                    <EditIcon className="w-10 h-10" />
                ) : (
                    <TrashIcon className="w-10 h-10" />
                )}
            </button>
        </div>
        <textarea 
                placeholder="Your criteria description goes here..."
                value={descriptionFromProps}
                onChange={(e) => {
                    if (!isActive) return;
                    onDescriptionChange(id, e.target.value);
                }}
                onFocus={() => {
                    if (isActive) onEdit(id);
                }}
                disabled={!isActive}
                className="bg-white rounded-lg border-gray-200 border p-2 w-full h-32 md:h-16 text-brand-grey placeholder:text-gray-400 text-sm resize-none outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors">
        </textarea>
    </div>
    );
}

export default CriteriaCard;
