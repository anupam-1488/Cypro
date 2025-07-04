/**
 * Hello World Feature - With Icon Options
 * @module @voilajsx/comet
 * @file src/features/hello-world/index.ts
 */

import type { ModuleConfig } from '@/featuretypes';

const config: ModuleConfig = {
  name: 'helloWorld',

  ui: {
    popup: {
      tab: {
        label: 'Hello',
        icon: 'Smile',  
        order: 0,
        requiresTab: false,
        description: 'Simple hello world demo',
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Hello World',
        icon: 'Smile',  
        section: 'features',
        order: 1,
        description: 'Basic feature demo',
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  meta: {
    name: 'Hello World',
    description: 'Super simple feature demo',
    version: '1.0.0',
    author: 'Comet Framework',
    category: 'demo',
    tags: ['hello', 'simple', 'demo'],
  },

  handlers: {},

  init: () => console.log('[Demo] Hello World feature loaded!'),
};

export default config;

// 🎨 Other great icon options for Hello World:
// 'Smile'      - 😊 Friendly greeting
// 'Hand'       - 👋 Waving hello
// 'Heart'      - ❤️ Love/friendship (current)
// 'Star'       - ⭐ Special/favorite
// 'Sun'        - ☀️ Bright/positive
// 'Coffee'     - ☕ Casual/friendly
// 'MessageCircle' - 💬 Communication
// 'Users'      - 👥 People/social