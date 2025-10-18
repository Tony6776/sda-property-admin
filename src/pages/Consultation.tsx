import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Phone, MapPin, CheckCircle, ArrowRight, User, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";
import { routeLead } from "@/lib/edgeFunctions";

const consultationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Free SDA Consultation Booking",
  "description": "Book a free 30-minute consultation with our SDA specialists to discuss your homeownership options"
};

interface ConsultationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  consultationType: string;
  currentSituation: string;
  hasNDISPlan: string;
  hasSDAfunding: string;
  location: string;
  urgency: string;
  specificQuestions: string;
}

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
];

const Consultation = () => {
  const [formData, setFormData] = useState<ConsultationForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    consultationType: "",
    currentSituation: "",
    hasNDISPlan: "",
    hasSDAfunding: "",
    location: "",
    urgency: "",
    specificQuestions: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: keyof ConsultationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('=== FORM SUBMIT BUTTON CLICKED ===');
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Route through Nucleus Backend (Edge Functions)
      const result = await routeLead({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        category: 'participant',
        source: 'consultation-booking',
        metadata: {
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          consultationType: formData.consultationType,
          currentSituation: formData.currentSituation,
          hasNDISPlan: formData.hasNDISPlan,
          hasSDAfunding: formData.hasSDAfunding,
          location: formData.location,
          urgency: formData.urgency,
          specificQuestions: formData.specificQuestions,
          ndisCategory: formData.hasSDAfunding === "yes" ? "SDA Approved" : "Consultation Request",
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      toast({
        title: "Consultation Booked Successfully!",
        description: "We've sent a confirmation email with all the details.",
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error Booking Consultation",
        description: "Please try again or call us directly at 1800 732 4357.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <StructuredData data={consultationStructuredData} />
        <AccessibilitySkipLink />
        <Header />
        
        <main id="main-content" role="main">
          <section className="py-20 hero-gradient">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-2xl mx-auto text-center">
                <Card className="card-elegant">
                  <CardContent className="p-12">
                    <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-8 w-8 text-success-foreground" />
                    </div>
                    
                    <h1 className="text-3xl font-bold mb-4">
                      Consultation Booked Successfully!
                    </h1>
                    
                    <p className="text-lg text-muted-foreground mb-8">
                      Thank you for booking your free SDA consultation. We've sent a confirmation 
                      email with all the details including the meeting link and preparation materials.
                    </p>

                    <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
                      <h3 className="font-semibold mb-4">What happens next:</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">1</div>
                          <p className="text-sm">You'll receive a confirmation email within 5 minutes</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-xs font-bold">2</div>
                          <p className="text-sm">Our specialist will review your information beforehand</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-xs font-bold">3</div>
                          <p className="text-sm">We'll call you at your preferred time for the consultation</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Date & Time</h4>
                        <p className="text-sm text-muted-foreground">
                          {formData.preferredDate} at {formData.preferredTime}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Consultation Type</h4>
                        <p className="text-sm text-muted-foreground">
                          {formData.consultationType === "video" ? "Video Call" : 
                           formData.consultationType === "phone" ? "Phone Call" : "In-Person Meeting"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button 
                        size="lg" 
                        onClick={() => window.location.href = '/'}
                        className="w-full btn-bounce"
                      >
                        Return to Homepage
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => window.location.href = '/eligibility'}
                        >
                          Take Eligibility Assessment
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => window.location.href = '/calculator'}
                        >
                          Use Calculator
                        </Button>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm font-medium">
                        Need to reschedule or have questions?
                      </p>
                      <a 
                        href="tel:1800732435" 
                        className="text-primary font-bold hover:underline"
                      >
                        Call 1800 SDA HELP
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
  }

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={consultationStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  Free Consultation
                </Badge>
                <h1 className="text-4xl font-bold mb-6">
                  Book Your Free SDA Consultation
                </h1>
                <p className="text-xl text-muted-foreground">
                  30-minute consultation with our SDA specialists to discuss your homeownership options
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Consultation Benefits */}
                <div className="space-y-6">
                  <Card className="card-elegant">
                    <CardHeader>
                      <CardTitle className="text-lg">What You'll Get</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                        <div>
                          <div className="font-medium">Eligibility Assessment</div>
                          <div className="text-sm text-muted-foreground">Review your NDIS plan and SDA funding</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                        <div>
                          <div className="font-medium">Pathway Recommendations</div>
                          <div className="text-sm text-muted-foreground">Personalized options based on your situation</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                        <div>
                          <div className="font-medium">Next Steps Plan</div>
                          <div className="text-sm text-muted-foreground">Clear action plan to move forward</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                        <div>
                          <div className="font-medium">Resources & Support</div>
                          <div className="text-sm text-muted-foreground">Access to tools and ongoing guidance</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-elegant bg-primary/5">
                    <CardContent className="p-6">
                      <h3 className="font-bold mb-2 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-primary" />
                        Available Times
                      </h3>
                      <div className="text-sm space-y-1">
                        <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM</p>
                        <p><strong>Saturday:</strong> 9:00 AM - 4:00 PM</p>
                        <p><strong>Emergency:</strong> 24/7 support available</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Booking Form */}
                <div className="lg:col-span-2">
                  <Card className="card-elegant">
                    <CardHeader>
                      <CardTitle>Book Your Consultation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Details */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="first-name">First Name *</Label>
                            <Input
                              id="first-name"
                              required
                              value={formData.firstName}
                              onChange={(e) => updateFormData('firstName', e.target.value)}
                              placeholder="Enter your first name"
                              disabled={isSubmitting}
                              autoComplete="given-name"
                              name="firstName"
                            />
                          </div>
                          <div>
                            <Label htmlFor="last-name">Last Name *</Label>
                            <Input
                              id="last-name"
                              required
                              value={formData.lastName}
                              onChange={(e) => updateFormData('lastName', e.target.value)}
                              placeholder="Enter your last name"
                              disabled={isSubmitting}
                              autoComplete="family-name"
                              name="lastName"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => updateFormData('email', e.target.value)}
                              placeholder="your.email@example.com"
                              disabled={isSubmitting}
                              autoComplete="email"
                              name="email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={(e) => updateFormData('phone', e.target.value)}
                              placeholder="Your phone number"
                              disabled={isSubmitting}
                              autoComplete="tel"
                              name="phone"
                            />
                          </div>
                        </div>

                        {/* Consultation Preferences */}
                        <div>
                          <Label className="text-base font-medium mb-3 block">Consultation Type *</Label>
                          <RadioGroup 
                            value={formData.consultationType} 
                            onValueChange={(value) => updateFormData('consultationType', value)}
                            className="grid md:grid-cols-3 gap-4"
                          >
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                              <RadioGroupItem value="video" id="type-video" />
                              <Label htmlFor="type-video" className="flex items-center space-x-2">
                                <Video className="h-4 w-4" />
                                <span>Video Call</span>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                              <RadioGroupItem value="phone" id="type-phone" />
                              <Label htmlFor="type-phone" className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>Phone Call</span>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                              <RadioGroupItem value="in-person" id="type-person" />
                              <Label htmlFor="type-person" className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>In-Person</span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="preferred-date">Preferred Date *</Label>
                            <Input
                              id="preferred-date"
                              type="date"
                              required
                              value={formData.preferredDate}
                              onChange={(e) => updateFormData('preferredDate', e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <Label htmlFor="preferred-time">Preferred Time *</Label>
                            <Select onValueChange={(value) => updateFormData('preferredTime', value)} disabled={isSubmitting}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Background Information */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="current-situation">Current Housing Situation</Label>
                            <Select onValueChange={(value) => updateFormData('currentSituation', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your current situation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="family">Living with family/friends</SelectItem>
                                <SelectItem value="rental">Private rental</SelectItem>
                                <SelectItem value="sda">Current SDA accommodation</SelectItem>
                                <SelectItem value="unsuitable">Unsuitable housing</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Do you have an NDIS plan?</Label>
                              <RadioGroup 
                                value={formData.hasNDISPlan} 
                                onValueChange={(value) => updateFormData('hasNDISPlan', value)}
                                className="space-y-2 mt-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="yes" id="ndis-yes" />
                                  <Label htmlFor="ndis-yes">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="no" id="ndis-no" />
                                  <Label htmlFor="ndis-no">No, but applying</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="unsure" id="ndis-unsure" />
                                  <Label htmlFor="ndis-unsure">Not sure</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div>
                              <Label>Do you have SDA funding?</Label>
                              <RadioGroup 
                                value={formData.hasSDAfunding} 
                                onValueChange={(value) => updateFormData('hasSDAfunding', value)}
                                className="space-y-2 mt-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="yes" id="sda-yes" />
                                  <Label htmlFor="sda-yes">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="no" id="sda-no" />
                                  <Label htmlFor="sda-no">No</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="unsure" id="sda-unsure" />
                                  <Label htmlFor="sda-unsure">Not sure</Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="location">Preferred Location</Label>
                              <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => updateFormData('location', e.target.value)}
                                placeholder="City or region"
                              />
                            </div>
                            <div>
                              <Label htmlFor="urgency">Timeline</Label>
                              <Select onValueChange={(value) => updateFormData('urgency', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="When do you need housing?" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="immediate">Immediately (0-6 months)</SelectItem>
                                  <SelectItem value="short">Short term (6-18 months)</SelectItem>
                                  <SelectItem value="medium">Medium term (1-3 years)</SelectItem>
                                  <SelectItem value="long">Long term (3+ years)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="specific-questions">Specific Questions or Concerns</Label>
                            <Textarea
                              id="specific-questions"
                              value={formData.specificQuestions}
                              onChange={(e) => updateFormData('specificQuestions', e.target.value)}
                              placeholder="Tell us about any specific questions, concerns, or what you'd like to focus on during the consultation..."
                              rows={4}
                            />
                          </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full btn-bounce" disabled={isSubmitting}>
                          {isSubmitting ? 'Booking...' : 'Book My Free Consultation'}
                          <Calendar className="ml-2 h-5 w-5" />
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Consultation;