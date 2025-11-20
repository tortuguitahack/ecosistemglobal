
import { SystemStatus } from "../types";

interface n8nWorkflow {
    id: string;
    name: string;
    active: boolean;
    nodes: any[];
    connections: any;
    createdAt: string;
    updatedAt: string;
    settings: any;
    staticData: any;
}

const apiFetch = async (endpoint: string, apiUrl: string, apiKey: string, options: RequestInit = {}) => {
    const headers = {
        'Accept': 'application/json',
        'X-N8N-API-KEY': apiKey,
    };

    try {
        // Remove trailing slash from apiUrl if present to prevent double slashes
        const cleanApiUrl = apiUrl.replace(/\/$/, '');

        const response = await fetch(`${cleanApiUrl}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error de red o respuesta no-JSON.' }));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        return response.json();
    } catch (error: any) {
        // Handle specific network errors (like CORS or offline) without spamming console.error
        // "Failed to fetch" is the standard error message for network/CORS issues in fetch
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
             console.warn(`n8n connection warning: Unable to reach ${endpoint}. Falling back to Demo Mode.`);
             // Throw a specific error code we can catch in the context to suppress UI errors
             throw new Error("CONNECTION_FAILED");
        }
        
        // Only log actual application errors, not expected network failures during dev/setup
        console.error(`Error fetching from n8n API endpoint ${endpoint}:`, error);
        throw error;
    }
};

export const fetchWorkflows = (apiUrl: string, apiKey: string): Promise<n8nWorkflow[]> => {
    return apiFetch('/workflows', apiUrl, apiKey);
};

export const fetchWorkflow = (id: string, apiUrl: string, apiKey: string): Promise<n8nWorkflow> => {
    return apiFetch(`/workflows/${id}`, apiUrl, apiKey);
};

export const toggleWorkflowStatus = async (id: string, currentStatus: SystemStatus, apiUrl: string, apiKey: string): Promise<{ success: boolean }> => {
    const endpoint = currentStatus === SystemStatus.Active ? `/workflows/${id}/deactivate` : `/workflows/${id}/activate`;
    await apiFetch(endpoint, apiUrl, apiKey, { method: 'POST' });
    return { success: true };
};
