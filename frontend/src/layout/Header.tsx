import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuthStore } from "../store/authStore";

export const Header = () => {
    const isAuth = useAuthStore((state) => state.isAuth);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    return (
        <header className="w-full border-b border-gray-200 bg-white">
            <div className="w-full px-7 h-16 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
                    FormDealer.
                </Link>
                <nav>
                    {isAuth ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">
                                Вітаємо, {user?.name || 'Користувач'}
                            </span>
                            <Button variant="outline" onClick={logout}>
                                Вийти
                            </Button>
                        </div>
                    ) : (
                        <Link to="/login">
                            <Button variant="outline">Увійти</Button>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};