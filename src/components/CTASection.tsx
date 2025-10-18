import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Phone, Calendar, MessageCircle, CheckCircle } from "lucide-react";

const CTASection = () => {
  return (
    <section id="support" className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Main CTA */}
        <div className="text-center mb-16 fade-in">
          <Badge variant="default" className="mb-4">
            Ready to Get Started?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Take the First Step Towards{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              SDA Homeownership
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            We create custom SDA homes where you want to live. Start with our eligibility assessment 
            and discovery consultation to explore how we can build your ideal SDA home in your preferred location.
          </p>

          {/* Primary CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="btn-bounce text-lg px-12 py-6 shadow-lg" onClick={() => window.location.href = '/eligibility'}>
              Check Your SDA Eligibility Now
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-12 py-6" onClick={() => window.open('tel:1800732435', '_self')}>
              <Phone className="mr-2 h-5 w-5" />
              Call 1800 SDA HELP
            </Button>
          </div>
        </div>

        {/* Contact Options Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Quick Assessment */}
          <Card className="card-elegant bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 group hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                Quick Assessment
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                5-minute eligibility check
              </p>
              <Button variant="ghost" className="w-full text-primary hover:bg-primary/10" onClick={() => window.location.href = '/eligibility'}>
                Start Now
              </Button>
            </CardContent>
          </Card>

          {/* Book Consultation */}
          <Card className="card-elegant bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 group hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-bold mb-2 group-hover:text-secondary transition-colors">
                Book Consultation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Free 30-minute session
              </p>
              <Button variant="ghost" className="w-full text-secondary hover:bg-secondary/10" onClick={() => window.location.href = '/consultation'}>
                Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Live Chat */}
          <Card className="card-elegant bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 group hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-bold mb-2 group-hover:text-accent transition-colors">
                Live Chat
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Instant support available
              </p>
              <Button variant="ghost" className="w-full text-accent hover:bg-accent/10" onClick={() => window.location.href = '/contact'}>
                Chat Now
              </Button>
            </CardContent>
          </Card>

          {/* Phone Support */}
          <Card className="card-elegant bg-gradient-to-br from-success/10 to-success/5 border-success/20 group hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-success-foreground" />
              </div>
              <h3 className="font-bold mb-2 group-hover:text-success transition-colors">
                Phone Support
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                24/7 helpline available
              </p>
              <Button variant="ghost" className="w-full text-success hover:bg-success/10" onClick={() => window.open('tel:0400425620', '_self')}>
                Call Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Urgency & Trust Signals */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Urgency */}
          <Card className="card-elegant bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold">Don't Wait - Act Now</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Most areas lack suitable SDA homes, which is exactly why our service exists. 
                We create custom SDA homes in your desired location - start early to secure your preferred area and begin the planning process.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Limited availability in premium locations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>NDIS plan reviews affect eligibility</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Early applicants get priority choice</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guarantee */}
          <Card className="card-elegant bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
                <h3 className="text-xl font-bold">Our Commitment to You</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                We're committed to making SDA homeownership accessible, transparent, 
                and achievable. Your success is our priority.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                  <span>No upfront fees for assessment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                  <span>Full transparency in all processes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                  <span>Ongoing support throughout journey</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CTASection;