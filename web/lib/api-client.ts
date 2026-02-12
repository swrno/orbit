/**
 * @file api-client.ts
 * @description Centralized API client for all Orbit AI Workspace network requests.
 */

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

async function apiFetch<T = any>(
    url: string,
    options: RequestInit = {},
    userId?: string,
    userEmail?: string | null
): Promise<ApiResponse<T>> {
    const headers: any = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options.headers,
    };

    if (userId) headers['X-User-Id'] = userId;
    if (userEmail) headers['X-User-Email'] = userEmail;

    try {
        const response = await fetch(url, { ...options, headers });
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                error: data.error || response.statusText,
                message: data.message
            };
        }
        
        return data;
    } catch (error: any) {
        console.error(`API Fetch Error (${url}):`, error);
        return {
            success: false,
            error: error.message || 'Network error'
        };
    }
}

export const apiClient = {
    // Workspaces
    fetchWorkspaces: (userId?: string, userEmail?: string | null) => 
        apiFetch(`/api/workspaces?userId=${userId ? encodeURIComponent(userId) : ''}`, {}, userId, userEmail),
    
    createWorkspace: (body: any, userId?: string, userEmail?: string | null) =>
        apiFetch('/api/workspaces', { method: 'POST', body: JSON.stringify(body) }, userId, userEmail),
    
    deleteWorkspace: (id: string, userId: string) =>
        apiFetch(`/api/workspaces?id=${id}&userId=${userId}`, { method: 'DELETE' }, userId),

    // Teams
    addTeam: (body: any, userId?: string) =>
        apiFetch('/api/teams', { method: 'POST', body: JSON.stringify(body) }, userId),
    
    renameTeam: (workspaceId: string, teamId: string, title: string, userId?: string) =>
        apiFetch('/api/teams', { 
            method: 'PUT', 
            body: JSON.stringify({ workspaceId, teamId, updates: { title } }) 
        }, userId),

    deleteTeam: (workspaceId: string, teamId: string, userId: string) =>
        apiFetch(`/api/teams?workspaceId=${workspaceId}&teamId=${teamId}&currentUserId=${userId}`, { method: 'DELETE' }, userId),

    // Pages
    addPage: (workspaceId: string, teamId: string, title: string, type: string, userId?: string) =>
        apiFetch('/api/pages', { 
            method: 'POST', 
            body: JSON.stringify({ workspaceId, teamId, title, type }) 
        }, userId),

    updatePage: (workspaceId: string, teamId: string, pageId: string, updates: any, userId?: string, userEmail?: string | null) =>
        apiFetch('/api/pages', { 
            method: 'PUT', 
            body: JSON.stringify({ workspaceId, teamId, pageId, updates }) 
        }, userId, userEmail),

    deletePage: (workspaceId: string, teamId: string, pageId: string, userId?: string) =>
        apiFetch(`/api/pages?workspaceId=${workspaceId}&teamId=${teamId}&pageId=${pageId}`, { method: 'DELETE' }, userId),

    // Generic Resource Methods (still available if needed)
    fetchResources: (resource: string, params: Record<string, string>, userId?: string) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/api/${resource}?${query}`, {}, userId);
    },

    createResource: (resource: string, body: any, userId?: string) =>
        apiFetch(`/api/${resource}`, { method: 'POST', body: JSON.stringify(body) }, userId),

    updateResource: (resource: string, body: any, userId?: string) =>
        apiFetch(`/api/${resource}`, { method: 'PUT', body: JSON.stringify(body) }, userId),

    deleteResource: (resource: string, id: string, userId?: string) =>
        apiFetch(`/api/${resource}?id=${id}${userId ? `&currentUserId=${userId}` : ''}`, { method: 'DELETE' }, userId),

    // Resource-specific methods for clarity and type-safety
    fetchTasks: (params: Record<string, string>, userId?: string) => apiClient.fetchResources('tasks', params, userId),
    createTask: (body: any, userId?: string) => apiClient.createResource('tasks', body, userId),
    updateTask: (body: any, userId?: string) => apiClient.updateResource('tasks', body, userId),
    deleteTask: (id: string, userId?: string) => apiClient.deleteResource('tasks', id, userId),

    fetchBugs: (params: Record<string, string>, userId?: string) => apiClient.fetchResources('bugs', params, userId),
    createBug: (body: any, userId?: string) => apiClient.createResource('bugs', body, userId),
    updateBug: (body: any, userId?: string) => apiClient.updateResource('bugs', body, userId),
    deleteBug: (id: string, userId?: string) => apiClient.deleteResource('bugs', id, userId),

    fetchEpics: (params: Record<string, string>, userId?: string) => apiClient.fetchResources('epics', params, userId),
    createEpic: (body: any, userId?: string) => apiClient.createResource('epics', body, userId),
    updateEpic: (body: any, userId?: string) => apiClient.updateResource('epics', body, userId),
    deleteEpic: (id: string, userId?: string) => apiClient.deleteResource('epics', id, userId),

    fetchSprints: (params: Record<string, string>, userId?: string) => apiClient.fetchResources('sprints', params, userId),
    createSprint: (body: any, userId?: string) => apiClient.createResource('sprints', body, userId),
    updateSprint: (body: any, userId?: string) => apiClient.updateResource('sprints', body, userId),
    deleteSprint: (id: string, userId?: string) => apiClient.deleteResource('sprints', id, userId),

    fetchRetrospectives: (params: Record<string, string>, userId?: string) => apiClient.fetchResources('retrospectives', params, userId),
    createRetrospective: (body: any, userId?: string) => apiClient.createResource('retrospectives', body, userId),
    updateRetrospective: (body: any, userId?: string) => apiClient.updateResource('retrospectives', body, userId),
    deleteRetrospective: (id: string, userId?: string) => apiClient.deleteResource('retrospectives', id, userId),
};
