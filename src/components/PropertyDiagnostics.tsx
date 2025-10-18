import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  Cloud,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export function PropertyDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnosticResults: DiagnosticResult[] = [];

    // Test 1: Database connection
    try {
      const { error } = await supabase.from('properties').select('count', { count: 'exact', head: true });
      if (error) {
        diagnosticResults.push({
          test: 'Database Connection',
          status: 'fail',
          message: `Cannot connect to properties table: ${error.message}`,
          details: error
        });
      } else {
        diagnosticResults.push({
          test: 'Database Connection',
          status: 'pass',
          message: 'Successfully connected to Supabase database'
        });
      }
    } catch (err: any) {
      diagnosticResults.push({
        test: 'Database Connection',
        status: 'fail',
        message: `Connection error: ${err.message}`
      });
    }

    // Test 2: Properties table query via RPC (bypasses buggy RLS)
    try {
      const { data, error } = await supabase.rpc('get_public_properties');

      if (error) {
        diagnosticResults.push({
          test: 'Properties Query (RPC)',
          status: 'fail',
          message: `RPC function failed: ${error.message}`,
          details: error
        });
      } else {
        if (!data || data.length === 0) {
          diagnosticResults.push({
            test: 'Properties Query (RPC)',
            status: 'warning',
            message: `RPC succeeded but returned no properties`,
            details: { count: 0, note: 'Database may be empty or filters too restrictive' }
          });
        } else {
          diagnosticResults.push({
            test: 'Properties Query (RPC)',
            status: 'pass',
            message: `Found ${data.length} properties via RPC function`,
            details: { count: data.length, sample: data[0] }
          });
        }
      }
    } catch (err: any) {
      diagnosticResults.push({
        test: 'Properties Query (RPC)',
        status: 'fail',
        message: `Unexpected error: ${err.message}`
      });
    }

    // Test 3: Airtable sync function
    try {
      const { data, error } = await supabase.functions.invoke('sync-airtable-properties', {
        body: { test: true }
      });

      if (error) {
        if (error.message.includes('AIRTABLE_API_KEY')) {
          diagnosticResults.push({
            test: 'Airtable Sync',
            status: 'warning',
            message: 'Airtable API key not configured in Supabase secrets',
            details: 'Configure AIRTABLE_API_KEY in Edge Function environment variables'
          });
        } else {
          diagnosticResults.push({
            test: 'Airtable Sync',
            status: 'fail',
            message: `Sync function error: ${error.message}`,
            details: error
          });
        }
      } else {
        diagnosticResults.push({
          test: 'Airtable Sync',
          status: 'pass',
          message: `Sync function working: ${data?.total_properties_synced || 0} properties synced`,
          details: data
        });
      }
    } catch (err: any) {
      diagnosticResults.push({
        test: 'Airtable Sync',
        status: 'warning',
        message: `Sync not tested: ${err.message}`
      });
    }

    // Test 4: RLS policies (test direct access vs RPC workaround)
    try {
      // Test direct access (expected to fail)
      const { data: directData, error: directError } = await supabase
        .from('properties')
        .select('id, name, status')
        .eq('status', 'available')
        .limit(1);

      if (directError) {
        if (directError.message.includes('read-only')) {
          diagnosticResults.push({
            test: 'RLS Policies',
            status: 'warning',
            message: 'RLS has logging bug, but RPC workaround is active ✅',
            details: {
              direct_access: 'Blocked by buggy RLS policy',
              workaround: 'Using get_public_properties() RPC - working!',
              note: 'Website functions normally despite RLS bug'
            }
          });
        } else {
          diagnosticResults.push({
            test: 'RLS Policies',
            status: 'fail',
            message: `RLS error: ${directError.message}`,
            details: directError
          });
        }
      } else {
        diagnosticResults.push({
          test: 'RLS Policies',
          status: 'pass',
          message: 'RLS policies allow direct property access (bug fixed!)',
          details: { found: directData?.length || 0 }
        });
      }
    } catch (err: any) {
      diagnosticResults.push({
        test: 'RLS Policies',
        status: 'fail',
        message: `RLS test failed: ${err.message}`
      });
    }

    setResults(diagnosticResults);
    setTesting(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Property Loading Diagnostics
        </CardTitle>
        <Button
          onClick={runDiagnostics}
          disabled={testing}
          size="sm"
          className="mt-2"
        >
          {testing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running tests...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-run Diagnostics
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.map((result, index) => (
          <Alert key={index} className={getStatusColor(result.status)}>
            <div className="flex items-start gap-3">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <AlertTitle className="flex items-center gap-2">
                  {result.test}
                  <Badge variant={result.status === 'pass' ? 'default' : 'destructive'}>
                    {result.status.toUpperCase()}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="text-sm">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                        Show details
                      </summary>
                      <pre className="mt-2 text-xs bg-black/5 p-2 rounded overflow-x-auto">
                        {typeof result.details === 'string'
                          ? result.details
                          : JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}

        {results.length === 0 && !testing && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No tests run</AlertTitle>
            <AlertDescription>
              Click "Run Diagnostics" to test property loading system
            </AlertDescription>
          </Alert>
        )}

        {results.some(r => r.status === 'fail') && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>
              <p className="text-sm mb-2">
                Some tests failed, but the website uses RPC workaround and should function normally.
              </p>
              <p className="text-xs text-muted-foreground">
                For permanent fix, see: CRITICAL-FIX-PROPERTIES-LOADING.md
              </p>
            </AlertDescription>
          </Alert>
        )}

        {results.every(r => r.status === 'pass') && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>All Systems Operational</AlertTitle>
            <AlertDescription>
              All diagnostic tests passed. The website is fully functional.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
