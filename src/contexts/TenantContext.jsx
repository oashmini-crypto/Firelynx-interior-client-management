import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { initializeTenantContext } from '../data/api';

const TenantContext = createContext({
  tenant: null,
  tenantId: null,
  basePath: '',
  apiBasePath: '/api'
});

export const TenantProvider = ({ children }) => {
  const location = useLocation();
  const params = useParams();

  const tenantInfo = useMemo(() => {
    // Extract tenant from URL path pattern: /tenant/{slug}/...
    const pathMatch = location.pathname.match(/^\/tenant\/([^\/]+)/);
    
    if (pathMatch) {
      const tenantSlug = pathMatch[1];
      return {
        tenant: tenantSlug,
        tenantId: tenantSlug,
        basePath: `/tenant/${tenantSlug}`,
        apiBasePath: `/tenant/${tenantSlug}/api`
      };
    }

    // Check subdomain (for future implementation)
    // const subdomain = window.location.hostname.split('.')[0];
    // if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    //   return {
    //     tenant: subdomain,
    //     tenantId: subdomain,
    //     basePath: '',
    //     apiBasePath: '/api'
    //   };
    // }

    // Default tenant (no tenant prefix)
    return {
      tenant: 'default',
      tenantId: 'default', 
      basePath: '',
      apiBasePath: '/api'
    };
  }, [location.pathname]);

  // Initialize the API client with tenant context  
  useEffect(() => {
    const getTenant = () => tenantInfo;
    initializeTenantContext(getTenant);
  }, [tenantInfo]);

  return (
    <TenantContext.Provider value={tenantInfo}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export default TenantContext;