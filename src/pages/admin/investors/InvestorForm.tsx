import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface InvestorFormData {
  full_name: string;
  email: string;
  phone?: string;
  available_capital: number;
  preferred_property_types: string[];
  preferred_locations: string[];
  risk_tolerance: string;
  organization_id: string;
}

const PROPERTY_TYPES = [
  { value: "renovation", label: "Renovation" },
  { value: "new_build", label: "New Build" },
  { value: "acquisition", label: "Acquisition" },
  { value: "development", label: "Development" },
  { value: "sda_conversion", label: "SDA Conversion" },
];

const LOCATIONS = [
  { value: "melbourne_cbd", label: "Melbourne CBD" },
  { value: "melbourne_inner", label: "Melbourne Inner Suburbs" },
  { value: "melbourne_outer", label: "Melbourne Outer Suburbs" },
  { value: "sydney_cbd", label: "Sydney CBD" },
  { value: "sydney_inner", label: "Sydney Inner Suburbs" },
  { value: "sydney_outer", label: "Sydney Outer Suburbs" },
  { value: "brisbane", label: "Brisbane" },
  { value: "perth", label: "Perth" },
  { value: "adelaide", label: "Adelaide" },
  { value: "regional_vic", label: "Regional Victoria" },
  { value: "regional_nsw", label: "Regional NSW" },
];

export default function InvestorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<InvestorFormData>({
    full_name: "",
    email: "",
    phone: "",
    available_capital: 0,
    preferred_property_types: [],
    preferred_locations: [],
    risk_tolerance: "medium",
    organization_id: "plcg",
  });

  useEffect(() => {
    if (isEdit) {
      fetchInvestor();
    }
  }, [id]);

  const fetchInvestor = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('investors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          available_capital: data.available_capital || 0,
          preferred_property_types: data.preferred_property_types || [],
          preferred_locations: data.preferred_locations || [],
          risk_tolerance: data.risk_tolerance || "medium",
          organization_id: data.organization_id || "plcg",
        });
      }
    } catch (error: any) {
      console.error('Error fetching investor:', error);
      toast.error("Failed to load investor");
      navigate('/admin/investors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        const { error } = await supabase
          .from('investors')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        toast.success("Investor updated successfully");
      } else {
        const { error } = await supabase
          .from('investors')
          .insert([formData]);

        if (error) throw error;
        toast.success("Investor created successfully");
      }

      navigate('/admin/investors');
    } catch (error: any) {
      console.error('Error saving investor:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} investor: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof InvestorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePropertyTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_property_types: prev.preferred_property_types.includes(type)
        ? prev.preferred_property_types.filter(t => t !== type)
        : [...prev.preferred_property_types, type]
    }));
  };

  const handleLocationToggle = (location: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.includes(location)
        ? prev.preferred_locations.filter(l => l !== location)
        : [...prev.preferred_locations, location]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          </CardContent>
        </Card>
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/investors')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Investors
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">{isEdit ? 'Edit Investor' : 'Add New Investor'}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic contact details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    placeholder="e.g., John Smith"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+61 400 000 000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Profile</CardTitle>
                <CardDescription>Investment capacity and preferences</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="available_capital">Available Capital ($)</Label>
                  <Input
                    id="available_capital"
                    type="number"
                    value={formData.available_capital}
                    onChange={(e) => handleChange('available_capital', parseFloat(e.target.value) || 0)}
                    placeholder="500000"
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="risk_tolerance">Risk Tolerance</Label>
                  <Select
                    value={formData.risk_tolerance}
                    onValueChange={(value) => handleChange('risk_tolerance', value)}
                  >
                    <SelectTrigger id="risk_tolerance">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Conservative investments</SelectItem>
                      <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                      <SelectItem value="high">High - Aggressive growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Preferred Property Types */}
            <Card>
              <CardHeader>
                <CardTitle>Preferred Property Types</CardTitle>
                <CardDescription>Select all property types of interest</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {PROPERTY_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.value}`}
                        checked={formData.preferred_property_types.includes(type.value)}
                        onCheckedChange={() => handlePropertyTypeToggle(type.value)}
                      />
                      <label
                        htmlFor={`type-${type.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preferred Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Preferred Locations</CardTitle>
                <CardDescription>Select all locations of interest</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {LOCATIONS.map((location) => (
                    <div key={location.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location.value}`}
                        checked={formData.preferred_locations.includes(location.value)}
                        onCheckedChange={() => handleLocationToggle(location.value)}
                      />
                      <label
                        htmlFor={`location-${location.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {location.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/investors')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : isEdit ? 'Update Investor' : 'Create Investor'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
