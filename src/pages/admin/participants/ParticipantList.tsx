import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Search, Users, TrendingUp, FileText, Loader2 } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  ndis_number: string | null;
  created_at: string | null;
  participant_status: string | null;
  priority_level: string | null;
  support_coordinator_email: string | null;
  notes: string | null;
}

export default function ParticipantList() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    hotLeads: 0,
    pendingDocs: 0,
  });

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    filterAndSortParticipants();
  }, [participants, searchTerm, statusFilter, priorityFilter, sortBy]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setParticipants(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const hotLeads = data?.filter(p => p.priority_level === 'high').length || 0;
      const pendingDocs = data?.filter(p => p.participant_status === 'pending').length || 0;

      setStats({ total, hotLeads, pendingDocs });
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortParticipants = () => {
    let filtered = [...participants];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.support_coordinator_email && p.support_coordinator_email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.participant_status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(p => p.priority_level === priorityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "created_at") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === "priority") {
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const priorityA = priorityOrder[a.priority_level || ''] || 0;
        const priorityB = priorityOrder[b.priority_level || ''] || 0;
        return priorityB - priorityA;
      }
      return 0;
    });

    setFilteredParticipants(filtered);
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return <Badge variant="outline">Unknown</Badge>;

    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      high: { variant: "destructive", label: "High Priority" },
      medium: { variant: "default", label: "Medium" },
      low: { variant: "secondary", label: "Low" },
    };

    const config = variants[priority] || { variant: "outline" as const, label: priority };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Active" },
      pending: { variant: "secondary", label: "Pending" },
      inactive: { variant: "outline", label: "Inactive" },
    };

    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Participant Management</h1>
          <p className="text-muted-foreground">
            Manage NDIS participants and track engagement
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Hot Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.hotLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">High priority</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Pending Docs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary-foreground">{stats.pendingDocs}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
            <CardDescription>Filter and search participants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Participants ({filteredParticipants.length})</CardTitle>
            <CardDescription>Click on a row to view participant details</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No participants found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>NDIS Number</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signup Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow
                      key={participant.id}
                      onClick={() => navigate(`/admin/participants/${participant.id}`)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {participant.support_coordinator_email || "N/A"}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {participant.ndis_number || "N/A"}
                        </code>
                      </TableCell>
                      <TableCell>{getPriorityBadge(participant.priority_level)}</TableCell>
                      <TableCell>{getStatusBadge(participant.participant_status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(participant.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
