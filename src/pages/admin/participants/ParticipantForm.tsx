import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface ParticipantFormData {
  name: string;
  ndis_number: string;
  date_of_birth: string;
  age: number;
  disability_category: string;
  support_level: string;
  plan_start_date: string;
  plan_end_date: string;
  funding_amount: number;
  support_coordinator_name: string;
  support_coordinator_email: string;
  support_coordinator_phone: string;
  current_housing_type: string;
  housing_status: string;
  housing_preferences: string;
  participant_status: string;
  priority_level: string;
  notes: string;
}

export default function ParticipantForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ParticipantFormData>({
    name: "",
    ndis_number: "",
    date_of_birth: "",
    age: 0,
    disability_category: "",
    support_level: "Medium",
    plan_start_date: "",
    plan_end_date: "",
    funding_amount: 0,
    support_coordinator_name: "",
    support_coordinator_email: "",
    support_coordinator_phone: "",
    current_housing_type: "",
    housing_status: "Seeking SDA",
    housing_preferences: "",
    participant_status: "active",
    priority_level: "medium",
    notes: "",
  });

  useEffect(() => {
    if (isEdit) {
      fetchParticipant();
    }
  }, [id]);

  const fetchParticipant = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || "",
          ndis_number: data.ndis_number || "",
          date_of_birth: data.date_of_birth || "",
          age: data.age || 0,
          disability_category: data.disability_category || "",
          support_level: data.support_level || "Medium",
          plan_start_date: data.plan_start_date || "",
          plan_end_date: data.plan_end_date || "",
          funding_amount: data.funding_amount || 0,
          support_coordinator_name: data.support_coordinator_name || "",
          support_coordinator_email: data.support_coordinator_email || "",
          support_coordinator_phone: data.support_coordinator_phone || "",
          current_housing_type: data.current_housing_type || "",
          housing_status: data.housing_status || "Seeking SDA",
          housing_preferences: data.housing_preferences || "",
          participant_status: data.participant_status || "active",
          priority_level: data.priority_level || "medium",
          notes: data.notes || "",
        });
      }
    } catch (error: any) {
      console.error('Error fetching participant:', error);
      toast.error("Failed to load participant");
      navigate('/admin/participants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.ndis_number) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const participantData = {
        ...formData,
        date_of_birth: formData.date_of_birth || null,
        plan_start_date: formData.plan_start_date || null,
        plan_end_date: formData.plan_end_date || null,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('participants')
          .update({
            ...participantData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        toast.success("Participant updated successfully");
      } else {
        const { error } = await supabase
          .from('participants')
          .insert([participantData]);

        if (error) throw error;
        toast.success("Participant created successfully");
      }

      navigate('/admin/participants');
    } catch (error: any) {
      console.error('Error saving participant:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} participant: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ParticipantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/participants')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Participants
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">{isEdit ? 'Edit Participant' : 'Add New Participant'}</h1>
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
                <CardDescription>Basic participant details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g., Jessica Teasdale"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ndis_number">NDIS Number *</Label>
                    <Input
                      id="ndis_number"
                      value={formData.ndis_number}
                      onChange={(e) => handleChange('ndis_number', e.target.value)}
                      placeholder="e.g., 431187858"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                      placeholder="32"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disability & Support */}
            <Card>
              <CardHeader>
                <CardTitle>Disability & Support Information</CardTitle>
                <CardDescription>Disability category and support requirements</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="disability_category">Disability Category</Label>
                    <Input
                      id="disability_category"
                      value={formData.disability_category}
                      onChange={(e) => handleChange('disability_category', e.target.value)}
                      placeholder="e.g., Physical, Intellectual"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="support_level">Support Level</Label>
                    <Select value={formData.support_level} onValueChange={(value) => handleChange('support_level', value)}>
                      <SelectTrigger id="support_level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Very High">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NDIS Plan */}
            <Card>
              <CardHeader>
                <CardTitle>NDIS Plan Information</CardTitle>
                <CardDescription>Plan dates and funding details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="plan_start_date">Plan Start Date</Label>
                    <Input
                      id="plan_start_date"
                      type="date"
                      value={formData.plan_start_date}
                      onChange={(e) => handleChange('plan_start_date', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="plan_end_date">Plan End Date</Label>
                    <Input
                      id="plan_end_date"
                      type="date"
                      value={formData.plan_end_date}
                      onChange={(e) => handleChange('plan_end_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="funding_amount">Funding Amount ($)</Label>
                  <Input
                    id="funding_amount"
                    type="number"
                    value={formData.funding_amount}
                    onChange={(e) => handleChange('funding_amount', parseFloat(e.target.value) || 0)}
                    placeholder="150000"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Support Coordinator */}
            <Card>
              <CardHeader>
                <CardTitle>Support Coordinator</CardTitle>
                <CardDescription>Support coordinator contact details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="support_coordinator_name">Coordinator Name</Label>
                  <Input
                    id="support_coordinator_name"
                    value={formData.support_coordinator_name}
                    onChange={(e) => handleChange('support_coordinator_name', e.target.value)}
                    placeholder="e.g., Lisa Anderson"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="support_coordinator_email">Coordinator Email</Label>
                    <Input
                      id="support_coordinator_email"
                      type="email"
                      value={formData.support_coordinator_email}
                      onChange={(e) => handleChange('support_coordinator_email', e.target.value)}
                      placeholder="lisa@example.com"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="support_coordinator_phone">Coordinator Phone</Label>
                    <Input
                      id="support_coordinator_phone"
                      value={formData.support_coordinator_phone}
                      onChange={(e) => handleChange('support_coordinator_phone', e.target.value)}
                      placeholder="0400 000 000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Housing */}
            <Card>
              <CardHeader>
                <CardTitle>Housing Information</CardTitle>
                <CardDescription>Current housing and preferences</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current_housing_type">Current Housing Type</Label>
                    <Input
                      id="current_housing_type"
                      value={formData.current_housing_type}
                      onChange={(e) => handleChange('current_housing_type', e.target.value)}
                      placeholder="e.g., Group Home, Independent Living"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="housing_status">Housing Status</Label>
                    <Select value={formData.housing_status} onValueChange={(value) => handleChange('housing_status', value)}>
                      <SelectTrigger id="housing_status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Seeking SDA">Seeking SDA</SelectItem>
                        <SelectItem value="In SDA">In SDA</SelectItem>
                        <SelectItem value="Matched">Matched</SelectItem>
                        <SelectItem value="On Waitlist">On Waitlist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="housing_preferences">Housing Preferences</Label>
                  <Textarea
                    id="housing_preferences"
                    value={formData.housing_preferences}
                    onChange={(e) => handleChange('housing_preferences', e.target.value)}
                    placeholder="Describe preferred location, property type, accessibility needs..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status & Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Notes</CardTitle>
                <CardDescription>Participant status and additional information</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="participant_status">Participant Status</Label>
                    <Select value={formData.participant_status} onValueChange={(value) => handleChange('participant_status', value)}>
                      <SelectTrigger id="participant_status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="priority_level">Priority Level</Label>
                    <Select value={formData.priority_level} onValueChange={(value) => handleChange('priority_level', value)}>
                      <SelectTrigger id="priority_level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Any additional notes about the participant..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/participants')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : isEdit ? 'Update Participant' : 'Create Participant'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
