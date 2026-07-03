import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Collaborator {
    id: string;
    user: {
        id: string;
        email: string;
        name: string | null;
    };
}

interface CollaboratorsModalProps {
    formId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const CollaboratorsModal = ({ formId, isOpen, onClose }: CollaboratorsModalProps) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchCollaborators();
        } else {
            // Очищення стану при закритті
            setEmail('');
            setError(null);
            setSuccessMessage(null);
        }
    }, [isOpen, formId]);

    const fetchCollaborators = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/form/${formId}/collaborators`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setCollaborators(data);
            } else if (response.status === 403) {
                setError('Тільки власник форми може керувати співавторами.');
            } else {
                setError('Помилка завантаження списку.');
            }
        } catch (err) {
            console.error('Помилка при отриманні співавторів:', err);
            setError('Помилка мережі.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/form/${formId}/collaborators`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok) {
                setSuccessMessage('Співавтора додано!');
                setEmail('');
                fetchCollaborators(); // Оновлюємо список
            } else {
                setError(result.message || 'Помилка при додаванні.');
            }
        } catch (err) {
            console.error('Помилка при додаванні співавтора:', err);
            setError('Помилка мережі.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (userId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/form/${formId}/collaborators/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchCollaborators();
            } else {
                const result = await response.json();
                setError(result.message || 'Помилка при видаленні.');
            }
        } catch (err) {
            console.error('Помилка при видаленні співавтора:', err);
            setError('Помилка мережі.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Співавтори</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email користувача"
                        required
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading}>
                        Додати
                    </Button>
                </form>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {successMessage && <p className="text-green-600 text-sm mb-4">{successMessage}</p>}

                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Список доступу:</h3>

                    {collaborators.length === 0 && !isLoading && !error && (
                        <p className="text-sm text-gray-500">Співавторів поки немає.</p>
                    )}

                    {collaborators.map((collab) => (
                        <div key={collab.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{collab.user.email}</span>
                                {collab.user.name && <span className="text-xs text-gray-500">{collab.user.name}</span>}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(collab.user.id)}
                                disabled={isLoading}
                                className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                                Видалити
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};