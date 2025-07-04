/**
 * Comet Framework - Default Configuration
 * @module @voilajsx/comet
 * @file src/defaults.ts
 */

// ⚠️ WARNING: All values here are reloaded on every extension restart!
// ✅ Put: App config, theme, layout settings
// ❌ Don't put: User data, click counts, user input (will be lost!)

const defaults = {
  // Debug Configuration
  'debug-enabled': false, // Toggle all debug logs

  // App Configuration
  'app-name': 'Cyepro AI',
  'app-version': '1.0.0',
  'app-description': 'Minimal but powerful Chrome extension framework built with React and UIKit',
  'app-author': 'Your Name',
  'app-website': 'https://github.com/your-username/your-extension',
  'app-icon': 'Zap',
  'app-theme': '',
  'app-variant': 'light',

  // Footer Configuration
  'footer-content': 'Made with ❤️ using Comet Framework',

  // Layout Configuration
  'options-variant': 'primary',
  'options-size': 'full',

  // Extension State
  extensionEnabled: true,

} as const;

// ============================================================================
// Type interface for TypeScript consumers
// ============================================================================
interface DefaultConfig {
  // Debug Configuration
  'debug-enabled': boolean;

  // App Configuration
  'app-name': string;
  'app-version': string;
  'app-description': string;
  'app-author': string;
  'app-website': string;
  'app-icon': string;
  'app-theme': string;
  'app-variant': 'light' | 'dark';

  // Footer Configuration
  'footer-content': string;

  // Layout Configuration
  'options-variant': 'default' | 'primary' | 'black';
  'options-size': 'sm' | 'md' | 'lg' | 'xl' | 'full';

  // Extension State
  extensionEnabled: boolean;
}

export default defaults;