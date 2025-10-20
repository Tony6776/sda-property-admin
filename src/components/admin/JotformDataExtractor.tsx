import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Users,
  Home,
  TrendingUp,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExtractionResult {
  success: boolean;
  action: string;
  result?: {
    total_processed?: number;
    inserted?: number;
    updated?: number;
    skipped?: number;
    errors?: number;
    message?: string;
  };
  error?: string;
}

interface ExtractionStatus {
  participants: 'idle' | 'loading' | 'success' | 'error';
  landlords: 'idle' | 'loading' | 'success' | 'error';
  investors: 'idle' | 'loading' | 'success' | 'error';
  properties: 'idle' | 'loading' | 'success' | 'error';
}

export function JotformDataExtractor() {
  const [status, setStatus] = useState<ExtractionStatus>({
    participants: 'idle',
    landlords: 'idle',
    investors: 'idle',
    properties: 'idle',
  });

  const [results, setResults] = useState<Record<string, ExtractionResult | null>>({
    participants: null,
    landlords: null,
    investors: null,
    properties: null,
  });

  const updateStatus = (type: keyof ExtractionStatus, newStatus: 'idle' | 'loading' | 'success' | 'error') => {
    setStatus(prev => ({ ...prev, [type]: newStatus }));
  };

  const extractData = async (
    extractionType: 'participants' | 'landlords' | 'investors' | 'properties',
    action: string
  ) => {
    updateStatus(extractionType, 'loading');
    toast.info(`Extracting ${extractionType} from Jotform...`);

    try {
      const { data, error } = await supabase.functions.invoke('jotform-extractor', {
        body: { action }
      });

      if (error) throw error;

      const result = data as ExtractionResult;

      if (result.success) {
        updateStatus(extractionType, 'success');
        setResults(prev => ({ ...prev, [extractionType]: result }));

        const stats = result.result;
        toast.success(
          `✅ ${extractionType.charAt(0).toUpperCase() + extractionType.slice(1)} extracted successfully!`,
          {
            description: stats
              ? `Processed: ${stats.total_processed || 0}, Inserted: ${stats.inserted || 0}, Updated: ${stats.updated || 0}, Skipped: ${stats.skipped || 0}`
              : result.result?.message || 'Extraction completed'
          }
        );
      } else {
        throw new Error(result.error || 'Extraction failed');
      }
    } catch (err: any) {
      console.error(`${extractionType} extraction error:`, err);
      updateStatus(extractionType, 'error');
      setResults(prev => ({
        ...prev,
        [extractionType]: { success: false, action, error: err.message }
      }));
      toast.error(`Failed to extract ${extractionType}`, {
        description: err.message
      });
    }
  };

  const extractParticipants = () => extractData('participants', 'extract_participants');
  const extractLandlords = () => extractData('landlords', 'extract_landlords');
  const extractInvestors = () => extractData('investors', 'extract_investors');
  const extractProperties = () => extractData('properties', 'extract_all_data');

  const extractAll = async () => {
    await extractParticipants();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit
    await extractLandlords();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await extractInvestors();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await extractProperties();
  };

  const getStatusIcon = (statusType: 'idle' | 'loading' | 'success' | 'error') => {
    switch (statusType) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (statusType: 'idle' | 'loading' | 'success' | 'error') => {
    switch (statusType) {
      case 'loading':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Processing...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Ready</Badge>;
    }
  };

  const isAnyLoading = Object.values(status).some(s => s === 'loading');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Jotform Data Extraction</CardTitle>
          </div>
          <Button
            onClick={extractAll}
            disabled={isAnyLoading}
            size="sm"
          >
            {isAnyLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Extract All
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Extract and categorize Jotform submissions into proper database tables
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Data Categorization System</p>
              <p className="text-sm text-muted-foreground">
                This tool extracts Jotform submissions and automatically categorizes them into the correct database tables based on form type and content. Click individual buttons to extract specific data types, or use "Extract All" for complete sync.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Extraction Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Participants */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Participants</h4>
                  <p className="text-sm text-muted-foreground">
                    NDIS participants seeking SDA housing
                  </p>
                </div>
              </div>
              {getStatusIcon(status.participants)}
            </div>
            <div className="flex items-center justify-between">
              <Button
                onClick={extractParticipants}
                disabled={status.participants === 'loading'}
                size="sm"
                className="w-full"
              >
                {status.participants === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Extract Participants
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              {getStatusBadge(status.participants)}
              {results.participants?.result && (
                <span className="text-xs text-muted-foreground">
                  {results.participants.result.inserted || 0} new, {results.participants.result.updated || 0} updated
                </span>
              )}
            </div>
          </div>

          {/* Landlords */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Landlords</h4>
                  <p className="text-sm text-muted-foreground">
                    Property owners and managers
                  </p>
                </div>
              </div>
              {getStatusIcon(status.landlords)}
            </div>
            <div className="flex items-center justify-between">
              <Button
                onClick={extractLandlords}
                disabled={status.landlords === 'loading'}
                size="sm"
                variant="outline"
                className="w-full"
              >
                {status.landlords === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Extract Landlords
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              {getStatusBadge(status.landlords)}
              {results.landlords?.result && (
                <span className="text-xs text-muted-foreground">
                  {results.landlords.result.inserted || 0} new, {results.landlords.result.updated || 0} updated
                </span>
              )}
            </div>
          </div>

          {/* Investors (PLCG) */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Investors (PLCG)</h4>
                  <p className="text-sm text-muted-foreground">
                    Property investment partners
                  </p>
                </div>
              </div>
              {getStatusIcon(status.investors)}
            </div>
            <div className="flex items-center justify-between">
              <Button
                onClick={extractInvestors}
                disabled={status.investors === 'loading'}
                size="sm"
                variant="outline"
                className="w-full"
              >
                {status.investors === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Extract Investors
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              {getStatusBadge(status.investors)}
              {results.investors?.result && (
                <span className="text-xs text-muted-foreground">
                  {results.investors.result.inserted || 0} new, {results.investors.result.updated || 0} updated
                </span>
              )}
            </div>
          </div>

          {/* Properties */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Properties</h4>
                  <p className="text-sm text-muted-foreground">
                    SDA property listings and leads
                  </p>
                </div>
              </div>
              {getStatusIcon(status.properties)}
            </div>
            <div className="flex items-center justify-between">
              <Button
                onClick={extractProperties}
                disabled={status.properties === 'loading'}
                size="sm"
                variant="outline"
                className="w-full"
              >
                {status.properties === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Extract Properties
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              {getStatusBadge(status.properties)}
              {results.properties?.result && (
                <span className="text-xs text-muted-foreground">
                  {results.properties.result.inserted || 0} new, {results.properties.result.updated || 0} updated
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {Object.values(results).some(r => r !== null) && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2 text-sm">Extraction Summary</h4>
            <div className="space-y-2">
              {Object.entries(results).map(([type, result]) => {
                if (!result) return null;
                return (
                  <div key={type} className="text-xs">
                    <span className="font-medium capitalize">{type}:</span>{' '}
                    {result.success ? (
                      <span className="text-green-600">
                        ✓ {result.result?.message || 'Completed successfully'}
                      </span>
                    ) : (
                      <span className="text-red-600">
                        ✗ {result.error || 'Failed'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
