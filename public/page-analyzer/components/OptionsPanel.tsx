/**
 * Page Analyzer Options Panel - Simple Demo
 * @module @voilajsx/comet
 * @file src/features/page-analyzer/components/OptionsPanel.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Switch } from '@voilajsx/uikit/switch';
import { Label } from '@voilajsx/uikit/label';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';
import { Separator } from '@voilajsx/uikit/separator';
import { 
  Settings, 
  Database, 
  Trash2, 
  History, 
  Shield,
  BarChart3
} from 'lucide-react';
import { usePageAnalyzer } from '../hooks/usePageAnalyzer';

export default function PageAnalyzerOptionsPanel() {
  const {
    settings,
    history,
    updateSetting,
    clearHistory,
    hasHistory
  } = usePageAnalyzer();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    return hours < 1 ? 'Now' : hours < 24 ? `${hours}h ago` : date.toLocaleDateString();
  };

  const getIcon = (type) => type === 'analysis' ? BarChart3 : Shield;
  const getLabel = (type) => type === 'analysis' ? 'Size' : 'HTML';

  const getDetails = (entry) => {
    if (!entry?.data) return { domain: 'Unknown', result: 'No data' };
    
    if (entry.type === 'analysis') {
      return {
        domain: entry.data.domain || 'Unknown',
        result: entry.data.size || 'Unknown'
      };
    } else {
      return {
        domain: entry.data.domain || 'Unknown', 
        result: entry.data.isValid ? 'Valid' : `${entry.data.errors || 0} errors`
      };
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold">Page Analyzer Settings</h1>
        <p className="text-muted-foreground">Simple demo of Storage, Messaging, and API utilities</p>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex items-center justify-between">
            <Label>Auto-validate after analysis</Label>
            <Switch
              checked={settings.autoValidate}
              onCheckedChange={(checked) => updateSetting('autoValidate', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Save results to history</Label>
            <Switch
              checked={settings.saveHistory}
              onCheckedChange={(checked) => updateSetting('saveHistory', checked)}
            />
          </div>

        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Storage Demo
            <Badge variant="secondary">{history.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          
          {hasHistory ? (
            <div className="space-y-3">
              
              <div className="flex justify-between items-center">
                <Label>Stored Results</Label>
                <Button onClick={clearHistory} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear ({history.length})
                </Button>
              </div>

              <div className="space-y-2">
                {history.slice(0, 5).map((entry, index) => {
                  if (!entry) return null;
                  
                  const Icon = getIcon(entry.type);
                  const details = getDetails(entry);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{details.domain}</div>
                          <div className="text-xs text-muted-foreground">{getLabel(entry.type)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{details.result}</div>
                        <div className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
              
            </div>
          ) : (
            <div className="text-center py-6">
              <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">No history yet</div>
              <div className="text-xs text-muted-foreground">Enable saving and analyze some pages</div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded mt-4">
            <strong>Storage Demo:</strong> Data persists across browser sessions and syncs between popup/options.
          </div>

        </CardContent>
      </Card>
    </div>
  );
}