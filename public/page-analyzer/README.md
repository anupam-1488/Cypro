# Page Analyzer Module

> **Internal Reference Documentation**  
> **Module Type:** Demo/Reference Implementation  
> **Version:** 1.0.0  
> **Maintainer:** Comet Framework Team  
> **Last Updated:** June 2025

Demonstrates Storage, Messaging, and API utilities - serves as reference implementation for new team members.

## Purpose & Scope

This module serves as a **demo and reference implementation** showcasing all three core Comet platform APIs:

- **Storage API** - Persistent settings and history management
- **Messaging API** - Content script communication for page analysis
- **External API** - W3C HTML validation with CORS-free requests

**Target Users:** Internal developers learning the framework, new team members, and as a template for building content-script-dependent features.

## Module Structure

```
src/features/page-analyzer/
├── index.ts                 # Module config with handlers
├── hooks/
│   └── usePageAnalyzer.ts  # Core business logic & state
└── components/
    ├── PopupTab.tsx        # Popup interface with actions
    └── OptionsPanel.tsx    # Settings + history management
```

## Configuration Overview

### Module Registration (`index.ts`)

```typescript
const config: ModuleConfig = {
  name: 'pageAnalyzer',

  // UI Discovery
  ui: {
    popup: {
      tab: {
        label: 'Analyzer',
        icon: 'FileText',
        order: 1,
        requiresTab: true, // ⚠️ Only shows on supported pages
        description: 'Demo: Storage + Messaging + API',
      },
    },
    options: {
      panel: {
        label: 'Page Analyzer',
        section: 'features',
        order: 2,
      },
    },
  },

  // Settings Schema (auto-syncs with storage)
  settings: {
    autoValidate: {
      key: 'pageAnalyzer.autoValidate',
      default: false,
      type: 'boolean',
      label: 'Auto-validate HTML',
    },
    saveHistory: {
      key: 'pageAnalyzer.saveHistory',
      default: false,
      type: 'boolean',
      label: 'Save History',
    },
  },

  // Content Script Handlers
  handlers: {
    getPageSize: () => getPageSize(), // Runs in content script context
  },
};
```

**Key Implementation Notes:**

- `requiresTab: true` - Tab only appears on supported pages (not extension pages)
- Handlers run in content script context with full page access
- Settings auto-sync between popup and options panels

## Component Architecture

### usePageAnalyzer Hook

**Purpose:** Centralized state management and platform API orchestration

```typescript
export function usePageAnalyzer() {
  // State Management
  const [pageData, setPageData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [settings, setSettings] = useState({
    autoValidate: false,
    saveHistory: false,
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState({ analyze: false, validate: false });

  // Core Functions
  const analyzePageSize = async () => {
    /* Messaging API demo */
  };
  const validateHTML = async () => {
    /* External API demo */
  };
  const updateSetting = async (key, value) => {
    /* Storage API demo */
  };

  return {
    pageData,
    validationResult,
    settings,
    history,
    loading,
    analyzePageSize,
    validateHTML,
    updateSetting,
    clearHistory,
  };
}
```

**Integration Points:**

- **Storage API**: Auto-loads settings on mount, persists changes immediately
- **Messaging API**: Communicates with content script for page analysis
- **External API**: Validates HTML using W3C validator (with CORS handling)

### PopupTab Component

**Location:** Extension popup → "Analyzer" tab  
**Behavior:** Only visible on supported web pages (not extension pages)

**Key Features:**

- **Action Buttons**: Analyze page size, validate HTML
- **Auto-validation**: Triggers HTML validation after analysis (if enabled)
- **Real-time Feedback**: Success/error alerts with auto-dismiss
- **Tab Support Detection**: Gracefully handles unsupported pages

```tsx
// Tab support check pattern
const canAnalyze = messaging.isTabSupported(currentTab);
if (!canAnalyze) {
  return <UnsupportedPageMessage />;
}

// Messaging pattern
const result = await messaging.sendToContent({
  type: 'getPageSize', // Must match handler name
  data: {},
});
```

### OptionsPanel Component

**Location:** Extension options → "Page Analyzer" section

**Key Features:**

- **Settings Controls**: Toggle switches with auto-save
- **History Management**: View stored results, clear history
- **Storage Demo**: Shows persistent data across sessions

```tsx
// Auto-save pattern used throughout
const updateSetting = async (key, value) => {
  setSettings((prev) => ({ ...prev, [key]: value }));
  await storage.set(`pageAnalyzer.${key}`, value);
};
```

## Platform API Usage Examples

### 1. Storage API Demo

