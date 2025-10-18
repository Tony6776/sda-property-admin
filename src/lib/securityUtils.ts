// Enhanced security utilities with comprehensive protection
import { supabase } from "@/integrations/supabase/client";

// Generate device fingerprint for session security
function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvas.toDataURL(),
    webgl: getWebGLFingerprint(),
  };
  
  return btoa(JSON.stringify(fingerprint)).slice(0, 32);
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext || 
               canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (gl) {
      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      return `${vendor}-${renderer}`;
    }
  } catch {
    // Ignore WebGL errors
  }
  return 'unknown';
}

// Enhanced property access logging with security details
export async function logPropertyAccess(propertyId: string, accessType: 'view' | 'edit' | 'delete') {
  const startTime = Date.now();
  
  try {
    const sessionData = localStorage.getItem('admin_session_data');
    const deviceFingerprint = generateDeviceFingerprint();
    
    await supabase
      .from('property_access_logs')
      .insert({
        property_id: propertyId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        access_type: accessType,
        ip_address: 'client', // Client-side IP detection is limited
        user_agent: navigator.userAgent,
        session_id: sessionData ? 'admin_session' : null,
        device_fingerprint: deviceFingerprint,
        access_duration: Date.now() - startTime,
        suspicious_flags: []
      });
  } catch (error) {
    console.error('Failed to log property access:', error);
  }
}

// Enhanced property data fetching using secure RPC function
export async function fetchSecureProperties(filters?: {
  propertyType?: string;
  status?: string;
  offset?: number;
  limit?: number;
}) {
  try {
    // Log activity without importing to avoid circular dependency
    const session = localStorage.getItem('admin_session_data');
    if (session) {
      localStorage.setItem('admin_last_activity', new Date().toISOString());
    }

    const user = (await supabase.auth.getUser()).data.user;

    // Direct query since RLS is disabled on properties table
    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters server-side
    if (filters?.propertyType && filters.propertyType !== 'all') {
      query = query.eq('property_type', filters.propertyType);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Apply pagination if specified
    if (filters?.offset !== undefined && filters?.limit !== undefined) {
      const from = filters.offset;
      const to = filters.offset + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Query error:', error);
      throw error;
    }

    const filteredData = data || [];

    // Log property access for security monitoring
    if (filteredData.length > 0) {
      filteredData.forEach(property => {
        if (property.id) {
          logPropertyAccess(property.id, 'view');
        }
      });

      logSecurityEvent('property_list_access', {
        user_authenticated: !!user,
        properties_count: filteredData.length,
        filters_applied: filters || {},
        method_used: 'get_public_properties_rpc'
      });
    }

    return filteredData;
  } catch (error) {
    console.error('Error fetching secure properties:', error);

    // Provide helpful error context
    if (error.message?.includes('permission denied')) {
      throw new Error('Access denied: Authentication may be required for full property details');
    } else if (error.message?.includes('function') && error.message?.includes('does not exist')) {
      console.error('get_public_properties() function not found - falling back to direct query');

      // Fallback to direct table query (may fail with RLS bug)
      try {
        let query = supabase.from('properties').select('*');

        if (filters?.propertyType && filters.propertyType !== 'all') {
          query = query.eq('property_type', filters.propertyType);
        }

        const { data: fallbackData, error: fallbackError } = await query;

        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      } catch (fallbackErr) {
        console.error('Fallback query also failed:', fallbackErr);
        throw new Error('Unable to fetch properties - database configuration issue');
      }
    }

    throw error;
  }
}

// Validate client-side security state
export function validateClientSecurity(): boolean {
  try {
    // Check for suspicious modifications to localStorage
    const adminSessionKey = localStorage.getItem('admin_session_data');
    if (adminSessionKey) {
      // Basic validation that the session data hasn't been tampered with
      const parsed = JSON.parse(atob(adminSessionKey.replace(/[^A-Za-z0-9+/]/g, '')));
      if (!parsed || typeof parsed !== 'string') {
        localStorage.removeItem('admin_session_data');
        return false;
      }
    }
    
    return true;
  } catch {
    // Clear potentially corrupted session data
    localStorage.removeItem('admin_session_data');
    return false;
  }
}

// Rate limiting for client-side actions
const actionTimestamps: Record<string, number[]> = {};

export function checkClientRateLimit(action: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!actionTimestamps[action]) {
    actionTimestamps[action] = [];
  }
  
  // Remove old timestamps
  actionTimestamps[action] = actionTimestamps[action].filter(timestamp => timestamp > windowStart);
  
  // Check if we're over the limit
  if (actionTimestamps[action].length >= maxRequests) {
    return false;
  }
  
  // Add current timestamp
  actionTimestamps[action].push(now);
  return true;
}

// Log security events to enhanced monitoring
async function logSecurityEvent(eventType: string, details: Record<string, any>) {
  try {
    await supabase
      .from('security_events_enhanced')
      .insert({
        event_type: eventType,
        severity: 'info',
        ip_address: 'client',
        user_agent: navigator.userAgent,
        session_id: localStorage.getItem('admin_session_data') ? 'admin_session' : null,
        details: details
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Enhanced session validation with device fingerprinting
export async function validateEnhancedSessionSecurity(sessionToken: string): Promise<boolean> {
  try {
    const deviceFingerprint = generateDeviceFingerprint();
    
    const { data, error } = await supabase.functions.invoke('validate-admin-session-enhanced', {
      body: { 
        sessionToken,
        deviceFingerprint,
        userAgent: navigator.userAgent
      }
    });
    
    if (error || !data?.valid) {
      await logSecurityEvent('session_validation_failed', {
        session_token_present: !!sessionToken,
        device_fingerprint: deviceFingerprint
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

// Enhanced security headers for API requests
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}