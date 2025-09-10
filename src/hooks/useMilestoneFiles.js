// React Query hook for milestone files with new API endpoints
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Milestone Files API using new milestone-centric endpoints
const fetchMilestoneFiles = async (milestoneId, { visibility, include } = {}) => {
  const params = new URLSearchParams();
  if (visibility) params.append('visibility', visibility);
  if (include) params.append('include', include);
  
  const queryString = params.toString();
  const url = `/api/milestones/${milestoneId}/files${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch milestone files: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data || [];
};

const updateFileStatus = async ({ milestoneId, fileId, status }) => {
  const response = await fetch(`/api/milestones/${milestoneId}/files/${fileId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update file status: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
};

// Hook for fetching milestone files
export const useMilestoneFiles = (milestoneId, { visibility, include } = {}) => {
  return useQuery({
    queryKey: ['milestone-files', milestoneId, { visibility, include }],
    queryFn: () => fetchMilestoneFiles(milestoneId, { visibility, include }),
    enabled: !!milestoneId, // Only run if milestoneId exists
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for updating file status (accept/decline)
export const useUpdateFileStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateFileStatus,
    onSuccess: (updatedFile, variables) => {
      // Invalidate and refetch milestone files queries for this milestone
      queryClient.invalidateQueries({
        queryKey: ['milestone-files', variables.milestoneId],
      });
      
      // Optimistically update the cache
      queryClient.setQueryData(
        ['milestone-files', variables.milestoneId],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(file => 
            file.id === variables.fileId 
              ? { ...file, status: variables.status, updatedAt: new Date().toISOString() }
              : file
          );
        }
      );
    },
    onError: (error) => {
      console.error('Error updating file status:', error);
    },
  });
};

// Hook for client portal (shows pending and accepted files)
export const useClientMilestoneFiles = (milestoneId) => {
  return useMilestoneFiles(milestoneId, { 
    visibility: 'client',
    include: 'pending,accepted' 
  });
};