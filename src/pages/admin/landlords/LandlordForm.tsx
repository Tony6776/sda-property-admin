import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { toast } from "sonner";

const landlordSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  business_name: z.string().optional(),
  abn: z.string().optional(),
  address: z.string().optional(),
  bank_name: z.string().optional(),
  bank_bsb: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_name: z.string().optional(),
  ndis_registered: z.boolean(),
  registration_number: z.string().optional(),
  registration_expiry: z.string().optional(),
  insurance_expiry: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]),
  notes: z.string().optional(),
});

type LandlordFormData = z.infer<typeof landlordSchema>;

export default function LandlordForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LandlordFormData>({
    resolver: zodResolver(landlordSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      business_name: "",
      abn: "",
      address: "",
      bank_name: "",
      bank_bsb: "",
      bank_account_number: "",
      bank_account_name: "",
      ndis_registered: false,
      registration_number: "",
      registration_expiry: "",
      insurance_expiry: "",
      status: "active",
      notes: "",
    },
  });

  const ndisRegistered = watch("ndis_registered");
  const status = watch("status");

  useEffect(() => {
    // Get organization_id from admin_users
    const fetchOrganizationId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('admin_users')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();
        if (data) {
          setOrganizationId(data.organization_id);
        }
      }
    };
    fetchOrganizationId();

    if (isEditMode) {
      fetchLandlord();
    }
  }, [id, isEditMode]);

  const fetchLandlord = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('landlords')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        Object.keys(data).forEach((key) => {
          if (key in landlordSchema.shape) {
            setValue(key as keyof LandlordFormData, data[key]);
          }
        });
      }
    } catch (error: any) {
      console.error('Error fetching landlord:', error);
      toast.error('Failed to load landlord details');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LandlordFormData) => {
    try {
      setLoading(true);

      const landlordData = {
        ...data,
        organization_id: organizationId,
        email: data.email || null,
        phone: data.phone || null,
        business_name: data.business_name || null,
        abn: data.abn || null,
        address: data.address || null,
        bank_name: data.bank_name || null,
        bank_bsb: data.bank_bsb || null,
        bank_account_number: data.bank_account_number || null,
        bank_account_name: data.bank_account_name || null,
        registration_number: data.registration_number || null,
        registration_expiry: data.registration_expiry || null,
        insurance_expiry: data.insurance_expiry || null,
        notes: data.notes || null,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('landlords')
          .update(landlordData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Landlord updated successfully');
      } else {
        const { error } = await supabase
          .from('landlords')
          .insert([landlordData]);

        if (error) throw error;
        toast.success('Landlord created successfully');
      }

      navigate('/admin/landlords');
    } catch (error: any) {
      console.error('Error saving landlord:', error);
      toast.error(error.message || 'Failed to save landlord');
    } finally {
      setLoading(false);
    }
  };

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
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/landlords')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Landlords
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">
                  {isEditMode ? 'Edit Landlord' : 'Add New Landlord'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    {...register("full_name")}
                    placeholder="John Smith"
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="0400 000 000"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value) => setValue("status", value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="123 Main St, Sydney NSW 2000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    {...register("business_name")}
                    placeholder="ABC Properties Pty Ltd"
                  />
                </div>

                <div>
                  <Label htmlFor="abn">ABN</Label>
                  <Input
                    id="abn"
                    {...register("abn")}
                    placeholder="12 345 678 901"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Banking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    {...register("bank_name")}
                    placeholder="Commonwealth Bank"
                  />
                </div>

                <div>
                  <Label htmlFor="bank_account_name">Account Name</Label>
                  <Input
                    id="bank_account_name"
                    {...register("bank_account_name")}
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <Label htmlFor="bank_bsb">BSB</Label>
                  <Input
                    id="bank_bsb"
                    {...register("bank_bsb")}
                    placeholder="062-000"
                  />
                </div>

                <div>
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    {...register("bank_account_number")}
                    placeholder="12345678"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ndis_registered"
                  checked={ndisRegistered}
                  onCheckedChange={(checked) => setValue("ndis_registered", checked as boolean)}
                />
                <Label htmlFor="ndis_registered" className="cursor-pointer">
                  NDIS Registered Provider
                </Label>
              </div>

              {ndisRegistered && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="registration_number">Registration Number</Label>
                    <Input
                      id="registration_number"
                      {...register("registration_number")}
                      placeholder="NDIS-123456"
                    />
                  </div>

                  <div>
                    <Label htmlFor="registration_expiry">Registration Expiry</Label>
                    <Input
                      id="registration_expiry"
                      type="date"
                      {...register("registration_expiry")}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="insurance_expiry">Insurance Expiry Date</Label>
                <Input
                  id="insurance_expiry"
                  type="date"
                  {...register("insurance_expiry")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register("notes")}
                placeholder="Add any additional notes about this landlord..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/landlords')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : isEditMode ? 'Update Landlord' : 'Create Landlord'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
