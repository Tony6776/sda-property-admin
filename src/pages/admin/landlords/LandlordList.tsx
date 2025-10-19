import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Search, Building2, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface Landlord {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  business_name: string | null;
  abn: string | null;
  ndis_registered: boolean;
  status: string;
  created_at: string;
}

export default function LandlordList() {
  const navigate = useNavigate();
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ndisFilter, setNdisFilter] = useState<string>("all");
  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchLandlords();
  }, []);

  const fetchLandlords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('landlords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLandlords(data || []);

      // Fetch property counts for each landlord
      if (data && data.length > 0) {
        const counts: Record<string, number> = {};
        for (const landlord of data) {
          const { count } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('landlord_id', landlord.id);
          counts[landlord.id] = count || 0;
        }
        setPropertyCounts(counts);
      }
    } catch (error: any) {
      console.error('Error fetching landlords:', error);
      toast.error('Failed to load landlords');
    } finally {
      setLoading(false);
    }
  };

  const filteredLandlords = landlords.filter(landlord => {
    const matchesSearch =
      landlord.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      landlord.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      landlord.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || landlord.status === statusFilter;
    const matchesNdis =
      ndisFilter === "all" ||
      (ndisFilter === "registered" && landlord.ndis_registered) ||
      (ndisFilter === "not_registered" && !landlord.ndis_registered);

    return matchesSearch && matchesStatus && matchesNdis;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading landlords...</p>
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
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">Landlords</h1>
              </div>
            </div>
            <Button onClick={() => navigate('/admin/landlords/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Landlord
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Landlords</CardTitle>
            <CardDescription>
              Manage property owners and landlords
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or business..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ndisFilter} onValueChange={setNdisFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by NDIS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Landlords</SelectItem>
                  <SelectItem value="registered">NDIS Registered</SelectItem>
                  <SelectItem value="not_registered">Not Registered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>NDIS Registered</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLandlords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm || statusFilter !== "all" || ndisFilter !== "all"
                          ? "No landlords found matching your filters"
                          : "No landlords added yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLandlords.map((landlord) => (
                      <TableRow
                        key={landlord.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/admin/landlords/${landlord.id}`)}
                      >
                        <TableCell>
                          <div className="font-medium">{landlord.full_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {landlord.business_name && (
                              <>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{landlord.business_name}</span>
                              </>
                            )}
                            {!landlord.business_name && (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {landlord.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span>{landlord.email}</span>
                              </div>
                            )}
                            {landlord.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{landlord.phone}</span>
                              </div>
                            )}
                            {!landlord.email && !landlord.phone && (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {landlord.ndis_registered ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {propertyCounts[landlord.id] || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(landlord.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredLandlords.length} of {landlords.length} landlords
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
