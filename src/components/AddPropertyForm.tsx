import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AddPropertyFormProps {
  onSuccess: (propertyType: 'sale' | 'lease') => void;
  onCancel: () => void;
}

interface PropertyFormData {
  name: string;
  address: string;
  property_type: 'sale' | 'lease';
  price: string;
  sda_funding_amount: string;
  sda_funding_category: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  sda_category: string; // Type of Dwelling
  property_manager: string;
  description: string;
  features: string[];
}

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

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    property_type: 'lease',
    price: '',
    sda_funding_amount: '',
    sda_funding_category: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    sda_category: '',
    property_manager: '',
    description: '',
    features: []
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const newFiles = files.slice(0, 5 - images.length);
    
    setImages(prev => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const convertImagesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });
    
    return Promise.all(promises);
  };

  const uploadImagesToStorage = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const safeName = (formData.name || 'property').replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9\-]/g, '');
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${safeName}-${Date.now()}-${i + 1}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('property-images').upload(path, file, { contentType: file.type });
      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(path);
      urls.push(publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload images to storage first to avoid large JSON payloads
      const imageUrls = await uploadImagesToStorage(images);

      // Prepare property data
      const propertyData = {
        name: formData.name,
        address: formData.address,
        property_type: formData.property_type,
        price: formData.price ? parseFloat(formData.price) : undefined,
        weekly_rent: formData.sda_funding_amount ? parseFloat(formData.sda_funding_amount) : undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        parking: formData.parking ? parseInt(formData.parking) : undefined,
        sda_category: formData.sda_category || undefined,
        property_manager: formData.property_manager || undefined,
        description: formData.description || undefined,
        features: formData.features,
        images: imageUrls,
      };

      console.log('Submitting property:', propertyData);

      // Insert property directly into Supabase (admin auth via session)
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          ...propertyData,
          status: 'available', // Default status
        }])
        .select()
        .single();

      if (error) {
        console.error('Create property error:', error);
        throw new Error(error.message || 'Failed to create property');
      }

      console.log('Property created successfully:', data);
      toast.success('Property created successfully!');
      onSuccess(formData.property_type);
      
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add New Property</CardTitle>
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
                  <Select value={formData.property_type} onValueChange={(value: 'sale' | 'lease') => handleInputChange('property_type', value)}>
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
                  <Label htmlFor="sda_funding_amount">SDA Funding Amount ($)</Label>
                  <Input
                    id="sda_funding_amount"
                    type="number"
                    value={formData.sda_funding_amount}
                    onChange={(e) => handleInputChange('sda_funding_amount', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sda_funding_category">SDA Funding Category</Label>
                  <Select value={formData.sda_funding_category} onValueChange={(value) => handleInputChange('sda_funding_category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SDA_FUNDING_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label>Property Images (Max 5)</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={images.length >= 5}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors ${
                      images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {images.length >= 5 ? 'Maximum 5 images allowed' : 'Click to upload images or drag and drop'}
                    </p>
                  </label>
                  
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Property...' : 'Create Property'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};