// API service for FireLynx backend communication
import axios from 'axios';

// Base configuration - Point to backend server
// Use relative path for Replit environment to leverage proxy
const BASE_URL = '/api';

console.log('🔧 API Base URL:', BASE_URL, 'NODE_ENV:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging in development
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(
    (config) => {
      console.log('🔄 API Request:', config.method?.toUpperCase(), config.url, 'Full URL:', config.baseURL + config.url);
      return config;
    },
    (error) => {
      console.error('❌ API Request Error:', error);
      return Promise.reject(error);
    }
  );
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    // Transform error for consistent handling
    const transformedError = {
      message: error.response?.data?.error || error.message || 'An error occurred',
      status: error.response?.status,
      code: error.code,
    };
    
    return Promise.reject(transformedError);
  }
);

// Export the base API instance for custom calls
export { api };

// API endpoints
// Fresh axios instance for debugging
const freshAxios = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const projectsAPI = {
  // Get all projects
  getAll: () => api.get('/projects'),
  
  // Get project by ID
  getById: (id) => api.get(`/projects/${id}`),
  
  // Create new project
  create: (projectData) => api.post('/projects', projectData),
  
  // Update project
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  
  // Delete project
  delete: (id) => api.delete(`/projects/${id}`),
};

export const milestonesAPI = {
  // Get all milestones (with optional project filter)
  getAll: (projectId = null) => {
    const url = projectId ? `/milestones?projectId=${projectId}` : '/milestones';
    return api.get(url);
  },
  
  // Get milestone by ID
  getById: (id) => api.get(`/milestones/${id}`),
  
  // Create new milestone
  create: (milestoneData) => api.post('/milestones', milestoneData),
  
  // Update milestone
  update: (id, milestoneData) => api.put(`/milestones/${id}`, milestoneData),
  
  // Delete milestone
  delete: (id) => api.delete(`/milestones/${id}`),
};

export const invoicesAPI = {
  // Get all invoices (with optional project filter)
  getAll: (projectId = null) => {
    const url = projectId ? `/invoices?projectId=${projectId}` : '/invoices';
    return api.get(url);
  },
  
  // Get invoice by ID
  getById: (id) => api.get(`/invoices/${id}`),
  
  // Create new invoice
  create: (invoiceData) => api.post('/invoices', invoiceData),
  
  // Update invoice
  update: (id, invoiceData) => api.put(`/invoices/${id}`, invoiceData),
  
  // Delete invoice
  delete: (id) => api.delete(`/invoices/${id}`),
  
  // Generate PDF
  generatePDF: (id) => api.get(`/pdf/invoice/${id}`, { responseType: 'blob' }),
};

export const approvalsAPI = {
  // Get all approval packets (with optional project filter)
  getAll: (projectId = null) => {
    const url = projectId ? `/approvals/project/${projectId}` : '/approvals';
    return api.get(url);
  },
  
  // Get approval by ID
  getById: (id) => api.get(`/approvals/${id}`),
  
  // Create new approval packet
  create: (approvalData) => api.post('/approvals', approvalData),
  
  // Update approval packet
  update: (id, approvalData) => api.put(`/approvals/${id}`, approvalData),
  
  // Submit approval decision
  submitDecision: (id, decision) => api.post(`/approvals/${id}/decision`, decision),
  
  // Delete approval packet
  delete: (id) => api.delete(`/approvals/${id}`),
  
  // Generate approval certificate PDF
  generatePDF: (id) => api.get(`/pdf/approval/${id}`, { responseType: 'blob' }),
};

export const variationsAPI = {
  // Get all variation requests (with optional project filter)
  getAll: (projectId = null) => {
    const url = projectId ? `/variations?projectId=${projectId}` : '/variations';
    return api.get(url);
  },
  
  // Get variation by ID
  getById: (id) => api.get(`/variations/${id}`),
  
  // Create new variation request
  create: (variationData) => api.post('/variations', variationData),
  
  // Update variation request
  update: (id, variationData) => api.put(`/variations/${id}`, variationData),
  
  // Delete variation request
  delete: (id) => api.delete(`/variations/${id}`),
  
  // Generate variation PDF
  generatePDF: (id) => api.get(`/pdf/variation/${id}`, { responseType: 'blob' }),
};

export const ticketsAPI = {
  // Get all tickets (with optional project filter)
  getAll: (projectId = null) => {
    const url = projectId ? `/tickets?projectId=${projectId}` : '/tickets';
    return api.get(url);
  },
  
  // Get ticket by ID
  getById: (id) => api.get(`/tickets/${id}`),
  
  // Create new ticket
  create: (ticketData) => api.post('/tickets', ticketData),
  
  // Update ticket
  update: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  
  // Delete ticket
  delete: (id) => api.delete(`/tickets/${id}`),
};

export const teamAPI = {
  // Get team members for a project
  getByProject: (projectId) => api.get(`/team?projectId=${projectId}`),
  
  // Add team member to project
  addMember: (teamData) => api.post('/team', teamData),
  
  // Remove team member from project
  removeMember: (id) => api.delete(`/team/${id}`),
  
  // Update team member role
  updateRole: (id, roleData) => api.put(`/team/${id}`, roleData),
};

export const filesAPI = {
  // Get files (with optional filters)
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/files${params ? `?${params}` : ''}`);
  },
  
  // Get files by project ID
  getByProject: (projectId) => api.get(`/files/project/${projectId}`),
  
  // Get file by ID
  getById: (id) => api.get(`/files/${id}`),
  
  // Upload files
  upload: (formData) => {
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update file visibility
  updateVisibility: (fileId, visibility) => api.put(`/files/${fileId}/visibility`, { visibility }),
  
  // Delete file
  delete: (id) => api.delete(`/files/${id}`),
  
  // Download file
  download: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
};

export const brandingAPI = {
  // Get branding settings
  get: () => api.get('/branding'),
  
  // Update branding settings
  update: (brandingData) => api.put('/branding', brandingData),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Export default API instance for custom calls
export default api;