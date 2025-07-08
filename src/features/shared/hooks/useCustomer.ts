// shared/hooks/useCustomer.ts
import { useState, useEffect, useCallback } from 'react';
import { indexedDBStorage } from '../storage/indexedDBStorage';
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
  dataSource: 'manual' | 'json' | 'api';
  originalData?: Record<string, any>;
  scope?: 'own' | 'tenant' | 'org';
  created_at?: string;
  updated_at?: string;
  synced?: boolean;
  downloadedAt?: string;
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
  tagName?: string;
  isVisible?: boolean;
  isHidden?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  context?: string;
  className?: string;
  hasName?: boolean;
  hasId?: boolean;
  elementIndex?: number;
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
  add: boolean;
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
// GLOBAL STATE MANAGEMENT
// ===============================

let globalCustomers: Customer[] = [];
let globalTemplates: BusinessTemplate[] = [];
let globalSelectedCustomer: Customer | null = null;
let globalSelectedTemplate: BusinessTemplate | null = null;
let globalEditingCustomer: Customer | null = null;
let globalLoading: LoadingState = {
  scan: false,
  fill: false,
  upload: false,
  save: false,
  add: false,
};
let globalExtractedFields: FormField[] = [];
let globalFieldMapping: Record<string, any> = {};
let globalShowMappingInterface: boolean = false;
let globalPendingTemplate: PendingTemplate | null = null;

const updateFunctions = new Set<() => void>();

const triggerGlobalUpdate = () => {
  console.log('[useCustomer] Triggering global update for', updateFunctions.size, 'hook instances');
  updateFunctions.forEach(updateFn => updateFn());
};

const saveCustomersGlobally = async () => {
  try {
    await indexedDBStorage.set(STORAGE_KEYS.CUSTOMERS, globalCustomers);
    console.log('[useCustomer] Saved customers globally:', globalCustomers.length);
    triggerGlobalUpdate();
  } catch (error) {
    console.error('[useCustomer] Error saving customers:', error);
  }
};

const saveTemplatesGlobally = async () => {
  try {
    await indexedDBStorage.set(STORAGE_KEYS.TEMPLATES, globalTemplates);
    console.log('[useCustomer] Saved templates globally:', globalTemplates.length);
    triggerGlobalUpdate();
  } catch (error) {
    console.error('[useCustomer] Error saving templates:', error);
  }
};

// ===============================
// CONSTANTS
// ===============================

const STORAGE_KEYS = {
  CUSTOMERS: 'customer.list',
  TEMPLATES: 'customer.templates',
  PENDING_EXTRACTION: 'customer.pendingExtraction',
} as const;

const FIELD_MAPPINGS = {
  name: [
    'customer_name', 'name', 'Customer Name', 'customer name', 'Name',
    'full_name', 'fullname', 'client_name', 'buyer_name'
  ],
  phone: [
    'phone', 'Phone', 'mobile', 'Mobile', 'contact', 'Contact',
    'phone_number', 'mobile_number', 'contact_number', 'cell'
  ],
  email: [
    'email', 'Email', 'email_address', 'Email Address', 'mail',
    'e_mail', 'e-mail', 'contact_email'
  ],
  address: [
    'address', 'Address', 'street_address', 'full_address',
    'residential_address', 'home_address', 'location'
  ],
  company: [
    'company_name', 'company', 'Company', 'organization',
    'employer', 'workplace', 'business_name', 'firm'
  ],
  city: [
    'city', 'City', 'town', 'Town', 'locality', 'place'
  ],
  state: [
    'state', 'State', 'province', 'region'
  ],
  pincode: [
    'pincode', 'pin_code', 'zipcode', 'zip_code', 'postal_code', 'zip'
  ],
  occupation: [
    'occupation', 'job', 'profession', 'designation', 'role'
  ],
  budget: [
    'budget_range', 'budget', 'price_range', 'budget_min', 'budget_max'
  ],
  vehicle: [
    'vehicle_model', 'model', 'car_model', 'preferred_model', 'variant_interest'
  ]
} as const;

