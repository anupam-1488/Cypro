/**
 * Page Analyzer Hook - Simplified Demo
 * Shows Storage, Messaging, and API utilities with minimal complexity
 * @module @voilajsx/comet
 * @file src/features/page-analyzer/hooks/usePageAnalyzer.ts
 */

import { useState, useEffect } from 'react';
import { storage } from '@voilajsx/comet/storage';
import { messaging } from '@voilajsx/comet/messaging';
import { comet } from '@voilajsx/comet/api';

// Simple types
interface PageData {
  size: string;
  url: string;
  domain: string;
  timestamp: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: number;
  url: string;
  domain: string;
  timestamp: number;
}

export function usePageAnalyzer() {
  const [pageData, setPageData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [settings, setSettings] = useState({ autoValidate: false, saveHistory: false });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState({ analyze: false, validate: false });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const autoValidate = await storage.get('pageAnalyzer.autoValidate', false);
      const saveHistory = await storage.get('pageAnalyzer.saveHistory', false);
      const savedHistory = await storage.get('pageAnalyzer.history', []);
      
      setSettings({ autoValidate, saveHistory });
      setHistory(savedHistory);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // Analyze page size (Messaging API demo)
  const analyzePageSize = async () => {
    setLoading(prev => ({ ...prev, analyze: true }));
    
    try {
      const response = await messaging.sendToContent({
        type: 'getPageSize',
        data: {}
      });
      console.log('pagesize',response.data);
      if (response.success) {
        const data = {
          size: response.data.formatted,
          url: response.data.url,
          domain: new URL(response.data.url).hostname,
          timestamp: Date.now()
        };
        
        setPageData(data);
        
        if (settings.saveHistory) {
          await saveToHistory('analysis', data);
        }

        return { success: true, data };
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(prev => ({ ...prev, analyze: false }));
    }
  };

  // Validate HTML (API Utility demo)
  const validateHTML = async () => {
    setLoading(prev => ({ ...prev, validate: true }));
    
    try {
      const currentTab = await messaging.getActiveTab();
      if (!currentTab?.url) throw new Error('Cannot get current tab');
      
      const targetUrl = currentTab.url;
      const domain = new URL(targetUrl).hostname;
      
      const response = await comet.get(
        `https://validator.w3.org/nu/?doc=${encodeURIComponent(targetUrl)}&out=json`
      );

      if (response.ok) {
        const messages = response.data.messages || [];
        const errors = messages.filter(m => m.type === 'error').length;
        
        const result = {
          isValid: errors === 0,
          errors,
          url: targetUrl,
          domain,
          timestamp: Date.now()
        };
        
        setValidationResult(result);
        
        if (settings.saveHistory) {
          await saveToHistory('validation', result);
        }

        return { success: true, data: result };
      } else {
        throw new Error('Validation service unavailable');
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(prev => ({ ...prev, validate: false }));
    }
  };

  // Save to history
  const saveToHistory = async (type, data) => {
    try {
      const newEntry = { type, data, timestamp: Date.now() };
      const updatedHistory = [newEntry, ...history.slice(0, 4)];
      
      setHistory(updatedHistory);
      await storage.set('pageAnalyzer.history', updatedHistory);
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  // Update setting
  const updateSetting = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await storage.set(`pageAnalyzer.${key}`, value);
  };

  // Clear history
  const clearHistory = async () => {
    setHistory([]);
    await storage.remove('pageAnalyzer.history');
  };

  return {
    pageData,
    validationResult,
    settings,
    history,
    analyzePageSize,
    validateHTML,
    updateSetting,
    clearHistory,
    loading,
    hasHistory: history.length > 0,
  };
}