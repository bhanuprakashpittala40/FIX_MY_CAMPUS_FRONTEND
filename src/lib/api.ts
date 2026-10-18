const API_BASE = '/api';

export function getToken(): string | null {
  return localStorage.getItem('fmc_auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('fmc_auth_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('fmc_auth_token');
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Upload helpers
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await apiRequest<{ url: string }>('/upload/single', {
    method: 'POST',
    body: formData,
  });

  return res.url;
}

export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append('images', f));

  const res = await apiRequest<{ urls: string[] }>('/upload/multiple', {
    method: 'POST',
    body: formData,
  });

  return res.urls;
}

// API methods organized by module
export const api = {
  auth: {
    login: (credentials: any) =>
      apiRequest<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) =>
      apiRequest<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    demoLogin: (role: string) =>
      apiRequest<{ token: string; user: any }>('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
    me: () => apiRequest<{ user: any; unreadNotifications: number }>('/auth/me'),
  },

  complaints: {
    list: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      return apiRequest<{ data: any[]; pagination: any }>(`/complaints?${searchParams.toString()}`);
    },
    get: (id: string) => apiRequest<any>(`/complaints/${id}`),
    getMetaOptions: () => apiRequest<{ categories: any[]; buildings: any[]; technicians: any[] }>('/complaints/meta/options'),
    create: (data: any) => apiRequest<{ message: string; complaint: any }>('/complaints', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, payload: any) =>
      apiRequest<{ message: string; complaint: any }>(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
    assign: (id: string, payload: { assignedToId: string; notes?: string }) =>
      apiRequest<{ message: string; complaint: any }>(`/complaints/${id}/assign`, { method: 'PATCH', body: JSON.stringify(payload) }),
    updatePriority: (id: string, payload: { priority: string; reason: string }) =>
      apiRequest<{ message: string; complaint: any }>(`/complaints/${id}/priority`, { method: 'PATCH', body: JSON.stringify(payload) }),
    addComment: (id: string, comment: string) =>
      apiRequest<{ message: string; comment: any }>(`/complaints/${id}/comments`, { method: 'POST', body: JSON.stringify({ comment }) }),
  },

  admin: {
    getMetrics: () => apiRequest<any>('/admin/metrics'),
    getAnalytics: () => apiRequest<any>('/admin/analytics'),
    getAuditLogs: (page = 1, limit = 20) => apiRequest<any>(`/admin/audit-logs?page=${page}&limit=${limit}`),
    getUsers: () => apiRequest<{ users: any[] }>('/admin/users'),
    updateUser: (id: string, payload: any) => apiRequest<any>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    getBuildings: () => apiRequest<{ buildings: any[] }>('/admin/buildings'),
    createBuilding: (payload: any) => apiRequest<any>('/admin/buildings', { method: 'POST', body: JSON.stringify(payload) }),
    updateBuilding: (id: string, payload: any) => apiRequest<any>(`/admin/buildings/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    getCategories: () => apiRequest<{ categories: any[] }>('/admin/categories'),
    createCategory: (payload: any) => apiRequest<any>('/admin/categories', { method: 'POST', body: JSON.stringify(payload) }),
    updateCategory: (id: string, payload: any) => apiRequest<any>(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    getPriorityRules: () => apiRequest<{ rules: any; updatedAt: string }>('/admin/priority-rules'),
    updatePriorityRules: (rules: any) => apiRequest<any>('/admin/priority-rules', { method: 'PUT', body: JSON.stringify({ rules }) }),
  },

  maintenance: {
    getDashboard: () => apiRequest<{ metrics: any; urgentTasks: any[] }>('/maintenance/dashboard'),
    accept: (id: string) => apiRequest<any>(`/maintenance/${id}/accept`, { method: 'POST' }),
    reject: (id: string, reason: string) => apiRequest<any>(`/maintenance/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
    resolve: (id: string, payload: { resolutionNotes: string; resolutionImages?: string[] }) =>
      apiRequest<any>(`/maintenance/${id}/resolve`, { method: 'POST', body: JSON.stringify(payload) }),
    getHistory: () => apiRequest<{ history: any[] }>('/maintenance/history'),
  },

  notifications: {
    list: () => apiRequest<{ notifications: any[]; unreadCount: number }>('/notifications'),
    markRead: (id: string) => apiRequest<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => apiRequest<any>('/notifications/mark-all-read', { method: 'POST' }),
  },
};
