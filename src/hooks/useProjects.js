// Custom hook for managing projects data
import { useState, useEffect } from 'react';
import { projectsAPI, api } from '../services/api';

// Hook for fetching a single project by ID
export const useProject = (projectId) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/projects/${projectId}`);
        setProject(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch project');
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return { project, loading, error };
};

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async (showRetryMessage = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsAPI.getAll();
      setProjects(response.data.data || []);
      
      if (showRetryMessage) {
        console.log('✅ Successfully reconnected to server');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      
      // Better error messages based on error type
      let errorMessage = 'Failed to fetch projects';
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage = 'Unable to connect. Please check server/API.';
        
        // Auto-retry after 5 seconds for network errors
        setTimeout(() => {
          console.log('🔄 Auto-retrying connection...');
          fetchProjects(true);
        }, 5000);
      } else if (err.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const response = await projectsAPI.create(projectData);
      setProjects(prev => [...prev, response.data.data]);
      return response.data.data;
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const response = await projectsAPI.update(id, projectData);
      setProjects(prev => prev.map(p => p.id === id ? response.data.data : p));
      return response.data.data;
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectsAPI.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects, // Expose refetch function for retry button
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};