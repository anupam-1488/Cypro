// shared/utils/phoneUtils.ts
/**
 * Phone Number Utilities
 * Provides comprehensive phone number handling for better customer search and validation
 */

interface PhoneNumberInfo {
  original: string;
  cleaned: string;
  normalized: string;
  formatted: string;
  isValid: boolean;
  country?: string;
  type?: 'mobile' | 'landline' | 'unknown';
  region?: string;
}

interface PhoneMatchResult {
  isMatch: boolean;
  confidence: number; // 0-1, where 1 is exact match
  matchType: 'exact' | 'partial' | 'formatted' | 'none';
}

class PhoneNumberUtils {
  
  /**
   * Clean phone number by removing all non-digit characters
   */
  static clean(phone: string): string {
    if (!phone) return '';
    return phone.toString().replace(/[^\d]/g, '');
  }

  /**
   * Normalize phone number to a standard format for comparison
   */
  static normalize(phone: string): string {
    const cleaned = this.clean(phone);
    
    if (!cleaned) return '';
    
    // Handle different country codes and formats
    if (cleaned.length === 10) {
      // Standard 10-digit number (Indian mobile without country code)
      return cleaned;
    } else if (cleaned.length === 11) {
      // 11 digits - could be US (+1) or other country code
      if (cleaned.startsWith('1')) {
        return cleaned.slice(1); // Remove US country code
      }
      return cleaned;
    } else if (cleaned.length === 12) {
      // 12 digits - likely Indian number with country code (+91)
      if (cleaned.startsWith('91')) {
        return cleaned.slice(2); // Remove Indian country code
      }
      return cleaned;
    } else if (cleaned.length === 13) {
      // 13 digits - could be other country codes
      if (cleaned.startsWith('91')) {
        return cleaned.slice(2);
      }
      return cleaned.slice(-10); // Take last 10 digits
    }
    
    // For any other length, try to extract the meaningful part
    if (cleaned.length > 10) {
      return cleaned.slice(-10); // Take last 10 digits
    }
    
    return cleaned;
  }

  /**
   * Format phone number for display
   */
  static format(phone: string, style: 'display' | 'international' | 'national' = 'display'): string {
    const normalized = this.normalize(phone);
    
    if (!normalized || normalized.length < 10) return phone;
    
    switch (style) {
      case 'display':
        // Format as: 98765 43210
        if (normalized.length === 10) {
          return `${normalized.slice(0, 5)} ${normalized.slice(5)}`;
        }
        return normalized;
        
      case 'international':
        // Format as: +91 98765 43210
        if (normalized.length === 10) {
          return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
        }
        return `+${normalized}`;
        
      case 'national':
        // Format as: (98765) 43210
        if (normalized.length === 10) {
          return `(${normalized.slice(0, 5)}) ${normalized.slice(5)}`;
        }
        return normalized;
        
      default:
        return normalized;
    }
  }

  /**
   * Validate phone number
   */
  static validate(phone: string): boolean {
    const normalized = this.normalize(phone);
    
    if (!normalized) return false;
    
    // Check if it's a valid length (typically 10 digits for mobile)
    if (normalized.length < 10 || normalized.length > 12) {
      return false;
    }
    
    // Check if it starts with valid digits (for Indian numbers)
    if (normalized.length === 10) {
      // Indian mobile numbers typically start with 6, 7, 8, or 9
      const firstDigit = normalized.charAt(0);
      return ['6', '7', '8', '9'].includes(firstDigit);
    }
    
    return true;
  }

