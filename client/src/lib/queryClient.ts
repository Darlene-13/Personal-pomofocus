import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthToken } from "./auth"; // ADD THIS IMPORT

const BASE_URL = import.meta.env.VITE_API_URL;

async function throwIfResNotOk(res: Response) {
    if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
    }
}

/**
 * General API request helper
 */
export async function apiRequest(
    method: string,
    url: string,
    data?: unknown,
    extraHeaders?: Record<string, string>
): Promise<any> {
    const token = getAuthToken(); // GET THE TOKEN

    const headers: Record<string, string> = {
        ...(data ? { "Content-Type": "application/json" } : {}),
        ...extraHeaders,
    };

    // ADD AUTH HEADER IF TOKEN EXISTS
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${url}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
    }

    return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Query function for react-query
 */
export const getQueryFn: <T>(options: {
    on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
    ({ on401: unauthorizedBehavior }) =>
        async ({ queryKey }) => {
            const token = getAuthToken(); // GET THE TOKEN
            const url = `${BASE_URL}${queryKey.join("/")}`;

            const headers: Record<string, string> = {};

            // ADD AUTH HEADER IF TOKEN EXISTS
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(url, {
                credentials: "include",
                headers,
            });

            if (unauthorizedBehavior === "returnNull" && res.status === 401) {
                return null;
            }

            await throwIfResNotOk(res);
            return res.json();
        };

/**
 * React Query client
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: getQueryFn({ on401: "throw" }),
            refetchInterval: false,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
            retry: false,
        },
        mutations: {
            retry: false,
        },
    },
});