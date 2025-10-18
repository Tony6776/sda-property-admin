import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/f4abb637-a33c-4cd3-8ee6-caa468f410d0.png"
                alt="Homelander SDA Solutions Logo"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-muted mb-6">
              Australia's trusted SDA provider, helping NDIS participants achieve 
              homeownership through flexible, accessible pathways.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span>0400425620</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@sdabyhomelander.com.au</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>National Service Coverage</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-primary" />
                <span>24/7 Support Available</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-6">Quick Links</h3>
            <div className="space-y-3 text-sm">
              <a href="/pathways" className="block text-muted hover:text-background transition-colors">
                Ownership Pathways
              </a>
              <a href="/how-it-works" className="block text-muted hover:text-background transition-colors">
                How It Works
              </a>
              <a href="/about" className="block text-muted hover:text-background transition-colors">
                About Us
              </a>
              <a href="/contact" className="block text-muted hover:text-background transition-colors">
                Support Center
              </a>
              <a href="/properties" className="block text-muted hover:text-background transition-colors">
                Available Properties
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold mb-6">SDA Services</h3>
            <div className="space-y-3 text-sm">
              <a href="/pathways" className="block text-muted hover:text-background transition-colors">
                Deposit Ready Ownership
              </a>
              <a href="/pathways" className="block text-muted hover:text-background transition-colors">
                Rent-to-Buy Program
              </a>
              <a href="/pathways" className="block text-muted hover:text-background transition-colors">
                Equity Share Ownership
              </a>
              <a href="/contact" className="block text-muted hover:text-background transition-colors">
                Free Consultation
              </a>
              <a href="/contact" className="block text-muted hover:text-background transition-colors">
                Eligibility Assessment
              </a>
            </div>
          </div>

          {/* Resources & Support */}
          <div>
            <h3 className="font-bold mb-6">Resources</h3>
            <div className="space-y-3 text-sm">
              <a href="/faq" className="block text-muted hover:text-background transition-colors">
                Frequently Asked Questions
              </a>
              {/* Temporarily hidden until PDF resources are ready
              <a href="/sda-guides" className="block text-muted hover:text-background transition-colors">
                SDA Guides & Resources
              </a>
              */}
              <a href="/ndis-information" className="block text-muted hover:text-background transition-colors">
                NDIS Information
              </a>
              <a href="/privacy" className="block text-muted hover:text-background transition-colors">
                Legal & Privacy
              </a>
              <a href="/contact" className="block text-muted hover:text-background transition-colors">
                Contact Support
              </a>
            </div>

          </div>
        </div>

        <Separator className="bg-muted/20" />

        {/* Bottom Footer */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted">
            <span>&copy; 2025 PropTech AU Solutions Company. All rights reserved.</span>
            <div className="flex space-x-4">
              <a href="/privacy" className="hover:text-background transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-background transition-colors">Terms of Service</a>
              <a href="/accessibility" className="hover:text-background transition-colors">Accessibility</a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* NDIS Registration */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">N</span>
              </div>
              <span className="text-muted">NDIS Registered Provider</span>
            </div>
            
            {/* External Link to NDIS */}
            <Button variant="ghost" size="sm" className="text-muted hover:text-background">
              <ExternalLink className="h-4 w-4 mr-2" />
              Verify Registration
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;