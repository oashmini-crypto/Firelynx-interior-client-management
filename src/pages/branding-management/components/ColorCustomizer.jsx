import React from 'react';
import Icon from '../../../components/AppIcon';

const ColorCustomizer = ({ settings, onChange }) => {
  const colorOptions = [
    {
      key: 'accentColor',
      label: 'Accent Color',
      description: 'Primary brand color for buttons and highlights',
      icon: 'palette',
      defaultValue: '#4C6FFF'
    },
    {
      key: 'primaryTextColor',
      label: 'Primary Text',
      description: 'Main text color for headings and content',
      icon: 'type',
      defaultValue: '#0F172A'
    },
    {
      key: 'mutedTextColor',
      label: 'Secondary Text',
      description: 'Muted text color for descriptions and labels',
      icon: 'type',
      defaultValue: '#64748B'
    },
    {
      key: 'borderColor',
      label: 'Border Color',
      description: 'Color for borders and dividers',
      icon: 'square',
      defaultValue: '#E2E8F0'
    },
    {
      key: 'bgSoft',
      label: 'Soft Background',
      description: 'Light background color for cards and sections',
      icon: 'square',
      defaultValue: '#F8FAFC'
    }
  ];

  const handleColorChange = (key, color) => {
    onChange({ [key]: color });
  };

  const presetThemes = [
    {
      name: 'Default Blue',
      colors: {
        accentColor: '#4C6FFF',
        primaryTextColor: '#0F172A',
        mutedTextColor: '#64748B',
        borderColor: '#E2E8F0',
        bgSoft: '#F8FAFC'
      }
    },
    {
      name: 'Forest Green',
      colors: {
        accentColor: '#059669',
        primaryTextColor: '#064E3B',
        mutedTextColor: '#6B7280',
        borderColor: '#D1FAE5',
        bgSoft: '#F0FDF4'
      }
    },
    {
      name: 'Purple Pro',
      colors: {
        accentColor: '#7C3AED',
        primaryTextColor: '#1F2937',
        mutedTextColor: '#6B7280',
        borderColor: '#E5E7EB',
        bgSoft: '#F9FAFB'
      }
    },
    {
      name: 'Orange Energy',
      colors: {
        accentColor: '#EA580C',
        primaryTextColor: '#1F2937',
        mutedTextColor: '#6B7280',
        borderColor: '#FED7AA',
        bgSoft: '#FFF7ED'
      }
    }
  ];

  const applyPresetTheme = (theme) => {
    onChange(theme.colors);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center mb-6">
        <Icon name="palette" className="w-5 h-5 text-accent mr-2" />
        <h3 className="text-lg font-semibold text-foreground">Color Customization</h3>
      </div>

      {/* Preset Themes */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Quick Themes</h4>
        <div className="grid grid-cols-2 gap-2">
          {presetThemes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => applyPresetTheme(theme)}
              className="flex items-center p-2 rounded-md border border-border hover:bg-muted transition-colors text-left"
            >
              <div className="flex space-x-1 mr-2">
                <div 
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: theme.colors.accentColor }}
                />
                <div 
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: theme.colors.primaryTextColor }}
                />
              </div>
              <span className="text-xs font-medium text-foreground">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Individual Color Controls */}
      <div className="space-y-4">
        {colorOptions.map((option) => (
          <div key={option.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon name={option.icon} className="w-4 h-4 text-muted-foreground mr-2" />
                <label className="text-sm font-medium text-foreground">
                  {option.label}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded border border-border"
                  style={{ 
                    backgroundColor: settings[option.key] || option.defaultValue 
                  }}
                />
                <input
                  type="color"
                  value={settings[option.key] || option.defaultValue}
                  onChange={(e) => handleColorChange(option.key, e.target.value)}
                  className="w-8 h-8 rounded border border-border cursor-pointer"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              {option.description}
            </p>
            <div className="flex items-center pl-6">
              <input
                type="text"
                value={settings[option.key] || option.defaultValue}
                onChange={(e) => handleColorChange(option.key, e.target.value)}
                className="text-xs font-mono bg-muted border border-border rounded px-2 py-1 w-20"
                placeholder={option.defaultValue}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Font Family */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center mb-3">
          <Icon name="font-family" className="w-4 h-4 text-muted-foreground mr-2" />
          <label className="text-sm font-medium text-foreground">Font Family</label>
        </div>
        <select
          value={settings.fontFamily || 'Inter, system-ui, Roboto, Helvetica, Arial'}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="Inter, system-ui, Roboto, Helvetica, Arial">Inter (Default)</option>
          <option value="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto">System UI</option>
          <option value="Georgia, Times, serif">Georgia</option>
          <option value="Helvetica, Arial, sans-serif">Helvetica</option>
          <option value="Monaco, Consolas, monospace">Monospace</option>
        </select>
      </div>
    </div>
  );
};

export default ColorCustomizer;