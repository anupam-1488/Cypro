/**
 * Quote Generator Hook - Simple Demo
 * Shows API utility and Storage with clean architecture
 * @module @voilajsx/comet
 * @file src/features/quote-generator/hooks/useQuoteGenerator.ts
 */

import { useState, useEffect } from 'react';
import { storage } from '@voilajsx/comet/storage';
import { comet } from '@voilajsx/comet/api';

// Simple types
interface Quote {
  text: string;
  author: string;
  category: 'advice' | 'wisdom' | 'motivational';
  source: 'api' | 'fallback';
  timestamp: number;
}

interface Settings {
  quoteType: 'general' | 'motivational';
}

export function useQuoteGenerator() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [settings, setSettings] = useState<Settings>({ quoteType: 'general' });
  const [loading, setLoading] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const quoteType = await storage.get('quoteGenerator.type', 'general');
      setSettings({ quoteType });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Get quote (API Utility demo)
  const getQuote = async () => {
    setLoading(true);
    
    try {
      let quote: Quote;
      
      if (settings.quoteType === 'motivational') {
        quote = await getMotivationalQuote();
      } else {
        quote = await getGeneralQuote();
      }
      
      setCurrentQuote(quote);
      return { success: true, data: quote };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update setting
  const updateSetting = async (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await storage.set(`quoteGenerator.${key === 'quoteType' ? 'type' : key}`, value);
  };

  return {
    currentQuote,
    settings,
    loading,
    getQuote,
    updateSetting,
  };
}

// API functions (moved from index.ts)
async function getGeneralQuote(): Promise<Quote> {
  try {
    const response = await comet.get('https://api.adviceslip.com/advice');
    if (response.ok && response.data?.slip?.advice) {
      return {
        text: response.data.slip.advice,
        author: 'Anonymous',
        category: 'advice',
        source: 'api',
        timestamp: Date.now(),
      };
    } else {
      throw new Error('API failed');
    }
  } catch (error) {
    return getFallbackQuote();
  }
}

async function getMotivationalQuote(): Promise<Quote> {
  try {
    // Try API first
    const quote = await getGeneralQuote();
    if (quote.source === 'api') {
      quote.category = 'motivational';
      return quote;
    } else {
      return getMotivationalFallback();
    }
  } catch (error) {
    return getMotivationalFallback();
  }
}

function getFallbackQuote(): Quote {
  const quotes = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: "Life is what happens while you're busy making other plans.", author: 'John Lennon' },
    { text: 'The future belongs to those who believe in their dreams.', author: 'Eleanor Roosevelt' },
    { text: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde' },
    { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    ...randomQuote,
    category: 'wisdom',
    source: 'fallback',
    timestamp: Date.now(),
  };
}

function getMotivationalFallback(): Quote {
  const quotes = [
    { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
    { text: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins' },
    { text: "Don't watch the clock; do what it does. Keep going.", author: 'Sam Levenson' },
    { text: "Believe you can and you're halfway there.", author: 'Theodore Roosevelt' },
    { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    ...randomQuote,
    category: 'motivational',
    source: 'fallback',
    timestamp: Date.now(),
  };
}