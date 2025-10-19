import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Bed, Bath, Car, Accessibility, Heart, Search, Filter, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StructuredData from "@/components/ui/structured-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import { PropertyDiagnostics } from "@/components/PropertyDiagnostics";
import { fetchSecureProperties } from "@/lib/securityUtils";
import stepFreeLiving from "@/assets/step-free-living.jpg";
import stepFreeBedroom from "@/assets/step-free-bedroom.jpg";
import stepFreeBathroom from "@/assets/step-free-bathroom.jpg";
import stepFreeKitchen from "@/assets/step-free-kitchen.jpg";

// Mock data template for property listings
const mockProperties = [
  {
    id: "1",
    name: "Modern Accessible Villa - Sunshine Coast",
    address: "Caloundra, QLD",
    price: 485000,
    weekly_rent: 650,
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    sda_category: "High Physical Support",
    features: ["Step-free access", "Roll-in shower", "Wide doorways", "Adjustable kitchen", "Smart home tech"],
    status: "Available Now",
    property_type: "sale",
    accessibility: {
      images: [stepFreeLiving],
      description: "Stunning single-level villa with premium accessibility features and ocean glimpses."
    }
  },
  {
    id: "2", 
    name: "Accessible Apartment - Inner Melbourne",
    address: "Richmond, VIC",
    price: 420000,
    weekly_rent: 580,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    sda_category: "Improved Liveability",
    features: ["Level access", "Accessible bathroom", "Wide hallways", "Lift access", "Close to transport"],
    status: "Available Dec 2024",
    property_type: "sale",
    accessibility: {
      images: [stepFreeBedroom],
      description: "Contemporary apartment in vibrant Richmond with excellent accessibility and amenities."
    }
  },
  {
    id: "3",
    name: "Purpose-Built SDA Home - Brisbane", 
    address: "Logan, QLD",
    price: 520000,
    weekly_rent: 720,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    sda_category: "Robust Design",
    features: ["Fully accessible", "Ceiling hoists", "Emergency systems", "Sensory garden", "24/7 support ready"],
    status: "Under Construction",
    property_type: "sale",
    accessibility: {
      images: [stepFreeBathroom],
      description: "New construction specifically designed for high support needs with premium features."
    }
  },
  {
    id: "4",
    name: "Accessible Townhouse - Perth",
    address: "Joondalup, WA", 
    price: 395000,
    weekly_rent: 520,
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    sda_category: "High Physical Support",
    features: ["Ground floor living", "Wide doorways", "Accessible kitchen", "Private courtyard", "Public transport"],
    status: "Available Now",
    property_type: "lease",
    accessibility: {
      images: [stepFreeKitchen],
      description: "Thoughtfully designed townhouse with excellent accessibility in growing community."
    }
  },
  {
    id: "5",
    name: "Luxury Accessible Unit - Sydney",
    address: "Parramatta, NSW",
    price: 650000,
    weekly_rent: 850,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    sda_category: "Improved Liveability", 
    features: ["Premium finishes", "Smart home", "Concierge service", "Pool access", "CBD proximity"],
    status: "Available Jan 2025",
    property_type: "lease",
    accessibility: {
      images: [stepFreeLiving],
      description: "Luxury living with full accessibility in premium Parramatta location."
    }
  },
  {
    id: "6",
    name: "Family SDA Home - Adelaide",
    address: "Marion, SA",
    price: 380000,
    weekly_rent: 480,
    bedrooms: 4,
    bathrooms: 2,
    parking: 2,
    sda_category: "High Physical Support",
    features: ["Single level", "Large rooms", "Accessible gardens", "Family friendly", "School proximity"],
    status: "Available Now", 
    property_type: "lease",
    accessibility: {
      images: [stepFreeBedroom],
      description: "Perfect family home with excellent accessibility and community connections."
    }
  }
];

interface Property {
  id: string;
  name: string;
  address: string;
  price: number | null;
  weekly_rent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  sda_category: string | null;
  features: string[];
  status: string;
  property_type: string;
  description?: string | null;
  primary_image?: string | null;
  images?: string[] | null;
  accessibility: any;
}

const ITEMS_PER_PAGE = 9;

