// React Query hook for approval files with new API endpoints
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Approval Files API using new approval-centric endpoints
const fetchApprovalFiles = async (approvalId, { visibility, include } = {}) => {
  const params = new URLSearchParams();
  if (visibility) params.append('visibility', visibility);
  if (include) params.append('include', include);
  
  const queryString = params.toString();
  const url = `/api/approvals/${approvalId}/files${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch approval files: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data || [];
};

const updateApprovalFileStatus = async ({ approvalId, fileId, status }) => {
  const response = await fetch(`/api/approvals/${approvalId}/files/${fileId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update approval file status: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
};

// Hook for fetching approval files
export const useApprovalFiles = (approvalId, { visibility, include } = {}) => {
  return useQuery({
    queryKey: ['approval-files', approvalId, { visibility, include }],
    queryFn: () => fetchApprovalFiles(approvalId, { visibility, include }),
    enabled: !!approvalId, // Only run if approvalId exists
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for updating approval file status (accept/decline)
export const useUpdateApprovalFileStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateApprovalFileStatus,
    onSuccess: (updatedFile, variables) => {
      // Invalidate and refetch approval files queries for this approval
      queryClient.invalidateQueries({
        queryKey: ['approval-files', variables.approvalId],
      });
      
      // Optimistically update the cache
      queryClient.setQueryData(
        ['approval-files', variables.approvalId],
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
      console.error('Error updating approval file status:', error);
    },
  });
};

// Hook for client portal (shows pending and accepted files)
export const useClientApprovalFiles = (approvalId) => {
  return useApprovalFiles(approvalId, { 
    visibility: 'client',
    include: 'pending,accepted' 
  });
};