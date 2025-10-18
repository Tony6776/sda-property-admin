import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData from "@/components/ui/structured-data";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "Frequently Asked Questions - Homelander SDA Solutions",
  "description": "Common questions and answers about SDA homeownership pathways and services",
  "mainEntity": {
    "@type": "Organization",
    "name": "Homelander SDA Solutions"
  }
};

const FAQ = () => {
  const faqSections = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "What is SDA and how does it work?",
          answer: "Specialist Disability Accommodation (SDA) is housing designed with features to assist people with extreme functional impairment or very high support needs. SDA funding is provided through your NDIS plan to help cover the cost of these specialized housing features."
        },
        {
          question: "Am I eligible for SDA homeownership?",
          answer: "To be eligible, you must have SDA funding in your NDIS plan, be able to meet ongoing costs like rates and maintenance, and have the capacity to manage homeownership responsibilities. We offer free eligibility assessments to determine your suitability."
        },
        {
          question: "How much deposit do I need?",
          answer: "Deposit requirements vary by pathway. Our Deposit Ready option typically requires 10-20% deposit, while our Rent-to-Buy and Equity Share programs may require minimal or no deposit upfront."
        },
        {
          question: "What are the ongoing costs?",
          answer: "Ongoing costs include council rates, insurance, maintenance, utilities, and loan repayments. Your SDA funding helps cover the specialized accommodation features, but you're responsible for standard homeownership costs."
        }
      ]
    },
    {
      category: "Our Services",
      questions: [
        {
          question: "What homeownership pathways do you offer?",
          answer: "We offer three main pathways: Deposit Ready Ownership (traditional purchase with SDA features), Rent-to-Buy Program (gradual ownership transition), and Equity Share Ownership (shared ownership with gradual buyout options)."
        },
        {
          question: "Do you help with NDIS applications?",
          answer: "Yes, we provide comprehensive support including NDIS plan reviews, SDA funding applications, and coordination with NDIS planners to ensure your housing goals are included in your plan."
        },
        {
          question: "What types of properties do you have?",
          answer: "We offer Improved Liveability, Robust, Fully Accessible, and High Physical Support properties across Australia, including apartments, villas, and houses designed to meet different accessibility needs."
        },
        {
          question: "Is there ongoing support after purchase?",
          answer: "As your SDA Provider, we don't just hand over the keys—we stay with you. Once you move in, we manage the property and provide ongoing support to ensure a smooth transition into your new home. From coordinating maintenance and handling day-to-day property management, to assisting with NDIS plan reviews and resolving any issues that arise, our team is here to make homeownership simple, stable, and worry-free."
        }
      ]
    },
    {
      category: "Financial Information",
      questions: [
        {
          question: "What interest rates do you offer?",
          answer: "Our current interest rates start from 7.2% for qualified applicants. Rates may vary based on your financial situation, deposit amount, and chosen homeownership pathway."
        },
        {
          question: "Can I use my SDA funding as a deposit?",
          answer: "SDA funding is for ongoing accommodation costs, not property purchase. However, we can help structure your finance to maximize the benefit of your SDA funding in covering specialized accommodation features."
        },
        {
          question: "Are there any fees for your services?",
          answer: "Initial consultations and eligibility assessments are completely free. Service fees only apply once you proceed with a purchase and are clearly disclosed upfront. No hidden costs."
        },
        {
          question: "What if my NDIS plan changes?",
          answer: "We help you navigate plan changes and work with you to ensure your housing remains sustainable. Our ongoing support includes assistance with plan reviews and adjustments."
        }
      ]
    },
    {
      category: "Property Features",
      questions: [
        {
          question: "What makes a property SDA-compliant?",
          answer: "SDA properties include features like wider doorways, accessible bathrooms, ramps, emergency systems, and other modifications based on the SDA design category (Improved Liveability, Robust, Fully Accessible, or High Physical Support)."
        },
        {
          question: "Can I modify the property after purchase?",
          answer: "Yes, as the owner you can make modifications. We can also help you understand what modifications might be funded through NDIS supports and connect you with accessible building specialists."
        },
        {
          question: "Are pets allowed in SDA properties?",
          answer: "Pet policies vary by property and location. Many of our properties are pet-friendly, and we'll help you find suitable accommodation that meets both your accessibility needs and lifestyle preferences."
        },
        {
          question: "What about location and transport?",
          answer: "We carefully consider location factors including public transport access, proximity to support services, shopping centers, and medical facilities. Location is a key factor in our property matching process."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={faqStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto fade-in">
              <Badge variant="outline" className="mb-4">
                Frequently Asked Questions
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Got{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Questions?
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Find answers to the most common questions about SDA homeownership, 
                our services, and the process of buying an accessible home.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
              {faqSections.map((section, sectionIndex) => (
                <Card key={sectionIndex} className="card-elegant">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <HelpCircle className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">{section.category}</h2>
                    </div>
                    
                    <Accordion type="single" collapsible className="space-y-4">
                      {section.questions.map((faq, index) => (
                        <AccordionItem key={index} value={`${sectionIndex}-${index}`} className="border border-border rounded-lg">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 rounded-lg">
                            <span className="text-left font-medium">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Can't find what you're looking for? Our team is here to help with any questions 
                about SDA homeownership and our services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-bounce" onClick={() => window.location.href = '/contact'}>
                  Contact Our Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.location.href = '/consultation'}>
                  Book Free Consultation
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;