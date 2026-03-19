const API_BASE = '/api';

export async function api(endpoint, options = {}) {
    const token = localStorage.getItem('govchat_token');
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        ...options,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, config);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
    }

    return res.json();
}

export function login(email, password) {
    return api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

// --- User Management (admin) ---
export function getUsers() {
    return api('/auth/users');
}
export function createUser(data) {
    return api('/auth/users', { method: 'POST', body: JSON.stringify(data) });
}
export function updateUser(id, data) {
    return api(`/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteUser(id) {
    return api(`/auth/users/${id}`, { method: 'DELETE' });
}

export function getNews(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api(`/news${qs ? '?' + qs : ''}`);
}

export function getNewsById(id) {
    return api(`/news/${id}`);
}

export function getOfficials(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api(`/officials${qs ? '?' + qs : ''}`);
}

export function createOfficial(data) {
    return api('/officials', { method: 'POST', body: JSON.stringify(data) });
}
export function updateOfficial(id, data) {
    return api(`/officials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteOfficial(id) {
    return api(`/officials/${id}`, { method: 'DELETE' });
}

export function getProjects(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api(`/projects${qs ? '?' + qs : ''}`);
}

export function sendChatMessage(message) {
    return api('/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({ message }),
    });
}

export function getChatSuggestions() {
    return api('/chatbot/suggestions');
}

export function getAnalytics() {
    return api('/analytics/dashboard');
}

export function trackEvent(event_type, page, metadata) {
    return api('/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ event_type, page, metadata }),
    }).catch(() => { }); // fire and forget
}

export function getPublications(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api(`/publications${qs ? '?' + qs : ''}`);
}

// --- CRUD: News ---
export function createNews(data) {
    return api('/news', { method: 'POST', body: JSON.stringify(data) });
}
export function updateNews(id, data) {
    return api(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteNews(id) {
    return api(`/news/${id}`, { method: 'DELETE' });
}

// --- CRUD: Projects ---
export function createProject(data) {
    return api('/projects', { method: 'POST', body: JSON.stringify(data) });
}
export function updateProject(id, data) {
    return api(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteProject(id) {
    return api(`/projects/${id}`, { method: 'DELETE' });
}

// --- CRUD: Publications ---
export function createPublication(data) {
    return api('/publications', { method: 'POST', body: JSON.stringify(data) });
}
export function updatePublication(id, data) {
    return api(`/publications/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deletePublication(id) {
    return api(`/publications/${id}`, { method: 'DELETE' });
}

// --- Documents ---
export function getDocuments(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api(`/documents${qs ? '?' + qs : ''}`);
}

export async function uploadDocument(formData) {
    const token = localStorage.getItem('govchat_token');
    const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData, // FormData — no Content-Type header (browser sets multipart boundary)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
    }
    return res.json();
}

export function updateDocument(id, data) {
    return api(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteDocument(id) {
    return api(`/documents/${id}`, { method: 'DELETE' });
}
