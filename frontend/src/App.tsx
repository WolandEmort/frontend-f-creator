import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BuilderPage } from "./pages/BuilderPage";
import { AuthPage } from "./pages/AuthPage";
import { PublicFormView } from './pages/PublicFormView';
import { ResponsesPage } from "./pages/ResponsesPage";

export const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/builder" element={<BuilderPage />} />
                    <Route path="/builder/:id" element={<BuilderPage />} />
                    <Route path="/form/:id/responses" element={<ResponsesPage />} />
                </Route>

                <Route path="/view/:id" element={<PublicFormView />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};