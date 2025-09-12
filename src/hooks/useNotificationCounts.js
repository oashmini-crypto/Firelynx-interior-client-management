import { useMemo } from 'react';
import { useAllVariations, useAllTickets } from './useProjectData';

/**
 * Global hook to provide consistent notification counts for the sidebar
 * Calculates real-time counts for variations and tickets that need attention
 */
export const useNotificationCounts = () => {
  const { data: allVariations = [], isLoading: variationsLoading } = useAllVariations();
  const { data: allTickets = [], isLoading: ticketsLoading } = useAllTickets();

  const notificationCounts = useMemo(() => {
    // Count variations that need attention (pending review/approval)
    const pendingVariations = allVariations.filter(v => 
      v.status === 'Under Review' || 
      v.status === 'Pending' ||
      v.status === 'Submitted'
    ).length;

    // Count tickets that are open/unresolved
    const openTickets = allTickets.filter(t => 
      t.status === 'Open' || 
      t.status === 'In Progress'
    ).length;

    return {
      variations: pendingVariations,
      tickets: openTickets
    };
  }, [allVariations, allTickets]);

  return {
    notificationCounts,
    isLoading: variationsLoading || ticketsLoading
  };
};