import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, X } from "lucide-react";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { href: "/pathways", label: "Pathways", description: "SDA homeownership pathways" },
    { href: "/properties", label: "Properties", description: "Browse available SDA properties" },
    { href: "/about", label: "About", description: "Learn about our services" },
    { href: "/faq", label: "FAQ", description: "Frequently asked questions about SDA" },
    { href: "/contact", label: "Contact", description: "Get in touch with our team" },
  ];

  const closeNav = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-border/60">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={closeNav}
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-6" role="navigation">
            <div className="space-y-2">
              {navigationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="block p-4 rounded-lg hover:bg-muted/50 transition-colors group"
                  onClick={closeNav}
                >
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.label}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </div>
                </a>
              ))}
            </div>
          </nav>

          {/* CTA Buttons */}
          <div className="border-t border-border/60 pt-6 space-y-3">
            <Button 
              className="w-full btn-bounce"
              onClick={() => {
                closeNav();
                window.location.href = '/eligibility';
              }}
            >
              Check SDA Eligibility
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => {
                closeNav();
                window.open('tel:1800732435', '_self');
              }}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call 1800 SDA HELP
            </Button>
            <Button 
              variant="ghost"
              className="w-full"
              onClick={() => {
                closeNav();
                window.location.href = '/consultation';
              }}
            >
              Book Consultation
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;