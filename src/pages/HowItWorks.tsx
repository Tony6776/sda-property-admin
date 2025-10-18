import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Users, Home, FileCheck, Key } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";

const howItWorksStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "How It Works - Homelander SDA Solutions",
  "description": "Learn how our SDA homeownership process works - from eligibility to moving in",
  "mainEntity": {
    "@type": "Organization",
    "name": "Homelander SDA Solutions"
  }
};

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={howItWorksStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto fade-in">
              <Badge variant="outline" className="mb-4">
                How It Works
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Your Path to{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  SDA Homeownership
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                From eligibility assessment to moving into your new accessible home, 
                we guide you through every step of the SDA homeownership journey.
              </p>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Simple 4-Step Process</h2>
              <p className="text-xl text-muted-foreground">
                We've streamlined the SDA homeownership process to make it as straightforward as possible
              </p>
            </div>

            <div className="grid gap-8">
              {[
                {
                  step: "01",
                  icon: Users,
                  title: "Free Consultation",
                  description: "Meet with our SDA specialists for a comprehensive assessment of your needs and eligibility",
                  details: [
                    "Review your NDIS plan and SDA funding",
                    "Understand your accessibility requirements",
                    "Explore available homeownership pathways",
                    "Get personalized recommendations"
                  ],
                  timeline: "30-60 minutes"
                },
                {
                  step: "02",
                  icon: Home,
                  title: "Property Matching",
                  description: "We match you with suitable SDA properties that meet your specific needs and budget",
                  details: [
                    "Access our exclusive property database",
                    "Virtual and in-person property tours",
                    "Detailed accessibility assessments",
                    "Location and support service proximity analysis"
                  ],
                  timeline: "1-2 weeks"
                },
                {
                  step: "03",
                  icon: FileCheck,
                  title: "Application & Approval",
                  description: "Complete the application process with our expert guidance and support",
                  details: [
                    "Prepare all required documentation",
                    "Submit NDIS funding applications",
                    "Coordinate with financial institutions",
                    "Navigate regulatory requirements"
                  ],
                  timeline: "6-8 weeks"
                },
                {
                  step: "04",
                  icon: Key,
                  title: "Move In Ready",
                  description: "Complete the settlement process and move into your new accessible home",
                  details: [
                    "Finalize property settlement",
                    "Coordinate move-in logistics",
                    "Set up support services",
                    "Ongoing homeownership support"
                  ],
                  timeline: "60-90 days"
                }
              ].map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <Card key={index} className="card-elegant relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <IconComponent className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-mono text-muted-foreground">Step {step.step}</div>
                            <CardTitle className="text-2xl">{step.title}</CardTitle>
                          </div>
                        </div>
                        <Badge variant="secondary">{step.timeline}</Badge>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Typical Timeline</h2>
              <p className="text-xl text-muted-foreground">
                From first consultation to moving in typically takes 16-20 weeks
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent"></div>
                <div className="space-y-8">
                  {[
                    { week: "Week 1", milestone: "Initial Consultation & Assessment" },
                    { week: "Week 2-3", milestone: "Property Matching & Tours" },
                    { week: "Week 6-8", milestone: "Application & Approval Process" },
                    { week: "60-90 days", milestone: "Settlement & Move-in" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-background border-4 border-primary rounded-full flex items-center justify-center relative z-10">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">{item.week}</div>
                        <div className="font-semibold">{item.milestone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Book your free consultation today and take the first step towards SDA homeownership.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/consultation'}>
                  Book Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = '/eligibility'}>
                  Check Eligibility
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

export default HowItWorks;