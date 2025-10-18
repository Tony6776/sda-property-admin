import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accessibility, Eye, Keyboard, Volume2, ArrowRight, Heart, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";
import accessibleInterior from "@/assets/accessible-interior.jpg";

const accessibilityStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Accessibility Statement - Homelander SDA Solutions",
  "description": "Our commitment to digital accessibility and inclusive design for all users",
  "dateModified": "2024-01-01",
  "mainEntity": {
    "@type": "Organization",
    "name": "Homelander SDA Solutions"
  }
};

const AccessibilityStatement = () => {
  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={accessibilityStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto fade-in">
              <Badge variant="outline" className="mb-4">
                Accessibility Statement
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Accessibility is{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We are committed to ensuring our website and services are accessible to everyone, 
                including people with disabilities. This is our ongoing commitment to digital inclusion.
              </p>
              <div className="text-sm text-muted-foreground">
                Last updated: January 1, 2024
              </div>
            </div>
          </div>
        </section>

        {/* Our Commitment */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="fade-in">
                <h2 className="text-3xl font-bold mb-6">
                  Our{" "}
                  <span className="text-primary">Accessibility Commitment</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  At Homelander SDA Solutions, accessibility isn't just about compliance – 
                  it's about ensuring everyone can access the information and services they need 
                  to achieve their homeownership dreams.
                </p>
                <p className="text-muted-foreground mb-8">
                  We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 
                  Level AA standards to ensure our website is usable by people with a wide 
                  range of abilities and disabilities.
                </p>
                
                <div className="space-y-4">
                  {[
                    "WCAG 2.1 Level AA compliance",
                    "Regular accessibility audits and testing",
                    "User feedback integration",
                    "Continuous improvement process"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fade-in">
                <div className="relative overflow-hidden rounded-2xl card-elegant">
                  <img
                    src={accessibleInterior}
                    alt="Modern accessible interior design featuring step-free access, wide doorways, and inclusive furnishing"
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Website Accessibility Features</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our website includes numerous features designed to enhance accessibility 
                and provide an inclusive experience for all users.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Keyboard,
                  title: "Keyboard Navigation",
                  description: "Full keyboard navigation support with visible focus indicators and skip links"
                },
                {
                  icon: Eye,
                  title: "Visual Accessibility", 
                  description: "High contrast colors, scalable fonts, and alternative text for all images"
                },
                {
                  icon: Volume2,
                  title: "Screen Reader Support",
                  description: "Semantic HTML structure and proper ARIA labels for screen reader compatibility"
                },
                {
                  icon: Accessibility,
                  title: "Inclusive Design",
                  description: "User-friendly interface designed with accessibility principles from the ground up"
                }
              ].map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="card-elegant text-center group hover:scale-105 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-16">Technical Implementation</h2>
              
              <div className="grid gap-8">
                {[
                  {
                    title: "Standards Compliance",
                    content: [
                      "WCAG 2.1 Level AA compliance across all pages",
                      "Semantic HTML5 structure for proper document outline",
                      "ARIA landmarks and labels for enhanced navigation",
                      "Proper heading hierarchy (H1-H6) for content structure",
                      "Alternative text for all meaningful images and graphics"
                    ]
                  },
                  {
                    title: "Keyboard Accessibility",
                    content: [
                      "Tab key navigation through all interactive elements", 
                      "Enter and Space key activation for buttons and links",
                      "Escape key functionality for modal dialogs",
                      "Arrow key navigation in complex widgets",
                      "Visible focus indicators on all focusable elements"
                    ]
                  },
                  {
                    title: "Visual Design",
                    content: [
                      "Minimum 4.5:1 contrast ratio for normal text",
                      "Minimum 3:1 contrast ratio for large text and graphics",
                      "Text scaling up to 200% without horizontal scrolling",
                      "Color is not the sole means of conveying information",
                      "Consistent navigation and layout across pages"
                    ]
                  },
                  {
                    title: "Assistive Technology Support",
                    content: [
                      "Screen reader compatibility (NVDA, JAWS, VoiceOver)",
                      "Voice recognition software compatibility",
                      "Switch navigation support",
                      "Magnification software compatibility",
                      "Keyboard-only navigation capability"
                    ]
                  }
                ].map((section, index) => (
                  <Card key={index} className="card-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <Accessibility className="h-5 w-5 text-primary" />
                        <span>{section.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.content.map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <Heart className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Help Us Improve</h2>
              <p className="text-xl text-muted-foreground mb-8">
                We welcome your feedback on the accessibility of our website. If you encounter 
                any barriers or have suggestions for improvement, please let us know.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="card-elegant">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Report Accessibility Issues</h3>
                    <p className="text-muted-foreground mb-4">
                      Found something that could be improved? We want to hear about it.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>Email: accessibility@sdabyhomelander.com.au</div>
                      <div>Phone: 1800 SDA HELP</div>
                      <div>Response time: Within 2 business days</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-elegant">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Alternative Access</h3>
                    <p className="text-muted-foreground mb-4">
                      Need information in an alternative format? We can help.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>Large print documents</div>
                      <div>Audio descriptions</div>
                      <div>Plain language versions</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/contact'}>
                  Contact Accessibility Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = '/'}>
                  Return to Home
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

export default AccessibilityStatement;