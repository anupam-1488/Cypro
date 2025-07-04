<p >
   <img src="public/comet_logo.png" alt="Comet Framework Logo" width="200" />
</p>

# Comet Framework

**Enterprise-grade, modular, AI-ready extension framework.**

Build professional cross-browser extensions with consistent quality, smart modularity, and AI-powered development.

## Why Comet?

**Enterprise Extensions Need:** Stability, consistency, and maintainability across large teams and multiple projects.

**Current Problems:**

- UI inconsistency across team members creates unprofessional results
- Feature changes break existing functionality
- Too much flexibility leads to code chaos and maintenance nightmares
- AI tools can't generate accurate code with inconsistent patterns

**Comet's Solution:** Enforced consistency through structured patterns that humans follow and AI understands perfectly.

## Key Benefits

- **Enterprise-Grade Consistency:** Standardized UI components and coding patterns prevent deviations - impossible to create inconsistent interfaces
- **Safe Modularity:** Clear folder structure and true plugin architecture - features can't break each other, easy plug-in/plug-out
- **AI-Accelerated Development:** Predictable patterns let AI generate accurate, working code that follows your team's standards
- **Maintainable at Scale:** Structured file organization and enforced conventions make large codebases manageable

## Perfect For

Teams needing consistent extension quality, organizations building multiple browser tools, and developers who want AI to speed up development 10x without breaking anything or compromising quality.

# Comet Framework Documentation

## Table of Contents

### 1. Getting Started

