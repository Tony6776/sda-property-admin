import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Award, Users, Heart, Target, Lightbulb, ArrowRight, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";
import teamSupport from "@/assets/team-support.jpg";
const values = [{
  icon: Heart,
  title: "Person-Centered Care",
  description: "Every decision we make puts the participant's needs, preferences, and dreams at the center."
}, {
  icon: Shield,
  title: "Trust & Transparency",
  description: "We operate with complete transparency, ensuring participants understand every aspect of their journey."
}, {
  icon: Target,
  title: "Excellence in Accessibility",
  description: "We set the highest standards for accessibility, going beyond compliance to create truly inclusive homes."
}, {
  icon: Lightbulb,
  title: "Innovation & Growth",
  description: "We continuously innovate to find better ways to make homeownership accessible and achievable."
}];
const milestones = [{
  year: "1993",
  title: "Company Founded",
  description: "Started with a vision to create better housing options for people with disabilities."
}, {
  year: "2023",
  title: "NDIS Registration",
  description: "Became one of the first registered SDA providers when the NDIS launched."
}, {
  year: "2024",
  title: "National Expansion",
  description: "Expanded services to cover all states and territories across Australia."
}, {
  year: "2024",
  title: "SDA POP Launched",
  description: "Properties delivered nationally where SDA properties were previously unavailable."
}, {
  year: "2025",
  title: "Participant Ownership Program - Innovation Leader",
  description: "Recognized as Australia's leading innovator in accessible homeownership pathways."
}];
const team = [{
  name: "Tony Tadros",
  role: "Managing Director",
  experience: "30+ years in property & disability services",
  description: "Passionate advocate for disability rights with extensive experience in accessible housing development."
}, {
  name: "Abanoub Mielad",
  role: "Head of SDA Sales",
  experience: "15+ years Sales & Management Expertise",
  description: "Sales and management professional specializing in SDA property solutions and client relationship management."
}, {
  name: "Michael T",
  role: "SDA Property Management Specialist",
  experience: "2+ years SDA Property Management",
  description: "Expert SDA planner helping participants navigate funding and plan management."
}, {
  name: "David Thompson",
  role: "Property Development",
  experience: "20+ years construction",
  description: "Construction industry veteran specializing in accessible and universal design builds."
}];
const aboutStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Homelander SDA Solutions",
  "description": "Australia's trusted SDA provider with 30+ years experience in accessible homeownership pathways for NDIS participants",
  "foundingDate": "1993",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "AU"
  },
  "employee": team.map(person => ({
    "@type": "Person",
    "name": person.name,
    "jobTitle": person.role,
    "description": person.description
  })),
  "award": ["NDIS Registered Provider", "30+ Years Experience Award", "National Service Excellence", "Innovation in Accessibility"]
};
const About = () => {
  return <div className="min-h-screen bg-background">
      <StructuredData data={aboutStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto fade-in">
              <Badge variant="outline" className="mb-4">
                Our Story
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                30+ Years of Making{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Homeownership Accessible
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Since 1993, we've been committed to one fundamental belief: that true independence comes through 
                homeownership. Drawing on three decades of comprehensive property industry expertise—from real estate 
                agency practice and registered building to financial planning and development—we've created a complete 
                ecosystem designed specifically for SDA-funded participants. Our integrated network of NDIS property 
                valuers, loan specialists, assessors, and architects work together to transform the dream of owning 
                your own accessible home into reality, providing the security and independence that comes with having 
                a place that's truly yours for life.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <div className="fade-in">
                <h2 className="text-3xl font-bold mb-6">
                  Founded on the Belief That{" "}
                  <span className="text-primary">Everyone Deserves a Home</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-6">Homelander SDA Solutions was founded in 2023 to address a gap we identified: the lack of a clear pathway for SDA Participants and their families to achieve homeownership. Too often, where participants want to live, there are no suitable SDA properties available. Our SDA POP program was created to change that—delivering property security, longevity, dignity, and privacy through an innovative ownership pathway that has been warmly received by participants and their families.</p>
                <p className="text-lg text-muted-foreground mb-6">To make this possible, we've assembled a hand-picked panel of best-in-class SDA property professionals. Together, we provide a seamless, end-to-end solution covering every touchpoint of the journey—from the first idea to handing over the keys to your own SDA home. Our mission is simple yet powerful: to create lasting housing solutions that respect choice, independence, and quality of life.</p>
                <p className="text-muted-foreground mb-6">
                  Since launching, we've grown from an idea into a national leader in SDA homeownership pathways—but our core purpose has never changed. We believe that creating a pathway to ownership gives participants and their families more than just housing; it delivers security, dignity, independence, and a place they can truly call home.
                </p>
                <p className="text-muted-foreground mb-8">In 2024, we created the SDA Participant Ownership Program (SDA POP) and have since supported dozens of SDA-funded participants and their families on the journey to homeownership. Through this program, we have delivered SDA apartments, villas, and homes across Australia—specifically in areas where no suitable SDA properties previously existed—giving participants real choice, security, and independence.</p>

                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">30+</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary">SDA POP</div>
                    <div className="text-sm text-muted-foreground">Properties Delivered Nationally</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">95%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                  </div>
                </div>

                <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/pathways'}>
                  Learn About Our Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Image */}
              <div className="fade-in">
                <div className="relative overflow-hidden rounded-2xl card-elegant">
                  <img src={teamSupport} alt="Professional consultation team meeting with diverse participants including people with disabilities" className="w-full h-[500px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-3xl font-bold mb-6">Our Core Values</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                These values guide every decision we make and every service we provide.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
              const IconComponent = value.icon;
              return <Card key={index} className="card-elegant text-center group hover:scale-105 transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>;
            })}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-3xl font-bold mb-6">Our Journey</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Key milestones in our mission to make homeownership accessible for all.
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-primary via-secondary to-accent"></div>

              <div className="space-y-12">
                {milestones.map((milestone, index) => {
                const isEven = index % 2 === 0;
                return <div key={index} className={`grid lg:grid-cols-2 gap-8 items-center ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}>
                      {/* Content */}
                      <div className={`fade-in ${!isEven ? 'lg:col-start-2 lg:text-left' : 'lg:text-right'}`}>
                        <Card className="card-elegant">
                          <CardContent className="p-6">
                            <Badge variant="default" className="mb-4">
                              {milestone.year}
                            </Badge>
                            <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                            <p className="text-muted-foreground">{milestone.description}</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Timeline Node */}
                      <div className={`hidden lg:flex justify-center ${!isEven ? 'lg:col-start-1' : ''}`}>
                        <div className="w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg"></div>
                      </div>
                    </div>;
              })}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-3xl font-bold mb-6">Meet Our Expert Team</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our diverse team combines decades of experience in disability services, 
                property development, and NDIS planning.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => <Card key={index} className="card-elegant group hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-2">{member.role}</p>
                    <Badge variant="outline" className="mb-4 text-xs">
                      {member.experience}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Certifications & Accreditations */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-3xl font-bold mb-6">Certifications & Accreditations</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We maintain the highest standards through rigorous certifications and ongoing compliance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{
              title: "NDIS Registered Provider",
              subtitle: "Registration #4050124168",
              icon: Shield
            }, {
              title: "Quality & Safeguards",
              subtitle: "Full compliance certified",
              icon: Award
            }, {
              title: "ISO Standards",
              subtitle: "Quality management systems",
              icon: CheckCircle
            }, {
              title: "Industry Recognition",
              subtitle: "Multiple awards & recognition",
              icon: Award
            }].map((cert, index) => {
              const IconComponent = cert.icon;
              return <Card key={index} className="card-elegant text-center group hover:scale-105 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-6 w-6 text-success" />
                      </div>
                      <h3 className="font-bold mb-2">{cert.title}</h3>
                      <p className="text-sm text-muted-foreground">{cert.subtitle}</p>
                    </CardContent>
                  </Card>;
            })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Start Your Homeownership Journey?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                With 30+ years of experience and hundreds of successful homeowners, 
                we're here to help you achieve your homeownership dreams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/eligibility'}>
                  Start Your Application Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = '/consultation'}>
                  Meet with Our Team
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default About;