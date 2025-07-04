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
  Scan, 
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';
import { useCustomer } from '../hooks/useCustomer';

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

export default function CustomerTab({ value }) {
  const {
    customers,
    templates,
    selectedCustomer,
    selectedTemplate,
    loading,
    setSelectedCustomer,
    setSelectedTemplate,
    extractFormFields,
    saveExtractedFields,
    autoFillForm,
  } = useCustomer();

  const [phoneInput, setPhoneInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [aiSuggestMode, setAiSuggestMode] = useState(false);
  const [isActivatingAiSuggest, setIsActivatingAiSuggest] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

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

  // AI Scan
  const handleAIScan = useCallback(async () => {
    const templateName = prompt('Template name:');
    if (!templateName?.trim()) {
      showError('Template name required');
      return;
    }

    try {
      const extractResult = await extractFormFields();
      if (!extractResult.success) {
        showError('Failed to scan form');
        return;
      }

      const currentTab = await messaging.getActiveTab();
      const currentUrl = currentTab?.url;
      const domain = currentUrl ? new URL(currentUrl).hostname : '';

      const saveResult = await saveExtractedFields({
        templateName: templateName.trim(),
        fields: extractResult.fields,
        url: currentUrl,
        domain: domain,
      });

      if (saveResult.success) {
        showSuccess(`Scanned ${extractResult.fields.length} fields`);
        setIsNavigating(true);
        try {
          await messaging.openOptionsPage();
          setTimeout(() => setIsNavigating(false), 1500);
        } catch (error) {
          setIsNavigating(false);
        }
      }
    } catch (error) {
      showError('Scan failed');
    }
  }, [extractFormFields, saveExtractedFields, showError, showSuccess]);

  const handleDebugInfo = useCallback(async () => {
    console.log('=== 🏢 COMPREHENSIVE GDMS IFRAME DEBUG ===');
    
    console.log('👤 BASIC DATA:');
    console.log('- Selected Customer:', selectedCustomer?.name);
    console.log('- Customer Data:', selectedCustomer?.originalData);
    console.log('- Selected Template:', selectedTemplate?.name);
    console.log('- Field Mapping:', selectedTemplate?.fieldMapping);

    console.log('📡 TESTING FRAME INJECTION...');
    try {
      const frameTest = await messaging.sendToContent({
        type: 'comprehensiveFrameTest',
        data: {}
      });
      console.log('✅ Frame test result:', frameTest);
    } catch (error) {
      console.error('❌ Frame test failed:', error);
    }

    console.log('🖼️ TESTING DIRECT IFRAME ACCESS...');
    try {
      const iframeTest = await messaging.sendToContent({
        type: 'testDirectIframeAccess',
        data: {}
      });
      console.log('✅ Direct iframe test:', iframeTest);
    } catch (error) {
      console.error('❌ Direct iframe test failed:', error);
    }

    if (selectedCustomer && selectedTemplate) {
      console.log('🎯 TESTING FILL SIMULATION...');
      try {
        const fillTest = await messaging.sendToContent({
          type: 'simulateIframeFill',
          data: {
            customerData: selectedCustomer.originalData || selectedCustomer,
            fieldMapping: selectedTemplate.fieldMapping
          }
        });
        console.log('✅ Fill simulation result:', fillTest);
      } catch (error) {
        console.error('❌ Fill simulation failed:', error);
      }
    }

    showSuccess('Debug info in console (F12)');
  }, [selectedCustomer, selectedTemplate, showSuccess]);

  const handleManualOpenOptions = useCallback(async () => {
    setIsNavigating(true);
    try {
      await messaging.openOptionsPage();
      showSuccess('Opening settings...');
    } catch (error) {
      showError('Failed to open settings');
    } finally {
      setTimeout(() => setIsNavigating(false), 1000);
    }
  }, [showError, showSuccess]);

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
                  placeholder="Enter phone number"
                  value={phoneInput}
                  onChange={handlePhoneChange}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handlePhoneSearch()}
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
                <SelectValue placeholder="Select form template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Status Messages - Simplified */}
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

          {/* Advanced Section - Collapsed by default */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full"
            >
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Advanced Tools
            </button>
            
            {showAdvanced && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={handleAIScan}
                    disabled={loading.scan || isNavigating}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {loading.scan || isNavigating ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Scan className="w-3 h-3 mr-1" />
                    )}
                    Scan Form
                  </Button>

                  <Button
                    onClick={handleManualOpenOptions}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Settings
                  </Button>
                </div>

                {/* Developer Debug - Hidden in collapsed state */}
                <Button
                  onClick={handleDebugInfo}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                >
                  Developer Debug
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• <strong>Scan Form:</strong> Extract fields from current form</div>
                  <div>• <strong>Settings:</strong> Manage customers and templates</div>
                </div>
              </div>
            )}
          </div>

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
              <div className="mb-2">First time? Get started:</div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualOpenOptions}
                disabled={isNavigating}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}