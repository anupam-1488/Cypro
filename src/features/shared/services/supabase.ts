// shared/services/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ghrqihiojvbsbtzjtked.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdocnFpaGlvanZic2J0emp0a2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzQ1NDEsImV4cCI6MjA2NzA1MDU0MX0.duFRfZxONFFUOFhfWBVuXEm5e3uCMJx6W3imhRtJttw'

// AppKit API configuration
const APPKIT_API_URL = 'https://cyeproai.fly.dev/api/authorize/token'

// Session management constants
const SESSION_STORAGE_KEY = 'supabase.auth.token'
const CUSTOM_SESSION_KEY = 'custom_session_data'
const APPKIT_TOKEN_KEY = 'cyepro_appkit_token'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds

// Request throttling
let lastStorageOperation = 0
const STORAGE_THROTTLE_MS = 1000 // 1 second between storage operations

// Custom storage implementation with throttling
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null
    
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return null
      
      // Check if this is our custom session data
      if (key === SESSION_STORAGE_KEY) {
        const customData = window.localStorage.getItem(CUSTOM_SESSION_KEY)
        if (customData) {
          const { timestamp, manualLogout } = JSON.parse(customData)
          const now = Date.now()
          
          // If manually logged out, return null
          if (manualLogout) {
            window.localStorage.removeItem(key)
            window.localStorage.removeItem(CUSTOM_SESSION_KEY)
            return null
          }
          
          // If older than 1 week, clear session
          if (now - timestamp > ONE_WEEK_MS) {
            window.localStorage.removeItem(key)
            window.localStorage.removeItem(CUSTOM_SESSION_KEY)
            return null
          }
        }
      }
      
      return item
    } catch (error) {
      console.error('[Storage] Error getting item:', error)
      return null
    }
  },
  
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return
    
    // Throttle storage operations to prevent spam
    const now = Date.now()
    if (now - lastStorageOperation < STORAGE_THROTTLE_MS) {
      return
    }
    lastStorageOperation = now
    
    try {
      window.localStorage.setItem(key, value)
      
      // Set custom session tracking for auth tokens
      if (key === SESSION_STORAGE_KEY) {
        window.localStorage.setItem(CUSTOM_SESSION_KEY, JSON.stringify({
          timestamp: Date.now(),
          manualLogout: false
        }))
      }
    } catch (error) {
      console.error('[Storage] Error setting item:', error)
    }
  },
  
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.removeItem(key)
      if (key === SESSION_STORAGE_KEY) {
        window.localStorage.removeItem(CUSTOM_SESSION_KEY)
      }
    } catch (error) {
      console.error('[Storage] Error removing item:', error)
    }
  }
}

// Create Supabase client with conservative configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false, // Disable auto-refresh to prevent continuous requests
    persistSession: true,
    detectSessionInUrl: true,
    storage: customStorage,
    storageKey: SESSION_STORAGE_KEY,
    // Much longer refresh threshold - only refresh when token has 1 hour left
    refreshThreshold: 60 * 60, // 1 hour in seconds
  },
  global: {
    headers: {
      'X-Client-Info': 'browser-extension'
    }
  },
  // Add request throttling
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2 // Limit realtime events
    }
  }
})

// Request throttling for auth operations
let lastAuthRequest = 0
const AUTH_THROTTLE_MS = 2000 // 2 seconds between auth requests

const throttleAuthRequest = () => {
  const now = Date.now()
  if (now - lastAuthRequest < AUTH_THROTTLE_MS) {
    throw new Error('Auth request throttled - please wait')
  }
  lastAuthRequest = now
}

// ===============================
// APPKIT TOKEN MANAGEMENT
// ===============================

export interface AppKitTokenResponse {
  token: string
  user?: any
  expires_at?: string
  [key: string]: any
}

