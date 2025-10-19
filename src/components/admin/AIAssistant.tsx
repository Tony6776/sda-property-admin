import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AIRecommendation {
  id: string;
  entity_type: string;
  entity_id: string;
  recommendation_type: string;
  recommendation_title: string;
  recommendation_description: string;
  recommendation_data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  action_button_text: string;
  action_endpoint: string;
  action_payload: any;
  status: string;
  created_at: string;
}

export function AIAssistant() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setRecommendations(data || []);
    } catch (error: any) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (rec: AIRecommendation) => {
    setActioningId(rec.id);
    try {
      // Navigate based on recommendation type
      if (rec.recommendation_type === 'send_matches') {
        navigate(`/admin/participants/${rec.entity_id}`);
      } else if (rec.recommendation_type === 'schedule_viewing') {
        navigate(`/admin/properties/edit/${rec.entity_id}`);
      } else if (rec.recommendation_type === 'request_documents') {
        navigate(`/admin/participants/${rec.entity_id}`);
      } else if (rec.recommendation_type === 'contact_lead') {
        navigate(`/admin/participants/${rec.entity_id}`);
      } else if (rec.recommendation_type === 'assign_investor') {
        navigate(`/admin/jobs/${rec.entity_id}`);
      } else {
        toast.info('Action coming soon');
      }

      // Mark as accepted
      await supabase
        .from('ai_recommendations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', rec.id);

      toast.success('Action taken');
      loadRecommendations();
    } catch (error: any) {
      toast.error('Failed to complete action');
    } finally {
      setActioningId(null);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await supabase
        .from('ai_recommendations')
        .update({ status: 'rejected', rejected_at: new Date().toISOString() })
        .eq('id', id);

      toast.success('Recommendation dismissed');
      loadRecommendations();
    } catch (error: any) {
      toast.error('Failed to dismiss');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'send_matches': 'Send Property Matches',
      'schedule_viewing': 'Schedule Viewing',
      'request_documents': 'Request Documents',
      'contact_lead': 'Contact Lead',
      'price_adjustment': 'Price Adjustment',
      'update_status': 'Update Status',
      'assign_investor': 'Assign Investor',
      'flag_underperforming': 'Performance Issue',
      'maintenance_due': 'Maintenance Due',
      'compliance_expiring': 'Compliance Expiring',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Assistant</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Assistant</CardTitle>
        </div>
        <CardDescription>
          Intelligent recommendations and priority actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
            <p className="text-muted-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground">No pending recommendations</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={rec.id}>
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        {getPriorityIcon(rec.priority)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getPriorityColor(rec.priority)}>
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {rec.confidence_score}% confidence
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-sm">
                            {rec.recommendation_title}
                          </h4>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(rec.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground pl-6">
                      {rec.recommendation_description}
                    </p>

                    {/* Action Button */}
                    <div className="pl-6">
                      <Button
                        onClick={() => handleAction(rec)}
                        disabled={actioningId === rec.id}
                        size="sm"
                        className="w-full"
                      >
                        {actioningId === rec.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {rec.action_button_text || getTypeLabel(rec.recommendation_type)}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {index < recommendations.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
