import { useState, useEffect, useCallback } from 'react';
import { indexedDBStorage } from '../storage/indexedDBStorage'; // Updated import
import { messaging } from '@voilajsx/comet/messaging';

// ===============================
// TYPE DEFINITIONS
// ===============================

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  notes?: string;
  createdAt: number;
  dataSource: 'manual' | 'json';
  originalData?: Record<string, any>;
}

interface FormField {
  name: string;
  id: string;
  type: string;
  placeholder: string;
  label: string;
  value: string;
  formIndex: number;
  selector: string;
}

interface BusinessTemplate {
  id: string;
  name: string;
  url: string;
  fieldMapping: Record<string, string[]>; // jsonFieldName -> selectors[]
  extractedFields?: FormField[];
  createdAt: number;
}

interface LoadingState {
  scan: boolean;
  fill: boolean;
  upload: boolean;
  save: boolean;
}

interface PendingTemplate {
  name: string;
  url: string;
  domain: string;
}

interface OperationResult {
  success: boolean;
  error?: string;
  [key: string]: any;
}

// ===============================
// CONSTANTS
// ===============================

const STORAGE_KEYS = {
  CUSTOMERS: 'customer.list',
  TEMPLATES: 'customer.templates',
  PENDING_EXTRACTION: 'customer.pendingExtraction',
} as const;

const PHONE_VALIDATION = {
  MIN_DIGITS: 7,
  MAX_DIGITS: 15,
  PATTERN: /^[\+]?[\d\s\-\(\)]{7,20}$/,
} as const;

const NAME_VALIDATION = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
  MIN_WORDS: 1,
  MAX_WORDS: 4,
  PATTERN: /^[A-Za-z][A-Za-z\s\.]{1,50}$/,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADDRESS_MIN_LENGTH = 15;
const ADDRESS_PATTERN = /\d+.*road|street|avenue|lane/i;

const COMPANY_INDICATORS = [
  /company/i, /corp/i, /ltd/i, /inc/i, 
  /technologies/i, /solutions/i
] as const;

const SUPPORTED_FILE_TYPES = {
  JSON: ['json'],
  MIME_TYPES: ['application/json', 'text/json', 'text/plain'],
} as const;

/**
 * Custom hook for managing customer data, templates, and form operations
 * 
 * Provides comprehensive functionality for:
 * - Customer CRUD operations
 * - Business template management
 * - Form field extraction and mapping
 * - Auto-filling forms with customer data
 * - JSON file import/export
 * - AI-powered field suggestions
 */
