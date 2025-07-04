/**
 * Quote Generator Popup Tab - Simple Demo
 * @module @voilajsx/comet
 * @file src/features/quote-generator/components/PopupTab.tsx
 */

import React, { useState } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Separator } from '@voilajsx/uikit/separator';
import { Badge } from '@voilajsx/uikit/badge';
import { Quote, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuoteGenerator } from '../hooks/useQuoteGenerator';

export default function QuoteGeneratorTab({ value, currentTab }) {
  const {
    currentQuote,
    settings,
    loading,
    getQuote
  } = useQuoteGenerator();

  const [feedback, setFeedback] = useState(null);

  const handleGetQuote = async () => {
    const result = await getQuote();
    
    if (result.success) {
      setFeedback({
        type: 'success',
        message: result.data.source === 'api' ? 'Fresh quote!' : 'Offline quote'
      });
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
    
    setTimeout(() => setFeedback(null), 3000);
  };

  const getConfig = () => {
    return settings.quoteType === 'motivational' 
      ? { title: 'Motivational Quote', desc: 'Inspiring messages', buttonText: 'Get Motivation' }
      : { title: 'General Quote', desc: 'Wisdom and advice', buttonText: 'Get Quote' };
  };

  const config = getConfig();

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Quote className="w-4 h-4" />
            {config.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{config.desc}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          
          {/* Get Quote Button */}
          <Button
            onClick={handleGetQuote}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Quote...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {config.buttonText}
              </>
            )}
          </Button>

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

          {/* Quote Display */}
          {currentQuote && (
            <div className="space-y-3">
              <Separator />
              
              <div className="bg-muted/50 p-4 rounded border">
                <div className="text-sm italic mb-3 leading-relaxed">
                  "{currentQuote.text}"
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>— {currentQuote.author}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {currentQuote.category}
                    </Badge>
                    <Badge variant={currentQuote.source === 'api' ? 'default' : 'secondary'}>
                      {currentQuote.source === 'api' ? 'Live' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Helper text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Change quote type in extension settings
            </p>
          </div>

        </CardContent>
      </Card>
    </TabsContent>
  );
}