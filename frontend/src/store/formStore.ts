import { create } from 'zustand';
import { type Form, type FormElement, type QuestionType } from '../types/form';
import { v4 as uuidv4 } from 'uuid';

interface FormStore {
    form: Form;
    updateFormMetadata: (title: string, description: string) => void;
    addElement: (type: QuestionType) => void;
    removeElement: (id: string) => void;
    updateElement: (id: string, updates: Partial<FormElement>) => void;
    reorderElements: (startIndex: number, endIndex: number) => void;

    addOption: (elementId: string) => void;
    updateOption: (elementId: string, optionId: string, text: string) => void;
    removeOption: (elementId: string, optionId: string) => void;

    loadForm: (form: Form) => void;
    resetForm: () => void;
}

export const useFormStore = create<FormStore>((set) => ({
    form: {
        title: 'Нова форма',
        description: '',
        elements: [],
    },

    updateFormMetadata: (title, description) =>
        set((state) => ({
            form: { ...state.form, title, description },
        })),

    addElement: (type) =>
        set((state) => {
            const newElement: FormElement = {
                id: uuidv4(),
                type,
                title: 'Нове питання',
                required: false,
                // Тепер опції — це об'єкти з унікальними ID
                options: type === 'radio' || type === 'checkbox'
                    ? [{ id: uuidv4(), text: 'Варіант 1' }]
                    : undefined,
            };

            return {
                form: {
                    ...state.form,
                    elements: [...state.form.elements, newElement],
                },
            };
        }),

    removeElement: (id) =>
        set((state) => ({
            form: {
                ...state.form,
                elements: state.form.elements.filter((el) => el.id !== id),
            },
        })),

    updateElement: (id, updates) =>
        set((state) => ({
            form: {
                ...state.form,
                elements: state.form.elements.map((el) =>
                    el.id === id ? { ...el, ...updates } : el
                ),
            },
        })),

    reorderElements: (startIndex, endIndex) =>
        set((state) => {
            const elements = [...state.form.elements];
            const [removed] = elements.splice(startIndex, 1);
            elements.splice(endIndex, 0, removed);

            return {
                form: { ...state.form, elements },
            };
        }),

    addOption: (elementId) =>
        set((state) => ({
            form: {
                ...state.form,
                elements: state.form.elements.map((el) => {
                    if (el.id !== elementId) return el;
                    const currentOptions = el.options || [];
                    return {
                        ...el,
                        options: [...currentOptions, { id: uuidv4(), text: `Варіант ${currentOptions.length + 1}` }],
                    };
                }),
            },
        })),

    updateOption: (elementId, optionId, text) =>
        set((state) => ({
            form: {
                ...state.form,
                elements: state.form.elements.map((el) => {
                    if (el.id !== elementId) return el;
                    return {
                        ...el,
                        options: el.options?.map((opt) =>
                            opt.id === optionId ? { ...opt, text } : opt
                        ),
                    };
                }),
            },
        })),

    removeOption: (elementId, optionId) =>
        set((state) => ({
            form: {
                ...state.form,
                elements: state.form.elements.map((el) => {
                    if (el.id !== elementId) return el;
                    return {
                        ...el,
                        options: el.options?.filter((opt) => opt.id !== optionId),
                    };
                }),
            },
        })),

    loadForm: (form) => set({ form }),

    resetForm: () => set({
        form: {
            title: 'Нова форма',
            description: '',
            elements: [],
        }
    }),
}));
