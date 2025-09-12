import React, { useState, useCallback, useEffect } from 'react';
import ProfessionalSidebar from '../../components/ui/ProfessionalSidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import ColorCustomizer from './components/ColorCustomizer';
import LogoManager from './components/LogoManager';
import ThemePreview from './components/ThemePreview';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { 
  useBrandingSettings, 
  useUpdateBrandingSettings,
  useUploadLogo,
  useDeleteLogo 
} from '../../hooks/useProjectData';
import { useNotificationCounts } from '../../hooks/useNotificationCounts';

const BrandingManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localSettings, setLocalSettings] = useState({});

  // API hooks
  const { data: brandingSettings, isLoading } = useBrandingSettings();
  const updateSettingsMutation = useUpdateBrandingSettings();
  const uploadLogoMutation = useUploadLogo();
  const deleteLogoMutation = useDeleteLogo();

  // Get real notification counts
  const { notificationCounts } = useNotificationCounts();

  // Initialize local settings when server data loads
  useEffect(() => {
    if (brandingSettings) {
      setLocalSettings(brandingSettings);
      applyThemeToDocument(brandingSettings);
    }
  }, [brandingSettings]);

  // Apply theme changes to CSS variables in real-time
  const applyThemeToDocument = useCallback((settings) => {
    const root = document.documentElement;
    
    if (settings.accentColor) {
      root.style.setProperty('--color-accent', settings.accentColor);
      root.style.setProperty('--color-ring', settings.accentColor);
    }
    
    if (settings.primaryTextColor) {
      root.style.setProperty('--color-text-primary', settings.primaryTextColor);
      root.style.setProperty('--color-foreground', settings.primaryTextColor);
    }
    
    if (settings.mutedTextColor) {
      root.style.setProperty('--color-text-secondary', settings.mutedTextColor);
      root.style.setProperty('--color-muted-foreground', settings.mutedTextColor);
    }
    
    if (settings.borderColor) {
      root.style.setProperty('--color-border', settings.borderColor);
    }
    
    if (settings.bgSoft) {
      root.style.setProperty('--color-muted', settings.bgSoft);
    }
  }, []);

  // Handle local settings changes with live preview
  const handleSettingsChange = useCallback((newSettings) => {
    const updatedSettings = { ...localSettings, ...newSettings };
    setLocalSettings(updatedSettings);
    setHasUnsavedChanges(true);
    
    // Apply changes immediately for live preview
    applyThemeToDocument(updatedSettings);
  }, [localSettings, applyThemeToDocument]);

  // Save changes to server
  const handleSaveChanges = async () => {
    try {
      await updateSettingsMutation.mutateAsync(localSettings);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save branding settings:', error);
      // Restore original settings on error
      if (brandingSettings) {
        setLocalSettings(brandingSettings);
        applyThemeToDocument(brandingSettings);
      }
    }
  };

  // Reset to original settings
  const handleResetChanges = () => {
    if (brandingSettings) {
      setLocalSettings(brandingSettings);
      applyThemeToDocument(brandingSettings);
      setHasUnsavedChanges(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (file) => {
    try {
      const result = await uploadLogoMutation.mutateAsync(file);
      if (result?.logoUrl) {
        handleSettingsChange({ logoUrl: result.logoUrl });
      }
    } catch (error) {
      console.error('Failed to upload logo:', error);
    }
  };

  // Handle logo deletion
  const handleLogoDelete = async () => {
    try {
      await deleteLogoMutation.mutateAsync();
      handleSettingsChange({ logoUrl: null });
    } catch (error) {
      console.error('Failed to delete logo:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="loader-2" className="animate-spin w-8 h-8 mb-4 mx-auto text-accent" />
          <p className="text-muted-foreground">Loading branding settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <ProfessionalSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
        notificationCounts={notificationCounts}
      />
      
      <main className={`flex-1 overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Brand Customization
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customize your company's brand identity and visual appearance
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <NotificationCenter counts={notificationCounts} />
            
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetChanges}
                  disabled={updateSettingsMutation.isLoading}
                >
                  <Icon name="undo-2" className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={updateSettingsMutation.isLoading}
                >
                  <Icon name="save" className="w-4 h-4 mr-1" />
                  {updateSettingsMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Logo & Brand Identity */}
              <div className="lg:col-span-1">
                <LogoManager
                  logoUrl={localSettings.logoUrl}
                  appName={localSettings.appName || 'FireLynx'}
                  onLogoUpload={handleLogoUpload}
                  onLogoDelete={handleLogoDelete}
                  onAppNameChange={(appName) => handleSettingsChange({ appName })}
                  isUploading={uploadLogoMutation.isLoading}
                  isDeleting={deleteLogoMutation.isLoading}
                />
              </div>

              {/* Color Customization */}
              <div className="lg:col-span-1">
                <ColorCustomizer
                  settings={localSettings}
                  onChange={handleSettingsChange}
                />
              </div>

              {/* Live Preview */}
              <div className="lg:col-span-1">
                <ThemePreview
                  settings={localSettings}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrandingManagement;