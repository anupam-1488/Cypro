// shared/services/appKitApi.ts
import { appKitHelpers } from './supabase'

// Base API configuration
const APPKIT_BASE_URL = 'https://cyeproai.fly.dev/api'

// API Error class
export class AppKitApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'AppKitApiError'
  }
}

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Request options interface
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  requiresAuth?: boolean
}

/**
 * Make authenticated API calls to AppKit server
 */
export const appKitApi = {
  /**
   * Generic request function with AppKit token authentication
   */
  request: async <T = any>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> => {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true
    } = options

    try {
      // Prepare headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Client-Info': 'browser-extension',
        ...headers
      }

      // Add AppKit authentication if required
      if (requiresAuth) {
        const authHeader = appKitHelpers.getAppKitAuthHeader()
        
        if (!authHeader) {
          throw new AppKitApiError('No valid AppKit token available', 401)
        }
        
        Object.assign(requestHeaders, authHeader)
      }

      // Make the request
      const url = `${APPKIT_BASE_URL}${endpoint}`
      console.log(`[AppKit API] ${method} ${url}`)

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined
      })

      // Parse response
      let responseData: any
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      // Handle non-200 responses
      if (!response.ok) {
        console.error(`[AppKit API] Request failed:`, response.status, responseData)
        
        throw new AppKitApiError(
          responseData?.message || responseData?.error || `Request failed: ${response.statusText}`,
          response.status,
          responseData
        )
      }

      console.log(`[AppKit API] Request successful:`, responseData)

      // Return standardized response
      return {
        success: true,
        data: responseData,
        message: responseData?.message
      }

    } catch (error) {
      console.error('[AppKit API] Request error:', error)

      if (error instanceof AppKitApiError) {
        return {
          success: false,
          error: error.message,
          data: error.response
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown API error'
      }
    }
  },

  // ===============================
  // CONVENIENCE METHODS
  // ===============================

  /**
   * GET request
   */
  get: <T = any>(endpoint: string, headers?: Record<string, string>) => 
    appKitApi.request<T>(endpoint, { method: 'GET', headers }),

  /**
   * POST request
   */
  post: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    appKitApi.request<T>(endpoint, { method: 'POST', body, headers }),

  /**
   * PUT request
   */
  put: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    appKitApi.request<T>(endpoint, { method: 'PUT', body, headers }),

  /**
   * DELETE request
   */
  delete: <T = any>(endpoint: string, headers?: Record<string, string>) => 
    appKitApi.request<T>(endpoint, { method: 'DELETE', headers }),

  /**
   * PATCH request
   */
  patch: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    appKitApi.request<T>(endpoint, { method: 'PATCH', body, headers }),

  // ===============================
  // SPECIFIC API ENDPOINTS
  // ===============================

  /**
   * Get user profile from AppKit server
   */
  getUserProfile: async () => {
    return appKitApi.get('/user/profile')
  },

  /**
   * Update user profile on AppKit server
   */
  updateUserProfile: async (profileData: any) => {
    return appKitApi.put('/user/profile', profileData)
  },

  /**
   * Get customer templates
   */
  getCustomerTemplates: async () => {
    return appKitApi.get('/customer/templates')
  },

  /**
   * Create new customer template
   */
  createCustomerTemplate: async (templateData: any) => {
    return appKitApi.post('/customer/templates', templateData)
  },

  /**
   * Update customer template
   */
  updateCustomerTemplate: async (templateId: string, templateData: any) => {
    return appKitApi.put(`/customer/templates/${templateId}`, templateData)
  },

  /**
   * Delete customer template
   */
  deleteCustomerTemplate: async (templateId: string) => {
    return appKitApi.delete(`/customer/templates/${templateId}`)
  },

  /**
   * Upload file or data
   */
  uploadData: async (data: any, type: string = 'general') => {
    return appKitApi.post('/upload', { data, type })
  },

  /**
   * Get application settings
   */
  getSettings: async () => {
    return appKitApi.get('/settings')
  },

  /**
   * Update application settings
   */
  updateSettings: async (settings: any) => {
    return appKitApi.put('/settings', settings)
  },

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Check if AppKit API is accessible
   */
  healthCheck: async () => {
    try {
      const response = await appKitApi.request('/health', { requiresAuth: false })
      return response.success
    } catch (error) {
      console.error('[AppKit API] Health check failed:', error)
      return false
    }
  },

  /**
   * Test authentication with current token
   */
  testAuth: async () => {
    try {
      const response = await appKitApi.get('/auth/test')
      return response.success
    } catch (error) {
      console.error('[AppKit API] Auth test failed:', error)
      return false
    }
  },

  /**
   * Get API status and user info
   */
  getStatus: async () => {
    return appKitApi.get('/status')
  }
}

// ===============================
// REACT HOOK FOR API CALLS
// ===============================

import { useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'

interface ApiCallState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Custom hook for making AppKit API calls
 */
export function useAppKitApi<T = any>(
  endpoint?: string,
  options?: RequestOptions
) {
  const { isAppKitReady, refreshAppKitToken } = useAuth()
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const call = useCallback(async (
    callEndpoint?: string,
    callOptions?: RequestOptions
  ): Promise<ApiResponse<T>> => {
    const finalEndpoint = callEndpoint || endpoint
    const finalOptions = { ...options, ...callOptions }

    if (!finalEndpoint) {
      throw new Error('Endpoint is required')
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Check if AppKit token is ready
      if (finalOptions.requiresAuth !== false && !isAppKitReady()) {
        console.log('[AppKit Hook] Token not ready, attempting refresh...')
        const refreshResult = await refreshAppKitToken()
        
        if (!refreshResult.success) {
          throw new Error('Failed to get valid AppKit token')
        }
      }

      const response = await appKitApi.request<T>(finalEndpoint, finalOptions)

      setState({
        data: response.data || null,
        loading: false,
        error: response.success ? null : (response.error || 'Request failed')
      })

      return response

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      setState({
        data: null,
        loading: false,
        error: errorMessage
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }, [endpoint, options, isAppKitReady, refreshAppKitToken])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    ...state,
    call,
    reset,
    isReady: isAppKitReady()
  }
}

export default appKitApi