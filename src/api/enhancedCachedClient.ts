/**
 * Enhanced Cached API Client
 * Provides automatic caching with context awareness and cache invalidation
 */

import { secureCache } from '@/utils/secureCache';
import { getBaseUrl, getBaseUrl2, getApiHeaders } from '@/contexts/utils/auth.api';

export interface EnhancedCacheOptions {
  ttl?: number; // Time to live in minutes
  forceRefresh?: boolean;
  useStaleWhileRevalidate?: boolean;
  userId?: string;
  instituteId?: string;
  classId?: string;
  subjectId?: string;
  role?: string;
}

class EnhancedCachedApiClient {
  private baseUrl: string;
  private useBaseUrl2: boolean = false;
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly PENDING_REQUEST_TTL = 30000; // 30 seconds
  private requestCooldown = new Map<string, number>();
  private readonly COOLDOWN_PERIOD = 1000; // 1 second

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  private generateRequestKey(endpoint: string, params?: Record<string, any>): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private isInCooldown(requestKey: string): boolean {
    const lastRequestTime = this.requestCooldown.get(requestKey);
    if (!lastRequestTime) return false;
    
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    return timeSinceLastRequest < this.COOLDOWN_PERIOD;
  }

  private setCooldown(requestKey: string): void {
    this.requestCooldown.set(requestKey, Date.now());
    // Auto-cleanup after cooldown
    setTimeout(() => {
      this.requestCooldown.delete(requestKey);
    }, this.COOLDOWN_PERIOD + 1000);
  }

  setUseBaseUrl2(use: boolean): void {
    this.useBaseUrl2 = use;
    this.baseUrl = use ? getBaseUrl2() : getBaseUrl();
    console.log(`📡 Switched to ${use ? 'baseUrl2' : 'baseUrl'}:`, this.baseUrl);
  }

  private getHeaders(): Record<string, string> {
    const headers = getApiHeaders();
    
    if (this.useBaseUrl2) {
      const orgToken = localStorage.getItem('org_access_token');
      if (orgToken) {
        headers['Authorization'] = `Bearer ${orgToken}`;
      }
    }

    return headers;
  }

  private extractContext(options: EnhancedCacheOptions): any {
    return {
      userId: options.userId,
      instituteId: options.instituteId,
      classId: options.classId,
      subjectId: options.subjectId,
      role: options.role
    };
  }

  /**
   * GET request with intelligent caching
   */
  async get<T = any>(
    endpoint: string, 
    params?: Record<string, any>, 
    options: EnhancedCacheOptions = {}
  ): Promise<T> {
    const { 
      forceRefresh = false, 
      ttl = 30, 
      useStaleWhileRevalidate = true 
    } = options;

    const requestKey = this.generateRequestKey(endpoint, params);
    
    // Check cooldown to prevent request spam
    if (!forceRefresh && this.isInCooldown(requestKey)) {
      console.log('⏸️ Request in cooldown period:', requestKey);
      
      // Return cached data if available during cooldown
      const cached = await secureCache.getCache<T>(endpoint, params, {
        context: this.extractContext(options),
        ttl: ttl * 2, // Accept older cache during cooldown
        forceRefresh: false
      });
      
      if (cached) {
        return cached;
      }
      
      throw new Error('Request in cooldown period and no cache available');
    }

    // Try to get from cache first (unless forcing refresh)
    if (!forceRefresh) {
      try {
        const cachedData = await secureCache.getCache<T>(endpoint, params, {
          context: this.extractContext(options),
          ttl,
          forceRefresh
        });
        
        if (cachedData !== null) {
          // Stale-while-revalidate: return cache immediately, fetch in background
          if (useStaleWhileRevalidate) {
            this.revalidateInBackground(endpoint, params, options, ttl);
          }
          return cachedData;
        }
      } catch (error) {
        console.warn('⚠️ Cache retrieval failed:', error);
      }
    }

    // Check if there's already a pending request
    if (this.pendingRequests.has(requestKey)) {
      console.log('♻️ Reusing pending request:', requestKey);
      return this.pendingRequests.get(requestKey)!;
    }

    // Create new request
    const requestPromise = this.executeRequest<T>(endpoint, params, options, ttl);
    
    // Store pending request
    this.pendingRequests.set(requestKey, requestPromise);
    
    // Set cooldown
    this.setCooldown(requestKey);
    
    // Clean up after completion
    requestPromise.finally(() => {
      this.pendingRequests.delete(requestKey);
    });

    return requestPromise;
  }

