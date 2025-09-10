import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
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

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Manager Routes */}
        <Route path="/dashboard" element={<ManagerDashboard />} />
        <Route path="/clients" element={<ClientProfiles />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        
        {/* Legacy manager routes - redirect to new paths */}
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/projects-list" element={<ProjectsList />} />
        <Route path="/project-details" element={<ProjectDetails />} />
        
        {/* Client Routes */}
        <Route path="/portal" element={<ClientPortal />} />
        <Route path="/portal/projects/:id" element={<ClientPortal />} />
        <Route path="/client/:id" element={<ClientPortal />} />
        
        {/* Additional manager pages */}
        <Route path="/variations" element={<VariationsGlobal />} />
        <Route path="/tickets" element={<TicketsGlobal />} />
        <Route path="/invoices" element={<InvoicesGlobal />} />
        <Route path="/variation-requests" element={<VariationRequestsPage />} />
        <Route path="/ticketing-system" element={<TicketingSystem />} />
        <Route path="/user-management" element={<UserManagement />} />
        
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Default route */}
        <Route path="/" element={<ManagerDashboard />} />
        
        {/* Legacy routes for compatibility */}
        <Route path="/client-portal" element={<ClientPortal />} />
        <Route path="/client-profiles" element={<ClientProfiles />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;