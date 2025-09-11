import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ThemePreview = ({ settings }) => {
  const [previewType, setPreviewType] = useState('interface');

  const previewTypes = [
    { key: 'interface', label: 'Interface', icon: 'layout-dashboard' },
    { key: 'invoice', label: 'Invoice', icon: 'file-text' },
    { key: 'variation', label: 'Variation', icon: 'file-edit' }
  ];

  const InterfacePreview = () => (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {settings.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              className="h-6 object-contain"
            />
          ) : (
            <div 
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: settings.accentColor || '#4C6FFF' }}
            >
              {(settings.appName || 'FL')[0]}
            </div>
          )}
          <span 
            className="font-semibold text-sm"
            style={{ color: settings.primaryTextColor || '#0F172A' }}
          >
            {settings.appName || 'FireLynx'}
          </span>
        </div>
        <div className="flex space-x-2">
          <div className="w-6 h-6 rounded bg-muted"></div>
          <div className="w-6 h-6 rounded bg-muted"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Sample Button */}
        <Button 
          size="sm" 
          style={{ 
            backgroundColor: settings.accentColor || '#4C6FFF',
            borderColor: settings.accentColor || '#4C6FFF'
          }}
        >
          <Icon name="plus" className="w-4 h-4 mr-1" />
          Primary Action
        </Button>

        {/* Sample Card */}
        <div 
          className="rounded-lg border p-3"
          style={{ 
            borderColor: settings.borderColor || '#E2E8F0',
            backgroundColor: settings.bgSoft || '#F8FAFC'
          }}
        >
          <h4 
            className="font-medium text-sm mb-1"
            style={{ color: settings.primaryTextColor || '#0F172A' }}
          >
            Sample Card Title
          </h4>
          <p 
            className="text-xs"
            style={{ color: settings.mutedTextColor || '#64748B' }}
          >
            This is how your muted text will appear in cards and descriptions.
          </p>
        </div>

        {/* Sample List */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="flex items-center justify-between py-2 border-b"
              style={{ borderColor: settings.borderColor || '#E2E8F0' }}
            >
              <span 
                className="text-sm"
                style={{ color: settings.primaryTextColor || '#0F172A' }}
              >
                Sample Item {i}
              </span>
              <span 
                className="text-xs"
                style={{ color: settings.mutedTextColor || '#64748B' }}
              >
                Status
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DocumentPreview = ({ type }) => (
    <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
      {/* Document Header */}
      <div className="bg-white px-6 py-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt="Company Logo" 
                className="h-8 object-contain"
              />
            ) : (
              <div 
                className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: settings.accentColor || '#4C6FFF' }}
              >
                {(settings.appName || 'FL')[0]}
              </div>
            )}
            <div>
              <h3 
                className="font-semibold text-lg"
                style={{ color: settings.primaryTextColor || '#0F172A' }}
              >
                {settings.appName || 'FireLynx'}
              </h3>
              <p 
                className="text-xs"
                style={{ color: settings.mutedTextColor || '#64748B' }}
              >
                Interior Design Studio
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 
              className="text-xl font-bold"
              style={{ color: settings.accentColor || '#4C6FFF' }}
            >
              {type === 'invoice' ? 'INVOICE' : 'VARIATION REQUEST'}
            </h2>
            <p 
              className="text-sm"
              style={{ color: settings.mutedTextColor || '#64748B' }}
            >
              #{type === 'invoice' ? 'INV-2025-001' : 'VR-2025-001'}
            </p>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="px-6 py-4 space-y-4">
        {type === 'invoice' ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 
                  className="font-medium mb-1"
                  style={{ color: settings.primaryTextColor || '#0F172A' }}
                >
                  Bill To:
                </h4>
                <p style={{ color: settings.mutedTextColor || '#64748B' }}>
                  Client Name<br />
                  123 Main Street<br />
                  City, State 12345
                </p>
              </div>
              <div>
                <h4 
                  className="font-medium mb-1"
                  style={{ color: settings.primaryTextColor || '#0F172A' }}
                >
                  Invoice Date:
                </h4>
                <p style={{ color: settings.mutedTextColor || '#64748B' }}>
                  September 11, 2025
                </p>
              </div>
            </div>

            <div className="border-t pt-4" style={{ borderColor: settings.borderColor || '#E2E8F0' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: settings.borderColor || '#E2E8F0' }}>
                    <th 
                      className="text-left py-2 font-medium"
                      style={{ color: settings.primaryTextColor || '#0F172A' }}
                    >
                      Description
                    </th>
                    <th 
                      className="text-right py-2 font-medium"
                      style={{ color: settings.primaryTextColor || '#0F172A' }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td 
                      className="py-2"
                      style={{ color: settings.mutedTextColor || '#64748B' }}
                    >
                      Design Consultation
                    </td>
                    <td 
                      className="text-right py-2"
                      style={{ color: settings.mutedTextColor || '#64748B' }}
                    >
                      $2,500.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3 text-sm">
              <div>
                <h4 
                  className="font-medium mb-1"
                  style={{ color: settings.primaryTextColor || '#0F172A' }}
                >
                  Change Request:
                </h4>
                <p style={{ color: settings.mutedTextColor || '#64748B' }}>
                  Living Room Enhancement Request
                </p>
              </div>
              <div>
                <h4 
                  className="font-medium mb-1"
                  style={{ color: settings.primaryTextColor || '#0F172A' }}
                >
                  Description:
                </h4>
                <p style={{ color: settings.mutedTextColor || '#64748B' }}>
                  Add custom built-in entertainment center with integrated lighting
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center mb-6">
        <Icon name="eye" className="w-5 h-5 text-accent mr-2" />
        <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
      </div>

      {/* Preview Type Selector */}
      <div className="flex space-x-2 mb-4">
        {previewTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setPreviewType(type.key)}
            className={`
              flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors
              ${previewType === type.key
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            <Icon name={type.icon} className="w-3 h-3 mr-1" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Preview Content */}
      <div className="min-h-[400px]">
        {previewType === 'interface' ? (
          <InterfacePreview />
        ) : (
          <DocumentPreview type={previewType} />
        )}
      </div>

      {/* Preview Note */}
      <div className="mt-4 p-3 bg-muted/30 rounded-md">
        <p className="text-xs text-muted-foreground">
          <Icon name="info" className="w-3 h-3 inline mr-1" />
          Changes are applied in real-time. Save your settings to make them permanent.
        </p>
      </div>
    </div>
  );
};

export default ThemePreview;