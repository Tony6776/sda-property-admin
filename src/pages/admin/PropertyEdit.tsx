import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Building, Users, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FEATURE_OPTIONS = [
  'Wheelchair Accessible',
  'Step-free Entry',
  'Accessible Bathroom',
  'Wide Doorways',
  'Accessible Kitchen',
  'Parking Available',
  'Near Public Transport',
  'Fully Furnished',
  'Air Conditioning',
  'Heating',
  'Garden/Outdoor Space',
  'NDIS Approved'
];

const SDA_FUNDING_CATEGORIES = [
  'Improved Liveability',
  'Fully Accessible',
  'Robust',
  'High Physical Support'
];

const DWELLING_TYPES = [
  'Villa',
  'Apartment',
  'House'
];

const ORGANIZATIONS = [
  { id: 'homelander', name: 'Homelander SDA Solutions' },
  { id: 'plcg', name: 'PLCG - Private Lending & Capital Group' },
  { id: 'channel_agent', name: 'Channel Agent Real Estate' }
];

const AUDIENCES = [
  { value: 'participant', label: 'Participant (NDIS)' },
  { value: 'investor', label: 'Investor' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'mixed', label: 'Mixed Audience' }
];

const STATUS_OPTIONS = [
  { value: 'available', label: '✅ Live' },
  { value: 'hold', label: '⏸️ On Hold' },
  { value: 'application review ', label: '👀 Review' },
  { value: 'lead_new', label: '📧 New Lead' },
  { value: 'participant_active', label: '👤 Participant' },
  { value: 'sold', label: '💰 Sold' },
  { value: 'leased', label: '🏠 Leased' }
];

export default function PropertyEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    address: '',
    property_type: 'lease',
    status: 'available',
    price: '',
    weekly_rent: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    sda_category: '',
    property_manager: '',
    features: [],
    organization_id: 'homelander',
    audience: 'mixed',
    visible_on_participant_site: true,
    visible_on_investor_site: false
  });

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || '',
        address: data.address || '',
        property_type: data.property_type || 'lease',
        status: data.status || 'available',
        price: data.price?.toString() || '',
        weekly_rent: data.weekly_rent?.toString() || '',
        bedrooms: data.bedrooms?.toString() || '',
        bathrooms: data.bathrooms?.toString() || '',
        parking: data.parking?.toString() || '',
        sda_category: data.sda_category || '',
        property_manager: data.property_manager || '',
        features: data.features || [],
        organization_id: data.organization_id || 'homelander',
        audience: data.audience || 'mixed',
        visible_on_participant_site: data.visible_on_participant_site ?? true,
        visible_on_investor_site: data.visible_on_investor_site ?? false
      });

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
      navigate('/admin/dashboard');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev: any) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f: string) => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        name: formData.name,
        address: formData.address,
        property_type: formData.property_type,
        status: formData.status,
        price: formData.price ? parseFloat(formData.price) : null,
        weekly_rent: formData.weekly_rent ? parseFloat(formData.weekly_rent) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        parking: formData.parking ? parseInt(formData.parking) : null,
        sda_category: formData.sda_category || null,
        property_manager: formData.property_manager || null,
        features: formData.features,
        organization_id: formData.organization_id,
        audience: formData.audience,
        visible_on_participant_site: formData.visible_on_participant_site,
        visible_on_investor_site: formData.visible_on_investor_site,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Property updated successfully');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast.error(error.message || 'Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading property...</p>
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
              <h1 className="text-xl font-bold">Edit Property</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lease">For Lease</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.property_type === 'sale' && (
                  <div>
                    <Label htmlFor="price">Sale Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="weekly_rent">Weekly Rent / SDA Funding ($)</Label>
                  <Input
                    id="weekly_rent"
                    type="number"
                    value={formData.weekly_rent}
                    onChange={(e) => handleInputChange('weekly_rent', e.target.value)}
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="parking">Parking Spaces</Label>
                  <Input
                    id="parking"
                    type="number"
                    value={formData.parking}
                    onChange={(e) => handleInputChange('parking', e.target.value)}
                  />
                </div>
              </div>

              {/* Type of Dwelling and Property Manager */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sda_category">Type of Dwelling</Label>
                  <Select value={formData.sda_category} onValueChange={(value) => handleInputChange('sda_category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dwelling type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DWELLING_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="property_manager">Property Manager</Label>
                  <Input
                    id="property_manager"
                    value={formData.property_manager}
                    onChange={(e) => handleInputChange('property_manager', e.target.value)}
                  />
                </div>
              </div>

              {/* Multi-Tenant Settings */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Organization & Audience
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="organization_id">Managing Organization *</Label>
                    <Select value={formData.organization_id} onValueChange={(value) => handleInputChange('organization_id', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORGANIZATIONS.map(org => (
                          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="audience">Target Audience *</Label>
                    <Select value={formData.audience} onValueChange={(value) => handleInputChange('audience', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIENCES.map(aud => (
                          <SelectItem key={aud.value} value={aud.value}>{aud.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Website Visibility
                  </Label>
                  <div className="flex flex-col gap-3 ml-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="visible_participant"
                        checked={formData.visible_on_participant_site}
                        onCheckedChange={(checked) => handleInputChange('visible_on_participant_site', checked)}
                      />
                      <Label htmlFor="visible_participant" className="text-sm font-normal cursor-pointer">
                        Show on Participant Site (sdabyhomelander.com.au)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="visible_investor"
                        checked={formData.visible_on_investor_site}
                        onCheckedChange={(checked) => handleInputChange('visible_on_investor_site', checked)}
                      />
                      <Label htmlFor="visible_investor" className="text-sm font-normal cursor-pointer">
                        Show on Investor Site (sdacapital.com.au)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <Label>Features</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {FEATURE_OPTIONS.map(feature => (
                    <Badge
                      key={feature}
                      variant={formData.features.includes(feature) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFeatureToggle(feature)}
                    >
                      {feature}
                      {formData.features.includes(feature) && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
