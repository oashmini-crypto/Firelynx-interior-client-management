import React from 'react';

const AuthenticationWrapper = ({ children, title = "Welcome to FireLynx", subtitle = "Interior Design Management Platform" }) => {
  const Logo = () => (
    <div className="flex flex-col items-center space-y-4 mb-8">
      <div className="flex items-center space-x-3">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="var(--color-primary)"/>
          <path d="M12 18L24 12L36 18V30C36 31.6569 34.6569 33 33 33H15C13.3431 33 12 31.6569 12 30V18Z" 
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 24L24 21L30 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="flex flex-col">
          <span className="text-2xl font-semibold text-primary">FireLynx</span>
          <span className="text-sm text-text-secondary">Interior Design</span>
        </div>
      </div>
      
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-primary mb-2">{title}</h1>
        <p className="text-text-secondary">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-lg shadow-modal p-8">
          <Logo />
          {children}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-secondary">
            © 2025 FireLynx Interior Design. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationWrapper;