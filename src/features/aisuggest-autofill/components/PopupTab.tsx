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
  Wifi,
  WifiOff,
  Settings,
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

interface ApiCustomer {
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

// Constants - REDUCED for immediate response
const FEEDBACK_DURATION = {
  DEFAULT: 2000,
  SUCCESS: 1500,
} as const;

const SEARCH_DEBOUNCE_MS = 150; // Slightly increased for API calls

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

// Customer conversion from API format to internal format
const convertApiCustomerToStandardCustomer = (
  apiCustomer: ApiCustomer, 
  isLocal: boolean = false
): Customer => {
  try {
    console.log('[Customer Conversion] Processing API customer:', { id: apiCustomer.id, name: apiCustomer.name });

    // Extract display fields
    const name = apiCustomer.name || 'Customer';
    const phone = apiCustomer.phone || '';
    const email = apiCustomer.email || '';
    
    // Extract company from custom_fields
    const company = apiCustomer.custom_fields?.company_name || 
                   apiCustomer.custom_fields?.company || '';
    
    // Build address from custom_fields
    let address = apiCustomer.custom_fields?.address || '';
    if (!address && apiCustomer.custom_fields) {
      const addressParts = [];
      if (apiCustomer.custom_fields.city) addressParts.push(apiCustomer.custom_fields.city);
      if (apiCustomer.custom_fields.state) addressParts.push(apiCustomer.custom_fields.state);
      if (apiCustomer.custom_fields.pincode) addressParts.push(apiCustomer.custom_fields.pincode);
      if (addressParts.length > 0) {
        address = addressParts.join(', ');
      }
    }

    // Create notes from important fields
    const createNotes = () => {
      if (!apiCustomer.custom_fields) return 'API customer';
      
      const importantFields = [
        'occupation', 'vehicle_model_interest', 'budget_min', 'budget_max', 'budget_range',
        'sales_stage', 'priority_level', 'purchase_timeline', 'lead_source'
      ];
      
      const notes = [];
      importantFields.forEach(field => {
        const value = apiCustomer.custom_fields[field];
        if (value && value !== '') {
          notes.push(`${field}: ${value}`);
        }
      });
      
      return notes.length > 0 ? 
        `${notes.slice(0, 3).join(' | ')}` : 
        'API customer';
    };

    const standardCustomer: Customer = {
      id: apiCustomer.id,
      name: name,
      phone: phone,
      email: email || undefined,
      company: company || undefined,
      address: address || undefined,
      notes: createNotes(),
      dataSource: 'api',
      originalData: {
        ...apiCustomer,
        // Flatten custom_fields for easier access
        ...(apiCustomer.custom_fields || {})
      },
      scope: apiCustomer.scope || 'own',
      created_at: apiCustomer.created_at,
      updated_at: apiCustomer.updated_at,
      synced: true,
      downloadedAt: new Date().toISOString(),
      createdAt: Date.now(), // Required field for internal format
    };

    console.log('[Customer Conversion] Successfully converted:', {
      id: standardCustomer.id,
      name: standardCustomer.name,
      phone: standardCustomer.phone,
      dataFields: Object.keys(standardCustomer.originalData || {}).length
    });

    return standardCustomer;
  } catch (error) {
    console.error('[Customer Conversion] Error:', error);
    // Return minimal customer object on error
    return {
      id: apiCustomer.id || `error_${Date.now()}`,
      name: apiCustomer.name || 'Customer',
      phone: apiCustomer.phone || '',
      email: apiCustomer.email,
      dataSource: 'api',
      createdAt: Date.now(),
      notes: 'Conversion error',
      originalData: apiCustomer
    };
  }
};

// Real-time search dropdown component with enhanced API status
const SearchDropdown = ({ 
  searchResults, 
  isSearching, 
  onSelectResult, 
  searchQuery,
  isOpen,
  onClose,
  apiStatus = 'unknown'
}) => {
  if (!isOpen || (!isSearching && searchResults.length === 0)) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
      {/* API Status Header */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {apiStatus === 'ready' ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-green-700">API Connected</span>
            </>
          ) : apiStatus === 'error' ? (
            <>
              <WifiOff className="w-3 h-3 text-red-500" />
              <span className="text-red-700">API Error</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600">API Not Ready</span>
            </>
          )}
        </div>
        {isSearching && (
          <div className="flex items-center gap-1 text-blue-600">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Searching...</span>
          </div>
        )}
      </div>

      {/* Search Results */}
      {!isSearching && searchResults.length === 0 && searchQuery && (
        <div className="p-3 text-center text-sm text-muted-foreground">
          No customers found for "{searchQuery}"
          {apiStatus !== 'ready' && (
            <div className="text-xs text-red-500 mt-1">
              API not connected - only local results shown
            </div>
          )}
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
                  {result.name || 'Customer'}
                </span>
                
                {/* Source Badge */}
                <Badge variant="outline" className="text-xs">
                  {result.isLocal ? '💾 Local' : '🌐 API'}
                </Badge>
                
                {/* Scope Badge */}
                {result.scope && (
                  <Badge variant="outline" className="text-xs">
                    {result.scope === 'own' ? '👤 Personal' : 
                     result.scope === 'tenant' ? '🏢 Company' : '🏛️ Organization'}
                  </Badge>
                )}
                
                {result.isDownloaded && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    ✅ Downloaded
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                📞 {formatPhoneNumber(result.phone)}
                {result.email && ` • 📧 ${result.email}`}
                {result.company && ` • 🏢 ${result.company}`}
              </div>
              
              {/* Enhanced info display */}
              {result.originalData && (
                <div className="text-xs text-blue-600 mt-1 space-y-1">
                  {result.originalData.occupation && (
                    <div>👨‍💼 {result.originalData.occupation}</div>
                  )}
                  {(result.originalData.vehicle_model_interest || result.originalData.vehicle_model) && (
                    <div>🚗 {result.originalData.vehicle_model_interest || result.originalData.vehicle_model}</div>
                  )}
                  {(result.originalData.budget_range || result.originalData.budget_min) && (
                    <div>💰 {result.originalData.budget_range || `${result.originalData.budget_min}-${result.originalData.budget_max}`}</div>
                  )}
                  {(result.originalData.sales_stage) && (
                    <div>📈 {result.originalData.sales_stage}</div>
                  )}
                </div>
              )}
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
  const [apiStatus, setApiStatus] = useState('unknown'); // 'ready', 'error', 'unknown'
  
  // UI states
  const [feedback, setFeedback] = useState(null);
  const [aiSuggestMode, setAiSuggestMode] = useState(false);
  const [isActivatingAiSuggest, setIsActivatingAiSuggest] = useState(false);

  // Refs
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchAbortRef = useRef(null);

  // Initialize API on component mount
  useEffect(() => {
    checkApiStatus();
    
    // Add debug info to console
    console.log('[PopupTab] Component mounted, checking API status...');
    if (typeof window !== 'undefined') {
      // Debug token storage
      const appKitToken = localStorage.getItem('cyepro_appkit_token');
      const appKitSettings = localStorage.getItem('appkit_settings');
      console.log('[PopupTab] Debug - AppKit Token exists:', !!appKitToken);
      console.log('[PopupTab] Debug - AppKit Settings exists:', !!appKitSettings);
      
      if (appKitToken) {
        try {
          const tokenData = JSON.parse(appKitToken);
          console.log('[PopupTab] Debug - Token has data:', !!tokenData.token);
          console.log('[PopupTab] Debug - Token stored at:', tokenData.storedAt);
        } catch (error) {
          console.error('[PopupTab] Debug - Token parse error:', error);
        }
      }
    }
  }, []);

  const checkApiStatus = async () => {
    try {
      console.log('[PopupTab] Checking API status...');
      
      // Check if API is configured and has token
      const config = appKitApi.getConfig();
      console.log('[PopupTab] API Config:', {
        baseUrl: config.baseUrl,
        hasToken: config.hasToken,
        timeout: config.timeout
      });
      
      if (!config.baseUrl || config.baseUrl === 'https://your-api-domain.com') {
        console.log('[PopupTab] API not ready - invalid base URL:', config.baseUrl);
        setApiStatus('error');
        return;
      }
      
      if (!config.hasToken) {
        console.log('[PopupTab] API not ready - missing token');
        setApiStatus('error');
        return;
      }

      // Test API connection
      console.log('[PopupTab] Testing API connection to:', config.baseUrl);
      const testResult = await appKitApi.testConnection();
      console.log('[PopupTab] API test result:', testResult);
      
      if (testResult.success) {
        setApiStatus('ready');
        console.log('[PopupTab] ✅ API ready for customer search');
      } else {
        setApiStatus('error');
        console.error('[PopupTab] ❌ API connection failed:', testResult.error);
      }
    } catch (error) {
      setApiStatus('error');
      console.error('[PopupTab] ❌ API status check error:', error);
    }
  };

  // Feedback handlers
  const showFeedback = useCallback((type: string, message: string, duration = FEEDBACK_DURATION.DEFAULT) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), duration);
  }, []);

  const showSuccess = useCallback((message: string) => showFeedback('success', message, FEEDBACK_DURATION.SUCCESS), [showFeedback]);
  const showError = useCallback((message: string) => showFeedback('error', message), [showFeedback]);

  // IMPROVED: Real API search with local customers fallback
  const performSearch = useCallback(async (query: string) => {
    console.log('[PopupTab] 🔍 Performing search for:', query);
    
    // Cancel previous search
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
    
    // Allow single character searches for immediate response
    if (!query || query.trim().length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    // Create new abort controller
    searchAbortRef.current = new AbortController();
    
    setIsSearching(true);
    setShowDropdown(true);

    try {
      const cleanedQuery = query.trim();
      
      // First, search in local customers IMMEDIATELY
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

      console.log('[PopupTab] 📱 Local matches found:', localMatches.length);

      // API search if API is ready
      let apiResults = [];
      if (apiStatus === 'ready') {
        try {
          console.log('[PopupTab] 🚀 Calling API search...');
          const response = await appKitApi.searchCustomersImmediate(cleanedQuery, {
            limit: 10
          });
          
          if (response.success && response.data) {
            // Convert API customers to standard format
            apiResults = response.data.map(apiCustomer => 
              convertApiCustomerToStandardCustomer(apiCustomer, false)
            );
            console.log('[PopupTab] ✅ API search completed:', apiResults.length, 'results');
          } else {
            console.warn('[PopupTab] ⚠️ API search returned no results:', response.error);
          }
        } catch (apiError) {
          if (apiError.name !== 'AbortError') {
            console.error('[PopupTab] ❌ API search error:', apiError);
            setApiStatus('error');
          }
        }
      } else {
        console.log('[PopupTab] ⏭️ Skipping API search - status:', apiStatus);
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
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        return aName.localeCompare(bName);
      });

      const finalResults = sortedResults.slice(0, 10); // Limit to 10 results
      setSearchResults(finalResults);
      
      console.log('[PopupTab] 📊 Final results:', {
        local: localMatches.length,
        api: apiResults.length,
        combined: finalResults.length
      });
      
      if (finalResults.length > 0) {
        setRecentSearches(prev => {
          const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
          return updated;
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('[PopupTab] ❌ Search error:', error);
        setSearchResults([]);
      }
    } finally {
      if (!searchAbortRef.current?.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, [customers, apiStatus]);

  // Handle search input change with REDUCED debouncing for immediate feel
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // IMMEDIATE search for better UX
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, SEARCH_DEBOUNCE_MS);
  }, [performSearch]);

  // Handle search result selection
  const handleSelectSearchResult = useCallback(async (result) => {
    try {
      setShowDropdown(false);
      setSearchQuery('');
      setSearchResults([]);

      // If customer is already downloaded, just select the existing one
      if (result.isDownloaded && result.existingCustomer) {
        setSelectedCustomer(result.existingCustomer);
        showSuccess(`Selected ${result.name} (already downloaded)`);
        return;
      }

      if (result.isLocal) {
        setSelectedCustomer(result);
        showSuccess(`Selected ${result.name}`);
        return;
      }

      setIsSearching(true);

      // Download API customer to local storage
      const addResult = await addCustomer(result);
      
      if (addResult && addResult.success !== false) {
        setSelectedCustomer(result);
        const fieldCount = Object.keys(result.originalData || {}).length;
        showSuccess(`Downloaded ${result.name} - ${fieldCount} data fields available`);
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

  // API configuration
  const handleConfigureApi = useCallback(() => {
    // This could open a configuration modal or redirect to settings
    showFeedback('info', 'API configuration needed. Please configure base URL and ensure login.');
  }, [showFeedback]);

  // Debug API connection
  const handleDebugApi = useCallback(() => {
    console.log('=== MANUAL API DEBUG ===');
    
    // Check localStorage
    const appKitToken = localStorage.getItem('cyepro_appkit_token');
    const appKitSettings = localStorage.getItem('appkit_settings');
    const supabaseToken = localStorage.getItem('supabase.auth.token');
    
    console.log('1. Tokens in localStorage:');
    console.log('   - Supabase:', supabaseToken ? 'EXISTS' : 'MISSING');
    console.log('   - AppKit:', appKitToken ? 'EXISTS' : 'MISSING');
    console.log('   - Settings:', appKitSettings ? 'EXISTS' : 'MISSING');
    
    if (appKitToken) {
      try {
        const tokenData = JSON.parse(appKitToken);
        console.log('2. AppKit Token Details:');
        console.log('   - Has token:', !!tokenData.token);
        console.log('   - Stored at:', tokenData.storedAt);
        console.log('   - Expires at:', tokenData.expires_at);
        if (tokenData.token) {
          console.log('   - Token preview:', `${tokenData.token.substring(0, 20)}...`);
        }
      } catch (error) {
        console.error('2. Error parsing AppKit token:', error);
      }
    }
    
    // Check API config
    const config = appKitApi.getConfig();
    console.log('3. API Configuration:');
    console.log('   - Base URL:', config.baseUrl);
    console.log('   - Has Token:', config.hasToken);
    console.log('   - Is Ready:', appKitApi.isReady());
    
    // Try connection test
    console.log('4. Testing connection...');
    appKitApi.testConnection().then(result => {
      console.log('   - Test result:', result);
    }).catch(error => {
      console.error('   - Test error:', error);
    });
    
    console.log('=== END DEBUG ===');
    
    showFeedback('info', 'Debug info logged to console (F12)');
  }, [showFeedback]);

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
            
            {/* API Status Indicator */}
            <div className="ml-auto flex items-center gap-1 text-xs">
              {apiStatus === 'ready' ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">API Ready</span>
                </>
              ) : apiStatus === 'error' ? (
                <>
                  <WifiOff className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">API Error</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-500">API Not Ready</span>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          
          {/* Real-time Search with Enhanced Dropdown */}
          <div className="space-y-2" ref={dropdownRef}>
            <div className="relative">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search customers by phone/name/email... (live API search)"
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
                
                {/* Loading indicator in input */}
                {isSearching && (
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>

              {/* Enhanced Real-time Search Dropdown */}
              <SearchDropdown
                searchResults={searchResults}
                isSearching={isSearching}
                onSelectResult={handleSelectSearchResult}
                searchQuery={searchQuery}
                isOpen={showDropdown}
                onClose={() => setShowDropdown(false)}
                apiStatus={apiStatus}
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

          {/* Selected Customer - Enhanced for API data */}
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
              
              {/* Enhanced Data Source Badges */}
              <div className="flex gap-1 mb-2 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    selectedCustomer.dataSource === 'api' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    selectedCustomer.dataSource === 'json' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {selectedCustomer.dataSource === 'api' ? '🌐 API' :
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

                {/* Enhanced info for API data */}
                {selectedCustomer.originalData && (
                  <div className="space-y-1 text-xs text-blue-600">
                    {selectedCustomer.originalData.occupation && (
                      <div>👨‍💼 {selectedCustomer.originalData.occupation}</div>
                    )}
                    {(selectedCustomer.originalData.vehicle_model_interest || selectedCustomer.originalData.vehicle_model) && (
                      <div>🚗 {selectedCustomer.originalData.vehicle_model_interest || selectedCustomer.originalData.vehicle_model}</div>
                    )}
                    {(selectedCustomer.originalData.budget_range || selectedCustomer.originalData.budget_min) && (
                      <div>💰 {selectedCustomer.originalData.budget_range || `${selectedCustomer.originalData.budget_min}-${selectedCustomer.originalData.budget_max}`}</div>
                    )}
                    {selectedCustomer.originalData.sales_stage && (
                      <div>📈 {selectedCustomer.originalData.sales_stage}</div>
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

          {/* API Status Actions */}
          {apiStatus !== 'ready' && (
            <div className="space-y-2">
              <div className="text-xs text-center text-red-600 bg-red-50 rounded p-2">
                ⚠️ API not connected - only local customers shown.
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={checkApiStatus}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Wifi className="w-3 h-3 mr-1" />
                  Retry Connection
                </Button>
                <Button
                  onClick={handleConfigureApi}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configure API
                </Button>
              </div>
              <Button
                onClick={handleDebugApi}
                variant="outline"
                size="sm"
                className="w-full"
              >
                🔍 Debug API (Check Console)
              </Button>
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
          {customers.length === 0 && apiStatus !== 'ready' && (
            <div className="text-center text-xs text-muted-foreground bg-blue-50 rounded p-3">
              <div className="mb-2">Getting started with API integration</div>
              <div className="space-y-1">
                <div>• Make sure you're logged in to get API access</div>
                <div>• Configure API base URL in settings if needed</div>
                <div>• Search by phone/name to find customers</div>
                <div>• Click on search results to download them</div>
                <div>• Downloaded customers have rich data for mapping</div>
              </div>
            </div>
          )}

          {templates.length === 0 && customers.length > 0 && (
            <div className="text-center text-xs text-muted-foreground bg-yellow-50 rounded p-3">
              <div className="mb-2">Templates needed</div>
              <div className="text-xs">Use the AI Scan tab to create form templates</div>
            </div>
          )}
          
        </CardContent>
      </Card>
    </TabsContent>
  );
}