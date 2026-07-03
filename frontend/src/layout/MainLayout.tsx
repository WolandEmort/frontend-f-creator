import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
            <Header />
            <main className="flex-grow flex flex-col">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};