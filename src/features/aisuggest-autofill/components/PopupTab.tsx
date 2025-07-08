// features/aisuggest-autofill/components/PopupTab.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Badge } from '@voilajsx/uikit/badge';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voilajsx/uikit/select';
import { 
  Users, 
  Search, 
  Zap, 
  Sparkles, 
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Clock,
  Building,
  User,
  X,
  Globe,
  Car,
  Database,
} from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';
import { useCustomer } from '../../shared/hooks/useCustomer';
import appKitApi from '@/features/shared/services/appKitApi';

// Types
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

// Constants
const FEEDBACK_DURATION = {
  DEFAULT: 2000,
  SUCCESS: 1500,
} as const;

const SEARCH_DEBOUNCE_MS = 300;

// Utility functions
const formatPhoneNumber = (phone: string) => {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  } else if (digits.length > 5) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return digits;
};

const cleanPhoneNumber = (phone: string) => {
  if (!phone) return '';
  return phone.toString().replace(/[^\d]/g, '');
};

// IMPROVED: Better search logic for mobile numbers
const isPhoneNumberMatch = (customerPhone: string, searchQuery: string): boolean => {
  if (!customerPhone || !searchQuery) return false;
  
  const cleanCustomerPhone = cleanPhoneNumber(customerPhone);
  const cleanSearchQuery = cleanPhoneNumber(searchQuery);
  
  // If search query is numeric, do phone number matching
  if (/^\d+$/.test(cleanSearchQuery)) {
    // Exact match
    if (cleanCustomerPhone === cleanSearchQuery) return true;
    
    // Starts with match
    if (cleanCustomerPhone.startsWith(cleanSearchQuery)) return true;
    
    // Contains match (for partial searches)
    if (cleanCustomerPhone.includes(cleanSearchQuery)) return true;
  }
  
  return false;
};

// IMPROVED: Better search logic for names and emails
const isTextMatch = (text: string, searchQuery: string): boolean => {
  if (!text || !searchQuery) return false;
  return text.toLowerCase().includes(searchQuery.toLowerCase());
};

