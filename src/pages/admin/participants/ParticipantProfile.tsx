import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  FileText,
  Home,
  DollarSign,
  TrendingUp,
  Loader2,
  CheckCircle,
  XCircle,
  MapPin,
  User,
  Building2,
  Activity
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  ndis_number: string | null;
  created_at: string | null;
  updated_at: string | null;
  participant_status: string | null;
  priority_level: string | null;
  support_coordinator_email: string | null;
  support_coordinator_name: string | null;
  support_coordinator_phone: string | null;
  support_coordinator_org: string | null;
  date_of_birth: string | null;
  age: number | null;
  disability_category: string | null;
  support_level: string | null;
  current_housing_type: string | null;
  housing_status: string | null;
  housing_preferences: any;
  funding_amount: number | null;
  funding_utilization: number | null;
  plan_start_date: string | null;
  plan_end_date: string | null;
  plan_review_date: string | null;
  notes: string | null;
}

export default function ParticipantProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchParticipant();
    }
  }, [id]);

  const fetchParticipant = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setParticipant(data);
    } catch (error: any) {
      console.error('Error fetching participant:', error);
      toast.error('Failed to load participant details');
      navigate('/admin/participants');
    } finally {
      setLoading(false);
    }
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
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const handleSendEmail = () => {
    if (participant?.support_coordinator_email) {
      window.location.href = `mailto:${participant.support_coordinator_email}`;
    } else {
      toast.error('No email address available');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update({ participant_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Status updated successfully');
      fetchParticipant();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!participant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/participants')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Participants
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{participant.name}</h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(participant.participant_status)}
                {getPriorityBadge(participant.priority_level)}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {formatDate(participant.created_at)}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                onClick={() => handleUpdateStatus(participant.participant_status === 'active' ? 'inactive' : 'active')}
              >
                {participant.participant_status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ndis">NDIS Information</TabsTrigger>
            <TabsTrigger value="housing">Housing Preferences</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {participant.support_coordinator_email || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {participant.support_coordinator_phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(participant.date_of_birth)} {participant.age ? `(${participant.age} years)` : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Coordinator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Support Coordinator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.support_coordinator_name || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Organization</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.support_coordinator_org || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Contact</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.support_coordinator_email || "Not provided"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {participant.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {participant.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* NDIS Information Tab */}
          <TabsContent value="ndis" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>NDIS Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">NDIS Number</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {participant.ndis_number || "Not provided"}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Disability Category</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.disability_category || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Support Level</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.support_level || "Not specified"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Funding Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Funding Amount</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(participant.funding_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Utilization</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.funding_utilization ? `${participant.funding_utilization}%` : "Not tracked"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Plan Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Plan Start</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(participant.plan_start_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Plan End</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(participant.plan_end_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Review Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(participant.plan_review_date)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Housing Preferences Tab */}
          <TabsContent value="housing" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Current Housing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Housing Type</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.current_housing_type || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.housing_status || "Not specified"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm font-medium mb-2">Housing Preferences</p>
                    {participant.housing_preferences ? (
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                        {JSON.stringify(participant.housing_preferences, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm text-muted-foreground">No preferences specified</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Verification</CardTitle>
                <CardDescription>Review and verify participant documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Document management coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    This section will allow you to view, approve, and reject participant documents
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
                <CardDescription>Recent activity and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Activity tracking coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    This section will show property matches, communications, and status changes
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
