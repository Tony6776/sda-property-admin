import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Plus,
  Search,
  ArrowLeft,
  Home,
  User,
  Calendar,
  DollarSign,
  Loader2,
  Eye,
  Building2
} from "lucide-react";

interface Tenancy {
  id: string;
  property_id: string;
  participant_id: string;
  landlord_id: string;
  lease_start_date: string;
  lease_end_date: string | null;
  lease_type: string;
  weekly_rent: number;
  status: string;
  sda_category: string | null;
  sda_rate_per_day: number | null;
  properties: {
    address: string;
    suburb: string;
    state: string;
  };
  participants: {
    name: string;
    ndis_number: string;
  };
  landlords: {
    full_name: string;
  };
}

export default function TenancyList() {
  const navigate = useNavigate();
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTenancies();
  }, []);

  const fetchTenancies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tenancies')
        .select(`
          *,
          properties(address, suburb, state),
          participants(name, ndis_number),
          landlords(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenancies(data || []);
    } catch (error: any) {
      console.error('Error fetching tenancies:', error);
      toast.error('Failed to load tenancies');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Active" },
      pending: { variant: "secondary", label: "Pending" },
      ending: { variant: "outline", label: "Ending" },
      ended: { variant: "outline", label: "Ended" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Ongoing";
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTenancies = tenancies.filter(tenancy => {
    const matchesSearch = searchTerm === "" ||
      tenancy.properties.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenancy.participants.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenancy.landlords.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || tenancy.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tenancies.length,
    active: tenancies.filter(t => t.status === 'active').length,
    pending: tenancies.filter(t => t.status === 'pending').length,
    ending: tenancies.filter(t => t.status === 'ending').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">Tenancy Management</h1>
            </div>
            <Button onClick={() => navigate('/admin/tenancies/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Tenancy
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tenancies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ending Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.ending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by property, participant, or landlord..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {["all", "active", "pending", "ending", "ended"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenancies Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tenancies</CardTitle>
            <CardDescription>
              Showing {filteredTenancies.length} of {tenancies.length} tenancies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead>Landlord</TableHead>
                    <TableHead>Lease Period</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>SDA Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenancies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No tenancies found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTenancies.map((tenancy) => (
                      <TableRow key={tenancy.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{tenancy.properties.address}</div>
                              <div className="text-sm text-muted-foreground">
                                {tenancy.properties.suburb}, {tenancy.properties.state}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{tenancy.participants.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {tenancy.participants.ndis_number}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{tenancy.landlords.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <div>{formatDate(tenancy.lease_start_date)}</div>
                              <div className="text-muted-foreground">
                                to {formatDate(tenancy.lease_end_date)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatCurrency(tenancy.weekly_rent)}/wk</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tenancy.sda_category ? (
                            <Badge variant="outline">{tenancy.sda_category}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(tenancy.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/tenancies/${tenancy.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
