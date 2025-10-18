import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowLeft, CheckCircle, Clock, DollarSign, Home, Users, Calculator, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";
import stepFreeLiving from "@/assets/step-free-living.jpg";
import stepFreeBedroom from "@/assets/step-free-bedroom.jpg";
import stepFreeBathroom from "@/assets/step-free-bathroom.jpg";

const pathwayData = {
  "deposit-ready": {
    title: "Deposit Ready Ownership",
    subtitle: "Full ownership from day one",
    description: "Perfect for NDIS participants who have saved a deposit and want immediate full ownership of their accessible home. This pathway offers the fastest route to homeownership with complete control and no shared equity arrangements.",
    image: stepFreeLiving,
    badge: "Most Popular",
    color: "primary",
    timeline: "60-90 days",
    investment: "Deposit: 10-20%",
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
    benefits: [
      "Immediate ownership and equity building",
      "Complete control over your home",
      "No ongoing rent or shared equity",
      "Full tax benefits and deductions",
      "Freedom to modify as needed"
    ],
    process: [
      { step: "Eligibility Assessment", duration: "1-2 days", description: "We review your NDIS plan, funding, and financial capacity" },
      { step: "Pre-approval", duration: "7-14 days", description: "Secure loan pre-approval with our finance partners" },
      { step: "Property Selection", duration: "2-4 weeks", description: "Choose from available properties or custom build options" },
      { step: "Legal & Settlement", duration: "4-6 weeks", description: "Complete legal requirements and settle on your new home" }
    ],
    costs: [
      { item: "Property Deposit", amount: "$50,000 - $150,000", description: "10-20% of property value" },
      { item: "Legal & Conveyancing", amount: "$1,500 - $3,000", description: "Legal fees for settlement" },
      { item: "Building Inspection", amount: "$500 - $800", description: "Professional property inspection" },
      { item: "Loan Establishment", amount: "$600 - $1,200", description: "Bank fees and mortgage setup" }
    ]
  },
  "rent-to-buy": {
    title: "Rent-to-Buy Program",
    subtitle: "Move in now, build your deposit over time",
    description: "Designed for NDIS participants who want to live in their future home while building the deposit over 5-7 years. A portion of your rent contributes towards eventual ownership, making homeownership achievable for those still building financial capacity.",
    image: stepFreeBedroom,
    badge: "Most Flexible",
    color: "secondary",
    timeline: "5-7 years to ownership",
    investment: "Weekly rent: $400-$800",
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
    benefits: [
      "Live in your future home immediately",
      "Build deposit through rent payments", 
      "No large upfront deposit required",
      "Flexibility with NDIS plan changes",
      "Secured pathway to ownership"
    ],
    process: [
      { step: "Application & Assessment", duration: "3-5 days", description: "Complete application and NDIS plan review" },
      { step: "Property Matching", duration: "1-3 weeks", description: "Find the perfect accessible property for your needs" },
      { step: "Rent-to-Buy Agreement", duration: "1-2 weeks", description: "Sign comprehensive agreement outlining your pathway to ownership" },
      { step: "Move In & Build Equity", duration: "5-7 years", description: "Live in your home while building towards full ownership" }
    ],
    costs: [
      { item: "Security Deposit", amount: "$2,000 - $4,000", description: "Refundable security deposit" },
      { item: "Weekly Rent", amount: "$400 - $800", description: "Includes deposit contribution component" },
      { item: "Application Fee", amount: "$200 - $400", description: "One-time application processing" },
      { item: "Property Modifications", amount: "As needed", description: "Approved accessibility modifications" }
    ]
  },
  "equity-share": {
    title: "Equity Share Ownership",
    subtitle: "Own 60-80% now, complete ownership later",
    description: "Share ownership with a trusted equity partner while living in your home. Own 60-80% immediately and have the option to buy the remaining share within 5-7 years. This reduces the initial financial burden while providing immediate ownership benefits.",
    image: stepFreeBathroom,
    badge: "Reduced Risk",
    color: "accent",
    timeline: "5-7 years to full ownership",
    investment: "Partial deposit: $30k-$80k",
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
    benefits: [
      "Lower initial deposit and mortgage",
      "Immediate ownership benefits",
      "Shared investment risk",
      "Pathway to full ownership",
      "Professional property management support"
    ],
    process: [
      { step: "Partnership Assessment", duration: "1-2 weeks", description: "Evaluate suitability for equity sharing arrangement" },
      { step: "Property & Partner Matching", duration: "2-4 weeks", description: "Find suitable property and equity partner" },
      { step: "Legal Documentation", duration: "2-3 weeks", description: "Establish equity sharing agreements and legal framework" },
      { step: "Settlement & Occupancy", duration: "4-6 weeks", description: "Settle on your share and move into your new home" }
    ],
    costs: [
      { item: "Partial Deposit", amount: "$30,000 - $80,000", description: "Deposit on your ownership percentage" },
      { item: "Legal & Setup", amount: "$2,000 - $4,000", description: "Equity partnership documentation" },
      { item: "Ongoing Management", amount: "$50 - $100/month", description: "Partnership management and reporting" },
      { item: "Exit Strategy Planning", amount: "$1,000 - $2,000", description: "Future ownership transition planning" }
    ]
  }
};

