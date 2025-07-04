/**
 * Page Analyzer Feature - Simple Configuration
 * @module @voilajsx/comet
 * @file src/features/page-analyzer/index.ts
 */

import type { ModuleConfig } from '@/featuretypes';

const config: ModuleConfig = {
  name: 'pageAnalyzer',

  ui: {
    popup: {
      tab: {
        label: 'Analyzer',
        icon: 'FileText',
        order: 1,
        requiresTab: true,
        description: 'Demo: Storage + Messaging + API',
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Page Analyzer',
        icon: 'FileText',
        section: 'features',
        order: 2,
        description: 'Demo framework features',
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  settings: {
    autoValidate: {
      key: 'pageAnalyzer.autoValidate',
      default: false,
      type: 'boolean',
      label: 'Auto-validate HTML',
      description: 'Run validation after analysis',
    },
    saveHistory: {
      key: 'pageAnalyzer.saveHistory',
      default: false,
      type: 'boolean',
      label: 'Save History',
      description: 'Store results (storage demo)',
    },
  },

  meta: {
    name: 'Page Analyzer',
    description: 'Demo: Storage, Messaging, API utilities',
    version: '3.0.0',
    author: 'Comet Framework',
    category: 'demo',
    tags: ['demo', 'storage', 'messaging', 'api'],
  },

  handlers: {
    getPageSize: () => getPageSize(),
  },

  init: () => console.log('[Demo] Page Analyzer initialized'),
};

// Simple page analysis
function getPageSize() {
  const html = document.documentElement.outerHTML;
  return {
    htmlBytes: new Blob([html]).size,
    formatted: formatBytes(new Blob([html]).size),
    images: document.images.length,
    links: document.links.length,
    url: window.location.href,
    hostname: window.location.href,
    timestamp: Date.now(),
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default config;