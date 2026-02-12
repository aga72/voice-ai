import { useEffect } from "react";
import type { Criterion } from "./types/criterion";
import CloseIcon from './icons/CloseIcon';

type EditCriterionModalProps = {
  isOpen: boolean;
  criterion: Criterion | null;
  onClose: () => void;
  onChange: (id: string, updates: { title?: string; description?: string }) => void;
};

function EditCriterionModal(props: EditCriterionModalProps) {
    const { isOpen, criterion, onClose } = props;

    if (!isOpen || !criterion) {
    return null;
    }

    useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
        onClose();
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
        window.removeEventListener("keydown", handleKeyDown);
    };
    }, [onClose]);


    return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-700" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md modal-animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 mb-3">
                <input
                    className="bg-white rounded-lg border-gray-300 border p-2 w-full h-10 resize-none outline-none font-heading text-md text-brand-grey focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors overflow-hidden"
                    value={criterion.title}
                    onChange={(e) =>
                        props.onChange(criterion.id, { title: e.target.value })
                    }
                />
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-shrink-0 text-brand-grey hover:text-brand-blue transition-all duration-300 hover:-translate-y-0.5"
                >
                    <CloseIcon className="w-10 h-10" />
                </button>
            </div>
            <textarea
                className="w-full h-32 border border-gray-300 rounded px-2 p-2 text-sm text-brand-grey placeholder:text-gray-400 resize-none outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                placeholder="Your criteria description goes here..."
                value={criterion.description}
                onChange={(e) =>
                    props.onChange(criterion.id, { description: e.target.value })
                }
            />
        </div>
    </div>
    );
}

export default EditCriterionModal;