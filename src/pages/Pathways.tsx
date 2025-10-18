import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, DollarSign, Home, TrendingUp, CheckCircle, Users, Calculator } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";
import stepFreeLiving from "@/assets/step-free-living.jpg";
import stepFreeBedroom from "@/assets/step-free-bedroom.jpg";
import stepFreeBathroom from "@/assets/step-free-bathroom.jpg";

const detailedPathways = [
  {
    title: "Deposit Ready Ownership",
    subtitle: "Full ownership from day one",
    longDescription: "Perfect for NDIS participants who have saved a deposit and want immediate full ownership of their accessible home. This pathway offers the fastest route to homeownership with complete control and no shared equity arrangements.",
    features: [
      "100% ownership immediately upon settlement",
      "No equity partners or shared arrangements", 
      "Quick settlement process (30-60 days)",
      "Full control over property decisions",
      "Immediate equity building",
      "No ongoing rent payments",
      "Choose your own property modifications",
      "Full tax benefits of ownership"
    ],
    requirements: [
      "NDIS participant with SDA funding",
      "Deposit of 10-20% of property value",
      "Stable income or NDIS plan",
      "Good credit history",
      "Pre-approval for home loan"
    ],
    timeline: "30-60 days",
    investment: "Your Loan 80-90%",
    icon: Home,
    badge: "Most Popular",
    badgeVariant: "default" as const,
    image: stepFreeLiving,
    gradient: "from-primary/10 to-primary/5",
    benefits: [
      "Immediate ownership and equity building",
      "Complete control over your home",
      "No ongoing rent or shared equity",
      "Full tax benefits and deductions",
      "Freedom to modify as needed"
    ]
  },
  {
    title: "Rent-to-Buy Program", 
    subtitle: "Move in now, build your deposit over time",
    longDescription: "Designed for NDIS participants who want to live in their future home while building the deposit over 5-7 years. A portion of your rent contributes towards eventual ownership, making homeownership achievable for those still building financial capacity.",
    features: [
      "Move in immediately with minimal upfront cost",
      "Portion of rent contributes to deposit",
      "Build equity while living in the home",
      "5-7 year pathway to full ownership",
      "Rent-to-own agreement protects your investment",
      "Option to purchase at any time",
      "Ability to make approved modifications",
      "Pathway suits changing NDIS plans"
    ],
    requirements: [
      "NDIS participant with SDA funding",
      "Stable NDIS plan for rent payments",
      "Commitment to purchase pathway",
      "Good tenancy history",
      "Regular income assessment"
    ],
    timeline: "5-7 years to ownership",
    investment: "SDA Funding: $1,200+",
    icon: Clock,
    badge: "Most Flexible",
    badgeVariant: "secondary" as const,
    image: stepFreeBedroom,
    gradient: "from-secondary/10 to-secondary/5",
    benefits: [
      "Live in your future home immediately",
      "Build deposit through rent payments", 
      "No large upfront deposit required",
      "Flexibility with NDIS plan changes",
      "Secured pathway to ownership"
    ]
  },
  {
    title: "Equity Share Ownership",
    subtitle: "Own 70-80% now, complete ownership later",
    longDescription: "Share ownership with a trusted equity partner while living in your home. Own 60-80% immediately and have the option to buy the remaining share within 5-7 years. This reduces the initial financial burden while providing immediate ownership benefits.",
    features: [
      "Own 60-80% of the property immediately",
      "Equity partner holds remaining 20-40%",
      "Live in the home as the primary owner",
      "Option to buy remaining share anytime",
      "Shared responsibility for major maintenance",
      "Reduced mortgage and deposit requirements",
      "Equity building on your owned portion",
      "Flexible exit strategies available"
    ],
    requirements: [
      "NDIS participant with SDA funding",
      "Partial deposit (reduced amount)",
      "Income to support mortgage portion", 
      "Agreement to equity partnership terms",
      "Commitment to eventual full ownership"
    ],
    timeline: "5-7 years to full ownership",
    investment: "Your Loan 70-80%",
    icon: TrendingUp,
    badge: "Reduced Risk",
    badgeVariant: "outline" as const,
    image: stepFreeBathroom,
    gradient: "from-accent/10 to-accent/5",
    benefits: [
      "Lower initial deposit and mortgage",
      "Immediate ownership benefits",
      "Shared investment risk",
      "Pathway to full ownership",
      "Professional property management support"
    ]
  }
];

const pathwaysStructuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "SDA Homeownership Pathways",
  "description": "Three flexible pathways to SDA homeownership for NDIS participants",
  "provider": {
    "@type": "Organization",
    "name": "Homelander SDA Solutions"
  },
  "serviceType": "Specialist Disability Accommodation",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "SDA Homeownership Options",
    "itemListElement": detailedPathways.map((pathway, index) => ({
      "@type": "Offer",
      "position": index + 1,
      "itemOffered": {
        "@type": "Service",
        "name": pathway.title,
        "description": pathway.longDescription
      }
    }))
  }
};

const Pathways = () => {
  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={pathwaysStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto fade-in">
              <Badge variant="outline" className="mb-4">
                Detailed Pathway Comparison
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Choose Your Perfect{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  SDA Homeownership
                </span>{" "}
                Pathway
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Explore our three flexible homeownership options in detail. Each pathway is designed 
                to meet different financial situations and timelines while ensuring you get the 
                accessible home you need.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Pathways */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="space-y-16">
              {detailedPathways.map((pathway, index) => {
                const IconComponent = pathway.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}>
                    {/* Content */}
                    <div className={`fade-in ${!isEven ? 'lg:col-start-2' : ''}`}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br from-primary to-secondary`}>
                          <IconComponent className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <Badge variant={pathway.badgeVariant} className="font-medium">
                          {pathway.badge}
                        </Badge>
                      </div>
                      
                      <h2 className="text-3xl font-bold mb-2">{pathway.title}</h2>
                      <p className="text-primary font-medium mb-4">{pathway.subtitle}</p>
                      <p className="text-muted-foreground mb-6">{pathway.longDescription}</p>

                      {/* Key Benefits */}
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3 flex items-center">
                          <CheckCircle className="h-5 w-5 text-success mr-2" />
                          Key Benefits
                        </h3>
                        <div className="grid md:grid-cols-2 gap-2">
                          {pathway.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start space-x-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline & Investment */}
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-6">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-medium">{pathway.timeline}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="font-medium">{pathway.investment}</span>
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="btn-bounce" onClick={() => window.location.href = `/pathways/${pathway.title === 'Deposit Ready Ownership' ? 'deposit-ready' : pathway.title === 'Rent-to-Buy Program' ? 'rent-to-buy' : 'equity-share'}`}>
                          Learn More About This Pathway
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => window.location.href = '/calculator'}>
                          <Calculator className="mr-2 h-5 w-5" />
                          Calculate My Options
                        </Button>
                      </div>
                    </div>

                    {/* Image */}
                    <div className={`fade-in ${!isEven ? 'lg:col-start-1' : ''}`}>
                      <div className="relative overflow-hidden rounded-2xl card-elegant">
                        <img
                          src={pathway.image}
                          alt={`${pathway.title} - Accessible step-free interior showing wheelchair accessibility`}
                          className="w-full h-[400px] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
                        
                        {/* Floating Info Card */}
                        <div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm rounded-lg p-4 card-elegant">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                                <Home className="h-5 w-5 text-success-foreground" />
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-card-foreground">Step-Free Access</div>
                              <div className="text-sm text-muted-foreground">Fully accessible design</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Pathway Requirements</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Understanding what's required for each pathway helps you make the right choice for your situation.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {detailedPathways.map((pathway, index) => (
                <Card key={index} className="card-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <pathway.icon className="h-5 w-5 text-primary" />
                      <span>{pathway.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pathway.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Choose Your Pathway?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Our SDA specialists can help you determine which pathway best fits your situation, 
                funding, and goals. Get personalized recommendations based on your unique needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/eligibility'}>
                  Get Personalized Pathway Recommendation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = '/consultation'}>
                  <Users className="mr-2 h-5 w-5" />
                  Speak with SDA Specialist
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pathways;