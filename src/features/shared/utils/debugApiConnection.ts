// features/shared/utils/debugApiConnection.ts
/**
 * Debug helper for API connection issues
 */

export const debugApiConnection = () => {
  console.log('=== API CONNECTION DEBUG ===');
  
  // Check localStorage for tokens
  const supabaseToken = localStorage.getItem('supabase.auth.token');
  const appKitToken = localStorage.getItem('cyepro_appkit_token');
  const appKitSettings = localStorage.getItem('appkit_settings');
  
  console.log('1. Supabase Token:', supabaseToken ? 'EXISTS' : 'MISSING');
  console.log('2. AppKit Token:', appKitToken ? 'EXISTS' : 'MISSING');
  console.log('3. AppKit Settings:', appKitSettings ? 'EXISTS' : 'MISSING');
  
  if (appKitToken) {
    try {
      const tokenData = JSON.parse(appKitToken);
      console.log('4. AppKit Token Data:', {
        hasToken: !!tokenData.token,
        storedAt: tokenData.storedAt,
        expiresAt: tokenData.expires_at,
        isExpired: tokenData.expires_at ? new Date(tokenData.expires_at) <= new Date() : 'No expiration'
      });
      
      // Show first/last few characters of token for verification
      if (tokenData.token) {
        const token = tokenData.token;
        console.log('5. Token Preview:', `${token.substring(0, 10)}...${token.substring(token.length - 10)}`);
      }
    } catch (error) {
      console.error('4. Error parsing AppKit token:', error);
    }
  }
  
  if (appKitSettings) {
    try {
      const settings = JSON.parse(appKitSettings);
      console.log('6. API Settings:', settings);
    } catch (error) {
      console.error('6. Error parsing AppKit settings:', error);
    }
  }
  
  // Check API configuration
  console.log('7. Current window.location:', window.location.href);
  console.log('8. Extension context:', typeof chrome !== 'undefined' ? 'EXTENSION' : 'WEB');
  
  console.log('=== END DEBUG ===');
};

// Make it available globally for easy debugging
if (typeof window !== 'undefined') {
  (window as any).debugApiConnection = debugApiConnection;
}

export default debugApiConnection;