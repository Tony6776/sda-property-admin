import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Award, Users, Headphones, Clock, Star, ArrowRight } from "lucide-react";
import consultationInterior from "@/assets/consultation-interior.jpg";

const trustIndicators = [
  {
    icon: Award,
    title: "Enablement Awards Recognition",
    description: "Homelander recognised as Australia's Most Outstanding SDA Provider and Innovator of Participant Ownership Models in Disability Housing under the NDIS.",
    stats: "Award Winner"
  },
  {
    icon: Shield,
    title: "NDIS Registered SDA Provider",
    description: "Applied 30+ years property expertise to develop Australia's first innovative SDA ownership products.",
    stats: "Industry Pioneer"
  },
  {
    icon: Users,
    title: "Experienced Professional Team",
    description: "Assembled team of specialists in their respective fields to facilitate the entire end-to-end process.",
    stats: "Complete Service"
  },
  {
    icon: Star,
    title: "Choice & Control Focus",
    description: "Participants simply tell us where they want to live, what they need, and their SDA funding amount.",
    stats: "Your Independence"
  },
  {
    icon: Clock,
    title: "Seamless Transition",
    description: "From finding your home to move-in and ongoing SDA property management - we handle everything.",
    stats: "Move-in Ready"
  },
  {
    icon: Headphones,
    title: "Long-term Solutions",
    description: "Thoughtful and real SDA accommodation solutions that families can rely on for the future.",
    stats: "Future-Focused"
  }
];

const TrustSection = () => {
  return (
    <section id="about" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="fade-in">
            <Badge variant="outline" className="mb-4">
              Why Choose Homelander SDA
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Award-Winning{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SDA Innovation
              </span>{" "}
              Leaders
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              With 30+ years in the property industry, we applied our extensive expertise to SDA provider 
              services and developed Australia's first innovative products for SDA participants to own their 
              properties. We've assembled an experienced team of professionals to facilitate the entire 
              end-to-end process, creating thoughtful and real long-term accommodation solutions.
            </p>

            {/* Trust Indicators Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {trustIndicators.map((indicator, index) => {
                const IconComponent = indicator.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-card/50 transition-colors group">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {indicator.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {indicator.description}
                      </p>
                      <div className="text-xs font-medium text-primary">
                        {indicator.stats}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/about'}>
                Learn More About Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = '/about'}>
                View Our Certifications
              </Button>
            </div>
          </div>

          {/* Image & Stats */}
          <div className="fade-in">
            <div className="relative">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl card-elegant">
                <img
                  src={consultationInterior}
                  alt="Professional consultation in accessible home interior with step-free design and inclusive meeting space"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
              </div>

              {/* Floating Stats Cards */}
              <Card className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur-sm card-elegant">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">Australia wide</div>
                      <div className="text-xs text-muted-foreground">Apartments, Villas & Houses</div>
                    </div>
                    <div className="w-px h-12 bg-border"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">95%</div>
                      <div className="text-xs text-muted-foreground">Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute -top-6 -right-6 bg-card/95 backdrop-blur-sm card-elegant">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-success-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Enablement Awards Winner</div>
                      <div className="text-xs text-muted-foreground">Australia's Most Outstanding SDA Provider</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;