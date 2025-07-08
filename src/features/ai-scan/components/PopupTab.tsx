// features/ai-scan/components/PopupTab.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { 
  Scan, 
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  MapPin,
  Zap,
  Users,
} from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';
import { useCustomer } from '../../shared/hooks/useCustomer';

// Constants
const FEEDBACK_DURATION = {
  DEFAULT: 2000,
  SUCCESS: 1500,
} as const;

interface PopupTabProps {
  value: string;
}

export default function PopupTab({ value }: PopupTabProps) {
  const {
    templates,
    customers,
    extractFormFields,
    saveExtractedFields,
    getJsonFieldNamesFromCustomers,
  } = useCustomer();

  const [feedback, setFeedback] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPageInfo, setCurrentPageInfo] = useState(null);

  // Feedback handlers
  const showFeedback = useCallback((type, message, duration = FEEDBACK_DURATION.DEFAULT) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), duration);
  }, []);

  const showSuccess = useCallback((message) => showFeedback('success', message, FEEDBACK_DURATION.SUCCESS), [showFeedback]);
  const showError = useCallback((message) => showFeedback('error', message), [showFeedback]);

  // Get current page info when component loads
  useEffect(() => {
    getCurrentPageInfo();
  }, []);

  // Get current page info
  const getCurrentPageInfo = useCallback(async () => {
    try {
      const currentTab = await messaging.getActiveTab();
      const pageInfo = {
        title: currentTab?.title || 'Unknown Page',
        url: currentTab?.url || '',
        domain: currentTab?.url ? new URL(currentTab.url).hostname : '',
      };
      setCurrentPageInfo(pageInfo);
      return pageInfo;
    } catch (error) {
      console.warn('Could not get page info:', error);
      return null;
    }
  }, []);

  // Enhanced AI Scan handler with better feedback
  const handleAIScan = useCallback(async () => {
    // Check if customer data is available first
    const availableFields = getJsonFieldNamesFromCustomers();
    if (availableFields.length === 0) {
      showError('Upload customer data first! Go to AutoFill → Customer Data → Upload JSON');
      return;
    }

    const templateName = prompt('Enter template name (e.g., "Car Inquiry Form", "Contact Form"):');
    if (!templateName?.trim()) {
      showError('Template name is required');
      return;
    }

    setIsScanning(true);
    
    try {
      console.log('[AI-Scan] Starting form extraction...');
      
      // Get current page info
      const pageInfo = await getCurrentPageInfo();
      if (!pageInfo) {
        showError('Could not scan this page');
        return;
      }

      console.log('[AI-Scan] Page info:', pageInfo);

      // Extract form fields using the AI-Scan handler
      const extractResult = await extractFormFields();
      console.log('[AI-Scan] Extract result:', extractResult);
      
      if (!extractResult.success) {
        showError(extractResult.error || 'Failed to scan form');
        return;
      }

      if (!extractResult.fields || extractResult.fields.length === 0) {
        showError('No form fields found on this page. Make sure you are on a page with a form.');
        return;
      }

      console.log('[AI-Scan] Found', extractResult.fields.length, 'fields');

      // Save extracted fields for mapping
      const saveResult = await saveExtractedFields({
        templateName: templateName.trim(),
        fields: extractResult.fields,
        url: pageInfo.url,
        domain: pageInfo.domain,
      });

      console.log('[AI-Scan] Save result:', saveResult);

      if (saveResult.success) {
        showSuccess(`Scanned ${extractResult.fields.length} fields! Opening field mapper...`);
        
        // Auto-redirect to template management for field mapping
        setIsNavigating(true);
        setTimeout(async () => {
          try {
            await messaging.openOptionsPage();
            console.log('[AI-Scan] Opened options page for field mapping');
          } catch (error) {
            console.error('[AI-Scan] Failed to open options page:', error);
            showError('Form scanned successfully! Please open Template Management manually to map fields.');
          } finally {
            setIsNavigating(false);
          }
        }, 1000);
      } else {
        showError('Failed to save scanned form');
      }
    } catch (error) {
      console.error('AI Scan error:', error);
      showError(`Scan failed: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  }, [extractFormFields, saveExtractedFields, getCurrentPageInfo, showError, showSuccess, getJsonFieldNamesFromCustomers]);

  // Open template management
  const handleOpenTemplateManagement = useCallback(async () => {
    setIsNavigating(true);
    try {
      await messaging.openOptionsPage();
      showSuccess('Opening template management...');
    } catch (error) {
      showError('Failed to open template management');
    } finally {
      setTimeout(() => setIsNavigating(false), 1000);
    }
  }, [showError, showSuccess]);

  // Computed values
  const availableDataFields = getJsonFieldNamesFromCustomers();
  const hasCustomerData = customers.length > 0 && availableDataFields.length > 0;
  const hasTemplates = templates.length > 0;

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scan className="w-4 h-4" />
            AI Form Scanner 
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          
          {/* Current Page Info */}
          {currentPageInfo && (
            <div className="p-2 bg-muted/30 rounded border">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">{currentPageInfo.domain}</span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {currentPageInfo.title}
              </div>
            </div>
          )}

          {/* Customer Data Status */}
          {hasCustomerData ? (
            <div className="p-2 bg-green-50 rounded border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Ready to scan! {availableDataFields.length} data fields available for mapping
                </span>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Upload customer data first! Go to AutoFill → Customer Data → Upload JSON
              </AlertDescription>
            </Alert>
          )}

          {/* Main Scan Button */}
          <div className="space-y-2">
            <Button
              onClick={handleAIScan}
              disabled={isScanning || isNavigating || !hasCustomerData}
              className="w-full h-12"
              size="lg"
            >
              {isScanning ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Scan className="w-5 h-5 mr-2" />
              )}
              {isScanning ? 'Scanning Form...' : 'AI Scan Current Form'}
            </Button>
            
            <div className="text-xs text-center text-muted-foreground">
              Extracts form fields and opens field mapper automatically
            </div>
          </div>

          {/* Available Data Fields Preview */}
          {/* {hasCustomerData && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-2">
                Available Customer Data Fields ({availableDataFields.length}):
              </div>
              <div className="flex flex-wrap gap-1">
                {availableDataFields.slice(0, 8).map(field => (
                  <Badge key={field} variant="outline" className="text-xs">
                    {field}
                  </Badge>
                ))}
                {availableDataFields.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{availableDataFields.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )} */}

          {/* Templates Summary */}
          {hasTemplates && (
            <div className="p-2 bg-green-50 rounded border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    {templates.length} template{templates.length === 1 ? '' : 's'} created
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {templates.length}
                </Badge>
              </div>
            </div>
          )}

          {/* Template Management Link */}
          <div className="pt-2 border-t border-border">
            <Button
              onClick={handleOpenTemplateManagement}
              variant="outline"
              size="sm"
              className="w-full"
              disabled={isNavigating}
            >
              {isNavigating ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Settings className="w-3 h-3 mr-1" />
              )}
              Manage Templates
            </Button>
            <div className="text-xs text-center text-muted-foreground mt-1">
              Edit existing templates and field mappings
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <Alert variant={feedback.type === 'success' ? 'default' : feedback.type === 'error' ? 'destructive' : 'default'} className="py-2">
              {feedback.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : feedback.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Scan className="h-4 w-4" />
              )}
              <AlertDescription className="text-sm">{feedback.message}</AlertDescription>
            </Alert>
          )}

          {/* Getting started guide */}
          {!hasCustomerData && (
            <div className="text-center text-xs text-muted-foreground bg-yellow-50 rounded p-3">
              <div className="mb-2">🚀 Quick Start Guide:</div>
              <div className="space-y-1 text-left">
                <div>1. Go to AutoFill → Customer Data</div>
                <div>2. Upload your JSON customer data</div>
                <div>3. Return here to scan forms</div>
                <div>4. Map fields to create templates</div>
              </div>
            </div>
          )}

          {hasCustomerData && !hasTemplates && (
            <div className="text-center text-xs text-muted-foreground bg-blue-50 rounded p-3">
              <div className="mb-2">✨ Ready to create your first template!</div>
              <div className="space-y-1 text-left">
                <div>1. Navigate to a form you want to fill</div>
                <div>2. Click "AI Scan Current Form"</div>
                <div>3. Map fields in the field mapper</div>
                <div>4. Use AutoFill tab to fill forms</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}