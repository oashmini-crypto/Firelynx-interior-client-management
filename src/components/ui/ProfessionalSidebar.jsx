import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const ProfessionalSidebar = ({ isCollapsed = false, onToggleCollapse, notificationCounts = {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      tooltip: 'Project overview and key metrics'
    },
    {
      label: 'Clients',
      path: '/clients',
      icon: 'Building2',
      tooltip: 'Client profiles and projects'
    },
    {
      label: 'Projects',
      path: '/projects',
      icon: 'Briefcase',
      tooltip: 'All project management'
    },
    {
      label: 'Variations',
      path: '/variations',
      icon: 'FileEdit',
      tooltip: 'Manage scope changes and approvals',
      badge: notificationCounts?.variations || 0
    },
    {
      label: 'Tickets',
      path: '/tickets',
      icon: 'MessageSquare',
      tooltip: 'Support requests and issue tracking',
      badge: notificationCounts?.tickets || 0
    },
    {
      label: 'Users',
      path: '/user-management',
      icon: 'Users',
      tooltip: 'Team and client management'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const Logo = () => (
    <div className="flex items-center space-x-3 px-4 py-6">
      <div className="flex-shrink-0">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="var(--color-primary)"/>
          <path d="M8 12L16 8L24 12V20C24 21.1046 23.1046 22 22 22H10C8.89543 22 8 21.1046 8 20V12Z" 
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16L16 14L20 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {!isCollapsed && (
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-primary">FireLynx</span>
          <span className="text-xs text-text-secondary">Interior Design</span>
        </div>
      )}
    </div>
  );

  const NavigationItem = ({ item, isMobile = false }) => {
    const isActive = location?.pathname === item?.path;
    
    return (
      <button
        onClick={() => handleNavigation(item?.path)}
        className={`
          w-full flex items-center space-x-3 px-4 py-3 text-left transition-smooth rounded-lg mx-2
          ${isActive 
            ? 'bg-accent text-accent-foreground shadow-subtle' 
            : 'text-text-primary hover:bg-muted hover:text-primary'
          }
          ${isMobile ? 'justify-start' : isCollapsed ? 'justify-center' : 'justify-start'}
        `}
        title={isCollapsed ? item?.tooltip : undefined}
      >
        <div className="relative flex-shrink-0">
          <Icon 
            name={item?.icon} 
            size={20} 
            color={isActive ? 'var(--color-accent-foreground)' : 'currentColor'} 
          />
          {item?.badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {item?.badge > 99 ? '99+' : item?.badge}
            </span>
          )}
        </div>
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center justify-between flex-1">
            <span className="font-medium">{item?.label}</span>
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-surface border-b border-border z-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
          </Button>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-200 pt-16">
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-2 py-4 space-y-2">
              {navigationItems?.map((item) => (
                <NavigationItem key={item?.path} item={item} isMobile />
              ))}
            </nav>
            <div className="border-t border-border p-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                iconName="LogOut"
                iconPosition="left"
                fullWidth
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Desktop Sidebar */}
      <div className={`
        hidden md:flex fixed left-0 top-0 h-full bg-surface border-r border-border z-100 flex-col
        transition-smooth ${isCollapsed ? 'w-16' : 'w-60'}
      `}>
        {/* Logo Section */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1">
          {navigationItems?.map((item) => (
            <NavigationItem key={item?.path} item={item} />
          ))}
        </nav>

        {/* User Section */}
        <div className="flex-shrink-0 border-t border-border p-4">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={16} color="var(--color-primary-foreground)" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">Studio Manager</p>
                <p className="text-xs text-text-secondary truncate">manager@firelynx.com</p>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="mt-3 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                iconName="LogOut"
                iconPosition="left"
                fullWidth
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <div className="flex-shrink-0 p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="w-full"
            >
              <Icon 
                name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} 
                size={16} 
              />
            </Button>
          </div>
        )}
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-100">
        <div className="flex items-center justify-around py-2">
          {navigationItems?.slice(0, 4)?.map((item) => {
            const isActive = location?.pathname === item?.path;
            return (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`
                  flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-smooth
                  ${isActive ? 'text-accent' : 'text-text-secondary'}
                `}
              >
                <div className="relative">
                  <Icon 
                    name={item?.icon} 
                    size={20} 
                    color={isActive ? 'var(--color-accent)' : 'currentColor'} 
                  />
                  {item?.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full min-w-[12px] h-3 flex items-center justify-center px-1">
                      {item?.badge > 9 ? '9+' : item?.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item?.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProfessionalSidebar;