# Hello World Module

> **Internal Reference Documentation**  
> **Module Type:** Demo/Template  
> **Version:** 1.0.0  
> **Maintainer:** Comet Framework Team  
> **Last Updated:** June 2025

Simplest possible feature module - serves as template and onboarding reference for new team members.

## Purpose & Scope

This module serves as the **minimal template and onboarding reference** demonstrating:

- **Storage API** - Basic persistent state management
- **Shared State** - Data sync between popup and options
- **React Hooks** - Clean state management patterns
- **Auto-save UX** - Real-time persistence without save buttons

**Target Users:** New team members learning the framework, template for simple features that don't need content scripts or external APIs.

## Module Structure

```
src/features/hello-world/
├── index.ts                 # Minimal module config (no handlers)
├── hooks/
│   └── useHelloWorld.ts    # Storage API demonstration
└── components/
    ├── PopupTab.tsx        # Interactive demo interface
    └── OptionsPanel.tsx    # Settings with shared state demo
```

## Configuration Overview

### Module Registration (`index.ts`)

```typescript
const config: ModuleConfig = {
  name: 'helloWorld',

  // UI Discovery
  ui: {
    popup: {
      tab: {
        label: 'Hello',
        icon: 'Smile',
        order: 0, // First tab (demo purposes)
        requiresTab: false, // ✅ Available everywhere
        description: 'Simple hello world demo',
      },
    },
    options: {
      panel: {
        label: 'Hello World',
        section: 'features',
        order: 1, // First in features section
      },
    },
  },

  // No settings schema - uses direct storage keys
  // No handlers - pure React/Storage module
  // No external dependencies

  meta: {
    name: 'Hello World',
    description: 'Super simple feature demo',
    version: '1.0.0',
    category: 'demo',
    tags: ['hello', 'simple', 'demo'],
  },

  init: () => console.log('[Demo] Hello World feature loaded!'),
};
```

**Key Template Notes:**

- **No handlers** - Pure React module without content script needs
- **No settings schema** - Uses direct storage keys for simplicity
- **requiresTab: false** - Available on all pages including extension pages
- **Minimal dependencies** - Only uses Storage API

## Component Architecture

### useHelloWorld Hook

**Purpose:** Demonstrates basic Storage API patterns and shared state management

