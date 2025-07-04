/**
 * Hello World Hook - Simplified
 * @module @voilajsx/comet
 * @file src/features/hello-world/hooks/useHelloWorld.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@voilajsx/comet/storage';

export function useHelloWorld() {
  const [clickCount, setClickCount] = useState(0);
  const [userName, setUserName] = useState('Friend');
  const [loading, setLoading] = useState(true);

  // Load from storage
  useEffect(() => {
    const load = async () => {
      try {
        const [count, name] = await Promise.all([
          storage.get('helloworld-count', 0),
          storage.get('helloworld-name', 'Friend')
        ]);
        setClickCount(count);
        setUserName(name);
      } catch (error) {
        console.error('[Hello World] Load failed:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const message = `Hello, ${userName}! You've clicked ${clickCount} times. 👋`;

  const handleClick = useCallback(async () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    await storage.set('helloworld-count', newCount);
  }, [clickCount]);

  const updateName = useCallback(async (name: string) => {
    const newName = name.trim() || 'Friend';
    setUserName(newName);
    await storage.set('helloworld-name', newName);
  }, []);

  const reset = useCallback(async () => {
    await storage.remove(['helloworld-count', 'helloworld-name']);
    setClickCount(0);
    setUserName('Friend');
  }, []);

  return {
    clickCount,
    userName,
    message,
    loading,
    handleClick,
    updateName,
    reset,
  };
}