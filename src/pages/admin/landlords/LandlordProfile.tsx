import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { DocumentTabs } from "@/components/admin/DocumentTabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Landlord {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  business_name: string | null;
  abn: string | null;
  address: string | null;
  bank_name: string | null;
  bank_bsb: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  ndis_registered: boolean;
  registration_number: string | null;
  registration_expiry: string | null;
  insurance_expiry: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  property_type: string;
  status: string;
  bedrooms: number | null;
  bathrooms: number | null;
  weekly_rent: number | null;
}

export default function LandlordProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLandlordDetails();
      fetchProperties();
    }
  }, [id]);

  const fetchLandlordDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('landlords')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLandlord(data);
    } catch (error: any) {
      console.error('Error fetching landlord:', error);
      toast.error('Failed to load landlord details');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, address, property_type, status, bedrooms, bathrooms, weekly_rent')
        .eq('landlord_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPropertyStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      available: "default",
      occupied: "secondary",
      maintenance: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isExpiryWarning = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry < 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading landlord details...</p>
      </div>
    );
  }

  if (!landlord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Landlord not found</p>
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/landlords')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Landlords
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">{landlord.full_name}</h1>
                {getStatusBadge(landlord.status)}
              </div>
            </div>
            <Button onClick={() => navigate(`/admin/landlords/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Profile Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {landlord.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{landlord.email}</span>
                    </div>
                  )}
                  {landlord.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{landlord.phone}</span>
                    </div>
                  )}
                  {landlord.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{landlord.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {landlord.business_name && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{landlord.business_name}</p>
                        {landlord.abn && (
                          <p className="text-sm text-muted-foreground">ABN: {landlord.abn}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {!landlord.business_name && (
                    <p className="text-muted-foreground">No business details</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Banking Details */}
          {landlord.bank_name && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Banking Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p className="font-medium">{landlord.bank_name}</p>
                  </div>
                  {landlord.bank_account_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Account Name</p>
                      <p className="font-medium">{landlord.bank_account_name}</p>
                    </div>
                  )}
                  {landlord.bank_bsb && (
                    <div>
                      <p className="text-sm text-muted-foreground">BSB</p>
                      <p className="font-medium">{landlord.bank_bsb}</p>
                    </div>
                  )}
                  {landlord.bank_account_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium">{landlord.bank_account_number}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>NDIS Registered Provider</span>
                </div>
                {landlord.ndis_registered ? (
                  <Badge variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="outline">No</Badge>
                )}
              </div>

              {landlord.ndis_registered && (
                <div className="space-y-3 ml-6">
                  {landlord.registration_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Registration Number</p>
                      <p className="font-medium">{landlord.registration_number}</p>
                    </div>
                  )}
                  {landlord.registration_expiry && (
                    <div>
                      <p className="text-sm text-muted-foreground">Registration Expiry</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {new Date(landlord.registration_expiry).toLocaleDateString()}
                        </p>
                        {isExpired(landlord.registration_expiry) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                        {isExpiryWarning(landlord.registration_expiry) && (
                          <Badge variant="outline" className="text-orange-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {landlord.insurance_expiry && (
                <div>
                  <p className="text-sm text-muted-foreground">Insurance Expiry</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {new Date(landlord.insurance_expiry).toLocaleDateString()}
                    </p>
                    {isExpired(landlord.insurance_expiry) && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                    {isExpiryWarning(landlord.insurance_expiry) && (
                      <Badge variant="outline" className="text-orange-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {(isExpired(landlord.registration_expiry) || isExpired(landlord.insurance_expiry)) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This landlord has expired compliance documents. Please update immediately.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Properties ({properties.length})</CardTitle>
              <CardDescription>Properties managed by this landlord</CardDescription>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No properties linked to this landlord
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Beds/Baths</TableHead>
                        <TableHead>Weekly Rent</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow
                          key={property.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/admin/properties/${property.id}`)}
                        >
                          <TableCell className="font-medium">{property.name}</TableCell>
                          <TableCell>{property.address}</TableCell>
                          <TableCell className="capitalize">{property.property_type}</TableCell>
                          <TableCell>
                            {property.bedrooms && property.bathrooms
                              ? `${property.bedrooms} / ${property.bathrooms}`
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {property.weekly_rent ? `$${property.weekly_rent.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>{getPropertyStatusBadge(property.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <DocumentTabs
            entityType="landlord"
            entityId={id!}
            entityName={landlord.full_name}
          />

          {/* Notes */}
          {landlord.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{landlord.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