export const appKitHelpers = {
  /**
   * Get AppKit token using Supabase access token
   */
  getAppKitToken: async (supabaseAccessToken: string): Promise<{ token: AppKitTokenResponse | null; error: string | null }> => {
    try {
      console.log('[AppKit] Requesting token from server...')
      
     const response = await fetch(APPKIT_API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAccessToken}`,
    'Content-Type': 'application/json',
    'X-Client-Info': 'browser-extension'
  },
  body: JSON.stringify({}) // Add empty JSON body
})
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[AppKit] Token request failed:', response.status, errorText)
        return { 
          token: null, 
          error: `AppKit token request failed: ${response.status} ${response.statusText}` 
        }
      }
      
      const tokenData = await response.json()
      console.log('[AppKit] Token received successfully')
      
      // Store the AppKit token
      appKitHelpers.storeAppKitToken(tokenData)
      
      return { token: tokenData, error: null }
    } catch (error) {
      console.error('[AppKit] Error getting token:', error)
      return { 
        token: null, 
        error: error instanceof Error ? error.message : 'Failed to get AppKit token' 
      }
    }
  },
  
  /**
   * Store AppKit token in localStorage
   */
  storeAppKitToken: (tokenData: AppKitTokenResponse) => {
    try {
      const tokenInfo = {
        ...tokenData,
        timestamp: Date.now(),
        storedAt: new Date().toISOString()
      }
      
      window.localStorage.setItem(APPKIT_TOKEN_KEY, JSON.stringify(tokenInfo))
      console.log('[AppKit] Token stored successfully')
    } catch (error) {
      console.error('[AppKit] Error storing token:', error)
    }
  },
  
  /**
   * Get stored AppKit token
   */
  getStoredAppKitToken: (): AppKitTokenResponse | null => {
    try {
      const stored = window.localStorage.getItem(APPKIT_TOKEN_KEY)
      if (!stored) return null
      
      const tokenInfo = JSON.parse(stored)
      
      // Check if token has an expiration time
      if (tokenInfo.expires_at) {
        const expiresAt = new Date(tokenInfo.expires_at)
        if (expiresAt <= new Date()) {
          console.log('[AppKit] Stored token has expired')
          appKitHelpers.clearAppKitToken()
          return null
        }
      }
      
      return tokenInfo
    } catch (error) {
      console.error('[AppKit] Error getting stored token:', error)
      return null
    }
  },
  
  /**
   * Clear AppKit token
   */
  clearAppKitToken: () => {
    try {
      window.localStorage.removeItem(APPKIT_TOKEN_KEY)
      console.log('[AppKit] Token cleared')
    } catch (error) {
      console.error('[AppKit] Error clearing token:', error)
    }
  },
  
  /**
   * Check if AppKit token is valid
   */
  isAppKitTokenValid: (): boolean => {
    const token = appKitHelpers.getStoredAppKitToken()
    return token !== null && !!token.token
  },
  
  /**
   * Get AppKit authorization header
   */
  getAppKitAuthHeader: (): { Authorization: string } | null => {
    const tokenData = appKitHelpers.getStoredAppKitToken()
    if (!tokenData || !tokenData.token) {
      return null
    }
    
    return {
      Authorization: `Bearer ${tokenData.token}`
    }
  }
}

// Session management utilities
export const sessionManager = {
  /**
   * Mark session for manual logout
   */
  markManualLogout: () => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.setItem(CUSTOM_SESSION_KEY, JSON.stringify({
        timestamp: Date.now(),
        manualLogout: true
      }))
      
      // Also clear AppKit token on logout
      appKitHelpers.clearAppKitToken()
    } catch (error) {
      console.error('[SessionManager] Error marking manual logout:', error)
    }
  },
  
  /**
   * Clear all session data
   */
  clearSessionData: () => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY)
      window.localStorage.removeItem(CUSTOM_SESSION_KEY)
      
      // Clear AppKit token
      appKitHelpers.clearAppKitToken()
      
      // Clear any other auth-related data
      const keysToRemove = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key && key.startsWith('supabase.')) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => window.localStorage.removeItem(key))
    } catch (error) {
      console.error('[SessionManager] Error clearing session data:', error)
    }
  },
  
  /**
   * Check if session is still valid
   */
  isSessionValid: () => {
    if (typeof window === 'undefined') return false
    
    try {
      const customData = window.localStorage.getItem(CUSTOM_SESSION_KEY)
      if (!customData) return false
      
      const { timestamp, manualLogout } = JSON.parse(customData)
      
      if (manualLogout) return false
      
      const now = Date.now()
      return (now - timestamp) <= ONE_WEEK_MS
    } catch (error) {
      console.error('[SessionManager] Error checking session validity:', error)
      return false
    }
  },
  
  /**
   * Refresh session timestamp (throttled)
   */
  refreshSessionTimestamp: () => {
    if (typeof window === 'undefined') return
    
    // Throttle timestamp updates to once per minute
    const now = Date.now()
    if (now - lastStorageOperation < 60000) {
      return
    }
    
    try {
      const customData = window.localStorage.getItem(CUSTOM_SESSION_KEY)
      if (customData) {
        const data = JSON.parse(customData)
        if (!data.manualLogout) {
          window.localStorage.setItem(CUSTOM_SESSION_KEY, JSON.stringify({
            timestamp: Date.now(),
            manualLogout: false
          }))
          lastStorageOperation = now
        }
      }
    } catch (error) {
      console.error('[SessionManager] Error refreshing session timestamp:', error)
    }
  },
  
  /**
   * Get session age in days
   */
  getSessionAge: () => {
    if (typeof window === 'undefined') return 0
    
    try {
      const customData = window.localStorage.getItem(CUSTOM_SESSION_KEY)
      if (!customData) return 0
      
      const { timestamp } = JSON.parse(customData)
      const ageMs = Date.now() - timestamp
      return Math.floor(ageMs / (24 * 60 * 60 * 1000))
    } catch (error) {
      console.error('[SessionManager] Error getting session age:', error)
      return 0
    }
  }
}

// Auth types
export interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
  email_confirmed_at?: string
  created_at: string
  updated_at: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: User
}

export interface AuthError {
  message: string
  status?: number
}

export interface Profile {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  company?: string
  website?: string
  bio?: string
  created_at: string
  updated_at: string
}

// Enhanced auth helper functions with AppKit integration
export const authHelpers = {
  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, metadata?: any) => {
    throttleAuthRequest()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    // Initialize session tracking if successful
    if (data.session) {
      sessionManager.refreshSessionTimestamp()
      
      // Get AppKit token after successful signup
      if (data.session.access_token) {
        console.log('[Auth] Getting AppKit token after signup...')
        const { token: appKitToken, error: appKitError } = await appKitHelpers.getAppKitToken(data.session.access_token)
        
        if (appKitError) {
          console.error('[Auth] Failed to get AppKit token after signup:', appKitError)
          // Don't fail the signup, just log the error
        } else {
          console.log('[Auth] AppKit token obtained after signup')
        }
      }
    }
    
    return { user: data.user, session: data.session, error }
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    throttleAuthRequest()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    // Initialize session tracking if successful
    if (data.session) {
      sessionManager.refreshSessionTimestamp()
      
      // Get AppKit token after successful login
      if (data.session.access_token) {
        console.log('[Auth] Getting AppKit token after login...')
        const { token: appKitToken, error: appKitError } = await appKitHelpers.getAppKitToken(data.session.access_token)
        
        if (appKitError) {
          console.error('[Auth] Failed to get AppKit token after login:', appKitError)
          // Don't fail the login, just log the error
        } else {
          console.log('[Auth] AppKit token obtained after login')
        }
      }
    }
    
    return { user: data.user, session: data.session, error }
  },

  /**
   * Sign out - marks as manual logout
   */
  signOut: async () => {
    // Mark as manual logout before signing out
    sessionManager.markManualLogout()
    
    const { error } = await supabase.auth.signOut()
    
    // Clear all session data (including AppKit token)
    sessionManager.clearSessionData()
    
    return { error }
  },

  /**
   * Get current session with validity check (throttled)
   */
  getSession: async () => {
    // Check our custom session validity first
    if (!sessionManager.isSessionValid()) {
      sessionManager.clearSessionData()
      return { session: null, error: null }
    }
    
    // Throttle session requests
    const now = Date.now()
    if (now - lastAuthRequest < 5000) { // 5 second throttle for getSession
      console.log('[Auth] Session request throttled')
      return { session: null, error: null }
    }
    lastAuthRequest = now
    
    const { data, error } = await supabase.auth.getSession()
    
    // Refresh timestamp on successful session retrieval
    if (data.session) {
      sessionManager.refreshSessionTimestamp()
      
      // Check if we need to get AppKit token
      if (data.session.access_token && !appKitHelpers.isAppKitTokenValid()) {
        console.log('[Auth] Getting AppKit token for existing session...')
        const { token: appKitToken, error: appKitError } = await appKitHelpers.getAppKitToken(data.session.access_token)
        
        if (appKitError) {
          console.error('[Auth] Failed to get AppKit token for existing session:', appKitError)
        } else {
          console.log('[Auth] AppKit token obtained for existing session')
        }
      }
    }
    
    return { session: data.session, error }
  },

  /**
   * Get current user (throttled)
   */
  getUser: async () => {
    throttleAuthRequest()
    
    const { data, error } = await supabase.auth.getUser()
    
    // Refresh timestamp on successful user retrieval
    if (data.user) {
      sessionManager.refreshSessionTimestamp()
    }
    
    return { user: data.user, error }
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string) => {
    throttleAuthRequest()
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  /**
   * Update user metadata
   */
  updateUser: async (updates: any) => {
    throttleAuthRequest()
    
    const { data, error } = await supabase.auth.updateUser(updates)
    
    // Refresh timestamp on successful update
    if (data.user) {
      sessionManager.refreshSessionTimestamp()
    }
    
    return { user: data.user, error }
  },
  
  /**
   * Refresh current session manually (heavily throttled)
   */
  refreshSession: async () => {
    // Heavy throttling for manual refresh - only once every 10 minutes
    const now = Date.now()
    if (now - lastAuthRequest < 10 * 60 * 1000) {
      console.log('[Auth] Session refresh throttled - too frequent')
      return { session: null, error: { message: 'Refresh throttled' } }
    }
    lastAuthRequest = now
    
    console.log('[Auth] Performing manual session refresh')
    const { data, error } = await supabase.auth.refreshSession()
    
    if (data.session) {
      sessionManager.refreshSessionTimestamp()
      
      // Get new AppKit token with refreshed session
      if (data.session.access_token) {
        console.log('[Auth] Getting AppKit token after session refresh...')
        const { token: appKitToken, error: appKitError } = await appKitHelpers.getAppKitToken(data.session.access_token)
        
        if (appKitError) {
          console.error('[Auth] Failed to get AppKit token after refresh:', appKitError)
        } else {
          console.log('[Auth] AppKit token obtained after session refresh')
        }
      }
    }
    
    return { session: data.session, error }
  }
}

// Profile helper functions
export const profileHelpers = {
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { profile: data, error }
  },

  upsertProfile: async (profile: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single()
    return { profile: data, error }
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()
    return { profile: data, error }
  }
}

// Real-time subscription helpers (with throttling)
export const subscriptionHelpers = {
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    console.log('[Auth] Setting up auth state change listener')
    
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state change event:', event)
      
      // Refresh timestamp on auth state changes (except SIGNED_OUT)
      if (event !== 'SIGNED_OUT' && session) {
        sessionManager.refreshSessionTimestamp()
        
        // Get AppKit token for auth state changes
        if (session.access_token && !appKitHelpers.isAppKitTokenValid()) {
          console.log('[Auth] Getting AppKit token for auth state change...')
          const { token: appKitToken, error: appKitError } = await appKitHelpers.getAppKitToken(session.access_token)
          
          if (appKitError) {
            console.error('[Auth] Failed to get AppKit token for auth state change:', appKitError)
          } else {
            console.log('[Auth] AppKit token obtained for auth state change')
          }
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear AppKit token on sign out
        appKitHelpers.clearAppKitToken()
      }
      
      // Throttle callback execution
      setTimeout(() => {
        callback(event, session)
      }, 100)
    })
  },

  onProfileChange: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('profile-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }
}

export default supabase