/**
 * Hello World Options Panel - Simplified
 * @module @voilajsx/comet
 * @file src/features/hello-world/components/OptionsPanel.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Badge } from '@voilajsx/uikit/badge';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Label } from '@voilajsx/uikit/label';
import { Smile, RotateCcw } from 'lucide-react';
import { useHelloWorld } from '../hooks/useHelloWorld';

export default function HelloWorldOptionsPanel() {
  const { clickCount, userName, updateName, reset, message, loading } = useHelloWorld();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Hello World Settings</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hello World Settings</h1>
        <p className="text-muted-foreground">
          Demo showing persistent shared state using Comet storage
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-500" />
            Shared State Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="space-y-2">
            <Label htmlFor="options-name">Your Name</Label>
            <Input
              id="options-name"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => updateName(e.target.value)}
            />
          </div>

          <Button onClick={reset} variant="outline" className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Data
          </Button>

          <div className="p-3 bg-muted/50 rounded border">
            <div className="text-sm font-medium mb-2">Current State:</div>
            <div className="text-sm text-muted-foreground mb-2">"{message}"</div>
            <div className="flex gap-4 text-xs">
              <span>Clicks: <Badge variant="secondary">{clickCount}</Badge></span>
              <span>User: <Badge variant="outline">{userName}</Badge></span>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}