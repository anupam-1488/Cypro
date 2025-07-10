// features/shared/config/apiConfig.ts
/**
 * API Configuration Constants
 * Update these values to match your customer management API
 */

// ===============================
// CUSTOMER API CONFIGURATION
// ===============================

export const API_CONFIG = {
  
  BASE_URL: 'https://cyeproai.fly.dev', 
  
  // API Endpoints (relative to BASE_URL)
  ENDPOINTS: {
    CUSTOMERS: '/api/customers',
    CUSTOMER_BY_ID: '/api/customers/:id',
    AUTH_TOKEN: '/api/authorize/token', // Already configured in supabase.ts
  },
  
  // Request Configuration
  TIMEOUT: 15000, // 15 seconds
  RETRY_ATTEMPTS: 2,
  
  // Rate Limiting (matches API documentation)
  RATE_LIMITS: {
    LIST_CUSTOMERS: { requests: 100, window: 15 * 60 * 1000 }, // 100 per 15 minutes
    CREATE_CUSTOMER: { requests: 20, window: 15 * 60 * 1000 },  // 20 per 15 minutes
    UPDATE_CUSTOMER: { requests: 30, window: 15 * 60 * 1000 },  // 30 per 15 minutes
    DELETE_CUSTOMER: { requests: 10, window: 15 * 60 * 1000 },  // 10 per 15 minutes
  }
} as const;

// ===============================
// SEARCH CONFIGURATION
// ===============================

export const SEARCH_CONFIG = {
  // Search behavior
  MIN_QUERY_LENGTH: 1,        // Minimum characters to trigger search
  DEBOUNCE_MS: 150,           // Delay before API call
  MAX_RESULTS: 20,            // Maximum results per search
  
  // Phone number patterns for validation
  PHONE_PATTERNS: {
    // Indian mobile patterns (primary)
    INDIAN_MOBILE: /^[6-9]\d{9}$/,
    INDIAN_WITH_CODE: /^91[6-9]\d{9}$/,
    INDIAN_WITH_PLUS: /^\+91[6-9]\d{9}$/,
    
    // International patterns
    INTERNATIONAL: /^\+?\d{10,15}$/,
  },
  
  // Search field weights (for relevance scoring)
  FIELD_WEIGHTS: {
    phone: 1.0,           // Exact phone matches get highest priority
    name: 0.8,            // Name matches
    email: 0.7,           // Email matches
    company: 0.6,         // Company matches
    occupation: 0.4,      // Occupation matches
    city: 0.3,            // City matches
  }
} as const;

// ===============================
// CUSTOMER DATA MAPPING
// ===============================

export const CUSTOMER_FIELD_MAPPING = {
  // Standard fields (from API response to internal format)
  STANDARD_FIELDS: {
    id: 'id',
    name: 'name',
    email: 'email',
    phone: 'phone',
    scope: 'scope',
    created_at: 'created_at',
    updated_at: 'updated_at',
  },
  
  // Custom fields mapping (from custom_fields object)
  CUSTOM_FIELDS: {
    // Personal Information
    age: 'age',
    gender: 'gender',
    date_of_birth: 'date_of_birth',
    occupation: 'occupation',
    annual_income: 'annual_income',
    
    // Contact & Address
    alternate_phone: 'alternate_phone',
    address: 'address',
    city: 'city',
    state: 'state',
    pincode: 'pincode',
    
    // Company Information
    company_name: 'company_name',
    company_type: 'company_type',
    gst_number: 'gst_number',
    
    // Vehicle Interest
    vehicle_model_interest: 'vehicle_model_interest',
    budget_min: 'budget_min',
    budget_max: 'budget_max',
    budget_range: 'budget_range',
    finance_required: 'finance_required',
    exchange_vehicle: 'exchange_vehicle',
    current_vehicle: 'current_vehicle',
    
    // Purchase Journey
    purchase_timeline: 'purchase_timeline',
    test_drive_date: 'test_drive_date',
    booking_amount: 'booking_amount',
    booking_date: 'booking_date',
    delivery_date: 'delivery_date',
    color_preference: 'color_preference',
    
    // Lead Management
    lead_source: 'lead_source',
    enquiry_date: 'enquiry_date',
    follow_up_date: 'follow_up_date',
    sales_stage: 'sales_stage',
    priority_level: 'priority_level',
    sales_consultant: 'sales_consultant',
    
    // Additional Information
    family_size: 'family_size',
    insurance_required: 'insurance_required',
    accessories_interest: 'accessories_interest',
    referral_source: 'referral_source',
  },
  
  // Priority fields for display (shown in search results)
  PRIORITY_DISPLAY_FIELDS: [
    'occupation',
    'vehicle_model_interest',
    'budget_range',
    'sales_stage',
    'priority_level',
    'purchase_timeline',
    'company_name',
  ],
  
  // Required fields for customer creation
  REQUIRED_FIELDS: ['name'],
  
  // Optional but recommended fields
  RECOMMENDED_FIELDS: ['phone', 'email', 'scope'],
} as const;