const Properties = () => {
  const [activeTab, setActiveTab] = useState<'sale' | 'lease'>('sale');
  const [properties, setProperties] = useState<Property[]>(mockProperties.filter(p => p.property_type === 'sale'));
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'database' | 'mock' | 'loading'>('loading');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchProperties(activeTab);
  }, [activeTab]);

  const fetchProperties = async (propertyType: 'sale' | 'lease', loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setDataSource('loading');
    }

    try {
      // Calculate offset for pagination
      const offset = loadMore ? properties.length : 0;

      // Use secure property fetching with enhanced security
      const filters = {
        propertyType,
        status: 'available',
        offset,
        limit: ITEMS_PER_PAGE
      };

      const data = await fetchSecureProperties(filters);

      // Use real data if available, otherwise fall back to mock data
      if (data && data.length > 0) {
        // Type assertion and transformation to ensure compatibility
        const transformedProperties = data.map((prop: any): Property => ({
          id: prop.id || String(Math.random()),
          name: prop.name || 'Property',
          address: prop.address || 'Address not available',
          price: prop.price || null,
          weekly_rent: prop.weekly_rent || null,
          bedrooms: prop.bedrooms || null,
          bathrooms: prop.bathrooms || null,
          parking: prop.parking || null,
          sda_category: prop.sda_category || null,
          features: prop.features || [],
          status: prop.status || 'Available',
          property_type: prop.property_type || propertyType,
          description: prop.description || null,
          primary_image: prop.primary_image || null,
          images: prop.images || null,
          accessibility: prop.accessibility || {
            images: prop.images || [stepFreeLiving],
            description: prop.description || 'Property details available upon request'
          }
        }));

        // Append or replace properties based on loadMore flag
        if (loadMore) {
          setProperties(prev => [...prev, ...transformedProperties]);
        } else {
          setProperties(transformedProperties);
        }

        // Update hasMore flag based on whether we got a full page
        setHasMore(transformedProperties.length === ITEMS_PER_PAGE);

        setDataSource('database');
        console.log(`✅ Loaded ${transformedProperties.length} properties from database (${loadMore ? 'load more' : 'initial'})`);
      } else {
        // Only use mock data on initial load, not on load more
        if (!loadMore) {
          const filteredMockData = mockProperties.filter(p => p.property_type === propertyType);
          setProperties(filteredMockData);
          setDataSource('mock');
          setHasMore(false);
          console.log('⚠️ Using mock data as fallback - database returned no properties');
        } else {
          setHasMore(false);
          console.log('✅ No more properties to load');
        }
      }
    } catch (error: any) {
      console.error('Error fetching properties:', error);

      // Check if it's an authentication error
      if (error.message?.includes('authentication') || error.message?.includes('session')) {
        toast.error("Authentication required for full property access");
        // Still show mock data for public users
      } else if (error.message?.includes('read-only transaction')) {
        toast.error("Database error detected. Using sample data. Admin: check diagnostics.");
        console.error('❌ RLS policy bug - see CRITICAL-FIX-PROPERTIES-LOADING.md');
      } else {
        toast.error("Failed to load properties. Showing sample properties.");
      }

      // Fallback to mock data (only on initial load)
      if (!loadMore) {
        const filteredMockData = mockProperties.filter(p => p.property_type === propertyType);
        setProperties(filteredMockData);
        setDataSource('mock');
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getDefaultImage = (index: number) => {
    const images = [stepFreeLiving, stepFreeBedroom, stepFreeBathroom, stepFreeKitchen];
    return images[index % images.length];
  };

  const propertiesStructuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Homelander SDA Properties",
    "description": "Accessible SDA properties for NDIS participants across Australia",
    "makesOffer": properties.map(property => ({
      "@type": "Accommodation",
      "name": property.name,
      "description": property.description || property.accessibility?.description || property.name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": property.address
      },
      "priceRange": property.price?.toString() || "Contact for pricing",
      "amenityFeature": property.features.map(feature => ({
        "@type": "LocationFeatureSpecification",
        "name": feature
      }))
    }))
  };
  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={propertiesStructuredData} />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto fade-in">
              <Badge variant="outline" className="mb-4">
                Available SDA Properties
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Available SDA Properties
                </span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                Find Inspiration for Your SDA Home
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Browse a curated selection of SDA properties we've delivered across Australia. These examples highlight what's possible—but they are not our only stock. In fact, 99.9% of the time, we create new opportunities based on where you want to live and the type of SDA home you need. With SDA funding, we have the flexibility to deliver apartments, villas, or houses—anywhere in Australia—tailored to your goals.
              </p>
              <div className="bg-muted/50 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
                <p className="text-lg font-medium mb-4">
                  👉 Don't see what you're looking for? Tell us your preferred location and home type, and we'll make it happen.
                </p>
                <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/contact'}>
                  Request My SDA Home
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Property Type Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'sale' | 'lease')} className="mb-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="sale">Sale Properties</TabsTrigger>
                <TabsTrigger value="lease">Lease Properties</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="md:col-span-2">
                <Input 
                  placeholder="Search by location or property name..."
                  className="h-12"
                />
              </div>
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="SDA Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="improved">Improved Liveability</SelectItem>
                  <SelectItem value="physical">High Physical Support</SelectItem>
                  <SelectItem value="robust">Robust Design</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pathway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pathways</SelectItem>
                  <SelectItem value="deposit">Deposit Ready</SelectItem>
                  <SelectItem value="rent">Rent-to-Buy</SelectItem>
                  <SelectItem value="equity">Equity Share</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
                <span className="text-sm text-muted-foreground">
                  {properties.length} properties found
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Search className="mr-2 h-4 w-4" />
                  Save Search
                </Button>
                <Button variant="ghost" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  Saved (0)
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No {activeTab} properties available at the moment.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property, index) => (
                  <Card key={property.id} className="card-elegant group hover:scale-105 transition-all duration-300">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={
                          property.primary_image ||
                          property.images?.[0] ||
                          (property.accessibility as any)?.images?.[0] ||
                          getDefaultImage(index)
                        }
                        alt={`${property.name} - Step-free accessible interior`}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="default" className="bg-primary/90">
                          {property.status}
                        </Badge>
                        <Badge variant="secondary" className="bg-secondary/90">
                          {activeTab === 'sale' ? 'For Sale' : 'For Lease'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-4 bg-background/80 hover:bg-background"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {property.name}
                        </CardTitle>
                      </div>
                      <div className="flex items-center text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.address}</span>
                      </div>
                      {property.sda_category && (
                        <Badge variant="outline" className="w-fit">
                          {property.sda_category}
                        </Badge>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <ExpandableDescription
                        text={property.description || property.accessibility?.description || property.name}
                        maxLength={120}
                        className="text-sm text-muted-foreground"
                      />

                      {/* Property Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          {property.bedrooms && (
                            <div className="flex items-center space-x-1">
                              <Bed className="h-4 w-4 text-muted-foreground" />
                              <span>{property.bedrooms}</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center space-x-1">
                              <Bath className="h-4 w-4 text-muted-foreground" />
                              <span>{property.bathrooms}</span>
                            </div>
                          )}
                          {property.parking && (
                            <div className="flex items-center space-x-1">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span>{property.parking}</span>
                            </div>
                          )}
                        </div>
                        <Accessibility className="h-5 w-5 text-primary" />
                      </div>

                      {/* Features */}
                      {property.features && property.features.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Key Features:</h4>
                          <div className="flex flex-wrap gap-1">
                            {property.features.slice(0, 3).map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {property.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{property.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="flex justify-between items-center pt-4 border-t border-border/60">
                        <div>
                          {property.price && (
                            <div className="font-bold text-lg text-primary">
                              ${property.price.toLocaleString()}
                            </div>
                          )}
                          {property.weekly_rent && (
                            <div className="text-sm text-muted-foreground">
                              or ${property.weekly_rent}/week
                            </div>
                          )}
                          {!property.price && !property.weekly_rent && (
                            <div className="text-sm text-muted-foreground">
                              Contact for pricing
                            </div>
                          )}
                        </div>
                        <Button size="sm" className="group-hover:bg-primary-hover transition-colors" onClick={() => window.location.href = `/properties/${property.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More */}
            {!loading && properties.length > 0 && dataSource === 'database' && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fetchProperties(activeTab, true)}
                  disabled={!hasMore || loadingMore}
                >
                  {loadingMore ? 'Loading...' : hasMore ? 'Load More Properties' : 'No More Properties'}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                We have access to many more properties and can help you find the perfect 
                accessible home that meets your specific needs and preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/contact'}>
                  Request Property Match Service
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = '/consultation'}>
                  Speak with Property Specialist
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Diagnostic Section - Only show in development or when requested */}
        {(showDiagnostics || dataSource === 'mock') && (
          <section className="py-8 bg-muted/50">
            <div className="container mx-auto px-4 lg:px-8">
              {/* Data Source Indicator */}
              {dataSource !== 'loading' && (
                <div className="mb-4 flex items-center justify-center gap-2">
                  <Badge variant={dataSource === 'database' ? 'default' : 'secondary'} className="text-sm">
                    {dataSource === 'database' ? '✅ Live Data' : '⚠️ Sample Data'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {dataSource === 'database'
                      ? 'Showing real properties from database'
                      : 'Showing sample properties - database connection issue'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDiagnostics(!showDiagnostics)}
                  >
                    {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
                  </Button>
                </div>
              )}

              {/* Property Diagnostics Component */}
              {showDiagnostics && (
                <div className="max-w-4xl mx-auto">
                  <PropertyDiagnostics />
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Properties;