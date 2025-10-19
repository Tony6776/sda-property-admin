import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Database,
  HardDrive,
  RefreshCw,
} from "lucide-react";

interface SetupCheck {
  name: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

export function SetupVerification() {
  const [checks, setChecks] = useState<SetupCheck[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    setChecking(true);
    const results: SetupCheck[] = [];

    // Check 1: Database tables exist
    try {
      const { error: fileUploadsError } = await supabase
        .from('file_uploads')
        .select('id')
        .limit(1);

      if (fileUploadsError) {
        if (fileUploadsError.message?.includes('relation') || fileUploadsError.message?.includes('does not exist')) {
          results.push({
            name: 'Database Tables',
            status: 'error',
            message: 'Required tables (file_uploads, landlords, investors, etc.) do not exist',
            action: {
              label: 'View Migration Guide',
              url: 'https://github.com/Tony6776/sda-property-admin/blob/main/APPLY-MIGRATION.md'
            }
          });
        } else {
          results.push({
            name: 'Database Tables',
            status: 'warning',
            message: `Database check failed: ${fileUploadsError.message}`,
          });
        }
      } else {
        results.push({
          name: 'Database Tables',
          status: 'success',
          message: 'All required tables exist',
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Database Tables',
        status: 'error',
        message: `Failed to check database: ${error.message}`,
      });
    }

    // Check 2: Storage bucket exists
    try {
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

      if (bucketsError) {
        results.push({
          name: 'Storage Bucket',
          status: 'warning',
          message: `Failed to check storage: ${bucketsError.message}`,
        });
      } else {
        const documentsBucket = buckets?.find(b => b.name === 'documents');

        if (documentsBucket) {
          results.push({
            name: 'Storage Bucket',
            status: 'success',
            message: 'Storage bucket "documents" exists',
          });
        } else {
          results.push({
            name: 'Storage Bucket',
            status: 'error',
            message: 'Storage bucket "documents" does not exist. File uploads will fail.',
            action: {
              label: 'Create Storage Bucket',
              url: 'https://supabase.com/dashboard/project/bqvptfdxnrzculgjcnjo/storage/buckets'
            }
          });
        }
      }
    } catch (error: any) {
      results.push({
        name: 'Storage Bucket',
        status: 'error',
        message: `Failed to check storage: ${error.message}`,
      });
    }

    // Check 3: Storage bucket policies
    try {
      // Try to upload a test file to check permissions
      const testFile = new Blob(['test'], { type: 'text/plain' });
      const testPath = `test/${Date.now()}.txt`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(testPath, testFile);

      if (uploadError) {
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('does not exist')) {
          // Bucket doesn't exist - already caught above
          results.push({
            name: 'Storage Policies',
            status: 'warning',
            message: 'Cannot check policies - bucket does not exist',
          });
        } else if (uploadError.message?.includes('permission') || uploadError.message?.includes('policy')) {
          results.push({
            name: 'Storage Policies',
            status: 'error',
            message: 'Storage bucket policies not configured correctly',
            action: {
              label: 'Configure Policies',
              url: 'https://supabase.com/dashboard/project/bqvptfdxnrzculgjcnjo/storage/policies'
            }
          });
        } else {
          results.push({
            name: 'Storage Policies',
            status: 'warning',
            message: `Storage test failed: ${uploadError.message}`,
          });
        }
      } else {
        // Clean up test file
        await supabase.storage
          .from('documents')
          .remove([testPath]);

        results.push({
          name: 'Storage Policies',
          status: 'success',
          message: 'Storage bucket policies configured correctly',
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Storage Policies',
        status: 'warning',
        message: `Failed to test storage: ${error.message}`,
      });
    }

    setChecks(results);
    setChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checking':
        return <Badge variant="outline">Checking...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-600">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Warning</Badge>;
      default:
        return null;
    }
  };

  const hasErrors = checks.some(c => c.status === 'error');
  const allSuccess = checks.length > 0 && checks.every(c => c.status === 'success');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Setup Verification
            </CardTitle>
            <CardDescription>
              Checking system requirements for file uploads
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runChecks}
            disabled={checking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Re-check
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        {allSuccess && (
          <Alert className="border-green-600 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ All systems ready! File uploads will work correctly.
            </AlertDescription>
          </Alert>
        )}

        {hasErrors && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Setup incomplete. Please fix the errors below before uploading files.
            </AlertDescription>
          </Alert>
        )}

        {/* Checks List */}
        <div className="space-y-3">
          {checks.length === 0 && checking && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Running checks...</span>
            </div>
          )}

          {checks.map((check, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{check.name}</h4>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                </div>
              </div>

              {check.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={check.action.onClick}
                  asChild={!!check.action.url}
                >
                  {check.action.url ? (
                    <a href={check.action.url} target="_blank" rel="noopener noreferrer">
                      {check.action.label}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  ) : (
                    <>
                      {check.action.label}
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Quick Setup Guide */}
        {hasErrors && (
          <Alert>
            <HardDrive className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Quick Setup Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click "Create Storage Bucket" above</li>
                  <li>Name it "documents" (lowercase)</li>
                  <li>Set to Private (not public)</li>
                  <li>Add policies for authenticated users (INSERT, SELECT, UPDATE, DELETE)</li>
                  <li>Click "Re-check" when done</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
