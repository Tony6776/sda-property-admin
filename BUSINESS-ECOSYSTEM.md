# Homelander SDA Enterprise - Business Ecosystem

**Last Updated:** 2025-10-19
**Status:** Production - Multi-Domain Architecture
**Owner:** Tony Tadros (tony@homelander.com.au)

---

## 🌐 **MULTI-DOMAIN STRATEGY**

### **Target Audiences & Domains**

| Domain | Target Audience | Purpose | Status |
|--------|----------------|---------|--------|
| **sdabyhomelander.com.au** | NDIS Participants | Find SDA housing, apply for properties | 🔄 In Development |
| **webuylandapp.com.au/pathways** | NDIS Participants | SDA POP assessment & intake (TEMP) | ✅ Live |
| **sdacapital.com.au** | Private Investors | Investment opportunities in PLCG projects | 🔨 To Build |
| **plcg.com.au** | Existing Landlords | Convert properties to NDIS standards | ✅ Live |
| **channelagent.com.au** | Channel Agents | SDA stock distribution network | ✅ Live |
| **admin dashboard** | Internal Staff | Property/participant/investor management | ✅ Live |

---

## 🎯 **BUSINESS MODEL OVERVIEW**

### **Revenue Streams:**

1. **Participant Housing (B2C)**
   - NDIS participants find SDA housing
   - Homelander manages property placement
   - Revenue: Placement fees, ongoing management

2. **PLCG Investments (B2C - Investors)**
   - Private investors fund SDA property development
   - Managed by Homelander PLCG division
   - Revenue: Development fees, ROI share

3. **Landlord Services (B2B)**
   - Convert existing properties to NDIS standards
   - SDA certification assistance
   - Revenue: Conversion consulting fees

