import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAdminSession, clearAdminSession, setAdminSession, validateSessionSecurity } from "@/lib/adminAuth";

interface PinCodeAuthProps {
  onAuthenticated: () => void;
  onCancel?: () => void;
}

const MAX_ATTEMPTS = 5;

export function PinCodeAuth({ onAuthenticated, onCancel }: PinCodeAuthProps) {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");

  useEffect(() => {
    const checkExistingSession = async () => {
      const existingSession = getAdminSession();
      if (existingSession && validateSessionSecurity()) {
        try {
          const { data, error } = await supabase.functions.invoke('validate-admin-session', {
            body: { sessionToken: existingSession.sessionToken }
          });
          
          if (error || !data?.success) {
            clearAdminSession();
            toast.error("Session expired. Please authenticate again.");
            return;
          }
          
          setAdminSession({
            ...existingSession,
            lastValidated: new Date().toISOString()
          });
          
          onAuthenticated();
        } catch {
          clearAdminSession();
          toast.error("Session validation failed. Please authenticate again.");
        }
      }
    };
    
    checkExistingSession();
  }, [onAuthenticated]);

  const generateDeviceFingerprint = () => {
    if (typeof window === 'undefined') return 'server';
    const nav = navigator;
    const screen = window.screen;
    return [nav.userAgent, nav.language, screen.width, screen.height, screen.colorDepth, new Date().getTimezoneOffset(), nav.hardwareConcurrency || 'unknown', nav.platform || 'unknown'].join('|');
  };

  const handlePinComplete = async (value: string) => {
    if (isValidating) return;
    setPin(value);
    setIsValidating(true);
    
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      const requestBody: any = { pin: value, deviceFingerprint };
      
      if (totpCode) requestBody.totpCode = totpCode;
      else if (backupCode) requestBody.backupCode = backupCode;
      
      const { data, error } = await supabase.functions.invoke('validate-admin-pin', {
        body: requestBody
      });
      
      if (error) throw new Error(error.message || 'Authentication failed');
      
      if (data?.success) {
        const sessionData = {
          sessionToken: data.sessionToken,
          expiresAt: data.expiresAt,
          authenticated: true,
          lastValidated: new Date().toISOString()
        };
        setAdminSession(sessionData);
        toast.success("Authentication successful!");
        setAttempts(0);
        setRequires2FA(false);
        setTotpCode("");
        setBackupCode("");
        onAuthenticated();
      } else if (data?.requires2FA) {
        setRequires2FA(true);
        toast.info("Please enter your 2FA code to complete authentication");
      } else {
        const remainingAttempts = data.remainingAttempts ?? (MAX_ATTEMPTS - attempts - 1);
        if (remainingAttempts <= 0) {
          toast.error("Maximum attempts exceeded. Access temporarily blocked.");
          onCancel?.();
        } else {
          toast.error(`Authentication failed. ${remainingAttempts} attempts remaining.`);
        }
        throw new Error(data?.error || 'Authentication failed');
      }
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin("");
      if (!error.message.includes('Authentication failed') && !error.message.includes('Maximum attempts')) {
        if (newAttempts >= MAX_ATTEMPTS) {
          toast.error("Too many failed attempts. Please refresh and try again.");
          onCancel?.();
        } else {
          toast.error(`${error.message}. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    setPin("");
    setAttempts(0);
    setRequires2FA(false);
    setTotpCode("");
    setBackupCode("");
    onCancel?.();
  };

  const handle2FASubmit = () => {
    if (totpCode.length === 6 || backupCode.length === 8) {
      handlePinComplete(pin);
    } else {
      toast.error("Please enter a valid 2FA code or backup code");
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {requires2FA ? "Two-Factor Authentication" : "Admin Access Required"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {requires2FA 
              ? "Enter your 2FA code to complete authentication"
              : "Enter the 4-digit PIN to access admin features"
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!requires2FA ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <InputOTP
                  maxLength={4}
                  value={pin}
                  onChange={setPin}
                  onComplete={handlePinComplete}
                  type={showPin ? "text" : "password"}
                  disabled={isValidating}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute -right-12 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              {!showBackupCode ? (
                <>
                  <p className="text-sm text-muted-foreground text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                  <InputOTP
                    maxLength={6}
                    value={totpCode}
                    onChange={setTotpCode}
                    disabled={isValidating}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <Button variant="ghost" size="sm" onClick={() => setShowBackupCode(true)}>
                    Use backup code instead
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground text-center">
                    Enter your 8-character backup code
                  </p>
                  <InputOTP
                    maxLength={8}
                    value={backupCode}
                    onChange={setBackupCode}
                    disabled={isValidating}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                      <InputOTPSlot index={6} />
                      <InputOTPSlot index={7} />
                    </InputOTPGroup>
                  </InputOTP>
                  <Button variant="ghost" size="sm" onClick={() => setShowBackupCode(false)}>
                    Use authenticator app instead
                  </Button>
                </>
              )}
            </div>
          )}
          
          {attempts > 0 && (
            <p className="text-sm text-destructive text-center">
              {MAX_ATTEMPTS - attempts} attempts remaining
            </p>
          )}
          
          {isValidating && (
            <p className="text-sm text-muted-foreground text-center">
              {requires2FA ? "Verifying 2FA code..." : "Validating PIN..."}
            </p>
          )}
          
          <div className="flex space-x-2">
            {onCancel && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCancel}
                disabled={isValidating}
              >
                Cancel
              </Button>
            )}
            {requires2FA ? (
              <Button 
                className="flex-1"
                onClick={handle2FASubmit}
                disabled={isValidating || (!totpCode && !backupCode)}
              >
                {isValidating ? "Verifying..." : "Verify"}
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => setPin("")}
                disabled={isValidating}
              >
                Clear
              </Button>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            {requires2FA 
              ? "Enhanced security with two-factor authentication"
              : "PIN authentication is required for admin features"
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}