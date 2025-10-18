import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus, RefreshCw, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Property {
  id: string;
  name: string;
  address: string;
  property_type: string;
  status: string;
  weekly_rent: number | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sda_category: string | null;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  images: any;
  accessibility: {
    images?: string[];
    airtable_id?: string;
  } | null;
}

interface PropertyListEnhancedProps {
  onRefresh?: () => void;
}

export function PropertyListEnhanced({ onRefresh }: PropertyListEnhancedProps) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const fetchProperties = async () => {
    setLoading(true);
    console.log('[PropertyListEnhanced] Fetching properties...');
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, address, property_type, status, weekly_rent, price, bedrooms, bathrooms, sda_category, created_at, updated_at, image_url, images, accessibility')
        .order('updated_at', { ascending: false });

      console.log('[PropertyListEnhanced] Query result:', {
        dataLength: data?.length,
        error,
        sample: data?.[0]
      });

      if (error) {
        console.error('[PropertyListEnhanced] Error:', error);
        toast.error("Failed to load properties");
      } else {
        const propertiesData = data || [];
        console.log('[PropertyListEnhanced] Setting properties:', propertiesData.length);
        setProperties(propertiesData);
        setFilteredProperties(propertiesData);
      }
    } catch (err) {
      console.error('[PropertyListEnhanced] Unexpected error:', err);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    let filtered = properties;

    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(p => p.property_type === typeFilter);
    }

    setFilteredProperties(filtered);
  }, [statusFilter, typeFilter, properties]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast.success("Property deleted successfully");
      setDeleteId(null);
      await fetchProperties();
      onRefresh?.();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    setUpdatingStatus(propertyId);
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', propertyId);

      if (error) throw error;

      toast.success(`Property ${newStatus === 'available' ? 'approved' : 'status updated'}`);
      await fetchProperties();
      onRefresh?.();
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleBulkApprove = async () => {
    try {
      // Only approve properties with statuses that make sense to approve
      const approvableStatuses = ['hold', 'application review ', 'lead_new'];
      const pendingIds = filteredProperties
        .filter(p => p.status !== 'available' && p.status !== 'sold' && p.status !== 'leased')
        .map(p => p.id);

      if (pendingIds.length === 0) {
        toast.info("No properties to approve (excluding sold/leased)");
        return;
      }

      const { error } = await supabase
        .from('properties')
        .update({ status: 'available', updated_at: new Date().toISOString() })
        .in('id', pendingIds);

      if (error) throw error;

      toast.success(`Approved ${pendingIds.length} properties`);
      await fetchProperties();
      onRefresh?.();
    } catch (error: any) {
      toast.error(`Bulk approve failed: ${error.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", label: string, icon: any }> = {
      available: { variant: "default", label: "Live", icon: Check },
      sold: { variant: "outline", label: "Sold", icon: X },
      leased: { variant: "outline", label: "Leased", icon: X },
      hold: { variant: "secondary", label: "On Hold", icon: Eye },
      participant_active: { variant: "secondary", label: "Participant", icon: Eye },
      lead_new: { variant: "secondary", label: "New Lead", icon: Eye },
      "application review ": { variant: "secondary", label: "Review", icon: Eye },
    };

    const config = statusConfig[status] || { variant: "secondary" as const, label: status || "Unknown", icon: EyeOff };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>Loading properties...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Properties Management</CardTitle>
              <CardDescription>
                {filteredProperties.length} of {properties.length} properties
                {statusFilter !== "all" && ` • Filtered by: ${statusFilter}`}
                {typeFilter !== "all" && ` • Type: ${typeFilter}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchProperties}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkApprove}>
                <Check className="h-4 w-4 mr-2" />
                Approve Filtered
              </Button>
              <Button size="sm" onClick={() => navigate('/admin/properties/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Live</SelectItem>
                  <SelectItem value="hold">On Hold</SelectItem>
                  <SelectItem value="application review ">Under Review</SelectItem>
                  <SelectItem value="lead_new">New Leads</SelectItem>
                  <SelectItem value="participant_active">Participant</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="leased">Leased</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="lease">For Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No properties found</p>
              <p className="text-sm mt-2">
                {properties.length === 0
                  ? "Add your first property or sync from Airtable"
                  : "Try changing your filters"
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Beds/Baths</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => {
                    const imageUrl = property.image_url ||
                      (property.accessibility?.images && property.accessibility.images.length > 0
                        ? property.accessibility.images[0]
                        : null);

                    return (
                      <TableRow key={property.id}>
                        <TableCell>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={property.name}
                              className="w-20 h-20 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                              No image
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{property.name}</div>
                          <div className="text-sm text-muted-foreground">{property.address}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={property.property_type === 'sale' ? 'default' : property.property_type === 'lease' ? 'secondary' : 'outline'}>
                            {property.property_type === 'sale' ? 'For Sale' :
                             property.property_type === 'lease' ? 'For Lease' :
                             property.property_type === 'apartment' ? 'Apartment' :
                             property.property_type === 'participant_sda' ? 'Participant SDA' :
                             property.property_type === 'lead_enquiry' ? 'Lead' :
                             property.property_type || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={property.status}
                            onValueChange={(value) => handleStatusChange(property.id, value)}
                            disabled={updatingStatus === property.id}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue>
                                {updatingStatus === property.id ? (
                                  <div className="flex items-center gap-2">
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                    <span className="text-xs">Updating...</span>
                                  </div>
                                ) : (
                                  getStatusBadge(property.status)
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">✅ Live</SelectItem>
                              <SelectItem value="hold">⏸️ On Hold</SelectItem>
                              <SelectItem value="application review ">👀 Review</SelectItem>
                              <SelectItem value="lead_new">📧 New Lead</SelectItem>
                              <SelectItem value="participant_active">👤 Participant</SelectItem>
                              <SelectItem value="sold">💰 Sold</SelectItem>
                              <SelectItem value="leased">🏠 Leased</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm">
                          {property.bedrooms || '-'} / {property.bathrooms || '-'}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {property.property_type === 'sale' && property.price
                            ? `$${property.price.toLocaleString()}`
                            : property.weekly_rent
                            ? `$${property.weekly_rent}/wk`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(property.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/properties/edit/${property.id}`)}
                              title="Edit property"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(property.id)}
                              title="Delete property"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
