import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '../store/authStore';


const authSchema = z.object({
    mode: z.enum(["login", "register"]),
    name: z.string().optional(),
    email: z.string().email("Некоректний формат email"),
    password: z.string().min(6, "Пароль має бути не менше 6 символів"),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.mode === "register" && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Паролі не співпадають",
    path: ["confirmPassword"],
});

type AuthFormData = z.infer<typeof authSchema>;

export const AuthPage = () => {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [serverError, setServerError] = useState<string | null>(null); // Стейт для помилки з бекенду
    const navigate = useNavigate();

    // Хук має бути ТУТ, всередині компонента
    const login = useAuthStore((state) => state.login);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            mode: "login",
            email: "",
            password: "",
            confirmPassword: "",
            name: "",
        },
    });

    const toggleMode = () => {
        const newMode = mode === "login" ? "register" : "login";
        setMode(newMode);
        setServerError(null); // Очищаємо помилку при перемиканні режиму
        reset();
        setValue("mode", newMode);
    };

    const onSubmit = async (data: AuthFormData) => {
        setServerError(null); // Очищаємо перед новою спробою
        try {
            const endpoint = data.mode === "register" ? "/auth/register" : "/auth/login";

            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    name: data.name
                }),
            });

            const result = await response.json();

            if (response.ok) {
                if (data.mode === "login") {
                    login(result.access_token, result.user);
                    navigate("/dashboard");
                } else {
                    setMode("login");
                    setValue("mode", "login");
                    reset();
                    alert("Реєстрація успішна! Тепер увійдіть."); // Можна замінити на тост
                }
            } else {
                // Виводимо повідомлення від бекенду користувачу
                setServerError(result.message || "Сталася помилка при автентифікації");
            }
        } catch (error) {
            setServerError("Не вдалося підключитися до сервера");
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <Card className="overflow-hidden relative p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {mode === "login" ? "Вхід" : "Реєстрація"}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {mode === "login"
                                            ? "Увійдіть до свого облікового запису"
                                            : "Створіть новий обліковий запис"}
                                    </p>
                                </div>

                                {/* БЛОК ВИВОДУ ПОМИЛКИ З БЕКЕНДУ */}
                                {serverError && (
                                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center">
                                        {serverError}
                                    </div>
                                )}

                                <div className="flex flex-col gap-4">
                                    {mode === "register" && (
                                        <div className="flex flex-col gap-1">
                                            <Label htmlFor="name">Ім'я</Label>
                                            <Input id="name" {...register("name")} placeholder="Іван Іванов" />
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" {...register("email")} placeholder="mail@example.com" />
                                        {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label htmlFor="password">Пароль</Label>
                                        <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
                                        {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                                    </div>

                                    {mode === "register" && (
                                        <div className="flex flex-col gap-1">
                                            <Label htmlFor="confirmPassword">Підтвердження паролю</Label>
                                            <Input id="confirmPassword" type="password" {...register("confirmPassword")} placeholder="••••••••" />
                                            {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? "Завантаження..." : (mode === "login" ? "Увійти" : "Зареєструватися")}
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm text-gray-600">
                                {mode === "login" ? "Немає акаунту? " : "Вже є акаунт? "}
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    {mode === "login" ? "Зареєструватися" : "Увійти"}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
};