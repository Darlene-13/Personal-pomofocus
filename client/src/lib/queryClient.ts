import { QueryClient, QueryFunction } from "@tanstack/react-query";

// --- REMOVE THIS LINE ---
// const BASE_URL = import.meta.env.VITE_API_URL;

async function throwIfResNotOk(res: Response) {
    if (!res.ok) {
        // Attempt to parse error, provide fallback
        let errorData = { message: `HTTP error! status: ${res.status}` };
        try {
            const text = await res.text();
            errorData.message = `${res.status}: ${text || res.statusText}`;
        } catch (e) {
            // Ignore error if text parsing fails
        }
        throw new Error(errorData.message);
    }
}

/**
 * General API request helper (Not typically used directly by React Query's default queryFn)
 * If you DO use this for mutations, it needs to use relative paths.
 */
export async function apiRequest(
    method: string,
    url: string, // 'url' should be like '/api/some-path'
    data?: unknown,
    extraHeaders?: Record<string, string>
): Promise<any> {

    // --- USE RELATIVE PATH ---
    const res = await fetch(url, { // Use 'url' directly
        method,
        headers: {
            ...(data ? { "Content-Type": "application/json" } : {}),
            ...extraHeaders,
            // Include Authorization header if needed, similar to authRequest
            // Example: ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {})
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include", // Include cookies/auth headers if needed
    });

    // Use the error helper
    await throwIfResNotOk(res);

    // Handle empty responses
    if (res.status === 204) {
        return null;
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }

    return null; // Or handle other content types if necessary
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
            // --- USE RELATIVE PATH FROM queryKey ---
            // Ensure queryKey includes the full path, e.g., ["/api/tasks"]
            const url = queryKey.join("/");
            const res = await fetch(url, {
                credentials: "include",
                // Include Authorization header if needed for GET requests
                // headers: { ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}) }
            });

            if (unauthorizedBehavior === "returnNull" && res.status === 401) {
                return null;
            }

            await throwIfResNotOk(res);

            // Handle empty responses
            if (res.status === 204) {
                return null;
            }
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return res.json();
            }

            return null; // Or handle other content types
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
            // If using apiRequest for mutations, ensure it sends auth tokens
            retry: false,
        },
    },
});

// You might need to import getAuthToken here if using Authorization headers
// import { getAuthToken } from './auth';