import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, FileText, Shield, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";

const termsStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Terms of Service - Homelander SDA Solutions",
  "description": "Terms of Service for Homelander SDA Solutions - your rights and obligations when using our services",
  "dateModified": "2024-01-01",
  "mainEntity": {
    "@type": "Organization",
    "name": "Homelander SDA Solutions"
  }
};

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={termsStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto fade-in">
              <Badge variant="outline" className="mb-4">
                Terms of Service
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Terms &{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Conditions
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                These terms govern your use of our services and outline the rights and responsibilities 
                for both Homelander SDA Solutions and our clients.
              </p>
              <div className="text-sm text-muted-foreground">
                Last updated: January 1, 2024
              </div>
            </div>
          </div>
        </section>

        {/* Key Points */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Key Points</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { icon: Scale, title: "Fair Terms", description: "Transparent and fair terms that protect both parties" },
                { icon: Shield, title: "Your Rights", description: "Clear outline of your rights and protections" },
                { icon: CheckCircle, title: "Our Commitments", description: "What you can expect from our services" },
                { icon: AlertTriangle, title: "Important Notices", description: "Key limitations and responsibilities to be aware of" }
              ].map((point, index) => {
                const IconComponent = point.icon;
                return (
                  <Card key={index} className="card-elegant text-center group hover:scale-105 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold mb-2">{point.title}</h3>
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-8">
                {[
                  {
                    title: "Acceptance of Terms",
                    content: [
                      "By using our services, you agree to be bound by these terms",
                      "These terms apply to all services provided by Homelander SDA Solutions",
                      "We may update these terms from time to time with notice",
                      "Continued use after changes constitutes acceptance of new terms",
                      "If you disagree with terms, please discontinue use of our services"
                    ]
                  },
                  {
                    title: "Our Services",
                    content: [
                      "SDA property consultation and matching services",
                      "Homeownership pathway guidance and support",
                      "NDIS eligibility assessment and planning assistance",
                      "Property development and management services",
                      "Ongoing support throughout the ownership journey"
                    ]
                  },
                  {
                    title: "Client Obligations",
                    content: [
                      "Provide accurate and complete information about your situation",
                      "Maintain current NDIS plan and eligibility status",
                      "Respond promptly to requests for information or documentation",
                      "Comply with all NDIS rules and regulations",
                      "Pay agreed fees and charges on time"
                    ]
                  },
                  {
                    title: "Our Commitments",
                    content: [
                      "Provide services with professional care and competence",
                      "Maintain confidentiality of your personal information",
                      "Act in your best interests within our professional capacity",
                      "Provide clear information about costs and processes",
                      "Support you throughout the homeownership journey"
                    ]
                  },
                  {
                    title: "Limitations and Disclaimers",
                    content: [
                      "We cannot guarantee NDIS funding approval or amounts",
                      "Property availability and pricing are subject to change",
                      "We are not responsible for third-party service failures",
                      "Market conditions may affect property values and availability",
                      "Individual results may vary based on personal circumstances"
                    ]
                  },
                  {
                    title: "Fees and Payment",
                    content: [
                      "Initial consultations and assessments are provided free of charge",
                      "Service fees are clearly disclosed before any charges apply",
                      "Payment terms are agreed upon before services commence",
                      "Refund policies are outlined in individual service agreements",
                      "All fees are inclusive of GST where applicable"
                    ]
                  },
                  {
                    title: "Termination",
                    content: [
                      "Either party may terminate services with reasonable notice",
                      "Outstanding obligations continue after termination",
                      "We may suspend services for breach of terms",
                      "Confidentiality obligations survive termination",
                      "Final settlements are processed within 30 days"
                    ]
                  },
                  {
                    title: "Dispute Resolution",
                    content: [
                      "We encourage direct discussion to resolve any concerns",
                      "Formal complaints can be made to our management team",
                      "External mediation is available if needed",
                      "Australian Consumer Law protections apply",
                      "Legal proceedings are a last resort option"
                    ]
                  }
                ].map((section, index) => (
                  <Card key={index} className="card-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
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

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Questions About These Terms?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                If you have any questions about our terms of service or need clarification on any points, 
                contact us at admin@homelander.com.au or call 0400425620.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/contact'}>
                  Contact Our Team
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

export default Terms;