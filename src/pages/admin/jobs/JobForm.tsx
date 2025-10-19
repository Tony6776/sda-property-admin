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

interface JobFormData {
  job_name: string;
  job_type: string;
  description: string;
  property_address: string;
  total_investment_required: number;
  expected_roi: number;
  status: string;
  progress_percentage: number;
  estimated_start_date?: string;
  estimated_completion_date?: string;
  organization_id: string;
}

export default function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    job_name: "",
    job_type: "renovation",
    description: "",
    property_address: "",
    total_investment_required: 0,
    expected_roi: 0,
    status: "new",
    progress_percentage: 0,
    organization_id: "plcg",
  });

  useEffect(() => {
    if (isEdit) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          job_name: data.job_name || "",
          job_type: data.job_type || "renovation",
          description: data.description || "",
          property_address: data.property_address || "",
          total_investment_required: data.total_investment_required || 0,
          expected_roi: data.expected_roi || 0,
          status: data.status || "new",
          progress_percentage: data.progress_percentage || 0,
          estimated_start_date: data.estimated_start_date || "",
          estimated_completion_date: data.estimated_completion_date || "",
          organization_id: data.organization_id || "plcg",
        });
      }
    } catch (error: any) {
      console.error('Error fetching job:', error);
      toast.error("Failed to load job");
      navigate('/admin/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.job_name || !formData.property_address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      // Prepare data - convert empty strings to null for optional date fields
      const jobData = {
        ...formData,
        estimated_start_date: formData.estimated_start_date || null,
        estimated_completion_date: formData.estimated_completion_date || null,
      };

      console.log('Submitting job data:', jobData);

      if (isEdit) {
        const { error } = await supabase
          .from('jobs')
          .update({
            ...jobData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        toast.success("Job updated successfully");
      } else {
        const { data, error } = await supabase
          .from('jobs')
          .insert([jobData])
          .select();

        console.log('Insert response:', { data, error });

        if (error) throw error;
        toast.success("Job created successfully");
      }

      navigate('/admin/jobs');
    } catch (error: any) {
      console.error('Error saving job:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} job: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof JobFormData, value: any) => {
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/jobs')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">{isEdit ? 'Edit Job' : 'Add New Job'}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the core details of the job</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="job_name">Job Name *</Label>
                  <Input
                    id="job_name"
                    value={formData.job_name}
                    onChange={(e) => handleChange('job_name', e.target.value)}
                    placeholder="e.g., CBD Apartment Renovation"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select value={formData.job_type} onValueChange={(value) => handleChange('job_type', value)}>
                    <SelectTrigger id="job_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="renovation">Renovation</SelectItem>
                      <SelectItem value="new_build">New Build</SelectItem>
                      <SelectItem value="acquisition">Acquisition</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="sda_conversion">SDA Conversion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="property_address">Property Address *</Label>
                  <Input
                    id="property_address"
                    value={formData.property_address}
                    onChange={(e) => handleChange('property_address', e.target.value)}
                    placeholder="e.g., 123 Main St, Melbourne VIC 3000"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe the job, objectives, and key features..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
                <CardDescription>Investment requirements and returns</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="total_investment_required">Total Investment Required ($)</Label>
                    <Input
                      id="total_investment_required"
                      type="number"
                      value={formData.total_investment_required}
                      onChange={(e) => handleChange('total_investment_required', parseFloat(e.target.value) || 0)}
                      placeholder="500000"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="expected_roi">Expected ROI (%)</Label>
                    <Input
                      id="expected_roi"
                      type="number"
                      value={formData.expected_roi}
                      onChange={(e) => handleChange('expected_roi', parseFloat(e.target.value) || 0)}
                      placeholder="12.5"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline and Status */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline and Status</CardTitle>
                <CardDescription>Project timeline and current status</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="estimated_start_date">Start Date</Label>
                    <Input
                      id="estimated_start_date"
                      type="date"
                      value={formData.estimated_start_date}
                      onChange={(e) => handleChange('estimated_start_date', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="estimated_completion_date">Completion Date</Label>
                    <Input
                      id="estimated_completion_date"
                      type="date"
                      value={formData.estimated_completion_date}
                      onChange={(e) => handleChange('estimated_completion_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="funding_pending">Funding Pending</SelectItem>
                        <SelectItem value="funded">Funded</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="progress_percentage">Progress (%)</Label>
                    <Input
                      id="progress_percentage"
                      type="number"
                      value={formData.progress_percentage}
                      onChange={(e) => handleChange('progress_percentage', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/jobs')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : isEdit ? 'Update Job' : 'Create Job'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
