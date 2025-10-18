import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Star, Users } from "lucide-react";
import heroInterior from "@/assets/hero-interior.jpg";
const Hero = () => {
  return <section className="relative min-h-[90vh] flex items-center hero-gradient">
      <div className="container mx-auto px-4 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="fade-in">
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Star className="h-3 w-3" />
                Enablement Awards - Australia's Most Outstanding SDA Provider
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                NDIS Registered SDA Provider
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                30 Years Property Experience
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Your Trusted Partner for{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                SDA Homeownership
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              We create custom SDA homes in your desired location. With 30+ years in property, we specialise in building SDA-compliant homes where you want to live. Our team guides NDIS participants, families, and support coordinators through eligibility, planning, and the complete journey to SDA homeownership.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="btn-bounce text-lg px-8 py-6" onClick={() => window.location.href = '/eligibility'}>
                Check SDA Eligibility
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = '/consultation'}>
                Book SDA Consultation
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/60">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Australia wide</div>
                <div className="text-sm text-muted-foreground">Apartments, Villas & Houses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">95%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">24/7</div>
                <div className="text-sm text-muted-foreground">Support Available</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative fade-in">
            <div className="relative overflow-hidden rounded-2xl card-elegant">
              <img 
                src={heroInterior} 
                alt="Beautiful step-free living room interior with wide doorways, accessible layout, and modern design features" 
                className="w-full h-[600px] object-cover"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
              
              {/* Floating Achievement Card */}
              <div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm rounded-lg p-4 card-elegant">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-success-foreground" />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-card-foreground">2025 Enablement Awards Winner</div>
                    <div className="text-sm text-muted-foreground">Australia's Most Outstanding SDA Provider & Innovator of SDA Ownership Models</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;