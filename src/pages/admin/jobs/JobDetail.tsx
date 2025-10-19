import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Edit, DollarSign, TrendingUp, Users, Send, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DocumentTabs } from "@/components/admin/DocumentTabs";

interface Job {
  id: string;
  job_name: string;
  job_type: string;
  description: string;
  property_address: string;
  total_investment_required: number;
  expected_roi: number;
  status: string;
  progress_percentage: number;
  start_date?: string;
  completion_date?: string;
  created_at: string;
}

interface Investor {
  id: string;
  full_name: string;
  email: string;
  available_capital: number;
  preferred_property_types: string[];
  preferred_locations: string[];
  risk_tolerance: string;
}

interface JobInvestor {
  id: string;
  investor_id: string;
  committed_amount: number;
  status: string;
  investor: Investor;
}

interface MatchedInvestor extends Investor {
  matchScore: number;
  matchReasons: string[];
}

export default function JobDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchedInvestors, setMatchedInvestors] = useState<MatchedInvestor[]>([]);
  const [invitedInvestors, setInvitedInvestors] = useState<JobInvestor[]>([]);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
      fetchMatchedInvestors();
      fetchInvitedInvestors();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error: any) {
      console.error('Error fetching job:', error);
      toast.error("Failed to load job details");
      navigate('/admin/jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchedInvestors = async () => {
    try {
      const { data: investors, error } = await supabase
        .from('investors')
        .select('*');

      if (error) throw error;

      // Simulate AI matching with scores
      const matched = (investors || []).map(investor => {
        const score = calculateMatchScore(investor);
        const reasons = getMatchReasons(investor, score);
        return {
          ...investor,
          matchScore: score,
          matchReasons: reasons,
        };
      }).sort((a, b) => b.matchScore - a.matchScore);

      setMatchedInvestors(matched);
    } catch (error: any) {
      console.error('Error fetching investors:', error);
    }
  };

  const fetchInvitedInvestors = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('job_investors')
        .select(`
          *,
          investor:investors(*)
        `)
        .eq('job_id', id);

      if (error) throw error;
      setInvitedInvestors(data || []);
    } catch (error: any) {
      console.error('Error fetching invited investors:', error);
    }
  };

  // Simulate AI matching score (can be enhanced with real ML later)
  const calculateMatchScore = (investor: Investor): number => {
    let score = 0;

    // Check capital availability
    if (job && investor.available_capital >= job.total_investment_required * 0.2) {
      score += 40;
    } else if (job && investor.available_capital >= job.total_investment_required * 0.1) {
      score += 25;
    }

    // Check property type preference
    if (job && investor.preferred_property_types.includes(job.job_type)) {
      score += 30;
    }

    // Check location preference (simplified - would use actual location matching)
    if (job && investor.preferred_locations.length > 0) {
      score += 15;
    }

    // Risk tolerance matching
    if (investor.risk_tolerance === 'high' && job && job.expected_roi > 15) {
      score += 15;
    } else if (investor.risk_tolerance === 'medium' && job && job.expected_roi >= 10 && job.expected_roi <= 15) {
      score += 15;
    }

    return Math.min(score, 100);
  };

  const getMatchReasons = (investor: Investor, score: number): string[] => {
    const reasons: string[] = [];

    if (score >= 80) {
      reasons.push("Excellent capital match");
      reasons.push("Property type aligned with preferences");
    } else if (score >= 60) {
      reasons.push("Good capital availability");
      reasons.push("Partial preference match");
    } else {
      reasons.push("Meets minimum criteria");
    }

    return reasons;
  };

  const handleSendInvitation = async (investorId: string) => {
    if (!id) return;

    setSendingInvite(investorId);
    try {
      const { error } = await supabase
        .from('job_investors')
        .insert([{
          job_id: id,
          investor_id: investorId,
          status: 'invited',
          committed_amount: 0,
        }]);

      if (error) throw error;

      toast.success("Invitation sent successfully");
      await fetchInvitedInvestors();
      await fetchMatchedInvestors();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(`Failed to send invitation: ${error.message}`);
    } finally {
      setSendingInvite(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", label: string }> = {
      planning: { variant: "secondary", label: "Planning" },
      active: { variant: "default", label: "Active" },
      funding: { variant: "outline", label: "Funding" },
      completed: { variant: "outline", label: "Completed" },
      on_hold: { variant: "destructive", label: "On Hold" },
    };

    const config = statusConfig[status] || { variant: "secondary" as const, label: status || "Unknown" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getInvestorStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", label: string }> = {
      invited: { variant: "secondary", label: "Invited" },
      committed: { variant: "default", label: "Committed" },
      rejected: { variant: "destructive", label: "Rejected" },
    };

    const config = statusConfig[status] || { variant: "secondary" as const, label: status || "Unknown" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isInvited = (investorId: string) => {
    return invitedInvestors.some(ji => ji.investor_id === investorId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/jobs')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">{job.job_name}</h1>
              {getStatusBadge(job.status)}
            </div>
            <Button size="sm" onClick={() => navigate(`/admin/jobs/edit/${job.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Job
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${job.total_investment_required?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expected ROI</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {job.expected_roi}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invitedInvestors.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {invitedInvestors.filter(i => i.status === 'committed').length} committed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Job Type</Label>
                  <p className="mt-1">{job.job_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Property Address</Label>
                  <p className="mt-1">{job.property_address}</p>
                </div>
              </div>

              {job.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="mt-1">{job.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {job.start_date && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                    <p className="mt-1">{new Date(job.start_date).toLocaleDateString()}</p>
                  </div>
                )}
                {job.completion_date && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Completion Date</Label>
                    <p className="mt-1">{new Date(job.completion_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Progress</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Progress value={job.progress_percentage || 0} className="flex-1" />
                  <span className="text-sm font-medium">{job.progress_percentage || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Matched Investors */}
          <Card>
            <CardHeader>
              <CardTitle>AI Matched Investors</CardTitle>
              <CardDescription>
                Investors ranked by compatibility with this job
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matchedInvestors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No investors available</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investor</TableHead>
                        <TableHead>Available Capital</TableHead>
                        <TableHead>Match Score</TableHead>
                        <TableHead>Reasons</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matchedInvestors.slice(0, 10).map((investor) => (
                        <TableRow key={investor.id}>
                          <TableCell>
                            <div className="font-medium">{investor.full_name}</div>
                            <div className="text-sm text-muted-foreground">{investor.email}</div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${investor.available_capital?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={investor.matchScore} className="w-20" />
                              <span className="text-sm font-medium">{investor.matchScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {investor.matchReasons.map((reason, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isInvited(investor.id) ? (
                              <Badge variant="outline">Invited</Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendInvitation(investor.id)}
                                disabled={sendingInvite === investor.id}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {sendingInvite === investor.id ? 'Sending...' : 'Send Invite'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invited Investors */}
          <Card>
            <CardHeader>
              <CardTitle>Invited Investors</CardTitle>
              <CardDescription>
                Investors who have been invited to this job
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitedInvestors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No investors invited yet</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investor</TableHead>
                        <TableHead>Available Capital</TableHead>
                        <TableHead>Committed Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitedInvestors.map((jobInvestor) => (
                        <TableRow key={jobInvestor.id}>
                          <TableCell>
                            <div className="font-medium">{jobInvestor.investor.full_name}</div>
                            <div className="text-sm text-muted-foreground">{jobInvestor.investor.email}</div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${jobInvestor.investor.available_capital?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell className="font-medium">
                            ${jobInvestor.committed_amount?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell>
                            {getInvestorStatusBadge(jobInvestor.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <DocumentTabs
            entityType="job"
            entityId={id!}
            entityName={job?.job_name}
          />
        </div>
      </main>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