  /**
   * Get detailed phone number information
   */
  static getInfo(phone: string): PhoneNumberInfo {
    const original = phone || '';
    const cleaned = this.clean(phone);
    const normalized = this.normalize(phone);
    const formatted = this.format(phone);
    const isValid = this.validate(phone);
    
    let country = 'unknown';
    let type: 'mobile' | 'landline' | 'unknown' = 'unknown';
    let region = 'unknown';
    
    if (normalized.length === 10) {
      const firstDigit = normalized.charAt(0);
      const secondDigit = normalized.charAt(1);
      
      // Indian number patterns
      if (['6', '7', '8', '9'].includes(firstDigit)) {
        country = 'IN';
        type = 'mobile';
        
        // Determine region/operator based on first few digits (simplified)
        if (firstDigit === '9') {
          region = 'Various';
        } else if (firstDigit === '8') {
          region = 'Various';
        } else if (firstDigit === '7') {
          region = 'Various';
        } else if (firstDigit === '6') {
          region = 'Various';
        }
      }
    }
    
    return {
      original,
      cleaned,
      normalized,
      formatted,
      isValid,
      country,
      type,
      region
    };
  }

  /**
   * Compare two phone numbers for matching
   */
  static match(phone1: string, phone2: string): PhoneMatchResult {
    if (!phone1 || !phone2) {
      return {
        isMatch: false,
        confidence: 0,
        matchType: 'none'
      };
    }
    
    const norm1 = this.normalize(phone1);
    const norm2 = this.normalize(phone2);
    
    // Exact match
    if (norm1 === norm2) {
      return {
        isMatch: true,
        confidence: 1.0,
        matchType: 'exact'
      };
    }
    
    // Check if one is a subset of the other (partial match)
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      const longer = norm1.length > norm2.length ? norm1 : norm2;
      const shorter = norm1.length > norm2.length ? norm2 : norm1;
      const confidence = shorter.length / longer.length;
      
      return {
        isMatch: confidence >= 0.8, // Consider it a match if 80% or more digits match
        confidence,
        matchType: 'partial'
      };
    }
    
    // Check formatted versions
    const format1 = this.format(phone1);
    const format2 = this.format(phone2);
    
    if (format1 === format2) {
      return {
        isMatch: true,
        confidence: 0.9,
        matchType: 'formatted'
      };
    }
    
