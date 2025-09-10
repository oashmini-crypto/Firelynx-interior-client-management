// React Query hook for variation files management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Variation Files API
const fetchVariationFiles = async (variationId) => {
  const response = await fetch(`/api/variations/${variationId}/files`);
  if (!response.ok) {
    throw new Error(`Failed to fetch variation files: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data || [];
};

const deleteVariationFile = async ({ variationId, fileId }) => {
  const response = await fetch(`/api/variations/${variationId}/files/${fileId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete variation file: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result;
};

// Variation approval actions
const submitVariationForApproval = async (variationId) => {
  const response = await fetch(`/api/variations/${variationId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to submit variation: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
};

const approveVariation = async ({ variationId, comment = '' }) => {
  const response = await fetch(`/api/variations/${variationId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to approve variation: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
};

const declineVariation = async ({ variationId, comment }) => {
  const response = await fetch(`/api/variations/${variationId}/decline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to decline variation: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
};

// Hook for fetching variation files
export const useVariationFiles = (variationId) => {
  return useQuery({
    queryKey: ['variation-files', variationId],
    queryFn: () => fetchVariationFiles(variationId),
    enabled: !!variationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for deleting variation files
export const useDeleteVariationFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteVariationFile,
    onSuccess: (result, variables) => {
      // Invalidate and refetch variation files
      queryClient.invalidateQueries({
        queryKey: ['variation-files', variables.variationId],
      });
    },
    onError: (error) => {
      console.error('Error deleting variation file:', error);
    },
  });
};

// Hook for submitting variation for approval
export const useSubmitVariation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitVariationForApproval,
    onSuccess: (updatedVariation, variationId) => {
      // Update variation queries
      queryClient.invalidateQueries({
        queryKey: ['variations'],
      });
      queryClient.invalidateQueries({
        queryKey: ['variation', variationId],
      });
      
      // Optimistically update cache
      queryClient.setQueryData(['variation', variationId], updatedVariation);
    },
    onError: (error) => {
      console.error('Error submitting variation:', error);
    },
  });
};

// Hook for approving variation
export const useApproveVariation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: approveVariation,
    onSuccess: (updatedVariation, variables) => {
      // Update variation queries
      queryClient.invalidateQueries({
        queryKey: ['variations'],
      });
      queryClient.invalidateQueries({
        queryKey: ['variation', variables.variationId],
      });
      
      // Optimistically update cache
      queryClient.setQueryData(['variation', variables.variationId], updatedVariation);
    },
    onError: (error) => {
      console.error('Error approving variation:', error);
    },
  });
};

// Hook for declining variation
export const useDeclineVariation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: declineVariation,
    onSuccess: (updatedVariation, variables) => {
      // Update variation queries
      queryClient.invalidateQueries({
        queryKey: ['variations'],
      });
      queryClient.invalidateQueries({
        queryKey: ['variation', variables.variationId],
      });
      
      // Optimistically update cache
      queryClient.setQueryData(['variation', variables.variationId], updatedVariation);
    },
    onError: (error) => {
      console.error('Error declining variation:', error);
    },
  });
};