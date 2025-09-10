import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const ClientPortalHeader = ({ projectName = "Luxury Apartment Renovation", clientName = "Sarah Johnson" }) => {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  const Logo = () => (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="var(--color-primary)"/>
          <path d="M8 12L16 8L24 12V20C24 21.1046 23.1046 22 22 22H10C8.89543 22 8 21.1046 8 20V12Z" 
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16L16 14L20 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-primary">FireLynx</span>
        <span className="text-xs text-text-secondary hidden sm:block">Interior Design</span>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 bg-surface border-b border-border z-60">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Project Context */}
          <div className="hidden md:flex flex-col items-center text-center">
            <h1 className="text-sm font-medium text-primary">{projectName}</h1>
            <p className="text-xs text-text-secondary">Project Portal</p>
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="var(--color-accent-foreground)" />
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-primary">{clientName}</span>
                <span className="text-xs text-text-secondary">Client</span>
              </div>
              <Icon 
                name={isUserMenuOpen ? 'ChevronUp' : 'ChevronDown'} 
                size={16} 
                className="text-text-secondary" 
              />
            </Button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-modal z-110 animate-slide-in">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                      <Icon name="User" size={20} color="var(--color-accent-foreground)" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-popover-foreground">{clientName}</p>
                      <p className="text-xs text-text-secondary">sarah.johnson@email.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted rounded-md transition-smooth"
                  >
                    <Icon name="User" size={16} />
                    <span>Profile Settings</span>
                  </button>
                  
                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted rounded-md transition-smooth"
                  >
                    <Icon name="Bell" size={16} />
                    <span>Notifications</span>
                  </button>
                  
                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted rounded-md transition-smooth"
                  >
                    <Icon name="HelpCircle" size={16} />
                    <span>Help & Support</span>
                  </button>
                  
                  <div className="border-t border-border my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-error hover:bg-muted rounded-md transition-smooth"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Project Context */}
        <div className="md:hidden pb-3 border-b border-border">
          <h1 className="text-sm font-medium text-primary">{projectName}</h1>
          <p className="text-xs text-text-secondary">Project Portal</p>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-50" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default ClientPortalHeader;