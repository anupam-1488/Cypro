// shared/hooks/useAuth.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  authHelpers, 
  profileHelpers, 
  subscriptionHelpers, 
  sessionManager,
  appKitHelpers,
  type User, 
  type Session, 
  type Profile,
  type AppKitTokenResponse
} from '../services/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface LoadingState {
  signIn: boolean
  signUp: boolean
  signOut: boolean
  updateProfile: boolean
  resetPassword: boolean
  refreshAppKitToken: boolean
}

interface OperationResult {
  success: boolean
  error?: string
  data?: any
}

interface SessionInfo {
  isValid: boolean
  ageInDays: number
  expiresIn?: number
}

interface AppKitInfo {
  hasToken: boolean
  token: AppKitTokenResponse | null
  isValid: boolean
  storedAt?: string
}

// Global state management to prevent multiple instances
let authHookInstances = 0
let globalRefreshTimer: NodeJS.Timeout | null = null
let isInitializing = false
let globalAuthState: AuthState | null = null
let globalAuthSubscription: any = null

// Prevent multiple rapid initializations
const initializationCooldown = 2000 // 2 seconds
let lastInitialization = 0

export function useAuth() {
  // ===============================
  // STATE MANAGEMENT
  // ===============================

  const [authState, setAuthState] = useState<AuthState>(() => {
    // Use global state if available
    return globalAuthState || {
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false
    }
  })

  const [loading, setLoading] = useState<LoadingState>({
    signIn: false,
    signUp: false,
    signOut: false,
    updateProfile: false,
    resetPassword: false,
    refreshAppKitToken: false
  })

  const [initialized, setInitialized] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    isValid: false,
    ageInDays: 0
  })

  const [appKitInfo, setAppKitInfo] = useState<AppKitInfo>({
    hasToken: false,
    token: null,
    isValid: false
  })

  // Refs for cleanup and timers
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const isRequestingRef = useRef<boolean>(false)
  const instanceIdRef = useRef<number>(0)
  const mountedRef = useRef<boolean>(true)

  // ===============================
  // INSTANCE MANAGEMENT
  // ===============================

  useEffect(() => {
    // Prevent rapid re-initialization
    const now = Date.now()
    if (now - lastInitialization < initializationCooldown) {
      console.log(`[Auth] Initialization skipped - too soon (${now - lastInitialization}ms ago)`)
      return
    }

    // Assign unique instance ID
    instanceIdRef.current = ++authHookInstances
    console.log(`[Auth] Hook instance ${instanceIdRef.current} created, total instances: ${authHookInstances}`)

    // Sync with global state if available
    if (globalAuthState) {
      setAuthState(globalAuthState)
      setInitialized(true)
    }

    return () => {
      authHookInstances--
      console.log(`[Auth] Hook instance ${instanceIdRef.current} destroyed, remaining instances: ${authHookInstances}`)
      mountedRef.current = false
    }
  }, [])

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  /**
   * Update loading state for a specific operation
   */
  const setLoadingState = useCallback((operation: keyof LoadingState, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [operation]: isLoading }))
  }, [])

  /**
   * Create a standardized operation result
   */
  const createResult = (success: boolean, data?: any, error?: string): OperationResult => ({
    success,
    ...(data && { data }),
    ...(error && { error })
  })

  /**
   * Update session info
   */
  const updateSessionInfo = useCallback(() => {
    const isValid = sessionManager.isSessionValid()
    const ageInDays = sessionManager.getSessionAge()
    
    setSessionInfo({
      isValid,
      ageInDays,
      expiresIn: authState.session?.expires_in
    })
  }, [authState.session])

  /**
   * Update AppKit info
   */
  const updateAppKitInfo = useCallback(() => {
    const token = appKitHelpers.getStoredAppKitToken()
    const isValid = appKitHelpers.isAppKitTokenValid()
    
    setAppKitInfo({
      hasToken: !!token,
      token,
      isValid,
      storedAt: token?.storedAt
    })
  }, [])

  /**
   * Track user activity with throttling
   */
  const trackUserActivity = useCallback(() => {
    const now = Date.now()
    
    // Throttle activity tracking to once per minute
    if (now - lastActivityRef.current < 60000) {
      return
    }
    
    lastActivityRef.current = now
    
    // Refresh session timestamp if user is authenticated
    if (authState.isAuthenticated) {
      sessionManager.refreshSessionTimestamp()
      updateSessionInfo()
    }
    
    // Clear existing timer
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current)
    }
    
    // Set new timer for next activity check (15 minutes)
    activityTimerRef.current = setTimeout(() => {
      if (authState.isAuthenticated) {
        trackUserActivity()
      }
    }, 15 * 60 * 1000) // 15 minutes
  }, [authState.isAuthenticated, updateSessionInfo])

  /**
   * Load user profile after authentication
   */
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { profile, error } = await profileHelpers.getProfile(userId)
      
      if (error) {
        // Check if it's a 403 error (permissions issue)
        if (error.code === 'PGRST116' || error.message?.includes('403')) {
          console.log('[Auth] Profile access denied - user may not have permissions')
          return
        }
        
        if (error.details?.includes('0 rows')) {
          console.log('[Auth] Profile not found - this is normal for new users')
          return
        }
        
        console.error('[Auth] Error loading profile:', error)
        return
      }
      
      if (profile) {
        setAuthState(prev => {
          const newState = { ...prev, profile }
          // Update global state
          globalAuthState = newState
          return newState
        })
      }
    } catch (error) {
      console.error('[Auth] Error loading profile:', error)
    }
  }, [])

  /**
   * Update auth state with session data
   */
  const updateAuthState = useCallback(async (session: Session | null) => {
    if (!mountedRef.current) return

    const newAuthState = session?.user ? {
      user: session.user,
      session,
      profile: authState.profile, // Keep existing profile
      isAuthenticated: true,
      isLoading: false
    } : {
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false
    }

    // Update local state
    setAuthState(newAuthState)
    
    // Update global state
    globalAuthState = newAuthState

    if (session?.user) {
      // Track user activity
      trackUserActivity()
      
      // Load user profile
      await loadUserProfile(session.user.id)
      
      // Update AppKit info
      updateAppKitInfo()
    } else {
      // Clear activity tracking
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current)
        activityTimerRef.current = null
      }
      
      // Update AppKit info (should show no token)
      updateAppKitInfo()
    }
  }, [authState.profile, loadUserProfile, trackUserActivity, updateAppKitInfo])

  /**
   * Global session refresh - only run from first instance
   */
  const setupGlobalSessionRefresh = useCallback(() => {
    // Only the first instance should set up the global timer
    if (instanceIdRef.current !== 1) {
      return
    }

    // Clear existing timer
    if (globalRefreshTimer) {
      clearInterval(globalRefreshTimer)
    }
    
    // Set up periodic refresh every 2 hours if any instance is authenticated
    globalRefreshTimer = setInterval(async () => {
      // Only refresh if we have authenticated users and not already requesting
      if (authHookInstances > 0 && !isRequestingRef.current) {
        try {
          isRequestingRef.current = true
          console.log('[Auth] Performing global session refresh')
          
          const { session, error } = await authHelpers.refreshSession()
          
          if (error) {
            console.error('[Auth] Global session refresh error:', error)
          } else if (session) {
            console.log('[Auth] Global session refreshed successfully')
          }
        } catch (error) {
          console.error('[Auth] Global refresh error:', error)
        } finally {
          isRequestingRef.current = false
        }
      }
    }, 2 * 60 * 60 * 1000) // Every 2 hours
    
    console.log('[Auth] Global session refresh timer set up')
  }, [])

  // ===============================
  // AUTH OPERATIONS
  // ===============================

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string }
  ): Promise<OperationResult> => {
    setLoadingState('signUp', true)
    
    try {
      const { user, session, error } = await authHelpers.signUp(email, password, metadata)
      
      if (error) {
        return createResult(false, null, error.message)
      }
      
      if (user && session) {
        await updateAuthState(session)
        return createResult(true, { user, session }, 'Account created successfully! Check your email for verification.')
      } else {
        return createResult(true, null, 'Account created! Check your email for verification.')
      }
    } catch (error) {
      console.error('[Auth] Sign up error:', error)
      return createResult(false, null, 'Failed to create account')
    } finally {
      setLoadingState('signUp', false)
    }
  }, [updateAuthState])

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string): Promise<OperationResult> => {
    setLoadingState('signIn', true)
    
    try {
      const { user, session, error } = await authHelpers.signIn(email, password)
      
      if (error) {
        return createResult(false, null, error.message)
      }
      
      if (user && session) {
        await updateAuthState(session)
        return createResult(true, { user, session }, 'Signed in successfully!')
      }
      
      return createResult(false, null, 'Invalid credentials')
    } catch (error) {
      console.error('[Auth] Sign in error:', error)
      return createResult(false, null, 'Failed to sign in')
    } finally {
      setLoadingState('signIn', false)
    }
  }, [updateAuthState])

  /**
   * Sign out (manual logout)
   */
  const signOut = useCallback(async (): Promise<OperationResult> => {
    setLoadingState('signOut', true)
    
    try {
      const { error } = await authHelpers.signOut()
      
      if (error) {
        return createResult(false, null, error.message)
      }
      
      await updateAuthState(null)
      return createResult(true, null, 'Signed out successfully!')
    } catch (error) {
      console.error('[Auth] Sign out error:', error)
      return createResult(false, null, 'Failed to sign out')
    } finally {
      setLoadingState('signOut', false)
    }
  }, [updateAuthState])

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (email: string): Promise<OperationResult> => {
    setLoadingState('resetPassword', true)
    
    try {
      const { error } = await authHelpers.resetPassword(email)
      
      if (error) {
        return createResult(false, null, error.message)
      }
      
      return createResult(true, null, 'Password reset email sent!')
    } catch (error) {
      console.error('[Auth] Reset password error:', error)
      return createResult(false, null, 'Failed to send reset email')
    } finally {
      setLoadingState('resetPassword', false)
    }
  }, [])

  // ===============================
  // APPKIT OPERATIONS
  // ===============================

  /**
   * Manually refresh AppKit token
   */
  const refreshAppKitToken = useCallback(async (): Promise<OperationResult> => {
    if (!authState.session?.access_token) {
      return createResult(false, null, 'No active session to refresh AppKit token')
    }

    setLoadingState('refreshAppKitToken', true)
    
    try {
      const { token, error } = await appKitHelpers.getAppKitToken(authState.session.access_token)
      
      if (error) {
        return createResult(false, null, error)
      }
      
      updateAppKitInfo()
      return createResult(true, { token }, 'AppKit token refreshed successfully!')
    } catch (error) {
      console.error('[Auth] Refresh AppKit token error:', error)
      return createResult(false, null, 'Failed to refresh AppKit token')
    } finally {
      setLoadingState('refreshAppKitToken', false)
    }
  }, [authState.session, updateAppKitInfo])

  /**
   * Get AppKit authorization headers for API calls
   */
  const getAppKitHeaders = useCallback(() => {
    return appKitHelpers.getAppKitAuthHeader()
  }, [])

  /**
   * Check if AppKit token is available and valid
   */
  const isAppKitReady = useCallback(() => {
    return appKitHelpers.isAppKitTokenValid()
  }, [])

  // ===============================
  // PROFILE OPERATIONS
  // ===============================

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<OperationResult> => {
    if (!authState.user) {
      return createResult(false, null, 'Not authenticated')
    }

    setLoadingState('updateProfile', true)
    
    try {
      const { profile, error } = await profileHelpers.updateProfile(authState.user.id, updates)
      
      if (error) {
        return createResult(false, null, error.message)
      }
      
      if (profile) {
        setAuthState(prev => ({ ...prev, profile }))
        trackUserActivity()
        return createResult(true, { profile }, 'Profile updated successfully!')
      }
      
      return createResult(false, null, 'Failed to update profile')
    } catch (error) {
      console.error('[Auth] Update profile error:', error)
      return createResult(false, null, 'Failed to update profile')
    } finally {
      setLoadingState('updateProfile', false)
    }
  }, [authState.user, trackUserActivity])

  /**
   * Update user account info
   */
  const updateUser = useCallback(async (updates: {
    email?: string
    password?: string
    data?: any
  }): Promise<OperationResult> => {
    try {
      const { user, error } = await authHelpers.updateUser(updates)
      
      if (error) {
        return createResult(false, null, error.message)
      }
      
      if (user) {
        setAuthState(prev => ({ ...prev, user }))
        trackUserActivity()
        return createResult(true, { user }, 'Account updated successfully!')
      }
      
      return createResult(false, null, 'Failed to update account')
    } catch (error) {
      console.error('[Auth] Update user error:', error)
      return createResult(false, null, 'Failed to update account')
    }
  }, [trackUserActivity])

  /**
   * Manually refresh session
   */
  const refreshSession = useCallback(async (): Promise<OperationResult> => {
    if (isRequestingRef.current) {
      return createResult(false, null, 'Refresh already in progress')
    }

    try {
      isRequestingRef.current = true
      const { session, error } = await authHelpers.refreshSession()
      
      if (error) {
        return createResult(false, null, error.message)
      }
      
      if (session) {
        setAuthState(prev => ({ ...prev, session }))
        trackUserActivity()
        updateSessionInfo()
        updateAppKitInfo() // Update AppKit info after session refresh
        return createResult(true, { session }, 'Session refreshed successfully!')
      }
      
      return createResult(false, null, 'Failed to refresh session')
    } catch (error) {
      console.error('[Auth] Manual refresh error:', error)
      return createResult(false, null, 'Failed to refresh session')
    } finally {
      isRequestingRef.current = false
    }
  }, [trackUserActivity, updateSessionInfo, updateAppKitInfo])

  // ===============================
  // INITIALIZATION
  // ===============================

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    // Skip if already initializing or recently initialized
    const now = Date.now()
    if (isInitializing || (now - lastInitialization < initializationCooldown)) {
      console.log(`[Auth] Skipping initialization - too frequent`)
      return
    }

    // Skip if we already have global state and this isn't the first instance
    if (globalAuthState && instanceIdRef.current !== 1) {
      console.log(`[Auth] Using existing global state for instance ${instanceIdRef.current}`)
      setAuthState(globalAuthState)
      setInitialized(true)
      updateAppKitInfo()
      return
    }

    isInitializing = true
    lastInitialization = now

    const initializeAuth = async () => {
      try {
        console.log(`[Auth] Initializing auth for instance ${instanceIdRef.current}`)
        
        // Only get session if we don't have global state
        if (!globalAuthState) {
          const { session } = await authHelpers.getSession()
          
          if (mountedRef.current) {
            await updateAuthState(session)
          }
        }
        
        if (mountedRef.current) {
          setInitialized(true)
          updateAppKitInfo()
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error)
        if (mountedRef.current) {
          setAuthState(prev => ({ ...prev, isLoading: false }))
          setInitialized(true)
          updateAppKitInfo()
        }
      } finally {
        isInitializing = false
      }
    }

    initializeAuth()

    // Set up auth state listener ONLY for the first instance
    if (instanceIdRef.current === 1 && !globalAuthSubscription) {
      console.log('[Auth] Setting up global auth state listener')
      const { data } = subscriptionHelpers.onAuthStateChange(
        async (event, session) => {
          console.log('[Auth] Auth state changed:', event)
          
          // Update all instances through global state
          if (globalAuthState || event === 'SIGNED_OUT') {
            await updateAuthState(session)
          }
        }
      )
      globalAuthSubscription = data.subscription
    }

    return () => {
      mountedRef.current = false
      
      // Clean up global subscription only when all instances are gone
      if (authHookInstances === 0 && globalAuthSubscription) {
        globalAuthSubscription.unsubscribe()
        globalAuthSubscription = null
        globalAuthState = null
      }
    }
  }, [updateAuthState, updateAppKitInfo])

  /**
   * Set up global session refresh (only first instance)
   */
  useEffect(() => {
    if (instanceIdRef.current === 1) {
      setupGlobalSessionRefresh()
    }
    
    return () => {
      if (instanceIdRef.current === 1 && globalRefreshTimer) {
        clearInterval(globalRefreshTimer)
        globalRefreshTimer = null
      }
    }
  }, [setupGlobalSessionRefresh])

  /**
   * Update session and AppKit info when auth state changes
   */
  useEffect(() => {
    updateSessionInfo()
    updateAppKitInfo()
  }, [authState.isAuthenticated, updateSessionInfo, updateAppKitInfo])

  /**
   * Set up activity listeners (throttled)
   */
  useEffect(() => {
    if (!authState.isAuthenticated) return

    const activityEvents = ['mousedown', 'keypress', 'click']
    let lastActivity = 0

    const handleActivity = () => {
      const now = Date.now()
      // Only track activity once per minute
      if (now - lastActivity > 60000) {
        lastActivity = now
        trackUserActivity()
      }
    }

    // Add throttled event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      // Remove event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      
      // Clear activity timer
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current)
        activityTimerRef.current = null
      }
    }
  }, [authState.isAuthenticated, trackUserActivity])

  // ===============================
  // COMPUTED PROPERTIES
  // ===============================

  const computedProperties = {
    isInitialized: initialized,
    hasProfile: !!authState.profile,
    userEmail: authState.user?.email || '',
    userName: authState.profile?.full_name || authState.user?.user_metadata?.full_name || '',
    userAvatar: authState.profile?.avatar_url || authState.user?.user_metadata?.avatar_url || '',
    isEmailVerified: authState.user?.email_confirmed_at != null,
    sessionInfo,
    appKitInfo,
    
    // Session status helpers
    isSessionExpiringSoon: sessionInfo.ageInDays >= 6,
    sessionDaysRemaining: Math.max(0, 7 - sessionInfo.ageInDays),
    
    // AppKit status helpers
    hasAppKitToken: appKitInfo.hasToken,
    isAppKitTokenValid: appKitInfo.isValid,
    appKitToken: appKitInfo.token?.token,
    appKitTokenStoredAt: appKitInfo.storedAt,
  }

  // ===============================
  // RETURN HOOK INTERFACE
  // ===============================

  return {
    // Auth State
    ...authState,
    loading,
    
    // Auth Operations
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshSession,
    
    // Profile Operations
    updateProfile,
    updateUser,
    
    // AppKit Operations
    refreshAppKitToken,
    getAppKitHeaders,
    isAppKitReady,
    
    // Session Management
    trackUserActivity,
    
    // Computed Properties
    ...computedProperties,
    
    // Debug info
    instanceId: instanceIdRef.current,
    totalInstances: authHookInstances,
  }
}