// ===============================
// UI CONFIGURATION
// ===============================

export const UI_CONFIG = {
  // Feedback display durations (milliseconds)
  FEEDBACK_DURATION: {
    SUCCESS: 1500,
    ERROR: 3000,
    INFO: 2500,
  },
  
  // Search dropdown configuration
  SEARCH_DROPDOWN: {
    MAX_HEIGHT: '16rem',     // max-h-64
    MAX_RESULTS: 10,
    SHOW_API_STATUS: true,
    SHOW_DOWNLOAD_STATUS: true,
  },
  
  // Customer card display
  CUSTOMER_CARD: {
    SHOW_SCOPE_BADGES: true,
    SHOW_DATA_COUNT: true,
    SHOW_DOWNLOAD_DATE: true,
    MAX_FIELD_PREVIEW: 4,    // Max custom fields to show in preview
  },
  
  // Status indicators
  STATUS_INDICATORS: {
    API_READY: { icon: '🌐', color: 'green', text: 'API Connected' },
    API_ERROR: { icon: '⚠️', color: 'red', text: 'API Error' },
    API_NOT_READY: { icon: '🔌', color: 'gray', text: 'API Not Ready' },
    LOCAL_ONLY: { icon: '💾', color: 'blue', text: 'Local Only' },
  }
} as const;

// ===============================
// ERROR MESSAGES
// ===============================

export const ERROR_MESSAGES = {
  // API Errors
  API_NOT_CONFIGURED: 'API base URL not configured. Please configure in settings.',
  API_TOKEN_MISSING: 'Authentication token not available. Please login.',
  API_CONNECTION_FAILED: 'Failed to connect to API. Please check your connection.',
  API_UNAUTHORIZED: 'Authentication failed. Please login again.',
  API_FORBIDDEN: 'Access denied. Insufficient permissions.',
  API_RATE_LIMITED: 'Rate limit exceeded. Please try again later.',
  API_SERVER_ERROR: 'Server error. Please try again later.',
  
  // Search Errors
  SEARCH_QUERY_TOO_SHORT: 'Search query must be at least 1 character',
  SEARCH_NO_RESULTS: 'No customers found matching your search',
  SEARCH_FAILED: 'Search failed. Please try again.',
  
  // Customer Errors
  CUSTOMER_NOT_FOUND: 'Customer not found',
  CUSTOMER_DOWNLOAD_FAILED: 'Failed to download customer data',
  CUSTOMER_SAVE_FAILED: 'Failed to save customer locally',
  CUSTOMER_VALIDATION_FAILED: 'Customer data validation failed',
  
  // Template Errors
  TEMPLATE_NOT_SELECTED: 'Please select a template first',
  TEMPLATE_NO_MAPPING: 'Template has no field mapping configured',
  
  // AutoFill Errors
  AUTOFILL_NO_CUSTOMER: 'Please select a customer first',
  AUTOFILL_NO_TEMPLATE: 'Please select a template first',
  AUTOFILL_NO_DATA: 'Customer has no data for auto-fill',
  AUTOFILL_FAILED: 'Auto-fill operation failed',
  
  // AI Suggest Errors
  AI_SUGGEST_NO_DATA: 'Customer needs data for AI suggestions',
  AI_SUGGEST_ACTIVATION_FAILED: 'Failed to activate AI Suggest mode',
} as const;

// ===============================
// SUCCESS MESSAGES
// ===============================

