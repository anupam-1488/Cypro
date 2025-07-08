// features/shared/services/appKitApi.ts
/**
 * Enhanced AppKit API Service
 * Provides improved customer search functionality with better error handling
 */

interface SearchResponse {
  success: boolean;
  data?: any[];
  error?: string;
  total?: number;
  page?: number;
  hasMore?: boolean;
}

interface Customer {
  id: string;
  customer_name?: string;
  name?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  occupation?: string;
  vehicle_model?: string;
  budget_range?: string;
  purchase_timeline?: string;
  scope?: 'own' | 'tenant' | 'org';
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

class AppKitApi {
  private baseUrl: string = '';
  private apiKey: string = '';
  private timeout: number = 10000; // 10 seconds

  constructor() {
    // Initialize API settings
    this.loadSettings();
  }

  private loadSettings() {
    try {
      // Load API settings from storage or environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('appkit_settings');
        if (stored) {
          const settings = JSON.parse(stored);
          this.baseUrl = settings.baseUrl || '';
          this.apiKey = settings.apiKey || '';
        }
      }
    } catch (error) {
      console.warn('[AppKitApi] Error loading settings:', error);
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
   * Enhanced customer search with better filtering and error handling
   */
  async searchCustomers(query: string, options: {
    limit?: number;
    page?: number;
    filters?: Record<string, any>;
  } = {}): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Searching customers with query:', query);
      
      if (!query || query.trim().length < 2) {
        return {
          success: false,
          error: 'Search query must be at least 2 characters'
        };
      }

      const { limit = 20, page = 1, filters = {} } = options;
      const cleanQuery = query.trim();
      
      // Determine search type
      const isPhoneSearch = /^\d/.test(cleanQuery);
      const normalizedPhone = this.normalizePhoneNumber(cleanQuery);
      
      // Create search parameters
      const searchParams = new URLSearchParams({
        q: cleanQuery,
        limit: limit.toString(),
        page: page.toString(),
        ...(isPhoneSearch && { phone: normalizedPhone }),
        ...filters
      });

      // Mock API response for development
      // In production, replace this with actual API call
      const mockCustomers: Customer[] = [
        {
          id: '1',
          customer_name: 'John Doe',
          phone: '9876543210',
          email: 'john.doe@example.com',
          company_name: 'Tech Solutions Ltd',
          address: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          occupation: 'Software Engineer',
          vehicle_model: 'Honda City',
          budget_range: '10-15 Lakhs',
          purchase_timeline: 'Within 3 months',
          scope: 'own',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-20T15:45:00Z'
        },
        {
          id: '2',
          customer_name: 'Jane Smith',
          phone: '9123456789',
          email: 'jane.smith@company.com',
          company_name: 'Marketing Pro',
          address: '456 Business Park',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          occupation: 'Marketing Manager',
          vehicle_model: 'Hyundai Creta',
          budget_range: '15-20 Lakhs',
          purchase_timeline: 'Within 6 months',
          scope: 'tenant',
          created_at: '2024-01-10T08:15:00Z',
          updated_at: '2024-01-25T12:30:00Z'
        },
        {
          id: '3',
          customer_name: 'Rajesh Kumar',
          phone: '9988776655',
          email: 'rajesh.kumar@gmail.com',
          company_name: 'Rajesh Enterprises',
          address: '789 Industrial Area',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          occupation: 'Business Owner',
          vehicle_model: 'Toyota Innova',
          budget_range: '25-30 Lakhs',
          purchase_timeline: 'Within 1 month',
          scope: 'own',
          created_at: '2024-01-05T14:20:00Z',
          updated_at: '2024-01-22T09:10:00Z'
        },
        {
          id: '4',
          customer_name: 'Priya Sharma',
          phone: '9234567890',
          email: 'priya.sharma@techcorp.com',
          company_name: 'TechCorp Solutions',
          address: '321 Tech Park',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          occupation: 'Project Manager',
          vehicle_model: 'Maruti Swift',
          budget_range: '8-12 Lakhs',
          purchase_timeline: 'Within 2 months',
          scope: 'tenant',
          created_at: '2024-01-12T11:45:00Z',
          updated_at: '2024-01-28T16:20:00Z'
        },
        {
          id: '5',
          customer_name: 'Amit Patel',
          phone: '9876543211',
          email: 'amit.patel@startup.in',
          company_name: 'Innovation Hub',
          address: '654 Startup Street',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380001',
          occupation: 'Startup Founder',
          vehicle_model: 'BMW 3 Series',
          budget_range: '40-50 Lakhs',
          purchase_timeline: 'Within 4 months',
          scope: 'own',
          created_at: '2024-01-08T13:30:00Z',
          updated_at: '2024-01-26T10:15:00Z'
        }
      ];

      // Filter mock customers based on search query
      let filteredCustomers = mockCustomers;

      if (isPhoneSearch) {
        // Phone number search - partial matching
        filteredCustomers = mockCustomers.filter(customer => {
          const customerPhone = this.normalizePhoneNumber(customer.phone || '');
          return customerPhone.includes(normalizedPhone) || customerPhone.startsWith(normalizedPhone);
        });
      } else {
        // Text search - name, email, company
        const lowerQuery = cleanQuery.toLowerCase();
        filteredCustomers = mockCustomers.filter(customer => {
          const searchableFields = [
            customer.customer_name,
            customer.name,
            customer.email,
            customer.company_name,
            customer.city,
            customer.occupation
          ].filter(Boolean).map(field => field.toLowerCase());
          
          return searchableFields.some(field => 
            field.includes(lowerQuery) || lowerQuery.includes(field)
          );
        });
      }

      // Apply pagination
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
   * Get customer by ID
   */
  async getCustomerById(customerId: string): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Getting customer by ID:', customerId);
      
      // Mock implementation
      // In production, make actual API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      return {
        success: false,
        error: 'Customer not found'
      };
    } catch (error) {
      console.error('[AppKitApi] Get customer error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get customer'
      };
    }
  }

  /**
   * Update customer data
   */
  async updateCustomer(customerId: string, data: Partial<Customer>): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Updating customer:', customerId, data);
      
      // Mock implementation
      // In production, make actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      return {
        success: true,
        data: [{ ...data, id: customerId, updated_at: new Date().toISOString() }]
      };
    } catch (error) {
      console.error('[AppKitApi] Update customer error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update customer'
      };
    }
  }

  /**
   * Create new customer
   */
  async createCustomer(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Creating customer:', data);
      
      // Mock implementation
      // In production, make actual API call
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      const newCustomer = {
        ...data,
        id: `customer_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return {
        success: true,
        data: [newCustomer]
      };
    } catch (error) {
      console.error('[AppKitApi] Create customer error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create customer'
      };
    }
  }

  /**
   * Delete customer
   */
  async deleteCustomer(customerId: string): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Deleting customer:', customerId);
      
      // Mock implementation
      // In production, make actual API call
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
      
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('[AppKitApi] Delete customer error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete customer'
      };
    }
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Getting customer statistics');
      
      // Mock implementation
      const stats = {
        total: 150,
        own: 85,
        tenant: 45,
        org: 20,
        recent: 25,
        withData: 120
      };
      
      return {
        success: true,
        data: [stats]
      };
    } catch (error) {
      console.error('[AppKitApi] Get stats error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get statistics'
      };
    }
  }

  /**
   * Validate customer data
   */
  validateCustomerData(data: Partial<Customer>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields validation
    if (!data.customer_name && !data.name) {
      errors.push('Customer name is required');
    }
    
    if (!data.phone && !data.mobile) {
      errors.push('Phone number is required');
    }
    
    // Phone number format validation
    const phone = data.phone || data.mobile || '';
    if (phone) {
      const normalizedPhone = this.normalizePhoneNumber(phone);
      if (normalizedPhone.length < 10 || normalizedPhone.length > 12) {
        errors.push('Phone number must be 10-12 digits');
      }
    }
    
    // Email format validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Set API configuration
   */
  setConfig(config: { baseUrl?: string; apiKey?: string; timeout?: number }) {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.timeout) this.timeout = config.timeout;
    
    // Save to storage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('appkit_settings', JSON.stringify({
          baseUrl: this.baseUrl,
          apiKey: this.apiKey
        }));
      }
    } catch (error) {
      console.warn('[AppKitApi] Error saving settings:', error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
      timeout: this.timeout
    };
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<SearchResponse> {
    try {
      console.log('[AppKitApi] Testing connection...');
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: [{ status: 'connected', timestamp: Date.now() }]
      };
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