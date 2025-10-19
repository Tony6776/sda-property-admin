import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, RefreshCw, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  job_name: string;
  job_type: string;
  property_address: string;
  total_investment_required: number;
  expected_roi: number;
  status: string;
  progress_percentage: number;
  created_at: string;
}

export default function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        toast.error("Failed to load jobs");
      } else {
        setJobs(data || []);
        setFilteredJobs(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (statusFilter !== "all") {
      filtered = filtered.filter(j => j.status === statusFilter);
    }

    setFilteredJobs(filtered);
  }, [statusFilter, jobs]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", label: string }> = {
      planning: { variant: "secondary", label: "Planning" },
      active: { variant: "default", label: "Active" },
      funding: { variant: "outline", label: "Funding" },
      completed: { variant: "outline", label: "Completed" },
      on_hold: { variant: "destructive", label: "On Hold" },
    };

    const config = statusConfig[status] || { variant: "secondary" as const, label: status || "Unknown" };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card>
          <CardHeader>
            <CardTitle>PLCG Jobs</CardTitle>
            <CardDescription>Loading jobs...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>PLCG Jobs Management</CardTitle>
              <CardDescription>
                {filteredJobs.length} of {jobs.length} jobs
                {statusFilter !== "all" && ` - Filtered by: ${statusFilter}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={fetchJobs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => navigate('/admin/jobs/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="funding">Funding</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No jobs found</p>
              <p className="text-sm mt-2">
                {jobs.length === 0
                  ? "Create your first PLCG job"
                  : "Try changing your filters"
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Investment Required</TableHead>
                    <TableHead>Expected ROI</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admin/jobs/${job.id}`)}
                    >
                      <TableCell>
                        <div className="font-medium">{job.job_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.job_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.property_address}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        ${job.total_investment_required?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-green-600">
                        {job.expected_roi}%
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${job.progress_percentage || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {job.progress_percentage || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/jobs/${job.id}`);
                          }}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
