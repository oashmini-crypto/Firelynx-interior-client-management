/**
 * FireLynx API Integration Layer
 * 
 * Replaces client-side mock store with real backend API calls.
 * Ensures frontend and backend use same UUIDs for proper integration.
 */

// API Configuration - Use relative path for Vite proxy
const API_BASE_URL = '/api';

// Create API client with error handling
class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      // Development logging only
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 API Request:', options.method || 'GET', endpoint, 'Full URL:', url);
      }
      
      // Only set Content-Type if body is not FormData (let browser set it for FormData)
      const defaultHeaders = {};
      if (!(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(url, {
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Development-only detailed error diagnostics to prevent PII leaks
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ API DIAGNOSTICS: ${options.method || 'GET'} ${url} - Status: ${response.status}`, { error: errorText || 'No error message', payload: options.body, responseTime: Date.now() });
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ API Response:', endpoint, data);
      }
      return data;
    } catch (error) {
      // Development-only detailed error logging to prevent information leakage
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error [${endpoint}]:`, error);
      }
      throw error;
    }
  }

  // Core entity methods
  async getProjects() {
    const response = await this.request('/projects');
    return response.success ? response.data : [];
  }

  async getProject(id) {
    const response = await this.request(`/projects/${id}`);
    return response.success ? response.data : null;
  }

  // NEW: Project-scoped API endpoints - all resources under /projects/:projectId/
  async getProjectVariations(projectId) {
    const response = await this.request(`/projects/${projectId}/variations`);
    return response.success ? response.data : [];
  }

  async getProjectInvoices(projectId) {
    const response = await this.request(`/projects/${projectId}/invoices`);
    return response.success ? response.data : [];
  }

  async getProjectMilestones(projectId) {
    const response = await this.request(`/projects/${projectId}/milestones`);
    return response.success ? response.data : [];
  }

  async getProjectTickets(projectId) {
    const response = await this.request(`/projects/${projectId}/tickets`);
    return response.success ? response.data : [];
  }

  async getProjectFiles(projectId) {
    const response = await this.request(`/projects/${projectId}/files`);
    return response.success ? response.data : [];
  }

  async getProjectApprovals(projectId) {
    const response = await this.request(`/projects/${projectId}/approvals`);
    return response.success ? response.data : [];
  }

  async getProjectTeam(projectId) {
    const response = await this.request(`/projects/${projectId}/team`);
    return response.success ? response.data : [];
  }

  // Global entity methods
  async getAllVariations() {
    const response = await this.request('/variations');
    return response.success ? response.data : [];
  }

  async getAllInvoices() {
    const response = await this.request('/invoices');
    return response.success ? response.data : [];
  }

  async getAllTickets() {
    const response = await this.request('/tickets');
    return response.success ? response.data : [];
  }

  async getAllMilestones() {
    const response = await this.request('/milestones');
    return response.success ? response.data : [];
  }

  async getAllApprovals() {
    const response = await this.request('/approvals');
    return response.success ? response.data : [];
  }

  // Create operations
  async createVariation(data) {
    const response = await this.request('/variations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async createInvoice(data) {
    const response = await this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async createTicket(data) {
    const response = await this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async createMilestone(data) {
    const response = await this.request('/milestones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async createApproval(data) {
    const response = await this.request('/approvals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  // Update operations
  async updateVariation(id, data) {
    const response = await this.request(`/variations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateInvoice(id, data) {
    const response = await this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateTicket(id, data) {
    const response = await this.request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateApproval(id, data) {
    // Map frontend data to backend expected format
    const requestData = {
      decision: data.status, // Map 'status' to 'decision'
      comment: data.clientComment,
      signatureName: data.signatureName
    };
    
    const response = await this.request(`/approvals/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response;
  }

  async sendApproval(id) {
    const response = await this.request(`/approvals/${id}/send`, {
      method: 'POST',
    });
    return response;
  }

  // PDF generation
  async generateVariationPdf(variationId) {
    const response = await fetch(`${this.baseUrl}/pdf/variation/${variationId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.status} ${response.statusText}`);
    }
    
    return response.blob();
  }

  async generateInvoicePdf(invoiceId) {
    const response = await fetch(`${this.baseUrl}/pdf/invoice/${invoiceId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.status} ${response.statusText}`);
    }
    
    return response.blob();
  }

  async generateApprovalPdf(approvalId) {
    const response = await fetch(`${this.baseUrl}/pdf/approval/${approvalId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.status} ${response.statusText}`);
    }
    
    return response.blob();
  }

  // Client API methods
  async getClients() {
    const response = await this.request('/clients');
    return response.success ? response.data : [];
  }

  async getClient(id) {
    const response = await this.request(`/clients/${id}`);
    return response.success ? response.data : null;
  }

  async createClient(data) {
    const response = await this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateClient(id, data) {
    const response = await this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  async deleteClient(id) {
    const response = await this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // User management API methods
  async getUsers() {
    const response = await this.request('/users');
    return response.success ? response.data : [];
  }

  async getUser(id) {
    const response = await this.request(`/users/${id}`);
    return response.success ? response.data : null;
  }

  async createUser(data) {
    const response = await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateUser(id, data) {
    const response = await this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  async deleteUser(id) {
    const response = await this.request(`/users/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  async activateUser(id) {
    const response = await this.request(`/users/${id}/activate`, {
      method: 'POST',
    });
    return response;
  }

  async deactivateUser(id) {
    const response = await this.request(`/users/${id}/deactivate`, {
      method: 'POST',
    });
    return response;
  }

  async resetUserPassword(id, newPassword) {
    const response = await this.request(`/users/${id}/password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
    return response;
  }

  async changeUserRole(id, newRole) {
    const response = await this.request(`/users/${id}/role`, {
      method: 'POST',
      body: JSON.stringify({ role: newRole }),
    });
    return response;
  }

  // Authentication API methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include cookies for authentication
    });
    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    return response;
  }

  async getCurrentUser() {
    const response = await this.request('/auth/me', {
      credentials: 'include',
    });
    return response.success ? response.data : null;
  }

  async resetPassword(email) {
    const response = await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response;
  }

  // Branding Management API
  async getBrandingSettings() {
    const response = await this.request('/branding');
    return response.success ? response.data : null;
  }

  async updateBrandingSettings(settings) {
    const response = await this.request('/branding', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return response.success ? response.data : null;
  }

  async uploadLogo(logoFile) {
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    const response = await this.request('/branding/logo', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
    return response.success ? response.data : null;
  }

  async deleteLogo() {
    const response = await this.request('/branding/logo', {
      method: 'DELETE',
    });
    return response.success ? response.data : null;
  }

  async getBrandingPreview(type = 'invoice') {
    const response = await this.request(`/branding/preview?type=${type}`);
    return response.success ? response.data : null;
  }
}

// Create singleton API client
export const apiClient = new ApiClient();

// Export individual functions for easier imports
export const {
  getProjects,
  getProject,
  getProjectVariations,
  getProjectInvoices,
  getProjectMilestones,
  getProjectTickets,
  getProjectFiles,
  getProjectApprovals,
  getProjectTeam,
  getAllVariations,
  getAllInvoices,
  getAllTickets,
  getAllMilestones,
  getAllApprovals,
  getClients,
  getClient,
  createVariation,
  createInvoice,
  createTicket,
  createApproval,
  createClient,
  updateVariation,
  updateInvoice,
  updateTicket,
  updateApproval,
  updateClient,
  deleteClient,
  generateVariationPdf,
  generateInvoicePdf,
  generateApprovalPdf,
  // User management functions
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  resetUserPassword,
  changeUserRole,
  // Authentication functions
  login,
  logout,
  getCurrentUser,
  resetPassword,
  // Branding management functions
  getBrandingSettings,
  updateBrandingSettings,
  uploadLogo,
  deleteLogo,
  getBrandingPreview,
} = apiClient;

export default apiClient;