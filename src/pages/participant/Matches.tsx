import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { checkParticipantAuth } from "@/lib/participantAuth";
import { toast } from "sonner";
import {
  ArrowLeft,
  Star,
  MapPin,
  Bed,
  Bath,
  DollarSign,
  Heart,
  Eye,
  RefreshCw,
  TrendingUp,
  CheckCircle2
} from "lucide-react";

interface PropertyMatch {
  id: string;
  property_id: string;
  match_score: number;
  match_reasons: Array<{ reason: string; score: number; details?: string }>;
  status: string;
  property: {
    id: string;
    name: string;
    address: string;
    property_type: string;
    weekly_rent: number | null;
    price: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    sda_category: string | null;
    accessibility: {
      images?: string[];
    } | null;
    features: string[];
  };
}

export default function ParticipantMatches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<PropertyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'excellent' | 'good'>('all');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const { isAuthenticated, participant } = await checkParticipantAuth();

      if (!isAuthenticated) {
        navigate('/participant/login');
        return;
      }

      // Fetch matches with property details
      const { data, error } = await supabase
        .from('property_matches')
        .select(`
          id,
          property_id,
          match_score,
          match_reasons,
          status,
          property:properties (
            id,
            name,
            address,
            property_type,
            weekly_rent,
            price,
            bedrooms,
            bathrooms,
            sda_category,
            accessibility,
            features
          )
        `)
        .eq('participant_id', participant.id)
        .gte('match_score', 60)
        .order('match_score', { ascending: false });

      if (error) throw error;

      setMatches(data || []);

    } catch (error: any) {
      console.error('Error loading matches:', error);
      toast.error('Failed to load property matches');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkViewed = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('property_matches')
        .update({
          status: 'viewed',
          viewed_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (error) throw error;

      toast.success('Marked as viewed');
      loadMatches();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const handleMarkInterested = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('property_matches')
        .update({
          status: 'interested',
          interested_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (error) throw error;

      toast.success('Marked as interested! Our team will contact you soon.');
      loadMatches();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const getMatchQuality = (score: number) => {
    if (score >= 80) return { label: 'Excellent Match', variant: 'default' as const, color: 'text-green-600' };
    if (score >= 60) return { label: 'Good Match', variant: 'secondary' as const, color: 'text-blue-600' };
    return { label: 'Fair Match', variant: 'outline' as const, color: 'text-gray-600' };
  };

  const filteredMatches = matches.filter(m => {
    if (filter === 'excellent') return m.match_score >= 80;
    if (filter === 'good') return m.match_score >= 60 && m.match_score < 80;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/participant/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">Your Property Matches</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Matches ({matches.length})
          </Button>
          <Button
            variant={filter === 'excellent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('excellent')}
          >
            Excellent ({matches.filter(m => m.match_score >= 80).length})
          </Button>
          <Button
            variant={filter === 'good' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('good')}
          >
            Good ({matches.filter(m => m.match_score >= 60 && m.match_score < 80).length})
          </Button>
        </div>

        {filteredMatches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Matches Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Complete your profile to get personalized property recommendations
              </p>
              <Button onClick={() => navigate('/participant/profile')}>
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredMatches.map((match) => {
              const property = match.property;
              const imageUrl = property.accessibility?.images?.[0];
              const matchQuality = getMatchQuality(match.match_score);

              return (
                <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-[300px,1fr] gap-6">
                    {/* Property Image */}
                    <div className="relative h-64 md:h-auto bg-muted">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No image available
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge variant={matchQuality.variant} className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {match.match_score}% Match
                        </Badge>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{property.name}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{property.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Property Stats */}
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <Bed className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{property.bedrooms || 0} bed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bath className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{property.bathrooms || 0} bath</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            ${property.weekly_rent || 0}/week
                          </span>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Why this is a great match:
                        </h4>
                        <div className="space-y-1">
                          {match.match_reasons.slice(0, 3).map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span>{reason.reason}</span>
                              {reason.details && (
                                <span className="text-muted-foreground">- {reason.details}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SDA Category */}
                      {property.sda_category && (
                        <div className="mb-4">
                          <Badge variant="outline">{property.sda_category}</Badge>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {match.status === 'suggested' && (
                          <>
                            <Button onClick={() => handleMarkViewed(match.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Mark as Viewed
                            </Button>
                            <Button variant="default" onClick={() => handleMarkInterested(match.id)}>
                              <Heart className="h-4 w-4 mr-2" />
                              I'm Interested
                            </Button>
                          </>
                        )}
                        {match.status === 'viewed' && (
                          <Button variant="default" onClick={() => handleMarkInterested(match.id)}>
                            <Heart className="h-4 w-4 mr-2" />
                            I'm Interested
                          </Button>
                        )}
                        {match.status === 'interested' && (
                          <Badge variant="default" className="py-2 px-4">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            You're interested - We'll contact you soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
