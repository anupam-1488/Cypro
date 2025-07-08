// features/ai-scan/components/OptionsPanel.tsx
import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Label } from '@voilajsx/uikit/label';
import { Badge } from '@voilajsx/uikit/badge';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Switch } from '@voilajsx/uikit/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voilajsx/uikit/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@voilajsx/uikit/collapsible';
import {
  Globe,
  Edit,
  Trash2,
  Save,
  Scan,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Settings,
  MapPin,
  Zap,
  Database,
  Link,
  Users,
  Filter,
  User,
} from 'lucide-react';
import { useCustomer } from '../../shared/hooks/useCustomer';
import { messaging } from '@voilajsx/comet/messaging';

// Constants
const FEEDBACK_DURATION = 2000;

// Custom hooks
const useFeedback = () => {
  const [feedback, setFeedback] = useState(null);
  
  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), FEEDBACK_DURATION);
  }, []);
  
  return { feedback, showFeedback };
};

// Enhanced template card component
const TemplateCard = memo(({ template, onEdit, onDelete }) => (
  <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium">{template.name}</h3>
          <Badge variant="outline" className="text-xs">
            {Object.values(template.fieldMapping).flat().length} fields
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {template.url}
        </div>
        {template.extractedFields && (
          <div className="text-xs text-blue-600 mt-1">
            📊 {template.extractedFields.length} scanned fields
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(template)}>
          <Edit className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(template.id)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  </div>
));

// IMPROVED: Customer selector for dynamic field mapping
const CustomerSelector = memo(({ 
  customers, 
  selectedCustomer, 
  onSelectCustomer,
  availableFieldsCount 
}) => {
  const customersWithData = customers.filter(c => 
    c.originalData && Object.keys(c.originalData).length > 0
  );

  return (
    <div className="space-y-3">
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="text-sm font-medium text-purple-800 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Select Customer for Dynamic Field Mapping:
        </div>
        
        <Select
          value={selectedCustomer?.id || 'none'}
          onValueChange={(customerId) => {
            const customer = customerId === 'none' ? null : customers.find(c => c.id === customerId);
            onSelectCustomer(customer);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {selectedCustomer ? (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{selectedCustomer.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(selectedCustomer.originalData || {}).length} fields
                  </Badge>
                </div>
              ) : (
                <span className="text-gray-500">Choose customer to see their available fields...</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-gray-500">No customer selected</span>
            </SelectItem>
            {customersWithData.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{customer.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(customer.originalData || {}).length} fields
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {customer.dataSource}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {customersWithData.length === 0 && (
          <div className="text-sm text-purple-700 mt-2">
            No customers with data found. Download customers first using the AutoFill tab.
          </div>
        )}

        {selectedCustomer && (
          <div className="mt-3 p-3 bg-white rounded border">
            <div className="text-sm font-medium text-gray-800 mb-2">
              Available Fields for {selectedCustomer.name}:
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
              {Object.keys(selectedCustomer.originalData || {}).slice(0, 12).map(field => (
                <Badge key={field} variant="outline" className="text-xs justify-start">
                  {field}
                </Badge>
              ))}
              {Object.keys(selectedCustomer.originalData || {}).length > 12 && (
                <Badge variant="outline" className="text-xs">
                  +{Object.keys(selectedCustomer.originalData || {}).length - 12} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// IMPROVED: Perfect field mapping component with dynamic customer data
const PerfectFieldMappingCard = memo(({ 
  field, 
  selectedJsonField, 
  jsonFields, 
  onFieldMapping,
  mappingIndex,
  selectedCustomer
}) => {
  // Local state for immediate UI feedback
  const [localSelection, setLocalSelection] = useState(selectedJsonField || 'none');

  // Update local state when props change
  useEffect(() => {
    setLocalSelection(selectedJsonField || 'none');
  }, [selectedJsonField]);

  const getFieldTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'email': return '📧';
      case 'tel': case 'phone': return '📞';
      case 'url': return '🔗';
      case 'password': return '🔒';
      case 'select': return '📋';
      case 'textarea': return '📝';
      case 'number': return '🔢';
      default: return '✏️';
    }
  };

  const getFieldTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'email': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'tel': case 'phone': return 'bg-green-50 border-green-200 text-green-800';
      case 'select': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'textarea': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'number': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // IMPROVED: Smart field suggestions based on field name/label
  const getSmartSuggestions = () => {
    if (!selectedCustomer?.originalData) return [];
    
    const fieldName = (field.name || '').toLowerCase();
    const fieldLabel = (field.label || '').toLowerCase();
    const fieldPlaceholder = (field.placeholder || '').toLowerCase();
    
    const allFieldText = `${fieldName} ${fieldLabel} ${fieldPlaceholder}`;
    
    const suggestions = [];
    
    // Smart matching rules
    const rules = [
      { patterns: ['name', 'customer', 'full'], fields: ['customer_name', 'name', 'full_name'] },
      { patterns: ['phone', 'mobile', 'contact', 'tel'], fields: ['phone', 'mobile', 'contact', 'phone_number'] },
      { patterns: ['email', 'mail'], fields: ['email', 'email_address', 'mail'] },
      { patterns: ['address', 'location'], fields: ['address', 'street_address', 'full_address'] },
      { patterns: ['company', 'organization', 'employer'], fields: ['company_name', 'company', 'organization'] },
      { patterns: ['city', 'town'], fields: ['city', 'town', 'locality'] },
      { patterns: ['state', 'province'], fields: ['state', 'province', 'region'] },
      { patterns: ['zip', 'postal', 'pin'], fields: ['pincode', 'zipcode', 'postal_code'] },
      { patterns: ['job', 'occupation', 'profession'], fields: ['occupation', 'job_title', 'profession'] },
      { patterns: ['budget', 'price'], fields: ['budget_range', 'price_range', 'budget'] },
      { patterns: ['vehicle', 'car', 'model'], fields: ['vehicle_model', 'car_model', 'model'] },
    ];

    // Find matching customer fields
    rules.forEach(rule => {
      const hasPattern = rule.patterns.some(pattern => allFieldText.includes(pattern));
      if (hasPattern) {
        rule.fields.forEach(customerField => {
          if (selectedCustomer.originalData[customerField]) {
            suggestions.push(customerField);
          }
        });
      }
    });

    // Remove duplicates and limit to top 3
    return [...new Set(suggestions)].slice(0, 3);
  };

  const smartSuggestions = getSmartSuggestions();

  const handleSelectionChange = (value) => {
    console.log('[PerfectFieldMapping] Selection changing:', {
      field: field.name,
      selector: field.selector,
      oldValue: localSelection,
      newValue: value,
      mappingIndex
    });
    
    setLocalSelection(value);
    onFieldMapping(field.selector, value === 'none' ? null : value);
  };

  return (
    <div className="p-4 border-2 rounded-lg space-y-3 hover:bg-gray-50 transition-colors">
      {/* Field Info Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xl">{getFieldTypeIcon(field.type)}</span>
          <div className="flex-1">
            <div className="font-medium text-sm">
              {field.label || field.placeholder || field.name || 'Form Field'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {field.name && `Name: "${field.name}"`}
              {field.placeholder && ` • Placeholder: "${field.placeholder}"`}
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${getFieldTypeColor(field.type)}`}
          >
            {field.type || 'text'}
          </Badge>
        </div>

        {/* Technical Details */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
          <div>🎯 Selector: <code className="bg-white px-1 rounded">{field.selector}</code></div>
          {field.context && field.context !== 'main' && (
            <div className="mt-1">📍 Context: <span className="text-blue-600">{field.context}</span></div>
          )}
          {field.value && (
            <div className="mt-1">💬 Current Value: <span className="text-green-600">"{field.value}"</span></div>
          )}
        </div>
      </div>

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Smart Suggestions:
          </div>
          <div className="flex gap-1 flex-wrap">
            {smartSuggestions.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => handleSelectionChange(suggestion)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              >
                {suggestion}
                {selectedCustomer?.originalData[suggestion] && (
                  <span className="ml-1 text-blue-600">
                    ({String(selectedCustomer.originalData[suggestion]).slice(0, 10)}{String(selectedCustomer.originalData[suggestion]).length > 10 ? '...' : ''})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Perfect Mapping Dropdown */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Link className="w-4 h-4" />
          Map to Customer Data Field:
        </Label>
        <Select
          value={localSelection}
          onValueChange={handleSelectionChange}
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue>
              {localSelection && localSelection !== 'none' ? (
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{localSelection}</span>
                  {selectedCustomer?.originalData?.[localSelection] && (
                    <span className="text-sm text-gray-500">
                      ({String(selectedCustomer.originalData[localSelection]).slice(0, 15)}{String(selectedCustomer.originalData[localSelection]).length > 15 ? '...' : ''})
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-gray-500">Choose data field to map to...</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">❌ Don't fill this field</span>
              </div>
            </SelectItem>
            {jsonFields.map((jsonField) => (
              <SelectItem key={jsonField} value={jsonField}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{jsonField}</span>
                  </div>
                  {selectedCustomer?.originalData?.[jsonField] && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({String(selectedCustomer.originalData[jsonField]).slice(0, 20)}{String(selectedCustomer.originalData[jsonField]).length > 20 ? '...' : ''})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Mapping Status Indicator */}
        {localSelection && localSelection !== 'none' ? (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Mapping Active</span>
            </div>
            <div className="text-xs">
              Customer data field <code className="bg-white px-1 rounded font-mono">{localSelection}</code> will 
              fill form field <code className="bg-white px-1 rounded font-mono">{field.name || field.selector}</code>
            </div>
            {selectedCustomer?.originalData?.[localSelection] && (
              <div className="text-xs mt-1 p-2 bg-white rounded border">
                <strong>Preview value:</strong> "{String(selectedCustomer.originalData[localSelection])}"
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>This field will not be filled automatically</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default function OptionsPanel(): JSX.Element {
  const {
    templates,
    customers,
    extractedFields,
    fieldMapping,
    showMappingInterface,
    pendingTemplate,
    loading,
    updateTemplate,
    deleteTemplate,
    setFieldMapping,
    createMappingFromFields,
    updateMappingFromFields,
    setShowMappingInterface,
    setExtractedFields,
    setPendingTemplate,
    getJsonFieldNamesFromCustomers,
    checkForExtractedFields,
    extractFormFields,
    saveExtractedFields,
  } = useCustomer();

  const { feedback, showFeedback } = useFeedback();

  // UI State
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showVisibleFieldsOnly, setShowVisibleFieldsOnly] = useState(true);
  const [fieldTypeFilter, setFieldTypeFilter] = useState('text');
  const [isNavigating, setIsNavigating] = useState(false);

  // IMPROVED: Customer selection for dynamic mapping
  const [selectedCustomerForMapping, setSelectedCustomerForMapping] = useState(null);

  // IMPROVED: Get dynamic fields based on selected customer
  const dynamicJsonFields = useMemo(() => {
    if (selectedCustomerForMapping?.originalData) {
      return Object.keys(selectedCustomerForMapping.originalData).sort();
    }
    return getJsonFieldNamesFromCustomers();
  }, [selectedCustomerForMapping, getJsonFieldNamesFromCustomers]);

  // Computed values
  const stats = useMemo(() => ({
    totalTemplates: templates.length,
    totalCustomers: customers.length,
    customersWithData: customers.filter(c => c.originalData && Object.keys(c.originalData).length > 0).length,
    jsonFields: dynamicJsonFields,
  }), [templates, customers, dynamicJsonFields]);

  // Enhanced field filtering for customer data
  const visibleFields = useMemo(() => {
    console.log('[OptionsPanel] Filtering fields:', {
      totalFields: extractedFields?.length || 0,
      showVisibleOnly: showVisibleFieldsOnly,
      fieldTypeFilter
    });

    if (!extractedFields) return [];
    
    let filtered = extractedFields;
    
    // Filter by visibility
    if (showVisibleFieldsOnly) {
      filtered = filtered.filter(field => field.isVisible !== false && !field.isHidden);
    }
    
    // Enhanced filtering for customer data fields
    if (fieldTypeFilter === 'text') {
      filtered = filtered.filter(field => {
        const fieldType = field.type?.toLowerCase() || 'text';
        const tagName = field.tagName?.toLowerCase() || 'input';
        const fieldName = (field.name || '').toLowerCase();
        const fieldPlaceholder = (field.placeholder || '').toLowerCase();
        const fieldLabel = (field.label || '').toLowerCase();
        
        // Exclude non-data field types
        const excludedTypes = ['submit', 'button', 'reset', 'image', 'file', 'hidden'];
        if (excludedTypes.includes(fieldType)) {
          return false;
        }
        
        // Include all text-based inputs, selects, and textareas
        const includedTypes = [
          'text', 'email', 'tel', 'phone', 'url', 'search', 'password', 'number'
        ];
        
        const isTextarea = tagName === 'textarea';
        const isSelect = tagName === 'select';
        const isGoodInput = includedTypes.includes(fieldType) || fieldType === '';
        
        // Enhanced customer data indicators
        const customerDataKeywords = [
          'name', 'customer', 'client', 'contact', 'person', 'user',
          'email', 'mail', 'phone', 'mobile', 'tel', 'contact',
          'address', 'city', 'state', 'zip', 'postal', 'pincode',
          'company', 'organization', 'employer', 'business',
          'vehicle', 'model', 'car', 'auto', 'brand',
          'budget', 'price', 'cost', 'amount',
          'comment', 'message', 'note', 'remark',
          'occupation', 'job', 'profession',
          'timeline', 'delivery', 'purchase'
        ];
        
        const hasCustomerKeywords = customerDataKeywords.some(keyword => 
          fieldName.includes(keyword) || 
          fieldPlaceholder.includes(keyword) || 
          fieldLabel.includes(keyword)
        );
        
        return isTextarea || isSelect || isGoodInput || hasCustomerKeywords;
      });
    }
    
    console.log('[OptionsPanel] Filtered to', filtered.length, 'fields');
    return filtered;
  }, [extractedFields, showVisibleFieldsOnly, fieldTypeFilter]);

  // FIXED: Perfect field mapping state management
  const handleFieldMapping = useCallback((selector, jsonField) => {
    console.log('[OptionsPanel] Perfect mapping update:', { selector, jsonField });
    
    setFieldMapping(prev => {
      const updated = { ...prev };
      
      // First remove any existing mapping for this selector
      Object.keys(updated).forEach(key => {
        if (updated[key]?.selector === selector) {
          delete updated[key];
        }
      });
      
      // Then add new mapping if jsonField is valid
      if (jsonField && jsonField !== 'none') {
        const newKey = `mapping_${Date.now()}`;
        updated[newKey] = {
          customerField: jsonField,
          selector: selector
        };
      }
      
      return updated;
    });
  }, [setFieldMapping]);

  // FIXED: Perfect mapping retrieval
  const getMappedJsonField = useCallback((selector) => {
    const mapping = Object.values(fieldMapping || {}).find(m => m?.selector === selector);
    const result = mapping ? mapping.customerField : null;
    console.log('[OptionsPanel] Getting perfect mapped field:', { selector, result });
    return result;
  }, [fieldMapping]);

  // Count mapped fields perfectly
  const mappedFieldsCount = useMemo(() => {
    if (!fieldMapping) return 0;
    // Count only mappings that have a customerField and selector
    return Object.values(fieldMapping).filter(m => 
      m?.customerField && m?.customerField !== 'none' && m?.selector
    ).length;
  }, [fieldMapping]);

  // Event handlers
  const handleEditTemplate = useCallback((template) => {
    console.log('[OptionsPanel] Editing template perfectly:', template);
    
    if (!template.extractedFields || template.extractedFields.length === 0) {
      showFeedback('error', 'Cannot edit this template - no extracted fields');
      return;
    }

    setEditingTemplateId(template.id);
    setExtractedFields(template.extractedFields);
    
    // FIXED: Perfect conversion of existing mapping
    const perfectMapping = {};
    Object.entries(template.fieldMapping || {}).forEach(([jsonField, selectors]) => {
      const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
      selectorArray.forEach((selector, index) => {
        const key = `edit_${jsonField}_${index}_${Date.now()}`;
        perfectMapping[key] = {
          customerField: jsonField,
          selector: selector
        };
      });
    });
    
    console.log('[OptionsPanel] Perfect converted mapping for editing:', perfectMapping);
    setFieldMapping(perfectMapping);
    
    setPendingTemplate({
      name: template.name,
      url: template.url,
      domain: template.url
    });
    
    setShowMappingInterface(true);
    setFieldTypeFilter('text');
    showFeedback('success', `Editing ${template.name} perfectly!`);
  }, [setExtractedFields, setFieldMapping, setPendingTemplate, setShowMappingInterface, showFeedback]);

  const handleDeleteTemplate = useCallback(async (templateId) => {
    if (!confirm('Delete this template?')) return;

    try {
      await deleteTemplate(templateId);
      showFeedback('success', 'Template deleted');
    } catch (error) {
      showFeedback('error', 'Failed to delete template');
    }
  }, [deleteTemplate, showFeedback]);

  const handleSaveMapping = useCallback(async () => {
    console.log('[OptionsPanel] Saving perfect mapping:', {
      pendingTemplate,
      fieldMapping,
      editingTemplateId,
      mappedFieldsCount
    });

    if (!pendingTemplate) {
      showFeedback('error', 'No template data');
      return;
    }

    if (!fieldMapping || Object.keys(fieldMapping).length === 0) {
      showFeedback('error', 'Map at least one field to create the template');
      return;
    }

    try {
      let result;
      if (editingTemplateId) {
        result = await updateMappingFromFields(editingTemplateId, fieldMapping);
        console.log('[OptionsPanel] Perfect update result:', result);
      } else {
        result = await createMappingFromFields(fieldMapping);
        console.log('[OptionsPanel] Perfect create result:', result);
      }
      
      if (result.success) {
        showFeedback('success', `Template ${editingTemplateId ? 'updated' : 'created'} perfectly with ${mappedFieldsCount} field mappings!`);
        setEditingTemplateId(null);
        setShowMappingInterface(false);
        setFieldTypeFilter('text');
        setFieldMapping({});
        setExtractedFields([]);
        setPendingTemplate(null);
        setSelectedCustomerForMapping(null);
      } else {
        showFeedback('error', result.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('[OptionsPanel] Perfect save error:', error);
      showFeedback('error', 'Failed to save template');
    }
  }, [pendingTemplate, fieldMapping, editingTemplateId, updateMappingFromFields, createMappingFromFields, showFeedback, mappedFieldsCount, setEditingTemplateId, setShowMappingInterface, setFieldMapping, setExtractedFields, setPendingTemplate]);

  const handleCheckForExtractedFields = useCallback(async () => {
    try {
      const foundFields = await checkForExtractedFields();
      if (foundFields) {
        showFeedback('success', 'Found scanned form! Ready for perfect field mapping.');
      } else {
        showFeedback('info', 'No scanned forms found. Use AI Scan tab first.');
      }
    } catch (error) {
      showFeedback('error', 'Check failed');
    }
  }, [checkForExtractedFields, showFeedback]);

  // Debug info
  useEffect(() => {
    if (showMappingInterface) {
      console.log('[OptionsPanel] Perfect mapping interface state:', {
        extractedFields: extractedFields?.length || 0,
        visibleFields: visibleFields.length,
        jsonFields: stats.jsonFields.length,
        currentMapping: fieldMapping,
        mappedCount: mappedFieldsCount,
        selectedCustomer: selectedCustomerForMapping?.name
      });
    }
  }, [showMappingInterface, extractedFields, visibleFields, stats.jsonFields, fieldMapping, mappedFieldsCount, selectedCustomerForMapping]);

  useEffect(() => {
    console.log('Current mappings:', {
      fieldMapping,
      mappedCount: mappedFieldsCount,
      hasMappings: mappedFieldsCount > 0
    });
  }, [fieldMapping, mappedFieldsCount]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Perfect Template Management</h1>
        <p className="text-sm text-muted-foreground">
          Scan web forms and create perfect field mapping templates for your customer data
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'}>
          {feedback.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Perfect Template Mapping Interface */}
      {showMappingInterface && pendingTemplate && (
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {editingTemplateId ? 'Perfect Edit' : 'Perfect Create'}: {pendingTemplate.name}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Create perfect mappings between form fields and your customer data fields
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.customersWithData === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Customer data required!</strong> Download customers with data first. 
                  Go to AutoFill → Search and download customers with rich data.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* IMPROVED: Dynamic Customer Selection */}
                <CustomerSelector 
                  customers={customers}
                  selectedCustomer={selectedCustomerForMapping}
                  onSelectCustomer={setSelectedCustomerForMapping}
                  availableFieldsCount={stats.jsonFields.length}
                />

                {/* Perfect Progress indicator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {stats.jsonFields.length} Customer Data Fields Available
                        {selectedCustomerForMapping && ` (from ${selectedCustomerForMapping.name})`}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {mappedFieldsCount} Perfect Mappings Created
                      </span>
                    </div>
                  </div>
                </div>

                {/* Perfect filter controls */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Show hidden fields:</span>
                    <Switch
                      checked={!showVisibleFieldsOnly}
                      onCheckedChange={(checked) => setShowVisibleFieldsOnly(!checked)}
                    />
                    <span className="text-muted-foreground">
                      ({visibleFields.length} of {extractedFields?.length || 0} fields)
                    </span>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="font-medium text-blue-800 mb-3 block flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Perfect Field Filter
                    </Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="fieldType"
                          value="text"
                          checked={fieldTypeFilter === 'text'}
                          onChange={(e) => setFieldTypeFilter(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">✨ Customer Data Fields Only (Perfect)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="fieldType"
                          value="all"
                          checked={fieldTypeFilter === 'all'}
                          onChange={(e) => setFieldTypeFilter(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">All Fields ({extractedFields?.length || 0})</span>
                      </label>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      💡 Perfect mode shows fields most likely to contain customer data (name, email, phone, etc.)
                    </p>
                  </div>
                </div>

                {/* Perfect field list */}
                <div className="space-y-4">
                  {visibleFields.length > 0 ? (
                    <>
                      <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-sm font-medium text-green-800">
                          🎯 Perfect Setup: {visibleFields.length} form fields ready for mapping
                          {fieldTypeFilter === 'text' && ' (customer data fields)'}
                          {selectedCustomerForMapping && ` with ${selectedCustomerForMapping.name}'s data`}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        No fields match your current filters. Try "All Fields" above.
                      </span>
                    </div>
                  )}
                  
                  {/* Perfect field mapping cards */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {visibleFields.map((field, index) => (
                      <PerfectFieldMappingCard
                        key={`perfect_${field.selector}_${index}`}
                        field={field}
                        selectedJsonField={getMappedJsonField(field.selector)}
                        jsonFields={stats.jsonFields}
                        onFieldMapping={handleFieldMapping}
                        mappingIndex={index}
                        selectedCustomer={selectedCustomerForMapping}
                      />
                    ))}
                  </div>
                </div>

                {/* Perfect Save/Cancel buttons */}
                <div className="flex gap-2 pt-4 border-t-2">
                  <Button 
                    onClick={handleSaveMapping} 
                    className="flex-1 h-12"
                    disabled={mappedFieldsCount === 0 || loading}
                    size="lg"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {editingTemplateId ? 'Perfect Update' : 'Perfect Create'} Template
                    {mappedFieldsCount > 0 && ` (${mappedFieldsCount} mappings)`}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowMappingInterface(false);
                      setEditingTemplateId(null);
                      setFieldTypeFilter('text');
                      setFieldMapping({});
                      setExtractedFields([]);
                      setPendingTemplate(null);
                      setSelectedCustomerForMapping(null);
                    }}
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5" />
            Perfect Templates
            <Badge variant="secondary">{stats.totalTemplates}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.totalTemplates > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm text-muted-foreground mb-2">No perfect templates yet</div>
              <div className="text-xs text-muted-foreground">
                Use AI Scan to create perfect templates from web forms
              </div>
            </div>
          )}

          {!showMappingInterface && (
            <div className="pt-3 border-t border-border mt-3 space-y-2">
              <Button 
                onClick={handleCheckForExtractedFields}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <Scan className="w-4 h-4 mr-1" />
                Check for Scanned Forms
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Perfect Statistics */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-sm">
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Perfect Statistics & Available Data Fields
            </span>
            {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div>• Perfect templates created: {stats.totalTemplates}</div>
                <div>• Total customers: {stats.totalCustomers}</div>
                <div>• Customers with data: {stats.customersWithData}</div>
                <div>• Customer data fields available: {stats.jsonFields.length}</div>
                {stats.jsonFields.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-medium mb-1">Available Customer Data Fields:</div>
                    <div className="flex flex-wrap gap-1">
                      {stats.jsonFields.slice(0, 12).map(field => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                      {stats.jsonFields.length > 12 && (
                        <Badge variant="outline" className="text-xs">
                          +{stats.jsonFields.length - 12} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Perfect Getting Started Guide */}
      {stats.totalTemplates === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-blue-900">Perfect Getting Started Guide</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div>1. Go to AutoFill tab and search/download customers with data</div>
                <div>2. Go to AI Scan tab and scan a web form</div>
                <div>3. Return here for perfect dynamic field mapping</div>
                <div>4. Select a customer to see their available fields</div>
                <div>5. Use perfect templates in AutoFill tab</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}