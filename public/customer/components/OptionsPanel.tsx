import React, { useState, useRef, useCallback, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Label } from '@voilajsx/uikit/label';
import { Textarea } from '@voilajsx/uikit/textarea';
import { Badge } from '@voilajsx/uikit/badge';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Switch } from '@voilajsx/uikit/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@voilajsx/uikit/dialog';
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
  Users,
  Plus,
  Upload,
  Edit,
  Eye,
  Trash2,
  Phone,
  Mail,
  Building,
  Globe,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileText,
  Settings,
  Scan,
} from 'lucide-react';
import { useCustomer } from '../hooks/useCustomer';

// Constants
const FEEDBACK_DURATION = 2000;

const formatPhoneNumber = (phone) => {
  if (phone && phone.length === 10) {
    return `${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
};

// Custom hooks
const useFeedback = () => {
  const [feedback, setFeedback] = useState(null);
  
  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), FEEDBACK_DURATION);
  }, []);
  
  return { feedback, showFeedback };
};

const useCustomerForm = () => {
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    notes: '',
  });
  
  const updateField = useCallback((field, value) => {
    setCustomerForm(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const resetForm = useCallback(() => {
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      company: '',
      address: '',
      notes: '',
    });
  }, []);
  
  const loadCustomerData = useCallback((customer) => {
    setCustomerForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      company: customer.company || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
  }, []);
  
  return { customerForm, updateField, resetForm, loadCustomerData };
};

// Simple customer card component
const CustomerCard = memo(({ customer, onEdit, onDelete }) => (
  <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium">{customer.name}</h3>
          {customer.dataSource === 'json' && (
            <Badge variant="outline" className="text-xs">JSON</Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {formatPhoneNumber(customer.phone)}
          {customer.email && ` • ${customer.email}`}
          {customer.company && ` • ${customer.company}`}
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(customer)}>
          <Edit className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(customer.id)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  </div>
));

// Simple template card component
const TemplateCard = memo(({ template, onEdit, onDelete }) => (
  <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="font-medium">{template.name}</h3>
        <div className="text-sm text-muted-foreground">
          {Object.values(template.fieldMapping).flat().length} fields mapped
        </div>
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

// Enhanced field mapping component that shows field details
const SimpleFieldMapping = memo(({ 
  field, 
  selectedJsonField, 
  jsonFields, 
  onFieldMapping 
}) => (
  <div className="p-3 border rounded-lg space-y-2">
    <div className="space-y-1">
      <div className="font-medium text-sm">
        {field.label || field.placeholder || field.name || 'Form Field'}
      </div>
      <div className="text-xs text-gray-500">
        Type: {field.type || 'text'} • Name: {field.name || 'N/A'}
        {field.placeholder && ` • Placeholder: "${field.placeholder}"`}
      </div>
    </div>
    <Select
      value={selectedJsonField || 'none'}
      onValueChange={(value) => onFieldMapping(field.selector, value === 'none' ? null : value)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose data field" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Don't fill this field</SelectItem>
        {jsonFields.map((jsonField) => (
          <SelectItem key={jsonField} value={jsonField}>
            {jsonField}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
));

// Customer form component
const CustomerForm = memo(({ 
  customerForm, 
  updateField, 
  onSave, 
  onCancel, 
  saveText 
}) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label>Name *</Label>
        <Input
          placeholder="Customer name"
          value={customerForm.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
      </div>
      <div>
        <Label>Phone *</Label>
        <Input
          placeholder="Phone number"
          value={customerForm.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />
      </div>
    </div>
    <div>
      <Label>Email</Label>
      <Input
        type="email"
        placeholder="Email address"
        value={customerForm.email}
        onChange={(e) => updateField('email', e.target.value)}
      />
    </div>
    <div>
      <Label>Company</Label>
      <Input
        placeholder="Company name"
        value={customerForm.company}
        onChange={(e) => updateField('company', e.target.value)}
      />
    </div>
    <div className="flex gap-2 pt-2">
      <Button onClick={onSave} className="flex-1">
        <Save className="w-4 h-4 mr-2" />
        {saveText}
      </Button>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </div>
));

export default function CustomerOptionsPanel() {
  const {
    customers,
    templates,
    extractedFields,
    fieldMapping,
    showMappingInterface,
    editingCustomer,
    pendingTemplate,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateTemplate,
    deleteTemplate,
    handleFileUpload,
    setFieldMapping,
    createMappingFromFields,
    updateMappingFromFields,
    setShowMappingInterface,
    setEditingCustomer,
    setExtractedFields,
    setPendingTemplate,
    getJsonFieldNamesFromCustomers,
    checkForExtractedFields,
  } = useCustomer();

  const { feedback, showFeedback } = useFeedback();
  const { customerForm, updateField, resetForm, loadCustomerData } = useCustomerForm();

  // UI State
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showVisibleFieldsOnly, setShowVisibleFieldsOnly] = useState(true);
  const [fieldTypeFilter, setFieldTypeFilter] = useState('all'); // NEW: Field type filter

  const fileInputRef = useRef(null);

  // Computed values
  const stats = useMemo(() => ({
    totalCustomers: customers.length,
    totalTemplates: templates.length,
    jsonFields: getJsonFieldNamesFromCustomers(),
  }), [customers, templates, getJsonFieldNamesFromCustomers]);

  // UPDATED: Enhanced field filtering with text-only option
  const visibleFields = useMemo(() => {
    if (!extractedFields) return [];
    
    let filtered = extractedFields;
    
    // Filter by visibility
    if (showVisibleFieldsOnly) {
      filtered = filtered.filter(field => !field.isHidden);
    }
    
    // Filter by field type - NEW LOGIC
    if (fieldTypeFilter === 'text') {
      filtered = filtered.filter(field => {
        const fieldType = field.type?.toLowerCase() || '';
        const tagName = field.tagName?.toLowerCase() || '';
        const fieldName = field.name?.toLowerCase() || '';
        const fieldPlaceholder = field.placeholder?.toLowerCase() || '';
        const fieldLabel = field.label?.toLowerCase() || '';
        
        // FIRST: Explicitly exclude non-text field types
        const excludedTypes = [
          'radio', 'checkbox', 'submit', 'button', 'reset', 
          'file', 'image', 'hidden', 'range', 'color',
          'date', 'datetime', 'datetime-local', 'month', 
          'time', 'week', 'number'
        ];
        
        const excludedTags = ['select', 'button'];
        
        // If it's an excluded type or tag, filter it out
        if (excludedTypes.includes(fieldType) || excludedTags.includes(tagName)) {
          return false;
        }
        
        // SECOND: Include only text-based inputs
        const allowedTypes = [
          'text', 'email', 'tel', 'phone', 'url', 'search', 'password'
        ];
        
        const isTextarea = tagName === 'textarea';
        const isAllowedInput = allowedTypes.includes(fieldType);
        const isInputWithoutType = tagName === 'input' && !fieldType; // input without type defaults to text
        
        // THIRD: Check for customer data field indicators
        const customerDataIndicators = [
          'name', 'email', 'phone', 'address', 'city', 'state', 
          'zip', 'postal', 'company', 'organization', 'title', 
          'first', 'last', 'middle', 'street', 'apt', 'suite',
          'website', 'url', 'comment', 'message', 'note', 'description'
        ];
        
        const hasCustomerDataIndicators = customerDataIndicators.some(indicator => 
          fieldName.includes(indicator) || 
          fieldPlaceholder.includes(indicator) || 
          fieldLabel.includes(indicator)
        );
        
        return isTextarea || isAllowedInput || isInputWithoutType || hasCustomerDataIndicators;
      });
    }
    
    return filtered;
  }, [extractedFields, showVisibleFieldsOnly, fieldTypeFilter]);

  // Event handlers
  const handleFileUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await handleFileUpload(file);
      if (result.success) {
        showFeedback('success', `Imported ${result.imported} customers`);
      } else {
        showFeedback('error', result.error);
      }
    } catch (error) {
      showFeedback('error', 'Upload failed');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [handleFileUpload, showFeedback]);

  const handleAddCustomer = useCallback(async () => {
    if (!customerForm.name || !customerForm.phone) {
      showFeedback('error', 'Name and phone are required');
      return;
    }

    try {
      await addCustomer({ ...customerForm, dataSource: 'manual' });
      resetForm();
      setShowAddCustomer(false);
      showFeedback('success', 'Customer added');
    } catch (error) {
      showFeedback('error', 'Failed to add customer');
    }
  }, [customerForm, addCustomer, resetForm, showFeedback]);

  const handleEditCustomer = useCallback((customer) => {
    setEditingCustomer(customer);
    loadCustomerData(customer);
  }, [setEditingCustomer, loadCustomerData]);

  const handleUpdateCustomer = useCallback(async () => {
    if (!editingCustomer) return;

    if (!customerForm.name || !customerForm.phone) {
      showFeedback('error', 'Name and phone are required');
      return;
    }

    try {
      await updateCustomer(editingCustomer.id, customerForm);
      setEditingCustomer(null);
      resetForm();
      showFeedback('success', 'Customer updated');
    } catch (error) {
      showFeedback('error', 'Failed to update customer');
    }
  }, [editingCustomer, customerForm, updateCustomer, setEditingCustomer, resetForm, showFeedback]);

  const handleDeleteCustomer = useCallback(async (customerId) => {
    if (!confirm('Delete this customer?')) return;

    try {
      await deleteCustomer(customerId);
      showFeedback('success', 'Customer deleted');
    } catch (error) {
      showFeedback('error', 'Failed to delete customer');
    }
  }, [deleteCustomer, showFeedback]);

  const handleEditTemplate = useCallback((template) => {
    if (!template.extractedFields || template.extractedFields.length === 0) {
      showFeedback('error', 'Cannot edit this template');
      return;
    }

    setEditingTemplate(template);
    setExtractedFields(template.extractedFields);
    
    // Convert existing mapping to new format
    const convertedMapping = {};
    Object.entries(template.fieldMapping).forEach(([jsonField, selectors]) => {
      const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
      selectorArray.forEach((selector, index) => {
        const key = `${jsonField}_${Date.now()}_${index}`;
        convertedMapping[key] = {
          customerField: jsonField,
          selector
        };
      });
    });
    
    setFieldMapping(convertedMapping);
    setPendingTemplate({
      name: template.name,
      url: template.url,
      domain: template.url
    });
    
    setShowMappingInterface(true);
    setFieldTypeFilter('all'); // Reset filter when editing
    showFeedback('success', `Editing ${template.name}`);
  }, [setEditingTemplate, setExtractedFields, setFieldMapping, setPendingTemplate, setShowMappingInterface, showFeedback]);

  const handleDeleteTemplate = useCallback(async (templateId) => {
    if (!confirm('Delete this template?')) return;

    try {
      await deleteTemplate(templateId);
      showFeedback('success', 'Template deleted');
    } catch (error) {
      showFeedback('error', 'Failed to delete template');
    }
  }, [deleteTemplate, showFeedback]);

  const handleFieldMapping = useCallback((selector, jsonField) => {
    if (jsonField) {
      setFieldMapping(prev => {
        // Remove existing mapping for this selector
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].selector === selector) {
            delete updated[key];
          }
        });
        
        // Add new mapping
        const newKey = `${jsonField}_${Date.now()}`;
        updated[newKey] = {
          customerField: jsonField,
          selector
        };
        
        return updated;
      });
    } else {
      // Remove mapping
      setFieldMapping(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].selector === selector) {
            delete updated[key];
          }
        });
        return updated;
      });
    }
  }, [setFieldMapping]);

  const getMappedJsonField = useCallback((selector) => {
    const mapping = Object.values(fieldMapping).find(m => m.selector === selector);
    return mapping ? mapping.customerField : null;
  }, [fieldMapping]);

  const handleSaveMapping = useCallback(async () => {
    if (!pendingTemplate) {
      showFeedback('error', 'No template data');
      return;
    }

    if (Object.keys(fieldMapping).length === 0) {
      showFeedback('error', 'Map at least one field');
      return;
    }

    try {
      let result;
      if (editingTemplate) {
        result = await updateMappingFromFields(editingTemplate.id, fieldMapping);
      } else {
        result = await createMappingFromFields(fieldMapping);
      }
      
      if (result.success) {
        showFeedback('success', `Template ${editingTemplate ? 'updated' : 'created'}`);
        setEditingTemplate(null);
        setShowMappingInterface(false);
        setFieldTypeFilter('all'); // Reset filter after save
      } else {
        showFeedback('error', result.error);
      }
    } catch (error) {
      showFeedback('error', 'Failed to save template');
    }
  }, [pendingTemplate, fieldMapping, editingTemplate, updateMappingFromFields, createMappingFromFields, showFeedback]);

  const handleCheckForExtractedFields = useCallback(async () => {
    try {
      const foundFields = await checkForExtractedFields();
      if (foundFields) {
        showFeedback('success', 'Found form to map!');
      } else {
        showFeedback('info', 'No forms found. Use AI Scan in popup first.');
      }
    } catch (error) {
      showFeedback('error', 'Check failed');
    }
  }, [checkForExtractedFields, showFeedback]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold">Customer Management</h1>
        <p className="text-sm text-muted-foreground">
          Upload customer data and create form templates
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

      {/* Template Mapping Interface */}
      {showMappingInterface && pendingTemplate && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingTemplate ? 'Edit' : 'Create'} Template: {pendingTemplate.name}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Connect form fields to your customer data
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.jsonFields.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload JSON customer data first to enable field mapping
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* UPDATED: Enhanced filter controls */}
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
                  
                  {/* NEW: Field Type Filter */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="font-medium text-blue-800 mb-3 block">Field Type Filter</Label>
                    <div className="flex gap-4">
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
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="fieldType"
                          value="text"
                          checked={fieldTypeFilter === 'text'}
                          onChange={(e) => setFieldTypeFilter(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Customer Data Fields Only</span>
                      </label>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      💡 Tip: Choose "Customer Data Fields Only" to see name, email, phone, and address fields
                    </p>
                  </div>
                </div>

                {/* UPDATED: Field list with count feedback */}
                <div className="space-y-3">
                  {visibleFields.length > 0 ? (
                    <div className="text-center p-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium text-green-800">
                        Showing {visibleFields.length} fields to map
                        {fieldTypeFilter === 'text' && ' (customer data fields only)'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="text-sm font-medium text-yellow-800">
                        No fields match your current filters. Try selecting "All Fields" above.
                      </span>
                    </div>
                  )}
                  
                  {visibleFields.map((field) => (
                    <SimpleFieldMapping
                      key={field.selector}
                      field={field}
                      selectedJsonField={getMappedJsonField(field.selector)}
                      jsonFields={stats.jsonFields}
                      onFieldMapping={handleFieldMapping}
                    />
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveMapping} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {editingTemplate ? 'Update' : 'Create'} Template
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowMappingInterface(false);
                      setEditingTemplate(null);
                      setFieldTypeFilter('all'); // Reset filter when canceling
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Customers Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Customers
                <Badge variant="secondary">{stats.totalCustomers}</Badge>
              </CardTitle>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  onClick={handleFileUploadClick}
                  size="sm"
                  disabled={loading.upload}
                >
                  {loading.upload ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1" />
                  )}
                  Upload
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {stats.totalCustomers > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {customers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onEdit={handleEditCustomer}
                    onDelete={handleDeleteCustomer}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-sm text-muted-foreground mb-2">No customers yet</div>
                <Button onClick={handleFileUploadClick} variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload JSON File
                </Button>
              </div>
            )}
            
            <div className="pt-3 border-t border-border mt-3">
              <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Customer Manually
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                  </DialogHeader>
                  <CustomerForm
                    customerForm={customerForm}
                    updateField={updateField}
                    onSave={handleAddCustomer}
                    onCancel={() => {
                      setShowAddCustomer(false);
                      resetForm();
                    }}
                    saveText="Add Customer"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Templates Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5" />
              Templates
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
                <div className="text-sm text-muted-foreground mb-2">No templates yet</div>
                <div className="text-xs text-muted-foreground">
                  Use AI Scan in popup to create templates
                </div>
              </div>
            )}

            {!showMappingInterface && (
              <div className="pt-3 border-t border-border mt-3">
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
      </div>

      {/* Advanced Settings */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-sm">
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Advanced Settings
            </span>
            {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div>• JSON customers: {customers.filter(c => c.dataSource === 'json').length}</div>
                <div>• Manual customers: {customers.filter(c => c.dataSource === 'manual').length}</div>
                <div>• Available data fields: {stats.jsonFields.length}</div>
                {stats.jsonFields.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-medium mb-1">JSON Fields:</div>
                    <div className="flex flex-wrap gap-1">
                      {stats.jsonFields.map(field => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Customer Edit Dialog */}
      {editingCustomer && (
        <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm
              customerForm={customerForm}
              updateField={updateField}
              onSave={handleUpdateCustomer}
              onCancel={() => {
                setEditingCustomer(null);
                resetForm();
              }}
              saveText="Update Customer"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Getting Started Guide */}
      {stats.totalCustomers === 0 && stats.totalTemplates === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-blue-900">Getting Started</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div>1. Upload a JSON file with customer data</div>
                <div>2. Use AI Scan in popup to scan web forms</div>
                <div>3. Map form fields to customer data</div>
                <div>4. Use Auto Fill to populate forms</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}