import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Phone, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";

const NotFoundImproved = () => {
  return (
    <div className="min-h-screen bg-background">
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main" className="flex-1">
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <Card className="card-elegant">
                <CardContent className="p-12">
                  {/* 404 Error */}
                  <div className="text-8xl font-bold text-primary mb-4" aria-hidden="true">
                    404
                  </div>
                  
                  {/* Main Error Message */}
                  <h1 className="text-3xl font-bold mb-4">
                    Page Not Found
                  </h1>
                  
                  <p className="text-muted-foreground mb-8 text-lg">
                    Sorry, we couldn't find the page you're looking for. 
                    The page may have been moved, deleted, or the URL might be incorrect.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button 
                      size="lg" 
                      onClick={() => window.history.back()}
                      aria-label="Go back to previous page"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
                      Go Back
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => window.location.href = '/'}
                      aria-label="Return to homepage"
                    >
                      <Home className="mr-2 h-5 w-5" aria-hidden="true" />
                      Return Home
                    </Button>
                  </div>

                  {/* Helpful Links */}
                  <div className="border-t border-border/60 pt-8">
                    <h2 className="text-lg font-semibold mb-4">
                      Need Help? Try These Links:
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4 text-left">
                      <a 
                        href="/pathways" 
                        className="block p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label="View SDA homeownership pathways"
                      >
                        <div className="font-medium">SDA Pathways</div>
                        <div className="text-sm text-muted-foreground">Explore homeownership options</div>
                      </a>
                      <a 
                        href="/about" 
                        className="block p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label="Learn about our company and services"
                      >
                        <div className="font-medium">About Us</div>
                        <div className="text-sm text-muted-foreground">Learn about our services</div>
                      </a>
                      <a 
                        href="/contact" 
                        className="block p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label="Contact our support team"
                      >
                        <div className="font-medium flex items-center">
                          <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                          Contact Support
                        </div>
                        <div className="text-sm text-muted-foreground">Get help from our team</div>
                      </a>
                      <a 
                        href="mailto:info@sdabyhomelander.com.au" 
                        className="block p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label="Send us an email for assistance"
                      >
                        <div className="font-medium flex items-center">
                          <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                          Email Us
                        </div>
                        <div className="text-sm text-muted-foreground">Direct email support</div>
                      </a>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="mt-8 p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium">
                      Need immediate assistance? Call our 24/7 helpline:
                    </p>
                    <a 
                      href="tel:1800732435" 
                      className="text-primary font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      aria-label="Call 1800 SDA HELP for immediate assistance"
                    >
                      1800 SDA HELP (1800 732 435)
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundImproved;