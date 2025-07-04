/**
 * Page Analyzer Popup Tab - Simple Demo
 * @module @voilajsx/comet
 * @file src/features/page-analyzer/components/PopupTab.tsx
 */

import React, { useState } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Separator } from '@voilajsx/uikit/separator';
import { Badge } from '@voilajsx/uikit/badge';
import { 
  FileText, 
  Shield, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Globe
} from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';
import { usePageAnalyzer } from '../hooks/usePageAnalyzer';

export default function PageAnalyzerTab({ value, currentTab }) {
  const {
    pageData,
    validationResult,
    settings,
    analyzePageSize,
    validateHTML,
    loading
  } = usePageAnalyzer();

  const [feedback, setFeedback] = useState(null);
  const canAnalyze = messaging.isTabSupported(currentTab);

  const handleAnalyze = async () => {
    if (!canAnalyze) {
      setFeedback({ type: 'error', message: 'Not available on this page' });
      return;
    }

    const result = await analyzePageSize();
    
    if (result.success) {
      setFeedback({ type: 'success', message: 'Analysis complete!' });
      
      if (settings.autoValidate) {
        setTimeout(() => handleValidate(), 1000);
      }
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
    
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleValidate = async () => {
    if (!canAnalyze) {
      setFeedback({ type: 'error', message: 'Not available on this page' });
      return;
    }

    const result = await validateHTML();
    
    if (result.success) {
      const errors = result.data.errors;
      setFeedback({ 
        type: errors === 0 ? 'success' : 'warning',
        message: errors === 0 ? 'Valid HTML!' : `${errors} errors found`
      });
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
    
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Page Analysis & Validation
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          
          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleAnalyze}
              disabled={loading.analyze || !canAnalyze}
              className="w-full"
            >
              {loading.analyze ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze Page Size
                </>
              )}
            </Button>

            <Button
              onClick={handleValidate}
              disabled={loading.validate || !canAnalyze}
              variant="outline"
              className="w-full"
            >
              {loading.validate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Validate HTML
                </>
              )}
            </Button>
          </div>

          {/* Feedback */}
          {feedback && (
            <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'}>
              {feedback.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription class="pt-1">{feedback.message}</AlertDescription>
            </Alert>
          )}

          {/* Results - Simple rows */}
          {(pageData || validationResult) && (
            <div className="space-y-3">
              <Separator />
              
              {/* Page Size Result */}
              {pageData && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{pageData.domain}</span>
                  </div>
                  <Badge variant="secondary">{pageData.size}</Badge>
                </div>
              )}

              {/* Validation Result */}
              {validationResult && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{validationResult.domain}</span>
                  </div>
                  <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
                    {validationResult.isValid ? 'Valid' : `${validationResult.errors} errors`}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Not supported message */}
          {!canAnalyze && (
            <div className="text-center py-4 text-muted-foreground">
              <Globe className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm">Not available on this page type</div>
            </div>
          )}

        </CardContent>
      </Card>
    </TabsContent>
  );
}