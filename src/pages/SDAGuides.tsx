import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, FileText, BookOpen, Video, Users, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";

const sdaGuidesStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "SDA Guides & Resources - Homelander SDA Solutions",
  "description": "Comprehensive guides and resources for SDA homeownership, NDIS planning, and accessible housing",
  "mainEntity": {
    "@type": "Organization",
    "name": "Homelander SDA Solutions"
  }
};

const SDAGuides = () => {
  const resourceCategories = [
    {
      title: "SDA Fundamentals",
      icon: BookOpen,
      description: "Essential guides to understanding Specialist Disability Accommodation",
      resources: [
        {
          title: "Complete Guide to SDA Categories",
          description: "Detailed breakdown of Improved Liveability, Robust, Fully Accessible, and High Physical Support",
          type: "PDF Guide",
          downloadable: true
        },
        {
          title: "SDA Funding Explained",
          description: "How SDA funding works, payment structures, and what's covered",
          type: "PDF Guide",
          downloadable: true
        },
        {
          title: "Your Rights as an SDA Participant",
          description: "Understanding your rights and protections under the NDIS",
          type: "PDF Guide",
          downloadable: true
        }
      ]
    },
    {
      title: "Homeownership Process",
      icon: FileText,
      description: "Step-by-step guides for the SDA homeownership journey",
      resources: [
        {
          title: "Pre-Purchase Checklist",
          description: "Everything you need to prepare before buying your SDA property",
          type: "Checklist",
          downloadable: true
        },
        {
          title: "Understanding Property Inspections",
          description: "What to look for when inspecting accessible properties",
          type: "Guide",
          downloadable: false
        },
        {
          title: "Settlement Process Guide",
          description: "Navigate the final steps to homeownership with confidence",
          type: "PDF Guide",
          downloadable: true
        }
      ]
    },
    {
      title: "Financial Planning",
      icon: Users,
      description: "Resources to help you plan and manage your SDA homeownership finances",
      resources: [
        {
          title: "SDA Homeownership Budget Template",
          description: "Spreadsheet template to plan your ongoing homeownership costs",
          type: "Excel Template",
          downloadable: true
        },
        {
          title: "Loan Application Guide",
          description: "Tips for preparing your loan application and required documents",
          type: "PDF Guide",
          downloadable: true
        },
        {
          title: "Understanding Interest Rates",
          description: "How interest rates affect your SDA homeownership journey",
          type: "Article",
          downloadable: false
        }
      ]
    },
    {
      title: "Video Resources",
      icon: Video,
      description: "Watch and learn about SDA homeownership",
      resources: [
        {
          title: "SDA Homeownership Explained",
          description: "15-minute overview of the SDA homeownership process",
          type: "Video",
          downloadable: false
        },
        {
          title: "Property Tour: Fully Accessible Home",
          description: "Virtual tour showcasing fully accessible SDA features",
          type: "Video",
          downloadable: false
        },
        {
          title: "Client Success Stories",
          description: "Hear from SDA homeowners about their experiences",
          type: "Video",
          downloadable: false
        }
      ]
    }
  ];

  const quickResources = [
    {
      title: "SDA Categories Comparison",
      description: "Quick reference for different SDA design categories",
      link: "#"
    },
    {
      title: "Homeownership Pathways Overview",
      description: "Compare our three homeownership options",
      link: "/pathways"
    },
    {
      title: "Accessibility Features Checklist",
      description: "Essential features to look for in SDA properties",
      link: "#"
    },
    {
      title: "NDIS Plan Review Preparation",
      description: "Get ready for your next NDIS planning meeting",
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={sdaGuidesStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto fade-in">
              <Badge variant="outline" className="mb-4">
                SDA Guides & Resources
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Knowledge{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Centre
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Everything you need to know about SDA homeownership. 
                Comprehensive guides, templates, and resources to support your journey.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Resources */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Quick Resources</h2>
              <p className="text-muted-foreground">Essential information at your fingertips</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {quickResources.map((resource, index) => (
                <Card key={index} className="card-elegant group hover:scale-105 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold mb-2 text-sm">{resource.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{resource.description}</p>
                    <Button variant="ghost" size="sm" className="w-full">
                      <ExternalLink className="h-3 w-3 mr-2" />
                      View
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Resources */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Comprehensive Resources</h2>
              <p className="text-muted-foreground">Detailed guides and materials for every stage of your journey</p>
            </div>

            <div className="space-y-12">
              {resourceCategories.map((category, categoryIndex) => {
                const IconComponent = category.icon;
                return (
                  <Card key={categoryIndex} className="card-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xl">{category.title}</div>
                          <div className="text-sm text-muted-foreground font-normal">{category.description}</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {category.resources.map((resource, index) => (
                          <Card key={index} className="border-border/50 hover:border-primary/20 transition-colors group">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0 mt-1">
                                  {resource.downloadable ? (
                                    <Download className="h-4 w-4 text-primary" />
                                  ) : (
                                    <ExternalLink className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-sm mb-1 line-clamp-2">{resource.title}</h4>
                                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{resource.description}</p>
                                  <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="text-xs">
                                      {resource.type}
                                    </Badge>
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                      {resource.downloadable ? 'Download' : 'View'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Subscribe to our newsletter for the latest SDA guides, policy updates, 
                and homeownership tips delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="btn-bounce">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
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

export default SDAGuides;