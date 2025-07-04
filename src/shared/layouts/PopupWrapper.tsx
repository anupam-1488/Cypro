/**
 * Enhanced Popup Wrapper with DEBUG LOGGING
 * @module @voilajsx/comet
 * @file src/shared/layouts/PopupWrapper.tsx
 */

import React, { useState, useEffect } from 'react';
import { PopupLayout } from '@voilajsx/uikit/popup';
import { Switch } from '@voilajsx/uikit/switch';
import { Button } from '@voilajsx/uikit/button';
import { Settings, AlertTriangle, Loader2 } from 'lucide-react';

// Import platform APIs and hooks
import { storage } from '@voilajsx/comet/storage';
import useModuleDiscovery from '../hooks/useModuleDiscovery';

// Import shared components
import ExtensionLogo from '../components/ExtensionLogo';
import TabNavigation from '../components/TabNavigation';

// Debug logging function
function debugLog(level, message, data = null) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  const prefix = `[Popup Debug ${timestamp}]`;
  
  if (data) {
    console[level](`${prefix} ${message}`, data);
  } else {
    console[level](`${prefix} ${message}`);
  }
}

/**
 * Auto-discovery popup wrapper with debug logging
 */
export default function PopupWrapper({
  extensionName,
  extensionIcon,
  size = 'lg',
  variant = 'default',
  className = '',
  customLogo,
  customActions,
  footerContent,
  onSettingsClick,
  onExtensionToggle
}) {
  debugLog('info', '🚀 PopupWrapper initializing');
  
  const [activeTab, setActiveTab] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [appConfig, setAppConfig] = useState({
    appName: 'Comet Extension',
    appIcon: 'Zap',
    popupOverrideLogoText: ''
  });
  const [initializationError, setInitializationError] = useState(null);
  
  // Auto-discover modules and generate tabs
  const { 
    popupTabs, 
    loading, 
    currentTab, 
    extensionEnabled 
  } = useModuleDiscovery();

  debugLog('info', '📊 Module discovery state:', {
    popupTabsCount: popupTabs.length,
    loading,
    currentTab: currentTab?.url,
    extensionEnabled
  });

  // Initialize popup state and load configurations
  useEffect(() => {
    debugLog('info', '🔄 Starting popup initialization');
    initializePopup();
  }, [popupTabs]);

  const initializePopup = async () => {
    try {
      debugLog('info', '📚 Loading extension state and configuration');
      
      // Load extension state
      debugLog('info', '🔍 Loading extension enabled state');
      const enabled = await storage.get('extensionEnabled', true);
      setIsEnabled(enabled);
      debugLog('info', `✅ Extension enabled: ${enabled}`);

      // Load general app configuration from storage
      debugLog('info', '🔍 Loading app configuration');
      const appName = await storage.get('app-name', 'Comet Extension');
      const appIcon = await storage.get('app-icon', 'Zap');
      const popupOverrideLogoText = await storage.get('popup-logoOverrideText', 'Cyepro AI'); 

      debugLog('info', '✅ App configuration loaded:', { appName, appIcon, popupOverrideLogoText });

      // Update app config state
      setAppConfig({ 
        appName, 
        appIcon, 
        popupOverrideLogoText 
      });

      // Set first available tab as default if no active tab or it's invalid
      if (popupTabs.length > 0) {
        debugLog('info', `📑 Setting up tabs (${popupTabs.length} available)`);
        debugLog('info', 'Available tabs:', popupTabs.map(tab => ({ id: tab.id, label: tab.label })));
        
        const savedTab = await storage.get('popup.activeTab', popupTabs[0].id);
        const validTab = popupTabs.find(tab => tab.id === savedTab);
        const finalTab = validTab ? savedTab : popupTabs[0].id;
        
        setActiveTab(finalTab);
        debugLog('info', `✅ Active tab set to: ${finalTab}`);
      } else {
        debugLog('warn', '⚠️ No popup tabs available');
      }
      
      debugLog('info', '✅ Popup initialization complete');
      
    } catch (error) {
      debugLog('error', '❌ Popup initialization failed:', error);
      setInitializationError(error.message);
      
      // Fallback to default config on error
      setAppConfig({
        appName: 'Comet Extension',
        appIcon: 'Zap',
        popupOverrideLogoText: 'Cyepro AI'
      });
      setIsEnabled(true);
      setActiveTab('');
    }
  };

  // Handle extension toggle
  const handleToggleEnabled = async (enabled) => {
    debugLog('info', `🔄 Toggling extension enabled state to: ${enabled}`);
    
    setIsEnabled(enabled);
    try {
      await storage.set('extensionEnabled', enabled);
      debugLog('info', `✅ Extension enabled state saved: ${enabled}`);
      onExtensionToggle?.(enabled);
    } catch (error) {
      debugLog('error', '❌ Failed to save extension enabled state:', error);
    }
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    debugLog('info', `🔄 Changing active tab to: ${tabId}`);
    
    setActiveTab(tabId);
    try {
      storage.set('popup.activeTab', tabId);
      debugLog('info', `✅ Active tab saved: ${tabId}`);
    } catch (error) {
      debugLog('error', '❌ Failed to save active tab:', error);
    }
  };

  // Handle settings click
  const handleSettingsClick = () => {
    debugLog('info', '⚙️ Settings button clicked');
    
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // Cross-platform options page opening
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
        debugLog('info', '🌐 Opening options page via Chrome API');
        chrome.runtime.openOptionsPage();
      } else if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.openOptionsPage) {
        debugLog('info', '🌐 Opening options page via Browser API');
        browser.runtime.openOptionsPage();
      } else {
        debugLog('warn', '⚠️ Options page API not available');
      }
    }
  };

  // Generate logo using the new priority logic
  const logo = customLogo || (() => {
    debugLog('info', '🎨 Generating logo component');
    
    let logoComponentProps = { size: 'md' };

    // Priority 1: `extensionName` prop passed to PopupWrapper (acts as an immediate override)
    if (extensionName) {
      logoComponentProps.overrideName = extensionName;
      debugLog('info', `📝 Using extensionName prop: ${extensionName}`);
    } 
    // Priority 2: `popupOverrideLogoText` from storage (acts as an override)
    else if (typeof appConfig.popupOverrideLogoText === 'string' && appConfig.popupOverrideLogoText.length > 0) {
      logoComponentProps.overrideName = appConfig.popupOverrideLogoText;
      debugLog('info', `📝 Using popup override text: ${appConfig.popupOverrideLogoText}`);
    } 
    // Priority 3: Fallback to general app name from storage
    else {
      logoComponentProps.name = appConfig.appName;
      debugLog('info', `📝 Using app name: ${appConfig.appName}`);
    }

    // Determine the icon for the logo
    if (extensionIcon) {
      logoComponentProps.icon = extensionIcon;
      debugLog('info', `🎨 Using extensionIcon prop: ${extensionIcon}`);
    } else if (logoComponentProps.overrideName) { 
      logoComponentProps.icon = undefined; 
      debugLog('info', '🎨 No icon (override name mode)');
    } else {
      logoComponentProps.icon = appConfig.appIcon;
      debugLog('info', `🎨 Using app icon: ${appConfig.appIcon}`);
    }

    debugLog('info', '✅ Logo component props:', logoComponentProps);
    return <ExtensionLogo {...logoComponentProps} />;
  })();

  // Generate header actions
  const headerActions = customActions || (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSettingsClick}
        className="h-6 w-6 p-0 text-muted-foreground  "
      >
        <Settings className="h-4 w-4" />
      </Button>
      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggleEnabled}
      />
    </div>
  );

  // Loading state
  if (loading) {
    debugLog('info', '⏳ Rendering loading state');
    
    return (
      <PopupLayout 
        size={size} 
        variant={variant} 
        className={`border-0 ${className}`}
        logo={logo}
        headerActions={headerActions}
        footer={footerContent}
      >
        <div className="p-8 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <div className="text-sm">Loading...</div>
        </div>
      </PopupLayout>
    );
  }

  // Initialization error state
  if (initializationError) {
    debugLog('error', '❌ Rendering error state');
    
    return (
      <PopupLayout 
        size={size} 
        variant={variant} 
        className={`border-0 ${className}`}
        logo={logo}
        headerActions={headerActions}
        footer={footerContent}
      >
        <div className="p-8 text-center text-muted-foreground">
          <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-destructive" />
          <div className="text-sm">Initialization Error</div>
          <div className="text-xs mt-1 text-destructive">{initializationError}</div>
        </div>
      </PopupLayout>
    );
  }

  // Extension disabled state
  if (!isEnabled) {
    debugLog('info', '🚫 Rendering disabled state');
    
    return (
      <PopupLayout 
        size={size} 
        variant={variant} 
        className={`border-0 ${className}`}
        logo={logo}
        headerActions={headerActions}
        footer={footerContent}
      >
        <div className="p-8 text-center text-muted-foreground">
          <div className="text-sm">Extension is disabled</div>
          <div className="text-xs mt-1">Toggle above to enable</div>
        </div>
      </PopupLayout>
    );
  }

  // No features available
  if (popupTabs.length === 0) {
    debugLog('warn', '⚠️ Rendering no features state');
    
    return (
      <PopupLayout 
        size={size} 
        variant={variant} 
        className={`border-0 ${className}`}
        logo={logo}
        headerActions={headerActions}
        footer={footerContent}
      >
        <div className="p-8 text-center text-muted-foreground">
          <div className="text-sm">No features available</div>
          <div className="text-xs mt-1">Check settings or current page</div>
        </div>
      </PopupLayout>
    );
  }

  // Main popup interface with auto-discovered tabs
  debugLog('info', '✅ Rendering main popup interface');
  debugLog('info', `📑 Active tab: ${activeTab}`);
  debugLog('info', `📊 Total tabs: ${popupTabs.length}`);
  
  return (
    <PopupLayout
      variant={variant}
      size={size}
      className={`border-0 rounded-none ${className}`}
      logo={logo}
      headerActions={headerActions}
      footer={footerContent}
      scrollable={true}
    >
      <TabNavigation
        tabs={popupTabs}
        defaultTab={activeTab}
        onTabChange={handleTabChange}
      />
    </PopupLayout>
  );
}