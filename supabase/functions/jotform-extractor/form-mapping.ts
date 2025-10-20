/**
 * JOTFORM FORM ID TO ENTITY TYPE MAPPING
 *
 * This file maps specific Jotform form IDs to their entity types
 * for more accurate data extraction and categorization.
 */

export const FORM_TYPE_MAPPING = {
  // Landlord Forms
  landlord: [
    '251780545796874', // SDA Landlord Leasing Authority
    '250589077972876', // SDA Landlord Enrolment Documents
  ],

  // Investor Forms
  investor: [
    '241198305921860', // NDIS Investor Acquisition Form
    '252763626973065', // PLCG Project Progress Tracking Form
    '241640192663859', // PLCG Receipt Form
  ],

  // Participant Forms
  participant: [
    '251716128939869', // SDA POP Criteria
    '251711198894063', // NDIS Support Plan Template
    '250701891888064', // Rental Application Form
  ],

  // Property/Maintenance Forms
  property: [
    '252731735674059', // Property Maintenance Request - SDA Tenants
    '242242586980059', // SDA Property Docs
    '251799273318872', // SDA Vendor Exclusive Commercial Sale Authority
    '241911534687866', // NDIS Property Inspection Registration
  ],

  // Generic Inquiry Forms (could be any type)
  inquiry: [
    '251622913612047', // Customer Enquiry Form
    '251522903941050', // Contact Inquiry Form
    '251490990277062', // Contact Inquiry Form
    '241198380734865', // ILO Property Consultation Registration
  ]
}

/**
 * Get entity type for a given form ID
 */
export function getFormEntityType(formId: string): 'landlord' | 'investor' | 'participant' | 'property' | 'inquiry' | 'unknown' {
  for (const [type, formIds] of Object.entries(FORM_TYPE_MAPPING)) {
    if (formIds.includes(formId)) {
      return type as any
    }
  }
  return 'unknown'
}

/**
 * Get form IDs for a specific entity type
 */
export function getFormIdsByType(entityType: 'landlord' | 'investor' | 'participant' | 'property' | 'inquiry'): string[] {
  return FORM_TYPE_MAPPING[entityType] || []
}

/**
 * Updated field name patterns based on actual Jotform forms
 */
export const FIELD_PATTERNS = {
  landlord: {
    name: [
      'individualOr',          // Individual or Company Representative Name
      'representative',
      'contact',
      'landlord',
      'owner',
      'name'
    ],
    email: [
      'email'
    ],
    phone: [
      'phoneNumber',
      'phone',
      'mobile',
      'contact'
    ],
    business_name: [
      'companyDetails',        // Company Details (if required)
      'company',
      'business',
      'trading'
    ],
    abn: [
      'abnacnif',             // ABN/ACN (if required)
      'abn',
      'acn',
      'tfn'
    ],
    address: [
      'addresscompany',        // Address (Company or Individual)
      'address',
      'street',
      'location'
    ]
  },

  investor: {
    name: [
      'investor',
      'contact',
      'name',
      'representative'
    ],
    email: [
      'email'
    ],
    phone: [
      'phone',
      'mobile',
      'contact'
    ],
    capital: [
      'investment',
      'capital',
      'amount',
      'budget',
      'funds'
    ],
    property_types: [
      'property',
      'type',
      'asset',
      'class'
    ],
    locations: [
      'location',
      'suburb',
      'area',
      'region',
      'state'
    ]
  },

  participant: {
    name: [
      'participant',
      'tenant',
      'applicant',
      'name',
      'firstName',
      'lastName'
    ],
    email: [
      'email'
    ],
    phone: [
      'phone',
      'mobile',
      'contact'
    ],
    ndis_number: [
      'ndis',
      'participant',
      'number',
      'id'
    ],
    support_needs: [
      'support',
      'needs',
      'requirements',
      'disability',
      'assistance'
    ]
  }
}
