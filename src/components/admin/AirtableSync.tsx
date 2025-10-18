import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Cloud, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SyncResult {
  success: boolean;
  total_properties_synced?: number;
  message?: string;
  error?: string;
}

export function AirtableSync({ onSyncComplete }: { onSyncComplete?: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setLastSync(null);

    try {
      console.log('Starting Airtable sync...');

      const { data, error } = await supabase.functions.invoke('sync-airtable-properties');

      console.log('Sync response:', { data, error });

      if (error) {
        throw new Error(error.message || 'Sync failed');
      }

      const result: SyncResult = {
        success: true,
        total_properties_synced: data?.total_properties_synced || 0,
        message: `Successfully synced ${data?.total_properties_synced || 0} properties from Airtable`
      };

      setLastSync(result);
      toast.success(result.message);

      // Call callback to refresh property list
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error: any) {
      console.error('Sync error:', error);

      const result: SyncResult = {
        success: false,
        error: error.message || 'Unknown error occurred'
      };

      setLastSync(result);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          <CardTitle>Airtable Sync</CardTitle>
        </div>
        <CardDescription>
          Import properties from your Airtable database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastSync && (
          <Alert variant={lastSync.success ? "default" : "destructive"}>
            {lastSync.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {lastSync.success ? lastSync.message : `Error: ${lastSync.error}`}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="w-full"
          >
            {syncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing from Airtable...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync from Airtable
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This will fetch all properties from your Airtable base and update the database
          </p>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Sync Information</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Syncs all property records from Airtable</li>
            <li>• Updates existing properties by matching IDs</li>
            <li>• Creates new properties if they don't exist</li>
            <li>• Preserves local-only properties</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
