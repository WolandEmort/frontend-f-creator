import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthState {
    isAuth: boolean;
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
    // Зчитуємо дані при першому завантаженні додатку
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    let parsedUser = null;

    try {
        parsedUser = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error('Помилка парсингу користувача з localStorage');
    }

    return {
        isAuth: !!token,
        user: parsedUser,
        login: (token, user) => {
            // Синхронно пишемо в localStorage і оновлюємо стан React
            localStorage.setItem('access_token', token);
            localStorage.setItem('user', JSON.stringify(user));
            set({ isAuth: true, user });
        },
        logout: () => {
            // Очищаємо дані при виході
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            set({ isAuth: false, user: null });
        },
    };
});