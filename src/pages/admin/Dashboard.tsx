import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, LayoutDashboard, Home } from "lucide-react";
import { checkAdminAuth, signOutAdmin, AdminProfile } from "@/lib/adminAuthUtils";
import { PropertyList } from "@/components/admin/PropertyList";
import { AirtableSync } from "@/components/admin/AirtableSync";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, available: 0 });

  useEffect(() => {
    // Verify admin access
    checkAdminAuth().then(({ isAdmin, profile }) => {
      if (!isAdmin) {
        navigate('/admin/login');
      } else {
        setProfile(profile);
        fetchStats();
      }
      setLoading(false);
    });
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // Get total properties
      const { count: total } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Get available properties
      const { count: available } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      setStats({ total: total || 0, available: available || 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
      toast.success("Signed out successfully");
      navigate('/admin/login');
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{profile?.full_name || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Public Site
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || 'Admin'}!</h2>
          <p className="text-muted-foreground">
            Manage your SDA properties and sync with Airtable
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">In database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.available}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready to view</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">No recent sync</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Property Management - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <PropertyList />
          </div>

          {/* Sidebar - Takes up 1 column */}
          <div className="space-y-6">
            <AirtableSync onSyncComplete={fetchStats} />

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/properties/new')}
                >
                  Add New Property
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/')}
                >
                  View Public Site
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://airtable.com/appbKYczBetBCdJKs', '_blank')}
                >
                  Open Airtable
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Current Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Status</CardTitle>
            <CardDescription>Admin portal development progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge>✅ Phase 1</Badge>
                <span className="text-sm">Public website cleaned - admin features removed</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>✅ Phase 2</Badge>
                <span className="text-sm">Admin authentication system created</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>✅ Phase 3</Badge>
                <span className="text-sm">Admin dashboard created with property list & Airtable sync</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">⏳ Phase 4</Badge>
                <span className="text-sm">Property management (add/edit forms - next)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Phase 5</Badge>
                <span className="text-sm">Backend security with RLS</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Phase 6</Badge>
                <span className="text-sm">Admin user creation and testing</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
