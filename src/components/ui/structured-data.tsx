import { useEffect } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

const StructuredData = ({ data }: StructuredDataProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  return null;
};

// SEO structured data for SDA services
export const sdaStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Homelander SDA Solutions",
  "url": "https://sdabyhomelander.com.au",
  "logo": "/lovable-uploads/f4abb637-a33c-4cd3-8ee6-caa468f410d0.png",
  "description": "Australia's trusted SDA provider offering flexible homeownership pathways for NDIS participants including deposit ready, rent-to-buy, and equity share options.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "AU"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+61-1800-732-4357",
    "contactType": "customer service",
    "availableLanguage": "English",
    "hoursAvailable": "24/7"
  },
  "serviceType": "Specialist Disability Accommodation",
  "areaServed": {
    "@type": "Country",
    "name": "Australia"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "SDA Homeownership Pathways",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Deposit Ready Ownership",
          "description": "Full homeownership from day one with no equity partners"
        }
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "Rent-to-Buy Program",
          "description": "Move in now and save your deposit over 5-7 years"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "Equity Share Ownership",
          "description": "Own up to 80% now with equity partner holding remainder"
        }
      }
    ]
  }
};

export default StructuredData;