/**
 * Initialize global state from storage
 */
const initializeGlobalState = async () => {
  try {
    const [savedCustomers, savedTemplates] = await Promise.all([
      indexedDBStorage.get(STORAGE_KEYS.CUSTOMERS, []),
      indexedDBStorage.get(STORAGE_KEYS.TEMPLATES, []),
    ]);
    globalCustomers = savedCustomers;
    globalTemplates = savedTemplates;
    console.log('[useCustomer] Initialized global state - customers:', globalCustomers.length, 'templates:', globalTemplates.length);
  } catch (error) {
    console.error('[useCustomer] Error initializing global state:', error);
  }
};

let isInitialized = false;
if (!isInitialized) {
  initializeGlobalState();
  isInitialized = true;
}

export function useCustomer() {
  // ===============================
  // LOCAL STATE THAT SYNCS WITH GLOBAL
  // ===============================

  const [customers, setCustomers] = useState<Customer[]>(() => [...globalCustomers]);
  const [templates, setTemplates] = useState<BusinessTemplate[]>(() => [...globalTemplates]);
  const [selectedCustomer, setSelectedCustomerLocal] = useState<Customer | null>(globalSelectedCustomer);
  const [selectedTemplate, setSelectedTemplateLocal] = useState<BusinessTemplate | null>(globalSelectedTemplate);
  const [loading, setLoadingLocal] = useState<LoadingState>(() => ({ ...globalLoading }));
  const [extractedFields, setExtractedFieldsLocal] = useState<FormField[]>(() => [...globalExtractedFields]);
  const [fieldMapping, setFieldMappingLocal] = useState<Record<string, any>>(() => ({ ...globalFieldMapping }));
  const [showMappingInterface, setShowMappingInterfaceLocal] = useState<boolean>(globalShowMappingInterface);
  const [pendingTemplate, setPendingTemplateLocal] = useState<PendingTemplate | null>(globalPendingTemplate);
  const [editingCustomer, setEditingCustomerLocal] = useState<Customer | null>(globalEditingCustomer);
  const [, forceUpdate] = useState({});

  // Register this hook instance for global updates
  useEffect(() => {
    const updateThis = () => {
      console.log('[useCustomer] Updating hook instance with global state');
      setCustomers([...globalCustomers]);
      setTemplates([...globalTemplates]);
      setSelectedCustomerLocal(globalSelectedCustomer);
      setSelectedTemplateLocal(globalSelectedTemplate);
      setLoadingLocal({ ...globalLoading });
      setExtractedFieldsLocal([...globalExtractedFields]);
      setFieldMappingLocal({ ...globalFieldMapping });
      setShowMappingInterfaceLocal(globalShowMappingInterface);
      setPendingTemplateLocal(globalPendingTemplate);
      setEditingCustomerLocal(globalEditingCustomer);
      forceUpdate({});
    };

    updateFunctions.add(updateThis);
    
    return () => {
      updateFunctions.delete(updateThis);
    };
  }, []);

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  const setLoadingState = useCallback((operation: keyof LoadingState, isLoading: boolean) => {
    globalLoading = { ...globalLoading, [operation]: isLoading };
    triggerGlobalUpdate();
  }, []);

  const createResult = (success: boolean, data?: any, error?: string): OperationResult => ({
    success,
    ...(data && { ...data }),
    ...(error && { error }),
  });

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
  // PHONE NUMBER UTILITIES
  // ===============================

  const cleanPhoneNumber = useCallback((phone: string) => {
    if (!phone) return '';
    return phone.toString().replace(/[^\d]/g, '');
  }, []);

  const normalizePhoneNumber = useCallback((phone: string) => {
    const cleaned = cleanPhoneNumber(phone);
    if (cleaned.length === 10) {
      return cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.slice(1);
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return cleaned.slice(2);
    }
    return cleaned;
  }, [cleanPhoneNumber]);

  const isPhoneNumberMatch = useCallback((customerPhone: string, searchQuery: string): boolean => {
    if (!customerPhone || !searchQuery) return false;
    
    const normalizedCustomerPhone = normalizePhoneNumber(customerPhone);
    const normalizedSearchQuery = normalizePhoneNumber(searchQuery);
    
    if (/^\d+$/.test(normalizedSearchQuery)) {
      if (normalizedCustomerPhone === normalizedSearchQuery) return true;
      if (normalizedCustomerPhone.startsWith(normalizedSearchQuery)) return true;
      if (normalizedCustomerPhone.includes(normalizedSearchQuery)) return true;
    }
    
    return false;
  }, [normalizePhoneNumber]);

  // ===============================
  // GLOBAL STATE SETTERS
  // ===============================

  const setSelectedCustomer = useCallback((customer: Customer | null) => {
    console.log('[useCustomer] Setting selected customer:', customer?.name || 'null');
    globalSelectedCustomer = customer;
    triggerGlobalUpdate();
  }, []);

  const setSelectedTemplate = useCallback((template: BusinessTemplate | null) => {
    console.log('[useCustomer] Setting selected template:', template?.name || 'null');
    globalSelectedTemplate = template;
    triggerGlobalUpdate();
  }, []);

  const setEditingCustomer = useCallback((customer: Customer | null) => {
    console.log('[useCustomer] Setting editing customer:', customer?.name || 'null');
    globalEditingCustomer = customer;
    triggerGlobalUpdate();
  }, []);

  // ===============================
  // FIELD MAPPING FUNCTIONS (CONSOLIDATED)
  // ===============================

  const validateFieldMapping = useCallback((mapping: Record<string, any>): boolean => {
    if (!mapping || typeof mapping !== 'object') {
      console.error('[useCustomer] Invalid mapping object:', mapping);
      return false;
    }
    
    const entries = Object.entries(mapping);
    if (entries.length === 0) {
      return true; // Empty is valid
    }
    
    for (const [key, value] of entries) {
      if (!value || typeof value !== 'object') {
        console.error('[useCustomer] Invalid mapping entry:', key, value);
        return false;
      }
      
      if (!value.customerField || !value.selector) {
        console.error('[useCustomer] Incomplete mapping entry:', key, value);
        return false;
      }
      
      if (typeof value.customerField !== 'string' || typeof value.selector !== 'string') {
        console.error('[useCustomer] Invalid mapping entry types:', key, value);
        return false;
      }
    }
    
    return true;
  }, []);

  const setFieldMapping = useCallback((mappingOrUpdater: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => {
    console.log('[useCustomer] setFieldMapping called with:', typeof mappingOrUpdater);
    
    let newMapping;
    
    if (typeof mappingOrUpdater === 'function') {
      console.log('[useCustomer] Functional update detected, current globalFieldMapping:', globalFieldMapping);
      newMapping = mappingOrUpdater(globalFieldMapping);
      console.log('[useCustomer] Functional update result:', newMapping);
    } else {
      newMapping = mappingOrUpdater;
      console.log('[useCustomer] Direct assignment:', newMapping);
    }
    
    if (!validateFieldMapping(newMapping)) {
      console.error('[useCustomer] Field mapping validation failed, not updating');
      return;
    }
    
    globalFieldMapping = { ...newMapping };
    console.log('[useCustomer] Updated globalFieldMapping:', globalFieldMapping);
    triggerGlobalUpdate();
  }, [validateFieldMapping]);

  const convertMappingToTemplateFormat = useCallback((mapping: Record<string, any>): Record<string, string[]> => {
    console.log('[useCustomer] Converting mapping to template format:', mapping);
    
    if (!mapping || typeof mapping !== 'object') {
      console.error('[useCustomer] Invalid mapping for conversion:', mapping);
      return {};
    }
    
    const templateFieldMapping: Record<string, string[]> = {};
    
    Object.entries(mapping).forEach(([key, mappingItem]) => {
      if (!mappingItem || typeof mappingItem !== 'object') {
        console.warn('[useCustomer] Invalid mapping item:', key, mappingItem);
        return;
      }
      
      const { customerField, selector } = mappingItem;
      
      if (!customerField || !selector || customerField === 'none') {
        console.warn('[useCustomer] Incomplete mapping item:', key, mappingItem);
        return;
      }
      
      if (!templateFieldMapping[customerField]) {
        templateFieldMapping[customerField] = [];
      }
      
      if (!templateFieldMapping[customerField].includes(selector)) {
        templateFieldMapping[customerField].push(selector);
      }
      
      console.log('[useCustomer] Added mapping:', customerField, '->', selector);
    });

    console.log('[useCustomer] Final template field mapping:', templateFieldMapping);
    return templateFieldMapping;
  }, []);

  const setShowMappingInterface = useCallback((show: boolean) => {
    globalShowMappingInterface = show;
    triggerGlobalUpdate();
  }, []);

  const setExtractedFields = useCallback((fields: FormField[]) => {
    globalExtractedFields = fields;
    triggerGlobalUpdate();
  }, []);

  const setPendingTemplate = useCallback((template: PendingTemplate | null) => {
    globalPendingTemplate = template;
    triggerGlobalUpdate();
  }, []);

  // ===============================
  // DATA ANALYSIS FUNCTIONS
  // ===============================

  const getJsonFieldNamesFromCustomers = useCallback((): string[] => {
    const jsonFieldNames = new Set<string>();
    
    globalCustomers.forEach(customer => {
      if ((customer.dataSource === 'json' || customer.dataSource === 'api') && customer.originalData) {
        Object.keys(customer.originalData).forEach(key => {
          const value = customer.originalData[key];
          if (value !== null && value !== undefined && value !== '' && key && key.trim() !== '') {
            jsonFieldNames.add(key.trim());
          }
        });
      }
    });
    
    return Array.from(jsonFieldNames).filter(field => field && field.trim() !== '').sort();
  }, []);

  const getJsonFieldNamesForCustomer = useCallback((customerId: string): string[] => {
    const customer = globalCustomers.find(c => c.id === customerId);
    if (!customer?.originalData) return [];
    
    return Object.keys(customer.originalData)
      .filter(key => {
        const value = customer.originalData[key];
        return value !== null && value !== undefined && value !== '' && key && key.trim() !== '';
      })
      .map(key => key.trim())
      .filter(key => key !== '')
      .sort();
  }, []);

  const detectFieldsFromData = (data: Record<string, any>) => {
    const detected = { name: '', phone: '', email: '', address: '', company: '' };

    Object.entries(FIELD_MAPPINGS).forEach(([fieldType, possibleKeys]) => {
      if (detected[fieldType]) return;
      
      for (const key of possibleKeys) {
        if (data[key] && !detected[fieldType]) {
          const value = data[key].toString().trim();
          if (value) {
            detected[fieldType] = value;
            break;
          }
        }
      }
    });

    if (!detected.address) {
      const addressParts = [];
      if (data.address) addressParts.push(data.address);
      if (data.city) addressParts.push(data.city);
      if (data.state) addressParts.push(data.state);
      if (data.pincode) addressParts.push(data.pincode);
      
      if (addressParts.length > 0) {
        detected.address = addressParts.join(', ');
      }
    }

    return detected;
  };

  const createNotesFromData = (data: Record<string, any>) => {
    const importantFields = [
      'occupation', 'budget_range', 'vehicle_model', 'variant_interest',
      'fuel_preference', 'color_preference', 'purchase_timeline',
      'finance_type', 'employment_type', 'sales_consultant',
      'enquiry_source', 'current_vehicle', 'remarks'
    ];
    
    const notes = [];
    importantFields.forEach(field => {
      if (data[field] && data[field] !== '') {
        const value = data[field].toString();
        if (value.length > 50) {
          notes.push(`${field}: ${value.substring(0, 47)}...`);
        } else {
          notes.push(`${field}: ${value}`);
        }
      }
    });
    
    return notes.length > 0 ? 
      `${notes.slice(0, 3).join(' | ')}` : 
      'Imported customer data';
  };

  const convertToStandardCustomer = useCallback((data: any, dataSource: 'api' | 'json' = 'json'): Omit<Customer, 'id' | 'createdAt'> | null => {
    try {
      console.log('[Customer Conversion] Processing flat JSON data:', { dataSource, keys: Object.keys(data) });

      const detectedFields = detectFieldsFromData(data);
      
      if (!detectedFields.name && !detectedFields.phone) {
        console.warn('[Customer Conversion] No name or phone found');
        return null;
      }

      const standardCustomer: Omit<Customer, 'id' | 'createdAt'> = {
        name: detectedFields.name || 'Customer',
        phone: detectedFields.phone || '',
        email: detectedFields.email || undefined,
        company: detectedFields.company || undefined,
        address: detectedFields.address || undefined,
        notes: createNotesFromData(data),
        dataSource: dataSource,
        originalData: data,
        ...(dataSource === 'api' && {
          scope: data.scope || 'own',
          created_at: data.created_at,
          updated_at: data.updated_at,
          synced: true,
          downloadedAt: new Date().toISOString()
        })
      };

      console.log('[Customer Conversion] Successfully converted:', {
        name: standardCustomer.name,
        phone: standardCustomer.phone,
        dataFields: Object.keys(data).length
      });

      return standardCustomer;
    } catch (error) {
      console.error('[Customer Conversion] Error:', error);
      return null;
    }
  }, []);

  // ===============================
  // CUSTOMER OPERATIONS
  // ===============================

  const loadData = async (): Promise<void> => {
    try {
      const [savedCustomers, savedTemplates] = await Promise.all([
        indexedDBStorage.get(STORAGE_KEYS.CUSTOMERS, []),
        indexedDBStorage.get(STORAGE_KEYS.TEMPLATES, []),
      ]);
      globalCustomers = savedCustomers;
      globalTemplates = savedTemplates;
      triggerGlobalUpdate();
    } catch (error) {
      console.error('[Customer] Failed to load data:', error);
    }
  };

  const addCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<OperationResult> => {
    try {
      console.log('[useCustomer] Adding customer:', customerData.name);
      setLoadingState('add', true);

      const existingCustomer = globalCustomers.find(existing => {
        if (existing.id === customerData.id) return true;
        if (customerData.phone && isPhoneNumberMatch(existing.phone, customerData.phone)) return true;
        if (customerData.email && existing.email && existing.email.toLowerCase() === customerData.email.toLowerCase()) return true;
        return false;
      });

      if (existingCustomer) {
        console.log('[useCustomer] Customer already exists, updating instead:', existingCustomer.id);
        const updatedCustomer = {
          ...existingCustomer,
          ...customerData,
          originalData: {
            ...existingCustomer.originalData,
            ...customerData.originalData
          }
        };
        
        globalCustomers = globalCustomers.map(c => c.id === existingCustomer.id ? updatedCustomer : c);
        await saveCustomersGlobally();
        
        return { success: true, customer: updatedCustomer, updated: true };
      }

      const newCustomer: Customer = {
        ...customerData,
        id: customerData.id || `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        dataSource: customerData.dataSource || 'manual',
      };

      globalCustomers = [...globalCustomers, newCustomer];
      console.log('[useCustomer] Updated global customers, new length:', globalCustomers.length);
      
      await saveCustomersGlobally();

      console.log('[useCustomer] Customer added successfully:', newCustomer.name);
      return { success: true, customer: newCustomer };

    } catch (error) {
      console.error('[useCustomer] Error adding customer:', error);
      return { success: false, error: error.message };
    } finally {
      setLoadingState('add', false);
    }
  }, [setLoadingState, isPhoneNumberMatch]);

  const updateCustomer = useCallback(async (customerId: string, updates: Partial<Customer>): Promise<OperationResult> => {
    try {
      console.log('[useCustomer] Updating customer:', customerId);
      
      globalCustomers = globalCustomers.map(customer =>
        customer.id === customerId ? { ...customer, ...updates } : customer
      );
      
      await saveCustomersGlobally();
      console.log('[useCustomer] Customer updated successfully');

      return { success: true };
    } catch (error) {
      console.error('[useCustomer] Error updating customer:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const deleteCustomer = useCallback(async (customerId: string): Promise<OperationResult> => {
    try {
      console.log('[useCustomer] Deleting customer:', customerId);
      
      globalCustomers = globalCustomers.filter(customer => customer.id !== customerId);
      
      if (globalSelectedCustomer?.id === customerId) {
        globalSelectedCustomer = null;
      }
      if (globalEditingCustomer?.id === customerId) {
        globalEditingCustomer = null;
      }
      
      await saveCustomersGlobally();
      console.log('[useCustomer] Customer deleted successfully');

      return { success: true };
    } catch (error) {
      console.error('[useCustomer] Error deleting customer:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const searchCustomers = useCallback((query: string): Customer[] => {
    if (!query || query.trim().length < 2) return [];
    
    const cleanQuery = query.trim().toLowerCase();
    
    return globalCustomers.filter(customer => {
      if (/^\d/.test(cleanQuery)) {
        return isPhoneNumberMatch(customer.phone, cleanQuery);
      }
      
      const searchFields = [
        customer.name,
        customer.email,
        customer.company,
        customer.notes
      ].filter(Boolean).map(field => field.toLowerCase());
      
      return searchFields.some(field => field.includes(cleanQuery));
    });
  }, [isPhoneNumberMatch]);

  const searchByPhone = useCallback((phone: string): Customer | null => {
    const found = globalCustomers.find(customer => 
      isPhoneNumberMatch(customer.phone, phone)
    );
    
    if (found) {
      setSelectedCustomer(found);
      return found;
    }
    return null;
  }, [setSelectedCustomer, isPhoneNumberMatch]);

  // ===============================
  // FILE OPERATIONS
  // ===============================

  const validateFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.json') || file.type === 'application/json';
  };

  const processJsonData = async (data: any): Promise<{ imported: number; errors: string[] }> => {
    let imported = 0;
    const errors: string[] = [];

    if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
      try {
        const customer = convertToStandardCustomer(data, 'json');
        if (customer) {
          await addCustomer(customer);
          imported = 1;
        } else {
          errors.push('Invalid customer data structure');
        }
      } catch (error) {
        errors.push(`Error processing customer: ${error.message}`);
      }
    } else if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (typeof item === 'object' && item !== null) {
          try {
            const customer = convertToStandardCustomer(item, 'json');
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
  }, [addCustomer, setLoadingState]);

  // ===============================
  // TEMPLATE OPERATIONS
  // ===============================

  const saveTemplate = useCallback(async (templateData: Omit<BusinessTemplate, 'id' | 'createdAt'>): Promise<BusinessTemplate> => {
    const newTemplate: BusinessTemplate = {
      ...templateData,
      id: `template_${Date.now()}`,
      createdAt: Date.now(),
    };

    globalTemplates = [...globalTemplates, newTemplate];
    await saveTemplatesGlobally();
    return newTemplate;
  }, []);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<BusinessTemplate>): Promise<void> => {
    globalTemplates = globalTemplates.map(template =>
      template.id === templateId ? { ...template, ...updates } : template
    );
    await saveTemplatesGlobally();
  }, []);

  const deleteTemplate = useCallback(async (templateId: string): Promise<void> => {
    globalTemplates = globalTemplates.filter(template => template.id !== templateId);
    await saveTemplatesGlobally();
  }, []);

  // ===============================
  // FORM OPERATIONS
  // ===============================

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
        return createResult(true, { fields: response.fields || response.data?.fields });
      } else {
        return createResult(false, null, response.error || 'Failed to extract fields');
      }
    } catch (error) {
      return createResult(false, null, error.message);
    } finally {
      setLoadingState('scan', false);
    }
  }, [setLoadingState]);

  const buildCustomerDataObject = (customer: Customer): Record<string, string> => {
    return {
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      company: customer.company || '',
      address: customer.address || '',
      notes: customer.notes || '',
      ...(customer.originalData || {})
    };
  };

  const autoFillForm = useCallback(async (): Promise<OperationResult> => {
    if (!globalSelectedCustomer || !globalSelectedTemplate) {
      return createResult(false, null, 'Select customer and template first');
    }

    setLoadingState('fill', true);

    try {
      const tabValidation = await validateCurrentTab();
      if (!tabValidation.success) {
        return tabValidation;
      }

      const customerData = buildCustomerDataObject(globalSelectedCustomer);

      const response = await messaging.sendToContent({
        type: 'fillFormWithMapping',
        data: {
          customerData,
          fieldMapping: globalSelectedTemplate.fieldMapping
        }
      });

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
  }, [setLoadingState]);

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
          tagName: field.tagName,
          isVisible: field.isVisible,
          isHidden: field.isHidden,
          isDisabled: field.isDisabled,
          isReadOnly: field.isReadOnly,
          context: field.context,
          className: field.className,
          hasName: field.hasName,
          hasId: field.hasId,
          elementIndex: field.elementIndex,
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
  // MAPPING OPERATIONS (CONSOLIDATED)
  // ===============================

  const createMappingFromFields = useCallback(async (mapping: Record<string, any>): Promise<OperationResult> => {
    console.log('[useCustomer] Creating mapping from fields:', mapping);
    
    if (!globalPendingTemplate) {
      const error = 'No pending template found';
      console.error('[useCustomer]', error);
      return createResult(false, null, error);
    }

    if (!mapping || typeof mapping !== 'object' || Object.keys(mapping).length === 0) {
      const error = 'Invalid or empty mapping data';
      console.error('[useCustomer]', error);
      return createResult(false, null, error);
    }

    try {
      const templateFieldMapping = convertMappingToTemplateFormat(mapping);
      
      if (Object.keys(templateFieldMapping).length === 0) {
        const error = 'No valid mappings found after conversion';
        console.error('[useCustomer]', error);
        return createResult(false, null, error);
      }

      console.log('[useCustomer] Creating template with mapping:', templateFieldMapping);
      
      const template = await saveTemplate({
        name: globalPendingTemplate.name,
        url: globalPendingTemplate.domain,
        fieldMapping: templateFieldMapping,
        extractedFields: globalExtractedFields,
      });

      setShowMappingInterface(false);
      setFieldMapping({});
      setExtractedFields([]);
      setPendingTemplate(null);
      
      console.log('[useCustomer] Template created successfully:', template);
      return createResult(true, { template });
    } catch (error) {
      console.error('[useCustomer] Error creating mapping:', error);
      return createResult(false, null, error.message);
    }
  }, [saveTemplate, convertMappingToTemplateFormat, setShowMappingInterface, setFieldMapping, setExtractedFields, setPendingTemplate]);

  const updateMappingFromFields = useCallback(async (templateId: string, mapping: Record<string, any>): Promise<OperationResult> => {
    console.log('[useCustomer] Updating mapping from fields:', templateId, mapping);
    
    if (!globalPendingTemplate) {
      const error = 'No pending template found';
      console.error('[useCustomer]', error);
      return createResult(false, null, error);
    }

    if (!mapping || typeof mapping !== 'object' || Object.keys(mapping).length === 0) {
      const error = 'Invalid or empty mapping data';
      console.error('[useCustomer]', error);
      return createResult(false, null, error);
    }

    if (!templateId) {
      const error = 'No template ID provided';
      console.error('[useCustomer]', error);
      return createResult(false, null, error);
    }

    try {
      const templateFieldMapping = convertMappingToTemplateFormat(mapping);
      
      if (Object.keys(templateFieldMapping).length === 0) {
        const error = 'No valid mappings found after conversion';
        console.error('[useCustomer]', error);
        return createResult(false, null, error);
      }

      console.log('[useCustomer] Updating template with mapping:', templateFieldMapping);
      
      await updateTemplate(templateId, {
        name: globalPendingTemplate.name,
        url: globalPendingTemplate.domain,
        fieldMapping: templateFieldMapping,
        extractedFields: globalExtractedFields,
      });

      setShowMappingInterface(false);
      setFieldMapping({});
      setExtractedFields([]);
      setPendingTemplate(null);
      
      console.log('[useCustomer] Template updated successfully');
      return createResult(true);
    } catch (error) {
      console.error('[useCustomer] Error updating mapping:', error);
      return createResult(false, null, error.message);
    }
  }, [updateTemplate, convertMappingToTemplateFormat, setShowMappingInterface, setFieldMapping, setExtractedFields, setPendingTemplate]);

  // ===============================
  // UTILITY OPERATIONS
  // ===============================

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
  }, [setExtractedFields, setPendingTemplate, setShowMappingInterface]);

  const refreshCustomers = useCallback(async () => {
    try {
      const savedCustomers = await indexedDBStorage.get(STORAGE_KEYS.CUSTOMERS, []);
      globalCustomers = savedCustomers;
      console.log('[useCustomer] Force refreshed customers:', globalCustomers.length);
      triggerGlobalUpdate();
    } catch (error) {
      console.error('[useCustomer] Error refreshing customers:', error);
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
    hasCustomers: globalCustomers.length > 0,
    hasTemplates: globalTemplates.length > 0,
    canAutoFill: globalSelectedCustomer && globalSelectedTemplate,
    totalCustomers: globalCustomers.length,
    totalTemplates: globalTemplates.length,
    jsonCustomersCount: globalCustomers.filter(c => c.dataSource === 'json').length,
    manualCustomersCount: globalCustomers.filter(c => c.dataSource === 'manual').length,
    downloadedCustomersCount: globalCustomers.filter(c => c.dataSource === 'api').length,
    customersWithDataCount: globalCustomers.filter(c => c.originalData && Object.keys(c.originalData).length > 0).length,
  };

  // ===============================
  // RETURN HOOK INTERFACE
  // ===============================

  return {
    // State Data
    customers,
    templates,
    selectedCustomer,
    selectedTemplate,
    loading,
    extractedFields,
    fieldMapping,
    showMappingInterface,
    editingCustomer,
    pendingTemplate,
    
    // Customer Operations
    setSelectedCustomer,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    searchByPhone,
    
    // Template Operations
    setSelectedTemplate,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    
    // Form Operations
    extractFormFields,
    saveExtractedFields,
    autoFillForm,
    
    // File Operations
    handleFileUpload,
    
    // Mapping Operations
    setFieldMapping,
    createMappingFromFields,
    updateMappingFromFields,
    setShowMappingInterface,
    setExtractedFields,
    setPendingTemplate,
    
    // UI State Management
    setEditingCustomer,
    
    // Utility Functions
    convertToStandardCustomer,
    getJsonFieldNamesFromCustomers,
    getJsonFieldNamesForCustomer,
    checkForExtractedFields,
    refreshCustomers,
    cleanPhoneNumber,
    normalizePhoneNumber,
    isPhoneNumberMatch,
    validateFieldMapping,
    
    // Computed Properties
    ...computedProperties,

    // Debug info
    debugInfo: {
      customersCount: globalCustomers.length,
      templatesCount: globalTemplates.length,
      selectedCustomerId: globalSelectedCustomer?.id,
      selectedTemplateId: globalSelectedTemplate?.id,
      hookInstances: updateFunctions.size,
      downloadedCustomers: globalCustomers.filter(c => c.dataSource === 'api').length,
      customersWithData: globalCustomers.filter(c => c.originalData && Object.keys(c.originalData).length > 0).length,
    }
  };
}