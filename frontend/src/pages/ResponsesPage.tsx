import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { apiFetch } from "../api/apiFetch";

interface Option {
    id: string;
    text: string;
}

interface Question {
    id: string;
    title: string;
    type: string;
    options?: Option[];
}

interface FormStructure {
    id: string;
    title: string;
    questions: Question[];
}

interface Answer {
    id: string;
    questionId: string;
    value: string;
}

interface ResponseItem {
    id: string;
    respondentName: string;
    created_at: string;
    answers: Answer[];
}

export const ResponsesPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [form, setForm] = useState<FormStructure | null>(null);
    const [responses, setResponses] = useState<ResponseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Словник для швидкого пошуку тексту опції за її ID
    const [optionMap, setOptionMap] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [formRes, responsesRes] = await Promise.all([
                    apiFetch(`/form/${id}`),
                    apiFetch(`/form/${id}/responses`)
                ]);

                if (!formRes.ok || !responsesRes.ok) {
                    throw new Error("Помилка завантаження даних");
                }

                const formData: FormStructure = await formRes.json();
                const responsesData: ResponseItem[] = await responsesRes.json();

                // Створюємо мапу { optionId: optionText } для всіх питань типу RADIO/CHECKBOX
                const map: Record<string, string> = {};
                formData.questions.forEach(q => {
                    if (q.options) {
                        q.options.forEach(opt => {
                            map[opt.id] = opt.text;
                        });
                    }
                });

                setOptionMap(map);
                setForm(formData);
                setResponses(responsesData);
            } catch (err) {
                console.error(err);
                setError("Не вдалося завантажити відповіді. Перевірте консоль.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    // Допоміжна функція для форматування значення відповіді
    const getAnswerDisplayValue = (answerValue: string | undefined, questionType: string) => {
        if (!answerValue) return "—";

        if (questionType === "RADIO") {
            return optionMap[answerValue] || answerValue;
        }

        if (questionType === "CHECKBOX") {
            try {
                const parsedIds: string[] = JSON.parse(answerValue);
                return parsedIds.map(optId => optionMap[optId] || optId).join(", ");
            } catch {
                return answerValue;
            }
        }

        return answerValue;
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Завантаження відповідей...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!form) return null;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-2 text-sm">
                        ← Назад до дашборду
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Відповіді: {form.title}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Всього відповідей: {responses.length}
                    </p>
                </div>
            </header>

            <Card className="overflow-hidden">
                {responses.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        На цю форму ще немає відповідей.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-700">
                            <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-200">
                            <tr>
                                <th className="p-4 whitespace-nowrap">Дата</th>
                                <th className="p-4 whitespace-nowrap">Ім'я респондента</th>
                                {/* Динамічно рендеримо заголовки питань */}
                                {form.questions.map(q => (
                                    <th key={q.id} className="p-4 whitespace-nowrap min-w-[200px]">
                                        {q.title}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {responses.map(response => (
                                <tr key={response.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 whitespace-nowrap text-gray-500">
                                        {new Date(response.created_at).toLocaleString()}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">
                                        {response.respondentName}
                                    </td>
                                    {/* Мапимо відповіді у тому ж порядку, що і питання */}
                                    {form.questions.map(q => {
                                        const answer = response.answers.find(a => a.questionId === q.id);
                                        return (
                                            <td key={q.id} className="p-4">
                                                {getAnswerDisplayValue(answer?.value, q.type)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};