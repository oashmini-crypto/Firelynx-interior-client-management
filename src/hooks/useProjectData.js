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
  // User management query keys
  users: ['users'],
  user: (id) => ['users', id],
  currentUser: ['auth', 'me'],
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

// User management hooks
export const useUsers = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiClient.getUsers(),
    refetchInterval: false, // Disable polling to prevent auth error loops
    refetchOnWindowFocus: false, // Disable refetch on window focus
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error?.message?.includes('Access token required') ||
          error?.response?.status === 401 ||
          error?.status === 401) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options,
  });
};

export const useUser = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => apiClient.getUser(userId),
    enabled: !!userId,
    refetchInterval: false, // Disable polling
    refetchOnWindowFocus: false, // Disable refetch on window focus  
    staleTime: 30000,
    retry: (failureCount, error) => {
      if (error?.message?.includes('Access token required') ||
          error?.response?.status === 401 ||
          error?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options,
  });
};

export const useCurrentUser = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => apiClient.getCurrentUser(),
    refetchInterval: 30000, // Less frequent for current user
    refetchOnWindowFocus: true,
    staleTime: 15000,
    retry: false, // Don't retry if not authenticated
    ...options,
  });
};

// User mutation hooks
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => apiClient.createUser(userData),
    onSuccess: () => {
      // Invalidate users list after creating a new user
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateUser(id, data),
    onSuccess: (data, variables) => {
      // Invalidate both the users list and specific user
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
      }
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => apiClient.deleteUser(userId),
    onSuccess: () => {
      // Invalidate users list after deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => apiClient.activateUser(userId),
    onSuccess: (data, userId) => {
      // Invalidate both users list and specific user
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => apiClient.deactivateUser(userId),
    onSuccess: (data, userId) => {
      // Invalidate both users list and specific user
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    },
  });
};

export const useResetUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, newPassword }) => apiClient.resetUserPassword(userId, newPassword),
    onSuccess: (data, variables) => {
      // Invalidate specific user data after password reset
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.userId) });
    },
  });
};

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, newRole }) => apiClient.changeUserRole(userId, newRole),
    onSuccess: (data, variables) => {
      // Invalidate both users list and specific user
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.userId) });
    },
  });
};

// Authentication hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => apiClient.login(email, password),
    onSuccess: () => {
      // Invalidate current user query to refetch after login
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
    },
  });
};

// Branding management hooks
export const useBrandingSettings = (options = {}) => {
  return useQuery({
    queryKey: ['branding', 'settings'],
    queryFn: () => apiClient.getBrandingSettings(),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    ...options,
  });
};

export const useUpdateBrandingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => apiClient.updateBrandingSettings(settings),
    onSuccess: (data) => {
      // Update the branding settings cache
      queryClient.setQueryData(['branding', 'settings'], data);
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['branding', 'settings'] });
    },
  });
};

export const useUploadLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logoFile) => apiClient.uploadLogo(logoFile),
    onSuccess: (data) => {
      // Update branding settings with new logo URL
      queryClient.invalidateQueries({ queryKey: ['branding', 'settings'] });
    },
  });
};

export const useDeleteLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.deleteLogo(),
    onSuccess: (data) => {
      // Update branding settings to remove logo
      queryClient.invalidateQueries({ queryKey: ['branding', 'settings'] });
    },
  });
};

export const useBrandingPreview = (type = 'invoice', options = {}) => {
  return useQuery({
    queryKey: ['branding', 'preview', type],
    queryFn: () => apiClient.getBrandingPreview(type),
    enabled: false, // Only fetch when explicitly requested
    staleTime: 10000, // 10 seconds
    ...options,
  });
};