    return {
      isMatch: false,
      confidence: 0,
      matchType: 'none'
    };
  }

  /**
   * Check if a phone number matches a search query
   */
  static searchMatch(customerPhone: string, searchQuery: string): PhoneMatchResult {
    if (!customerPhone || !searchQuery) {
      return {
        isMatch: false,
        confidence: 0,
        matchType: 'none'
      };
    }
    
    const normalizedCustomer = this.normalize(customerPhone);
    const normalizedQuery = this.normalize(searchQuery);
    
    // If search query is not numeric, it's not a phone search
    if (!/^\d+$/.test(normalizedQuery)) {
      return {
        isMatch: false,
        confidence: 0,
        matchType: 'none'
      };
    }
    
    // Exact match
    if (normalizedCustomer === normalizedQuery) {
      return {
        isMatch: true,
        confidence: 1.0,
        matchType: 'exact'
      };
    }
    
    // Starts with match (useful for progressive search)
    if (normalizedCustomer.startsWith(normalizedQuery)) {
      const confidence = normalizedQuery.length / normalizedCustomer.length;
      return {
        isMatch: true,
        confidence,
        matchType: 'partial'
      };
    }
    
    // Contains match (for partial searches)
    if (normalizedCustomer.includes(normalizedQuery)) {
      const confidence = normalizedQuery.length / normalizedCustomer.length * 0.8; // Slightly lower confidence
      return {
        isMatch: confidence >= 0.5, // At least 50% confidence for contains match
        confidence,
        matchType: 'partial'
      };
    }
    
    return {
      isMatch: false,
      confidence: 0,
      matchType: 'none'
    };
  }

  /**
   * Generate phone number variations for better search
   */
  static generateVariations(phone: string): string[] {
    const info = this.getInfo(phone);
    const variations = new Set<string>();
    
    if (!info.isValid) return [phone];
    
    // Add original
    variations.add(info.original);
    
    // Add cleaned version
    variations.add(info.cleaned);
    
    // Add normalized version
    variations.add(info.normalized);
    
    // Add formatted versions
    variations.add(this.format(phone, 'display'));
    variations.add(this.format(phone, 'international'));
    variations.add(this.format(phone, 'national'));
    
    // Add with country code
    if (info.normalized.length === 10) {
      variations.add(`91${info.normalized}`);
      variations.add(`+91${info.normalized}`);
      variations.add(`091${info.normalized}`);
    }
    
    // Add common formatting variations
    if (info.normalized.length === 10) {
      const n = info.normalized;
      variations.add(`${n.slice(0, 5)}-${n.slice(5)}`);
      variations.add(`${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`);
      variations.add(`(${n.slice(0, 5)}) ${n.slice(5)}`);
      variations.add(`${n.slice(0, 5)} ${n.slice(5)}`);
    }
    
    return Array.from(variations).filter(v => v && v.length > 0);
  }

  /**
   * Sort phone numbers by relevance to search query
   */
  static sortByRelevance(phones: string[], searchQuery: string): string[] {
    if (!searchQuery) return phones;
    
    return phones
      .map(phone => ({
        phone,
        match: this.searchMatch(phone, searchQuery)
      }))
      .sort((a, b) => {
        // Sort by confidence (higher first)
        if (a.match.confidence !== b.match.confidence) {
          return b.match.confidence - a.match.confidence;
        }
        
        // Then by match type (exact > partial > formatted > none)
        const matchTypeOrder = { exact: 4, partial: 3, formatted: 2, none: 1 };
        const aOrder = matchTypeOrder[a.match.matchType] || 0;
        const bOrder = matchTypeOrder[b.match.matchType] || 0;
        
        return bOrder - aOrder;
      })
      .map(item => item.phone);
  }

  /**
   * Extract phone numbers from text
   */
  static extractFromText(text: string): string[] {
    if (!text) return [];
    
    const phonePatterns = [
      // Indian mobile patterns
      /(?:\+91|91)?[\s\-]?[6-9]\d{9}/g,
      // International patterns
      /(?:\+\d{1,3})?[\s\-]?\d{10,12}/g,
      // Formatted patterns
      /\(\d{3,5}\)[\s\-]?\d{4,6}/g,
    ];
    
    const found = new Set<string>();
    
    phonePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = this.clean(match);
          if (cleaned.length >= 10) {
            found.add(match.trim());
          }
        });
      }
    });
    
    return Array.from(found);
  }

  /**
   * Check if string looks like a phone number
   */
  static looksLikePhone(text: string): boolean {
    if (!text) return false;
    
    const cleaned = this.clean(text);
    
    // Must have at least 10 digits
    if (cleaned.length < 10) return false;
    
    // Check if the original string has phone-like patterns
    const phoneIndicators = ['+', '(', ')', '-', ' '];
    const hasIndicators = phoneIndicators.some(indicator => text.includes(indicator));
    
    // If it has phone indicators or is mostly digits, it's likely a phone number
    const digitRatio = cleaned.length / text.length;
    
    return hasIndicators || digitRatio >= 0.7;
  }

  /**
   * Mask phone number for privacy
   */
  static mask(phone: string, style: 'partial' | 'full' = 'partial'): string {
    const normalized = this.normalize(phone);
    
    if (!normalized || normalized.length < 10) return phone;
    
    if (style === 'full') {
      return '*'.repeat(normalized.length);
    }
    
    // Partial masking - show first 2 and last 2 digits
    if (normalized.length === 10) {
      return `${normalized.slice(0, 2)}****${normalized.slice(-2)}`;
    }
    
    return `${normalized.slice(0, 2)}${'*'.repeat(normalized.length - 4)}${normalized.slice(-2)}`;
  }
}

// Export utilities
export default PhoneNumberUtils;
export { PhoneNumberUtils };
export type { PhoneNumberInfo, PhoneMatchResult };