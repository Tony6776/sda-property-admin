import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, UserCheck, Home, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Complete Eligibility Form",
    description: "Answer a few questions about your NDIS funding, goals, and current situation. Takes just 5 minutes.",
    details: [
      "NDIS plan assessment",
      "Financial capacity review",
      "Housing preference survey",
      "Support needs evaluation"
    ],
    color: "primary"
  },
  {
    number: "02", 
    icon: UserCheck,
    title: "Get Matched with Pathway",
    description: "Our specialists review your information and recommend the best-fit ownership pathway for your needs.",
    details: [
      "Expert pathway analysis",
      "Personalized recommendations",
      "Financial planning guidance",
      "Risk assessment review"
    ],
    color: "secondary"
  },
  {
    number: "03",
    icon: Home,
    title: "Start Your Journey",
    description: "Begin your homeownership journey with full support from our team throughout the entire process.",
    details: [
      "Property selection assistance",
      "Legal and financial support",
      "NDIS compliance guidance",
      "Ongoing relationship management"
    ],
    color: "accent"
  }
];

const ProcessSteps = () => {
  return (
    <section id="process" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in">
          <Badge variant="outline" className="mb-4">
            Simple 3-Step Process
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              SDA Journey
            </span>{" "}
            Made Simple
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We've streamlined the SDA homeownership process into three clear steps. 
            Our team guides you through each stage with expert support and clarity.
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 bg-primary rounded-full"></div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent mx-4"></div>
              <div className="w-8 h-8 bg-secondary rounded-full"></div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-secondary to-accent mx-4"></div>
              <div className="w-8 h-8 bg-accent rounded-full"></div>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const colorClasses = {
                primary: "from-primary/10 to-primary/5 border-primary/20",
                secondary: "from-secondary/10 to-secondary/5 border-secondary/20", 
                accent: "from-accent/10 to-accent/5 border-accent/20"
              };
              
              return (
                <Card key={index} className={`card-elegant bg-gradient-to-br ${colorClasses[step.color as keyof typeof colorClasses]} border group hover:scale-105 transition-all duration-300`}>
                  <CardContent className="p-8">
                    {/* Step Number & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-6xl font-bold text-muted-foreground/20">
                        {step.number}
                      </div>
                      <div className={`p-4 rounded-xl bg-${step.color}`}>
                        <IconComponent className={`h-8 w-8 text-${step.color}-foreground`} />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {step.description}
                    </p>

                    {/* Details List */}
                    <div className="space-y-3 mb-6">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <CheckCircle className={`h-4 w-4 text-${step.color} flex-shrink-0`} />
                          <span className="text-sm">{detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
                      onClick={() => {
                        if (index === 0) window.location.href = '/eligibility';
                        else if (index === 1) window.location.href = '/pathways';
                        else window.location.href = '/consultation';
                      }}
                    >
                      {index === 0 ? "Start Application" : 
                       index === 1 ? "Learn More" : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Timeline CTA */}
        <div className="text-center mt-16 fade-in">
          <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-8 card-elegant max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Ready to start your SDA homeownership journey?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of NDIS participants who have successfully achieved homeownership through our proven process. 
              Your accessible, suitable home is just three steps away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/eligibility'}>
                Complete Eligibility Form
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = '/consultation'}>
                Book Free Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;