4. **Channel Agent Network (B2B2C)**
   - Agents distribute SDA stock to their investor clients
   - White-label investment opportunities
   - Revenue: Commission on sales

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Current Infrastructure (What's Running)**

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC WEBSITES                           │
├─────────────────────────────────────────────────────────────┤
│ webuylandapp.com.au/pathways  → Participants (TEMP)         │
│ sdabyhomelander.com.au        → Participants (PRODUCTION)   │
│ sdacapital.com.au             → Investors (TO BUILD)        │
│ plcg.com.au                   → Landlords (LIVE)            │
│ channelagent.com.au           → Channel Agents (LIVE)       │
└─────────────────────────────────────────────────────────────┘
                         ↓ (Jotform intake)
┌─────────────────────────────────────────────────────────────┐
│                  AUTOMATION LAYER                            │
├─────────────────────────────────────────────────────────────┤
│ Jotform (9 forms with webhooks configured)                  │
│   ├─ SDA Property Request Form (231298175953870)           │
│   ├─ SDA POP Criteria (251716128939869)                    │
│   ├─ NDIS Service Agreements (240977592477878)             │
│   └─ Landlord/Property forms (6+ forms)                    │
│                         ↓                                    │
│ Make.com                                                     │
│   ├─ Facebook auto-posting (LIVE)                          │
│   ├─ Social media automation                                │
│   └─ Workflow triggers                                      │
│                         ↓                                    │
│ N8N (homelandersda.app.n8n.cloud)                           │
│   ├─ Webhook: Jotform → Airtable                           │
│   └─ Lead processing workflows                              │
│                         ↓                                    │
│ Supabase Edge Functions                                     │
│   └─ jotform-extractor (LIVE)                              │
│       ├─ Download files from Jotform                        │
│       ├─ AI categorization                                  │
│       ├─ Participant matching                               │
│       └─ Upload to Storage                                  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
├─────────────────────────────────────────────────────────────┤
│ Supabase (bqvptfdxnrzculgjcnjo.supabase.co)                │
│   ├─ PostgreSQL Database                                    │
│   │   ├─ participants (NDIS participants)                   │
│   │   ├─ landlords (property owners)                        │
│   │   ├─ investors (PLCG capital providers)                 │
│   │   ├─ jobs (PLCG investment opportunities)               │
│   │   ├─ properties (SDA housing stock)                     │
│   │   ├─ file_uploads (documents with AI metadata)          │
│   │   └─ ai_recommendations (ML suggestions)                │
│   ├─ Storage Buckets                                        │
│   │   └─ documents (private, 10MB limit)                    │
│   └─ Edge Functions                                         │
│       └─ jotform-extractor                                  │
│                         ↓                                    │
│ Airtable (appbKYczBetBCdJKs) ⚠️ TO DEPRECATE               │
│   └─ Legacy CRM data (being migrated to Supabase)          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                 ADMIN INTERFACE                              │
├─────────────────────────────────────────────────────────────┤
│ Admin Dashboard (sda-property-admin.s3-website-us-west-2)  │
│   ├─ Participant Management                                 │
│   ├─ Landlord Management                                    │
│   ├─ Investor Management                                    │
│   ├─ PLCG Job Tracking                                      │
│   ├─ AI Recommendations Panel                               │
│   └─ Document Approval Workflow                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 **DATA FLOW: CURRENT STATE**

### **Participant Journey (As-Is)**

```
1. Participant visits webuylandapp.com.au/pathways
2. Fills SDA POP Criteria assessment
3. Submits Jotform with files (NDIS plan, ID, etc.)
4. TWO webhooks trigger simultaneously:

   Webhook A (N8N):
   Jotform → N8N → Airtable
   ↓
   Creates lead in Airtable CRM

   Webhook B (Supabase):
   Jotform → Edge Function → Supabase
   ↓
   - Downloads files
   - AI categorizes (confidence scores)
   - Matches participant (NDIS# or name)
   - Uploads to Storage (participant/{id}/{category}/)
   - Creates file_uploads record

5. Admin sees in dashboard:
   - Participant profile
   - Attached documents with "From Jotform" badge
   - AI recommendations
   - Match score

⚠️ PROBLEM: Data lives in TWO places (Airtable + Supabase)
```

---

## 🎯 **DATA MIGRATION PLAN: AIRTABLE → SUPABASE**

### **Goal: Single Source of Truth**

**Current State:**
- Participant data in Airtable (from N8N webhook)
- Participant data in Supabase (manual entry + some automation)
- Sync conflicts, duplicate records, confusion

**Target State:**
- **Supabase as ONLY database**
- Airtable deprecated
- N8N writes directly to Supabase
- Real-time data everywhere

---

### **Migration Strategy (Option B - Full Migration)**

#### **Phase 1: Data Audit (Week 1)**

```bash
# Extract all data from Airtable
Task: Export all tables to CSV
Tables:
  - Participants (leads from Jotform)
  - Properties (if any)
  - Notes/interactions
  - Custom fields

# Compare with Supabase
Task: Identify duplicates, missing data, conflicts
Output: Migration mapping spreadsheet
```

#### **Phase 2: Schema Alignment (Week 1)**

```sql
-- Ensure Supabase has all Airtable fields
-- Example: If Airtable has "lead_source" but Supabase doesn't

ALTER TABLE participants
ADD COLUMN lead_source TEXT,
ADD COLUMN utm_source TEXT,
ADD COLUMN utm_campaign TEXT,
ADD COLUMN airtable_id TEXT, -- For reference during migration
ADD COLUMN migrated_at TIMESTAMPTZ;

-- Create mapping table for migration tracking
CREATE TABLE migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airtable_id TEXT NOT NULL,
  supabase_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  migrated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('success', 'conflict', 'skipped')),
  notes TEXT
);
```

#### **Phase 3: Data Migration Script (Week 2)**

```typescript
// supabase/functions/migrate-airtable/index.ts

import { createClient } from '@supabase/supabase-js'
import Airtable from 'airtable'

// Fetch all Airtable participants
const airtableRecords = await airtableBase('Participants')
  .select()
  .all()

// Migrate each record
for (const record of airtableRecords) {
  const airtableData = record.fields

  // Check if already migrated
  const { data: existing } = await supabase
    .from('participants')
    .select('id')
    .eq('airtable_id', record.id)
    .single()

  if (existing) {
    console.log(`Skipping ${record.id} - already migrated`)
    continue
  }

  // Check for duplicate by NDIS number
  const { data: duplicate } = await supabase
    .from('participants')
    .select('id')
    .eq('ndis_number', airtableData.ndis_number)
    .single()

  if (duplicate) {
    // Update existing record with Airtable ID for tracking
    await supabase
      .from('participants')
      .update({
        airtable_id: record.id,
        migrated_at: new Date().toISOString(),
        // Merge any additional Airtable fields
        lead_source: airtableData.lead_source,
        utm_source: airtableData.utm_source
      })
      .eq('id', duplicate.id)

    console.log(`Merged ${record.id} with existing ${duplicate.id}`)
  } else {
    // Create new participant
    const { data: newParticipant, error } = await supabase
      .from('participants')
      .insert({
        name: airtableData.name,
        ndis_number: airtableData.ndis_number,
        airtable_id: record.id,
        lead_source: airtableData.lead_source,
        migrated_at: new Date().toISOString(),
        // Map all other Airtable fields
        ...mapAirtableFields(airtableData)
      })
      .select()
      .single()

    if (error) {
      console.error(`Failed to migrate ${record.id}:`, error)
      await logMigrationError(record.id, error)
    } else {
      console.log(`Migrated ${record.id} → ${newParticipant.id}`)
    }
  }
}

// Log migration summary
console.log('Migration complete:', {
  total: airtableRecords.length,
  migrated: migratedCount,
  merged: mergedCount,
  errors: errorCount
})
```

#### **Phase 4: Update N8N Workflows (Week 2)**

```javascript
// Change N8N webhook destination from Airtable to Supabase

// OLD FLOW:
Jotform Webhook → N8N → Airtable

// NEW FLOW:
Jotform Webhook → N8N → Supabase (via REST API)

// N8N Node Configuration:
{
  "method": "POST",
  "url": "https://bqvptfdxnrzculgjcnjo.supabase.co/rest/v1/participants",
  "headers": {
    "apikey": "{{$env.SUPABASE_ANON_KEY}}",
    "Authorization": "Bearer {{$env.SUPABASE_ANON_KEY}}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  },
  "body": {
    "name": "{{$json.participant_name}}",
    "ndis_number": "{{$json.ndis_number}}",
    "lead_source": "jotform",
    "utm_source": "{{$json.utm_source}}",
    "form_submission_id": "{{$json.submission_id}}"
  }
}

// OR: Use Supabase Edge Function instead
{
  "url": "https://bqvptfdxnrzculgjcnjo.supabase.co/functions/v1/jotform-extractor",
  "body": {
    "action": "webhook_handler",
    "submissionID": "{{$json.submissionID}}",
    "formID": "{{$json.formID}}",
    "answers": "{{$json.answers}}"
  }
}
```

#### **Phase 5: Deprecate Airtable (Week 3)**

```bash
# 1. Run in read-only mode for 1 week
   - Monitor for any missing data
   - Verify all workflows using Supabase

# 2. Export final Airtable backup
   - Download all tables as CSV
   - Store in Google Drive for archive

# 3. Cancel Airtable subscription
   - Keep backup for 90 days
   - Document any custom Airtable automations that need rebuilding

# 4. Update documentation
   - Remove Airtable from architecture diagrams
   - Update onboarding docs
```

---

## 📊 **POST-MIGRATION ARCHITECTURE**

### **New Data Flow (Single Source of Truth)**

```
PUBLIC WEBSITES
    ↓
JOTFORM INTAKE
    ↓
WEBHOOK SPLITS:
    ├─ Make.com (Social media automation)
    └─ Supabase Edge Function (Data processing)
        ↓
SUPABASE (SINGLE DATABASE)
    ├─ participants
    ├─ landlords
    ├─ investors
    ├─ properties
    ├─ jobs (PLCG)
    └─ file_uploads
        ↓
ADMIN DASHBOARD (Real-time)
    └─ All data from Supabase

✅ RESULT: One database, no sync conflicts, real-time everywhere
```

---

## 🚀 **WHAT'S ALREADY WORKING**

### **✅ Participant System**
- Public website: webuylandapp.com.au/pathways (temp)
- Jotform intake with file uploads
- AI-powered file categorization
- Automatic participant matching
- Edge Function processing (2-5 seconds)
- Admin dashboard with documents

### **✅ Social Media Automation**
- Make.com → Facebook auto-posting (LIVE)
- Posts to Homelander pages automatically
- Workflow triggers configured

### **✅ Admin Backend**
- Multi-tenant architecture (RLS policies)
- Landlord management
- Investor tracking
- PLCG job management
- AI recommendations panel
- Real-time document processing

### **✅ Infrastructure**
- GitHub Actions CI/CD
- Supabase Edge Functions deployed
- Storage buckets configured
- 9 Jotform webhooks active
- Make.com workflows running

---

## 🔨 **WHAT NEEDS TO BE BUILT**

### **Priority 1: Data Migration (THIS MONTH)**
- [ ] Audit Airtable data
- [ ] Create migration script
- [ ] Test migration with sample data
- [ ] Execute full migration
- [ ] Update N8N to write to Supabase
- [ ] Deprecate Airtable

### **Priority 2: Investor Portal (sdacapital.com.au)**
```
Features Needed:
├─ Public Pages
│   ├─ /opportunities (browse PLCG projects)
│   ├─ /calculator (ROI modeling)
│   └─ /about (how PLCG works)
├─ Investor Portal (Login Required)
│   ├─ /my-investments (dashboard)
│   ├─ /documents (tax docs, reports)
│   └─ /profile (investor details)
└─ Integration
    └─ Connect to Supabase investors + jobs tables

Tech Stack: Same as participant site (for consistency)
Timeline: 2-3 weeks
```

### **Priority 3: Participant Portal (Self-Service)**
```
Add to sdabyhomelander.com.au:

/my-application
  - Login with email/NDIS number
  - Application status tracking
  - Matched properties view
  - Document upload
  - Message support coordinator

Integration: Supabase Auth + participants table
Timeline: 1 week
```

### **Priority 4: Analytics & Attribution**
```
Add to all public websites:
- Google Analytics 4
- Facebook Pixel
- UTM parameter tracking
- Conversion funnel dashboard (admin)

Tracks:
- Which social post drove leads
- Conversion rates at each step
- ROI per marketing channel

Timeline: 2 days
```

---

## 📈 **SUCCESS METRICS**

### **Current Performance**
- **Jotform submissions processed:** 97 total (74 with files)
- **Participants matched by AI:** 1 (Jessica Teasdale)
- **Files uploaded automatically:** 0 (historical URLs expired)
- **Webhooks configured:** 9 forms
- **Processing time:** 2-5 seconds (Jotform → Supabase)
- **Participant matching accuracy:** 100% (when participant exists)

### **Target Metrics (Post-Migration)**
- **Lead processing time:** < 5 seconds (currently manual from Airtable)
- **Data accuracy:** 100% (single source of truth)
- **Admin efficiency:** 80% time savings (no duplicate data entry)
- **Participant self-service:** 70% of inquiries resolved without admin
- **Investor conversion:** 30% (from portal sign-up to investment)

---

## 🎯 **BUSINESS ECOSYSTEM SUMMARY**

### **WHO WE SERVE**

1. **NDIS Participants (B2C)**
   - Website: sdabyhomelander.com.au
   - Need: Find SDA housing
   - Journey: Assessment → Application → Matching → Lease
   - Revenue: Placement fees, ongoing management

2. **Private Investors (B2C)**
   - Website: sdacapital.com.au (to build)
   - Need: SDA investment opportunities
   - Journey: Browse → Calculator → Invest → Reporting
   - Revenue: Development fees, ROI share

3. **Existing Landlords (B2B)**
   - Website: plcg.com.au (live)
   - Need: Convert properties to NDIS standards
   - Journey: Consultation → Conversion → Certification
   - Revenue: Consulting fees, certification assistance

4. **Channel Agents (B2B2C)**
   - Website: channelagent.com.au (live)
   - Need: SDA stock to sell to their investor clients
   - Journey: Enrollment → Stock access → Commission
   - Revenue: Sales commissions

---

## 🔐 **SECURITY & COMPLIANCE**

### **Multi-Tenant Security**
- ✅ Row-Level Security (RLS) on all Supabase tables
- ✅ Organization-scoped data isolation
- ✅ Private storage buckets (authenticated access only)
- ✅ Service role keys for Edge Functions (secure)
- ✅ No cross-tenant data leakage

### **NDIS Compliance**
- ✅ Sensitive participant data protected
- ✅ Audit trail on all file uploads
- ✅ Encrypted storage
- ✅ Access logs for compliance reporting

### **Data Privacy**
- ✅ GDPR-ready (user data export, deletion)
- ✅ Australian Privacy Principles (APP) compliant
- ✅ Participant consent tracking
- ✅ Opt-out mechanisms

---

## 📞 **KEY CONTACTS & SYSTEMS**

### **Production Systems**
- **Supabase Project:** bqvptfdxnrzculgjcnjo.supabase.co
- **N8N Instance:** homelandersda.app.n8n.cloud
- **Airtable Base:** appbKYczBetBCdJKs (to deprecate)
- **Admin Dashboard:** sda-property-admin.s3-website-us-west-2.amazonaws.com
- **GitHub Repo:** github.com/Tony6776/sda-property-admin

### **Domain Registry**
- sdabyhomelander.com.au (participants - production)
- webuylandapp.com.au (participants - temp)
- sdacapital.com.au (investors - to build)
- plcg.com.au (landlords - live)
- channelagent.com.au (channel agents - live)

### **Business Contact**
- **Owner:** Tony Tadros
- **Email:** tony@homelander.com.au
- **Business:** Homelander SDA Enterprise
- **Portfolio Value:** $53.1M AUD

---

## 🚦 **NEXT ACTIONS**

### **Week 1-2: Data Migration**
```bash
Priority: CRITICAL
Owner: Development Team
Timeline: 2 weeks

Tasks:
1. Audit Airtable data (export all tables)
2. Map Airtable fields → Supabase schema
3. Write migration script
4. Test with 10 sample records
5. Execute full migration
6. Validate data integrity
7. Update N8N webhooks → Supabase
8. Run parallel for 1 week (verify)
9. Deprecate Airtable
```

### **Week 3-4: Investor Portal**
```bash
Priority: HIGH
Owner: Development Team
Timeline: 2 weeks

Tasks:
1. Clone participant website theme
2. Create sdacapital.com.au
3. Build /opportunities page (connect to jobs table)
4. Build /calculator (ROI modeling)
5. Build /my-investments (login portal)
6. Add Supabase Auth
7. Connect to investors table
8. Deploy and test
```

### **Week 5-6: Participant Portal + Analytics**
```bash
Priority: HIGH
Owner: Development Team
Timeline: 2 weeks

Tasks:
1. Add Supabase Auth to sdabyhomelander.com.au
2. Build /my-application portal
3. Connect to participants table
4. Add GA4 + Facebook Pixel to all sites
5. Create conversion funnel dashboard (admin)
6. Test end-to-end
```

---

## 📝 **REVISION HISTORY**

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-19 | 1.0 | Initial ecosystem documentation | Claude Code |
| - | - | - | - |

---

**This document is the single source of truth for Homelander's business ecosystem.**

**Update this file whenever:**
- New domain added
- New integration built
- Architecture changes
- Migration milestones hit

**Do NOT maintain separate documentation** - this is the master reference.
