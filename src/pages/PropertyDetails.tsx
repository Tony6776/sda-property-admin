import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Bed, Bath, Car, Accessibility, Phone, Calendar, Heart, Share2, CheckCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StructuredData from "@/components/ui/structured-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logPropertyAccess } from "@/lib/securityUtils";
import LoadingSpinner from "@/components/LoadingSpinner";
import stepFreeLiving from "@/assets/step-free-living.jpg";
import stepFreeBedroom from "@/assets/step-free-bedroom.jpg";
import stepFreeBathroom from "@/assets/step-free-bathroom.jpg";
import stepFreeKitchen from "@/assets/step-free-kitchen.jpg";

// Mock property data - in a real app this would come from an API
const getPropertyById = (id: string) => {
  const properties = {
    "1": {
      id: "1",
      title: "Modern Accessible Villa - Sunshine Coast",
      location: "Caloundra, QLD",
      price: "$485,000",
      weeklyRent: "$650",
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      category: "High Physical Support",
      features: ["Step-free access", "Roll-in shower", "Wide doorways", "Adjustable kitchen", "Smart home tech", "Emergency systems", "Ceiling tracks ready", "Accessible garden"],
      images: [stepFreeLiving, stepFreeBedroom, stepFreeBathroom, stepFreeKitchen],
      pathway: "All Pathways",
      available: "Available Now",
      description: "Stunning single-level villa with premium accessibility features and ocean glimpses. Designed specifically for high physical support needs with modern amenities and smart home integration.",
      floorPlan: "Single level, 180sqm",
      landSize: "450sqm",
      yearBuilt: "2023",
      features_detailed: {
        accessibility: ["Step-free access throughout", "Roll-in shower with grab rails", "Wide doorways (850mm minimum)", "Adjustable height kitchen benches", "Emergency call systems", "Ceiling track mounting points"],
        comfort: ["Split system air conditioning", "Smart home automation", "Premium flooring", "Sound insulation", "Natural lighting optimization"],
        outdoor: ["Level access to garden", "Accessible outdoor entertaining", "Low maintenance landscaping", "Private courtyard", "Covered parking"]
      }
    },
    "2": {
      id: "2",
      title: "Accessible Apartment - Inner Melbourne",
      location: "Richmond, VIC",
      price: "$420,000",
      weeklyRent: "$580",
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      category: "Improved Liveability",
      features: ["Level access", "Accessible bathroom", "Wide hallways", "Lift access", "Close to transport", "Modern finishes", "Open plan living", "Balcony access"],
      images: [stepFreeBedroom, stepFreeLiving, stepFreeBathroom, stepFreeKitchen],
      pathway: "Rent-to-Buy",
      available: "Available Dec 2024",
      description: "Contemporary apartment in vibrant Richmond with excellent accessibility and amenities. Perfect for those seeking urban lifestyle with full accessibility features.",
      floorPlan: "2 level, 120sqm",
      landSize: "N/A - Apartment",
      yearBuilt: "2022",
      features_detailed: {
        accessibility: ["Lift access to all floors", "Level entry throughout", "Accessible bathroom with grab rails", "Wide hallways (900mm minimum)", "Visual doorbell system", "Emergency alert system"],
        comfort: ["Ducted heating/cooling", "Stone benchtops", "European appliances", "Double glazed windows", "Built-in wardrobes"],
        outdoor: ["Private balcony", "Accessible communal garden", "BBQ area", "Secure parking", "Storage cage"]
      }
    },
    "3": {
      id: "3",
      title: "Purpose-Built SDA Home - Brisbane",
      location: "Logan, QLD",
      price: "$520,000",
      weeklyRent: "$720",
      bedrooms: 4,
      bathrooms: 3,
      parking: 2,
      category: "Robust Design",
      features: ["Fully accessible", "Ceiling hoists", "Emergency systems", "Sensory garden", "24/7 support ready", "Reinforced walls", "Nurse call system", "Wheelchair accessible"],
      images: [stepFreeBathroom, stepFreeLiving, stepFreeBedroom, stepFreeKitchen],
      pathway: "Equity Share",
      available: "Under Construction",
      description: "New construction specifically designed for high support needs with premium features. Built to robust design standards with comprehensive support infrastructure.",
      floorPlan: "Single level, 220sqm",
      landSize: "600sqm",
      yearBuilt: "2024",
      features_detailed: {
        accessibility: ["Ceiling hoist tracks throughout", "Emergency call system in all rooms", "Reinforced bathroom walls", "Wide doorways (1000mm minimum)", "Accessible kitchen with lowered benches", "Automated doors and windows"],
        comfort: ["Zoned climate control", "Sound dampening", "LED lighting throughout", "Smart home integration", "Backup power system"],
        outdoor: ["Sensory therapeutic garden", "Covered outdoor areas", "Accessible pathways", "Secure fencing", "Undercover parking"]
      }
    },
    "4": {
      id: "4",
      title: "Accessible Townhouse - Perth",
      location: "Joondalup, WA",
      price: "$395,000",
      weeklyRent: "$520",
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      category: "High Physical Support",
      features: ["Ground floor living", "Wide doorways", "Accessible kitchen", "Private courtyard", "Public transport", "Step-free access", "Roll-in shower", "Smart lighting"],
      images: [stepFreeKitchen, stepFreeLiving, stepFreeBedroom, stepFreeBathroom],
      pathway: "Deposit Ready",
      available: "Available Now",
      description: "Thoughtfully designed townhouse with excellent accessibility in growing community. Perfect for independent living with high support accessibility features.",
      floorPlan: "2 level, 165sqm",
      landSize: "280sqm",
      yearBuilt: "2023",
      features_detailed: {
        accessibility: ["Ground floor main bedroom", "Roll-in shower with seat", "Wide doorways throughout", "Accessible kitchen design", "Emergency alert system", "Level entry from street"],
        comfort: ["Split system air conditioning", "Quality fixtures and fittings", "Open plan living", "Built-in storage", "Energy efficient design"],
        outdoor: ["Private courtyard", "Low maintenance garden", "Clothesline access", "Secure parking", "Street frontage"]
      }
    },
    "5": {
      id: "5",
      title: "Luxury Accessible Unit - Sydney",
      location: "Parramatta, NSW",
      price: "$650,000",
      weeklyRent: "$850",
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      category: "Improved Liveability",
      features: ["Premium finishes", "Smart home", "Concierge service", "Pool access", "CBD proximity", "Level access", "Designer fixtures", "City views"],
      images: [stepFreeLiving, stepFreeBedroom, stepFreeBathroom, stepFreeKitchen],
      pathway: "All Pathways",
      available: "Available Jan 2025",
      description: "Luxury living with full accessibility in premium Parramatta location. High-end finishes meet comprehensive accessibility in this sophisticated apartment.",
      floorPlan: "Single level, 145sqm",
      landSize: "N/A - Apartment",
      yearBuilt: "2024",
      features_detailed: {
        accessibility: ["Lift access with audio announcements", "Level entry throughout", "Accessible ensuite with luxury fittings", "Wide passages", "Visual/audio alert systems", "Accessible balcony"],
        comfort: ["Premium appliances", "Stone benchtops", "Ducted air conditioning", "Smart home automation", "Designer lighting"],
        outdoor: ["Private balcony with city views", "Accessible pool and gym", "Rooftop garden", "Concierge services", "Secure parking"]
      }
    },
    "6": {
      id: "6",
      title: "Family SDA Home - Adelaide",
      location: "Marion, SA",
      price: "$380,000",
      weeklyRent: "$480",
      bedrooms: 4,
      bathrooms: 2,
      parking: 2,
      category: "High Physical Support",
      features: ["Single level", "Large rooms", "Accessible gardens", "Family friendly", "School proximity", "Wide doorways", "Accessible bathroom", "Open plan"],
      images: [stepFreeBedroom, stepFreeLiving, stepFreeBathroom, stepFreeKitchen],
      pathway: "All Pathways",
      available: "Available Now",
      description: "Perfect family home with excellent accessibility and community connections. Designed for families needing high physical support with room to grow.",
      floorPlan: "Single level, 200sqm",
      landSize: "550sqm",
      yearBuilt: "2023",
      features_detailed: {
        accessibility: ["Single level throughout", "Wide doorways (900mm)", "Accessible main bathroom", "Roll-in shower", "Level garden access", "Emergency call system"],
        comfort: ["Ducted heating and cooling", "Quality floor coverings", "Large living areas", "Built-in wardrobes", "Modern kitchen"],
        outdoor: ["Large accessible garden", "Covered entertaining area", "Accessible garden beds", "Secure fencing", "Double garage"]
      }
    }
  };
  return properties[id as keyof typeof properties];
};

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch property from database
  useEffect(() => {
    if (!id) {
      setError("No property ID provided");
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        console.log('Fetching property with ID:', id);
        
        // First try to fetch from database
        const { data, error: dbError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        console.log('Database response:', { data, error: dbError });

        if (dbError) {
          console.error('Database error:', dbError);
          throw new Error('Failed to fetch property from database');
        }

        if (data) {
          console.log('Found property in database:', data);
          // Log property access
          await logPropertyAccess(id, 'view');
          
          // Transform database property to expected format
          const transformedProperty = {
            id: data.id,
            title: data.name,
            location: data.address,
            price: data.price ? `$${data.price.toLocaleString()}` : null,
            weeklyRent: data.weekly_rent ? `$${data.weekly_rent}` : null,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            parking: data.parking,
            category: data.sda_category || "Not Specified",
            features: data.features || [],
            images: (data.accessibility as any)?.images || [stepFreeLiving, stepFreeBedroom, stepFreeBathroom, stepFreeKitchen], // Use actual uploaded images
            pathway: "All Pathways",
            available: data.status || "Available",
            description: (data.accessibility as any)?.description || data.name || "Beautiful accessible property with modern features.",
            floorPlan: "Contact for details",
            landSize: "Contact for details",
            yearBuilt: "Modern construction",
            features_detailed: {
              accessibility: (data.accessibility as any)?.features || data.features || ["Step-free access", "Accessible bathroom", "Wide doorways"],
              comfort: ["Modern appliances", "Climate control", "Quality fixtures"],
              outdoor: ["Accessible outdoor areas", "Low maintenance", "Secure parking"]
            }
          };
          
          setProperty(transformedProperty);
        } else {
          console.log('No property found in database, trying mock data');
          // Fallback to mock data for backward compatibility
          const mockProperty = getPropertyById(id);
          if (mockProperty) {
            console.log('Found mock property:', mockProperty);
            setProperty(mockProperty);
          } else {
            console.log('No mock property found either');
            setError("Property not found");
          }
        }
      } catch (err: any) {
        console.error('Error fetching property:', err);
        
        // Try fallback to mock data
        const mockProperty = getPropertyById(id);
        if (mockProperty) {
          setProperty(mockProperty);
          toast.info("Showing sample property data");
        } else {
          setError("Property not found");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 lg:px-8 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "The property you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => window.location.href = '/properties'}>
              Back to Properties
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    "name": property.title,
    "description": property.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.location
    },
    "priceRange": property.price,
    "amenityFeature": property.features.map(feature => ({
      "@type": "LocationFeatureSpecification",
      "name": feature
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={structuredData} />
      <Header />
      
      <main>
        {/* Breadcrumb */}
        <div className="bg-muted/30 py-4">
          <div className="container mx-auto px-4 lg:px-8">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Button>
          </div>
        </div>

        {/* Property Gallery */}
        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <div className="relative">
                <img
                  src={property.images[0]}
                  alt={`${property.title} - Main view`}
                  className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="default" className="bg-primary/90">
                    {property.available}
                  </Badge>
                  <Badge variant="secondary" className="bg-secondary/90">
                    {property.pathway}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {property.images.slice(1).map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`${property.title} - View ${idx + 2}`}
                    className="w-full h-44 lg:h-[160px] object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Property Details */}
        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.title}</h1>
                      <div className="flex items-center text-muted-foreground mb-4">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span className="text-lg">{property.location}</span>
                      </div>
                      <Badge variant="outline" className="mb-4">
                        {property.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-lg text-muted-foreground mb-6">
                    {property.description}
                  </p>

                  {/* Property Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Bed className="h-5 w-5 text-primary" />
                        <span className="text-2xl font-bold">{property.bedrooms}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Bedrooms</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Bath className="h-5 w-5 text-primary" />
                        <span className="text-2xl font-bold">{property.bathrooms}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Bathrooms</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Car className="h-5 w-5 text-primary" />
                        <span className="text-2xl font-bold">{property.parking}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Parking</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Accessibility className="h-5 w-5 text-primary" />
                        <span className="text-sm font-bold">SDA</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Compliant</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <Card className="card-elegant">
                  <CardHeader>
                    <CardTitle>Accessibility Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Core Accessibility</h4>
                        <div className="space-y-2">
                          {property.features_detailed?.accessibility.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Comfort & Technology</h4>
                        <div className="space-y-2">
                          {property.features_detailed?.comfort.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Pricing Card */}
                <Card className="card-elegant bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardHeader>
                    <CardTitle>Investment Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-primary mb-1">
                        {property.price}
                      </div>
                      <div className="text-muted-foreground">
                        Purchase price
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-xl font-semibold mb-1">
                        {property.weeklyRent}/week
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rent-to-buy option
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/consultation'}>
                        Book Viewing
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => window.location.href = '/calculator'}>
                        Calculate
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Card */}
                <Card className="card-elegant">
                  <CardHeader>
                    <CardTitle>Get More Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full" onClick={() => window.open('tel:1800732435', '_self')}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call 1800 SDA HELP
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = '/consultation'}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Consultation
                    </Button>
                  </CardContent>
                </Card>

                {/* Property Details */}
                <Card className="card-elegant">
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Floor Plan:</span>
                      <span>{property.floorPlan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Land Size:</span>
                      <span>{property.landSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year Built:</span>
                      <span>{property.yearBuilt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available:</span>
                      <span>{property.available}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Make This Your Home?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our SDA specialists are ready to guide you through the process and answer any questions about this property.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/consultation'}>
                Schedule Property Consultation
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = '/eligibility'}>
                Check My Eligibility
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetails;