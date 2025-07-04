// features/aisuggest-autofill/components/PopupTab.tsx
import React, { useState, useCallback, useMemo } from 'react';
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
} from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';
import { useCustomer } from '../../shared/hooks/useCustomer';

// Constants
const FEEDBACK_DURATION = {
  DEFAULT: 2000,
  SUCCESS: 1500,
} as const;

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  } else if (digits.length > 5) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return digits;
};

const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.toString().replace(/[^\d]/g, '');
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
  } = useCustomer();

  const [phoneInput, setPhoneInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [aiSuggestMode, setAiSuggestMode] = useState(false);
  const [isActivatingAiSuggest, setIsActivatingAiSuggest] = useState(false);

  // Feedback handlers
  const showFeedback = useCallback((type, message, duration = FEEDBACK_DURATION.DEFAULT) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), duration);
  }, []);

  const showSuccess = useCallback((message) => showFeedback('success', message, FEEDBACK_DURATION.SUCCESS), [showFeedback]);
  const showError = useCallback((message) => showFeedback('error', message), [showFeedback]);

  // Phone input handler
  const handlePhoneChange = useCallback((e) => {
    setPhoneInput(e.target.value);
  }, []);

  // Phone search
  const handlePhoneSearch = useCallback(() => {
    if (!phoneInput.trim()) {
      showError('Enter phone number');
      return;
    }

    const cleanedQuery = cleanPhoneNumber(phoneInput);
    const foundCustomer = customers.find(customer => 
      cleanPhoneNumber(customer.phone) === cleanedQuery
    );

    if (foundCustomer) {
      setSelectedCustomer(foundCustomer);
      showSuccess(`Found ${foundCustomer.name}`);
    } else {
      showError('Customer not found');
    }
  }, [phoneInput, customers, setSelectedCustomer, showError, showSuccess]);

  // Template selection
  const handleTemplateSelection = useCallback((templateId) => {
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

  // AI Suggest
  const handleAISuggestToggle = useCallback(async () => {
    if (!selectedCustomer) {
      showError('Select customer first');
      return;
    }
    
    if (!selectedCustomer.originalData || Object.keys(selectedCustomer.originalData).length === 0) {
      showError('Customer needs JSON data');
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
          showSuccess(`AI Suggest ON`);
        } else {
          showError('AI Suggest failed');
        }
      } else {
        await messaging.sendToContent({
          type: 'disableAiSuggestMode',
          data: {}
        });
        setAiSuggestMode(false);
        showSuccess('AI Suggest OFF');
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

  const quickSelectCustomers = useMemo(() => customers.slice(0, 3), [customers]);

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
          {/* Phone Search - Main Action */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                {/* <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /> */}
                <Input
                  placeholder="Enter mobile/phone number"
                  value={phoneInput}
                  onChange={handlePhoneChange}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handlePhoneSearch()}
                  type="tel"
                />
              </div>
              <Button 
                onClick={handlePhoneSearch} 
                size="sm"
                disabled={!phoneInput.trim()}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick select */}
            {customers.length > 0 && !selectedCustomer && (
              <div className="text-xs text-muted-foreground">
                Quick: {quickSelectCustomers.map((customer, index) => (
                  <span key={customer.id}>
                    <button
                      className="text-primary hover:underline"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setPhoneInput(customer.phone);
                        showSuccess(`Selected ${customer.name}`);
                      }}
                    >
                      {customer.name}
                    </button>
                    {index < quickSelectCustomers.length - 1 && ', '}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Selected Customer */}
          {selectedCustomer && (
            <div className="p-2 bg-muted/30 rounded border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">{selectedCustomer.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPhoneNumber(selectedCustomer.phone)}
                  </span>
                  {selectedCustomer.dataSource === 'json' && (
                    <Badge variant="outline" className="text-xs">JSON</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setPhoneInput('');
                  }}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
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
                  <SelectItem value="none" disabled>
                    No templates available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            
            {templates.length === 0 && (
              <div className="text-xs text-muted-foreground text-center">
                Use "Manage Customers & Templates" to create templates
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
              ✨ AI Suggest active - click highlighted fields
            </div>
          )}

          {!canAutoFill && (selectedCustomer || selectedTemplate) && (
            <div className="text-xs text-center text-orange-600 bg-orange-50 rounded p-2">
              {!selectedCustomer ? 'Select customer' : 'Select template'}
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

          {/* Getting started for new users */}
          {customers.length === 0 && (
            <div className="text-center text-xs text-muted-foreground bg-blue-50 rounded p-3">
              <div className="mb-2">No customers found</div>
              <div className="text-xs">Use the options panel to upload customer data</div>
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