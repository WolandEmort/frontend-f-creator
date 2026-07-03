import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type FormElement } from '../types/form';
import { FormElementEditor } from './FormElementEditor';
import { useFormStore } from './formStore';

interface Props {
    element: FormElement;
}

export const SortableElement = ({ element }: Props) => {
    const removeElement = useFormStore((state) => state.removeElement);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: element.id
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="p-4 border rounded-md shadow-sm bg-white flex items-start gap-4 group relative"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded mt-1"
            >
                <svg viewBox="0 0 20 20" width="20" fill="currentColor">
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                </svg>
            </div>

            <div className="flex-1 pr-8">
                <FormElementEditor element={element} />
            </div>

            <button
                type="button"
                onClick={() => removeElement(element.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded hover:bg-red-50"
                title="Видалити питання"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    );
};