const PathwayDetails = () => {
  const { pathway } = useParams<{ pathway: string }>();
  const pathwayKey = pathway as keyof typeof pathwayData;
  const data = pathwayData[pathwayKey];

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <AccessibilitySkipLink />
        <Header />
        <main id="main-content" role="main" className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Pathway Not Found</h1>
            <Button onClick={() => window.location.href = '/pathways'}>
              View All Pathways
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": data.title,
    "description": data.description,
    "provider": {
      "@type": "Organization",
      "name": "Homelander SDA Solutions"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={structuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Button 
                    variant="ghost" 
                    className="mb-6 p-0 h-auto hover:bg-transparent"
                    onClick={() => window.history.back()}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Pathways
                  </Button>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <Badge variant={data.color === "primary" ? "default" : data.color === "secondary" ? "secondary" : "outline"}>
                      {data.badge}
                    </Badge>
                  </div>
                  
                  <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
                  <p className="text-xl text-primary font-medium mb-6">{data.subtitle}</p>
                  <p className="text-lg text-muted-foreground mb-8">{data.description}</p>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-8">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-medium">{data.timeline}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="font-medium">{data.investment}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/consultation'}>
                      Book Free Consultation
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => window.location.href = '/calculator'}>
                      <Calculator className="mr-2 h-5 w-5" />
                      Calculate Options
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <img
                    src={data.image}
                    alt={`${data.title} - Accessible step-free interior design`}
                    className="w-full h-[500px] object-cover rounded-2xl card-elegant"
                  />
                  <div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm rounded-lg p-4 card-elegant">
                    <div className="flex items-center space-x-3">
                      <Home className="h-6 w-6 text-success" />
                      <div>
                        <div className="font-semibold">Step-Free Access</div>
                        <div className="text-sm text-muted-foreground">Fully accessible design</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features & Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                <Card className="card-elegant">
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-elegant">
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-5 h-5 border-2 border-primary rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          </div>
                          <span className="text-sm">{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Process Timeline */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Step-by-Step Process</h2>
              
              <div className="space-y-8">
                {data.process.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {index + 1}
                      </div>
                      
                      <Card className="flex-1 card-elegant">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-semibold">{step.step}</h3>
                            <Badge variant="outline">{step.duration}</Badge>
                          </div>
                          <p className="text-muted-foreground">{step.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {index < data.process.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-8 bg-primary/30"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cost Breakdown */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Cost Breakdown</h2>
              
              <Card className="card-elegant">
                <CardContent className="p-0">
                  {data.costs.map((cost, index) => (
                    <div key={index}>
                      <div className="p-6 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{cost.item}</h4>
                          <p className="text-sm text-muted-foreground">{cost.description}</p>
                        </div>
                        <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                          {cost.amount}
                        </Badge>
                      </div>
                      {index < data.costs.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Start with {data.title}?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Our specialists can provide personalized guidance and help you get started with this pathway.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="card-elegant text-center">
                  <CardContent className="p-6">
                    <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Call Now</h3>
                    <p className="text-sm text-muted-foreground mb-4">Speak directly with our specialists</p>
                    <a href="tel:1800732435" className="text-primary font-bold">1800 SDA HELP</a>
                  </CardContent>
                </Card>
                
                <Card className="card-elegant text-center">
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 text-secondary mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Book Consultation</h3>
                    <p className="text-sm text-muted-foreground mb-4">Free 30-minute assessment</p>
                    <Button variant="outline" onClick={() => window.location.href = '/consultation'}>
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="card-elegant text-center">
                  <CardContent className="p-6">
                    <Calculator className="h-8 w-8 text-accent mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Use Calculator</h3>
                    <p className="text-sm text-muted-foreground mb-4">Calculate your options</p>
                    <Button variant="outline" onClick={() => window.location.href = '/calculator'}>
                      Calculate
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/consultation'}>
                Get Started with {data.title}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PathwayDetails;