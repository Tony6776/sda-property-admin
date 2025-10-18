import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Globe, Smartphone, AlertTriangle, Activity, Settings } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Admin2FASetup } from "./Admin2FASetup";

interface SecurityStats {
  is2FAEnabled: boolean;
  recentLogins: any[];
  highRiskEvents: any[];
  deviceCount: number;
  totalSessions: number;
}

export function AdminSecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats>({
    is2FAEnabled: false,
    recentLogins: [],
    highRiskEvents: [],
    deviceCount: 0,
    totalSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [show2FASetup, setShow2FASetup] = useState(false);

  useEffect(() => {
    loadSecurityStats();
  }, []);

  const loadSecurityStats = async () => {
    setLoading(true);
    try {
      // Check 2FA status
      const { data: twoFAStatus } = await supabase.functions.invoke('setup-admin-2fa', {
        body: { action: 'check_status' }
      });

      // Get recent geolocation logs
      const { data: geoLogs } = await supabase
        .from('ip_geolocation_logs')
        .select('*')
        .eq('event_type', 'admin_login')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get high risk security events
      const { data: securityEvents } = await supabase
        .from('security_events_enhanced')
        .select('*')
        .in('severity', ['high', 'critical'])
        .order('created_at', { ascending: false })
        .limit(5);

      // Get device count
      const { data: devices } = await supabase
        .from('device_security_logs')
        .select('device_fingerprint')
        .order('created_at', { ascending: false })
        .limit(50);

      // Get active sessions count
      const { data: sessions } = await supabase
        .from('admin_sessions')
        .select('id')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      const uniqueDevices = new Set(devices?.map(d => d.device_fingerprint) || []).size;

      setStats({
        is2FAEnabled: twoFAStatus?.is2FAEnabled || false,
        recentLogins: geoLogs || [],
        highRiskEvents: securityEvents || [],
        deviceCount: uniqueDevices,
        totalSessions: sessions?.length || 0
      });
    } catch (error) {
      console.error('Failed to load security stats:', error);
      toast.error("Failed to load security dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = () => {
    setShow2FASetup(true);
  };

  const handle2FASetupComplete = () => {
    setShow2FASetup(false);
    loadSecurityStats(); // Refresh stats
    toast.success("2FA setup completed successfully!");
  };

  if (show2FASetup) {
    return (
      <Admin2FASetup 
        onSetupComplete={handle2FASetupComplete}
        onCancel={() => setShow2FASetup(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Security Dashboard</h2>
        <Badge variant={stats.is2FAEnabled ? "default" : "destructive"}>
          {stats.is2FAEnabled ? "2FA Enabled" : "2FA Disabled"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Two-Factor Auth</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.is2FAEnabled ? "Enabled" : "Disabled"}
            </div>
            {!stats.is2FAEnabled && (
              <Button size="sm" onClick={handleSetup2FA} className="mt-2">
                Enable 2FA
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trusted Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deviceCount}</div>
            <p className="text-xs text-muted-foreground">
              Unique devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRiskEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Recent Login Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : stats.recentLogins.length > 0 ? (
              <div className="space-y-3">
                {stats.recentLogins.slice(0, 5).map((login, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {login.city ? `${login.city}, ${login.country}` : login.country || 'Unknown Location'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(login.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={login.risk_score > 50 ? "destructive" : "secondary"}>
                      Risk: {login.risk_score || 0}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent logins recorded</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : stats.highRiskEvents.length > 0 ? (
              <div className="space-y-3">
                {stats.highRiskEvents.map((event, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {event.event_type.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      <Badge variant={event.severity === 'critical' ? "destructive" : "secondary"}>
                        {event.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No security alerts</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}