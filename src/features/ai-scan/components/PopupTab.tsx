// features/ai-scan/components/PopupTab.tsx
import React, { useState, useCallback } from 'react';
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
  Bug,
  TestTube,
  Monitor,
  Code,
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
    selectedCustomer,
    selectedTemplate,
    extractFormFields,
    saveExtractedFields,
  } = useCustomer();

  const [feedback, setFeedback] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [currentPageInfo, setCurrentPageInfo] = useState(null);

  // Feedback handlers
  const showFeedback = useCallback((type, message, duration = FEEDBACK_DURATION.DEFAULT) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), duration);
  }, []);

  const showSuccess = useCallback((message) => showFeedback('success', message, FEEDBACK_DURATION.SUCCESS), [showFeedback]);
  const showError = useCallback((message) => showFeedback('error', message), [showFeedback]);

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
      showError('Could not get page info');
      return null;
    }
  }, [showError]);

  // AI Scan handler
  const handleAIScan = useCallback(async () => {
    const templateName = prompt('Enter template name:');
    if (!templateName?.trim()) {
      showError('Template name is required');
      return;
    }

    setIsScanning(true);
    
    try {
      // Get current page info
      const pageInfo = await getCurrentPageInfo();
      if (!pageInfo) {
        showError('Could not scan this page');
        return;
      }

      // Extract form fields
      const extractResult = await extractFormFields();
      if (!extractResult.success) {
        showError(extractResult.error || 'Failed to scan form');
        return;
      }

      if (!extractResult.fields || extractResult.fields.length === 0) {
        showError('No form fields found on this page');
        return;
      }

      // Save extracted fields
      const saveResult = await saveExtractedFields({
        templateName: templateName.trim(),
        fields: extractResult.fields,
        url: pageInfo.url,
        domain: pageInfo.domain,
      });

      if (saveResult.success) {
        showSuccess(`Scanned ${extractResult.fields.length} fields! Opening field mapper...`);
        
        // Auto-redirect to options panel for field mapping
        setIsNavigating(true);
        setTimeout(async () => {
          try {
            await messaging.openOptionsPage();
          } catch (error) {
            showError('Failed to open field mapper');
          } finally {
            setIsNavigating(false);
          }
        }, 1000);
      } else {
        showError('Failed to save template');
      }
    } catch (error) {
      console.error('AI Scan error:', error);
      showError('Scan failed');
    } finally {
      setIsScanning(false);
    }
  }, [extractFormFields, saveExtractedFields, getCurrentPageInfo, showError, showSuccess]);

  // Debug handlers
  const handleComprehensiveDebug = useCallback(async () => {
    setIsRunningTest(true);
    showFeedback('info', 'Running comprehensive debug tests...');
    
    try {
      console.log('=== 🏢 COMPREHENSIVE DEBUG FROM POPUP ===');
      
      console.log('👤 BASIC DATA:');
      console.log('- Selected Customer:', selectedCustomer?.name);
      console.log('- Selected Template:', selectedTemplate?.name);
      console.log('- Total Templates:', templates.length);

      console.log('📡 TESTING FRAME INJECTION...');
      let frameTest = null;
      try {
        frameTest = await messaging.sendToContent({
          type: 'comprehensiveFrameTest',
          data: {}
        });
        console.log('✅ Frame test result:', frameTest);
      } catch (error) {
        console.error('❌ Frame test failed:', error);
      }

      console.log('🖼️ TESTING IFRAME ACCESS...');
      let iframeTest = null;
      try {
        iframeTest = await messaging.sendToContent({
          type: 'testDirectIframeAccess',
          data: {}
        });
        console.log('✅ Iframe test result:', iframeTest);
      } catch (error) {
        console.error('❌ Iframe test failed:', error);
      }

      console.log('🧪 TESTING EXTRACTION...');
      let extractTest = null;
      try {
        extractTest = await messaging.sendToContent({
          type: 'testExtractionReturn',
          data: {}
        });
        console.log('✅ Extraction test result:', extractTest);
      } catch (error) {
        console.error('❌ Extraction test failed:', error);
      }

      const passedTests = [frameTest?.success, iframeTest?.success, extractTest?.success].filter(Boolean).length;
      showSuccess(`Debug complete - ${passedTests}/3 tests passed - check console (F12)`);
    } catch (error) {
      console.error('💥 Debug test failed:', error);
      showError(`Debug failed: ${error.message}`);
    } finally {
      setIsRunningTest(false);
    }
  }, [selectedCustomer, selectedTemplate, templates, showFeedback, showError, showSuccess]);

  const handleIframeTest = useCallback(async () => {
    setIsRunningTest(true);
    showFeedback('info', 'Testing iframe accessibility...');
    
    try {
      const result = await messaging.sendToContent({
        type: 'comprehensiveIframeTest',
        data: {}
      });
      
      console.log('🖼️ Iframe Test Results:', result);
      
      if (result.success) {
        const accessible = result.iframes?.filter(i => i.accessible).length || 0;
        const total = result.iframes?.length || 0;
        showSuccess(`Found ${total} iframes, ${accessible} accessible`);
      } else {
        showError('Iframe test failed');
      }
    } catch (error) {
      console.error('❌ Iframe test error:', error);
      showError('Iframe test failed');
    } finally {
      setIsRunningTest(false);
    }
  }, [showFeedback, showError, showSuccess]);

  const handleExtractionTest = useCallback(async () => {
    setIsRunningTest(true);
    showFeedback('info', 'Testing form field extraction...');
    
    try {
      const result = await messaging.sendToContent({
        type: 'testExtractionReturn',
        data: {}
      });
      
      console.log('🧪 Extraction Test Results:', result);
      
      if (result.success) {
        showSuccess('Extraction test completed - check console');
      } else {
        showError('Extraction test failed');
      }
    } catch (error) {
      console.error('❌ Extraction test error:', error);
      showError('Extraction test failed');
    } finally {
      setIsRunningTest(false);
    }
  }, [showFeedback, showError, showSuccess]);

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

          {/* Main Scan Button */}
          <div className="space-y-2">
            <Button
              onClick={handleAIScan}
              disabled={isScanning || isNavigating}
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

          {/* Debug Tools Section */}
          {/* <div className="pt-2 border-t border-border">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Debug Tools
            </h4>
            
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={handleComprehensiveDebug}
                disabled={isRunningTest || isNavigating}
                variant="outline"
                size="sm"
                className="h-12 flex-col"
              >
                {isRunningTest ? (
                  <Loader2 className="w-4 h-4 mb-1 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4 mb-1" />
                )}
                <span className="text-xs">Comprehensive Debug</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleIframeTest}
                  disabled={isRunningTest || isNavigating}
                  variant="outline"
                  size="sm"
                  className="h-10 flex-col"
                >
                  {isRunningTest ? (
                    <Loader2 className="w-3 h-3 mb-1 animate-spin" />
                  ) : (
                    <Monitor className="w-3 h-3 mb-1" />
                  )}
                  <span className="text-xs">Iframe Test</span>
                </Button>

                <Button
                  onClick={handleExtractionTest}
                  disabled={isRunningTest || isNavigating}
                  variant="outline"
                  size="sm"
                  className="h-10 flex-col"
                >
                  {isRunningTest ? (
                    <Loader2 className="w-3 h-3 mb-1 animate-spin" />
                  ) : (
                    <Code className="w-3 h-3 mb-1" />
                  )}
                  <span className="text-xs">Extract Test</span>
                </Button>
              </div>
            </div>
          </div> */}

          {/* Templates Summary */}
          {templates.length > 0 && (
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
                <TestTube className="h-4 w-4" />
              )}
              <AlertDescription className="text-sm">{feedback.message}</AlertDescription>
            </Alert>
          )}

          {/* Getting started for new users */}
          {templates.length === 0 && (
            <div className="text-center text-xs text-muted-foreground bg-blue-50 rounded p-3">
              <div className="mb-2">No templates yet? Here's how:</div>
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