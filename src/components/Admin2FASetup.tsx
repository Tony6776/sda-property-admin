import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, Key, Copy, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";

interface Admin2FASetupProps {
  onSetupComplete: () => void;
  onCancel?: () => void;
}

export function Admin2FASetup({ onSetupComplete, onCancel }: Admin2FASetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('setup-admin-2fa', {
        body: { action: 'generate_secret' }
      });

      if (error) throw error;

      if (data?.success) {
        setSecret(data.secret);
        const qrUrl = await QRCode.toDataURL(data.qrCodeUrl);
        setQrCodeUrl(qrUrl);
      }
    } catch (error: any) {
      toast.error("Failed to generate 2FA setup: " + error.message);
    }
  };

  const verifyAndEnable2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-admin-2fa', {
        body: { 
          action: 'verify_and_enable',
          secret,
          verificationCode
        }
      });

      if (error) throw error;

      if (data?.success) {
        setBackupCodes(data.backupCodes);
        setStep('backup');
        toast.success("2FA has been successfully enabled!");
      } else {
        toast.error(data?.error || "Invalid verification code");
      }
    } catch (error: any) {
      toast.error("Failed to verify 2FA: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copied to clipboard");
  };

  const downloadBackupCodes = () => {
    const content = `Admin 2FA Backup Codes - Generated ${new Date().toLocaleDateString()}

IMPORTANT: Store these codes securely. Each code can only be used once.

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Generated on: ${new Date().toISOString()}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-2fa-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded");
  };

  const copyBackupCodes = () => {
    const codes = backupCodes.join('\n');
    navigator.clipboard.writeText(codes);
    toast.success("Backup codes copied to clipboard");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {step === 'setup' && "Setup Two-Factor Authentication"}
            {step === 'verify' && "Verify 2FA Setup"}
            {step === 'backup' && "Save Backup Codes"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'setup' && (
            <>
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                
                {qrCodeUrl && (
                  <div className="flex justify-center">
                    <img src={qrCodeUrl} alt="2FA QR Code" className="border rounded-lg" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Or enter this secret manually:
                  </p>
                  <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                    <code className="text-xs break-all flex-1">{secret}</code>
                    <Button size="sm" variant="ghost" onClick={copySecret}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setStep('verify')} 
                className="w-full"
                disabled={!secret}
              >
                Continue to Verification
              </Button>
            </>
          )}

          {step === 'verify' && (
            <>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
                
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                    disabled={isLoading}
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
                </div>
                
                {isLoading && (
                  <p className="text-sm text-muted-foreground text-center">
                    Verifying code...
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('setup')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  onClick={verifyAndEnable2FA}
                  className="flex-1"
                  disabled={verificationCode.length !== 6 || isLoading}
                >
                  {isLoading ? "Verifying..." : "Enable 2FA"}
                </Button>
              </div>
            </>
          )}

          {step === 'backup' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">Important!</p>
                    <p className="text-amber-700 dark:text-amber-300">Save these backup codes securely. Each can only be used once.</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Backup Codes:</p>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
                    {backupCodes.map((code, index) => (
                      <code key={index} className="text-xs font-mono">
                        {index + 1}. {code}
                      </code>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={copyBackupCodes}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadBackupCodes}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={onSetupComplete}
                className="w-full"
              >
                Complete Setup
              </Button>
            </>
          )}
          
          {onCancel && step !== 'backup' && (
            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}