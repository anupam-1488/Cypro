# Quote Generator Module

> **Internal Reference Documentation**  
> **Module Type:** Demo/API Integration Reference  
> **Version:** 1.0.0  
> **Maintainer:** Comet Framework Team  
> **Last Updated:** June 2025

Demonstrates External API integration with offline fallbacks - serves as reference for API-dependent features.

## Purpose & Scope

This module serves as the **canonical reference for external API integration** demonstrating:

- **External API Utility** - CORS-free API calls using `comet.get()`
- **Offline Fallback Strategy** - Graceful degradation when APIs fail
- **Settings Schema Integration** - Auto-generated UI controls from metadata
- **API Source Indicators** - User feedback for Live vs Offline data

**Target Users:** Developers building features that consume external APIs, need offline capabilities, or want configurable behavior through settings.

## Module Structure

```
src/features/quote-generator/
├── index.ts                    # Module config with settings schema
├── hooks/
│   └── useQuoteGenerator.ts   # API calls + fallback logic
└── components/
    ├── PopupTab.tsx           # Quote display with source indicators
    └── OptionsPanel.tsx       # Settings control (auto-generated UI)
```

## Configuration Overview

### Module Registration (`index.ts`)

```typescript
const config: ModuleConfig = {
  name: 'quoteGenerator',

  // UI Discovery
  ui: {
    popup: {
      tab: {
        label: 'Quotes',
        icon: 'Quote',
        order: 2,
        requiresTab: false, // ✅ Available everywhere
        description: 'Get inspirational quotes',
      },
    },
    options: {
      panel: {
        label: 'Quote Generator',
        section: 'features',
        order: 3,
        description: 'Configure quote preferences',
      },
    },
  },

  // Settings Schema - Auto-generates UI controls
  settings: {
    quoteType: {
      key: 'quoteGenerator.type', // Storage key
      default: 'general', // Default value
      type: 'select', // UI control type
      label: 'Quote Type', // Display label
      description: 'Choose quote category', // Help text
      options: [
        // Dropdown options
        { value: 'general', label: 'General Quotes' },
        { value: 'motivational', label: 'Motivational Quotes' },
      ],
    },
  },

  // No handlers - doesn't need content script access
  handlers: {},

  meta: {
    name: 'Quote Generator',
    description: 'Demo: API utility with offline fallback',
    version: '2.0.0',
    category: 'inspiration',
    tags: ['quotes', 'api', 'demo'],
  },
};
```

**Key Implementation Notes:**