  /**
   * Background revalidation for stale-while-revalidate
   */
  private async revalidateInBackground<T>(
    endpoint: string,
    params: Record<string, any> | undefined,
    options: EnhancedCacheOptions,
    ttl: number
  ): Promise<void> {
    try {
      // Wait a bit to avoid immediate re-fetch
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const data = await this.executeRequest<T>(endpoint, params, options, ttl);
      console.log('🔄 Background revalidation complete:', endpoint);
    } catch (error) {
      console.warn('⚠️ Background revalidation failed:', error);
    }
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest<T>(
    endpoint: string, 
    params?: Record<string, any>, 
    options: EnhancedCacheOptions = {},
    ttl: number = 30
  ): Promise<T> {
    // Refresh base URL
    this.baseUrl = this.useBaseUrl2 ? getBaseUrl2() : getBaseUrl();
    
    if (!this.baseUrl) {
      throw new Error('Backend URL not configured. Please set the backend URL in settings.');
    }
    
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    console.log('📡 API Request:', {
      method: 'GET',
      url: url.toString(),
      context: this.extractContext(options)
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`❌ API Error ${response.status}:`, errorText);
        
        // Handle auth errors
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          if (this.useBaseUrl2) {
            localStorage.removeItem('org_access_token');
          }
          // Clear user cache on auth error
          const userId = options.userId;
          if (userId) {
            await secureCache.clearUserCache(userId);
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('Content-Type');
      let data: T;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = {} as T;
      }

      // Cache the successful response
      try {
        await secureCache.setCache(endpoint, data, params, {
          ttl,
          context: this.extractContext(options)
        });
      } catch (error) {
        console.warn('⚠️ Failed to cache response:', error);
      }

      console.log('✅ API request successful:', endpoint);
      return data;

    } catch (error) {
      console.error('❌ API request failed:', endpoint, error);
      throw error;
    }
  }

  /**
   * POST request with automatic cache invalidation
   */
  async post<T = any>(endpoint: string, data?: any, options: EnhancedCacheOptions = {}): Promise<T> {
    this.baseUrl = this.useBaseUrl2 ? getBaseUrl2() : getBaseUrl();
    
    if (!this.baseUrl) {
      throw new Error('Backend URL not configured');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('📡 POST Request:', { url, context: this.extractContext(options) });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`❌ POST Error ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type');
    const result = contentType && contentType.includes('application/json') 
      ? await response.json() 
      : {} as T;

    // Invalidate affected caches
    await secureCache.invalidateOnMutation('POST', endpoint, this.extractContext(options));
    
    console.log('✅ POST successful, cache invalidated:', endpoint);
    return result;
  }

  /**
   * PUT request with automatic cache invalidation
   */
  async put<T = any>(endpoint: string, data?: any, options: EnhancedCacheOptions = {}): Promise<T> {
    this.baseUrl = this.useBaseUrl2 ? getBaseUrl2() : getBaseUrl();
    
    if (!this.baseUrl) {
      throw new Error('Backend URL not configured');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('📡 PUT Request:', { url, context: this.extractContext(options) });
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`❌ PUT Error ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type');
    const result = contentType && contentType.includes('application/json') 
      ? await response.json() 
      : {} as T;

    // Invalidate affected caches
    await secureCache.invalidateOnMutation('PUT', endpoint, this.extractContext(options));
    
    console.log('✅ PUT successful, cache invalidated:', endpoint);
    return result;
  }

  /**
   * PATCH request with automatic cache invalidation
   */
  async patch<T = any>(endpoint: string, data?: any, options: EnhancedCacheOptions = {}): Promise<T> {
    this.baseUrl = this.useBaseUrl2 ? getBaseUrl2() : getBaseUrl();
    
    if (!this.baseUrl) {
      throw new Error('Backend URL not configured');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('📡 PATCH Request:', { url, context: this.extractContext(options) });
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`❌ PATCH Error ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type');
    const result = contentType && contentType.includes('application/json') 
      ? await response.json() 
      : {} as T;

    // Invalidate affected caches
    await secureCache.invalidateOnMutation('PATCH', endpoint, this.extractContext(options));
    
    console.log('✅ PATCH successful, cache invalidated:', endpoint);
    return result;
  }

  /**
   * DELETE request with automatic cache invalidation
   */
  async delete<T = any>(endpoint: string, options: EnhancedCacheOptions = {}): Promise<T> {
    this.baseUrl = this.useBaseUrl2 ? getBaseUrl2() : getBaseUrl();
    
    if (!this.baseUrl) {
      throw new Error('Backend URL not configured');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('📡 DELETE Request:', { url, context: this.extractContext(options) });
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`❌ DELETE Error ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type');
    const result = contentType && contentType.includes('application/json') 
      ? await response.json() 
      : {} as T;

    // Invalidate affected caches
    await secureCache.invalidateOnMutation('DELETE', endpoint, this.extractContext(options));
    
    console.log('✅ DELETE successful, cache invalidated:', endpoint);
    return result;
  }

  /**
   * Check if data is cached
   */
  async hasCache(endpoint: string, params?: Record<string, any>, context?: any): Promise<boolean> {
    try {
      const cached = await secureCache.getCache(endpoint, params, { context, forceRefresh: false });
      return cached !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cached data only (no network request)
   */
  async getCachedOnly<T = any>(endpoint: string, params?: Record<string, any>, context?: any): Promise<T | null> {
    try {
      return await secureCache.getCache<T>(endpoint, params, { context, forceRefresh: false });
    } catch (error) {
      console.warn('⚠️ Cache-only retrieval failed:', error);
      return null;
    }
  }

  /**
   * Preload data into cache
   */
  async preload<T = any>(
    endpoint: string, 
    params?: Record<string, any>, 
    options: EnhancedCacheOptions = {}
  ): Promise<void> {
    try {
      await this.get<T>(endpoint, params, { ...options, forceRefresh: false });
      console.log('📥 Preloaded:', endpoint);
    } catch (error) {
      console.warn('⚠️ Preload failed:', endpoint, error);
    }
  }

  /**
   * Clear all pending requests
   */
  clearPendingRequests(): void {
    console.log('🗑️ Clearing all pending requests');
    this.pendingRequests.clear();
    this.requestCooldown.clear();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await secureCache.getCacheStats();
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<void> {
    await secureCache.clearAllCache();
  }

  /**
   * Clear user-specific cache
   */
  async clearUserCache(userId: string): Promise<void> {
    await secureCache.clearUserCache(userId);
  }

  /**
   * Clear institute-specific cache
   */
  async clearInstituteCache(instituteId: string): Promise<void> {
    await secureCache.clearInstituteCache(instituteId);
  }
}

export const enhancedCachedClient = new EnhancedCachedApiClient();
