import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import { TenantProvider } from "./contexts/TenantContext";
import ManagerDashboard from './pages/manager-dashboard';
import VariationRequestsPage from './pages/variation-requests';
import VariationsGlobal from './pages/variations-global';
import TicketsGlobal from './pages/tickets-global';
import InvoicesGlobal from './pages/invoices-global';
import LoginPage from './pages/login';
import ClientPortal from './pages/client-portal';
import UserManagement from './pages/user-management';
import TicketingSystem from './pages/ticketing-system';
import ProjectDetails from './pages/project-details';
import ProjectsList from './pages/projects-list';
import ClientProfiles from './pages/client-profiles';
import BrandingManagement from './pages/branding-management';
import ActivityLog from './pages/activity-log';

const Routes = () => {
  return (
    <BrowserRouter>
      <TenantProvider>
        <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Default Routes (no tenant prefix) */}
          <Route path="/dashboard" element={<ManagerDashboard />} />
          <Route path="/clients" element={<ClientProfiles />} />
          <Route path="/projects" element={<ProjectsList />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/portal" element={<ClientPortal />} />
          <Route path="/portal/projects/:id" element={<ClientPortal />} />
          <Route path="/client/:id" element={<ClientPortal />} />
          <Route path="/variations" element={<VariationsGlobal />} />
          <Route path="/tickets" element={<TicketsGlobal />} />
          <Route path="/invoices" element={<InvoicesGlobal />} />
          <Route path="/variation-requests" element={<VariationRequestsPage />} />
          <Route path="/ticketing-system" element={<TicketingSystem />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/branding" element={<BrandingManagement />} />
          <Route path="/activity-log" element={<ActivityLog />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ManagerDashboard />} />
          
          {/* Tenant-prefixed Routes - Support /tenant/{slug}/... pattern */}
          <Route path="/tenant/:tenantSlug/dashboard" element={<ManagerDashboard />} />
          <Route path="/tenant/:tenantSlug/clients" element={<ClientProfiles />} />
          <Route path="/tenant/:tenantSlug/projects" element={<ProjectsList />} />
          <Route path="/tenant/:tenantSlug/projects/:id" element={<ProjectDetails />} />
          <Route path="/tenant/:tenantSlug/portal" element={<ClientPortal />} />
          <Route path="/tenant/:tenantSlug/portal/projects/:id" element={<ClientPortal />} />
          <Route path="/tenant/:tenantSlug/client/:id" element={<ClientPortal />} />
          <Route path="/tenant/:tenantSlug/variations" element={<VariationsGlobal />} />
          <Route path="/tenant/:tenantSlug/tickets" element={<TicketsGlobal />} />
          <Route path="/tenant/:tenantSlug/invoices" element={<InvoicesGlobal />} />
          <Route path="/tenant/:tenantSlug/variation-requests" element={<VariationRequestsPage />} />
          <Route path="/tenant/:tenantSlug/ticketing-system" element={<TicketingSystem />} />
          <Route path="/tenant/:tenantSlug/user-management" element={<UserManagement />} />
          <Route path="/tenant/:tenantSlug/branding" element={<BrandingManagement />} />
          <Route path="/tenant/:tenantSlug/activity-log" element={<ActivityLog />} />
          <Route path="/tenant/:tenantSlug/login" element={<LoginPage />} />
          <Route path="/tenant/:tenantSlug/" element={<ManagerDashboard />} />
          
          {/* Legacy routes for compatibility */}
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/projects-list" element={<ProjectsList />} />
          <Route path="/project-details" element={<ProjectDetails />} />
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/client-profiles" element={<ClientProfiles />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
        </ErrorBoundary>
      </TenantProvider>
    </BrowserRouter>
  );
};

export default Routes;