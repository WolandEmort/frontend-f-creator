export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem("access_token");
    const baseUrl = import.meta.env.VITE_API_URL;
    const defaultHeaders: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${baseUrl}${endpoint}`, config);

    if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/auth";
    }

    return response;
};