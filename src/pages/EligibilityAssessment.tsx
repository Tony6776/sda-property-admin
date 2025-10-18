import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle, Users, Home, DollarSign } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";
import { processEligibilityAssessment } from "@/lib/edgeFunctions";

const assessmentStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "SDA Eligibility Assessment",
  "description": "Free online assessment to determine your eligibility for SDA funding and homeownership pathways"
};

interface FormData {
  hasNDISPlan: string;
  hasSDAfunding: string;
  currentHousing: string;
  supportNeeds: string;
  ageGroup: string;
  location: string;
  householdIncome: string;
  preferredPathway: string;
  timeframe: string;
  additionalInfo: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

const EligibilityAssessment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    hasNDISPlan: "",
    hasSDAfunding: "",
    currentHousing: "",
    supportNeeds: "",
    ageGroup: "",
    location: "",
    householdIncome: "",
    preferredPathway: "",
    timeframe: "",
    additionalInfo: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  });
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Calculate eligibility
      const eligibility = getEligibilityStatus();
      const score = calculateEligibility();

      // Route through Nucleus Backend (Edge Functions)
      const result = await processEligibilityAssessment({
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        hasNDISPlan: formData.hasNDISPlan,
        hasSDAfunding: formData.hasSDAfunding,
        currentHousing: formData.currentHousing,
        supportNeeds: formData.supportNeeds,
        ageGroup: formData.ageGroup,
        location: formData.location,
        householdIncome: formData.householdIncome,
        preferredPathway: formData.preferredPathway,
        timeframe: formData.timeframe,
        additionalInfo: formData.additionalInfo,
        eligibilityScore: score,
        eligibilityStatus: eligibility.status,
      });

      if (!result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      setShowResults(true);
      toast({
        title: "Assessment Complete!",
        description: score >= 70
          ? "Your results are ready. We're also matching you with suitable properties!"
          : "Your results are ready. We'll be in touch soon.",
      });
    } catch (error) {
      console.error('Assessment submission error:', error);
      toast({
        title: "Assessment Complete",
        description: "Your results are ready. Backend processing may be delayed.",
        variant: "destructive",
      });
      // Still show results even if backend fails
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEligibility = () => {
    let score = 0;
    if (formData.hasNDISPlan === "yes") score += 30;
    if (formData.hasSDAfunding === "yes") score += 40;
    if (formData.supportNeeds === "high") score += 20;
    if (formData.currentHousing === "unsuitable") score += 10;
    return score;
  };

  const getEligibilityStatus = () => {
    const score = calculateEligibility();
    if (score >= 70) return { status: "Highly Eligible", color: "success", description: "You meet all key criteria for SDA homeownership" };
    if (score >= 40) return { status: "Likely Eligible", color: "primary", description: "You meet most criteria - let's discuss your options" };
    return { status: "Needs Assessment", color: "secondary", description: "We recommend a consultation to explore your options" };
  };

  if (showResults) {
    const eligibility = getEligibilityStatus();
    return (
      <div className="min-h-screen bg-background">
        <StructuredData data={assessmentStructuredData} />
        <AccessibilitySkipLink />
        <Header />
        
        <main id="main-content" role="main">
          <section className="py-20 hero-gradient">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <Badge variant="outline" className="mb-4">Assessment Complete</Badge>
                  <h1 className="text-4xl font-bold mb-6">Your SDA Eligibility Results</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Results */}
                  <div className="lg:col-span-2">
                    <Card className="card-elegant mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-3">
                          <CheckCircle className={`h-6 w-6 text-${eligibility.color}`} />
                          <span>Eligibility Status: {eligibility.status}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg text-muted-foreground mb-6">
                          {eligibility.description}
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                            <div className="font-semibold">NDIS Plan</div>
                            <div className="text-sm text-muted-foreground">
                              {formData.hasNDISPlan === "yes" ? "✓ Confirmed" : "Needs Review"}
                            </div>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <Home className="h-8 w-8 text-secondary mx-auto mb-2" />
                            <div className="font-semibold">SDA Funding</div>
                            <div className="text-sm text-muted-foreground">
                              {formData.hasSDAfunding === "yes" ? "✓ Approved" : "Needs Assessment"}
                            </div>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <DollarSign className="h-8 w-8 text-accent mx-auto mb-2" />
                            <div className="font-semibold">Pathway Match</div>
                            <div className="text-sm text-muted-foreground">
                              {formData.preferredPathway || "To be determined"}
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-6">
                          <h3 className="font-semibold mb-4">Recommended Next Steps:</h3>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">1</div>
                              <p className="text-sm">Book a free consultation with our SDA specialist</p>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-xs font-bold">2</div>
                              <p className="text-sm">Review detailed pathway options that match your needs</p>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-xs font-bold">3</div>
                              <p className="text-sm">Start your application process with dedicated support</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Next Steps */}
                  <div className="space-y-6">
                    <Card className="card-elegant">
                      <CardContent className="p-6">
                        <h3 className="font-bold mb-4">Ready to Get Started?</h3>
                        <div className="space-y-3">
                          <Button 
                            className="w-full btn-bounce"
                            onClick={() => window.location.href = '/consultation'}
                          >
                            Book Free Consultation
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.location.href = '/pathways'}
                          >
                            Explore Pathways
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.location.href = '/calculator'}
                          >
                            Calculate Options
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-elegant bg-primary/5">
                      <CardContent className="p-6">
                        <h3 className="font-bold mb-2">Need Help Now?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Speak directly with our SDA specialists
                        </p>
                        <a 
                          href="tel:1800732435"
                          className="block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-hover transition-colors font-medium"
                        >
                          Call 1800 SDA HELP
                        </a>
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
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium mb-4 block">Do you currently have an NDIS plan?</Label>
              <RadioGroup 
                value={formData.hasNDISPlan} 
                onValueChange={(value) => updateFormData('hasNDISPlan', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="yes" id="ndis-yes" />
                  <Label htmlFor="ndis-yes">Yes, I have an active NDIS plan</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="no" id="ndis-no" />
                  <Label htmlFor="ndis-no">No, but I'm applying for one</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="unsure" id="ndis-unsure" />
                  <Label htmlFor="ndis-unsure">I'm not sure</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-lg font-medium mb-4 block">Do you have SDA funding in your NDIS plan?</Label>
              <RadioGroup 
                value={formData.hasSDAfunding} 
                onValueChange={(value) => updateFormData('hasSDAfunding', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="yes" id="sda-yes" />
                  <Label htmlFor="sda-yes">Yes, SDA funding is approved</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="no" id="sda-no" />
                  <Label htmlFor="sda-no">No, but I need accessible housing</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="unsure" id="sda-unsure" />
                  <Label htmlFor="sda-unsure">I need help understanding SDA</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium mb-4 block">What is your current housing situation?</Label>
              <RadioGroup 
                value={formData.currentHousing} 
                onValueChange={(value) => updateFormData('currentHousing', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="family" id="housing-family" />
                  <Label htmlFor="housing-family">Living with family/friends</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="rental" id="housing-rental" />
                  <Label htmlFor="housing-rental">Private rental</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="sda" id="housing-sda" />
                  <Label htmlFor="housing-sda">Current SDA accommodation</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="unsuitable" id="housing-unsuitable" />
                  <Label htmlFor="housing-unsuitable">Unsuitable/inaccessible housing</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-lg font-medium mb-4 block">What level of support do you need?</Label>
              <RadioGroup 
                value={formData.supportNeeds} 
                onValueChange={(value) => updateFormData('supportNeeds', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="high" id="support-high" />
                  <Label htmlFor="support-high">High support needs (24/7 care)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="moderate" id="support-moderate" />
                  <Label htmlFor="support-moderate">Moderate support needs (daily assistance)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="low" id="support-low" />
                  <Label htmlFor="support-low">Low support needs (occasional assistance)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="independent" id="support-independent" />
                  <Label htmlFor="support-independent">Independent living with accessibility needs</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-lg font-medium mb-4 block">Your age group</Label>
                <RadioGroup 
                  value={formData.ageGroup} 
                  onValueChange={(value) => updateFormData('ageGroup', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="18-25" id="age-18-25" />
                    <Label htmlFor="age-18-25">18-25 years</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="26-40" id="age-26-40" />
                    <Label htmlFor="age-26-40">26-40 years</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="41-55" id="age-41-55" />
                    <Label htmlFor="age-41-55">41-55 years</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="55+" id="age-55+" />
                    <Label htmlFor="age-55+">55+ years</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="location" className="text-lg font-medium mb-4 block">Preferred location</Label>
                <Input
                  id="location"
                  placeholder="City or region"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-lg font-medium mb-4 block">Household income (optional)</Label>
              <RadioGroup 
                value={formData.householdIncome} 
                onValueChange={(value) => updateFormData('householdIncome', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="low" id="income-low" />
                  <Label htmlFor="income-low">Under $50,000 per year</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="medium" id="income-medium" />
                  <Label htmlFor="income-medium">$50,000 - $100,000 per year</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="high" id="income-high" />
                  <Label htmlFor="income-high">Over $100,000 per year</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="prefer-not-to-say" id="income-prefer-not-to-say" />
                  <Label htmlFor="income-prefer-not-to-say">Prefer not to say</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-lg font-medium mb-4 block">Preferred pathway</Label>
                <RadioGroup 
                  value={formData.preferredPathway} 
                  onValueChange={(value) => updateFormData('preferredPathway', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deposit-ready" id="pathway-deposit" />
                    <Label htmlFor="pathway-deposit">Deposit Ready Ownership</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rent-to-buy" id="pathway-rent" />
                    <Label htmlFor="pathway-rent">Rent-to-Buy Program</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="equity-share" id="pathway-equity" />
                    <Label htmlFor="pathway-equity">Equity Share Ownership</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unsure" id="pathway-unsure" />
                    <Label htmlFor="pathway-unsure">I need guidance</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-lg font-medium mb-4 block">Timeline</Label>
                <RadioGroup 
                  value={formData.timeframe} 
                  onValueChange={(value) => updateFormData('timeframe', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="time-immediate" />
                    <Label htmlFor="time-immediate">Immediately (0-6 months)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short" id="time-short" />
                    <Label htmlFor="time-short">Short term (6-18 months)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="time-medium" />
                    <Label htmlFor="time-medium">Medium term (1-3 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="long" id="time-long" />
                    <Label htmlFor="time-long">Long term (3+ years)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div>
              <Label htmlFor="additional-info" className="text-lg font-medium mb-4 block">Additional information</Label>
              <Textarea
                id="additional-info"
                placeholder="Tell us about any specific needs, questions, or circumstances..."
                value={formData.additionalInfo}
                onChange={(e) => updateFormData('additionalInfo', e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contact-name" className="font-medium mb-2 block">Name *</Label>
                <Input
                  id="contact-name"
                  placeholder="Your name"
                  value={formData.contactName}
                  onChange={(e) => updateFormData('contactName', e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="name"
                  name="contactName"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-email" className="font-medium mb-2 block">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => updateFormData('contactEmail', e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                  name="contactEmail"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-phone" className="font-medium mb-2 block">Phone</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.contactPhone}
                  onChange={(e) => updateFormData('contactPhone', e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="tel"
                  name="contactPhone"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={assessmentStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4">Free Assessment</Badge>
                <h1 className="text-4xl font-bold mb-6">
                  SDA Eligibility Assessment
                </h1>
                <p className="text-xl text-muted-foreground">
                  Complete this free assessment to determine your eligibility for SDA homeownership pathways
                </p>
              </div>

              <Card className="card-elegant">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle>Step {currentStep} of {totalSteps}</CardTitle>
                    <Badge variant="outline">{Math.round(progressPercentage)}% Complete</Badge>
                  </div>
                  <Progress value={progressPercentage} className="w-full" />
                </CardHeader>
                
                <CardContent className="space-y-8">
                  {renderStep()}
                  
                  <div className="flex justify-between pt-6">
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </Button>
                    
                    <Button 
                      onClick={nextStep}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 btn-bounce"
                    >
                      <span>
                        {isSubmitting ? "Processing..." : 
                         currentStep === totalSteps ? "Complete Assessment" : "Next Step"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
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

export default EligibilityAssessment;