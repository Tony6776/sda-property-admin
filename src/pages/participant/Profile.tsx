import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { checkParticipantAuth } from "@/lib/participantAuth";
import { toast } from "sonner";
import { ArrowLeft, Save, User, MapPin, DollarSign, Home as HomeIcon, Accessibility } from "lucide-react";

const LOCATIONS = [
  'Melbourne CBD',
  'Melbourne East',
  'Melbourne West',
  'Melbourne North',
  'Melbourne South',
  'Sydney CBD',
  'Sydney North',
  'Sydney West',
  'Sydney East',
  'Brisbane CBD',
  'Brisbane North',
  'Brisbane South',
];

const SDA_CATEGORIES = [
  'Improved Liveability',
  'Fully Accessible',
  'Robust',
  'High Physical Support'
];

const PATHWAYS = [
  { value: 'deposit-ready', label: 'Deposit Ready' },
  { value: 'rent-to-buy', label: 'Rent to Buy' },
  { value: 'equity-share', label: 'Equity Share' }
];

export default function ParticipantProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [participantId, setParticipantId] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    ndis_number: '',
    sda_category: '',
    sda_funding_level: '',
    preferred_locations: [] as string[],
    max_weekly_budget: '',
    min_bedrooms: '1',
    min_bathrooms: '1',
    pathway_interest: [] as string[],
    deposit_available: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { isAuthenticated, participant } = await checkParticipantAuth();

      if (!isAuthenticated) {
        navigate('/participant/login');
        return;
      }

      setParticipantId(participant.id);
      setFormData({
        full_name: participant.full_name || '',
        email: participant.email || '',
        phone: participant.phone || '',
        ndis_number: participant.ndis_number || '',
        sda_category: participant.sda_category || '',
        sda_funding_level: participant.sda_funding_level?.toString() || '',
        preferred_locations: participant.preferred_locations || [],
        max_weekly_budget: participant.max_weekly_budget?.toString() || '',
        min_bedrooms: participant.min_bedrooms?.toString() || '1',
        min_bathrooms: participant.min_bathrooms?.toString() || '1',
        pathway_interest: participant.pathway_interest || [],
        deposit_available: participant.deposit_available?.toString() || '',
      });

    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from('participants')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          ndis_number: formData.ndis_number,
          sda_category: formData.sda_category,
          sda_funding_level: formData.sda_funding_level ? parseFloat(formData.sda_funding_level) : null,
          preferred_locations: formData.preferred_locations,
          max_weekly_budget: formData.max_weekly_budget ? parseFloat(formData.max_weekly_budget) : null,
          min_bedrooms: formData.min_bedrooms ? parseInt(formData.min_bedrooms) : 1,
          min_bathrooms: formData.min_bathrooms ? parseInt(formData.min_bathrooms) : 1,
          pathway_interest: formData.pathway_interest,
          deposit_available: formData.deposit_available ? parseFloat(formData.deposit_available) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', participantId);

      if (error) throw error;

      // Update lead score
      await supabase.rpc('calculate_participant_lead_score', { participant_id: participantId });

      // Log activity
      await supabase.from('lead_activities').insert({
        participant_id: participantId,
        activity_type: 'profile_updated',
        activity_data: { timestamp: new Date().toISOString() }
      });

      toast.success('Profile updated successfully!');

      // Trigger AI matching
      toast.info('Finding new property matches...');

    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.includes(location)
        ? prev.preferred_locations.filter(l => l !== location)
        : [...prev.preferred_locations, location]
    }));
  };

  const togglePathway = (pathway: string) => {
    setFormData(prev => ({
      ...prev,
      pathway_interest: prev.pathway_interest.includes(pathway)
        ? prev.pathway_interest.filter(p => p !== pathway)
        : [...prev.pathway_interest, pathway]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
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
              <h1 className="text-xl font-bold">My Profile</h1>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic details about you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="0400 123 456"
                />
              </div>
            </CardContent>
          </Card>

          {/* NDIS Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                NDIS Information
              </CardTitle>
              <CardDescription>Your NDIS plan details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ndis_number">NDIS Number</Label>
                  <Input
                    id="ndis_number"
                    value={formData.ndis_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, ndis_number: e.target.value }))}
                    placeholder="NDIS12345678"
                  />
                </div>
                <div>
                  <Label htmlFor="sda_category">SDA Category</Label>
                  <select
                    id="sda_category"
                    value={formData.sda_category}
                    onChange={(e) => setFormData(prev => ({ ...prev, sda_category: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {SDA_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="sda_funding_level">Weekly SDA Funding Amount ($)</Label>
                <Input
                  id="sda_funding_level"
                  type="number"
                  value={formData.sda_funding_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, sda_funding_level: e.target.value }))}
                  placeholder="850"
                />
              </div>
            </CardContent>
          </Card>

          {/* Housing Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Preferences
              </CardTitle>
              <CardDescription>Where would you like to live?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LOCATIONS.map(location => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={location}
                      checked={formData.preferred_locations.includes(location)}
                      onCheckedChange={() => toggleLocation(location)}
                    />
                    <Label htmlFor={location} className="text-sm cursor-pointer">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget & Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget & Requirements
              </CardTitle>
              <CardDescription>Your budget and property requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="max_weekly_budget">Maximum Weekly Budget ($)</Label>
                <Input
                  id="max_weekly_budget"
                  type="number"
                  value={formData.max_weekly_budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_weekly_budget: e.target.value }))}
                  placeholder="850"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_bedrooms">Minimum Bedrooms</Label>
                  <Input
                    id="min_bedrooms"
                    type="number"
                    min="1"
                    value={formData.min_bedrooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_bedrooms: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="min_bathrooms">Minimum Bathrooms</Label>
                  <Input
                    id="min_bathrooms"
                    type="number"
                    min="1"
                    value={formData.min_bathrooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_bathrooms: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Homeownership Pathway */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HomeIcon className="h-5 w-5" />
                Homeownership Pathway
              </CardTitle>
              <CardDescription>Which pathways are you interested in?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {PATHWAYS.map(pathway => (
                  <div key={pathway.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={pathway.value}
                      checked={formData.pathway_interest.includes(pathway.value)}
                      onCheckedChange={() => togglePathway(pathway.value)}
                    />
                    <Label htmlFor={pathway.value} className="cursor-pointer">
                      {pathway.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.pathway_interest.includes('deposit-ready') && (
                <div>
                  <Label htmlFor="deposit_available">Deposit Available ($)</Label>
                  <Input
                    id="deposit_available"
                    type="number"
                    value={formData.deposit_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, deposit_available: e.target.value }))}
                    placeholder="50000"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving Profile...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
