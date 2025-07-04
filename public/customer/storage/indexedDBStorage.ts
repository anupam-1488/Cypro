/**
 * IndexedDB Storage Service
 * 
 * A modern, Promise-based wrapper around IndexedDB that provides
 * a simple key-value storage interface compatible with the existing
 * storage API used throughout the customer management system.
 */

interface StorageItem {
  key: string;
  value: any;
  timestamp: number;
}

class IndexedDBStorage {
  private dbName = 'CustomerExtensionDB';
  private dbVersion = 1;
  private storeName = 'keyValueStore';
  private db: IDBDatabase | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the IndexedDB database
   */
  private async initDB(): Promise<void> {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.initialized && this.db) {
      return Promise.resolve();
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[IndexedDB] Failed to open database:', request.error);
        reject(new Error(`IndexedDB open failed: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        console.log('[IndexedDB] Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        console.log('[IndexedDB] Database upgrade needed, creating object store');
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          
          // Create index for timestamp-based queries (optional, for future use)
          store.createIndex('timestamp', 'timestamp', { unique: false });
          
          console.log('[IndexedDB] Object store created successfully');
        }
      };

      request.onblocked = () => {
        console.warn('[IndexedDB] Database blocked by another tab. Close other tabs and retry.');
        reject(new Error('Database blocked by another tab'));
      };
    });

    return this.initPromise;
  }

  /**
   * Ensure database is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initDB();
    }
  }

  /**
   * Create a transaction for the given mode
   */
  private createTransaction(mode: IDBTransactionMode): IDBTransaction {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.transaction([this.storeName], mode);
  }

  /**
   * Get a value from storage
   * @param key Storage key
   * @param defaultValue Default value to return if key doesn't exist
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    try {
      await this.ensureInitialized();
      
      const transaction = this.createTransaction('readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.value !== undefined) {
            resolve(result.value);
          } else {
            resolve(defaultValue as T);
          }
        };
        
        request.onerror = () => {
          console.error(`[IndexedDB] Error getting key "${key}":`, request.error);
          // Return default value on error rather than rejecting
          resolve(defaultValue as T);
        };
        
        transaction.onerror = () => {
          console.error(`[IndexedDB] Transaction error for get "${key}":`, transaction.error);
          resolve(defaultValue as T);
        };
      });
    } catch (error) {
      console.error(`[IndexedDB] Exception in get("${key}"):`, error);
      return defaultValue as T;
    }
  }

  /**
   * Set a value in storage
   * @param key Storage key
   * @param value Value to store
   */
  async set(key: string, value: any): Promise<void> {
    try {
      await this.ensureInitialized();
      
      const item: StorageItem = {
        key,
        value,
        timestamp: Date.now()
      };
      
      const transaction = this.createTransaction('readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(item);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          console.error(`[IndexedDB] Error setting key "${key}":`, request.error);
          reject(new Error(`Failed to set key "${key}": ${request.error?.message}`));
        };
        
        transaction.onerror = () => {
          console.error(`[IndexedDB] Transaction error for set "${key}":`, transaction.error);
          reject(new Error(`Transaction failed for key "${key}"`));
        };
      });
    } catch (error) {
      console.error(`[IndexedDB] Exception in set("${key}"):`, error);
      throw error;
    }
  }

  /**
   * Remove a value from storage
   * @param key Storage key
   */
  async remove(key: string): Promise<void> {
    try {
      await this.ensureInitialized();
      
      const transaction = this.createTransaction('readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          console.error(`[IndexedDB] Error removing key "${key}":`, request.error);
          reject(new Error(`Failed to remove key "${key}": ${request.error?.message}`));
        };
        
        transaction.onerror = () => {
          console.error(`[IndexedDB] Transaction error for remove "${key}":`, transaction.error);
          reject(new Error(`Transaction failed for key "${key}"`));
        };
      });
    } catch (error) {
      console.error(`[IndexedDB] Exception in remove("${key}"):`, error);
      throw error;
    }
  }

  /**
   * Clear all data from storage
   */
  async clear(): Promise<void> {
    try {
      await this.ensureInitialized();
      
      const transaction = this.createTransaction('readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('[IndexedDB] Storage cleared successfully');
          resolve();
        };
        
        request.onerror = () => {
          console.error('[IndexedDB] Error clearing storage:', request.error);
          reject(new Error(`Failed to clear storage: ${request.error?.message}`));
        };
      });
    } catch (error) {
      console.error('[IndexedDB] Exception in clear():', error);
      throw error;
    }
  }

  /**
   * Get all keys in storage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      await this.ensureInitialized();
      
      const transaction = this.createTransaction('readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result as string[]);
        };
        
        request.onerror = () => {
          console.error('[IndexedDB] Error getting all keys:', request.error);
          reject(new Error(`Failed to get keys: ${request.error?.message}`));
        };
      });
    } catch (error) {
      console.error('[IndexedDB] Exception in getAllKeys():', error);
      return [];
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStats(): Promise<{ totalKeys: number; estimatedSize: number }> {
    try {
      const keys = await this.getAllKeys();
      return {
        totalKeys: keys.length,
        estimatedSize: 0 // Could implement size estimation if needed
      };
    } catch (error) {
      console.error('[IndexedDB] Exception in getStats():', error);
      return { totalKeys: 0, estimatedSize: 0 };
    }
  }

  /**
   * Check if storage is available and working
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      return this.initialized && this.db !== null;
    } catch (error) {
      console.error('[IndexedDB] Storage availability check failed:', error);
      return false;
    }
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      this.initPromise = null;
      console.log('[IndexedDB] Database connection closed');
    }
  }

  /**
   * Export all data (useful for backup/migration)
   */
  async exportData(): Promise<Record<string, any>> {
    try {
      await this.ensureInitialized();
      
      const transaction = this.createTransaction('readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const items = request.result as StorageItem[];
          const exported: Record<string, any> = {};
          
          items.forEach(item => {
            exported[item.key] = item.value;
          });
          
          resolve(exported);
        };
        
        request.onerror = () => {
          console.error('[IndexedDB] Error exporting data:', request.error);
          reject(new Error(`Export failed: ${request.error?.message}`));
        };
      });
    } catch (error) {
      console.error('[IndexedDB] Exception in exportData():', error);
      throw error;
    }
  }

  /**
   * Import data (useful for backup restoration)
   */
  async importData(data: Record<string, any>): Promise<void> {
    try {
      await this.ensureInitialized();
      
      const transaction = this.createTransaction('readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const promises = Object.entries(data).map(([key, value]) => {
        const item: StorageItem = {
          key,
          value,
          timestamp: Date.now()
        };
        
        return new Promise<void>((resolve, reject) => {
          const request = store.put(item);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });
      
      await Promise.all(promises);
      console.log(`[IndexedDB] Successfully imported ${promises.length} items`);
    } catch (error) {
      console.error('[IndexedDB] Exception in importData():', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const indexedDBStorage = new IndexedDBStorage();

// Export the class for testing or multiple instances if needed
export { IndexedDBStorage };