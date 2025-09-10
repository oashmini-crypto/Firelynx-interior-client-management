// Custom hook for managing milestones data
import { useState, useEffect } from 'react';
import { milestonesAPI } from '../services/api';

export const useMilestones = (projectId = null) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await milestonesAPI.getAll(projectId);
      setMilestones(response.data.data || []);
    } catch (err) {
      console.error('Error fetching milestones:', err);
      setError(err.message || 'Failed to fetch milestones');
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async (milestoneData) => {
    try {
      const response = await milestonesAPI.create(milestoneData);
      setMilestones(prev => [...prev, response.data.data]);
      return response.data.data;
    } catch (err) {
      console.error('Error creating milestone:', err);
      throw err;
    }
  };

  const updateMilestone = async (id, milestoneData) => {
    try {
      const response = await milestonesAPI.update(id, milestoneData);
      setMilestones(prev => prev.map(m => m.id === id ? response.data.data : m));
      return response.data.data;
    } catch (err) {
      console.error('Error updating milestone:', err);
      throw err;
    }
  };

  const deleteMilestone = async (id) => {
    try {
      await milestonesAPI.delete(id);
      setMilestones(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting milestone:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  return {
    milestones,
    loading,
    error,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  };
};