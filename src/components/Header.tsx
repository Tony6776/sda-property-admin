import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import MobileNav from "./MobileNav";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <a href="/" aria-label="Homelander SDA Solutions - Return to homepage">
              <img 
                src="/lovable-uploads/f4abb637-a33c-4cd3-8ee6-caa468f410d0.png"
                alt="Homelander SDA Solutions Logo - Trusted SDA Provider"
                className="h-10 w-auto"
                loading="eager"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            <a 
              href="/pathways" 
              className="text-sm font-medium text-foreground hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors rounded-sm px-2 py-1"
              aria-label="View SDA homeownership pathways"
            >
              Pathways
            </a>
            <a 
              href="/properties" 
              className="text-sm font-medium text-foreground hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors rounded-sm px-2 py-1"
              aria-label="Browse available SDA properties"
            >
              Properties
            </a>
            <a 
              href="/about" 
              className="text-sm font-medium text-foreground hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors rounded-sm px-2 py-1"
              aria-label="Learn about Homelander SDA Solutions"
            >
              About
            </a>
            <a 
              href="/faq" 
              className="text-sm font-medium text-foreground hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors rounded-sm px-2 py-1"
              aria-label="View frequently asked questions about SDA"
            >
              FAQ
            </a>
            <a 
              href="/contact" 
              className="text-sm font-medium text-foreground hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors rounded-sm px-2 py-1"
              aria-label="Contact our SDA specialists"
            >
              Contact
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden lg:flex items-center space-x-2"
              aria-label="Call our 24/7 SDA helpline at 1800 SDA HELP"
              onClick={() => window.open('tel:1800732435', '_self')}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>1800 SDA HELP</span>
            </Button>
            <Button 
              className="btn-bounce"
              aria-label="Start your SDA eligibility assessment"
              onClick={() => window.location.href = '/eligibility'}
            >
              Check Eligibility
            </Button>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;