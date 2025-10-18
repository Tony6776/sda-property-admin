import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, UserCheck, ArrowRight, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";

const privacyStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Privacy Policy - Homelander SDA Solutions",
  "description": "Privacy Policy for Homelander SDA Solutions - how we collect, use, and protect your personal information",
  "dateModified": "2024-01-01",
  "mainEntity": {
    "@type": "Organization",
    "name": "Homelander SDA Solutions"
  }
};

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={privacyStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto fade-in">
              <Badge variant="outline" className="mb-4">
                Privacy Policy
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Your Privacy{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Matters to Us
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We are committed to protecting your privacy and ensuring the security of your personal information. 
                This policy explains how we collect, use, and safeguard your data.
              </p>
              <div className="text-sm text-muted-foreground">
                Last updated: January 1, 2024
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Principles */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Our Privacy Principles</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { icon: Shield, title: "Data Protection", description: "Your information is protected with industry-standard security measures" },
                { icon: Lock, title: "Secure Storage", description: "All data is encrypted and stored securely in Australian data centers" },
                { icon: Eye, title: "Transparency", description: "We clearly explain what data we collect and how we use it" },
                { icon: UserCheck, title: "Your Control", description: "You have full control over your personal information at all times" }
              ].map((principle, index) => {
                const IconComponent = principle.icon;
                return (
                  <Card key={index} className="card-elegant text-center group hover:scale-105 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold mb-2">{principle.title}</h3>
                      <p className="text-sm text-muted-foreground">{principle.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-8">
                {[
                  {
                    title: "Information We Collect",
                    content: [
                      "Personal identification information (name, email, phone number)",
                      "NDIS participant details and support requirements",
                      "Property preferences and accessibility needs",
                      "Financial information relevant to homeownership pathways",
                      "Website usage data and analytics information"
                    ]
                  },
                  {
                    title: "How We Use Your Information",
                    content: [
                      "To provide SDA homeownership services and consultations",
                      "To match you with suitable properties and pathways",
                      "To communicate about your application and services",
                      "To comply with NDIS regulations and requirements",
                      "To improve our services and website functionality"
                    ]
                  },
                  {
                    title: "Information Sharing",
                    content: [
                      "We do not sell or rent your personal information to third parties",
                      "We may share information with NDIS-approved service providers",
                      "Property developers and financial institutions (with your consent)",
                      "Legal authorities when required by law",
                      "Service providers who assist in delivering our services"
                    ]
                  },
                  {
                    title: "Your Rights",
                    content: [
                      "Access your personal information we hold",
                      "Request correction of inaccurate information",
                      "Request deletion of your personal information",
                      "Opt-out of marketing communications",
                      "Lodge a complaint about our privacy practices"
                    ]
                  },
                  {
                    title: "Data Security",
                    content: [
                      "All data is encrypted in transit and at rest",
                      "Regular security audits and vulnerability assessments",
                      "Staff training on privacy and data protection",
                      "Secure Australian data centers with 24/7 monitoring",
                      "Incident response procedures for any security breaches"
                    ]
                  },
                  {
                    title: "Contact Us",
                    content: [
                      "Privacy Officer: admin@homelander.com.au",
                      "Phone: 0400425620",
                      "Mail: Privacy Officer, Homelander SDA Solutions",
                      "We will respond to privacy inquiries within 30 days",
                      "You can also contact the Australian Privacy Commissioner"
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
              <h2 className="text-3xl font-bold mb-6">Questions About Privacy?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                If you have any questions about our privacy policy or how we handle your information, 
                please don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/contact'}>
                  Contact Privacy Officer
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

export default Privacy;