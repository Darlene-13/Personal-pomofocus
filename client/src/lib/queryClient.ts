import { QueryClient, QueryFunction } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    const res = await fetch(url, {
        method,
        headers: {
            ...(data ? { "Content-Type": "application/json" } : {}),
            ...extraHeaders,
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include", // still include cookies if needed
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
            const url = `${BASE_URL}${queryKey.join("/")}`;
            const res = await fetch(url, { credentials: "include" });

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
