import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { apiFetch } from '../api/apiFetch';
import { useAuthStore } from '../store/authStore';

interface FormItem {
    id: string;
    title: string;
    created_at: string;
    _count: {
        questions: number;
    };
}

export const DashboardPage = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState<FormItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const user = useAuthStore((state) => state.user);
    const isAuth = useAuthStore((state) => state.isAuth);

    useEffect(() => {
        if (!isAuth) {
            navigate("/auth");
            return;
        }

        const fetchForms = async () => {
            try {
                const response = await apiFetch("/form");

                if (response.ok) {
                    const formsData = await response.json();
                    setForms(formsData);
                } else {
                    console.error("Помилка отримання форм");
                }
            } catch (error) {
                console.error("Помилка мережі:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchForms();
    }, [navigate, isAuth]);

    const handleCopyLink = (formId: string) => {
        const link = `${window.location.origin}/view/${formId}`;

        navigator.clipboard.writeText(link).then(() => {
            setCopiedId(formId);
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(err => {
            console.error("Не вдалося скопіювати посилання: ", err);
        });
    };

    const handleDelete = async (formId: string) => {
        const isConfirmed = window.confirm("Ви впевнені, що хочете видалити цю форму? Всі відповіді також будуть видалені.");
        if (!isConfirmed) return;

        try {
            const response = await apiFetch(`/form/${formId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                // Оновлюємо стейт, видаляючи картку з UI
                setForms((prevForms) => prevForms.filter((form) => form.id !== formId));
            } else {
                console.error("Помилка при видаленні форми");
                alert("Не вдалося видалити форму.");
            }
        } catch (error) {
            console.error("Помилка мережі:", error);
            alert("Помилка з'єднання з сервером.");
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Завантаження...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <header className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Мої форми</h1>
                    <p className="text-gray-500 mt-1">
                        Вітаємо, {user?.name || user?.email}!
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => navigate("/builder")} className="bg-blue-600 hover:bg-blue-700">
                        + Створити форму
                    </Button>
                </div>
            </header>

            {forms.length === 0 ? (
                <Card className="p-60 text-center flex flex-col items-center border-dashed">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">У вас ще немає форм</h3>
                    <p className="text-gray-500 mb-6">Створіть свою першу форму, щоб почати збирати відповіді.</p>
                    <Button onClick={() => navigate("/builder")}>Створити першу форму</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <Card key={form.id} className="p-6 hover:shadow-md transition-shadow relative">

                            {/* Блок з іконками у правому верхньому кутку */}
                            <div className="absolute top-3 right-3 flex gap-1">
                                {/* Кнопка копіювання */}
                                <button
                                    onClick={() => handleCopyLink(form.id)}
                                    title="Копіювати посилання"
                                    className={`p-2 rounded-md transition-colors ${
                                        copiedId === form.id
                                            ? 'text-green-600 bg-green-50'
                                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    {copiedId === form.id ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    )}
                                </button>

                                {/* Кнопка видалення */}
                                <button
                                    onClick={() => handleDelete(form.id)}
                                    title="Видалити форму"
                                    className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </button>
                            </div>

                            {/* Заголовок із відступом, щоб не перекривати іконки */}
                            <h3 className="font-semibold text-lg mb-2 truncate pr-16" title={form.title}>
                                {form.title}
                            </h3>
                            <div className="text-sm text-gray-500 mb-4 flex flex-col gap-1">
                                <span>Створено: {new Date(form.created_at).toLocaleDateString()}</span>
                                <span>Питань: {form._count?.questions || 0}</span>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="w-full text-sm"
                                        onClick={() => navigate(`/builder/${form.id}`)}
                                    >
                                        Редагувати
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full text-sm"
                                        onClick={() => navigate(`/form/${form.id}/responses`)}
                                    >
                                        Відповіді
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};