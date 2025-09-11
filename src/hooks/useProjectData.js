/**
 * React Query hooks for project data with real-time synchronization
 * Replaces manual state management with React Query for polling and invalidation
 */
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiClient } from '../data/api';

// Query keys for consistent cache management
export const queryKeys = {
  projects: ['projects'],
  project: (id) => ['projects', id],
  projectVariations: (projectId) => ['projects', projectId, 'variations'],
  projectInvoices: (projectId) => ['projects', projectId, 'invoices'],
  projectMilestones: (projectId) => ['projects', projectId, 'milestones'],
  projectTickets: (projectId) => ['projects', projectId, 'tickets'],
  projectFiles: (projectId) => ['projects', projectId, 'files'],
  projectApprovals: (projectId) => ['projects', projectId, 'approvals'],
  projectTeam: (projectId) => ['projects', projectId, 'team'],
  allVariations: ['variations'],
  allTickets: ['tickets'],
  allInvoices: ['invoices'],
  allApprovals: ['approvals'],
  clients: ['clients'],
  client: (id) => ['clients', id],
};

// Core project hooks with polling for real-time sync
export const useProjects = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => apiClient.getProjects(),
    refetchInterval: 15000, // Poll every 15 seconds for real-time sync
    refetchOnWindowFocus: true,
    staleTime: 10000, // Consider data stale after 10 seconds
    ...options,
  });
};

export const useProject = (projectId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => apiClient.getProject(projectId),
    enabled: !!projectId,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

// Project-scoped resource hooks with synchronization
export const useProjectVariations = (projectId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.projectVariations(projectId),
    queryFn: () => apiClient.getProjectVariations(projectId),
    enabled: !!projectId,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

export const useProjectInvoices = (projectId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.projectInvoices(projectId),
    queryFn: () => apiClient.getProjectInvoices(projectId),
    enabled: !!projectId,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

export const useProjectMilestones = (projectId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.projectMilestones(projectId),
    queryFn: () => apiClient.getProjectMilestones(projectId),
    enabled: !!projectId,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

export const useProjectTickets = (projectId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.projectTickets(projectId),
    queryFn: () => apiClient.getProjectTickets(projectId),
    enabled: !!projectId,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

export const useProjectFiles = (projectId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.projectFiles(projectId),
    queryFn: () => apiClient.getProjectFiles(projectId),
    enabled: !!projectId,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

export const useProjectApprovals = (projectId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.projectApprovals(projectId),
    queryFn: () => apiClient.getProjectApprovals(projectId),
    enabled: !!projectId,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

export const useProjectTeam = (projectId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.projectTeam(projectId),
    queryFn: () => apiClient.getProjectTeam(projectId),
    enabled: !!projectId,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

// Global data hooks for cross-project views
export const useAllVariations = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.allVariations,
    queryFn: () => apiClient.getAllVariations(),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

export const useAllTickets = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.allTickets,
    queryFn: () => apiClient.getAllTickets(),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

export const useAllInvoices = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.allInvoices,
    queryFn: () => apiClient.getAllInvoices(),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

export const useAllApprovals = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.allApprovals,
    queryFn: () => apiClient.getAllApprovals(),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

// Client hooks
export const useClients = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: () => apiClient.getClients(),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

export const useClient = (clientId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.client(clientId),
    queryFn: () => apiClient.getClient(clientId),
    enabled: !!clientId,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    ...options,
  });
};

// Utility hook for manual query invalidation (for immediate sync after mutations)
export const useInvalidateProjectData = () => {
  const queryClient = useQueryClient();

  return {
    // Invalidate all project data
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['variations'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    
    // Invalidate specific project data
    invalidateProject: (projectId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectVariations(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectInvoices(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectMilestones(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectTickets(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectFiles(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectApprovals(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectTeam(projectId) });
    },
    
    // Invalidate specific resource types
    invalidateVariations: () => {
      queryClient.invalidateQueries({ queryKey: ['variations'] });
      // Also invalidate project-specific variations
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });
    },
    
    invalidateTickets: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });
    },
    
    invalidateInvoices: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });
    },

    // Invalidate client data
    invalidateClients: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      // Also invalidate projects since they include client data
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });
    },
  };
};

// Example mutation hook with automatic invalidation
export const useCreateVariation = () => {
  const queryClient = useQueryClient();
  const { invalidateVariations } = useInvalidateProjectData();

  return useMutation({
    mutationFn: (data) => apiClient.createVariation(data),
    onSuccess: (data, variables) => {
      // Immediately invalidate related queries for real-time sync
      invalidateVariations();
      
      // Also invalidate the specific project's data
      if (variables.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projectVariations(variables.projectId) 
        });
      }
    },
  });
};

// Client mutation hooks
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { invalidateClients } = useInvalidateProjectData();

  return useMutation({
    mutationFn: (data) => apiClient.createClient(data),
    onSuccess: () => {
      // Immediately invalidate client queries for real-time sync
      invalidateClients();
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { invalidateClients } = useInvalidateProjectData();

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateClient(id, data),
    onSuccess: (data, variables) => {
      // Immediately invalidate client queries
      invalidateClients();
      
      // Also invalidate the specific client's data
      if (variables.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.client(variables.id) 
        });
      }
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { invalidateClients } = useInvalidateProjectData();

  return useMutation({
    mutationFn: (clientId) => apiClient.deleteClient(clientId),
    onSuccess: () => {
      // Immediately invalidate client queries
      invalidateClients();
    },
  });
};