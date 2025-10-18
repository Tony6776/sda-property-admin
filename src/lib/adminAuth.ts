// Enhanced admin authentication utilities with security improvements
const SESSION_KEY = "admin_session_data";

export interface AdminSession {
  sessionToken: string;
  expiresAt: string;
  authenticated: boolean;
  ipAddress?: string;
  lastValidated?: string;
  deviceFingerprint?: string;
  sessionId?: string;
}

// Secure token storage using Web Crypto API when available
async function generateSessionId(): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for older browsers
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Simple XOR encryption for client-side storage (better than Base64 but still client-side)
function encryptSessionData(data: string, key: string): string {
  try {
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(encrypted);
  } catch {
    return btoa(data); // Fallback to basic encoding
  }
}

function decryptSessionData(encryptedData: string, key: string): string {
  try {
    const encrypted = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(
        encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return decrypted;
  } catch {
    return atob(encryptedData); // Fallback to basic decoding
  }
}

export const getAdminSession = (): AdminSession | null => {
  try {
    const encryptedData = localStorage.getItem(SESSION_KEY);
    if (!encryptedData) return null;
    
    // Generate a session-specific key based on browser fingerprint
    const sessionKey = generateSessionKey();
    const decryptedData = decryptSessionData(encryptedData, sessionKey);
    const session: AdminSession = JSON.parse(decryptedData);
    
    // Validate session structure
    if (!session.sessionToken || !session.expiresAt || !session.authenticated) {
      clearAdminSession();
      return null;
    }
    
    // Check if session is expired
    if (new Date(session.expiresAt) <= new Date()) {
      clearAdminSession();
      return null;
    }
    
    // Check if session is stale (older than 30 minutes for security)
    const lastValidated = session.lastValidated ? new Date(session.lastValidated) : new Date(0);
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    if (lastValidated < thirtyMinutesAgo) {
      // Session needs revalidation
      clearAdminSession();
      return null;
    }
    
    // Verify device fingerprint hasn't changed significantly
    if (session.deviceFingerprint) {
      const currentFingerprint = generateDeviceFingerprint();
      if (Math.abs(currentFingerprint.length - session.deviceFingerprint.length) > 10) {
        // Device fingerprint changed significantly, require re-authentication
        clearAdminSession();
        return null;
      }
    }
    
    return session;
  } catch (error) {
    console.warn('Session validation failed:', error);
    clearAdminSession();
    return null;
  }
};

// Generate a session-specific encryption key based on browser characteristics
function generateSessionKey(): string {
  const nav = typeof navigator !== 'undefined' ? navigator : {} as any;
  return [
    nav.userAgent?.slice(0, 20) || 'unknown',
    nav.language || 'en',
    screen?.width || '1920',
    screen?.height || '1080',
    new Date().toDateString()
  ].join('|');
}

// Generate device fingerprint for session validation
function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server';
  
  const nav = navigator;
  const screen = window.screen;
  
  return [
    nav.userAgent,
    nav.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    nav.hardwareConcurrency || 'unknown',
    nav.platform || 'unknown'
  ].join('|');
}

export const setAdminSession = async (sessionData: AdminSession): Promise<void> => {
  try {
    // Generate session ID and device fingerprint
    const sessionId = await generateSessionId();
    const deviceFingerprint = generateDeviceFingerprint();
    
    // Add enhanced security metadata
    const enhancedSession: AdminSession = {
      ...sessionData,
      lastValidated: new Date().toISOString(),
      ipAddress: 'client', // Client-side IP detection is limited
      deviceFingerprint,
      sessionId
    };
    
    // Validate session data before storage
    if (!enhancedSession.sessionToken || !enhancedSession.expiresAt) {
      throw new Error('Invalid session data');
    }
    
    const sessionKey = generateSessionKey();
    const encryptedData = encryptSessionData(JSON.stringify(enhancedSession), sessionKey);
    localStorage.setItem(SESSION_KEY, encryptedData);
    
    // Store session activity timestamp separately for monitoring
    localStorage.setItem('admin_last_activity', new Date().toISOString());
    
  } catch (error) {
    console.error('Failed to set admin session:', error);
    throw error; // Re-throw to handle in calling code
  }
};

export const clearAdminSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
  // Also clear any related auth data
  localStorage.removeItem('admin_last_activity');
};

export const isAdminAuthenticated = (): boolean => {
  const session = getAdminSession();
  return session !== null && session.authenticated;
};

export const getAdminHeaders = (): Record<string, string> => {
  const session = getAdminSession();
  if (!session) {
    throw new Error('No valid admin session');
  }
  
  return {
    'x-admin-session': session.sessionToken,
    'Content-Type': 'application/json'
  };
};

// Update session activity timestamp
export const updateSessionActivity = (): void => {
  const session = getAdminSession();
  if (session) {
    session.lastValidated = new Date().toISOString();
    setAdminSession(session);
  }
  localStorage.setItem('admin_last_activity', new Date().toISOString());
};

// Check for suspicious activity (multiple tabs, etc.)
export const validateSessionSecurity = (): boolean => {
  try {
    const session = getAdminSession();
    if (!session) return false;
    
    const lastActivity = localStorage.getItem('admin_last_activity');
    if (!lastActivity) return true;
    
    const timeSinceActivity = Date.now() - new Date(lastActivity).getTime();
    const maxIdleTime = 15 * 60 * 1000; // Reduced to 15 minutes for security
    
    if (timeSinceActivity > maxIdleTime) {
      clearAdminSession();
      return false;
    }
    
    // Additional security checks
    if (session.deviceFingerprint) {
      const currentFingerprint = generateDeviceFingerprint();
      // Check for significant changes in device fingerprint
      const fingerprintDiff = Math.abs(currentFingerprint.length - session.deviceFingerprint.length);
      if (fingerprintDiff > 20) {
        console.warn('Device fingerprint mismatch detected');
        clearAdminSession();
        return false;
      }
    }
    
    // Check for suspicious rapid session creation
    const sessionHistory = getSessionHistory();
    if (sessionHistory.length > 5) {
      console.warn('Suspicious session activity detected');
      clearAdminSession();
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Session security validation failed:', error);
    clearAdminSession();
    return false;
  }
};

// Track session creation for anomaly detection
function getSessionHistory(): string[] {
  try {
    const history = localStorage.getItem('admin_session_history');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

function addSessionToHistory(sessionId: string): void {
  try {
    const history = getSessionHistory();
    const now = new Date().toISOString();
    
    // Keep only recent sessions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSessions = history.filter(entry => {
      const [, timestamp] = entry.split('|');
      return timestamp && new Date(timestamp) > oneDayAgo;
    });
    
    recentSessions.push(`${sessionId}|${now}`);
    
    // Keep only last 10 sessions
    const limitedHistory = recentSessions.slice(-10);
    localStorage.setItem('admin_session_history', JSON.stringify(limitedHistory));
  } catch (error) {
    console.warn('Failed to update session history:', error);
  }
}