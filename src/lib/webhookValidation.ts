/**
 * Security utility for validating webhook URLs to prevent SSRF attacks
 */

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a webhook URL to prevent Server-Side Request Forgery (SSRF) attacks
 * Blocks private IP ranges, localhost, and metadata endpoints
 */
export const validateWebhookUrl = (url: string): ValidationResult => {
  try {
    const parsed = new URL(url);
    
    // Only allow https protocol
    if (parsed.protocol !== 'https:') {
      return { 
        isValid: false, 
        error: 'Only HTTPS URLs are allowed for security reasons' 
      };
    }
    
    const hostname = parsed.hostname.toLowerCase();
    
    // Block localhost and loopback
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return { 
        isValid: false, 
        error: 'Localhost URLs are not allowed' 
      };
    }
    
    // Block AWS metadata endpoint
    if (hostname === '169.254.169.254' || hostname.includes('metadata')) {
      return { 
        isValid: false, 
        error: 'Metadata endpoints are not allowed' 
      };
    }
    
    // Block private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
    const privateIpPattern = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
    if (privateIpPattern.test(hostname)) {
      return { 
        isValid: false, 
        error: 'Private IP addresses are not allowed' 
      };
    }
    
    // Block link-local addresses
    if (hostname.startsWith('169.254.')) {
      return { 
        isValid: false, 
        error: 'Link-local addresses are not allowed' 
      };
    }
    
    // Validate hostname format
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(hostname)) {
      return { 
        isValid: false, 
        error: 'Invalid hostname format' 
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid URL format' 
    };
  }
};
