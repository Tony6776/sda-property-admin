import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, DollarSign, Home, TrendingUp } from "lucide-react";
import accessibleInterior from "@/assets/step-free-living.jpg";

const pathways = [
  {
    title: "Deposit Ready Ownership",
    subtitle: "Full ownership from day one",
    description: "Perfect for participants ready with a deposit and seeking a fast-track path to homeownership.",
    features: [
      "100% ownership immediately",
      "No equity partners",
      "Quick settlement process",
      "Full control over your home"
    ],
    timeline: "30-60 days",
    investment: "Deposit required",
    icon: Home,
    badge: "Popular",
    badgeVariant: "default" as const,
    image: accessibleInterior,
    gradient: "from-primary/10 to-primary/5"
  },
  {
    title: "Rent-to-Buy",
    subtitle: "Move in now, build your deposit",
    description: "Designed for participants building capacity over 5 to 7 years while living in their future home.",
    features: [
      "Move in immediately",
      "Build deposit over time",
      "Rent contributes to ownership",
      "7-year pathway to ownership"
    ],
    timeline: "5-7 years",
    investment: "Weekly rent",
    icon: Clock,
    badge: "Flexible",
    badgeVariant: "secondary" as const,
    image: accessibleInterior,
    gradient: "from-secondary/10 to-secondary/5"
  },
  {
    title: "Equity Share Ownership",
    subtitle: "Own up to 80% now",
    description: "Share ownership with an equity partner, then buy the remaining share in 5 to 7 years.",
    features: [
      "Own 60-80% immediately",
      "Equity partner holds remainder",
      "Buy remaining share later",
      "Shared investment risk"
    ],
    timeline: "5-7 years",
    investment: "Partial deposit",
    icon: TrendingUp,
    badge: "Shared",
    badgeVariant: "outline" as const,
    image: accessibleInterior,
    gradient: "from-accent/10 to-accent/5"
  }
];

const OwnershipPathways = () => {
  return (
    <section id="pathways" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in">
          <Badge variant="outline" className="mb-4">
            Three Flexible Options
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Find Your Pathway to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SDA Homeownership
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our three tailored SDA POP options—each designed to meet different financial situations and timelines. Whether through direct purchase, shared investment, or rent-to-buy, every pathway leads to the same goal: securing an accessible home that gives you choice, dignity, and long-term stability.
          </p>
        </div>

        {/* Pathways Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pathways.map((pathway, index) => {
            const IconComponent = pathway.icon;
            return (
              <Card key={index} className={`card-elegant group hover:scale-105 transition-all duration-300 bg-gradient-to-br ${pathway.gradient} border-0`}>
                <CardHeader className="relative pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br from-primary to-secondary`}>
                      <IconComponent className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <Badge variant={pathway.badgeVariant} className="font-medium">
                      {pathway.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">
                    {pathway.title}
                  </CardTitle>
                  <p className="text-primary font-medium mb-2">
                    {pathway.subtitle}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {pathway.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Key Features */}
                  <div className="space-y-3">
                    {pathway.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timeline & Investment */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{pathway.timeline}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{pathway.investment}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full group-hover:bg-primary-hover transition-colors" variant="default" onClick={() => {
                    const pathwaySlug = pathway.title === 'Deposit Ready Ownership' ? 'deposit-ready' : 
                                      pathway.title === 'Rent-to-Buy' ? 'rent-to-buy' : 'equity-share';
                    window.location.href = `/pathways/${pathwaySlug}`;
                  }}>
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 fade-in">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 card-elegant max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Not sure which pathway is right for you?
            </h3>
            <p className="text-muted-foreground mb-6">
              Our SDA specialists will assess your eligibility, understand your location preferences, and recommend the best pathway and home design for your needs through a discovery consultation.
            </p>
            <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/consultation'}>
              Get Personalized Recommendation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnershipPathways;