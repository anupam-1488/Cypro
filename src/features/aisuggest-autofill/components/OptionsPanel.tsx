// features/aisuggest-autofill/components/OptionsPanel.tsx
import React, { useState, useRef, useCallback, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Label } from '@voilajsx/uikit/label';
import { Badge } from '@voilajsx/uikit/badge';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@voilajsx/uikit/dialog';
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
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useCustomer } from '../../shared/hooks/useCustomer';

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
          type="tel"
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
    <div>
      <Label>Address</Label>
      <Input
        placeholder="Full address"
        value={customerForm.address}
        onChange={(e) => updateField('address', e.target.value)}
      />
    </div>
    <div>
      <Label>Notes</Label>
      <Input
        placeholder="Additional notes"
        value={customerForm.notes}
        onChange={(e) => updateField('notes', e.target.value)}
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

export default function OptionsPanel(): JSX.Element {
  const {
    customers,
    editingCustomer,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    handleFileUpload,
    setEditingCustomer,
    getJsonFieldNamesFromCustomers,
  } = useCustomer();

  const { feedback, showFeedback } = useFeedback();
  const { customerForm, updateField, resetForm, loadCustomerData } = useCustomerForm();

  // UI State
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fileInputRef = useRef(null);

  // Computed values
  const stats = useMemo(() => ({
    totalCustomers: customers.length,
    jsonFields: getJsonFieldNamesFromCustomers(),
    jsonCustomers: customers.filter(c => c.dataSource === 'json').length,
    manualCustomers: customers.filter(c => c.dataSource === 'manual').length,
  }), [customers, getJsonFieldNamesFromCustomers]);

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

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      {/* Header */}
      <div className=" space-y-1">
        <h1 className="text-xl font-bold">Customer Data Management</h1>
        <p className="text-sm text-muted-foreground">
          Upload customer data from JSON files or add customers manually
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

      {/* Main Content */}
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
                Upload JSON
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

      {/* Advanced Settings */}
      {/* <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-sm">
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Advanced Statistics
            </span>
            {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div>• JSON customers: {stats.jsonCustomers}</div>
                <div>• Manual customers: {stats.manualCustomers}</div>
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
      </Collapsible> */}

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
      {/* {stats.totalCustomers === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-blue-900">Getting Started</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div>1. Upload a JSON file with customer data</div>
                <div>2. Or add customers manually using the form</div>
                <div>3. Use AI Scan to create form templates</div>
                <div>4. Use AutoFill to populate forms with customer data</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
}