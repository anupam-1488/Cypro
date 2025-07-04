/**
 * Quote Generator Options Panel - Simple Demo
 * @module @voilajsx/comet
 * @file src/features/quote-generator/components/OptionsPanel.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Label } from '@voilajsx/uikit/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@voilajsx/uikit/select';
import { Quote } from 'lucide-react';
import { useQuoteGenerator } from '../hooks/useQuoteGenerator';

export default function QuoteGeneratorOptionsPanel() {
  const { settings, updateSetting } = useQuoteGenerator();

  const handleTypeChange = (type) => {
    updateSetting('quoteType', type);
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold">Quote Generator Settings</h1>
        <p className="text-muted-foreground">
          Choose your preferred quote type
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5" />
            Quote Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="space-y-3">
            <Label htmlFor="quote-type-select" className="text-sm font-medium">
              Quote Category
            </Label>
            <div class="pt-2">
<Select value={settings.quoteType} onValueChange={handleTypeChange}>
              <SelectTrigger id="quote-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <div>
                    <div className="font-medium">General Quotes</div>
                    <div className="text-xs text-muted-foreground">
                      Wisdom and life advice
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="motivational">
                  <div>
                    <div className="font-medium">Motivational Quotes</div>
                    <div className="text-xs text-muted-foreground">
                      Inspiring and uplifting messages
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            </div>
            
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <strong>API Demo:</strong> Uses external API with offline fallback when network fails.
          </div>

        </CardContent>
      </Card>
    </div>
  );
}``