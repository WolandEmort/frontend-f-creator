import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface ApiOption {
    id: string;
    text: string;
}

interface ValidationRules {
    minLength?: number;
    maxLength?: number;
    minSelections?: number;
    maxSelections?: number;
}

interface ApiQuestion {
    id: string;
    type: string;
    title: string;
    description?: string | null;
    isRequired: boolean;
    options?: ApiOption[];
    validationRules?: ValidationRules | null;
}

interface ApiForm {
    id: string;
    title: string;
    description: string | null;
    questions: ApiQuestion[];
}

interface FormPage {
    header: ApiQuestion | null;
    questions: ApiQuestion[];
}

export const PublicFormView = () => {
    const { id } = useParams<{ id: string }>();
    const [form, setForm] = useState<ApiForm | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [respondentName, setRespondentName] = useState('');
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Стан поточної сторінки пагінації
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    useEffect(() => {
        const fetchPublicForm = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/form/public/${id}`);

                if (response.ok) {
                    const data = await response.json();
                    setForm(data);
                } else {
                    setError('Форму не знайдено або доступ закрито.');
                }
            } catch (err) {
                console.error(err);
                setError('Помилка мережі.');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchPublicForm();
        }
    }, [id]);

    // Розбиваємо лінійний масив питань на сторінки
    const pages = useMemo<FormPage[]>(() => {
        if (!form) return [];

        const result: FormPage[] = [];
        let currentPage: FormPage = { header: null, questions: [] };

        form.questions.forEach((q) => {
            // Тип PAGE_BREAK приходить з бекенду у верхньому регістрі
            if (q.type === 'PAGE_BREAK') {
                if (currentPage.questions.length > 0 || currentPage.header) {
                    result.push(currentPage);
                }
                currentPage = { header: q, questions: [] };
            } else {
                currentPage.questions.push(q);
            }
        });

        if (currentPage.questions.length > 0 || currentPage.header || result.length === 0) {
            result.push(currentPage);
        }

        return result;
    }, [form]);

    const handleTextChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        if (errors[questionId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[questionId];
                return newErrors;
            });
        }
    };

    const handleCheckboxChange = (questionId: string, optionId: string, checked: boolean) => {
        setAnswers(prev => {
            const current = (prev[questionId] as string[]) || [];
            if (checked) {
                return { ...prev, [questionId]: [...current, optionId] };
            } else {
                return { ...prev, [questionId]: current.filter(val => val !== optionId) };
            }
        });
        if (errors[questionId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[questionId];
                return newErrors;
            });
        }
    };

    // Валідація лише для переданого масиву питань (поточної сторінки)
    const validatePage = (questionsToValidate: ApiQuestion[]): boolean => {
        const newErrors: Record<string, string> = {};

        questionsToValidate.forEach((q) => {
            const value = answers[q.id];
            const rules = q.validationRules;

            if (q.isRequired) {
                if (!value || (Array.isArray(value) && value.length === 0)) {
                    newErrors[q.id] = 'Це поле є обов\'язковим';
                    return;
                }
            }

            if (!value || (Array.isArray(value) && value.length === 0)) {
                return;
            }

            if (q.type === 'TEXT' || q.type === 'TEXTAREA') {
                const textValue = value as string;
                if (rules?.minLength && textValue.length < rules.minLength) {
                    newErrors[q.id] = `Мінімальна довжина: ${rules.minLength} симв.`;
                }
                if (rules?.maxLength && textValue.length > rules.maxLength) {
                    newErrors[q.id] = `Максимальна довжина: ${rules.maxLength} симв.`;
                }
            }

            if (q.type === 'CHECKBOX') {
                const arrayValue = value as string[];
                if (rules?.minSelections && arrayValue.length < rules.minSelections) {
                    newErrors[q.id] = `Оберіть мінімум ${rules.minSelections} варіантів`;
                }
                if (rules?.maxSelections && arrayValue.length > rules.maxSelections) {
                    newErrors[q.id] = `Оберіть максимум ${rules.maxSelections} варіантів`;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextPage = () => {
        if (currentPageIndex === 0 && !respondentName.trim()) {
            alert('Будь ласка, введіть своє ім\'я.');
            return;
        }

        const currentQuestions = pages[currentPageIndex].questions;
        if (validatePage(currentQuestions)) {
            setCurrentPageIndex(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevPage = () => {
        setCurrentPageIndex(prev => prev - 1);
        setErrors({});
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (currentPageIndex === 0 && !respondentName.trim()) {
            alert('Будь ласка, введіть своє ім\'я.');
            return;
        }

        const currentQuestions = pages[currentPageIndex].questions;
        if (!validatePage(currentQuestions)) {
            return;
        }

        setIsSubmitting(true);

        const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value: Array.isArray(value) ? JSON.stringify(value) : value,
        }));

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/form/public/${id}/responses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    respondentName,
                    answers: formattedAnswers,
                }),
            });

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                const errorData = await response.json();
                console.error(errorData);
                alert('Помилка при відправці форми.');
            }
        } catch (err) {
            console.error(err);
            alert('Помилка мережі.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Завантаження форми...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!form || pages.length === 0) return null;

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-xl w-full p-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Дякуємо!</h1>
                    <p className="text-gray-600">Ваші відповіді успішно збережено.</p>
                </Card>
            </div>
        );
    }

    const currentPageData = pages[currentPageIndex];
    const isLastPage = currentPageIndex === pages.length - 1;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">

                {/* Головний заголовок форми виводиться лише на першій сторінці */}
                {currentPageIndex === 0 && (
                    <Card className="p-8 border-t-8 border-t-blue-600">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
                        {form.description && <p className="text-gray-600">{form.description}</p>}
                    </Card>
                )}

                {/* Заголовок поточної секції (PAGE_BREAK), якщо є */}
                {currentPageIndex > 0 && currentPageData.header && (
                    <Card className="p-8 border-t-8 border-t-blue-400">
                        {currentPageData.header.title && (
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentPageData.header.title}</h2>
                        )}
                        {currentPageData.header.description && (
                            <p className="text-gray-600">{currentPageData.header.description}</p>
                        )}
                    </Card>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Ім'я запитуємо лише на першій сторінці */}
                    {currentPageIndex === 0 && (
                        <Card className="p-6">
                            <label className="block text-lg font-medium text-gray-900 mb-4">
                                Ваше ім'я <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={respondentName}
                                onChange={(e) => setRespondentName(e.target.value)}
                                placeholder="Введіть ваше ім'я"
                                required
                            />
                        </Card>
                    )}

                    {/* Рендер питань поточної сторінки */}
                    {currentPageData.questions.map((question) => (
                        <Card key={question.id} className={`p-6 transition-colors ${errors[question.id] ? 'border border-red-300 bg-red-50' : ''}`}>
                            <div className="mb-4">
                                <label className="block text-lg font-medium text-gray-900">
                                    {question.title} {question.isRequired && <span className="text-red-500">*</span>}
                                </label>
                                {question.description && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {question.description}
                                    </p>
                                )}
                            </div>

                            {question.type === 'TEXT' && (
                                <Input
                                    value={(answers[question.id] as string) || ''}
                                    onChange={(e) => handleTextChange(question.id, e.target.value)}
                                    placeholder="Ваша відповідь"
                                />
                            )}

                            {question.type === 'TEXTAREA' && (
                                <textarea
                                    value={(answers[question.id] as string) || ''}
                                    onChange={(e) => handleTextChange(question.id, e.target.value)}
                                    placeholder="Ваша розгорнута відповідь"
                                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md outline-none focus:border-blue-500 transition-colors resize-y"
                                />
                            )}

                            {question.type === 'RADIO' && question.options && (
                                <div className="flex flex-col gap-3">
                                    {question.options.map((option) => (
                                        <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`question_${question.id}`}
                                                value={option.id}
                                                checked={answers[question.id] === option.id}
                                                onChange={() => handleTextChange(question.id, option.id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700">{option.text}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {question.type === 'CHECKBOX' && question.options && (
                                <div className="flex flex-col gap-3">
                                    {question.options.map((option) => (
                                        <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={option.id}
                                                checked={((answers[question.id] as string[]) || []).includes(option.id)}
                                                onChange={(e) => handleCheckboxChange(question.id, option.id, e.target.checked)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700">{option.text}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {errors[question.id] && (
                                <p className="text-sm text-red-600 mt-3 font-medium flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    {errors[question.id]}
                                </p>
                            )}
                        </Card>
                    ))}

                    <div className="flex justify-between items-center mt-4">
                        <div>
                            {currentPageIndex > 0 && (
                                <Button type="button" variant="outline" onClick={handlePrevPage}>
                                    Назад
                                </Button>
                            )}
                        </div>
                        <div>
                            {!isLastPage ? (
                                <Button type="button" onClick={handleNextPage} className="px-8 py-2 text-lg">
                                    Далі
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting} className="px-8 py-2 text-lg bg-green-600 hover:bg-green-700">
                                    {isSubmitting ? 'Відправка...' : 'Надіслати'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Індикатор прогресу */}
                    {pages.length > 1 && (
                        <div className="text-center text-sm text-gray-500 mt-2">
                            Сторінка {currentPageIndex + 1} з {pages.length}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};