export const SUCCESS_MESSAGES = {
  // Customer Operations
  CUSTOMER_SELECTED: (name: string) => `Selected ${name}`,
  CUSTOMER_DOWNLOADED: (name: string, fields: number) => 
    `Downloaded ${name} - ${fields} data fields available`,
  CUSTOMER_ALREADY_DOWNLOADED: (name: string) => 
    `Selected ${name} (already downloaded)`,
  
  // Search Operations
  SEARCH_COMPLETED: (count: number) => `Found ${count} customers`,
  
  // Template Operations
  TEMPLATE_SELECTED: 'Template selected successfully',
  
  // AutoFill Operations
  AUTOFILL_SUCCESS: (count: number) => `Filled ${count} fields successfully`,
  
  // AI Suggest Operations
  AI_SUGGEST_ACTIVATED: 'AI Suggest activated - click highlighted fields',
  AI_SUGGEST_DEACTIVATED: 'AI Suggest deactivated',
  
  // API Operations
  API_CONNECTION_SUCCESS: 'API connection successful',
  API_TOKEN_REFRESHED: 'Authentication token refreshed',
} as const;

// ===============================
// VALIDATION RULES
// ===============================

export const VALIDATION_RULES = {
  // Customer name validation
  CUSTOMER_NAME: {
    min: 2,
    max: 255,
    pattern: /^[a-zA-Z\s\.\-\']+$/,
    message: 'Name must be 2-255 characters, letters only'
  },
  
  // Email validation
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  
  // Phone validation
  PHONE: {
    minDigits: 10,
    maxDigits: 15,
    message: 'Phone number must be 10-15 digits'
  },
  
  // Search query validation
  SEARCH_QUERY: {
    min: 1,
    max: 100,
    message: 'Search query must be 1-100 characters'
  }
} as const;

// ===============================
// HELPER FUNCTIONS
// ===============================

/**
 * Get API configuration with environment variable support
 */
export function getApiConfig() {
  // Try to get from environment variables first (for different deployments)
  const envBaseUrl = process.env.REACT_APP_CUSTOMER_API_URL || 
                    process.env.NEXT_PUBLIC_CUSTOMER_API_URL;
  
  return {
    ...API_CONFIG,
    BASE_URL: envBaseUrl || API_CONFIG.BASE_URL
  };
}

/**
 * Validate API configuration
 */
export function validateApiConfig(config: typeof API_CONFIG): boolean {
  return !!(config.BASE_URL && config.BASE_URL !== 'https://your-api-domain.com');
}

/**
 * Get customer display name from API response
 */
export function getCustomerDisplayName(customer: any): string {
  return customer.name || 
         customer.customer_name || 
         customer.custom_fields?.customer_name || 
         'Unknown Customer';
}

/**
 * Get customer phone number from API response
 */
export function getCustomerPhone(customer: any): string {
  return customer.phone || 
         customer.mobile || 
         customer.custom_fields?.phone || 
         customer.custom_fields?.mobile || 
         '';
}

/**
 * Get customer company name from API response
 */
export function getCustomerCompany(customer: any): string {
  return customer.custom_fields?.company_name || 
         customer.custom_fields?.company || 
         customer.company || 
         '';
}

/**
 * Check if customer has rich data
 */
export function hasRichCustomerData(customer: any): boolean {
  const customFields = customer.custom_fields || {};
  return Object.keys(customFields).length > 3; // More than basic fields
}

/**
 * Generate customer notes from custom fields
 */
export function generateCustomerNotes(customer: any): string {
  const customFields = customer.custom_fields || {};
  const priorityFields = CUSTOMER_FIELD_MAPPING.PRIORITY_DISPLAY_FIELDS;
  
  const notes = [];
  priorityFields.forEach(field => {
    if (customFields[field]) {
      notes.push(`${field}: ${customFields[field]}`);
    }
  });
  
  return notes.length > 0 ? 
    notes.slice(0, 3).join(' | ') : 
    'API customer';
}

// Export everything
export default {
  API_CONFIG,
  SEARCH_CONFIG,
  CUSTOMER_FIELD_MAPPING,
  UI_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  getApiConfig,
  validateApiConfig,
  getCustomerDisplayName,
  getCustomerPhone,
  getCustomerCompany,
  hasRichCustomerData,
  generateCustomerNotes,
};