```typescript
// Load with fallbacks
const autoValidate = await storage.get('pageAnalyzer.autoValidate', false);
const savedHistory = await storage.get('pageAnalyzer.history', []);

// Auto-save on change
await storage.set('pageAnalyzer.autoValidate', true);

// History management
const newEntry = { type: 'analysis', data, timestamp: Date.now() };
const updatedHistory = [newEntry, ...history.slice(0, 4)]; // Keep last 5
await storage.set('pageAnalyzer.history', updatedHistory);
```

### 2. Messaging API Demo

```typescript
// Content script handler (runs on page)
function getPageSize() {
  const html = document.documentElement.outerHTML;
  return {
    htmlBytes: new Blob([html]).size,
    formatted: formatBytes(new Blob([html]).size),
    images: document.images.length,
    links: document.links.length,
    url: window.location.href,
    hostname: window.location.hostname,
    timestamp: Date.now(),
  };
}

// Popup/Options call
const response = await messaging.sendToContent({
  type: 'getPageSize',
  data: {},
});

if (response.success) {
  console.log('Page size:', response.data.formatted);
}
```

### 3. External API Demo

```typescript
// CORS-free external API call
const response = await comet.get(
  `https://validator.w3.org/nu/?doc=${encodeURIComponent(targetUrl)}&out=json`
);

if (response.ok) {
  const messages = response.data.messages || [];
  const errors = messages.filter((m) => m.type === 'error').length;
  // Process validation results...
}
```

## Data Flow & State Management

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   PopupTab      │    │  usePageAnalyzer │    │   OptionsPanel      │
│                 │    │                  │    │                     │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────────┐ │
│ │ Analyze Btn │─│────│→│ analyzePageSize│ │    │ │ Settings Toggle │ │
│ │ Validate Btn│─│────│→│ validateHTML   │ │    │ │ History Display │ │
│ │ Results     │←│────│─│ State Updates  │ │────│→│ History Actions │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │   Platform APIs      │
                    │                      │
                    │ • Storage (persist)  │
                    │ • Messaging (page)   │
                    │ • API (validation)   │
                    └──────────────────────┘
```

## Internal Implementation Details

### Settings Schema Integration

Settings defined in `index.ts` automatically:

- Appear in `defaults.js` with specified defaults
- Generate UI controls in OptionsPanel based on `type`
- Sync in real-time between popup and options
- Persist across browser sessions

### History Management Pattern

```typescript
// Consistent history entry structure
interface HistoryEntry {
  type: 'analysis' | 'validation';
  data: AnalysisResult | ValidationResult;
  timestamp: number;
}

// Automatic history limiting (keeps last 5 entries)
const updatedHistory = [newEntry, ...history.slice(0, 4)];
```

### Error Handling Patterns

```typescript
// Consistent error handling across all async operations
try {
  const result = await someAsyncOperation();
  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}

// UI feedback pattern
if (result.success) {
  setFeedback({ type: 'success', message: 'Operation complete!' });
} else {
  setFeedback({ type: 'error', message: result.error });
}

// Auto-dismiss feedback
setTimeout(() => setFeedback(null), 3000);
```

## Team Development Notes

### For New Team Members

1. **Start Here**: This module demonstrates all core patterns used across the codebase
2. **Copy Patterns**: Use the same async/await, error handling, and state management patterns
3. **Platform APIs**: Shows proper usage of all three platform APIs
4. **UI Patterns**: Demonstrates standard component structure and user feedback

### For Feature Development

**When building content-script features:**

- Copy the handler registration pattern from `index.ts`
- Use the messaging pattern from `usePageAnalyzer.ts`
- Include tab support detection like in `PopupTab.tsx`

**When adding external API integrations:**

- Use the `comet.get()` pattern with error handling
- Include offline fallbacks where appropriate
- Show API source in UI (Live/Offline badges)

**When implementing settings:**

- Follow the schema definition pattern
- Use auto-save on all setting changes
- Include descriptive labels and help text

### Code Review Checklist

- [ ] Settings schema matches storage keys used in components
- [ ] All async operations have proper error handling
- [ ] Content script handlers check tab support
- [ ] External API calls use `comet.*` methods
- [ ] UI provides meaningful feedback for all actions
- [ ] Loading states prevent multiple simultaneous operations
- [ ] History/data management includes size limits

## Dependencies & Requirements

**Platform APIs Required:**

- Storage API (settings persistence)
- Messaging API (content script communication)
- External API utility (W3C validator)

**Permissions Needed:**

- `activeTab` - for messaging.getActiveTab()
- `scripting` - for content script injection

**Browser Compatibility:**

- Chrome 88+ (Manifest V3)
- Firefox 109+ (Manifest V3)
- Edge 88+

## Related Modules

- **Hello World** - Basic storage patterns without content scripts
- **Quote Generator** - External API patterns without page access
- **Future modules** - Should reference this for content script integration

---

**Internal Note:** This module serves as the canonical reference for integrating all platform APIs. When onboarding new developers, walk through this module first to demonstrate framework capabilities and patterns.
