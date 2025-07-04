/**
 * Hello World Popup Tab - Simplified
 * @module @voilajsx/comet
 * @file src/features/hello-world/components/PopupTab.tsx
 */

import React from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Badge } from '@voilajsx/uikit/badge';
import { Smile, Sparkles, RotateCcw } from 'lucide-react';
import { useHelloWorld } from '../hooks/useHelloWorld';

export default function HelloWorldTab({ value }) {
  const { clickCount, userName, handleClick, updateName, reset, message, loading } = useHelloWorld();

  if (loading) {
    return (
      <TabsContent value={value} className="mt-0">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Smile className="w-4 h-4 text-yellow-500" />
            Hello World
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => updateName(e.target.value)}
          />

          <div className="flex gap-2">
            <Button onClick={handleClick} className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Say Hello!
            </Button>
            <Button onClick={reset} variant="outline">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded">
            <div className="font-medium">{message}</div>
          </div>

          <div className="flex justify-center gap-4 text-sm">
            <span>Clicks: <Badge variant="secondary">{clickCount}</Badge></span>
            <span>User: <Badge variant="outline">{userName}</Badge></span>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}