- [1.1. Quick Start - Installation & first extension](#11-quick-start---installation--first-extension)
- [1.2. Core Concepts - Metadata-first architecture & auto-discovery overview](#12-core-concepts---metadata-first-architecture--auto-discovery-overview)
- [1.3. Project Structure - File organization & conventions](#13-project-structure---file-organization--conventions)

### 2. Learn by Example

- [2.1. Example 1: Hello World - Foundation (metadata, basic UI, storage fundamentals)](#21-example-1-hello-world---foundation-metadata-basic-ui-storage-fundamentals)
- [2.2. Example 2: Page Analyzer - Real-world patterns (messaging, APIs, complex UI)](#22-example-2-page-analyzer---real-world-patterns-messaging-apis-complex-ui)
- [2.3. Understanding the System - Deep dive into feature module patterns](#23-understanding-the-system---deep-dive-into-feature-module-patterns)

> 💡 **Additional Examples:** Check the Quote Generator feature for API patterns and advanced storage strategies

### 3. Building Your Own

- [3.1. Feature Module System - Create custom features from scratch](#31-feature-module-system---create-custom-features-from-scratch)
- [3.2. Configuration Management - defaults.ts & live reloads (logo, icon, theme changes)](#32-configuration-management---defaultsts--live-reloads-logo-icon-theme-changes)
- [3.3. UI Guidelines - Use UIKit components (shadcn/ui), semantic colors, existing wrappers](#33-ui-guidelines---use-uikit-components-shadcnui-semantic-colors-existing-wrappers)

### 4. Platform Integration

- [4.1. Platform APIs - Complete storage, messaging, CORS-free API reference](#41-platform-apis---complete-storage-messaging-cors-free-api-reference)
- [4.2. Cross-Browser Support - Chrome, Firefox, Edge compatibility](#42-cross-browser-support---chrome-firefox-edge-compatibility)
- [4.3. Extension Lifecycle - Install, update, permissions](#43-extension-lifecycle---install-update-permissions)

### 5. Production & AI

- [5.1. Build & Deploy - Production builds, store submission](#51-build--deploy---production-builds-store-submission)
- [5.2. LLM Development Guide - AI-assisted coding patterns](#52-llm-development-guide---ai-assisted-coding-patterns)
- [5.3. API Reference - Complete function signatures](#53-api-reference---complete-function-signatures)

### 6. Documentation Guidelines

- [6.1. General Guidelines - Writing standards for internal documentation](#61-general-guidelines---writing-standards-for-internal-documentation)
- [6.2. Sample Documentation - Reference examples for feature modules](#62-sample-documentation---reference-examples-for-feature-modules)

---

# 1. Getting Started

Welcome to Comet Framework - the fastest way to build professional cross-browser extensions with React. In just 5 minutes, you'll have a working extension with auto-discovered features, live configuration reloads, and production-ready architecture.

---

## 1.1. Quick Start - Installation & First Extension

### Prerequisites

- Node.js 18+ and npm 9+
- Basic React/TypeScript knowledge
- Chrome, Firefox, Edge, or Opera for testing

### Installation

```bash
# Clone the Comet starter
git clone https://github.com/voilajsx/comet.git my-extension
cd my-extension

# Install dependencies
npm install

# Build the extension
npm run build
```

### Load in Browser

**Chrome/Edge:**

1. Open `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked" → Select the `dist/` folder

**Firefox:**

1. Open `about:debugging`
2. Click "This Firefox" → "Load Temporary Add-on"
3. Select any file in the `dist/` folder

Your extension appears in the toolbar! 🎉

### Test Your Extension

1. **Click the extension icon** → See the popup with Hello World and Page Analyzer tabs
2. **Right-click icon → Options** → See the settings page
3. **Try the features** → Hello World demonstrates storage, Page Analyzer shows messaging

### Your First Build Success ✅

You now have a working cross-browser extension with:

- ✅ Auto-discovered features (Hello World, Page Analyzer)
- ✅ Professional popup with tabs
- ✅ Complete options page
- ✅ Live theme system
- ✅ Chrome, Firefox, Edge, Opera compatibility

**Next:** Understand how this magic works →

---

## 1.2. Core Concepts - Metadata-First Architecture & Auto-Discovery

### The Big Picture

Comet transforms extension development from **manual wiring** to **declarative configuration**. Instead of writing boilerplate code, you simply describe what your feature does using metadata, and Comet automatically handles the rest.

### Metadata-First Philosophy

**What is Metadata?**
Metadata is a simple JavaScript object that describes your feature - what it's called, where its UI goes, what it can do, and how it behaves. Think of it as a "feature blueprint."

**Simple Example:**

```javascript
// This metadata creates a complete feature automatically
const config = {
  name: 'myFeature',
  ui: {
    popup: {
      tab: { label: 'My Tab', icon: 'Star', order: 1 },
      component: () => import('./components/PopupTab.tsx'),
    },
  },
  handlers: {
    doSomething: () => {
      return 'Hello World!';
    },
  },
};
```

**What Comet Does Automatically:**

- ✅ Creates a popup tab labeled "My Tab" with a star icon
- ✅ Loads your component when the tab is clicked
- ✅ Registers the `doSomething` handler for messaging
- ✅ Handles all the wiring and browser compatibility
- ✅ Manages routing, storage, and lifecycle

### Auto-Discovery Magic

**How It Works:**

1. Comet scans your `src/features/` folder at build time
2. Finds all folders with `index.ts` files
3. Reads their metadata and generates the extension automatically
4. No manual registration needed - just drop in folders!

**Example:**

```
src/features/
├── hello-world/     # ✅ Auto-discovered
│   └── index.ts     # Has metadata → Creates feature
├── page-analyzer/   # ✅ Auto-discovered
│   └── index.ts     # Has metadata → Creates feature
└── _disabled/       # ❌ Ignored (underscore prefix)
    └── index.ts
```

### Key Benefits

- **10x faster development** - No boilerplate, just features
- **Zero configuration** - Framework handles everything internally
- **Enterprise consistency** - Enforced patterns and professional themes
- **Production ready** - Error handling, loading states, type safety built-in

**Next:** See how your project is organized →

---

## 1.3. Project Structure - File Organization & Conventions

### Overview

Comet uses **convention-over-configuration**. Follow simple folder patterns, and get automatic feature discovery, UI generation, and cross-browser compatibility.

### Complete Project Structure

```
my-extension/
├── src/
│   ├── features/                    # 🎯 Auto-discovered feature modules
│   │   ├── hello-world/            #    ✅ Enabled feature
│   │   │   ├── index.ts            #    Feature metadata (REQUIRED)
│   │   │   ├── components/         #    UI components
│   │   │   │   ├── PopupTab.tsx    #    Popup tab UI
│   │   │   │   └── OptionsPanel.tsx#    Options panel UI
│   │   │   └── hooks/              #    Business logic (optional)
│   │   │       └── useHelloWorld.ts
│   │   ├── page-analyzer/          #    ✅ Enabled feature
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── _quote-generator/       #    ❌ Disabled (underscore prefix)
│   │   └── index.ts                #    🤖 Auto-generated exports
│   │
│   ├── pages/                      # Extension UI pages
│   │   ├── popup/                  # Extension popup
│   │   └── options/                # Extension options
│   │
│   ├── shared/                     # Reusable components
│   │   ├── layouts/                # Smart wrapper components
│   │   ├── components/             # Shared UI components
│   │   └── hooks/                  # React hooks
│   │
│   ├── platform/                   # 🚫 Framework core - don't modify
│   │   ├── storage.ts              # Cross-browser storage
│   │   ├── messaging.ts            # Cross-browser messaging
│   │   └── api.ts                  # CORS-free API proxy
│   │
│   └── defaults.ts                 # ✨ Central configuration
│
├── manifest.json                   # Extension manifest
└── package.json
```

### Code Organization Philosophy

**Keep your code organized and production-ready by separating concerns:**

- **`index.ts`** - Feature metadata and configuration only
- **`hooks/`** - All business logic, API calls, state management
- **`components/`** - Pure UI components that use hooks
- **Internal config** - Feature-specific settings within the feature folder

**Example Structure:**

```typescript
// ✅ Good: Clean separation
// index.ts - Only metadata
const config = { name: 'myFeature', ui: {...} };

// hooks/useMyFeature.ts - All business logic
export function useMyFeature() {
  const [data, setData] = useState();
  const handleAction = async () => { /* logic here */ };
  return { data, handleAction };
}

// components/PopupTab.tsx - Pure UI
export default function MyFeatureTab() {
  const { data, handleAction } = useMyFeature();
  return <Button onClick={handleAction}>{data}</Button>;
}
```

### Key Conventions

#### 🎯 Feature Modules (`src/features/`)

**Basic Feature Structure:**

```
src/features/my-feature/
├── index.ts                 # REQUIRED: Feature metadata
├── components/              # UI components (optional)
│   ├── PopupTab.tsx        # Popup tab component
│   └── OptionsPanel.tsx    # Options panel component
└── hooks/                   # Business logic (optional)
    └── useMyFeature.ts     # Custom hook with logic
```

**Feature Toggle:**

```bash
# Enable: Remove underscore
mv src/features/_my-feature src/features/my-feature

# Disable: Add underscore
mv src/features/my-feature src/features/_my-feature
```

#### 📝 Feature Metadata (`index.ts`)

**Keep it simple - only metadata here:**

```typescript
import type { ModuleConfig } from '@/featuretypes';

const config: ModuleConfig = {
  name: 'myFeature', // REQUIRED: Unique camelCase name

  ui: {
    // OPTIONAL: UI components
    popup: {
      tab: {
        label: 'My Feature', // Tab label
        icon: 'Star', // Icon name (see available icons below)
        order: 1, // Tab order (lower = first)
        requiresTab: false, // Only show on supported pages?
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'My Feature Settings',
        icon: 'Settings',
        section: 'features', // Panel grouping
        order: 1,
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  handlers: {
    // OPTIONAL: Message handlers
    performAction: (data) => {
      return { success: true, result: data };
    },
  },
};

export default config;
```

#### 🎨 Available Icons

**Choose from these pre-loaded icons:**

```javascript
// Most commonly used icons available:
'FileText',
  'Quote',
  'Home',
  'Camera',
  'Sun',
  'Smile',
  'Heart',
  'Star',
  'Settings',
  'Zap';

// Want more icons? Add them in:
// src/shared/hooks/useModuleDiscovery.ts → ICON_MAP
```

#### ⚙️ Central Configuration (`src/defaults.ts`)

**⚠️ Important:** This file reloads every time you rebuild the extension. Only put **permanent, global settings** here.

```typescript
const defaults = {
  // ✅ Good: Global app settings
  'app-name': 'My Extension',
  'app-icon': 'Zap',
  'app-theme': 'metro',
  'popup-variant': 'default',

  // ✅ Good: Extension state
  extensionEnabled: true,

  // ❌ Avoid: User data, click counts, temporary state
  // These will be reset on every rebuild!
};
```

**For feature-specific config that shouldn't reset:**

```typescript
// Put inside your feature folder instead
// src/features/my-feature/config.ts
export const featureConfig = {
  apiEndpoint: 'https://api.example.com',
  maxRetries: 3,
};
```

### Development Workflow

1. **Create feature folder** - `src/features/my-feature/`
2. **Add metadata** - `index.ts` with basic config
3. **Build business logic** - `hooks/useMyFeature.ts`
4. **Create UI components** - `PopupTab.tsx`, `OptionsPanel.tsx`
5. **Test and iterate** - `npm run build`

### File Naming Rules

- **Features**: `kebab-case` folders (`page-analyzer`)
- **Components**: `PascalCase.tsx` (`PopupTab.tsx`)
- **Hooks**: `camelCase.ts` (`useMyFeature.ts`)
- **Modules**: `index.ts` (always)

**Next:** See how it all works with Hello World example →

# 2. Learn by Example

The best way to understand Comet is to see it in action. We'll start with a simple Hello World feature to learn the fundamentals, then build up to a real-world Page Analyzer that demonstrates advanced patterns.

---

## 2.1. Example 1: Hello World - Foundation (metadata, basic UI, storage fundamentals)

### What Hello World Does

**Hello World is a simple greeting app that demonstrates core Comet concepts:**

- **Popup tab:** Enter your name, click "Say Hello!" to increment a counter
- **Options panel:** Same interface with shared state - changes sync instantly
- **Persistent storage:** Your name and click count survive browser restarts
- **Cross-component state:** Update name in popup → see it in options immediately

**Why this example?** It's the simplest possible feature that shows every core Comet pattern without complexity.

### See It in Action

**Before diving into code, try the Hello World feature:**

1. **Open your extension popup** → Click the "Hello" tab
2. **Enter your name** → Type "Sarah" in the input field
3. **Click "Say Hello!"** → Watch the counter increment
4. **Open extension options** → Right-click extension icon → Options
5. **Find Hello World settings** → See the same name and count
6. **Change the name in options** → Type "Alex"
7. **Go back to popup** → Name updated automatically!
8. **Close and reopen extension** → Data persists

**What you just experienced:**

- ✅ Automatic UI generation from metadata
- ✅ Shared state between popup and options
- ✅ Persistent storage that survives browser sessions
- ✅ Real-time synchronization across components

### Quick Code Overview

**Hello World has exactly 4 files that create the entire feature:**

```
src/features/hello-world/
├── index.ts              # 🧠 Metadata - tells Comet what to build
├── hooks/
│   └── useHelloWorld.ts  # ⚙️ Business logic - state and storage
└── components/
    ├── PopupTab.tsx      # 🎨 Popup UI - what users see in extension
    └── OptionsPanel.tsx  # ⚙️ Options UI - settings page
```

**How they work together:**

1. **`index.ts`** → Tells Comet "create a popup tab and options panel"
2. **`useHelloWorld.ts`** → Manages name, counter, and storage
3. **`PopupTab.tsx`** → Uses the hook to display UI in popup
4. **`OptionsPanel.tsx`** → Uses same hook to display UI in options

**The magic:** One hook, two UIs, automatic synchronization!

### Now Let's Deep Dive

**Understanding why each part exists and how they work together:**

---

### Part 1: Metadata - The Blueprint 🧠

**File:** `src/features/hello-world/index.ts`

```typescript
/**
 * Hello World Feature - Metadata tells Comet what to build
 */
import type { ModuleConfig } from '@/featuretypes';

const config: ModuleConfig = {
  name: 'helloWorld', // Unique identifier (camelCase)

  ui: {
    popup: {
      tab: {
        label: 'Hello', // Tab text users see
        icon: 'Smile', // Icon from available set
        order: 0, // Tab position (0 = first)
        requiresTab: false, // Works on all pages
        description: 'Simple hello world demo',
      },
      component: () => import('./components/PopupTab.tsx'), // Lazy load UI
    },
    options: {
      panel: {
        label: 'Hello World', // Panel title in options
        icon: 'Smile', // Same icon for consistency
        section: 'features', // Groups with other features
        order: 1, // Panel position
        description: 'Basic feature demo',
      },
      component: () => import('./components/OptionsPanel.tsx'), // Lazy load UI
    },
  },

  meta: {
    name: 'Hello World',
    description: 'Super simple feature demo',
    version: '1.0.0',
  },

  init: () => console.log('[Demo] Hello World feature loaded!'),
};

export default config;
```

**Why this structure?**

- **Declarative** → You describe what you want, Comet builds it
- **No manual wiring** → No event listeners, no DOM manipulation
- **Lazy loading** → Components load only when needed (performance)
- **Type safe** → TypeScript catches errors at build time

**What Comet does automatically:**

1. **Scans** this file during build
2. **Creates** popup tab with label "Hello" and smile icon
3. **Creates** options panel in the "features" section
4. **Handles** tab switching and component loading
5. **Orders** tabs and panels by the `order` property

---

### Part 2: Business Logic - The Engine ⚙️

**File:** `src/features/hello-world/hooks/useHelloWorld.ts`

```typescript
/**
 * Hello World Hook - All business logic in one place
 */
import { useState, useEffect, useCallback } from 'react';
import { storage } from '@voilajsx/comet/storage';

export function useHelloWorld() {
  // State management
  const [clickCount, setClickCount] = useState(0);
  const [userName, setUserName] = useState('Friend');
  const [loading, setLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [count, name] = await Promise.all([
          storage.get('helloworld-count', 0), // Get with fallback
          storage.get('helloworld-name', 'Friend'), // Default if not found
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

  // Handle button click with auto-save
  const handleClick = useCallback(async () => {
    const newCount = clickCount + 1;
    setClickCount(newCount); // Update UI immediately
    await storage.set('helloworld-count', newCount); // Save to storage
  }, [clickCount]);

  // Handle name change with auto-save
  const updateName = useCallback(async (name: string) => {
    const newName = name.trim() || 'Friend';
    setUserName(newName); // Update UI immediately
    await storage.set('helloworld-name', newName); // Save to storage
  }, []);

  // Reset everything
  const reset = useCallback(async () => {
    await storage.remove(['helloworld-count', 'helloworld-name']);
    setClickCount(0);
    setUserName('Friend');
  }, []);

  const message = `Hello, ${userName}! You've clicked ${clickCount} times. 👋`;

  return {
    // State
    clickCount,
    userName,
    message,
    loading,
    // Actions
    handleClick,
    updateName,
    reset,
  };
}
```

**Why use a custom hook?**

- **Centralized logic** → One place for all business logic
- **Reusable** → Both popup and options use the same hook
- **Auto-sync** → State changes automatically sync across components
- **Easy testing** → Logic isolated from UI components
- **Clean separation** → UI components focus only on display

**Storage pattern explained:**

1. **Load on mount** → Get saved data or use defaults
2. **Auto-save on change** → Every update saves immediately
3. **Optimistic updates** → UI updates first, then saves
4. **Error handling** → Graceful fallbacks if storage fails

---

### Part 3: Popup UI - What Users See 🎨

**File:** `src/features/hello-world/components/PopupTab.tsx`

```typescript
/**
 * Hello World Popup Tab - Pure UI component
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
  // Get all logic from hook
  const {
    clickCount,
    userName,
    handleClick,
    updateName,
    reset,
    message,
    loading,
  } = useHelloWorld();

  // Loading state
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

  // Main UI
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
          {/* Name input */}
          <Input
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => updateName(e.target.value)}
          />

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button onClick={handleClick} className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Say Hello!
            </Button>
            <Button onClick={reset} variant="outline">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Display message */}
          <div className="text-center p-3 bg-muted/50 rounded">
            <div className="font-medium">{message}</div>
          </div>

          {/* Status badges */}
          <div className="flex justify-center gap-4 text-sm">
            <span>
              Clicks: <Badge variant="secondary">{clickCount}</Badge>
            </span>
            <span>
              User: <Badge variant="outline">{userName}</Badge>
            </span>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
```

**Why this pattern?**

- **Pure UI** → No business logic, just display and user input
- **Hook integration** → All logic comes from `useHelloWorld()`
- **UIKit components** → Professional styling with theme support
- **Semantic colors** → `bg-muted/50`, `text-yellow-500` work with all themes
- **Loading states** → Proper UX while data loads
- **Accessibility** → Proper labels, keyboard navigation

**Component structure:**

1. **TabsContent wrapper** → Required for tab system
2. **Card layout** → Consistent styling pattern
3. **Conditional rendering** → Loading state vs main UI
4. **Event handlers** → Call hook functions directly
5. **Visual feedback** → Badges, colors, icons

---

### Part 4: Options UI - Settings Panel ⚙️

**File:** `src/features/hello-world/components/OptionsPanel.tsx`

```typescript
/**
 * Hello World Options Panel - Same hook, different UI
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
  // Same hook as popup - automatic state sync!
  const { clickCount, userName, updateName, reset, message, loading } =
    useHelloWorld();

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
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Hello World Settings</h1>
        <p className="text-muted-foreground">
          Demo showing persistent shared state using Comet storage
        </p>
      </div>

      {/* Settings card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-500" />
            Shared State Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name setting */}
          <div className="space-y-2">
            <Label htmlFor="options-name">Your Name</Label>
            <Input
              id="options-name"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => updateName(e.target.value)}
            />
          </div>

          {/* Reset button */}
          <Button onClick={reset} variant="outline" className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Data
          </Button>

          {/* Current state display */}
          <div className="p-3 bg-muted/50 rounded border">
            <div className="text-sm font-medium mb-2">Current State:</div>
            <div className="text-sm text-muted-foreground mb-2">
              "{message}"
            </div>
            <div className="flex gap-4 text-xs">
              <span>
                Clicks: <Badge variant="secondary">{clickCount}</Badge>
              </span>
              <span>
                User: <Badge variant="outline">{userName}</Badge>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Why the same hook works in both UIs:**

- **Shared state** → Both components read from same storage keys
- **Real-time sync** → Storage changes trigger re-renders
- **Consistent behavior** → Same logic, different presentation
- **No prop drilling** → Each component gets data directly

### The Magic: How It All Works Together

**1. Auto-Discovery Process:**

```
Build time → Scan features/ → Find index.ts → Read metadata → Generate UI
```

**2. Component Loading:**

```
User clicks tab → Lazy import → Load component → Mount → Hook loads data
```

**3. State Synchronization:**

```
User types name → Hook updates → Storage saves → Other components re-render
```

**4. Cross-Context Communication:**

```
Popup ↔ Storage ↔ Options (automatic synchronization)
```

### Understanding Popup vs Options and UI Guidelines

**Popup and Options serve different user needs.** The popup (click extension icon) is for quick daily actions like checking status or toggling features. Keep it simple and fast. The Options page (right-click → Options) is for detailed configuration where users take time to set things up. The smart pattern is using the same business logic hook (`useMyFeature()`) in both contexts - write logic once, create two UIs that fit different user needs.

**Use UIKit components for automatic theme compatibility:**

- Import from `@voilajsx/uikit` instead of building custom components
- Use semantic colors: `bg-background`, `text-foreground`, `border-border`
- Avoid hardcoded colors like `bg-white` or `text-black`
- Components automatically adapt to all 6 themes and light/dark modes

This keeps your extension professional and consistent without extra work.

### Key Takeaways

**What you learned:**

- ✅ **Metadata drives everything** - Simple config creates full feature
- ✅ **Hooks organize logic** - Keep components clean and focused
- ✅ **Storage is automatic** - No complex state management needed
- ✅ **UI is consistent** - UIKit components work with all themes
- ✅ **Features are isolated** - Easy to enable/disable/modify

**Why this pattern is powerful:**

- **Scalable** → Add features without touching existing code
- **Maintainable** → Clear separation of concerns
- **Testable** → Business logic isolated in hooks
- **Consistent** → Same patterns across all features
- **Professional** → Loading states, error handling, themes

**Next:** See advanced patterns with Page Analyzer →

## 2.2. Example 2: Page Analyzer - Real-world patterns (messaging, APIs, complex UI)

### What Page Analyzer Does

**Page Analyzer is a real-world feature that demonstrates production patterns.** It analyzes web page size and validates HTML using external APIs. Unlike Hello World's simple storage, this feature shows cross-context messaging (popup talking to web page), external API calls, complex loading states, and advanced storage patterns like history management.

### Before We Dive In - Read the Code First

**Take 5 minutes to explore the Page Analyzer feature files:**

```
src/features/page-analyzer/
├── index.ts              # Feature metadata
├── hooks/
│   └── usePageAnalyzer.ts # Business logic
└── components/
    ├── PopupTab.tsx      # Popup UI
    └── OptionsPanel.tsx  # Options UI
```

**Focus on these similarities to Hello World:**

- Same file structure and naming patterns
- Same metadata format in `index.ts`
- Same hook pattern for business logic
- Same component structure with UIKit components
- Same popup vs options UI approach

**Notice these new patterns:**

- `requiresTab: true` in metadata (only works on supported pages)
- `handlers` section in metadata (functions that run on web pages)
- More complex hook with multiple loading states
- External API calls using `comet.get()`
- Cross-context messaging with `messaging.sendToContent()`

### New Concepts Introduced

#### 1. Cross-Context Messaging: Popup Talks to Web Page

**Understanding the two contexts:** Your hook runs in the popup (extension context) which is completely isolated from the web page for security. The content script runs directly on the web page and has access to its DOM, but these two contexts can't directly communicate. Messaging becomes the bridge between these two worlds.

**How it works step by step:**

```typescript
// This code runs in POPUP CONTEXT (your hook)
import { messaging } from '@voilajsx/comet/messaging';

const analyzePageSize = async () => {
  // Send message from popup to content script on the web page
  const response = await messaging.sendToContent({
    type: 'getPageSize', // Method name - must match handler exactly
    data: { includeImages: true }, // Arguments to send
  });

  // Handle response back from web page
  if (response.success) {
    console.log('Got page data:', response.data);
    setPageData(response.data); // Update popup UI
  } else {
    console.error('Page analysis failed:', response.error);
  }
};
```

**Then define what happens on the web page:**

```typescript
// This code runs in WEB PAGE CONTEXT (content script)
// In src/features/page-analyzer/index.ts
handlers: {
  getPageSize: (data) => {
    // Method name matches message type
    // This function runs ON THE ACTUAL WEB PAGE
    // So it can access document, window, DOM elements
    const html = document.documentElement.outerHTML;
    const images = data.includeImages ? document.images.length : 0;

    return {
      // Send response back to popup
      htmlBytes: new Blob([html]).size,
      formatted: formatBytes(new Blob([html]).size),
      images,
      url: window.location.href,
      timestamp: Date.now(),
    };
  };
}
```

**Critical points:** The method name `'getPageSize'` must match exactly between message type and handler name. Arguments sent in `data` become the handler's parameter. The handler's return value becomes `response.data` in the popup. Comet handles all the complex routing, error handling, and context switching automatically.

#### 2. External API Integration: CORS-Free Requests

**The CORS problem:** When you try to fetch data from external APIs directly from popup code, browsers block these requests due to Cross-Origin Resource Sharing (CORS) restrictions. This is a security feature, but it makes API integration difficult.

**Comet's solution:** All API requests go through the background script which has different permissions and can make requests to any external service without CORS restrictions. You just use the normal API patterns and Comet handles the proxy automatically.

**How to make external API calls:**

```typescript
// Import the API utility in your hook
import { comet } from '@voilajsx/comet/api';

const validateHTML = async () => {
  try {
    // This request goes through background script - no CORS issues
    const response = await comet.get(
      `https://validator.w3.org/nu/?doc=${encodeURIComponent(pageUrl)}&out=json`
    );

    if (response.ok) {
      const validationData = response.data; // Automatically parsed JSON
      const errors = validationData.messages.filter((m) => m.type === 'error');
      setValidationResult({
        isValid: errors.length === 0,
        errors: errors.length,
      });
    }
  } catch (error) {
    console.error('Validation failed:', error);
  }
};
```

**Common external API use cases:**

- **Data validation** (HTML, CSS, accessibility checkers)
- **Content enrichment** (weather, news, social media data)
- **Analysis services** (sentiment analysis, SEO scoring)
- **Utility services** (URL shortening, QR generation, currency conversion)

**Why this works:** Background script runs with elevated permissions, can bypass CORS entirely, automatically handles JSON parsing and error states, provides consistent interface regardless of external API differences.

#### 3. Complex State Management: Multiple Loading States

**Why simple loading isn't enough:** Real features often perform multiple operations simultaneously - analyzing page content while also validating HTML, saving settings while fetching data. Each operation needs its own loading indicator so users understand exactly what's happening.

**Managing independent loading states:**

```typescript
// Object-based loading tracks multiple operations
const [loading, setLoading] = useState({
  analyze: false,     // Page analysis operation
  validate: false,    // HTML validation operation
  save: false,        // Saving results operation
  history: false      // Loading historical data
});

// Update only the specific operation's loading state
const analyzePageSize = async () => {
  setLoading(prev => ({ ...prev, analyze: true }));    // Only analyze shows loading

  try {
    const result = await messaging.sendToContent({...});
    setPageData(result.data);

    // If auto-validate is enabled, start validation too
    if (settings.autoValidate) {
      setLoading(prev => ({ ...prev, validate: true }));
      await validateHTML();
      setLoading(prev => ({ ...prev, validate: false }));
    }
  } finally {
    setLoading(prev => ({ ...prev, analyze: false }));  // Turn off only analyze loading
  }
};

// Each button shows its specific loading state
<Button disabled={loading.analyze} onClick={analyzePageSize}>
  {loading.analyze ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Analyzing Page...
    </>
  ) : (
    'Analyze Page Size'
  )}
</Button>

<Button disabled={loading.validate} onClick={validateHTML}>
  {loading.validate ? 'Validating HTML...' : 'Validate HTML'}
</Button>
```

**Benefits:** Users see exactly which operations are running, can still interact with other features, provides professional UX that handles complex workflows gracefully.

#### 4. Advanced Storage Strategies: Your Extension's Mini Database

**Understanding storage as persistence:** Browser extension storage acts like a mini database that survives browser restarts, computer reboots, and extension updates. When users close and reopen your extension, data loads from this storage backup, creating seamless continuity.

**Different storage strategies for different data types:**

```typescript
// 1. User Preferences - Should persist forever
const updateSetting = async (key, value) => {
  await storage.set(`pageAnalyzer.${key}`, value); // Survives everything
  setSettings((prev) => ({ ...prev, [key]: value }));
};

// 2. Temporary Results - Managed with size limits
const saveToHistory = async (type, result) => {
  const currentHistory = await storage.get('pageAnalyzer.history', []);
  const newEntry = { type, data: result, timestamp: Date.now() };

  // Keep only last 5 entries to avoid storage bloat
  const updatedHistory = [newEntry, ...currentHistory.slice(0, 4)];
  await storage.set('pageAnalyzer.history', updatedHistory);
  setHistory(updatedHistory);
};

// 3. Session Data - Cleared periodically
const cachePageData = async (data) => {
  await storage.set('pageAnalyzer.lastAnalysis', {
    ...data,
    expiry: Date.now() + 24 * 60 * 60 * 1000, // Expires in 24 hours
  });
};

// 4. Leveraging defaults.ts for permanent initial values
const loadSettings = async () => {
  // These come from defaults.ts and reload on every extension restart
  const autoValidate = await storage.get('pageAnalyzer.autoValidate', false);
  const saveHistory = await storage.get('pageAnalyzer.saveHistory', false);
  setSettings({ autoValidate, saveHistory });
};
```

**Storage considerations and best practices:**

- **Size limits:** Browser storage has quotas - don't store large files or unlimited arrays
- **Data lifecycle:** User preferences vs temporary cache vs session data need different strategies
- **defaults.ts integration:** Use for initial settings that should reset on extension updates
- **Cleanup strategies:** Implement expiry times or size limits for temporary data
- **Error handling:** Storage can fail when quotas exceeded or in private browsing

**Real-world storage use cases:**

- **User settings:** Theme preferences, feature toggles, API keys
- **Recent activity:** Last 10 analyzed pages, recent search terms
- **Cache data:** Expensive API results, computed values
- **User content:** Saved bookmarks, custom notes, form drafts

**Why different strategies matter:** Respects storage quotas, provides appropriate data persistence, improves performance by avoiding repeated expensive operations, maintains user experience continuity across sessions.

## 2.3. Understanding the System - Deep dive into feature module patterns

### How Auto-Discovery Actually Works

**Auto-discovery is the magic that makes Comet feel effortless.** Understanding how it works helps you build better features and debug issues when they arise.

**The build process in 4 steps:**

**Step 1: Folder Scanning**
During `npm run build`, a Vite plugin scans your `src/features/` directory looking for folders that contain `index.ts` or `index.js` files. It ignores folders starting with underscore (`_disabled-feature`) and creates a list of active features.

**Step 2: Code Generation**
The build system automatically generates `src/features/index.ts` with exports for all discovered features:

```typescript
// AUTO-GENERATED - DO NOT EDIT
export { default as helloWorld } from './hello-world/index.js';
export { default as pageAnalyzer } from './page-analyzer/index.js';
// _quote-generator (disabled - remove underscore to enable)
```

**Step 3: Runtime Discovery**
When your extension loads, the discovery hook (`useModuleDiscovery`) imports all features from the generated index file, reads their metadata, and creates the UI structure. Features with `ui.popup` get popup tabs, features with `ui.options` get options panels.

**Step 4: Dynamic Loading**
Components load lazily when needed. Click a tab → import and mount the component. This keeps initial load fast and memory usage low.

**Why this works:** No manual registration means no forgotten imports, no central registry to maintain, and no build errors from missing dependencies. Just drop in folders and everything works.

### Feature Lifecycle: From Folder to Runtime

**Understanding the complete journey of a feature:**

**1. Development Time**

```
Create folder → Write index.ts → Add components → Build
```

**2. Build Time**

```
Scan folders → Validate metadata → Generate exports → Bundle code
```

**3. Extension Load**

```
Import features → Read metadata → Register handlers → Generate navigation
```

**4. User Interaction**

```
Click tab → Lazy load component → Mount → Hook loads data → Render UI
```

**5. Message Handling**

```
User action → Hook calls messaging → Background routes → Content script executes → Response returns
```

**Each phase has specific responsibilities:** Development focuses on metadata and logic, build ensures everything is wired correctly, load time creates the UI structure, and runtime handles user interactions. Understanding this flow helps you debug issues and optimize performance.

### Common Feature Architecture Patterns

**Pattern 1: Simple State Feature (Hello World style)**

```
index.ts          # Basic metadata, no handlers
hooks/useFeature  # Local state + storage
components/       # Simple UI with hook
```

**Best for:** Settings, toggles, user preferences, simple tools

**Pattern 2: Page Interaction Feature (Page Analyzer style)**

```
index.ts          # Metadata + content script handlers
hooks/useFeature  # Messaging + API calls + complex state
components/       # Results display, loading states
```

**Best for:** Page analysis, content modification, data extraction

**Pattern 3: External Service Feature**

```
index.ts          # Metadata only
hooks/useFeature  # Heavy API integration, caching
services/api.ts   # Dedicated API layer
components/       # Data-rich UI, error handling
```

**Best for:** Weather apps, social media tools, productivity integrations

**Pattern 4: Background Processing Feature**

```
index.ts          # Metadata + background handlers
hooks/useFeature  # Background communication + status
background/       # Heavy processing logic
components/       # Progress tracking, results
```

**Best for:** File processing, batch operations, scheduled tasks

### Metadata Configuration Patterns

**Essential metadata structure:**

```typescript
const config: ModuleConfig = {
  name: 'featureName', // REQUIRED: Unique camelCase identifier

  ui: {
    // OPTIONAL: UI components
    popup: {
      tab: {
        label: 'Display Name', // What users see
        icon: 'IconName', // From available icon set
        order: 1, // Tab position (lower = earlier)
        requiresTab: false, // false = works everywhere, true = needs page access
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Settings Name',
        icon: 'IconName',
        section: 'features', // Groups panels: 'features', 'advanced', 'system'
        order: 1,
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  settings: {
    // OPTIONAL: Storage schema
    settingName: {
      key: 'featureName.settingName',
      default: true,
      type: 'boolean',
      label: 'Display Name',
    },
  },

  handlers: {
    // OPTIONAL: Content script functions
    methodName: (data) => {
      return result;
    },
  },

  init: () => {}, // OPTIONAL: Initialization logic
};
```

**Configuration decision guide:**

- **No UI needed?** Just metadata with `handlers` or `init`
- **Quick actions?** Add `ui.popup` only
- **Complex settings?** Add both `ui.popup` and `ui.options`
- **Page interaction?** Set `requiresTab: true` and add `handlers`
- **Persistent settings?** Define `settings` schema

### Hook Architecture Best Practices

**Structure your hooks for maintainability:**

```typescript
export function useFeatureName() {
  // 1. State declarations (group by purpose)
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState({ action1: false, action2: false });
  const [settings, setSettings] = useState({});

  // 2. Data loading (useEffect)
  useEffect(() => {
    loadInitialData();
  }, []);

  // 3. Core business logic (useCallback for performance)
  const performAction = useCallback(async (params) => {
    setLoading((prev) => ({ ...prev, action1: true }));
    try {
      const result = await messaging.sendToContent({
        type: 'handler',
        data: params,
      });
      setData(result.data);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading((prev) => ({ ...prev, action1: false }));
    }
  }, []);

  // 4. Settings management
  const updateSetting = useCallback(async (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await storage.set(`featureName.${key}`, value);
  }, []);

  // 5. Return interface (group by purpose)
  return {
    // State
    data,
    settings,
    loading,
    // Actions
    performAction,
    updateSetting,
    // Utilities
    isReady: !loading.action1 && !loading.action2,
  };
}
```

**Why this structure:** Clear separation of concerns, predictable organization, easy to test individual functions, consistent return interface across features.

### Component Architecture Best Practices

**Popup component pattern:**

```typescript
export default function FeatureTab({ value, currentTab }) {
  const { data, loading, actions } = useFeatureName();

  // Early returns for edge cases
  if (loading.initial) return <LoadingState />;
  if (!messaging.isTabSupported(currentTab)) return <UnsupportedState />;

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle>Feature Name</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{/* Main UI */}</CardContent>
      </Card>
    </TabsContent>
  );
}
```

**Options component pattern:**

```typescript
export default function FeatureOptionsPanel() {
  const { settings, updateSetting, loading } = useFeatureName();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feature Settings</h1>
        <p className="text-muted-foreground">Configure feature behavior</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>{/* Settings UI */}</CardContent>
      </Card>
    </div>
  );
}
```

### Troubleshooting Common Issues

**Feature doesn't appear in popup/options:**

- Check folder name doesn't start with underscore
- Verify `index.ts` exists and exports default config
- Ensure `name` property is unique and camelCase
- Run `npm run build` to regenerate feature index
- Check browser console for import errors

**Content script handlers not working:**

- Verify handler name matches message type exactly
- Check `requiresTab: true` is set if page access needed
- Test on supported page (not chrome://, file://, etc.)
- Ensure content script is injected (refresh page)

**Storage not persisting:**

- Check storage keys follow `featureName.property` pattern
- Verify not storing in `defaults.ts` (gets reset on rebuild)
- Confirm storage quota not exceeded
- Test in normal browsing mode (not incognito)

**Messaging errors:**

- Ensure message `type` matches handler name
- Check current tab supports content scripts
- Verify handler returns serializable data (no functions, DOM elements)
- Handle async operations properly in handlers

**Build failures:**

- Check all imports use correct file extensions (.tsx, .ts)
- Verify component exports use `export default`
- Ensure no circular dependencies between features
- Check TypeScript types are correctly imported

### Performance Considerations

**Optimizing feature loading:**

- Use lazy imports for components (`() => import('./Component.tsx')`)
- Keep metadata lightweight (no heavy computations in `init`)
- Implement proper loading states for async operations
- Cache expensive API results appropriately

**Memory management:**

- Clean up event listeners in useEffect cleanup functions
- Avoid storing large objects in React state
- Use storage for persistent data, state for temporary UI data
- Implement data expiry for cached content

Understanding these patterns and practices helps you build robust, maintainable features that work reliably across different browsers and usage scenarios. The key is following Comet's conventions while adapting the patterns to your specific feature needs.

# 3. Building Your Own

Now that you understand how Comet works and have seen real examples, it's time to build your own features. This section guides you through the complete process - from planning your feature to testing the final result.

**You'll learn the systematic approach:** Plan what your feature does and where it fits, create the proper folder structure, write metadata that tells Comet what to build, implement business logic in hooks, create UI components that users interact with, and test everything works correctly. By following these patterns, you'll build professional features that integrate seamlessly with the Comet framework.

**The beauty of Comet's approach** is that once you understand the patterns, building new features becomes predictable and fast. Every feature follows the same structure, uses the same APIs, and integrates the same way. This consistency means you can focus on your feature's unique value instead of wrestling with framework complexity.

---

## 3.1. Feature Module System - Create custom features from scratch

### Planning Your Feature

**Before writing any code, answer these key questions:**

**What does your feature do?** Be specific about the core functionality. Examples: "Counts words on the current page", "Saves page screenshots to downloads", "Checks if page has accessibility issues".

**Where will users interact with it?** Quick daily actions belong in popup tabs. Configuration and detailed settings belong in options panels. Some features need both.

**Does it need page access?** Features that analyze content, modify DOM, or extract page data need `requiresTab: true` and content script handlers. Features that work with extension settings or external APIs don't.

**What external services does it use?** Plan your API integrations, understand rate limits, and design fallback strategies for when services are unavailable.

### Step-by-Step Feature Creation

**Let's build a "Word Counter" feature that counts words on web pages:**

#### Step 1: Create the Folder Structure

```bash
# Create the feature folder
mkdir src/features/word-counter

# Create subfolders
mkdir src/features/word-counter/components
mkdir src/features/word-counter/hooks
```

**Your structure should look like:**

```
src/features/word-counter/
├── components/
└── hooks/
```

#### Step 2: Write the Feature Metadata

**Create `src/features/word-counter/index.ts`:**

```typescript
/**
 * Word Counter Feature - Counts words and characters on web pages
 * @module @voilajsx/comet
 * @file src/features/word-counter/index.ts
 */

import type { ModuleConfig } from '@/featuretypes';

const config: ModuleConfig = {
  name: 'wordCounter',

  ui: {
    popup: {
      tab: {
        label: 'Words',
        icon: 'FileText',
        order: 2,
        requiresTab: true, // Needs page access
        description: 'Count words and characters on page',
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Word Counter',
        icon: 'FileText',
        section: 'features',
        order: 3,
        description: 'Configure word counting preferences',
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  settings: {
    includeHidden: {
      key: 'wordCounter.includeHidden',
      default: false,
      type: 'boolean',
      label: 'Include Hidden Text',
      description: 'Count words in hidden elements',
    },
    showCharacters: {
      key: 'wordCounter.showCharacters',
      default: true,
      type: 'boolean',
      label: 'Show Character Count',
      description: 'Display character count alongside word count',
    },
  },

  handlers: {
    countWords: (options) => {
      // This runs on the web page
      const textElements = options.includeHidden
        ? document.querySelectorAll('*')
        : document.querySelectorAll('*:not([hidden]):not(script):not(style)');

      let allText = '';
      textElements.forEach((element) => {
        if (element.children.length === 0) {
          allText += element.textContent + ' ';
        }
      });

      const words = allText
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      const characters = allText.replace(/\s/g, '').length;
      const charactersWithSpaces = allText.length;

      return {
        words: words.length,
        characters,
        charactersWithSpaces,
        averageWordsPerSentence: calculateAverageWords(allText),
        readingTime: Math.ceil(words.length / 200), // Assume 200 WPM
        url: window.location.href,
        title: document.title,
        timestamp: Date.now(),
      };
    },
  },

  meta: {
    name: 'Word Counter',
    description: 'Analyze text content on web pages',
    version: '1.0.0',
    author: 'Your Name',
  },

  init: () => console.log('[Word Counter] Feature loaded'),
};

// Helper function for content script
function calculateAverageWords(text) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return 0;

  const totalWords = text.trim().split(/\s+/).length;
  return Math.round(totalWords / sentences.length);
}

export default config;
```

**Key decisions explained:**

- **`requiresTab: true`** because we need to access page content
- **`handlers.countWords`** contains the logic that runs on the web page
- **`settings`** defines user preferences that persist across sessions
- **Helper function** included in same file since it's used by the handler

#### Step 3: Create the Business Logic Hook

**Create `src/features/word-counter/hooks/useWordCounter.ts`:**

```typescript
/**
 * Word Counter Hook - Manages counting logic and state
 * @module @voilajsx/comet
 * @file src/features/word-counter/hooks/useWordCounter.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@voilajsx/comet/storage';
import { messaging } from '@voilajsx/comet/messaging';

interface WordCountData {
  words: number;
  characters: number;
  charactersWithSpaces: number;
  averageWordsPerSentence: number;
  readingTime: number;
  url: string;
  title: string;
  timestamp: number;
}

interface WordCountSettings {
  includeHidden: boolean;
  showCharacters: boolean;
}

export function useWordCounter() {
  const [countData, setCountData] = useState<WordCountData | null>(null);
  const [settings, setSettings] = useState<WordCountSettings>({
    includeHidden: false,
    showCharacters: true,
  });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<WordCountData[]>([]);

  // Load settings and history on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const includeHidden = await storage.get(
        'wordCounter.includeHidden',
        false
      );
      const showCharacters = await storage.get(
        'wordCounter.showCharacters',
        true
      );
      const savedHistory = await storage.get('wordCounter.history', []);

      setSettings({ includeHidden, showCharacters });
      setHistory(savedHistory);
    } catch (error) {
      console.error('[Word Counter] Failed to load data:', error);
    }
  };

  // Count words on current page
  const countWords = useCallback(async () => {
    setLoading(true);

    try {
      const response = await messaging.sendToContent({
        type: 'countWords',
        data: {
          includeHidden: settings.includeHidden,
        },
      });

      if (response.success) {
        const data = response.data;
        setCountData(data);

        // Save to history (keep last 10 entries)
        const newHistory = [data, ...history.slice(0, 9)];
        setHistory(newHistory);
        await storage.set('wordCounter.history', newHistory);

        return { success: true, data };
      } else {
        throw new Error(response.error || 'Word counting failed');
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [settings.includeHidden, history]);

  // Update a setting
  const updateSetting = useCallback(
    async (key: keyof WordCountSettings, value: boolean) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      await storage.set(`wordCounter.${key}`, value);
    },
    []
  );

  // Clear history
  const clearHistory = useCallback(async () => {
    setHistory([]);
    await storage.remove('wordCounter.history');
  }, []);

  // Calculate reading level (simple implementation)
  const getReadingLevel = useCallback((data: WordCountData) => {
    if (!data || data.averageWordsPerSentence === 0) return 'Unknown';

    if (data.averageWordsPerSentence <= 8) return 'Easy';
    if (data.averageWordsPerSentence <= 12) return 'Medium';
    return 'Complex';
  }, []);

  return {
    // State
    countData,
    settings,
    loading,
    history,

    // Actions
    countWords,
    updateSetting,
    clearHistory,

    // Utilities
    getReadingLevel,
    hasHistory: history.length > 0,
    canCount: !loading,
  };
}
```

**Hook organization explained:**

- **Interface definitions** at the top for type safety
- **State management** grouped by purpose
- **Data loading** in useEffect
- **Core business logic** in useCallback for performance
- **Settings management** with automatic storage
- **Utility functions** for computed values
- **Clean return interface** grouped by purpose

#### Step 4: Create the Popup Component

**Create `src/features/word-counter/components/PopupTab.tsx`:**

```typescript
/**
 * Word Counter Popup Tab - Quick word counting interface
 * @module @voilajsx/comet
 * @file src/features/word-counter/components/PopupTab.tsx
 */

import React, { useState } from 'react';
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Separator } from '@voilajsx/uikit/separator';
import {
  FileText,
  Calculator,
  Clock,
  BarChart3,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { messaging } from '@voilajsx/comet/messaging';
import { useWordCounter } from '../hooks/useWordCounter';

export default function WordCounterTab({ value, currentTab }) {
  const {
    countData,
    settings,
    loading,
    countWords,
    getReadingLevel,
    canCount,
  } = useWordCounter();

  const [feedback, setFeedback] = useState(null);
  const isTabSupported = messaging.isTabSupported(currentTab);

  const handleCount = async () => {
    if (!isTabSupported) {
      setFeedback({
        type: 'error',
        message: 'Not available on this page type',
      });
      return;
    }

    const result = await countWords();

    if (result.success) {
      setFeedback({ type: 'success', message: 'Word count complete!' });
    } else {
      setFeedback({ type: 'error', message: result.error });
    }

    // Auto-dismiss feedback
    setTimeout(() => setFeedback(null), 3000);
  };

  const formatNumber = (num) => num.toLocaleString();

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Word Counter
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Count Button */}
          <Button
            onClick={handleCount}
            disabled={!canCount || !isTabSupported}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Counting Words...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Count Words on Page
              </>
            )}
          </Button>

          {/* Feedback */}
          {feedback && (
            <Alert
              variant={feedback.type === 'success' ? 'default' : 'destructive'}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {countData && (
            <div className="space-y-3">
              <Separator />

              {/* Primary Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded">
                  <div className="text-xl font-bold text-primary">
                    {formatNumber(countData.words)}
                  </div>
                  <div className="text-xs text-muted-foreground">Words</div>
                </div>

                {settings.showCharacters && (
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-xl font-bold text-primary">
                      {formatNumber(countData.characters)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Characters
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Reading Time
                  </span>
                  <Badge variant="outline">{countData.readingTime} min</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Reading Level
                  </span>
                  <Badge variant="secondary">
                    {getReadingLevel(countData)}
                  </Badge>
                </div>
              </div>

              {/* Page Info */}
              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                <div className="font-medium truncate">{countData.title}</div>
                <div className="truncate">
                  {new URL(countData.url).hostname}
                </div>
              </div>
            </div>
          )}

          {/* Not Supported */}
          {!isTabSupported && (
            <div className="text-center py-4 text-muted-foreground">
              <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <div className="text-sm">Not available on this page type</div>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
```

#### Step 5: Create the Options Component

**Create `src/features/word-counter/components/OptionsPanel.tsx`:**

```typescript
/**
 * Word Counter Options Panel - Configuration and history
 * @module @voilajsx/comet
 * @file src/features/word-counter/components/OptionsPanel.tsx
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
  History,
  Trash2,
  FileText,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useWordCounter } from '../hooks/useWordCounter';

export default function WordCounterOptionsPanel() {
  const {
    settings,
    history,
    updateSetting,
    clearHistory,
    getReadingLevel,
    hasHistory,
  } = useWordCounter();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Word Counter Settings</h1>
        <p className="text-muted-foreground">
          Configure word counting preferences and view analysis history
        </p>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Counting Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-hidden">Include Hidden Text</Label>
              <p className="text-xs text-muted-foreground">
                Count words in hidden elements and scripts
              </p>
            </div>
            <Switch
              id="include-hidden"
              checked={settings.includeHidden}
              onCheckedChange={(checked) =>
                updateSetting('includeHidden', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-characters">Show Character Count</Label>
              <p className="text-xs text-muted-foreground">
                Display character count alongside word count
              </p>
            </div>
            <Switch
              id="show-characters"
              checked={settings.showCharacters}
              onCheckedChange={(checked) =>
                updateSetting('showCharacters', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Analysis History
            <Badge variant="secondary">{history.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasHistory ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Recent Analyses</Label>
                <Button onClick={clearHistory} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </div>

              <div className="space-y-3">
                {history.slice(0, 10).map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {entry.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {new URL(entry.url).hostname}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">
                          {entry.words.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          words
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{entry.readingTime}m</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(entry.timestamp)}
                        </div>
                      </div>

                      <Badge variant="outline" className="text-xs">
                        {getReadingLevel(entry)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                No analysis history yet
              </div>
              <div className="text-xs text-muted-foreground">
                Count words on pages to see history here
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Step 6: Test Your Feature

**Build and test the feature:**

```bash
# Build the extension
npm run build

# Reload extension in browser
# Go to a webpage and test the Word Counter tab
```

**Testing checklist:**

- ✅ Feature appears in popup tabs
- ✅ Feature appears in options panels
- ✅ Word counting works on web pages
- ✅ Settings persist across browser sessions
- ✅ History saves and displays correctly
- ✅ Error handling works on unsupported pages
- ✅ Loading states show during operations

### Common Feature Patterns

**Simple utility features** (no page access needed):

```typescript
// Metadata: no handlers, no requiresTab
// Hook: storage + external APIs only
// UI: forms, displays, settings
```

**Page analysis features** (needs page access):

```typescript
// Metadata: handlers + requiresTab: true
// Hook: messaging + storage + complex state
// UI: results display + loading states
```

**Background processing features** (periodic tasks):

```typescript
// Metadata: background handlers + settings
// Hook: background communication + status
// UI: progress tracking + configuration
```

**Integration features** (external services):

```typescript
// Metadata: API configuration in settings
// Hook: heavy API integration + caching
// UI: authentication + data display
```

### Next Steps

You now have a complete, working feature that demonstrates all core Comet patterns. Next, you'll learn how to configure your extension's branding, themes, and global settings using the powerful `defaults.ts` system with live reloads.

## 3.2. Configuration Management - defaults.ts & live reloads (logo, icon, theme changes)

### Understanding Configuration in Comet

**Configuration in Comet is designed for maximum developer productivity.** Instead of hunting through multiple files to change branding or settings, everything is centralized in `src/defaults.ts`. The key insight is that this file reloads automatically every time you rebuild the extension, making configuration changes instant and predictable.

**Two types of configuration data:**

- **Global app configuration** → Goes in `defaults.ts` (resets on rebuild)
- **User data and feature state** → Managed by features in hooks (persists across rebuilds)

### The Power of defaults.ts

**Every value in `defaults.ts` reloads when you run `npm run build`.** This means you can change your extension's branding, theme, layout, or global settings instantly without losing development momentum.

**Current defaults.ts structure:**

```typescript
/**
 * Comet Framework - Default Configuration
 * ⚠️ WARNING: All values here are reloaded on every extension restart!
 * @file src/defaults.ts
 */

const defaults = {
  // Debug Configuration
  'debug-enabled': false, // Toggle all debug logs

  // App Branding
  'app-name': 'Comet One',
  'app-version': '1.0.0',
  'app-description':
    'Minimal but powerful Chrome extension framework built with React and UIKit',
  'app-author': 'Your Name',
  'app-website': 'https://github.com/your-username/your-extension',
  'app-icon': 'Zap',
  'app-theme': '',
  'app-variant': 'light',

  // Layout Configuration
  'options-variant': 'primary',
  'options-size': 'full',

  // Footer Configuration
  'footer-content': 'Made with ❤️ using Comet Framework',

  // Extension State
  extensionEnabled: true,
} as const;

export default defaults;
```

### Instant Branding Changes

**Change your extension's identity in seconds:**

```typescript
// Update these values and rebuild
const defaults = {
  'app-name': 'Word Master Pro', // Extension name everywhere
  'app-icon': 'FileText', // Logo icon (see available icons)
  'app-theme': 'ruby', // Color scheme (6 available)
  'app-variant': 'dark', // Light or dark mode
  'app-author': 'Your Company', // Shown in options
  'app-website': 'https://wordmaster.com', // External link
  'footer-content': 'Made by WordMaster Team', // Footer text
  // ... other settings
};
```

**Run `npm run build` and see changes instantly:**

- ✅ Extension logo updates throughout UI
- ✅ Theme colors change everywhere
- ✅ Name appears in popup headers and options
- ✅ Footer updates across all pages
- ✅ About section shows new author/website

### Available Configuration Options

#### App Branding

```typescript
'app-name': 'My Extension',           // Shows in popup headers, options titles
'app-icon': 'Star',                   // Logo icon throughout extension
'app-theme': 'neon',                  // Color theme (6 available)
'app-variant': 'dark',                // Light/dark mode preference
'app-author': 'Developer Name',       // Credits in options page
'app-website': 'https://mysite.com',  // External link in options
'app-description': 'What it does',    // Shown in options header
```

**Available themes:** `'default'` (ocean blue), `'aurora'` (purple-green), `'metro'` (gray-blue), `'neon'` (cyberpunk), `'ruby'` (red-gold), `'studio'` (designer gray)

**Available icons:** `'Zap'`, `'Star'`, `'Heart'`, `'Shield'`, `'Rocket'`, `'Globe'`, `'Settings'`, `'FileText'`, `'Quote'`, `'Home'`

#### Layout Configuration

```typescript
// Options page layout
'options-variant': 'primary',         // Header style: 'default' | 'primary' | 'black'
'options-size': 'full',               // Page width: 'sm' | 'md' | 'lg' | 'xl' | 'full'

// Popup layout
'popup-variant': 'default',           // Popup style: 'default' | 'compact' | 'mini'
'popup-size': 'lg',                   // Popup size: 'sm' | 'md' | 'lg' | 'auto'
```

**Layout variants explained:**

- **Options variants:** `'primary'` creates colored header, `'black'` creates dark header, `'default'` uses standard styling
- **Popup variants:** `'compact'` reduces padding, `'mini'` minimizes spacing for tight layouts
- **Sizes:** Control overall dimensions and spacing throughout UI

#### Content Configuration

```typescript
'footer-content': 'Custom footer text',  // Appears on all pages
'debug-enabled': true,                   // Shows detailed console logs
extensionEnabled: true,                  // Master extension toggle
```

### Live Reload Workflow

**The development workflow is designed for instant feedback:**

```bash
# 1. Make changes to defaults.ts
# Edit app name, theme, icons, layout

# 2. Rebuild extension
npm run build

# 3. Refresh extension popup/options
# All changes apply immediately

# 4. Iterate quickly
# No cache clearing, no manual resets needed
```

**Example rapid iteration session:**

```typescript
// Try different themes quickly
'app-theme': 'metro',      // Build → Clean professional look
'app-theme': 'neon',       // Build → Cyberpunk styling
'app-theme': 'ruby',       // Build → Elegant red/gold
'app-theme': 'aurora',     // Build → Creative purple/green
```

**Each rebuild takes ~2-3 seconds and changes apply instantly.**

### What NOT to Put in defaults.ts

**❌ User data that should persist:**

```typescript
// These will be lost on every rebuild
userClickCount: 0,           // Use feature storage instead
lastAnalyzedPage: 'url',     // Use feature storage instead
userPreferences: {...},      // Use feature storage instead
```

**✅ Put user data in feature storage:**

```typescript
// In your feature hook
await storage.set('featureName.userClickCount', count);
await storage.set('featureName.userPreferences', prefs);
```

**❌ API keys and secrets:**

```typescript
// Never put secrets in defaults.ts
apiKey: 'secret-key',        // Use environment variables
userToken: 'token',          // Let users enter in options
```

**✅ Configuration references:**

```typescript
// Reference where to get the real values
'api-endpoint': 'https://api.example.com',    // OK - public endpoint
'docs-url': 'https://docs.myapp.com',         // OK - public link
```

### Integration with Features

**Features automatically inherit global configuration:**

```typescript
// In any feature hook
import { storage } from '@voilajsx/comet/storage';

const useMyFeature = () => {
  const [appName, setAppName] = useState('');

  useEffect(() => {
    // Gets value from defaults.ts automatically
    const loadAppName = async () => {
      const name = await storage.get('app-name', 'Default Name');
      setAppName(name);
    };
    loadAppName();
  }, []);

  // appName will always reflect current defaults.ts value
};
```

**Features can override global settings locally:**

```typescript
// Feature-specific branding
const useMyFeature = () => {
  const getFeatureName = () => {
    // Override global app name for this feature
    return 'Special Feature Mode';
  };
};
```

### Best Practices

**Use defaults.ts for:**

- ✅ App branding and identity
- ✅ Theme and layout preferences
- ✅ Default feature settings (not user data)
- ✅ Development/production differences
- ✅ Global UI configuration

**Use feature storage for:**

- ✅ User preferences and choices
- ✅ Feature state and history
- ✅ Temporary data and caches
- ✅ User-generated content
- ✅ Settings that users modify

**Development tips:**

- Keep defaults.ts changes in version control
- Use comments to document why specific values were chosen
- Test configuration changes across all themes and variants
- Consider how settings work together (theme + variant + layout)

The configuration system gives you complete control over your extension's appearance and behavior while maintaining the simplicity that makes Comet productive to use. Next, you'll learn about UI guidelines to ensure your custom components integrate seamlessly with the framework.

## 3.3. UI Guidelines - Use UIKit components (shadcn/ui), semantic colors, existing wrappers

### The UIKit Philosophy

**Comet uses `@voilajsx/uikit` built on shadcn/ui and Tailwind CSS 4 to ensure professional, consistent design across all features.** The core principle is simple: use existing components and semantic colors instead of building custom UI. This approach guarantees theme compatibility, reduces development time, and maintains visual consistency across your entire extension.

**Why this matters:** When users switch themes or toggle dark mode, every component automatically adapts. When you follow the semantic color system, your features look professional in all 6 themes without any extra work. When you use UIKit components, you get accessibility, proper styling, and consistent behavior for free.

### Always Use Semantic Colors

**Semantic colors are the foundation of theme compatibility.** Instead of hardcoded colors like `bg-white` or `text-black`, use semantic classes that automatically adapt to the current theme and variant.

#### Essential Semantic Color Classes

```tsx
// ✅ Background colors (theme-aware)
className = 'bg-background'; // Main page background
className = 'bg-card'; // Card surfaces and panels
className = 'bg-muted'; // Subtle background areas
className = 'bg-primary'; // Action buttons and highlights
className = 'bg-secondary'; // Secondary buttons
className = 'bg-destructive'; // Error states and danger actions

// ✅ Text colors (theme-aware)
className = 'text-foreground'; // Primary text color
className = 'text-muted-foreground'; // Secondary/subtle text
className = 'text-card-foreground'; // Text on card backgrounds
className = 'text-primary'; // Primary action text
className = 'text-destructive'; // Error messages

// ✅ Border colors (theme-aware)
className = 'border-border'; // Standard borders everywhere
className = 'border-input'; // Input field borders
className = 'border-destructive'; // Error state borders
```

#### Color Usage Examples

```tsx
// ✅ Correct: Theme-aware card
<Card className="bg-card text-card-foreground border-border">
  <CardHeader className="border-b border-border">
    <CardTitle className="text-foreground">Title</CardTitle>
    <p className="text-muted-foreground">Subtitle</p>
  </CardHeader>
  <CardContent className="text-foreground">
    Content adapts to all themes automatically
  </CardContent>
</Card>

// ❌ Wrong: Hardcoded colors break themes
<div className="bg-white text-black border-gray-200">
  <h2 className="text-gray-900">Title</h2>
  <p className="text-gray-600">This breaks in dark mode</p>
</div>
```

#### Opacity and State Modifiers

```tsx
// ✅ Use opacity modifiers with semantic colors
className = 'bg-primary/10'; // 10% opacity primary background
className = 'text-muted-foreground/60'; // 60% opacity muted text
className = 'border-border/50'; // 50% opacity border

// ✅ Hover and focus states
className = 'hover:bg-muted/80'; // Subtle hover background
className = 'hover:text-foreground'; // Text brightens on hover
className = 'focus:ring-ring focus:ring-2'; // Focus rings
```

### Always Use UIKit Components

**Import from `@voilajsx/uikit` instead of building custom components.** Every UIKit component is pre-built to work with the theme system and includes proper accessibility, animations, and styling.

#### Essential Component Imports

```tsx
// Form and input components
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Label } from '@voilajsx/uikit/label';
import { Switch } from '@voilajsx/uikit/switch';
import { Checkbox } from '@voilajsx/uikit/checkbox';
import { Textarea } from '@voilajsx/uikit/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voilajsx/uikit/select';

// Layout and display components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@voilajsx/uikit/card';
import { Badge } from '@voilajsx/uikit/badge';
import { Separator } from '@voilajsx/uikit/separator';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@voilajsx/uikit/tabs';

// Navigation and interaction components
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@voilajsx/uikit/dropdown-menu';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@voilajsx/uikit/dialog';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@voilajsx/uikit/tooltip';
```

#### Component Usage Patterns

**Buttons with consistent variants:**

```tsx
// ✅ Use button variants (automatically theme-aware)
<Button variant="default">Primary Action</Button>      // bg-primary
<Button variant="secondary">Secondary Action</Button>  // bg-secondary
<Button variant="outline">Outline Action</Button>      // border-input
<Button variant="ghost">Subtle Action</Button>         // transparent
<Button variant="destructive">Delete</Button>          // bg-destructive

// ✅ Loading states with proper icons
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Processing...
    </>
  ) : (
    'Start Process'
  )}
</Button>
```

**Cards for consistent layout:**

```tsx
// ✅ Standard card pattern works everywhere
<Card className="bg-card text-card-foreground border-border">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="w-5 h-5" />
      Feature Name
    </CardTitle>
    <CardDescription>Brief description of what this does</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Card content with proper spacing */}
  </CardContent>
</Card>
```

**Forms with proper labeling:**

```tsx
// ✅ Accessible form pattern
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="setting-name">Setting Name</Label>
    <Input
      id="setting-name"
      placeholder="Enter value"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
    <p className="text-xs text-muted-foreground">
      Helpful description of what this setting does
    </p>
  </div>

  <div className="flex items-center justify-between">
    <Label htmlFor="toggle-setting">Enable Feature</Label>
    <Switch
      id="toggle-setting"
      checked={enabled}
      onCheckedChange={setEnabled}
    />
  </div>
</div>
```

### Layout Wrapper Integration

**Use existing layout wrappers instead of creating custom page structures.** Comet provides smart wrappers that handle auto-discovery, navigation, and theming automatically.

#### PopupWrapper Usage

```tsx
// ✅ Use PopupWrapper for popup pages
import PopupWrapper from '@/shared/layouts/PopupWrapper';

export default function PopupPage() {
  return (
    <ThemeProvider theme="metro" variant="light" detectSystem={false}>
      <PopupWrapper
        extensionName="Custom Name" // Override app name for popup
        extensionIcon="Star" // Override app icon
        size="lg" // Popup size
        variant="default" // Popup styling variant
      />
    </ThemeProvider>
  );
}
```

#### OptionsWrapper Usage

```tsx
// ✅ Use OptionsWrapper for options pages
import OptionsWrapper from '@/shared/layouts/OptionsWrapper';

export default function OptionsPage() {
  return (
    <ThemeProvider theme="metro" variant="light" detectSystem={false}>
      <OptionsWrapper
        showResetButton={true} // Show reset all button
        forceVariant="primary" // Override variant
        customFooter={<CustomFooter />} // Custom footer content
      />
    </ThemeProvider>
  );
}
```

### Theme-Aware Component Examples

#### Status Indicators

```tsx
// ✅ Status badges that work with all themes
<Badge variant="default">Active</Badge>          // Uses bg-primary
<Badge variant="secondary">Pending</Badge>       // Uses bg-secondary
<Badge variant="destructive">Error</Badge>       // Uses bg-destructive
<Badge variant="outline">Neutral</Badge>         // Uses border-border

// ✅ Status alerts with proper variants
<Alert variant="default">
  <CheckCircle className="h-4 w-4" />
  <AlertDescription>Success message</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Error message</AlertDescription>
</Alert>
```

#### Data Display

```tsx
// ✅ Consistent data presentation
<div className="grid grid-cols-2 gap-4">
  <div className="text-center p-4 bg-muted/50 rounded">
    <div className="text-2xl font-bold text-primary">1,234</div>
    <div className="text-sm text-muted-foreground">Total Items</div>
  </div>

  <div className="text-center p-4 bg-muted/50 rounded">
    <div className="text-2xl font-bold text-primary">56</div>
    <div className="text-sm text-muted-foreground">Active Items</div>
  </div>
</div>

// ✅ List items with consistent styling
<div className="space-y-2">
  {items.map((item, index) => (
    <div key={index} className="flex items-center justify-between p-3 border border-border rounded">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <div>
          <div className="font-medium text-foreground">{item.name}</div>
          <div className="text-sm text-muted-foreground">{item.description}</div>
        </div>
      </div>
      <Badge variant="outline">{item.status}</Badge>
    </div>
  ))}
</div>
```

### Loading and Empty States

```tsx
// ✅ Consistent loading states
if (loading) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <div className="text-sm text-muted-foreground">Loading...</div>
      </CardContent>
    </Card>
  );
}

// ✅ Consistent empty states
if (items.length === 0) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">No items found</div>
        <div className="text-xs text-muted-foreground mt-1">
          Add items to see them here
        </div>
      </CardContent>
    </Card>
  );
}
```

### Common Anti-Patterns to Avoid

#### ❌ Hardcoded Colors

```tsx
// Breaks theme switching
<div className="bg-white text-black border-gray-200">
<span className="text-blue-500">Link</span>
style={{ backgroundColor: '#ffffff' }}
```

#### ❌ Custom Components Instead of UIKit

```tsx
// Don't reinvent existing components
<div className="custom-button">Click me</div>           // Use <Button>
<div className="custom-card">Content</div>              // Use <Card>
<input className="custom-input" />                      // Use <Input>
```

#### ❌ Inconsistent Spacing

```tsx
// Use space-y-* classes consistently
<div>
  <div className="mb-2">Item 1</div>
  <div className="mb-4">Item 2</div>     // Inconsistent spacing
  <div className="mb-1">Item 3</div>
</div>

// ✅ Consistent spacing
<div className="space-y-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### ❌ Poor Typography Hierarchy

```tsx
// Inconsistent text sizing
<h1 className="text-xl">Title</h1>
<h2 className="text-lg">Subtitle</h2>
<p className="text-base">Content</p>

// ✅ Consistent hierarchy
<h1 className="text-2xl font-bold">Title</h1>
<p className="text-muted-foreground">Subtitle</p>
<div className="text-foreground">Content</div>
```

### Testing Across Themes

**Always test your components across different themes and variants:**

```tsx
// Test in your components
const TestThemeComponent = () => {
  const { theme, variant, setTheme, setVariant } = useTheme();

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        {['default', 'aurora', 'metro', 'neon', 'ruby', 'studio'].map((t) => (
          <Button
            key={t}
            variant={theme === t ? 'default' : 'outline'}
            onClick={() => setTheme(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => setVariant(variant === 'light' ? 'dark' : 'light')}
      >
        Toggle {variant === 'light' ? 'Dark' : 'Light'}
      </Button>

      {/* Your component to test */}
      <YourComponent />
    </div>
  );
};
```

### Quick Reference Checklist

**Before submitting any feature:**

- ✅ Only semantic color classes used (`bg-background`, `text-foreground`, etc.)
- ✅ All components imported from `@voilajsx/uikit`
- ✅ Consistent spacing using `space-y-*` and `gap-*`
- ✅ Proper loading states with `Loader2` and `animate-spin`
- ✅ Accessibility with proper labels and ids
- ✅ Tested in light and dark variants
- ✅ Tested across at least 3 different themes
- ✅ No hardcoded colors or custom component styling
- ✅ Consistent typography hierarchy
- ✅ Proper error states and empty states

Following these guidelines ensures your features integrate seamlessly with Comet's design system, automatically work with all themes, and provide a professional user experience that matches the framework's quality standards.

# 4. Platform Integration

**Master Comet's core platform APIs that handle the complex parts of extension development.** This section covers the three essential APIs - storage for persistent data, messaging for cross-context communication, and external API integration - plus cross-browser compatibility and lifecycle management.

**Platform APIs abstract away browser differences** and provide consistent, reliable interfaces for data persistence, component communication, and external service integration. **Cross-browser support** ensures your extension works identically across Chrome, Firefox, Edge, and Opera without code changes. **Lifecycle management** handles installation, updates, and data migration automatically.

**Understanding these platform fundamentals** enables you to build robust, professional extensions that work reliably across different browsers and usage scenarios while focusing on feature development rather than infrastructure concerns.

## 4.1. Platform APIs - Complete storage, messaging, CORS-free API reference

### Platform API Overview

**Comet provides three essential platform APIs that handle the complex parts of extension development:** `storage` for persistent data management, `messaging` for cross-context communication, and `comet` for external API integration. These APIs abstract away browser differences, handle errors gracefully, and provide consistent interfaces across Chrome, Firefox, Edge, and Opera.

**Why platform APIs matter:** Extension development involves multiple isolated contexts (popup, options, content scripts, background) that need to share data and communicate. External API calls face CORS restrictions. Browser storage has quotas and sync complexities. Comet's platform APIs solve these challenges with simple, reliable interfaces.

---

### Storage API - Your Extension's Database

**The storage API acts as a persistent database for your extension.** Data survives browser restarts, extension updates, and syncs across devices. It automatically integrates with `defaults.ts` and provides fallback values for missing keys.

#### Core Storage Operations

```typescript
import { storage } from '@voilajsx/comet/storage';

// Get single value with fallback
const userName = await storage.get('user.name', 'Anonymous');

// Get multiple values
const settings = await storage.get(['feature.enabled', 'feature.mode'], {});
// Returns: { 'feature.enabled': true, 'feature.mode': 'auto' }

// Get all stored data
const allData = await storage.get(null);

// Set single value
await storage.set('user.name', 'John Doe');

// Set multiple values (recommended for performance)
await storage.set({
  'user.name': 'John Doe',
  'user.preferences': { theme: 'dark', notifications: true },
  'feature.lastUsed': Date.now(),
});

// Check if key exists
const hasName = await storage.has('user.name');

// Remove single key
await storage.remove('temporary.data');

// Remove multiple keys
await storage.remove(['cache.page1', 'cache.page2', 'temp.session']);

// Clear all extension data
await storage.clear();
```

#### Integration with defaults.ts

**Storage automatically falls back to values in `defaults.ts`:**

```typescript
// In defaults.ts
const defaults = {
  'feature.autoSave': true,
  'feature.interval': 300,
  'user.theme': 'light',
};

// In your hook
const useFeature = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const loadSettings = async () => {
      // These automatically use defaults.ts values if not found
      const autoSave = await storage.get('feature.autoSave'); // Gets true
      const interval = await storage.get('feature.interval'); // Gets 300
      const theme = await storage.get('user.theme'); // Gets 'light'

      setSettings({ autoSave, interval, theme });
    };
    loadSettings();
  }, []);
};
```

#### Storage Change Listeners

**React to storage changes across different extension contexts:**

```typescript
// Listen for storage changes
const useStorageListener = () => {
  useEffect(() => {
    const unsubscribe = storage.onChange((changes, namespace) => {
      console.log('Storage changes:', changes);

      // Handle specific key changes
      if (changes['user.theme']) {
        const { oldValue, newValue } = changes['user.theme'];
        console.log(`Theme changed from ${oldValue} to ${newValue}`);
        updateTheme(newValue);
      }

      if (changes['feature.enabled']) {
        const isEnabled = changes['feature.enabled'].newValue;
        toggleFeature(isEnabled);
      }
    });

    // Cleanup on unmount
    return unsubscribe;
  }, []);
};
```

#### Storage Patterns and Best Practices

**Namespace your keys to avoid conflicts:**

```typescript
// ✅ Good: Namespaced keys
'featureName.setting1': value,
'featureName.userPreference': value,
'featureName.cache.lastResult': value,

// ❌ Bad: Generic keys that might conflict
'enabled': value,
'data': value,
'settings': value,
```

**Use appropriate data types:**

```typescript
// ✅ Storage handles JSON serialization automatically
await storage.set('feature.config', {
  enabled: true,
  options: ['a', 'b', 'c'],
  metadata: { version: 1, created: Date.now() },
});

// ✅ Primitives work directly
await storage.set('feature.count', 42);
await storage.set('feature.enabled', true);
await storage.set('feature.name', 'My Feature');

// ❌ Don't store functions or complex objects
await storage.set('feature.callback', () => {}); // Will fail
await storage.set('feature.domElement', document.body); // Will fail
```

**Batch operations for performance:**

```typescript
// ✅ Efficient: Single storage operation
await storage.set({
  'user.profile': userProfile,
  'user.preferences': preferences,
  'user.lastLogin': Date.now(),
});

// ❌ Inefficient: Multiple storage operations
await storage.set('user.profile', userProfile);
await storage.set('user.preferences', preferences);
await storage.set('user.lastLogin', Date.now());
```

#### Storage Quotas and Management

**Browser storage has limits - design accordingly:**

```typescript
// Check storage usage (Chrome only)
const getStorageInfo = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage.sync.getBytesInUse) {
    const bytesUsed = await chrome.storage.sync.getBytesInUse();
    const quota = chrome.storage.sync.QUOTA_BYTES; // 102,400 bytes
    const percentUsed = (bytesUsed / quota) * 100;

    console.log(
      `Storage: ${bytesUsed}/${quota} bytes (${percentUsed.toFixed(1)}%)`
    );

    if (percentUsed > 80) {
      console.warn('Storage quota nearly exceeded');
    }
  }
};

// Implement data cleanup strategies
const cleanupOldData = async () => {
  const history = await storage.get('feature.history', []);

  // Keep only last 50 items
  if (history.length > 50) {
    const trimmedHistory = history.slice(0, 50);
    await storage.set('feature.history', trimmedHistory);
  }

  // Remove expired cache entries
  const cache = await storage.get('feature.cache', {});
  const now = Date.now();
  const validCache = {};

  Object.entries(cache).forEach(([key, entry]) => {
    if (entry.expiry > now) {
      validCache[key] = entry;
    }
  });

  await storage.set('feature.cache', validCache);
};
```

---

### Messaging API - Cross-Context Communication

**The messaging API enables communication between isolated extension contexts.** Popup code can't directly access web page content, but it can send messages to content scripts that run on the page. Similarly, different parts of your extension can coordinate through messaging.

#### Basic Messaging Patterns

```typescript
import { messaging } from '@voilajsx/comet/messaging';

// Send message from popup to content script
const analyzeCurrentPage = async () => {
  try {
    const response = await messaging.sendToContent({
      type: 'analyzePageContent', // Handler name in feature metadata
      data: {
        includeHidden: true,
        maxDepth: 3,
      },
    });

    if (response.success) {
      console.log('Analysis result:', response.data);
      return response.data;
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Page analysis failed:', error);
    return null;
  }
};

// Send message to background script
const saveToCloud = async (data) => {
  const response = await messaging.sendToBackground({
    type: 'cloudSync',
    data: { syncData: data, timestamp: Date.now() },
  });

  return response.success;
};

// Send message to specific tab
const notifyTab = async (tabId, message) => {
  const response = await messaging.sendToTab(tabId, {
    type: 'notification',
    data: { message, type: 'info' },
  });

  return response.success;
};
```

#### Content Script Handlers

**Define handlers in feature metadata that run on web pages:**

```typescript
// In src/features/my-feature/index.ts
const config = {
  name: 'myFeature',

  handlers: {
    // This function runs in content script context (on the web page)
    analyzePageContent: (data) => {
      const { includeHidden, maxDepth } = data;

      // Can access DOM because this runs on the actual page
      const title = document.title;
      const url = window.location.href;
      const links = Array.from(document.links).map((link) => link.href);

      // Get visible text
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!includeHidden && parent) {
              const style = window.getComputedStyle(parent);
              if (style.display === 'none' || style.visibility === 'hidden') {
                return NodeFilter.FILTER_REJECT;
              }
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      let textContent = '';
      let node;
      while ((node = walker.nextNode())) {
        textContent += node.textContent + ' ';
      }

      return {
        title,
        url,
        wordCount: textContent.trim().split(/\s+/).length,
        linkCount: links.length,
        textContent: textContent.trim(),
        images: document.images.length,
        timestamp: Date.now(),
      };
    },

    // Handler with DOM manipulation
    highlightText: (data) => {
      const { searchTerm, color = '#ffff00' } = data;

      // Remove previous highlights
      document.querySelectorAll('.comet-highlight').forEach((el) => {
        el.replaceWith(...el.childNodes);
      });

      // Add new highlights
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );

      const textNodes = [];
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
          textNodes.push(node);
        }
      }

      textNodes.forEach((textNode) => {
        const parent = textNode.parentElement;
        const text = textNode.textContent;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlighted = text.replace(
          regex,
          `<span class="comet-highlight" style="background-color: ${color}">$1</span>`
        );

        const wrapper = document.createElement('div');
        wrapper.innerHTML = highlighted;
        parent.replaceChild(wrapper, textNode);
      });

      return {
        highlightedCount: textNodes.length,
        searchTerm,
        timestamp: Date.now(),
      };
    },
  },
};
```

#### Tab and Browser Utilities

```typescript
// Get current browser tab information
const getCurrentPageInfo = async () => {
  const tab = await messaging.getActiveTab();

  if (tab) {
    return {
      url: tab.url,
      title: tab.title,
      id: tab.id,
      isSupported: messaging.isTabSupported(tab),
    };
  }

  return null;
};

// Check if current page supports content scripts
const checkPageSupport = async () => {
  const tab = await messaging.getActiveTab();
  const isSupported = messaging.isTabSupported(tab);

  if (!isSupported) {
    console.log('Content scripts not supported on:', tab?.url);
    // Handle unsupported pages (chrome://, file://, etc.)
    return false;
  }

  return true;
};

// Set global message timeout
messaging.setTimeout(15000); // 15 seconds instead of default 10
```

#### Message Listeners (Advanced)

```typescript
// Listen for specific message types
const useMessageListener = () => {
  useEffect(() => {
    // Listen for all messages
    const unsubscribeAll = messaging.onMessage((message, sender) => {
      console.log('Received message:', message.type, message.data);

      // Return response if needed
      if (message.type === 'ping') {
        return { pong: true, timestamp: Date.now() };
      }
    });

    // Listen for specific message type only
    const unsubscribeSpecific = messaging.onMessageType(
      'userAction',
      (data, sender) => {
        console.log('User action:', data);
        handleUserAction(data);
      }
    );

    return () => {
      unsubscribeAll();
      unsubscribeSpecific();
    };
  }, []);
};
```

#### Messaging Error Handling

```typescript
// Robust messaging with retries
const sendMessageWithRetry = async (message, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await messaging.sendToContent(message);
      return response;
    } catch (error) {
      console.warn(`Message attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw new Error(
          `Message failed after ${maxRetries} attempts: ${error.message}`
        );
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
};

// Handle different error types
const handleMessagingError = (error) => {
  if (error.message.includes('Could not establish connection')) {
    return 'Content script not loaded. Please refresh the page.';
  }

  if (error.message.includes('No active tab')) {
    return 'No active tab found. Please navigate to a webpage.';
  }

  if (error.message.includes('timeout')) {
    return 'Operation timed out. The page may be unresponsive.';
  }

  return 'An unexpected error occurred while communicating with the page.';
};
```

---

### CORS-Free API Utility

**The `comet` API utility enables external API calls without CORS restrictions.** All requests route through the background script, which has elevated permissions and can access any external service.

#### Basic API Operations

```typescript
import { comet } from '@voilajsx/comet/api';

// GET request with automatic JSON parsing
const fetchUserData = async (userId) => {
  try {
    const response = await comet.get(`https://api.example.com/users/${userId}`);

    if (response.ok) {
      return {
        success: true,
        user: response.data, // Automatically parsed JSON
      };
    } else {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// POST request with JSON data
const createUser = async (userData) => {
  const response = await comet.post('https://api.example.com/users', {
    name: userData.name,
    email: userData.email,
    preferences: userData.preferences,
  });

  return response.ok ? response.data : null;
};

// Request with custom headers
const authenticatedRequest = async (endpoint, token) => {
  const response = await comet.get(`https://api.example.com/${endpoint}`, {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-API-Version': '2',
  });

  return response;
};
```

#### Advanced API Patterns

```typescript
// File upload (FormData)
const uploadFile = async (file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));

  const response = await comet.post(
    'https://api.example.com/upload',
    formData,
    {
      // Don't set Content-Type - let browser set it for FormData
    }
  );

  return response;
};

// Streaming/chunked responses
const downloadLargeFile = async (url, onProgress) => {
  try {
    const response = await comet.get(url);

    if (response.ok) {
      // For large files, you might want to process in chunks
      const data = response.data;
      onProgress?.(100); // Simple progress callback
      return data;
    }
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// API with caching
const cachedApiCall = async (url, cacheKey, maxAge = 300000) => {
  // Check cache first
  const cached = await storage.get(`api.cache.${cacheKey}`);

  if (cached && Date.now() - cached.timestamp < maxAge) {
    return { success: true, data: cached.data, fromCache: true };
  }

  // Make fresh API call
  const response = await comet.get(url);

  if (response.ok) {
    // Cache the result
    await storage.set(`api.cache.${cacheKey}`, {
      data: response.data,
      timestamp: Date.now(),
    });

    return { success: true, data: response.data, fromCache: false };
  }

  return { success: false, error: response.error };
};
```

#### Error Handling and Retries

```typescript
// Robust API call with retry logic
const apiCallWithRetry = async (url, options = {}, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await comet.get(url, options.headers);

      if (response.ok) {
        return response;
      }

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }

      // Retry server errors (5xx) and network issues
      if (attempt === maxRetries) {
        throw new Error(
          `API failed after ${maxRetries} attempts: ${response.status}`
        );
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Handle different API error types
const handleApiError = (error, response) => {
  if (error.message.includes('network')) {
    return 'Network connection failed. Please check your internet connection.';
  }

  if (response?.status === 401) {
    return 'Authentication failed. Please check your API credentials.';
  }

  if (response?.status === 403) {
    return 'Access denied. You may not have permission for this operation.';
  }

  if (response?.status === 429) {
    return 'Rate limit exceeded. Please wait before making more requests.';
  }

  if (response?.status >= 500) {
    return 'Server error. Please try again later.';
  }

  return `Request failed: ${error.message}`;
};
```

#### Real-World API Integration Examples

```typescript
// GitHub API integration
const useGitHubAPI = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserRepos = async (username) => {
    setLoading(true);

    try {
      const response = await comet.get(
        `https://api.github.com/users/${username}/repos`,
        {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Comet-Extension',
        }
      );

      if (response.ok) {
        setRepos(response.data);
        return { success: true, repos: response.data };
      }
    } catch (error) {
      console.error('GitHub API error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return { repos, loading, fetchUserRepos };
};

// Weather API with fallback
const useWeatherAPI = () => {
  const getWeather = async (city) => {
    try {
      // Try primary weather service
      const response = await comet.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
      );

      if (response.ok) {
        return {
          temperature: response.data.main.temp,
          description: response.data.weather[0].description,
          source: 'openweather',
        };
      }
    } catch (error) {
      console.warn('Primary weather API failed, trying fallback');

      // Try fallback service
      try {
        const fallbackResponse = await comet.get(
          `https://api.weatherapi.com/v1/current.json?key=${FALLBACK_KEY}&q=${city}`
        );

        if (fallbackResponse.ok) {
          return {
            temperature: fallbackResponse.data.current.temp_c,
            description: fallbackResponse.data.current.condition.text,
            source: 'weatherapi',
          };
        }
      } catch (fallbackError) {
        throw new Error('All weather services unavailable');
      }
    }
  };

  return { getWeather };
};
```

### Performance Optimization

**Optimize platform API usage for better performance:**

```typescript
// Batch storage operations
const optimizedDataSync = async (updates) => {
  // ✅ Good: Single storage operation
  await storage.set({
    'feature.data1': updates.data1,
    'feature.data2': updates.data2,
    'feature.lastSync': Date.now(),
  });

  // ❌ Bad: Multiple storage operations
  // await storage.set('feature.data1', updates.data1);
  // await storage.set('feature.data2', updates.data2);
  // await storage.set('feature.lastSync', Date.now());
};

// Debounce API calls
const useDebouncedAPI = (apiCall, delay = 500) => {
  const timeoutRef = useRef();

  return useCallback(
    (...args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => apiCall(...args), delay);
    },
    [apiCall, delay]
  );
};

// Cache frequently accessed data
const useCachedStorage = (key, defaultValue, cacheTime = 60000) => {
  const [data, setData] = useState(defaultValue);
  const [lastFetch, setLastFetch] = useState(0);

  const getData = useCallback(async () => {
    const now = Date.now();

    if (now - lastFetch < cacheTime) {
      return data; // Return cached data
    }

    const freshData = await storage.get(key, defaultValue);
    setData(freshData);
    setLastFetch(now);
    return freshData;
  }, [key, defaultValue, cacheTime, data, lastFetch]);

  return getData;
};
```

These platform APIs provide the foundation for building robust, cross-browser extensions. They handle the complex parts of extension development while providing simple, consistent interfaces that work reliably across different browsers and contexts.

## 4.2. Cross-Browser Support - Chrome, Firefox, Edge compatibility

### Automatic Browser Detection

**Comet automatically handles browser differences so you don't have to.** The framework detects which browser APIs are available and uses the appropriate ones. You write code once, and it works across Chrome, Firefox, Edge, and Opera without modification.

```typescript
// Comet handles this automatically in all platform APIs
const browserAPI = (() => {
  if (typeof browser !== 'undefined') {
    return browser; // Firefox, newer browsers
  } else if (typeof chrome !== 'undefined') {
    return chrome; // Chrome, Edge, Opera, Brave
  }
})();

// You just use Comet APIs without worrying about browser differences
await storage.set('key', 'value');        // Works everywhere
await messaging.sendToContent({...});     // Works everywhere
await comet.get('https://api.com/data');  // Works everywhere
```

### Single Manifest, All Browsers

**Your `manifest.json` works across all browsers automatically:**

```json
{
  "manifest_version": 3,
  "name": "Your Extension",
  "version": "1.0.0",
  "permissions": ["storage", "activeTab", "scripting"],
  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content-script.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html"
  }
}
```

**Browser-specific handling happens automatically:**

- **Chrome/Edge:** Uses service worker background script
- **Firefox:** Automatically converts to background page when needed
- **Manifest V2/V3:** Comet handles version differences internally

### What Works Everywhere

**These features work identically across all browsers:**

- ✅ Storage API (`storage.get`, `storage.set`, etc.)
- ✅ Messaging API (`messaging.sendToContent`, etc.)
- ✅ External API calls (`comet.get`, `comet.post`, etc.)
- ✅ Content script injection and communication
- ✅ Popup and options page functionality
- ✅ Theme system and UIKit components

### Browser-Specific Considerations

**Minor differences Comet handles automatically:**

**Firefox:**

- Uses `browser.*` APIs instead of `chrome.*`
- Slightly different storage quota limits
- Some timing differences in content script injection

**Edge:**

- Identical to Chrome in most cases
- Uses Chromium engine and Chrome APIs

**Opera:**

- Based on Chromium, works like Chrome
- Same API compatibility as Chrome

### Testing Across Browsers

**Simple testing workflow:**

```bash
# Build once
npm run build

# Test in Chrome
# Load dist/ folder in chrome://extensions/

# Test in Firefox
# Load dist/ folder in about:debugging → Load Temporary Add-on

# Test in Edge
# Load dist/ folder in edge://extensions/
```

**The same `dist/` folder works in all browsers without modification.**

### Publishing to Different Stores

**Same build, different stores:**

- **Chrome Web Store:** Upload `comet-extension.zip`
- **Firefox Add-ons:** Upload same `comet-extension.zip`
- **Edge Add-ons:** Upload same `comet-extension.zip`
- **Opera Add-ons:** Upload same `comet-extension.zip`

**No code changes needed** - Comet handles runtime compatibility automatically.

### Performance Across Browsers

**Comet optimizes for each browser:**

- **Chrome:** Uses latest V3 APIs for best performance
- **Firefox:** Graceful fallbacks for missing APIs
- **Edge:** Chromium optimization benefits
- **All browsers:** Lazy loading and efficient bundling

### When Browser Differences Matter

**Rare cases where you might need browser-specific code:**

```typescript
// Only if you need very specific browser features
const getBrowserInfo = () => {
  if (typeof browser !== 'undefined') {
    return { type: 'firefox', api: 'browser' };
  } else if (typeof chrome !== 'undefined') {
    return { type: 'chromium', api: 'chrome' };
  }
};

// Most of the time, you don't need this
// Comet's platform APIs handle differences automatically
```

**Bottom line:** Write your extension once using Comet's APIs, and it works everywhere. The framework handles all browser compatibility concerns automatically, so you can focus on building features instead of managing browser differences.

## 4.3. Extension Lifecycle - Install, update, permissions

### Installation and Updates

**Comet automatically handles extension lifecycle events.** When users first install your extension, Comet loads default values from `defaults.ts`. During updates, user data persists while defaults refresh.

```typescript
// Comet handles these automatically:
// First install → Loads all defaults.ts values
// Update → Preserves user data, refreshes defaults
// Enable/disable → Maintains all stored data
```

### Data Persistence During Updates

**User data survives extension updates:**

- ✅ **Persists:** Feature settings, user preferences, stored history
- ✅ **Refreshes:** App branding, theme settings, layout configuration (from `defaults.ts`)

```typescript
// These persist across updates (user data)
await storage.set('feature.userPreference', userChoice);
await storage.set('feature.history', userHistory);

// These refresh from defaults.ts (app configuration)
const appName = await storage.get('app-name'); // Always current default
const theme = await storage.get('app-theme'); // Always current default
```

### Permissions

**Comet uses minimal permissions that work across browsers:**

```json
{
  "permissions": ["storage", "activeTab", "scripting"],
  "optional_permissions": ["downloads", "tabs"]
}
```

**Required permissions are handled automatically. Optional permissions can be requested when needed:**

```typescript
// Request additional permissions if needed
const requestPermission = async (permission) => {
  if (typeof chrome !== 'undefined' && chrome.permissions) {
    return await chrome.permissions.request({ permissions: [permission] });
  }
  return false;
};
```

### Cleanup and Recovery

**Comet includes automatic error recovery:**

- **Corrupted data:** Falls back to defaults automatically
- **Storage errors:** Graceful degradation with default values
- **Missing features:** Skip broken features, continue with working ones

```typescript
// Automatic error handling in platform APIs
try {
  const data = await storage.get('feature.data');
} catch (error) {
  // Automatically falls back to defaults
  console.warn('Storage error, using defaults:', error);
}
```

**No manual lifecycle management needed** - Comet handles installation, updates, and error recovery automatically while preserving user data appropriately.

# 5. Production & AI

**Take your Comet extension from development to production deployment and leverage AI-assisted development workflows.** This section covers production optimization, store submission processes, and advanced AI-powered development techniques that make Comet extensions faster to build and maintain.

**Production readiness** includes build optimization, cross-browser packaging, and store submission best practices. **AI development** covers structured prompting patterns, code generation workflows, and debugging techniques that leverage Comet's predictable architecture. **Complete API reference** provides comprehensive documentation for all platform APIs, component signatures, and integration patterns.

**The combination of production-grade tooling and AI-friendly patterns** makes Comet ideal for both rapid prototyping and enterprise deployment, ensuring your extensions are professional, maintainable, and built efficiently.

## 5.1. Build & Deploy - Production builds, store submission

### Essential Process

**For basic build and deployment steps, see [Section 1.1 Quick Start](#11-quick-start---installation--first-extension).** The core process (`npm run build`, `npm run package`, loading in browsers) is covered there.

### Production Considerations

**Additional optimizations for production releases:**

**Bundle Optimization:**

- Review bundle size with `npm run build` - Comet automatically optimizes with tree shaking and lazy loading
- Large features load on-demand, keeping initial load fast
- UIKit components are efficiently bundled

**Store Submission:**

- Use `npm run package` to create store-ready `.zip` file
- Same package works for Chrome Web Store, Firefox Add-ons, Edge Add-ons
- Include proper screenshots showing popup and options pages
- Test across browsers before submission

**Performance:**

- Storage operations are automatically batched for efficiency
- API calls route through optimized background proxy
- Components lazy load when tabs are accessed

**Versioning:**

- Update version in `package.json` and `manifest.json`
- Consider user data migration if changing storage keys
- Test updates don't break existing user settings

**The build system handles most production optimization automatically** - focus on feature quality and user experience rather than build configuration.

## 5.2. LLM Development Guide - AI-assisted coding patterns

### Why Comet is Perfect for AI Development

**Comet's metadata-first architecture makes it highly interpretable by LLMs.** The structured, predictable patterns mean AI tools can generate complete, working features with minimal guidance. Instead of explaining complex framework concepts, you describe what you want and the AI follows established patterns.

**Key advantages for AI development:**

- **Predictable structure** - Every feature follows the same 4-file pattern
- **Declarative metadata** - AI understands configuration over code
- **Consistent patterns** - Same hooks, components, and API usage everywhere
- **Clear constraints** - Limited choices lead to better AI outputs
- **Self-documenting** - Code structure teaches AI the patterns

### Effective AI Prompting Patterns

**Structure your prompts to leverage Comet's patterns:**

#### Feature Creation Prompt Template

```
Create a Comet feature called "[feature-name]" that [brief description].

Requirements:
- Feature name: [camelCase name]
- Popup tab: [label], [icon], order [number]
- Options panel: [label], [icon], section "[section]"
- Functionality: [detailed requirements]
- Storage needed: [what data to persist]
- Page access: [yes/no - determines requiresTab]

Use these Comet patterns:
- Standard 4-file structure (index.ts, hook, PopupTab, OptionsPanel)
- UIKit components with semantic colors
- Proper error handling and loading states
- Storage integration with auto-save patterns
```

#### Example Effective Prompt

```
Create a Comet feature called "screenshot-tool" that captures and saves website screenshots.

Requirements:
- Feature name: screenshotTool
- Popup tab: "Screenshot", "Camera", order 3
- Options panel: "Screenshot Tool", "Camera", section "features"
- Functionality: Capture visible area, full page option, save to downloads
- Storage needed: User preferences (format, quality), recent screenshots list
- Page access: yes (needs to capture page content)

Use these Comet patterns:
- Standard 4-file structure
- UIKit components with semantic colors
- Proper error handling and loading states
- Storage integration with auto-save patterns
```

### AI-Friendly Code Patterns

**When working with AI, emphasize these Comet conventions:**

#### Consistent File Structure

```
Always create features with this exact structure:
src/features/feature-name/
├── index.ts              # Metadata only
├── hooks/
│   └── useFeatureName.ts # All business logic
└── components/
    ├── PopupTab.tsx      # Popup UI
    └── OptionsPanel.tsx  # Options UI

Never deviate from this structure.
```

#### Metadata-First Approach

```typescript
// Always start with metadata - AI understands this pattern well
const config: ModuleConfig = {
  name: 'featureName',
  ui: {
    popup: {
      tab: { label: 'Label', icon: 'Icon', order: 1, requiresTab: false },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: { label: 'Settings', icon: 'Icon', section: 'features', order: 1 },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },
  handlers: {
    // Content script functions if requiresTab: true
  },
};
```

#### Hook Pattern

```typescript
// AI generates consistent hooks following this pattern
export function useFeatureName() {
  // 1. State declarations
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});

  // 2. Data loading
  useEffect(() => {
    loadInitialData();
  }, []);

  // 3. Business logic functions
  const performAction = useCallback(async () => {
    setLoading(true);
    try {
      // Logic here
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. Settings management
  const updateSetting = useCallback(async (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await storage.set(`featureName.${key}`, value);
  }, []);

  // 5. Return interface
  return { data, loading, settings, performAction, updateSetting };
}
```

### AI Code Generation Guidelines

**Provide these constraints to get better AI output:**

#### Required Imports

```typescript
// Always include these exact imports for consistency
import { useState, useEffect, useCallback } from 'react';
import { storage } from '@voilajsx/comet/storage';
import { messaging } from '@voilajsx/comet/messaging';
import { comet } from '@voilajsx/comet/api';

// UIKit imports (use exact paths)
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';

// Icons from lucide-react
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
```

#### Semantic Color Requirements

```
Always use semantic colors:
- bg-background, bg-card, bg-muted, bg-primary
- text-foreground, text-muted-foreground, text-card-foreground
- border-border, border-input

Never use hardcoded colors:
- bg-white, bg-gray-100, text-black, text-gray-600
```

#### Component Structure

```typescript
// Standard popup tab structure for AI
export default function FeatureNameTab({ value, currentTab }) {
  const { data, loading, actions } = useFeatureName();

  if (loading) return <LoadingState />;

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            Feature Name
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{/* Feature UI */}</CardContent>
      </Card>
    </TabsContent>
  );
}
```

### Advanced AI Development Workflows

#### Iterative Feature Development

```
1. Generate basic feature structure
2. Test and identify issues
3. Refine with specific improvement prompts
4. Add advanced features incrementally

Example refinement prompt:
"Add error handling to the screenshot feature with proper user feedback and retry logic"
```

#### Feature Enhancement Prompts

```
Enhance the [feature-name] feature with:
- Better error handling with user-friendly messages
- Loading states for all async operations
- Data validation for user inputs
- Caching for expensive operations
- History management with size limits

Maintain all existing Comet patterns and UIKit components.
```

#### Integration Prompts

```
Create a feature that integrates with [external API] using Comet patterns:
- Use comet.get() for CORS-free requests
- Implement proper error handling and retries
- Cache responses appropriately
- Show loading states during API calls
- Handle rate limiting gracefully

Follow standard Comet feature structure.
```

### AI Debugging and Troubleshooting

**Common AI-generated issues and fixes:**

#### Missing Imports

```
If AI forgets imports, provide this template:
"Add missing imports for: [list specific components/hooks]
Use exact import paths from @voilajsx/uikit/[component]"
```

#### Hardcoded Colors

```
"Replace all hardcoded colors with semantic equivalents:
bg-white → bg-background
text-black → text-foreground
border-gray-200 → border-border"
```

#### Inconsistent Patterns

```
"Follow the exact Comet hook pattern:
1. State declarations first
2. useEffect for data loading
3. useCallback for actions
4. Consistent return interface"
```

### Best Practices for AI Collaboration

**Maximize AI effectiveness:**

- **Be specific about patterns** - Reference exact Comet conventions
- **Provide complete context** - Include file structure requirements
- **Use iterative refinement** - Start simple, add complexity gradually
- **Test frequently** - Validate AI output at each step
- **Maintain consistency** - Always reference established patterns

**Example complete feature request:**

```
Create a complete Comet feature for "page-timer" that tracks time spent on websites.

Structure:
- src/features/page-timer/index.ts (metadata + content script handlers)
- src/features/page-timer/hooks/usePageTimer.ts (React hook with logic)
- src/features/page-timer/components/PopupTab.tsx (shows current/total time)
- src/features/page-timer/components/OptionsPanel.tsx (settings + history)

Requirements:
- Track active time on current domain
- Store daily/weekly summaries
- Show time in popup with start/stop controls
- Options to set daily limits and view history
- Use standard Comet patterns throughout

Technical details:
- requiresTab: true (needs page access)
- Use messaging for start/stop from popup
- Content script tracks active time
- Storage for time data and user preferences
- UIKit components with semantic colors only
```

The structured nature of Comet makes it an ideal framework for AI-assisted development, enabling rapid prototyping and professional results with minimal manual coding.

## 5.3. API Reference - Complete function signatures

### Storage API Reference

#### Core Methods

```typescript
interface CometStorageManager {
  // Get operations
  get(key: string, fallback?: any): Promise<any>;
  get(keys: string[], fallback?: any): Promise<Record<string, any>>;
  get(keys: null): Promise<Record<string, any>>;

  // Set operations
  set(key: string, value: any): Promise<boolean>;
  set(data: Record<string, any>): Promise<boolean>;

  // Utility operations
  remove(keys: string | string[]): Promise<boolean>;
  clear(): Promise<boolean>;
  has(key: string): Promise<boolean>;

  // Change listeners
  onChange(
    callback: (changes: StorageChanges, namespace: string) => void
  ): () => void;

  // Default values
  getDefaults(): Record<string, any>;
  reloadDefaults(): Promise<boolean>;
}

interface StorageChanges {
  [key: string]: {
    oldValue?: any;
    newValue?: any;
  };
}
```

#### Usage Examples

```typescript
import { storage } from '@voilajsx/comet/storage';

// Get with fallback
const userName = await storage.get('user.name', 'Anonymous');

// Get multiple values
const settings = await storage.get(['app-theme', 'app-variant']);

// Set single value
await storage.set('user.preference', { theme: 'dark' });

// Set multiple values
await storage.set({
  'feature.enabled': true,
  'feature.lastUsed': Date.now(),
});

// Listen for changes
const unsubscribe = storage.onChange((changes, namespace) => {
  if (changes['user.theme']) {
    console.log('Theme changed:', changes['user.theme'].newValue);
  }
});
```

---

### Messaging API Reference

#### Core Methods

```typescript
interface CometMessagingManager {
  // Cross-context messaging
  sendToBackground(message: MessageRequest): Promise<MessageResponse>;
  sendToContent(
    message: MessageRequest,
    tabId?: number
  ): Promise<MessageResponse>;
  sendToTab(tabId: number, message: MessageRequest): Promise<MessageResponse>;

  // Message listeners
  onMessage(callback: MessageCallback): () => void;
  onMessageType(type: string, callback: TypedMessageCallback): () => void;

  // Tab utilities
  getActiveTab(): Promise<chrome.tabs.Tab | null>;
  getActiveTabId(): Promise<number | null>;
  isTabSupported(tab: chrome.tabs.Tab | string | null): boolean;

  // Configuration
  setTimeout(timeout: number): void;
}

interface MessageRequest {
  type: string;
  data?: any;
  id?: number;
  timestamp?: number;
}

interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
  id?: number;
  timestamp?: number;
}

interface MessageCallback {
  (message: MessageRequest, sender: MessageSender): any | Promise<any>;
}

interface TypedMessageCallback {
  (data: any, sender: MessageSender): any | Promise<any>;
}
```

#### Usage Examples

```typescript
import { messaging } from '@voilajsx/comet/messaging';

// Send to content script
const response = await messaging.sendToContent({
  type: 'analyzePageContent',
  data: { includeHidden: true },
});

if (response.success) {
  console.log('Analysis result:', response.data);
}

// Send to background
const bgResponse = await messaging.sendToBackground({
  type: 'syncData',
  data: { syncPayload: userData },
});

// Listen for specific message types
const unsubscribe = messaging.onMessageType('userAction', (data, sender) => {
  console.log('User performed action:', data);
});

// Check tab support
const currentTab = await messaging.getActiveTab();
const isSupported = messaging.isTabSupported(currentTab);
```

---

### External API Reference

#### Core Methods

```typescript
interface CometApiManager {
  // Base fetch method
  fetch(url: string, options?: FetchOptions): Promise<ApiResponse>;

  // HTTP convenience methods
  get(url: string, headers?: Record<string, string>): Promise<ApiResponse>;
  post(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse>;
  put(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse>;
  patch(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse>;
  delete(url: string, headers?: Record<string, string>): Promise<ApiResponse>;
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string | object | null;
  timeout?: number;
}

interface ApiResponse {
  ok: boolean;
  status: number;
  statusText?: string;
  data: any;
  headers?: Record<string, string>;
  error?: string;
  json(): Promise<any>;
}
```

#### Usage Examples

```typescript
import { comet } from '@voilajsx/comet/api';

// GET request
const response = await comet.get('https://api.example.com/data');
if (response.ok) {
  console.log('Data:', response.data);
}

// POST with JSON
const postResponse = await comet.post('https://api.example.com/submit', {
  name: 'John',
  email: 'john@example.com',
});

// Custom headers
const authResponse = await comet.get('https://api.example.com/protected', {
  Authorization: 'Bearer token',
  'Content-Type': 'application/json',
});

// Full fetch with options
const customResponse = await comet.fetch('https://api.example.com/endpoint', {
  method: 'PUT',
  headers: { 'X-Custom': 'value' },
  body: JSON.stringify(payload),
  timeout: 5000,
});
```

---

### Feature Module Types

#### Module Configuration

```typescript
interface ModuleConfig {
  name: string; // REQUIRED: Unique camelCase identifier
  ui?: FeatureUI; // UI components configuration
  settings?: Record<string, SettingSchema>; // Storage schema
  meta?: FeatureMeta; // Feature metadata
  handlers?: Record<string, HandlerFunction>; // Content script handlers
  init?: () => void | Promise<void>; // Initialization function
  lifecycle?: FeatureLifecycle; // Lifecycle hooks
}

interface FeatureUI {
  popup?: {
    tab: PopupTabConfig;
    component: () => Promise<{ default: React.ComponentType<any> }>;
  };
  options?: {
    panel: OptionsPanelConfig;
    component: () => Promise<{ default: React.ComponentType }>;
  };
}

interface PopupTabConfig {
  label: string; // Tab display text
  icon: string; // Lucide icon name
  order: number; // Tab position (lower = first)
  requiresTab?: boolean; // Needs page access (default: false)
  description?: string; // Tooltip/help text
}

interface OptionsPanelConfig {
  label: string; // Panel display text
  icon: string; // Lucide icon name
  section?: string; // Panel grouping (default: 'features')
  order: number; // Panel position
  description?: string; // Help text
}

interface SettingSchema {
  key: string; // Storage key
  default: any; // Default value
  type: 'boolean' | 'string' | 'number' | 'select';
  label: string; // UI display label
  description?: string; // Help text
  options?: Array<{ value: string; label: string }>; // For 'select' type
}

interface HandlerFunction {
  (data?: any, sender?: chrome.runtime.MessageSender): any | Promise<any>;
}
```

---

### UIKit Component Reference

#### Essential Components

```typescript
// Layout Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@voilajsx/uikit/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@voilajsx/uikit/tabs';
import { Separator } from '@voilajsx/uikit/separator';

// Form Components
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Label } from '@voilajsx/uikit/label';
import { Textarea } from '@voilajsx/uikit/textarea';
import { Switch } from '@voilajsx/uikit/switch';
import { Checkbox } from '@voilajsx/uikit/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voilajsx/uikit/select';

// Display Components
import { Badge } from '@voilajsx/uikit/badge';
import { Alert, AlertDescription, AlertTitle } from '@voilajsx/uikit/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@voilajsx/uikit/avatar';
import { Progress } from '@voilajsx/uikit/progress';
import { Skeleton } from '@voilajsx/uikit/skeleton';

// Navigation Components
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@voilajsx/uikit/dropdown-menu';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@voilajsx/uikit/dialog';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@voilajsx/uikit/tooltip';
```

#### Common Component Props

```typescript
// Button variants
<Button variant="default" | "secondary" | "outline" | "ghost" | "destructive" size="sm" | "md" | "lg">

// Badge variants
<Badge variant="default" | "secondary" | "destructive" | "outline">

// Alert variants
<Alert variant="default" | "destructive">

// Card with semantic colors
<Card className="bg-card text-card-foreground border-border">
```

---

### Layout Wrapper APIs

#### PopupWrapper

```typescript
interface PopupWrapperProps {
  extensionName?: string; // Override app name
  extensionIcon?: string; // Override app icon
  size?: 'sm' | 'md' | 'lg' | 'auto'; // Popup size
  variant?: 'default' | 'compact' | 'mini'; // Style variant
  className?: string; // Additional CSS classes
  customLogo?: React.ReactNode; // Custom logo component
  customActions?: React.ReactNode; // Custom header actions
  footerContent?: React.ReactNode; // Footer content
  onSettingsClick?: () => void; // Settings button handler
  onExtensionToggle?: (enabled: boolean) => void; // Toggle handler
}
```

#### OptionsWrapper

```typescript
interface OptionsWrapperProps {
  customLogo?: React.ReactNode; // Override logo
  customActions?: React.ReactNode; // Override header actions
  customFooter?: React.ReactNode; // Override footer
  onReset?: () => void; // Reset button handler
  forceVariant?: 'default' | 'minimal' | 'contained'; // Override variant
  forceSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; // Override size
  showResetButton?: boolean; // Show reset all button (default: true)
}
```

---

### Theme System Reference

```typescript
interface ThemeProviderProps {
  theme?: 'default' | 'aurora' | 'metro' | 'neon' | 'ruby' | 'studio';
  variant?: 'light' | 'dark';
  detectSystem?: boolean; // Auto-detect system preference
  children: React.ReactNode;
}

// Theme hook
const {
  theme, // Current theme ID
  variant, // 'light' | 'dark'
  setTheme, // (themeId: string) => void
  setVariant, // ('light' | 'dark') => void
  toggleVariant, // () => void
  availableThemes, // Array of theme objects
} = useTheme();
```

---

### Semantic Color Classes

```css
/* Background Colors */
.bg-background        /* Main page background */
.bg-card              /* Card/panel backgrounds */
.bg-muted             /* Subtle background areas */
.bg-primary           /* Primary buttons/elements */
.bg-secondary         /* Secondary buttons/elements */
.bg-destructive       /* Error/danger states */

/* Text Colors */
.text-foreground      /* Primary text color */
.text-muted-foreground /* Secondary/subtle text */
.text-card-foreground /* Text on card backgrounds */
.text-primary         /* Primary element text */
.text-destructive     /* Error text */

/* Border Colors */
.border-border        /* Standard borders */
.border-input         /* Input field borders */
.border-destructive   /* Error state borders */

/* Interactive States */
.hover:bg-muted       /* Hover backgrounds */
.focus:ring-ring      /* Focus rings */
.disabled:opacity-50  /* Disabled states */
```

---

### Error Handling Patterns

```typescript
// Storage error handling
try {
  await storage.set('key', value);
} catch (error) {
  console.error('Storage failed:', error);
  // Automatic fallback to defaults
}

// Messaging error handling
try {
  const response = await messaging.sendToContent({ type: 'handler' });
  if (!response.success) {
    throw new Error(response.error);
  }
} catch (error) {
  if (error.message.includes('Could not establish connection')) {
    // Content script not loaded
  } else if (error.message.includes('timeout')) {
    // Operation timed out
  }
}

// API error handling
const response = await comet.get('https://api.example.com/data');
if (!response.ok) {
  if (response.status === 401) {
    // Authentication failed
  } else if (response.status === 429) {
    // Rate limited
  } else if (response.status >= 500) {
    // Server error
  }
}
```

This API reference provides complete type information and usage patterns for all Comet platform APIs, ensuring developers have comprehensive documentation for building features efficiently.

# 6. Documentation Guidelines

Good documentation is critical for team understanding, maintenance, and onboarding new developers. A clear, consistent structure makes it easy for anyone to understand how features work, what patterns to follow, and how to troubleshoot issues. Well-documented modules serve as both reference and teaching tools for the entire team.

---

## 6.1. General Guidelines - Writing Standards for Internal Documentation

### Essential Documentation Principles

**✅ Key Requirements:**

- **Purpose first** - Clearly state what the module does and who should use it
- **Show, don't tell** - Include working code examples that can be copied
- **Structure consistently** - Use the same section headings across all modules
- **Focus on patterns** - Explain the "how" and "why" behind implementation choices
- **Include troubleshooting** - Common issues and debug steps
- **Team context** - Notes for new developers and code review guidance

**📝 Required Sections:**

- Purpose & Scope
- Module Structure
- Component Architecture
- Key Patterns Demonstrated
- Team Development Notes
- Testing & Debugging

---

## 6.2. Sample Documentation - Reference Examples for Feature Modules

### Reference Documentation

**📖 Read these examples and follow similar patterns:**

**Foundation Level:**

- [`src/features/hello-world/README.md`](src/features/hello-world/README.md) - Minimal template, storage patterns, onboarding reference

**Intermediate Level:**

- [`src/features/_quote-generator/README.md`](src/features/_quote-generator/README.md) - API integration, settings schema, fallback strategies

**Advanced Level:**

- [`src/features/page-analyzer/README.md`](src/features/page-analyzer/README.md) - Full platform integration, content scripts, complex workflows

### Usage Instructions

1. **Choose the closest example** based on your module's complexity
2. **Copy the structure** - Use the same section headings and flow
3. **Adapt the content** - Replace examples with your module's patterns
4. **Focus on teaching** - Help other developers understand your implementation choices

**💡 Tip:** Start with the Hello World example for simple modules, then reference others for specific patterns you need to document.

## Conclusion

**You now have everything needed to build professional Chrome extensions with Comet Framework.** From understanding the metadata-first architecture to deploying production-ready extensions, you've learned how auto-discovery eliminates boilerplate, how platform APIs handle complex browser interactions, and how AI-assisted development accelerates feature creation.

**Comet transforms extension development from a complex, browser-specific challenge into a predictable, enjoyable process.** The framework's opinionated patterns ensure consistency, the auto-discovery system eliminates manual wiring, and the professional theme system guarantees polished results. Whether you're building a simple utility or a complex productivity suite, Comet provides the foundation for rapid development without sacrificing quality.

**Start building your extension today** - create your first feature, experiment with the platform APIs, and leverage AI assistance to accelerate development. The Comet community and ecosystem continue to grow, providing examples, patterns, and support for developers creating the next generation of browser extensions.

**Happy building! 🚀**
# Cypro