// Customer conversion for flat JSON structure
const convertToStandardCustomer = (
  data: any, 
  dataSource: 'api' | 'json' = 'api'
): Omit<Customer, 'id' | 'createdAt'> | null => {
  try {
    console.log('[Customer Conversion] Processing flat JSON data:', { dataSource, data });

    // Extract key fields from flat structure
    const name = data.customer_name || data.name || data['Customer Name'] || '';
    const phone = data.phone || data.mobile || data.contact || data['Contact No'] || '';
    const email = data.email || data['Email ID'] || '';
    const company = data.company_name || data.company || data['Company Name'] || '';
    
    // Combine address from multiple fields if needed
    let address = data.address || data['Address'] || '';
    if (!address && (data.city || data.state || data.pincode)) {
      const addressParts = [];
      if (data.city) addressParts.push(data.city);
      if (data.state) addressParts.push(data.state);
      if (data.pincode) addressParts.push(data.pincode);
      address = addressParts.join(', ');
    }

    if (!name && !phone) {
      console.warn('[Customer Conversion] No name or phone found');
      return null;
    }

    // Create rich notes from the data
    const createNotes = () => {
      const importantFields = [
        'occupation', 'budget_range', 'vehicle_model', 'variant_interest',
        'fuel_preference', 'color_preference', 'purchase_timeline',
        'finance_type', 'employment_type', 'sales_consultant',
        'enquiry_source', 'current_vehicle'
      ];
      
      const notes = [];
      importantFields.forEach(field => {
        if (data[field] && data[field] !== '') {
          notes.push(`${field}: ${data[field]}`);
        }
      });
      
      return notes.length > 0 ? 
        `${notes.slice(0, 3).join(' | ')}` : 
        dataSource === 'api' ? 'Downloaded customer' : 'Imported customer';
    };

    const standardCustomer: Omit<Customer, 'id' | 'createdAt'> = {
      name: name,
      phone: phone,
      email: email || undefined,
      company: company || undefined,
      address: address || undefined,
      notes: createNotes(),
      dataSource: dataSource,
      originalData: data, // Keep all original flat data for comprehensive mapping
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
};

// Real-time search dropdown component
const SearchDropdown = ({ 
  searchResults, 
  isSearching, 
  onSelectResult, 
  searchQuery,
  isOpen,
  onClose
}) => {
  if (!isOpen || (!isSearching && searchResults.length === 0)) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
      {isSearching && (
        <div className="p-3 text-center text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
          Searching...
        </div>
      )}
      
      {!isSearching && searchResults.length === 0 && searchQuery && (
        <div className="p-3 text-center text-sm text-muted-foreground">
          No customers found for "{searchQuery}"
        </div>
      )}
      
      {searchResults.map((result, index) => (
        <div
          key={result.id || index}
          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
          onClick={() => onSelectResult(result)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {result.customer_name || result.name || 'Customer'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {result.scope === 'own' ? 'Personal' : 
                   result.scope === 'tenant' ? 'Company' : 'Organization'}
                </Badge>
                {result.isDownloaded && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    ✅ Downloaded
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                📞 {formatPhoneNumber(result.phone)}
                {result.email && ` • 📧 ${result.email}`}
                {result.company_name && ` • 🏢 ${result.company_name}`}
              </div>
              
              {/* Enhanced info display for flat JSON */}
              <div className="text-xs text-blue-600 mt-1 space-y-1">
                {result.occupation && (
                  <div>👨‍💼 {result.occupation}</div>
                )}
                {result.vehicle_model && (
                  <div>🚗 {result.vehicle_model}</div>
                )}
                {result.budget_range && (
                  <div>💰 {result.budget_range}</div>
                )}
                {result.purchase_timeline && (
                  <div>📅 {result.purchase_timeline}</div>
                )}
              </div>
            </div>
            <div className="ml-2">
              {result.isDownloaded ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Download className="w-4 h-4 text-blue-500" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface PopupTabProps {
  value: string;
}

export default function PopupTab({ value }: PopupTabProps) {
  const {
    customers,
    templates,
    selectedCustomer,
    selectedTemplate,
    loading,
    setSelectedCustomer,
    setSelectedTemplate,
    autoFillForm,
    addCustomer,
    debugInfo,
  } = useCustomer();

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // UI states
  const [feedback, setFeedback] = useState(null);
  const [aiSuggestMode, setAiSuggestMode] = useState(false);
  const [isActivatingAiSuggest, setIsActivatingAiSuggest] = useState(false);

  // Refs
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Feedback handlers
  const showFeedback = useCallback((type: string, message: string, duration = FEEDBACK_DURATION.DEFAULT) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), duration);
  }, []);

  const showSuccess = useCallback((message: string) => showFeedback('success', message, FEEDBACK_DURATION.SUCCESS), [showFeedback]);
  const showError = useCallback((message: string) => showFeedback('error', message), [showFeedback]);

  // IMPROVED: Real-time search with better logic
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    try {
      const cleanedQuery = query.trim();
      
      // First, search in local customers
      const localMatches = customers.filter(customer => {
        // Phone number matching
        if (/^\d/.test(cleanedQuery)) {
          return isPhoneNumberMatch(customer.phone, cleanedQuery);
        }
        
        // Name or email matching
        return (
          isTextMatch(customer.name, cleanedQuery) ||
          isTextMatch(customer.email || '', cleanedQuery) ||
          isTextMatch(customer.company || '', cleanedQuery)
        );
      });

      // Then search API if needed
      let apiResults = [];
      try {
        const response = await appKitApi.searchCustomers(cleanedQuery);
        if (response.success && response.data) {
          apiResults = response.data;
        }
      } catch (apiError) {
        console.error('API search error:', apiError);
      }

      // Create map of existing customers for duplicate detection
      const existingCustomerMap = new Map();
      customers.forEach(c => {
        const phone = cleanPhoneNumber(c.phone || '');
        const email = c.email?.toLowerCase() || '';
        
        if (c.id) existingCustomerMap.set(`id_${c.id}`, c);
        if (phone) existingCustomerMap.set(`phone_${phone}`, c);
        if (email) existingCustomerMap.set(`email_${email}`, c);
      });
      
      // Mark API results with download status
      const apiResultsWithStatus = apiResults.map(result => {
        const resultPhone = cleanPhoneNumber(result.phone || '');
        const resultEmail = result.email?.toLowerCase() || '';
        
        let existingCustomer = null;
        if (result.id && existingCustomerMap.has(`id_${result.id}`)) {
          existingCustomer = existingCustomerMap.get(`id_${result.id}`);
        } else if (resultPhone && existingCustomerMap.has(`phone_${resultPhone}`)) {
          existingCustomer = existingCustomerMap.get(`phone_${resultPhone}`);
        } else if (resultEmail && existingCustomerMap.has(`email_${resultEmail}`)) {
          existingCustomer = existingCustomerMap.get(`email_${resultEmail}`);
        }
        
        return {
          ...result,
          isDownloaded: !!existingCustomer,
          existingCustomer: existingCustomer
        };
      });

      // Combine and filter results
      const combinedResults = [
        ...localMatches.map(customer => ({ ...customer, isLocal: true, isDownloaded: true })),
        ...apiResultsWithStatus.filter(apiResult => !apiResult.isDownloaded)
      ];

      // Sort results: exact matches first, then partial matches
      const sortedResults = combinedResults.sort((a, b) => {
        const aPhone = cleanPhoneNumber(a.phone || '');
        const bPhone = cleanPhoneNumber(b.phone || '');
        const cleanQuery = cleanPhoneNumber(cleanedQuery);

        // Exact phone matches first
        if (aPhone === cleanQuery && bPhone !== cleanQuery) return -1;
        if (bPhone === cleanQuery && aPhone !== cleanQuery) return 1;

        // Then starts with matches
        if (aPhone.startsWith(cleanQuery) && !bPhone.startsWith(cleanQuery)) return -1;
        if (bPhone.startsWith(cleanQuery) && !aPhone.startsWith(cleanQuery)) return 1;

        // Then alphabetical by name
        const aName = (a.customer_name || a.name || '').toLowerCase();
        const bName = (b.customer_name || b.name || '').toLowerCase();
        return aName.localeCompare(bName);
      });

      setSearchResults(sortedResults.slice(0, 10)); // Limit to 10 results
      
      if (sortedResults.length > 0) {
        setRecentSearches(prev => {
          const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
          return updated;
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [customers]);

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, SEARCH_DEBOUNCE_MS);
  }, [performSearch]);

  // Handle search result selection with flat JSON support
  const handleSelectSearchResult = useCallback(async (result) => {
    try {
      setShowDropdown(false);
      setSearchQuery('');
      setSearchResults([]);

      // If customer is already downloaded, just select the existing one
      if (result.isDownloaded && result.existingCustomer) {
        setSelectedCustomer(result.existingCustomer);
        showSuccess(`Selected ${result.customer_name || result.name} (already downloaded)`);
        return;
      }

      if (result.isLocal) {
        setSelectedCustomer(result);
        showSuccess(`Selected ${result.name}`);
        return;
      }

      setIsSearching(true);

      // Convert flat JSON data to standard customer format
      const customerData = convertToStandardCustomer(result, 'api');
      
      if (!customerData) {
        showError('Failed to process customer data');
        return;
      }

      const newCustomer: Customer = {
        ...customerData,
        id: result.id || `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      };

      console.log('[PopupTab] Downloading customer with flat JSON data:', {
        name: newCustomer.name,
        originalDataKeys: Object.keys(newCustomer.originalData || {}),
        dataSource: newCustomer.dataSource,
        mappableFields: Object.keys(newCustomer.originalData || {}).length
      });

      const addResult = await addCustomer(newCustomer);
      
      if (addResult && addResult.success !== false) {
        setSelectedCustomer(newCustomer);
        const fieldCount = Object.keys(newCustomer.originalData || {}).length;
        showSuccess(`Downloaded ${result.customer_name || result.name} - ${fieldCount} data fields available for mapping`);
      } else {
        showError(addResult?.error || 'Failed to save customer locally');
      }
      
    } catch (error) {
      console.error('[PopupTab] Download error:', error);
      showError(`Failed to download customer: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  }, [addCustomer, setSelectedCustomer, showError, showSuccess]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick select from local customers
  const handleQuickSelect = useCallback((customer) => {
    setSelectedCustomer(customer);
    setSearchQuery(customer.phone);
    showSuccess(`Selected ${customer.name}`);
  }, [setSelectedCustomer, showSuccess]);

  // Template selection
  const handleTemplateSelection = useCallback((templateId) => {
    if (templateId === 'no-templates') return;
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    if (template) {
      showSuccess(`Template selected`);
    }
  }, [templates, setSelectedTemplate, showSuccess]);

  // Auto fill
  const handleAutoFill = useCallback(async () => {
    if (!selectedCustomer || !selectedTemplate) {
      showError('Select customer and template first');
      return;
    }

    try {
      const result = await autoFillForm();
      if (result.success) {
        showSuccess(`Filled ${result.filledCount || 0} fields`);
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('AutoFill failed');
    }
  }, [selectedCustomer, selectedTemplate, autoFillForm, showError, showSuccess]);

  // AI Suggest toggle
  const handleAISuggestToggle = useCallback(async () => {
    if (!selectedCustomer) {
      showError('Select customer first');
      return;
    }
    
    if (!selectedCustomer.originalData || Object.keys(selectedCustomer.originalData).length === 0) {
      showError('Customer needs data for AI suggestions');
      return;
    }
    
    if (!selectedTemplate) {
      showError('Select template first');
      return;
    }
    
    if (!selectedTemplate.fieldMapping || Object.keys(selectedTemplate.fieldMapping).length === 0) {
      showError('Template needs field mapping');
      return;
    }

    setIsActivatingAiSuggest(true);
    try {
      if (!aiSuggestMode) {
        const result = await messaging.sendToContent({
          type: 'enableAiSuggestMode',
          data: {
            customerData: selectedCustomer.originalData,
            customerName: selectedCustomer.name,
            selectedTemplate: selectedTemplate,
          }
        });
        
        if (result && result.success) {
          setAiSuggestMode(true);
          showSuccess(`AI Suggest activated`);
        } else {
          showError('AI Suggest failed');
        }
      } else {
        await messaging.sendToContent({
          type: 'disableAiSuggestMode',
          data: {}
        });
        setAiSuggestMode(false);
        showSuccess('AI Suggest deactivated');
      }
    } catch (error) {
      showError('AI Suggest failed');
    } finally {
      setIsActivatingAiSuggest(false);
    }
  }, [selectedCustomer, selectedTemplate, aiSuggestMode, showError, showSuccess]);

  // Computed values
  const canAutoFill = useMemo(() => {
    return selectedCustomer && selectedTemplate;
  }, [selectedCustomer, selectedTemplate]);

  const canUseAiSuggest = useMemo(() => {
    return (
      selectedCustomer?.originalData && 
      Object.keys(selectedCustomer.originalData).length > 0 &&
      selectedTemplate?.fieldMapping && 
      Object.keys(selectedTemplate.fieldMapping).length > 0
    );
  }, [selectedCustomer, selectedTemplate]);

  const localCustomers = useMemo(() => customers.slice(0, 3), [customers]);

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4" />
            Customer AutoFill
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          
          {/* Real-time Search with Dropdown */}
          <div className="space-y-2" ref={dropdownRef}>
            <div className="relative">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search customers by phone/name/email..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10"
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true);
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowDropdown(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Real-time Search Dropdown */}
              <SearchDropdown
                searchResults={searchResults}
                isSearching={isSearching}
                onSelectResult={handleSelectSearchResult}
                searchQuery={searchQuery}
                isOpen={showDropdown}
                onClose={() => setShowDropdown(false)}
              />
            </div>

            {/* Recent searches */}
            {recentSearches.length > 0 && !showDropdown && !searchQuery && (
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  Recent searches:
                </div>
                <div className="flex gap-1 flex-wrap">
                  {recentSearches.map((search, index) => (
                    <React.Fragment key={index}>
                      <button
                        onClick={() => setSearchQuery(search)}
                        className="text-blue-600 hover:underline"
                      >
                        {search}
                      </button>
                      {index < recentSearches.length - 1 && ', '}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Quick select from downloaded customers */}
            {localCustomers.length > 0 && !selectedCustomer && !showDropdown && (
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <Download className="w-3 h-3" />
                  Downloaded:
                </div>
                <div className="flex gap-1 flex-wrap">
                  {localCustomers.map((customer, index) => (
                    <React.Fragment key={customer.id}>
                      <button
                        className="text-primary hover:underline"
                        onClick={() => handleQuickSelect(customer)}
                      >
                        {customer.name}
                      </button>
                      {index < localCustomers.length - 1 && ', '}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Customer - Enhanced for flat JSON */}
          {selectedCustomer && (
            <div className="p-3 bg-muted/30 rounded border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">{selectedCustomer.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPhoneNumber(selectedCustomer.phone)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setSearchQuery('');
                  }}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
              
              {/* Data Source Badge */}
              <div className="flex gap-1 mb-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    selectedCustomer.dataSource === 'api' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    selectedCustomer.dataSource === 'json' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {selectedCustomer.dataSource === 'api' ? '🌐 Downloaded' :
                   selectedCustomer.dataSource === 'json' ? '📄 JSON' :
                   '✏️ Manual'}
                </Badge>
                
                {selectedCustomer.scope && (
                  <Badge variant="outline" className="text-xs">
                    {selectedCustomer.scope === 'own' ? '👤 Personal' :
                     selectedCustomer.scope === 'tenant' ? '🏢 Company' : '🏛️ Organization'}
                  </Badge>
                )}

                {/* Show available data fields count */}
                {selectedCustomer.originalData && (
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Database className="w-3 h-3 mr-1" />
                    {Object.keys(selectedCustomer.originalData).length} fields
                  </Badge>
                )}
              </div>
              
              {/* Customer Details */}
              <div className="text-xs text-muted-foreground space-y-1">
                {selectedCustomer.email && (
                  <div>📧 {selectedCustomer.email}</div>
                )}
                {selectedCustomer.company && (
                  <div>🏢 {selectedCustomer.company}</div>
                )}

                {/* Enhanced info for flat JSON structure */}
                {selectedCustomer.originalData && (
                  <div className="space-y-1 text-xs text-blue-600">
                    {selectedCustomer.originalData.occupation && (
                      <div>👨‍💼 {selectedCustomer.originalData.occupation}</div>
                    )}
                    {selectedCustomer.originalData.vehicle_model && (
                      <div>🚗 {selectedCustomer.originalData.vehicle_model}</div>
                    )}
                    {selectedCustomer.originalData.budget_range && (
                      <div>💰 {selectedCustomer.originalData.budget_range}</div>
                    )}
                    {selectedCustomer.originalData.purchase_timeline && (
                      <div>📅 {selectedCustomer.originalData.purchase_timeline}</div>
                    )}
                  </div>
                )}

                {selectedCustomer.downloadedAt && (
                  <div className="text-xs text-blue-600">
                    ⬇️ Downloaded {new Date(selectedCustomer.downloadedAt).toLocaleDateString()}
                  </div>
                )}
                {selectedCustomer.originalData && (
                  <div className="text-xs text-purple-600">
                    💡 Rich data available for AI suggestions and mapping
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Template Selection */}
          <div className="space-y-1">
            <Select
              value={selectedTemplate?.id || ''}
              onValueChange={handleTemplateSelection}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={
                  templates.length > 0 
                    ? "Select form template" 
                    : "No templates available - Create one first"
                } />
              </SelectTrigger>
              <SelectContent>
                {templates.length > 0 ? (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({Object.keys(template.fieldMapping).length} fields)
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-templates" disabled>
                    No templates available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            
            {templates.length === 0 && (
              <div className="text-xs text-muted-foreground text-center">
                Use "AI Scan" tab to create templates
              </div>
            )}
          </div>

          {/* Main Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleAutoFill}
              disabled={!canAutoFill || loading.fill}
              className="flex-1"
              size="sm"
            >
              {loading.fill ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Auto Fill
            </Button>

            <Button
              onClick={handleAISuggestToggle}
              disabled={!canUseAiSuggest || isActivatingAiSuggest}
              variant={aiSuggestMode ? "default" : "outline"}
              className="flex-1"
              size="sm"
            >
              {isActivatingAiSuggest ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {aiSuggestMode ? 'AI ON' : 'AI Suggest'}
            </Button>
          </div>

          {/* Status Messages */}
          {aiSuggestMode && (
            <div className="text-xs text-center text-purple-600 bg-purple-50 rounded p-2">
              ✨ AI Suggest active - click highlighted fields on the page
            </div>
          )}

          {!canAutoFill && (selectedCustomer || selectedTemplate) && (
            <div className="text-xs text-center text-orange-600 bg-orange-50 rounded p-2">
              {!selectedCustomer ? 'Search and select a customer' : 'Select template'}
            </div>
          )}

          {/* Enhanced mapping info for selected customer */}
          {selectedCustomer?.originalData && (
            <div className="text-xs text-center text-blue-600 bg-blue-50 rounded p-2">
              💡 {Object.keys(selectedCustomer.originalData).length} data fields available for mapping
              {selectedTemplate && ` • Template maps ${Object.keys(selectedTemplate.fieldMapping || {}).length} fields`}
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'} className="py-2">
              {feedback.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className="text-sm">{feedback.message}</AlertDescription>
            </Alert>
          )}

          {/* Getting started guidance */}
          {customers.length === 0 && (
            <div className="text-center text-xs text-muted-foreground bg-blue-50 rounded p-3">
              <div className="mb-2">No customers downloaded yet</div>
              <div className="space-y-1">
                <div>• Search by phone/name to find customers</div>
                <div>• Click on search results to download them</div>
                <div>• Downloaded customers have rich data for mapping</div>
              </div>
            </div>
          )}

          {templates.length === 0 && customers.length > 0 && (
            <div className="text-center text-xs text-muted-foreground bg-yellow-50 rounded p-3">
              <div className="mb-2">No templates found</div>
              <div className="text-xs">Use the AI Scan tab to create form templates</div>
            </div>
          )}
          
        </CardContent>
      </Card>
    </TabsContent>
  );
}