- **Settings Schema** - Automatically generates dropdown UI in options panel
- **No handlers** - Pure external API module, no page access needed
- **requiresTab: false** - Works everywhere (doesn't depend on current page)
- **Clean separation** - Business logic in hook, UI config in index

## Component Architecture

### useQuoteGenerator Hook

**Purpose:** External API orchestration with fallback strategies and settings management

```typescript
export function useQuoteGenerator() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [settings, setSettings] = useState<Settings>({ quoteType: 'general' });
  const [loading, setLoading] = useState(false);

  // Settings Auto-load
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

  // Main API Function with Fallback Strategy
  const getQuote = async () => {
    setLoading(true);

    try {
      let quote: Quote;

      if (settings.quoteType === 'motivational') {
        quote = await getMotivationalQuote(); // Try API first, fallback if needed
      } else {
        quote = await getGeneralQuote(); // Try API first, fallback if needed
      }

      setCurrentQuote(quote);
      return { success: true, data: quote };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Auto-save Settings Pattern
  const updateSetting = async (key: keyof Settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await storage.set(
      `quoteGenerator.${key === 'quoteType' ? 'type' : key}`,
      value
    );
  };

  return {
    currentQuote,
    settings,
    loading,
    getQuote,
    updateSetting,
  };
}
```

**Key Patterns Demonstrated:**

- **API with fallback** - Try external API, use local quotes if failed
- **Loading state management** - Prevents multiple simultaneous requests
- **Settings integration** - Loads from storage, auto-saves changes
- **Error boundary** - Graceful handling of API failures

### API Integration Patterns

```typescript
// Primary API Function - Clean Response Handling
async function getGeneralQuote(): Promise<Quote> {
  try {
    const response = await comet.get('https://api.adviceslip.com/advice');

    if (response.ok && response.data?.slip?.advice) {
      return {
        text: response.data.slip.advice,
        author: 'Anonymous',
        category: 'advice',
        source: 'api', // ⚠️ Important: Track data source
        timestamp: Date.now(),
      };
    } else {
      throw new Error('API failed');
    }
  } catch (error) {
    return getFallbackQuote(); // Graceful degradation
  }
}

// Fallback Strategy - Always Available
function getFallbackQuote(): Quote {
  const quotes = [
    {
      text: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
    },
    {
      text: "Life is what happens while you're busy making other plans.",
      author: 'John Lennon',
    },
    // ... more offline quotes
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    ...randomQuote,
    category: 'wisdom',
    source: 'fallback', // ⚠️ Important: Indicate offline source
    timestamp: Date.now(),
  };
}
```

### PopupTab Component

**Location:** Extension popup → "Quotes" tab  
**Behavior:** Available everywhere, adapts UI based on quote type setting

**Key Features:**

- **Dynamic Configuration**: Button text and descriptions change based on settings
- **Source Indicators**: Shows "Live" vs "Offline" badges for data transparency
- **API Feedback**: Different messages for successful API vs fallback responses
- **Settings Integration**: Reads current quote type for customized experience

```tsx
export default function QuoteGeneratorTab({ value, currentTab }) {
  const { currentQuote, settings, loading, getQuote } = useQuoteGenerator();
  const [feedback, setFeedback] = useState(null);

  const handleGetQuote = async () => {
    const result = await getQuote();

    if (result.success) {
      setFeedback({
        type: 'success',
        message:
          result.data.source === 'api' ? 'Fresh quote!' : 'Offline quote',
      });
    } else {
      setFeedback({ type: 'error', message: result.error });
    }

    setTimeout(() => setFeedback(null), 3000);
  };

  // Dynamic Configuration Based on Settings
  const getConfig = () => {
    return settings.quoteType === 'motivational'
      ? {
          title: 'Motivational Quote',
          desc: 'Inspiring messages',
          buttonText: 'Get Motivation',
        }
      : {
          title: 'General Quote',
          desc: 'Wisdom and advice',
          buttonText: 'Get Quote',
        };
  };

  const config = getConfig();

  return (
    <TabsContent value={value} className="mt-0">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Quote className="w-4 h-4" />
            {config.title} {/* Dynamic title */}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{config.desc}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Dynamic Button */}
          <Button
            onClick={handleGetQuote}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Quote...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {config.buttonText} {/* Dynamic button text */}
              </>
            )}
          </Button>

          {/* API Source Feedback */}
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

          {/* Quote Display with Source Indicators */}
          {currentQuote && (
            <div className="space-y-3">
              <Separator />

              <div className="bg-muted/50 p-4 rounded border">
                <div className="text-sm italic mb-3 leading-relaxed">
                  "{currentQuote.text}"
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>— {currentQuote.author}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{currentQuote.category}</Badge>
                    {/* Source Indicator - Important for API transparency */}
                    <Badge
                      variant={
                        currentQuote.source === 'api' ? 'default' : 'secondary'
                      }
                    >
                      {currentQuote.source === 'api' ? 'Live' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Hint */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Change quote type in extension settings
            </p>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
```

### OptionsPanel Component

**Location:** Extension options → "Quote Generator" section

**Key Features:**

- **Auto-generated UI**: Dropdown automatically created from settings schema
- **Real-time Updates**: Changes immediately affect popup behavior
- **API Information**: Explains the external API integration to users

```tsx
export default function QuoteGeneratorOptionsPanel() {
  const { settings, updateSetting } = useQuoteGenerator();

  const handleTypeChange = (type) => {
    updateSetting('quoteType', type); // Auto-saves to storage
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quote Generator Settings</h1>
        <p className="text-muted-foreground">
          Choose your preferred quote type
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5" />
            Quote Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="quote-type-select" className="text-sm font-medium">
              Quote Category
            </Label>

            {/* Auto-generated from settings schema */}
            <Select value={settings.quoteType} onValueChange={handleTypeChange}>
              <SelectTrigger id="quote-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <div>
                    <div className="font-medium">General Quotes</div>
                    <div className="text-xs text-muted-foreground">
                      Wisdom and life advice
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="motivational">
                  <div>
                    <div className="font-medium">Motivational Quotes</div>
                    <div className="text-xs text-muted-foreground">
                      Inspiring and uplifting messages
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Information for Users */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <strong>API Demo:</strong> Uses external API with offline fallback
            when network fails.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## External API Patterns Demonstrated

### 1. CORS-Free API Calls

```typescript
// Using Comet's API utility - handles CORS automatically
const response = await comet.get('https://api.adviceslip.com/advice');

// Benefits:
// - No CORS issues (routed through service worker)
// - Consistent error handling
// - Cross-browser compatibility
// - Clean response format
```

### 2. Fallback Strategy Pattern

```typescript
// Try API first, fallback on any failure
async function getQuote(): Promise<Quote> {
  try {
    const response = await comet.get(apiUrl);
    if (response.ok && hasValidData(response.data)) {
      return formatApiResponse(response.data, 'api');
    }
    throw new Error('Invalid API response');
  } catch (error) {
    return getOfflineQuote('fallback'); // Always works
  }
}

// Use for: Any external API integration
// Benefits: Always functional, graceful degradation, user transparency
```

### 3. Source Tracking Pattern

```typescript
// Always track data source for user transparency
interface Quote {
  text: string;
  author: string;
  category: string;
  source: 'api' | 'fallback'; // ⚠️ Critical for user feedback
  timestamp: number;
}

// Display source to user
<Badge variant={quote.source === 'api' ? 'default' : 'secondary'}>
  {quote.source === 'api' ? 'Live' : 'Offline'}
</Badge>;
```

### 4. Settings-Driven API Behavior

```typescript
// API calls adapt based on user settings
const getQuote = async () => {
  if (settings.quoteType === 'motivational') {
    return await getMotivationalQuote(); // Different API endpoint
  } else {
    return await getGeneralQuote(); // Default API endpoint
  }
};

// UI adapts to settings
const config =
  settings.quoteType === 'motivational'
    ? { title: 'Motivational Quote', buttonText: 'Get Motivation' }
    : { title: 'General Quote', buttonText: 'Get Quote' };
```

## Data Flow & API Integration

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   PopupTab      │    │useQuoteGenerator │    │   OptionsPanel      │
│                 │    │                  │    │                     │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────────┐ │
│ │ Get Quote   │─│────│►│ getQuote()   │ │    │ │ Type Selector   │ │
│ │ Display     │◄│────│─│ currentQuote │◄│────│─│ Auto-save       │ │
│ │ Source Badge│◄│────│─│ source info  │ │    │ │ Settings        │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────────┘ │
└─────────────────┘    └─────────┬────────┘    └─────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │   External APIs      │
                    │                      │
                    │ ┌──────────────────┐ │
                    │ │AdviceSlip API    │ │
                    │ │ ├─Success────────┐│ │
                    │ │ └─Failure───────┐││ │
                    │ └─────────────────┘││ │
                    │ ┌──────────────────┘│ │
                    │ │ Offline Fallback ││ │
                    │ │ (Always Works)   ││ │
                    │ └──────────────────┘│ │
                    └──────────────────────┘
```

## Team Development Notes

### For API Integration Features

1. **Copy This Pattern**: Standard template for external API features
2. **Key Concepts**: CORS-free requests, fallback strategies, source tracking
3. **Settings Schema**: Auto-generates UI controls from metadata
4. **User Transparency**: Always show data source (Live/Offline)

### Settings Schema Usage

**When to use settings schema:**

- User-configurable behavior
- Multiple options/modes
- Auto-generated UI controls preferred
- Standard framework patterns

**Schema definition pattern:**

```typescript
settings: {
  settingName: {
    key: 'moduleName.settingName',  // Storage key
    default: 'defaultValue',        // Default value
    type: 'select',                 // UI control type
    label: 'Display Name',          // UI label
    description: 'Help text',       // Optional description
    options: [                      // For select type
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' }
    ]
  }
}
```

### API Integration Best Practices

**✅ DO:**

- Always include offline fallbacks
- Track and display data sources
- Handle network failures gracefully
- Use `comet.get()` for CORS-free requests
- Include loading states for API calls
- Provide meaningful error messages

**❌ DON'T:**

- Make direct fetch() calls (CORS issues)
- Rely solely on external APIs without fallbacks
- Hide API failures from users
- Block UI indefinitely on API timeouts
- Skip error handling for network requests

### Code Patterns to Reuse

**API Call with Fallback:**

```typescript
const getDataFromAPI = async () => {
  try {
    const response = await comet.get(apiUrl);
    if (response.ok && isValidData(response.data)) {
      return formatResponse(response.data, 'api');
    }
    throw new Error('Invalid response');
  } catch (error) {
    return getFallbackData('fallback');
  }
};
```

**Settings-Driven Behavior:**

```typescript
const performAction = async () => {
  const action =
    settings.mode === 'advanced' ? performAdvancedAction : performBasicAction;
  return await action();
};
```

**Loading State Management:**

```typescript
const [loading, setLoading] = useState(false);

const handleRequest = async () => {
  setLoading(true);
  try {
    const result = await apiCall();
    // Handle success...
  } catch (error) {
    // Handle error...
  } finally {
    setLoading(false);
  }
};
```

## Testing & Debugging

### Manual Testing Checklist

- [ ] Quote fetching works when online
- [ ] Offline fallback activates when API fails
- [ ] Source badges show correct "Live" vs "Offline" status
- [ ] Settings change affects quote type and UI labels
- [ ] Settings persist across extension reload
- [ ] Loading states appear during API requests
- [ ] Error handling works for network failures

### Debug Utilities

```typescript
// Test API connectivity
const testAPI = async () => {
  try {
    const response = await comet.get('https://api.adviceslip.com/advice');
    console.log('[Quote API] Status:', response.ok, response.status);
    console.log('[Quote API] Data:', response.data);
  } catch (error) {
    console.log('[Quote API] Failed:', error.message);
  }
};

// Force fallback mode
const testFallback = () => {
  const quote = getFallbackQuote();
  console.log('[Quote Fallback]:', quote);
};

// Check settings
const debugSettings = async () => {
  const type = await storage.get('quoteGenerator.type');
  console.log('[Quote Settings] Type:', type);
};
```

### Common Issues

**API not responding:**

- Check network connectivity
- Verify API endpoint URL
- Test with browser fetch() for comparison
- Check service worker console for CORS errors

**Fallback not triggering:**

- Ensure try/catch wraps API calls
- Check error conditions in API response handling
- Verify fallback function is called in catch block

**Settings not updating UI:**

- Check storage key names match exactly
- Verify auto-save is awaited properly
- Test settings loading on component mount

## Dependencies & Requirements

**Platform APIs Required:**

- Storage API (settings persistence)
- External API utility (CORS-free requests)

**External Dependencies:**

- AdviceSlip API (https://api.adviceslip.com/advice)
- Fallback quotes (embedded in code)

**Permissions Needed:**

- None (API calls handled by service worker)

**Browser Compatibility:**

- All browsers (standard fetch implementation)

## Related Modules

- **Hello World** - Basic storage patterns without APIs
- **Page Analyzer** - Storage + Messaging + API integration
- **Future API modules** - Should copy this fallback pattern

---

**Internal Note:** This module demonstrates the preferred approach for any external API integration. The fallback strategy ensures features remain functional even when APIs are unavailable, and source indicators maintain user trust through transparency.