export function useCustomer() {
  // ===============================
  // STATE MANAGEMENT
  // ===============================

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<BusinessTemplate[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<LoadingState>({
    scan: false,
    fill: false,
    upload: false,
    save: false,
  });
  const [extractedFields, setExtractedFields] = useState<FormField[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, any>>({});
  const [showMappingInterface, setShowMappingInterface] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<PendingTemplate | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  /**
   * Update loading state for a specific operation
   */
  const setLoadingState = useCallback((operation: keyof LoadingState, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [operation]: isLoading }));
  }, []);

  /**
   * Create a standardized operation result
   */
  const createResult = (success: boolean, data?: any, error?: string): OperationResult => ({
    success,
    ...(data && { ...data }),
    ...(error && { error }),
  });

  /**
   * Validate if current tab supports messaging operations
   */
  const validateCurrentTab = async (): Promise<OperationResult> => {
    try {
      const currentTab = await messaging.getActiveTab();
      if (!currentTab || !messaging.isTabSupported(currentTab)) {
        return createResult(false, null, 'Page type not supported');
      }
      return createResult(true, { tab: currentTab });
    } catch (error) {
      return createResult(false, null, error.message);
    }
  };

  // ===============================
  // DATA ANALYSIS FUNCTIONS
  // ===============================

  /**
   * Extract all unique JSON field names from uploaded customers
   * Used for field mapping interface
   */
  const getJsonFieldNamesFromCustomers = useCallback((): string[] => {
    const jsonFieldNames = new Set<string>();
    
    customers.forEach(customer => {
      if (customer.dataSource === 'json' && customer.originalData) {
        Object.keys(customer.originalData).forEach(key => {
          jsonFieldNames.add(key);
        });
      }
    });
    
    return Array.from(jsonFieldNames).sort();
  }, [customers]);

  /**
   * Flatten nested object structure for easier data processing
   */
  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          flattened[newKey] = value.length > 0 ? value.join(', ') : '';
        } else {
          flattened[newKey] = value;
        }
      }
    }
    return flattened;
  };

  /**
   * Intelligent field detection from JSON data
   */
  const detectFieldsFromData = (flatData: Record<string, any>) => {
    const detectedFields = {
      name: '',
      phone: '',
      email: '',
      address: '',
      company: '',
    };

    // First, try direct field name mapping for common field names
    const directFieldMapping = {
      // Name field variants
      name: ['Customer Name', 'customer name', 'Name', 'name', 'Booking Name', 'booking name'],
      
      // Phone field variants  
      phone: ['Contact No', 'contact no', 'Phone', 'phone', 'Mobile', 'mobile', 'Contact Number', 'contact number'],
      
      // Email field variants
      email: ['Email ID', 'email id', 'Email', 'email', 'Email Address', 'email address'],
      
      // Address field variants
      address: ['Address', 'address', 'Address Details', 'address details', 'Street', 'street'],
      
      // Company field variants
      company: ['Company', 'company', 'Company Name', 'company name', 'Organization', 'organization']
    };

    // Try direct mapping first
    Object.entries(directFieldMapping).forEach(([fieldType, possibleKeys]) => {
      if (detectedFields[fieldType]) return; // Skip if already found
      
      for (const key of possibleKeys) {
        if (flatData[key] && flatData[key].toString().trim()) {
          const value = flatData[key].toString().trim();
          
          // Additional validation for phone numbers
          if (fieldType === 'phone') {
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length >= PHONE_VALIDATION.MIN_DIGITS && 
                digitsOnly.length <= PHONE_VALIDATION.MAX_DIGITS) {
              detectedFields[fieldType] = value;
              break;
            }
          }
          // Additional validation for email
          else if (fieldType === 'email') {
            if (EMAIL_PATTERN.test(value)) {
              detectedFields[fieldType] = value;
              break;
            }
          }
          // For name, company, address - use directly if not empty
          else {
            detectedFields[fieldType] = value;
            break;
          }
        }
      }
    });

    // Fallback to pattern-based detection for fields not found
    Object.entries(flatData).forEach(([key, value]) => {
      if (!value) return;
      const strValue = value.toString().trim();
      if (!strValue) return;
      
      // Email detection (if not found via direct mapping)
      if (!detectedFields.email && EMAIL_PATTERN.test(strValue)) {
        detectedFields.email = strValue;
      }
      
      // Phone detection (if not found via direct mapping)
      if (!detectedFields.phone) {
        const digitsOnly = strValue.replace(/\D/g, '');
        if (PHONE_VALIDATION.PATTERN.test(strValue) && 
            digitsOnly.length >= PHONE_VALIDATION.MIN_DIGITS && 
            digitsOnly.length <= PHONE_VALIDATION.MAX_DIGITS) {
          detectedFields.phone = strValue;
        }
      }
      
      // Name detection (if not found via direct mapping)
      if (!detectedFields.name && NAME_VALIDATION.PATTERN.test(strValue)) {
        const words = strValue.split(' ');
        if (words.length >= NAME_VALIDATION.MIN_WORDS && 
            words.length <= NAME_VALIDATION.MAX_WORDS &&
            strValue.length >= NAME_VALIDATION.MIN_LENGTH && 
            strValue.length <= NAME_VALIDATION.MAX_LENGTH) {
          detectedFields.name = strValue;
        }
      }
      
      // Company detection (if not found via direct mapping)
      if (!detectedFields.company) {
        const hasCompanyIndicator = COMPANY_INDICATORS.some(pattern => 
          pattern.test(key) || pattern.test(strValue)
        );
        if (hasCompanyIndicator) {
          detectedFields.company = strValue;
        }
      }
      
      // Address detection (if not found via direct mapping)
      if (!detectedFields.address && 
          (strValue.length > ADDRESS_MIN_LENGTH || ADDRESS_PATTERN.test(strValue))) {
        detectedFields.address = strValue;
      }
    });

    return detectedFields;
  };

  /**
   * Convert JSON data to standardized customer format
   * Handles intelligent field detection and data validation
   */
  const convertJsonToStandardCustomer = useCallback((jsonData: any): Omit<Customer, 'id' | 'createdAt'> | null => {
    try {
      const flatData = flattenObject(jsonData);
      const detectedFields = detectFieldsFromData(flatData);
      
      // Must have either name or phone to be valid
      if (!detectedFields.name && !detectedFields.phone) {
        return null;
      }
      
      // Create a more informative name if primary name is missing
      let customerName = detectedFields.name;
      if (!customerName) {
        // Try to create name from other fields
        const buyerType = flatData['Buyer Type'] || flatData['Type'] || '';
        const bookingName = flatData['Booking Name'] || '';
        customerName = bookingName || buyerType || 'Customer';
      }
      
      // Create comprehensive notes with key information
      const keyInfo = [];
      if (flatData['Buyer Type']) keyInfo.push(`Type: ${flatData['Buyer Type']}`);
      if (flatData['Event Name']) keyInfo.push(`Event: ${flatData['Event Name']}`);
      if (flatData['Booking Amount']) keyInfo.push(`Booking: ${flatData['Booking Amount']}`);
      if (flatData['Docket No.'] || flatData['Docket No']) keyInfo.push(`Docket: ${flatData['Docket No.'] || flatData['Docket No']}`);
      
      const notes = keyInfo.length > 0 ? 
        `Imported from JSON - ${keyInfo.join(' | ')}` : 
        'Imported from JSON';
      
      return {
        name: customerName,
        phone: detectedFields.phone || '',
        email: detectedFields.email || undefined,
        address: detectedFields.address || undefined,
        company: detectedFields.company || undefined,
        notes: notes,
        dataSource: 'json',
        originalData: jsonData, // Preserve original for mapping
      };
    } catch (error) {
      console.error('[Customer] Error converting JSON:', error);
      return null;
    }
  }, []);

  // ===============================
  // CUSTOMER OPERATIONS
  // ===============================

  /**
   * Load all customer and template data from storage
   */
  const loadData = async (): Promise<void> => {
    try {
      const [savedCustomers, savedTemplates] = await Promise.all([
        indexedDBStorage.get(STORAGE_KEYS.CUSTOMERS, []),
        indexedDBStorage.get(STORAGE_KEYS.TEMPLATES, []),
      ]);
      setCustomers(savedCustomers);
      setTemplates(savedTemplates);
    } catch (error) {
      console.error('[Customer] Failed to load data:', error);
    }
  };

  /**
   * Add a new customer to the system
   */
  const addCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    const newCustomer: Customer = {
      ...customerData,
      id: `customer_${Date.now()}`,
      createdAt: Date.now(),
      dataSource: customerData.dataSource || 'manual',
    };

    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    await indexedDBStorage.set(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    return newCustomer;
  }, [customers]);

  /**
   * Update an existing customer
   */
  const updateCustomer = useCallback(async (customerId: string, updates: Partial<Customer>): Promise<void> => {
    const updatedCustomers = customers.map(customer =>
      customer.id === customerId ? { ...customer, ...updates } : customer
    );
    setCustomers(updatedCustomers);
    await indexedDBStorage.set(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
  }, [customers]);

  /**
   * Delete a customer from the system
   */
  const deleteCustomer = useCallback(async (customerId: string): Promise<void> => {
    const updatedCustomers = customers.filter(customer => customer.id !== customerId);
    setCustomers(updatedCustomers);
    await indexedDBStorage.set(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
  }, [customers]);

  /**
   * Search for customer by phone number
   */
  const searchByPhone = useCallback((phone: string): Customer | null => {
    const cleanPhone = phone.replace(/\s/g, '');
    const found = customers.find(customer => 
      customer.phone.includes(cleanPhone)
    );
    
    if (found) {
      setSelectedCustomer(found);
      return found;
    }
    return null;
  }, [customers]);

  // ===============================
  // FILE OPERATIONS
  // ===============================

  /**
   * Validate uploaded file type
   */
  const validateFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = SUPPORTED_FILE_TYPES.JSON.some(ext => fileName.endsWith(`.${ext}`));
    const hasValidMimeType = SUPPORTED_FILE_TYPES.MIME_TYPES.includes(file.type);
    
    return hasValidExtension || hasValidMimeType;
  };

  /**
   * Process JSON data from uploaded file
   */
  const processJsonData = async (data: any): Promise<{ imported: number; errors: string[] }> => {
    let imported = 0;
    const errors: string[] = [];

    // Handle single object
    if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
      try {
        const customer = convertJsonToStandardCustomer(data);
        if (customer) {
          await addCustomer(customer);
          imported = 1;
        } else {
          errors.push('Invalid customer data structure');
        }
      } catch (error) {
        errors.push(`Error processing customer: ${error.message}`);
      }
    }
    // Handle array of objects
    else if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (typeof item === 'object' && item !== null) {
          try {
            const customer = convertJsonToStandardCustomer(item);
            if (customer) {
              await addCustomer(customer);
              imported++;
            } else {
              errors.push(`Item ${i + 1}: Invalid customer data structure`);
            }
          } catch (error) {
            errors.push(`Item ${i + 1}: ${error.message}`);
          }
        }
      }
    } else {
      errors.push('Data must be an object or array of objects');
    }

    return { imported, errors };
  };

  /**
   * Handle file upload and processing
   */
  const handleFileUpload = useCallback(async (file: File): Promise<OperationResult> => {
    setLoadingState('upload', true);
    
    try {
      if (!validateFileType(file)) {
        return createResult(false, null, 'Please upload JSON files only.');
      }

      const text = await file.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        return createResult(false, null, `Invalid JSON: ${parseError.message}`);
      }
      
      const { imported, errors } = await processJsonData(data);
      
      if (imported === 0) {
        const errorMessage = errors.length > 0 
          ? `No valid customer data found: ${errors.join(', ')}`
          : 'No valid customer data found in JSON.';
        return createResult(false, null, errorMessage);
      }
      
      return createResult(true, { imported, errors });
    } catch (error) {
      console.error('[Customer] Upload error:', error);
      return createResult(false, null, `Upload error: ${error.message}`);
    } finally {
      setLoadingState('upload', false);
    }
  }, [addCustomer, convertJsonToStandardCustomer]);

  // ===============================
  // TEMPLATE OPERATIONS
  // ===============================

  /**
   * Save a new business template
   */
  const saveTemplate = useCallback(async (templateData: Omit<BusinessTemplate, 'id' | 'createdAt'>): Promise<BusinessTemplate> => {
    const newTemplate: BusinessTemplate = {
      ...templateData,
      id: `template_${Date.now()}`,
      createdAt: Date.now(),
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    await indexedDBStorage.set(STORAGE_KEYS.TEMPLATES, updatedTemplates);
    return newTemplate;
  }, [templates]);

  /**
   * Update an existing template
   */
  const updateTemplate = useCallback(async (templateId: string, updates: Partial<BusinessTemplate>): Promise<void> => {
    const updatedTemplates = templates.map(template =>
      template.id === templateId ? { ...template, ...updates } : template
    );
    setTemplates(updatedTemplates);
    await indexedDBStorage.set(STORAGE_KEYS.TEMPLATES, updatedTemplates);
  }, [templates]);

  /**
   * Delete a template
   */
  const deleteTemplate = useCallback(async (templateId: string): Promise<void> => {
    const updatedTemplates = templates.filter(template => template.id !== templateId);
    setTemplates(updatedTemplates);
    await indexedDBStorage.set(STORAGE_KEYS.TEMPLATES, updatedTemplates);
  }, [templates]);

  // ===============================
  // FORM OPERATIONS
  // ===============================

  /**
   * Extract form fields from the current page
   */
  const extractFormFields = useCallback(async (): Promise<OperationResult> => {
    setLoadingState('scan', true);
    
    try {
      const tabValidation = await validateCurrentTab();
      if (!tabValidation.success) {
        return tabValidation;
      }

      const response = await messaging.sendToContent({
        type: 'extractFormFields',
        data: {},
      });

      if (response.success) {
        return createResult(true, { fields: response.data.fields });
      } else {
        return createResult(false, null, response.error || 'Failed to extract fields');
      }
    } catch (error) {
      return createResult(false, null, error.message);
    } finally {
      setLoadingState('scan', false);
    }
  }, []);

  /**
   * Build customer data object for form filling
   */
  const buildCustomerDataObject = (customer: Customer): Record<string, string> => {
    return {
      // Standard customer fields
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      company: customer.company || '',
      address: customer.address || '',
      notes: customer.notes || '',
      
      // Include original JSON data if available
      ...(customer.originalData || {})
    };
  };

  /**
   * Log debug information for autofill operation
   */
  const logAutofillDebugInfo = (customerData: Record<string, string>, template: BusinessTemplate) => {
    console.log('=== AUTOFILL DEBUG ===');
    console.log('Customer data keys:', Object.keys(customerData));
    console.log('Customer data values:', customerData);
    console.log('Template mapping keys:', Object.keys(template.fieldMapping));
    console.log('Template mapping:', template.fieldMapping);
    
    // Check mapping coverage
    Object.keys(template.fieldMapping).forEach(mappingKey => {
      const hasData = customerData.hasOwnProperty(mappingKey);
      const value = customerData[mappingKey];
      console.log(`Mapping "${mappingKey}": hasData=${hasData}, value="${value}"`);
    });
  };

  /**
   * Auto-fill form with customer data using selected template
   */
  const autoFillForm = useCallback(async (): Promise<OperationResult> => {
    if (!selectedCustomer || !selectedTemplate) {
      return createResult(false, null, 'Select customer and template first');
    }

    setLoadingState('fill', true);

    try {
      const tabValidation = await validateCurrentTab();
      if (!tabValidation.success) {
        return tabValidation;
      }

      const customerData = buildCustomerDataObject(selectedCustomer);
      logAutofillDebugInfo(customerData, selectedTemplate);

      const response = await messaging.sendToContent({
        type: 'fillFormWithMapping',
        data: {
          customerData,
          fieldMapping: selectedTemplate.fieldMapping
        }
      });

      console.log('Handler response:', response);

      if (response && response.success) {
        return createResult(true, { filledCount: response.filledCount || 0 });
      } else {
        return createResult(false, null, response?.error || 'Auto-fill failed');
      }

    } catch (error) {
      console.error('[AutoFill] Error:', error);
      return createResult(false, null, error.message);
    } finally {
      setLoadingState('fill', false);
    }
  }, [selectedCustomer, selectedTemplate]);

  /**
   * Save extracted form fields data
   */
  const saveExtractedFields = useCallback(async (data: {
    templateName: string;
    fields: FormField[];
    url: string;
    domain: string;
  }): Promise<OperationResult> => {
    try {
      const optimizedData = {
        templateName: data.templateName,
        fields: data.fields.map(field => ({
          name: field.name,
          id: field.id,
          type: field.type,
          label: field.label || field.placeholder || field.name,
          selector: field.selector,
          placeholder: field.placeholder || '',
          value: field.value || '',
          formIndex: field.formIndex || 0,
        })),
        url: data.url,
        domain: data.domain,
        timestamp: Date.now()
      };

      await indexedDBStorage.set(STORAGE_KEYS.PENDING_EXTRACTION, optimizedData);
      return createResult(true);
    } catch (error) {
      return createResult(false, null, error.message);
    }
  }, []);

  // ===============================
  // MAPPING OPERATIONS
  // ===============================

  /**
   * Convert UI mapping format to template field mapping format
   */
  const convertMappingToTemplateFormat = (mapping: Record<string, any>): Record<string, string[]> => {
    const templateFieldMapping: Record<string, string[]> = {};
    
    Object.values(mapping).forEach((mappingItem: any) => {
      if (mappingItem && mappingItem.customerField && mappingItem.selector) {
        const jsonFieldName = mappingItem.customerField;
        const selector = mappingItem.selector;
        
        if (!templateFieldMapping[jsonFieldName]) {
          templateFieldMapping[jsonFieldName] = [];
        }
        templateFieldMapping[jsonFieldName].push(selector);
      }
    });

    return templateFieldMapping;
  };

  /**
   * Create a new template from field mapping
   */
  const createMappingFromFields = useCallback(async (mapping: Record<string, any>): Promise<OperationResult> => {
    if (!pendingTemplate || Object.keys(mapping).length === 0) {
      return createResult(false, null, 'Invalid mapping data');
    }

    try {
      const templateFieldMapping = convertMappingToTemplateFormat(mapping);
      
      const template = await saveTemplate({
        name: pendingTemplate.name,
        url: pendingTemplate.domain,
        fieldMapping: templateFieldMapping,
        extractedFields,
      });

      // Reset state
      setShowMappingInterface(false);
      setFieldMapping({});
      setExtractedFields([]);
      setPendingTemplate(null);
      
      return createResult(true, { template });
    } catch (error) {
      return createResult(false, null, error.message);
    }
  }, [pendingTemplate, extractedFields, saveTemplate]);

  /**
   * Update existing template with new field mapping
   */
  const updateMappingFromFields = useCallback(async (templateId: string, mapping: Record<string, any>): Promise<OperationResult> => {
    if (!pendingTemplate || Object.keys(mapping).length === 0) {
      return createResult(false, null, 'Invalid mapping data');
    }

    try {
      const templateFieldMapping = convertMappingToTemplateFormat(mapping);
      
      await updateTemplate(templateId, {
        name: pendingTemplate.name,
        url: pendingTemplate.domain,
        fieldMapping: templateFieldMapping,
        extractedFields,
      });

      // Reset state
      setShowMappingInterface(false);
      setFieldMapping({});
      setExtractedFields([]);
      setPendingTemplate(null);
      
      return createResult(true);
    } catch (error) {
      return createResult(false, null, error.message);
    }
  }, [pendingTemplate, extractedFields, updateTemplate]);

  // ===============================
  // AI OPERATIONS
  // ===============================

  /**
   * Highlight form fields using AI suggestions
   */
  const aiSuggestFields = useCallback(async (): Promise<OperationResult> => {
    if (!selectedTemplate) {
      return createResult(false, null, 'Select template first');
    }

    try {
      const tabValidation = await validateCurrentTab();
      if (!tabValidation.success) {
        return tabValidation;
      }

      const allSelectors = Object.values(selectedTemplate.fieldMapping).flat();
      
      const response = await messaging.sendToContent({
        type: 'highlightFields',
        data: { selectors: allSelectors, color: '#4ade80' },
      });
      
      if (response.success) {
        return createResult(true, { highlighted: response.data.highlighted });
      } else {
        return createResult(false, null, response.error || 'Highlight failed');
      }
    } catch (error) {
      return createResult(false, null, error.message);
    }
  }, [selectedTemplate]);

  // ===============================
  // UTILITY OPERATIONS
  // ===============================

  /**
   * Check for previously extracted fields in storage
   */
  const checkForExtractedFields = useCallback(async (): Promise<boolean> => {
    try {
      const pending = await indexedDBStorage.get(STORAGE_KEYS.PENDING_EXTRACTION, null);
      
      if (pending && pending.fields && pending.templateName) {
        setExtractedFields(pending.fields);
        setPendingTemplate({
          name: pending.templateName,
          url: pending.url,
          domain: pending.domain,
        });
        setShowMappingInterface(true);
        await indexedDBStorage.remove(STORAGE_KEYS.PENDING_EXTRACTION);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[Customer] Failed to check extracted fields:', error);
      return false;
    }
  }, []);

  // ===============================
  // INITIALIZATION
  // ===============================

  useEffect(() => {
    loadData();
    checkForExtractedFields();
  }, [checkForExtractedFields]);

  // ===============================
  // COMPUTED PROPERTIES
  // ===============================

  const computedProperties = {
    hasCustomers: customers.length > 0,
    hasTemplates: templates.length > 0,
    canAutoFill: selectedCustomer && selectedTemplate,
    totalCustomers: customers.length,
    totalTemplates: templates.length,
    jsonCustomersCount: customers.filter(c => c.dataSource === 'json').length,
    manualCustomersCount: customers.filter(c => c.dataSource === 'manual').length,
  };

  // ===============================
  // RETURN HOOK INTERFACE
  // ===============================

  return {
    // ===============================
    // STATE DATA
    // ===============================
    customers,
    templates,
    selectedCustomer,
    selectedTemplate,
    searchQuery,
    loading,
    extractedFields,
    fieldMapping,
    showMappingInterface,
    editingCustomer,
    pendingTemplate,
    
    // ===============================
    // CUSTOMER OPERATIONS
    // ===============================
    setSelectedCustomer,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchByPhone,
    
    // ===============================
    // TEMPLATE OPERATIONS
    // ===============================
    setSelectedTemplate,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    
    // ===============================
    // FORM OPERATIONS
    // ===============================
    extractFormFields,
    saveExtractedFields,
    autoFillForm,
    aiSuggestFields,
    
    // ===============================
    // FILE OPERATIONS
    // ===============================
    handleFileUpload,
    
    // ===============================
    // MAPPING OPERATIONS
    // ===============================
    setFieldMapping,
    createMappingFromFields,
    updateMappingFromFields,
    setShowMappingInterface,
    setExtractedFields,
    setPendingTemplate,
    
    // ===============================
    // UI STATE MANAGEMENT
    // ===============================
    setSearchQuery,
    setEditingCustomer,
    
    // ===============================
    // UTILITY FUNCTIONS
    // ===============================
    convertJsonToStandardCustomer,
    getJsonFieldNamesFromCustomers,
    checkForExtractedFields,
    
    // ===============================
    // COMPUTED PROPERTIES
    // ===============================
    ...computedProperties,
  };
}