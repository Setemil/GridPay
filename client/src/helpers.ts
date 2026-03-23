import { useAuthStore } from "./store";

export async function apiFetch(url: string, options: RequestInit = {}) {
    const token = useAuthStore.getState().authToken;

    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        }
    })
}

export function capitalize(data: string): string {
    if (!data) return data;
    const words = data.match(/\S+/g);
    if (!words) return data;
    return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}