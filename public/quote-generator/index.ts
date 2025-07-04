/**
 * Quote Generator Feature - Simple Configuration
 * @module @voilajsx/comet
 * @file src/features/quote-generator/index.ts
 */

import type { ModuleConfig } from '@/featuretypes';

const config: ModuleConfig = {
  name: 'quoteGenerator',

  ui: {
    popup: {
      tab: {
        label: 'Quotes',
        icon: 'Quote',
        order: 2,
        requiresTab: false,
        description: 'Get inspirational quotes',
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Quote Generator',
        icon: 'Quote',
        section: 'features',
        order: 3,
        description: 'Configure quote preferences',
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  settings: {
    quoteType: {
      key: 'quoteGenerator.type',
      default: 'general',
      type: 'select',
      label: 'Quote Type',
      description: 'Choose quote category',
      options: [
        { value: 'general', label: 'General Quotes' },
        { value: 'motivational', label: 'Motivational Quotes' },
      ],
    },
  },

  meta: {
    name: 'Quote Generator',
    description: 'Demo: API utility with offline fallback',
    version: '2.0.0',
    author: 'Comet Framework',
    category: 'inspiration',
    tags: ['quotes', 'api', 'demo'],
  },

  // No handlers needed - hook handles everything
  handlers: {},

  init: () => console.log('[Demo] Quote Generator initialized'),
};

export default config;