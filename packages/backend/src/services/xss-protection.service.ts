import xss from 'xss';

export class XSSProtectionService {
  private static xssOptions = {
    whiteList: {
      // Allow basic HTML tags 
      p: [],
      br: [],
      strong: [],
      em: [],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
    css: false, // Disable CSS to prevent CSS-based XSS
  };

  /**
   * Sanitizes input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    return xss(input, this.xssOptions);
  }

  /**
   * Sanitizes all string properties in an object
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };
    
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = this.sanitizeInput(sanitized[key]) as T[Extract<keyof T, string>];
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }
    
    return sanitized;
  }

  /**
   * Validates if input contains potentially malicious content
   */
  static containsMaliciousContent(input: string): boolean {
    const maliciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<meta[^>]*>.*?<\/meta>/gi,
    ];

    return maliciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Sanitizes customer name specifically
   */
  static sanitizeCustomerName(customerName: string): string {
    // Remove any HTML tags and special characters that could be malicious
    const sanitized = customerName
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>\"'&]/g, '') // Remove dangerous characters
      .trim();
    
    return this.sanitizeInput(sanitized);
  }

  /**
   * Sanitizes item description
   */
  static sanitizeItemDescription(item: string): string {
    const sanitized = item
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>\"'&]/g, '') // Remove dangerous characters
      .trim();
    
    return this.sanitizeInput(sanitized);
  }
}
