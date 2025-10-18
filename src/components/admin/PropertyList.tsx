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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus, RefreshCw } from "lucide-react";
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
  image_url: string | null;
  images: any;
  accessibility: {
    images?: string[];
  } | null;
}

export function PropertyList() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Use service role via RPC to get all properties (admin view)
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, address, property_type, status, weekly_rent, price, bedrooms, bathrooms, sda_category, created_at, image_url, images, accessibility')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        toast.error("Failed to load properties");
      } else {
        setProperties(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', deleteId);

      if (error) {
        throw error;
      }

      toast.success("Property deleted successfully");
      setDeleteId(null);
      fetchProperties(); // Refresh list
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete: ${error.message}`);
    } finally {
      setDeleting(false);
    }
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
              <CardTitle>Properties</CardTitle>
              <CardDescription>
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} in database
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchProperties}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => navigate('/admin/properties/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No properties found</p>
              <p className="text-sm mt-2">Add your first property or sync from Airtable</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Beds/Baths</TableHead>
                    <TableHead>Price/Rent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        {(() => {
                          const imageUrl = property.image_url ||
                            (property.accessibility?.images && property.accessibility.images.length > 0
                              ? property.accessibility.images[0]
                              : null);

                          return imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={property.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                              No image
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="font-medium">{property.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {property.address}
                      </TableCell>
                      <TableCell>
                        <Badge variant={property.property_type === 'sale' ? 'default' : 'secondary'}>
                          {property.property_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{property.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {property.bedrooms || '-'} / {property.bathrooms || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {property.property_type === 'sale' && property.price
                          ? `$${property.price.toLocaleString()}`
                          : property.weekly_rent
                          ? `$${property.weekly_rent}/wk`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
                  ))}
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
