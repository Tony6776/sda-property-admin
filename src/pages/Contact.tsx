import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Clock, MessageCircle, Calendar, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { routeLead } from "@/lib/edgeFunctions";

const contactMethods = [
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our SDA specialists",
    details: "1800 SDA HELP (1800 732 4357)",
    availability: "24/7 Support Available",
    action: "Call Now",
    color: "primary"
  },
  {
    icon: Mail,
    title: "Email Support", 
    description: "Send us your questions anytime",
    details: "info@sdabyhomelander.com.au",
    availability: "Response within 4 hours",
    action: "Email Us",
    color: "secondary"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Instant support from our team",
    details: "Available on website",
    availability: "Mon-Fri 8am-6pm AEST",
    action: "Start Chat",
    color: "accent"
  },
  {
    icon: Calendar,
    title: "Book Consultation",
    description: "Free 30-minute assessment",
    details: "Video or phone call",
    availability: "Flexible scheduling",
    action: "Book Now",
    color: "success"
  }
];

const officeLocations = [
  {
    city: "Brisbane",
    state: "QLD", 
    address: "Level 12, 120 Edward Street, Brisbane QLD 4000",
    phone: "(07) 3123 4567",
    services: ["Property Development", "NDIS Planning", "Consultations"]
  },
  {
    city: "Melbourne",
    state: "VIC",
    address: "Suite 8, 180 Collins Street, Melbourne VIC 3000", 
    phone: "(03) 9876 5432",
    services: ["Property Management", "Client Support", "Assessments"]
  },
  {
    city: "Sydney",
    state: "NSW",
    address: "Level 15, 100 George Street, Sydney NSW 2000",
    phone: "(02) 8765 4321",
    services: ["Regional Coordination", "Specialist Services", "Training"]
  },
  {
    city: "Perth",
    state: "WA",
    address: "Level 6, 88 St Georges Terrace, Perth WA 6000",
    phone: "(08) 6543 2109",
    services: ["Western Operations", "Property Development", "Support"]
  }
];

const contactStructuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Homelander SDA Solutions",
  "description": "Get in touch with Australia's trusted SDA provider for homeownership pathways",
  "mainEntity": {
    "@type": "Organization",
    "name": "Homelander SDA Solutions",
    "telephone": "+61-1800-732-4357",
    "email": "info@sdabyhomelander.com.au",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+61-1800-732-4357",
        "contactType": "customer service",
        "availableLanguage": "English",
        "hoursAvailable": "24/7"
      }
    ]
  }
};

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    inquiryType: '',
    contactMethod: '',
    message: '',
    privacy: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Route through Nucleus Backend (Edge Functions)
      const result = await routeLead({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        category: 'general',
        source: 'contact-form',
        metadata: {
          inquiryType: formData.inquiryType || "General Inquiry",
          contactMethod: formData.contactMethod,
          privacyConsent: formData.privacy,
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 4 hours during business hours.",
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        inquiryType: '',
        contactMethod: '',
        message: '',
        privacy: false
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error Sending Message",
        description: "Please try again or call us directly at 1800 732 4357.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={contactStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto fade-in">
              <Badge variant="outline" className="mb-4">
                Get in Touch
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                We're Here to{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Help & Support
                </span>{" "}
                You
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Our dedicated team of SDA specialists is ready to answer your questions, 
                provide guidance, and help you start your homeownership journey. 
                Contact us using your preferred method below.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <Card key={index} className={`card-elegant group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-${method.color}/10 to-${method.color}/5 border-${method.color}/20`}>
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 bg-${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className={`h-6 w-6 text-${method.color}-foreground`} />
                      </div>
                      <h3 className={`font-bold mb-2 group-hover:text-${method.color} transition-colors`}>
                        {method.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {method.description}
                      </p>
                      <div className="text-sm font-medium mb-2">
                        {method.details}
                      </div>
                      <div className="text-xs text-muted-foreground mb-4">
                        {method.availability}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`w-full group-hover:border-${method.color} group-hover:text-${method.color} transition-colors`}
                        onClick={() => {
                          if (method.title === "Phone Support") window.open('tel:1800732435', '_self');
                          else if (method.title === "Email Support") window.open('mailto:info@sdabyhomelander.com.au', '_self');
                          else if (method.title === "Live Chat") window.location.href = '/contact';
                          else if (method.title === "Book Consultation") window.location.href = '/consultation';
                        }}
                      >
                        {method.action}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Form & Quick Info */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="card-elegant">
                  <CardHeader>
                    <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                    <p className="text-muted-foreground">
                      Fill out the form below and we'll get back to you within 4 hours during business hours.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={submitForm} className="space-y-6">

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">First Name *</label>
                          <Input 
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onChange={(e) => updateField('firstName', e.target.value)}
                            disabled={isSubmitting}
                            required
                            autoComplete="given-name"
                            name="firstName"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Last Name *</label>
                          <Input 
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={(e) => updateField('lastName', e.target.value)}
                            disabled={isSubmitting}
                            required
                            autoComplete="family-name"
                            name="lastName"
                          />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Email *</label>
                          <Input 
                            type="email" 
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            disabled={isSubmitting}
                            required
                            autoComplete="email"
                            name="email"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Phone</label>
                          <Input 
                            type="tel" 
                            placeholder="Your phone number"
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            disabled={isSubmitting}
                            autoComplete="tel"
                            name="phone"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Inquiry Type *</label>
                          <Select 
                            onValueChange={(value) => updateField('inquiryType', value)}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Information</SelectItem>
                              <SelectItem value="pathways">Ownership Pathways</SelectItem>
                              <SelectItem value="eligibility">Eligibility Assessment</SelectItem>
                              <SelectItem value="properties">Available Properties</SelectItem>
                              <SelectItem value="consultation">Book Consultation</SelectItem>
                              <SelectItem value="support">Existing Client Support</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Preferred Contact Method</label>
                          <Select 
                            onValueChange={(value) => updateField('contactMethod', value)}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="How should we contact you?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone Call</SelectItem>
                              <SelectItem value="sms">SMS/Text</SelectItem>
                              <SelectItem value="any">Any Method</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Message *</label>
                        <Textarea 
                          placeholder="Please provide details about your inquiry, current situation, or any questions you have about our SDA homeownership pathways..."
                          rows={6}
                          value={formData.message}
                          onChange={(e) => updateField('message', e.target.value)}
                          disabled={isSubmitting}
                          required
                        />
                      </div>

                      <div className="flex items-start space-x-2">
                        <input 
                          type="checkbox" 
                          id="privacy" 
                          className="mt-1"
                          checked={formData.privacy}
                          onChange={(e) => updateField('privacy', e.target.checked)}
                          disabled={isSubmitting}
                          required
                        />
                        <label htmlFor="privacy" className="text-sm text-muted-foreground">
                          I agree to the <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and 
                          consent to being contacted about SDA services. *
                        </label>
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full btn-bounce" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Contact Info */}
              <div className="space-y-6">
                {/* Emergency Contact */}
                <Card className="card-elegant bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Phone className="h-6 w-6 text-primary" />
                      <h3 className="font-bold">24/7 Emergency Support</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      For urgent matters outside business hours
                    </p>
                    <Button className="w-full" onClick={() => window.open('tel:1800732435', '_self')}>
                      Call Emergency Line
                    </Button>
                  </CardContent>
                </Card>

                {/* Business Hours */}
                <Card className="card-elegant">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Clock className="h-6 w-6 text-secondary" />
                      <h3 className="font-bold">Business Hours</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>8:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span>9:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span>Emergency Only</span>
                      </div>
                      <div className="pt-2 border-t border-border/60">
                        <span className="font-medium">All times AEST</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="card-elegant">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/eligibility'}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Check SDA Eligibility
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/consultation'}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Free Consultation
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/properties'}>
                        <MapPin className="mr-2 h-4 w-4" />
                        Find Properties Near Me
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Office Locations */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-3xl font-bold mb-6">Our Office Locations</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We have offices across Australia to provide local support and expertise in your area.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {officeLocations.map((office, index) => (
                <Card key={index} className="card-elegant group hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold group-hover:text-primary transition-colors">
                          {office.city}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {office.state}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-4">
                      {office.address}
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{office.phone}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-medium">Services:</div>
                      <div className="flex flex-wrap gap-1">
                        {office.services.map((service, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;