```typescript
export function useHelloWorld() {
  const [clickCount, setClickCount] = useState(0);
  const [userName, setUserName] = useState('Friend');
  const [loading, setLoading] = useState(true);

  // Storage Load Pattern
  useEffect(() => {
    const load = async () => {
      try {
        const [count, name] = await Promise.all([
          storage.get('helloworld-count', 0),
          storage.get('helloworld-name', 'Friend'),
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

  // Auto-save Patterns
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

  return {
    clickCount,
    userName,
    loading,
    handleClick,
    updateName,
    reset,
    message: `Hello, ${userName}! You've clicked ${clickCount} times. 👋`,
  };
}
```

**Key Patterns Demonstrated:**

- **Parallel loading** - Multiple storage keys loaded simultaneously
- **Auto-save on change** - No explicit save buttons needed
- **Error handling** - Graceful fallbacks for storage failures
- **Loading states** - Prevents UI flash during initialization
- **useCallback optimization** - Prevents unnecessary re-renders

### PopupTab Component

**Location:** Extension popup → "Hello" tab (first tab)  
**Behavior:** Available everywhere (extension pages, web pages, etc.)

**Key Features:**

- **Interactive Demo**: Click counter with persistence
- **Shared State**: Name changes sync with options panel
- **Real-time Updates**: Shows current state values
- **Simple UX**: Input + buttons + status display

```tsx
export default function HelloWorldTab({ value }) {
  const {
    clickCount,
    userName,
    handleClick,
    updateName,
    reset,
    message,
    loading,
  } = useHelloWorld();

  // Loading state pattern
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

  // Main interface pattern
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
          {/* Real-time input with auto-save */}
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

          {/* Live state display */}
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

### OptionsPanel Component

**Location:** Extension options → "Hello World" section

**Key Features:**

- **Shared State Demo**: Shows same data as popup in real-time
- **Storage Visualization**: Current state display with badges
- **Reset Functionality**: Clear all stored data
- **Auto-sync**: Changes reflect immediately in popup

```tsx
export default function HelloWorldOptionsPanel() {
  const { clickCount, userName, updateName, reset, message, loading } =
    useHelloWorld();

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
          {/* Same input as popup - state syncs automatically */}
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

          {/* State visualization */}
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

## Storage Patterns Demonstrated

### 1. Direct Storage Keys (Simple Approach)

```typescript
// No settings schema - direct storage access
await storage.get('helloworld-count', 0);
await storage.set('helloworld-count', newCount);
await storage.remove(['helloworld-count', 'helloworld-name']);

// Use for: Simple features, prototyping, one-off storage needs
```

### 2. Parallel Loading Pattern

```typescript
// Load multiple keys simultaneously
const [count, name] = await Promise.all([
  storage.get('helloworld-count', 0),
  storage.get('helloworld-name', 'Friend'),
]);

// Better performance than sequential loading
```

### 3. Auto-save on Change

```typescript
// No save buttons - immediate persistence
const updateName = useCallback(async (name: string) => {
  const newName = name.trim() || 'Friend';
  setUserName(newName); // Update UI immediately
  await storage.set('helloworld-name', newName); // Persist in background
}, []);

// UX benefit: No lost data, no save/cancel complexity
```

### 4. Shared State Between Components

```typescript
// Same hook used in both popup and options
const hook1 = useHelloWorld(); // In PopupTab
const hook2 = useHelloWorld(); // In OptionsPanel

// Changes in one component automatically reflect in the other
// No additional sync mechanism needed
```

## Data Flow & State Management

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   PopupTab      │    │  useHelloWorld   │    │   OptionsPanel      │
│                 │    │                  │    │                     │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────────┐ │
│ │ Name Input  │◄│────│─│ userName     │─│────│►│ Name Input      │ │
│ │ Click Btn   │─│────│►│ handleClick  │ │    │ │ Reset Button    │ │
│ │ Reset Btn   │─│────│►│ reset        │◄│────│─│ State Display   │ │
│ │ State Show  │◄│────│─│ message      │─│────│►│ Same Data       │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │   Storage API        │
                    │                      │
                    │ • helloworld-count   │
                    │ • helloworld-name    │
                    └──────────────────────┘
```

## Team Development Notes

### For New Team Members

1. **Start Here**: Simplest possible module to understand framework basics
2. **Core Concepts**: Storage API, shared state, auto-save patterns
3. **Copy Template**: Use this structure for simple features
4. **No Complexity**: No content scripts, no external APIs, no settings schemas

### Template Usage Guide

**When to copy Hello World:**

- Simple utilities that don't need page access
- Settings-only features
- Proof-of-concept development
- Learning/prototyping

**What to change:**

```typescript
// 1. Module name and labels
name: 'myFeature'; // Change this
label: 'My Feature'; // And UI labels

// 2. Storage keys
('myfeature-setting1'); // Use your prefix
('myfeature-setting2');

// 3. Hook name and logic
export function useMyFeature() {
  // Your business logic here
}
```

### Code Patterns to Reuse

**Storage Loading Pattern:**

```typescript
useEffect(() => {
  const load = async () => {
    try {
      const [value1, value2] = await Promise.all([
        storage.get('key1', defaultValue1),
        storage.get('key2', defaultValue2),
      ]);
      // Set state...
    } catch (error) {
      console.error('[Feature] Load failed:', error);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);
```

**Auto-save Pattern:**

```typescript
const updateValue = useCallback(async (newValue) => {
  setValue(newValue); // UI update first
  await storage.set('storage-key', newValue); // Persist second
}, []);
```

**Loading State Pattern:**

```typescript
if (loading) {
  return <LoadingPlaceholder />;
}
```

### When NOT to Use This Template

**Use other modules when you need:**

- **Page Analyzer** - Content script communication
- **Quote Generator** - External API integration
- **Custom** - Complex business logic, multiple APIs

## Internal Implementation Details

### Storage Keys Convention

```typescript
// Pattern: 'modulename-setting'
'helloworld-count'; // Click counter
'helloworld-name'; // User name

// Benefits:
// - No namespace conflicts
// - Easy to identify in browser storage inspector
// - Simple to clear module data: storage.remove(['helloworld-*'])
```

### State Synchronization

**How shared state works:**

1. Both components use same hook
2. Hook loads from storage on mount
3. Changes immediately update local state
4. Changes persist to storage in background
5. Other component instances update on next render/mount

**No real-time sync:** Changes don't propagate between components in real-time. User needs to switch tabs/panels to see updates.

### Performance Considerations

- **Parallel loading** prevents sequential delay
- **useCallback** prevents unnecessary re-renders
- **Minimal state** only stores what's needed
- **Direct storage** avoids framework overhead

## Testing & Debugging

### Manual Testing Checklist

- [ ] Popup shows current state on open
- [ ] Options shows same state as popup
- [ ] Name changes sync between popup/options
- [ ] Click count persists across extension reload
- [ ] Reset button clears all data
- [ ] Loading state appears briefly on first load

### Debug Utilities

```typescript
// Check storage contents
const allData = await storage.get(null);
console.log('[Hello World] Storage:', allData);

// Clear module data
await storage.remove(['helloworld-count', 'helloworld-name']);

// Test auto-save
console.log('[Hello World] Saving:', key, value);
await storage.set(key, value);
```

### Common Issues

**State not persisting:**

- Check browser storage quota
- Verify storage key names match
- Ensure await is used with storage.set()

**Components out of sync:**

- Both must use same storage keys
- Check for typos in key names
- Verify both components call same hook

## Dependencies & Requirements

**Platform APIs Required:**

- Storage API only

**Permissions Needed:**

- `storage` (automatically included)

**Browser Compatibility:**

- All browsers (no special APIs)

## Related Modules

- **Page Analyzer** - Storage + Messaging + API example
- **Quote Generator** - Storage + API example
- **Future simple modules** - Should copy this template

---

**Internal Note:** This is the canonical "getting started" module. New developers should build and interact with this first to understand basic framework concepts before moving to more complex modules.
