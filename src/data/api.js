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
      console.log('🔄 API Request:', options.method || 'GET', endpoint, 'Full URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API DIAGNOSTICS: ${options.method || 'GET'} ${url} - Status: ${response.status}`, { error: errorText || 'No error message', payload: options.body, responseTime: Date.now() });
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', endpoint, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error);
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
} = apiClient;

export default apiClient;