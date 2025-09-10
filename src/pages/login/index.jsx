import React from 'react';
import AuthenticationWrapper from '../../components/ui/AuthenticationWrapper';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';
import RoleBasedMessaging from './components/RoleBasedMessaging';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticationWrapper
        title="Welcome Back"
        subtitle="Sign in to access your interior design portal"
      >
        {/* Main Login Form */}
        <LoginForm />
        
        {/* Security Trust Indicators */}
        <SecurityBadges />
        
        {/* Role-Based Portal Information */}
        <RoleBasedMessaging />
      </AuthenticationWrapper>
    </div>
  );
};

export default LoginPage;