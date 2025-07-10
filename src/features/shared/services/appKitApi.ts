// features/shared/services/appKitApi.ts
/**
 * Real AppKit API Service - Customer Management Integration
 * Integrates with the actual customer management API
 */

import { 
  getApiConfig, 
  validateApiConfig, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  SEARCH_CONFIG,
  VALIDATION_RULES 
} from '../config/apiConfig';

interface SearchResponse {
  success: boolean;
  data?: any[];
  error?: string;
  total?: number;
  page?: number;
  hasMore?: boolean;
  message?: string;
  timestamp?: string;
  feature?: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  custom_fields?: Record<string, any>;
  scope?: 'own' | 'tenant' | 'org';
  tenant_id?: string;
  created_by?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

class AppKitApi {
  private config: ApiConfig;

  constructor() {
    // Load configuration from constants
    const apiConfig = getApiConfig();
    this.config = {
      baseUrl: apiConfig.BASE_URL,
      timeout: apiConfig.TIMEOUT,
    };
    
    // Also try to load from localStorage (for user overrides)
    this.loadSettings();
  }

  private loadSettings() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('appkit_settings');
        if (stored) {
          const settings = JSON.parse(stored);
          // Override with user settings if available
          if (settings.baseUrl) {
            this.config.baseUrl = settings.baseUrl;
          }
          if (settings.timeout) {
            this.config.timeout = settings.timeout;
          }
        }
      }
    } catch (error) {
      console.warn('[AppKitApi] Error loading settings:', error);
    }
  }

  /**
   * Get AppKit authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    try {
      const tokenData = this.getStoredAppKitToken();
      if (!tokenData || !tokenData.token) {
        throw new Error('No valid AppKit token available');
      }

      return {
        'Authorization': `Bearer ${tokenData.token}`,
        'Content-Type': 'application/json',
        'X-Client-Info': 'browser-extension'
      };
    } catch (error) {
      console.error('[AppKitApi] Error getting auth headers:', error);
      throw new Error('Authentication required');
    }
  }

  /**
   * Get stored AppKit token
   */
  private getStoredAppKitToken(): any {
    try {
      if (typeof window === 'undefined') {
        console.warn('[AppKitApi] No window object available');
        return null;
      }
      
      const stored = window.localStorage.getItem('cyepro_appkit_token');
      console.log('[AppKitApi] Token lookup - exists:', !!stored);
      
      if (!stored) {
        console.log('[AppKitApi] No token found in localStorage');
        return null;
      }
      
      const tokenInfo = JSON.parse(stored);
      console.log('[AppKitApi] Token info:', {
        hasToken: !!tokenInfo.token,
        hasExpiration: !!tokenInfo.expires_at,
        storedAt: tokenInfo.storedAt
      });
      
      // Check if token has expired
      if (tokenInfo.expires_at) {
        const expiresAt = new Date(tokenInfo.expires_at);
        const now = new Date();
        if (expiresAt <= now) {
          console.log('[AppKitApi] Stored token has expired:', expiresAt, 'vs', now);
          this.clearAppKitToken();
          return null;
        }
      }
      
      return tokenInfo;
    } catch (error) {
      console.error('[AppKitApi] Error getting stored token:', error);
      return null;
    }
  }

  /**
   * Clear AppKit token
   */
  private clearAppKitToken() {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('cyepro_appkit_token');
        console.log('[AppKitApi] Token cleared');
      }
    } catch (error) {
      console.error('[AppKitApi] Error clearing token:', error);
    }
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<SearchResponse> {
    try {
      if (!this.config.baseUrl) {
        console.error('[AppKitApi] No base URL configured');
        return {
          success: false,
          error: 'API base URL not configured. Please check your settings.'
        };
      }

      if (this.config.baseUrl === 'https://your-api-domain.com') {
        console.error('[AppKitApi] Base URL not updated from default');
        return {
          success: false,
          error: 'API base URL still set to default. Please configure your actual API URL.'
        };
      }

      const url = `${this.config.baseUrl}${endpoint}`;
      console.log('[AppKitApi] Making request to:', url);

      let headers;
      try {
        headers = this.getAuthHeaders();
        console.log('[AppKitApi] Auth headers prepared successfully');
      } catch (authError) {
        console.error('[AppKitApi] Auth headers error:', authError);
        return {
          success: false,
          error: authError.message || 'Authentication required'
        };
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('[AppKitApi] Response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          console.error('[AppKitApi] Authentication failed - clearing token');
          this.clearAppKitToken();
          return {
            success: false,
            error: 'Authentication failed. Please login again.'
          };
        }

        if (response.status === 403) {
          return {
            success: false,
            error: 'Access denied. Insufficient permissions.'
          };
        }

        if (response.status === 429) {
          return {
            success: false,
            error: 'Rate limit exceeded. Please try again later.'
          };
        }

        let errorText = '';
        try {
          errorText = await response.text();
        } catch (textError) {
          errorText = 'Unknown error';
        }
        
        console.error('[AppKitApi] HTTP error:', response.status, errorText);
        return {
          success: false,
          error: `API request failed: ${response.status} ${response.statusText}. ${errorText}`
        };
      }

      const data = await response.json();
      console.log('[AppKitApi] Response data:', data);
      
      // Handle the API response format from documentation
      if (data.success === false) {
        return {
          success: false,
          error: data.error || data.message || 'API request failed'
        };
      }

      return {
        success: true,
        data: data.data || [],
        message: data.message,
        timestamp: data.timestamp,
        feature: data.feature
      };

    } catch (error) {
      console.error('[AppKitApi] Request error:', error);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout. Please try again.'
        };
      }

      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.'
      };
    }
  }

  /**
   * Get all customers (with role-based filtering)
   */
  async getAllCustomers(): Promise<SearchResponse> {
    console.log('[AppKitApi] Getting all customers...');
    return this.makeRequest('/api/customers');
  }

  /**
   * Search customers by query (phone, name, email)
   */
  async searchCustomers(query: string, options: {
    limit?: number;
    page?: number;
    filters?: Record<string, any>;
  } = {}): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Searching customers with query:', query);
      
      if (!query || query.trim().length < 1) {
        return {
          success: false,
          error: 'Search query is required'
        };
      }

      // First get all customers
      const allCustomersResponse = await this.getAllCustomers();
      
      if (!allCustomersResponse.success) {
        return allCustomersResponse;
      }

      const allCustomers = allCustomersResponse.data || [];
      const cleanQuery = query.trim().toLowerCase();
      
      // Filter customers based on search query
      let filteredCustomers = allCustomers;

      // Check if query looks like a phone number
      const isPhoneSearch = /^\d/.test(cleanQuery);
      
      if (isPhoneSearch) {
        // Phone number search - normalize and match
        const normalizedQuery = this.normalizePhoneNumber(cleanQuery);
        filteredCustomers = allCustomers.filter((customer: Customer) => {
          const customerPhone = this.normalizePhoneNumber(customer.phone || '');
          return customerPhone.includes(normalizedQuery) || 
                 customerPhone.startsWith(normalizedQuery) ||
                 (customer.custom_fields?.alternate_phone && 
                  this.normalizePhoneNumber(customer.custom_fields.alternate_phone).includes(normalizedQuery));
        });
      } else {
        // Text search - name, email, company
        filteredCustomers = allCustomers.filter((customer: Customer) => {
          const searchableFields = [
            customer.name,
            customer.email,
            customer.custom_fields?.company_name,
            customer.custom_fields?.occupation,
            customer.custom_fields?.city
          ].filter(Boolean).map(field => field.toLowerCase());
          
          return searchableFields.some(field => 
            field.includes(cleanQuery) || cleanQuery.includes(field)
          );
        });
      }

      // Apply pagination
      const { limit = 20, page = 1 } = options;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = filteredCustomers.slice(startIndex, endIndex);

      console.log(`[AppKitApi] Found ${filteredCustomers.length} customers, returning ${paginatedResults.length}`);

      return {
        success: true,
        data: paginatedResults,
        total: filteredCustomers.length,
        page: page,
        hasMore: endIndex < filteredCustomers.length
      };

    } catch (error) {
      console.error('[AppKitApi] Search error:', error);
      return {
        success: false,
        error: error.message || 'Search failed'
      };
    }
  }

  /**
   * Immediate search for real-time results
   */
  async searchCustomersImmediate(query: string, options: {
    limit?: number;
  } = {}): Promise<SearchResponse> {
    console.log('[AppKitApi] Immediate search for:', query);
    return this.searchCustomers(query, { ...options, page: 1 });
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(customerId: string): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Getting customer by ID:', customerId);
      return this.makeRequest(`/api/customers/${customerId}`);
    } catch (error) {
      console.error('[AppKitApi] Get customer error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get customer'
      };
    }
  }

  /**
   * Create new customer
   */
  async createCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Creating customer:', customerData.name);
      
      return this.makeRequest('/api/customers', {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    } catch (error) {
      console.error('[AppKitApi] Create customer error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create customer'
      };
    }
  }

  /**
   * Update customer data
   */
  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Updating customer:', customerId);
      
      return this.makeRequest(`/api/customers/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('[AppKitApi] Update customer error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update customer'
      };
    }
  }

  /**
   * Delete customer (soft delete)
   */
  async deleteCustomer(customerId: string): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Deleting customer:', customerId);
      
      return this.makeRequest(`/api/customers/${customerId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('[AppKitApi] Delete customer error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete customer'
      };
    }
  }

  /**
   * Normalize phone number for better searching
   */
  private normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/[^\d]/g, '');
    
    // Handle different phone number formats
    if (cleaned.length === 10) {
      return cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.slice(1); // Remove US country code
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return cleaned.slice(2); // Remove Indian country code
    }
    
    return cleaned;
  }

  /**
   * Validate customer data
   */
  validateCustomerData(data: Partial<Customer>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Name is required
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Customer name is required (min 2 characters)');
    }
    
    if (data.name && data.name.length > 255) {
      errors.push('Customer name too long (max 255 characters)');
    }
    
    // Email validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }
    
    // Phone validation
    if (data.phone) {
      const normalizedPhone = this.normalizePhoneNumber(data.phone);
      if (normalizedPhone.length < 10 || normalizedPhone.length > 12) {
        errors.push('Phone number must be 10-12 digits');
      }
    }
    
    // Scope validation
    if (data.scope && !['own', 'tenant', 'org'].includes(data.scope)) {
      errors.push('Invalid scope. Must be own, tenant, or org');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Set API configuration
   */
  setConfig(config: { baseUrl?: string; timeout?: number }) {
    if (config.baseUrl) this.config.baseUrl = config.baseUrl;
    if (config.timeout) this.config.timeout = config.timeout;
    
    // Save to storage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const currentSettings = JSON.parse(window.localStorage.getItem('appkit_settings') || '{}');
        const newSettings = {
          ...currentSettings,
          baseUrl: this.config.baseUrl
        };
        window.localStorage.setItem('appkit_settings', JSON.stringify(newSettings));
      }
    } catch (error) {
      console.warn('[AppKitApi] Error saving settings:', error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig() {
    const tokenData = this.getStoredAppKitToken();
    return {
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout,
      hasToken: !!tokenData?.token
    };
  }

  /**
   * Check if API is ready
   */
  isReady(): boolean {
    const hasValidBaseUrl = !!(this.config.baseUrl && this.config.baseUrl !== 'https://your-api-domain.com');
    const hasToken = !!this.getStoredAppKitToken()?.token;
    
    console.log('[AppKitApi] isReady check:', {
      hasValidBaseUrl,
      hasToken,
      baseUrl: this.config.baseUrl
    });
    
    return hasValidBaseUrl && hasToken;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Testing connection...');
      
      // Check configuration first
      if (!this.config.baseUrl) {
        return {
          success: false,
          error: 'API base URL not configured'
        };
      }

      if (this.config.baseUrl === 'https://your-api-domain.com') {
        return {
          success: false,
          error: 'API base URL still set to default placeholder'
        };
      }

      // Check token
      const tokenData = this.getStoredAppKitToken();
      if (!tokenData || !tokenData.token) {
        return {
          success: false,
          error: 'No authentication token available'
        };
      }

      console.log('[AppKitApi] Configuration OK, testing API endpoint...');

      // Test with a simple customers list request
      const response = await this.makeRequest('/api/customers');
      
      if (response.success) {
        console.log('[AppKitApi] Connection test successful');
        return {
          success: true,
          data: [{ 
            status: 'connected', 
            timestamp: Date.now(), 
            customers: response.data?.length || 0,
            baseUrl: this.config.baseUrl
          }],
          message: 'API connection successful'
        };
      } else {
        console.error('[AppKitApi] Connection test failed:', response.error);
        return {
          success: false,
          error: response.error || 'Connection test failed'
        };
      }
    } catch (error) {
      console.error('[AppKitApi] Connection test error:', error);
      return {
        success: false,
        error: error.message || 'Connection test failed'
      };
    }
  }
}

// Create and export singleton instance
const appKitApi = new AppKitApi();

export default appKitApi;
export { AppKitApi };
export type { SearchResponse, Customer };