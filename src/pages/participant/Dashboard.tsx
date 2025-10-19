import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { checkParticipantAuth, signOutParticipant } from "@/lib/participantAuth";
import { toast } from "sonner";
import {
  Home,
  Heart,
  FileText,
  Calendar,
  LogOut,
  User,
  TrendingUp,
  Star,
  CheckCircle2,
  Circle
} from "lucide-react";

interface Participant {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  lead_score: number;
  engagement_level: string;
  ndis_plan_uploaded: boolean;
  id_uploaded: boolean;
  income_proof_uploaded: boolean;
  preferred_locations: string[];
  max_weekly_budget: number | null;
}

export default function ParticipantDashboard() {
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchCount, setMatchCount] = useState(0);
  const [excellentMatches, setExcellentMatches] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { isAuthenticated, participant: participantData } = await checkParticipantAuth();

      if (!isAuthenticated) {
        navigate('/participant/login');
        return;
      }

      setParticipant(participantData);

      // Load property matches
      const { data: matches } = await supabase
        .from('property_matches')
        .select('match_score')
        .eq('participant_id', participantData.id)
        .gte('match_score', 60);

      setMatchCount(matches?.length || 0);
      setExcellentMatches(matches?.filter(m => m.match_score >= 80).length || 0);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutParticipant();
    toast.success("Signed out successfully");
    navigate('/participant/login');
  };

  const getJourneyProgress = () => {
    if (!participant) return 0;

    let progress = 0;

    // Profile created: 20%
    progress += 20;

    // Documents uploaded: 30%
    if (participant.ndis_plan_uploaded) progress += 10;
    if (participant.id_uploaded) progress += 10;
    if (participant.income_proof_uploaded) progress += 10;

    // Preferences set: 20%
    if (participant.preferred_locations?.length > 0) progress += 10;
    if (participant.max_weekly_budget) progress += 10;

    // Matches found: 20%
    if (matchCount > 0) progress += 10;
    if (excellentMatches > 0) progress += 10;

    // Viewing scheduled: 10%
    if (participant.status === 'viewing') progress += 10;

    return Math.min(progress, 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "outline", label: string }> = {
      new: { variant: "secondary", label: "Getting Started" },
      qualifying: { variant: "secondary", label: "Qualifying" },
      matched: { variant: "default", label: "Matched" },
      viewing: { variant: "default", label: "Viewing Properties" },
      application: { variant: "default", label: "Application In Progress" },
      approved: { variant: "default", label: "Approved!" },
      'moved-in': { variant: "outline", label: "Moved In" }
    };

    const config = statusConfig[status] || statusConfig.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!participant) {
    return null;
  }

  const journeyProgress = getJourneyProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">My SDA Journey</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/participant/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {participant.full_name.split(' ')[0]}!
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Your homeownership journey</p>
            {getStatusBadge(participant.status)}
          </div>
        </div>

        {/* Journey Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Progress to Homeownership
            </CardTitle>
            <CardDescription>
              You're {journeyProgress}% of the way there!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={journeyProgress} className="mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                {participant.ndis_plan_uploaded ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>NDIS Plan</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {participant.id_uploaded ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>ID Document</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {participant.preferred_locations?.length > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Preferences</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {matchCount > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Matches Found</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/participant/matches')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{matchCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {excellentMatches} excellent matches
                  </p>
                </div>
                <Star className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saved Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Favorites</p>
                </div>
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Submitted</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>Complete these to improve your matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!participant.ndis_plan_uploaded && (
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/participant/documents')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload NDIS Plan
                </Button>
              )}
              {!participant.id_uploaded && (
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/participant/documents')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload ID Document
                </Button>
              )}
              {!participant.preferred_locations || participant.preferred_locations.length === 0 && (
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/participant/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Set Location Preferences
                </Button>
              )}
              <Button className="w-full justify-start" onClick={() => navigate('/participant/matches')}>
                <Star className="h-4 w-4 mr-2" />
                View My Property Matches
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
              <CardDescription>Your scheduled activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming viewings scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
