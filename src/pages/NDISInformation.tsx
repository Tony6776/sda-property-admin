import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Info, Users, Home, FileCheck, Phone, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";

const ndisStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "NDIS Information - Homelander SDA Solutions",
  "description": "Essential NDIS information for SDA participants and homeownership pathways",
  "mainEntity": {
    "@type": "Organization",
    "name": "Homelander SDA Solutions"
  }
};

const NDISInformation = () => {
  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={ndisStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto fade-in">
              <Badge variant="outline" className="mb-4">
                NDIS Information
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Understanding the{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  NDIS & SDA
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Essential information about the National Disability Insurance Scheme 
                and how it supports your homeownership journey through SDA funding.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links to NDIS */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Official NDIS Resources</h2>
              <p className="text-muted-foreground">Access official NDIS information and services</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {[
                {
                  title: "NDIS Housing & Living Supports",
                  description: "Official information about housing and living supports including SDA",
                  link: "https://www.ndis.gov.au/providers/housing-and-living-supports-and-services/housing",
                  isExternal: true
                },
                {
                  title: "My NDIS Portal",
                  description: "Access your NDIS plan, reports, and manage your services online",
                  link: "https://www.ndis.gov.au/participants/using-your-plan/managing-your-plan/accessing-your-plan-online",
                  isExternal: true
                },
                {
                  title: "SDA Provider Finder",
                  description: "Find registered SDA providers in your area",
                  link: "https://www.ndis.gov.au/participants/home-and-living/specialist-disability-accommodation-sda",
                  isExternal: true
                }
              ].map((resource, index) => (
                <Card key={index} className="card-elegant group hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <ExternalLink className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold mb-2">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => window.open(resource.link, '_blank')}
                    >
                      Visit Official Site
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* NDIS & SDA Explained */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">NDIS & SDA Explained</h2>
              <p className="text-muted-foreground">Understanding how the NDIS supports your housing needs</p>
            </div>

            <div className="grid gap-8">
              {[
                {
                  icon: Users,
                  title: "What is the NDIS?",
                  content: "The National Disability Insurance Scheme (NDIS) provides support to Australians with permanent and significant disability. It helps people access the supports and services they need to live an ordinary life, including housing support through Specialist Disability Accommodation (SDA)."
                },
                {
                  icon: Home,
                  title: "Specialist Disability Accommodation (SDA)",
                  content: "SDA is housing designed with features to assist people with extreme functional impairment or very high support needs. It includes modified features like wheelchair accessibility, assistive technology, and enhanced safety systems. SDA funding helps cover the cost of these specialized features."
                },
                {
                  icon: FileCheck,
                  title: "SDA Eligibility",
                  content: "To access SDA funding, you must have extreme functional impairment or very high support needs that require specialized housing. The NDIA assesses your eligibility based on your disability-related need for accommodation features, not your financial situation."
                }
              ].map((section, index) => (
                <Card key={index} className="card-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <section.icon className="h-6 w-6 text-primary" />
                      </div>
                      <span>{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SDA Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">SDA Design Categories</h2>
              <p className="text-muted-foreground">Different levels of accessibility and support features</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  category: "Improved Liveability",
                  description: "Basic accessibility features for people with sensory, intellectual, or cognitive impairments",
                  features: [
                    "Enhanced lighting and acoustic design",
                    "Improved ventilation systems", 
                    "Better indoor air quality",
                    "Assistive technology compatibility"
                  ]
                },
                {
                  category: "Robust",
                  description: "Reinforced design for people with complex behavioral support needs",
                  features: [
                    "Reinforced walls and fixtures",
                    "Impact-resistant materials",
                    "Enhanced safety systems",
                    "Durable construction materials"
                  ]
                },
                {
                  category: "Fully Accessible",
                  description: "Full wheelchair accessibility for people with significant physical impairments",
                  features: [
                    "Wheelchair accessible throughout",
                    "Wider doorways and hallways",
                    "Accessible bathrooms and kitchens",
                    "Level access entries"
                  ]
                },
                {
                  category: "High Physical Support",
                  description: "Advanced accessibility features for people requiring extensive physical support",
                  features: [
                    "All Fully Accessible features plus:",
                    "Ceiling mounted hoist systems",
                    "Emergency backup power",
                    "Advanced assistive technology"
                  ]
                }
              ].map((category, index) => (
                <Card key={index} className="card-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <Badge variant="outline">{category.category}</Badge>
                    </CardTitle>
                    <p className="text-muted-foreground">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Getting Help */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Need Help with Your NDIS Plan?</h2>
              <p className="text-muted-foreground">We're here to support you through the NDIS process</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="card-elegant text-center">
                <CardContent className="p-6">
                  <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold mb-2">NDIS Contact Centre</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Call 1800 800 110 for NDIS enquiries and support
                  </p>
                  <Button variant="outline" onClick={() => window.open('tel:1800800110')}>
                    Call NDIS
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-elegant text-center">
                <CardContent className="p-6">
                  <Info className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Our NDIS Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get help understanding SDA and planning your homeownership
                  </p>
                  <Button onClick={() => window.location.href = '/contact'}>
                    Contact Us
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-elegant text-center">
                <CardContent className="p-6">
                  <ExternalLink className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Official NDIS Website</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access official forms, resources, and information
                  </p>
                  <Button variant="outline" onClick={() => window.open('https://www.ndis.gov.au', '_blank')}>
                    Visit NDIS.gov.au
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Ready to Explore SDA Homeownership?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Let us help you understand how your NDIS plan can support your homeownership goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/consultation'}>
                  Book Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = '/eligibility'}>
                  Check Your Eligibility
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

export default NDISInformation;