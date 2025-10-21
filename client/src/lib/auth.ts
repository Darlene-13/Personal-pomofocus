import { QueryClient } from "@tanstack/react-query";

// --- ADD THIS LINE ---
const BASE_URL = import.meta.env.VITE_API_URL;

// Create query client instance
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});

// Token management functions
export function setAuthToken(token: string): void {
    localStorage.setItem("jwt_token", token);
}

export function getAuthToken(): string | null {
    return localStorage.getItem("jwt_token");
}

export function removeAuthToken(): void {
    localStorage.removeItem("jwt_token");
}

export function isAuthenticated(): boolean {
    return !!getAuthToken();
}

// Auth request helper
export async function authRequest(
    method: string,
    path: string, // 'path' should be like '/api/tasks'
    body?: any
): Promise<any> {
    const token = getAuthToken();

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options: RequestInit = {
        method,
        headers,
    };

    if (body && (method === "POST" || method === "PATCH" || method === "PUT")) {
        options.body = JSON.stringify(body);
    }

    // --- UPDATE THIS LINE ---
    // Prepend the BASE_URL to the path
    const response = await fetch(`${BASE_URL}${path}`, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errorData.error || errorData.message || "Request failed");
    }

    // Handle empty responses (like DELETE)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }

    return null;
}

// Public request helper (no auth required)
export async function publicRequest(
    method: string,
    path: string, // 'path' should be like '/api/auth/login'
    body?: any
): Promise<any> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    const options: RequestInit = {
        method,
        headers,
    };

    if (body && (method === "POST" || method === "PATCH" || method === "PUT")) {
        options.body = JSON.stringify(body);
    }

    // --- UPDATE THIS LINE ---
    // Prepend the BASE_URL to the path
    const response = await fetch(`${BASE_URL}${path}`, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errorData.error || errorData.message || "Request failed");
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }

    return null;
}