// features/profile/index.ts
import type { ModuleConfig } from '@/featuretypes';

const config: ModuleConfig = {
  name: 'profile',

  ui: {
    popup: {
      tab: {
        label: 'Profile',
        icon: 'User',
        order: 3,
        requiresTab: true,
      },
      component: () => import('./components/PopupTab'),
    },
    options: {
      panel: {
        label: 'Profile Settings',
        icon: 'Shield',
        section: 'account',
        order: 1,
      },
      component: () => import('./components/OptionsPanel'),
    },
  },

  handlers: {
    /**
     * GET USER PROFILE DATA
     * Retrieves current user profile information
     */
    getUserProfile: async () => {
      try {
        console.log('[Profile] Getting user profile...');
        
        // This would typically interact with content scripts to get user data
        // For now, we'll return basic info that can be used by other features
        return {
          success: true,
          profile: {
            isAuthenticated: true,
            userId: 'current-user-id',
            email: 'user@example.com',
            name: 'Current User'
          }
        };
      } catch (error) {
        console.error('[Profile] Error getting user profile:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },

    /**
     * SYNC USER DATA
     * Synchronizes user data across the extension
     */
    syncUserData: async (data: { userId: string; profileData: any }) => {
      try {
        const { userId, profileData } = data;
        
        console.log('[Profile] Syncing user data for:', userId);
        
        // Store user data in local storage for other features to access
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('user_profile', JSON.stringify({
            userId,
            profileData,
            timestamp: Date.now()
          }));
        }
        
        // Broadcast user data change to other parts of the extension (throttled)
        if (typeof window !== 'undefined' && window.postMessage) {
          // Prevent message spam by checking if we recently sent an update
          const lastUpdate = window.lastProfileUpdate || 0;
          const now = Date.now();
          
          if (now - lastUpdate > 1000) { // Only send updates once per second
            window.lastProfileUpdate = now;
            window.postMessage({
              type: 'USER_PROFILE_UPDATED',
              data: { userId, profileData },
              timestamp: now
            }, '*');
          }
        }
        
        return {
          success: true,
          message: 'User data synchronized successfully'
        };
      } catch (error) {
        console.error('[Profile] Error syncing user data:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },

    /**
     * VALIDATE USER SESSION
     * Checks if the current user session is valid
     */
    validateUserSession: async () => {
      try {
        console.log('[Profile] Validating user session...');
        
        // This would check with Supabase or other auth provider
        // For now, we'll do a basic validation
        
        let isValid = false;
        let userInfo = null;
        
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = window.localStorage.getItem('user_profile');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const ageMinutes = (Date.now() - parsed.timestamp) / (1000 * 60);
              
              // Consider session valid if less than 24 hours old
              if (ageMinutes < 24 * 60) {
                isValid = true;
                userInfo = parsed.profileData;
              }
            } catch (parseError) {
              console.error('[Profile] Error parsing stored profile:', parseError);
              // Clear invalid data
              window.localStorage.removeItem('user_profile');
            }
          }
        }
        
        return {
          success: true,
          isValid,
          userInfo,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('[Profile] Error validating session:', error);
        return {
          success: false,
          error: error.message,
          isValid: false
        };
      }
    },

    /**
     * EXPORT USER DATA
     * Exports user data for backup or migration
     */
    exportUserData: async () => {
      try {
        console.log('[Profile] Exporting user data...');
        
        const exportData = {
          profile: {},
          preferences: {},
          timestamp: Date.now(),
          version: '1.0'
        };
        
        // Get profile data from localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = window.localStorage.getItem('user_profile');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              exportData.profile = parsed.profileData || {};
            } catch (parseError) {
              console.error('[Profile] Error parsing profile for export:', parseError);
            }
          }
          
          // Get other user preferences
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key && key.startsWith('user_pref_')) {
              exportData.preferences[key] = window.localStorage.getItem(key);
            }
          }
        }
        
        console.log('[Profile] Export completed, data size:', Object.keys(exportData.profile).length + Object.keys(exportData.preferences).length);
        
        return {
          success: true,
          data: exportData,
          filename: `user_profile_export_${Date.now()}.json`
        };
      } catch (error) {
        console.error('[Profile] Error exporting user data:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },

    /**
     * IMPORT USER DATA
     * Imports user data from backup
     */
    importUserData: async (data: { importData: any }) => {
      try {
        const { importData } = data;
        
        console.log('[Profile] Importing user data...');
        
        if (!importData || typeof importData !== 'object') {
          return {
            success: false,
            error: 'Invalid import data format'
          };
        }
        
        let importedCount = 0;
        
        if (typeof window !== 'undefined' && window.localStorage) {
          // Import profile data
          if (importData.profile) {
            window.localStorage.setItem('user_profile', JSON.stringify({
              userId: 'imported-user',
              profileData: importData.profile,
              timestamp: Date.now()
            }));
            importedCount++;
          }
          
          // Import preferences
          if (importData.preferences) {
            Object.entries(importData.preferences).forEach(([key, value]) => {
              if (key.startsWith('user_pref_') && typeof value === 'string') {
                window.localStorage.setItem(key, value);
                importedCount++;
              }
            });
          }
        }
        
        console.log('[Profile] Import completed, items imported:', importedCount);
        
        return {
          success: true,
          importedCount,
          message: `Successfully imported ${importedCount} items`
        };
      } catch (error) {
        console.error('[Profile] Error importing user data:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },

    /**
     * CLEAR USER DATA
     * Clears all user data (for logout or reset)
     */
    clearUserData: async () => {
      try {
        console.log('[Profile] Clearing user data...');
        
        let clearedCount = 0;
        
        if (typeof window !== 'undefined' && window.localStorage) {
          // Clear profile data
          if (window.localStorage.getItem('user_profile')) {
            window.localStorage.removeItem('user_profile');
            clearedCount++;
          }
          
          // Clear user preferences and supabase data
          const keysToRemove = [];
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key && (key.startsWith('user_pref_') || key.startsWith('supabase_'))) {
              keysToRemove.push(key);
            }
          }
          
          keysToRemove.forEach(key => {
            window.localStorage.removeItem(key);
            clearedCount++;
          });
        }
        
        // Clear any cached values
        if (typeof window !== 'undefined') {
          window.lastProfileUpdate = 0;
        }
        
        // Broadcast data clear event (only once)
        if (typeof window !== 'undefined' && window.postMessage) {
          window.postMessage({
            type: 'USER_DATA_CLEARED',
            data: { clearedCount },
            timestamp: Date.now()
          }, '*');
        }
        
        console.log('[Profile] Clear completed, items cleared:', clearedCount);
        
        return {
          success: true,
          clearedCount,
          message: `Cleared ${clearedCount} items`
        };
      } catch (error) {
        console.error('[Profile] Error clearing user data:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  },

  init: () => {
    console.log('[Profile] Feature initializing...');
    
    // Prevent multiple listeners by checking if already initialized
    if (typeof window !== 'undefined') {
      if (window.profileListenerAdded) {
        console.log('[Profile] Already initialized, skipping...');
        return;
      }
      
      window.profileListenerAdded = true;
      console.log('[Profile] Setting up message listener...');
      
      // Set up message listeners for cross-feature communication
      const messageHandler = (event: MessageEvent) => {
        // Only handle our own messages to prevent loops
        if (!event.data || typeof event.data !== 'object') return;
        
        const { type, requestId } = event.data;
        
        if (type === 'REQUEST_USER_PROFILE') {
          console.log('[Profile] Profile requested, origin:', event.origin, 'requestId:', requestId);
          
          // Throttle responses to prevent spam
          const lastResponse = window.lastProfileResponse || 0;
          const now = Date.now();
          
          if (now - lastResponse > 500) { // Only respond once per 500ms
            window.lastProfileResponse = now;
            
            // Respond with current user profile if available
            const stored = window.localStorage?.getItem('user_profile');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                window.postMessage({
                  type: 'USER_PROFILE_RESPONSE',
                  data: parsed,
                  requestId,
                  timestamp: now
                }, '*');
                console.log('[Profile] Profile response sent');
              } catch (parseError) {
                console.error('[Profile] Error parsing stored profile for response:', parseError);
              }
            } else {
              console.log('[Profile] No stored profile to respond with');
            }
          } else {
            console.log('[Profile] Response throttled');
          }
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Store reference for cleanup if needed
      window.profileMessageHandler = messageHandler;
      
      console.log('[Profile] Message listener setup complete');
    }
    
    console.log('[Profile] Feature loaded successfully');
  },

  // Optional cleanup function
  cleanup: () => {
    console.log('[Profile] Cleaning up...');
    
    if (typeof window !== 'undefined') {
      if (window.profileMessageHandler) {
        window.removeEventListener('message', window.profileMessageHandler);
        delete window.profileMessageHandler;
      }
      
      window.profileListenerAdded = false;
      window.lastProfileUpdate = 0;
      window.lastProfileResponse = 0;
    }
    
    console.log('[Profile] Cleanup complete');
  }
};

export default config;