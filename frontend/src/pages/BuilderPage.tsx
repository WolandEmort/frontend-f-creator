import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFormStore } from '../store/formStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SortableElement } from '../store/SortableElement';
import { type ValidationRules } from '../types/form.ts';
import { CollaboratorsModal } from '../store/CollaboratorsModal'; // Імпорт модального вікна

interface ApiOption {
    id: string;
    text: string;
    order: number;
}

interface ApiQuestion {
    id: string;
    type: string;
    title: string;
    description?: string | null;
    isRequired: boolean;
    order: number;
    options?: ApiOption[];
    validationRules?: ValidationRules | null;
}

export const BuilderPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { form, addElement, reorderElements, loadForm, resetForm, updateFormMetadata } = useFormStore();

    const [isLoading, setIsLoading] = useState(!!id);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Стейт для керування модальним вікном
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/form/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();

                    const mappedElements = data.questions.map((q: ApiQuestion) => ({
                        id: q.id,
                        type: q.type.toLowerCase(),
                        title: q.title,
                        description: q.description || '',
                        required: q.isRequired,
                        order: q.order,
                        validationRules: q.validationRules || {},
                        options: q.options?.map((opt: ApiOption) => ({
                            id: opt.id,
                            text: opt.text,
                            order: opt.order
                        }))
                    }));

                    loadForm({
                        title: data.title,
                        description: data.description || '',
                        elements: mappedElements
                    });
                } else {
                    console.error('Не вдалося завантажити форму');
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Помилка мережі:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchForm();
        } else {
            resetForm();
        }

    }, [id, navigate, loadForm, resetForm]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = form.elements.findIndex((el) => el.id === active.id);
            const newIndex = form.elements.findIndex((el) => el.id === over.id);

            reorderElements(oldIndex, newIndex);
        }
    };

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        setSaveMessage(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const payload = {
                title: form.title,
                description: form.description || '',
                questions: form.elements.map((el, index) => ({
                    type: el.type.toUpperCase(),
                    title: el.title,
                    description: el.description || '',
                    isRequired: el.required || false,
                    order: index,
                    validationRules: el.validationRules || {},
                    options: el.options?.map((opt, optIndex) => ({
                        text: opt.text,
                        order: optIndex
                    })) || []
                }))
            };

            const url = id ? `${import.meta.env.VITE_API_URL}/form/${id}` : `${import.meta.env.VITE_API_URL}/form`;
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();

                if (!id && result.id) {
                    navigate(`/builder/${result.id}`, { replace: true });
                }

                setSaveMessage('Збережено!');
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                const errorData = await response.json();
                console.error('Помилка збереження:', errorData);
                setSaveMessage('Помилка збереження');
            }
        } catch (error) {
            console.error('Помилка мережі:', error);
            setSaveMessage('Помилка з\'єднання');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Завантаження форми...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 p-4 border-r bg-gray-50 flex flex-col gap-2">
                <h3 className="font-semibold text-gray-700 mb-2">Елементи</h3>

                <Button variant="outline" onClick={() => addElement('text')} className="justify-start">
                    Короткий текст
                </Button>
                <Button variant="outline" onClick={() => addElement('textarea')} className="justify-start">
                    Довгий текст (Абзац)
                </Button>
                <Button variant="outline" onClick={() => addElement('radio')} className="justify-start">
                    Один варіант (Radio)
                </Button>
                <Button variant="outline" onClick={() => addElement('checkbox')} className="justify-start">
                    Кілька варіантів (Checkbox)
                </Button>

                <div className="my-2 border-t border-gray-200"></div>
                <Button
                    variant="outline"
                    onClick={() => addElement('page_break')}
                    className="justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                    --- Розрив сторінки
                </Button>
            </aside>

            <main className="flex-1 p-8 flex flex-col items-center overflow-y-auto">
                <div className="w-full max-w-3xl flex justify-between items-start mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex-1 mr-4">
                        <Input
                            value={form.title}
                            onChange={(e) => updateFormMetadata(e.target.value, form.description || '')}
                            placeholder="Назва форми"
                            className="text-2xl font-bold border-transparent hover:border-gray-200 focus:border-blue-500 shadow-none bg-transparent px-0 mb-2"
                        />
                        <Input
                            value={form.description || ''}
                            onChange={(e) => updateFormMetadata(form.title, e.target.value)}
                            placeholder="Опис форми (необов'язково)"
                            className="text-gray-500 border-transparent hover:border-gray-200 focus:border-blue-500 shadow-none bg-transparent px-0"
                        />
                    </div>

                    <div className="flex items-center gap-4 mt-1">
                        {saveMessage && (
                            <span className={`text-sm font-medium ${saveMessage === 'Збережено!' ? 'text-green-600' : 'text-red-500'}`}>
                                {saveMessage}
                            </span>
                        )}
                        {/* Кнопка відображається тільки якщо форма вже збережена в БД */}
                        {id && (
                            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                                Співавтори
                            </Button>
                        )}
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Збереження...' : 'Зберегти форму'}
                        </Button>
                    </div>
                </div>

                <div className="w-full max-w-3xl pb-32">
                    {form.elements.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            Клікніть на панелі зліва, щоб додати елементи
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={form.elements.map(e => e.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="flex flex-col gap-4 w-full">
                                    {form.elements.map((el) => (
                                        <SortableElement key={el.id} element={el} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </main>

            {/* Рендер модального вікна */}
            {id && (
                <CollaboratorsModal
                    formId={id}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};