# AI-Assisted Admin Workflows - System Design

**Focus:** Admin-facing AI agents to manage landlords, participants, properties, and PLCG jobs

**Principle:** Admin uploads files → AI processes → Auto-categorizes → Suggests actions → Admin approves

---

## 🎯 Core Workflows

### 1. **Landlord Property Management** 🏠

**Admin Tasks:**
- Onboard new landlords
- Add landlord properties to system
- Track property performance
- Manage rental agreements
- Handle maintenance requests
- Monitor compliance

**AI Agent Assistance:**

#### **Document Processing Agent**
**Trigger:** Admin uploads landlord documents
**AI Actions:**
1. OCR scan document (lease agreement, title deed, compliance certificate)
2. Extract key data:
   - Property address
   - Landlord name and contact
   - Lease terms (start date, end date, rent amount)
   - NDIS registration status
   - SDA category
3. Auto-populate property form
4. Flag missing information
5. Suggest property listing details

**Upload Locations:**
- `/admin/landlords/:id/documents/lease-agreements`
- `/admin/landlords/:id/documents/compliance`
- `/admin/landlords/:id/documents/title-deeds`

#### **Property Pricing Agent**
**Trigger:** Admin adds new landlord property
**AI Actions:**
1. Analyze comparable properties in area
2. Check NDIS SDA price guide for category
3. Suggest optimal weekly rent
4. Calculate ROI for investor pitch
5. Flag if price is above/below market

**Admin View:**
```
Property: 123 Main St, Melbourne
AI Suggestion: $850/week (NDIS Fully Accessible rate)
Comparable Properties: 3 nearby at $820-$880/week
Market Position: Competitive
Recommendation: ✅ List at $850/week
```

#### **Maintenance Scheduling Agent**
**Trigger:** Property requires maintenance or compliance check
**AI Actions:**
1. Track maintenance schedule (annual inspections, NDIS recertification)
2. Auto-create tasks 30 days before due
3. Assign to relevant admin/contractor
4. Send reminder to landlord
5. Flag overdue items

**Admin Dashboard:**
- Upcoming maintenance calendar
- Overdue compliance alerts
- Auto-generated task list

---

### 2. **Participant Management with AI** 👥

**Admin Tasks:**
- Review participant applications
- Verify documents
- Match participants to properties
- Track participant journey
- Manage waitlists
- Handle inquiries

**AI Agent Assistance:**

#### **Document Verification Agent**
**Trigger:** Participant uploads NDIS plan / ID / Income proof
**AI Actions:**
1. OCR scan uploaded document
2. Verify document type (NDIS plan vs payslip vs ID)
3. Extract key data:
   - NDIS number
   - SDA funding amount
   - Funding period (start/end dates)
   - SDA category eligibility
   - Plan manager details
4. Auto-fill participant profile
5. Flag inconsistencies (uploaded funding doesn't match stated amount)
6. Suggest approval or request re-upload

**Admin Review Screen:**
```
Document: NDIS Plan - John Smith
AI Verification: ✅ Valid NDIS Plan
Extracted Data:
  - NDIS Number: NDIS12345678 (matches profile ✓)
  - SDA Funding: $850/week (matches budget ✓)
  - Category: Fully Accessible (matches preference ✓)
  - Valid Until: 2026-03-15

AI Recommendation: ✅ APPROVE
Admin Action: [Approve] [Reject] [Request Clarification]
```

#### **Lead Qualification Agent**
**Trigger:** New participant signup OR profile update
**AI Actions:**
1. Calculate lead score (0-100)
2. Analyze completeness:
   - Profile filled: 30 points
   - Documents uploaded: 30 points
   - Budget realistic: 20 points
   - Preferred locations have inventory: 20 points
3. Assign engagement level (cold/warm/hot)
4. Suggest next action:
   - Cold: Send welcome email + document request
   - Warm: Show property matches + schedule call
   - Hot: Fast-track to viewing
5. Flag high-priority leads

**Admin Dashboard:**
```
Hot Leads (Ready to View):
- Sarah Johnson (Score: 95) - 3 excellent matches, all docs verified
  AI Action: Schedule viewing for 123 Main St (88% match)

Warm Leads (Need Follow-up):
- Mike Brown (Score: 72) - Missing income proof
  AI Action: Send document request email

Cold Leads (New Signups):
- Emma Davis (Score: 35) - Just signed up
  AI Action: Send welcome email + onboarding guide
```

#### **Smart Matching Agent**
**Trigger:** Admin views participant profile OR new property added
**AI Actions:**
1. Run AI matching algorithm
2. Calculate match scores for all properties
3. Generate match reasons (location, budget, accessibility, SDA category)
4. Rank properties by quality (excellent 80+, good 60-79, fair 40-59)
5. Suggest top 3 properties to show participant
6. Flag why lower-scored properties don't match

**Admin View:**
```
Participant: John Smith
Top AI Matches:

1. 123 Main St, Melbourne (Score: 92)
   ✅ Perfect location match (Melbourne East preference)
   ✅ Budget fit ($850/week = SDA funding)
   ✅ Fully accessible (matches NDIS category)
   ✅ 2BR 1BA (meets requirements)
   AI Action: Send match notification email

2. 456 Oak Ave, Melbourne (Score: 85)
   ✅ Location match (Melbourne CBD preference)
   ⚠️ Slightly above budget ($900/week but high quality)
   ✅ Fully accessible
   AI Action: Show as premium option

Admin: [Send Matches] [Edit Matches] [Skip]
```

---

### 3. **Property Lifecycle Management** 🏘️

**Admin Tasks:**
- Track property status (available → viewing → applied → approved → tenanted)
- Manage property listings
- Update availability
- Track viewings
- Handle applications

**AI Agent Assistance:**

#### **Status Transition Agent**
**Trigger:** Property status change OR participant action
**AI Actions:**
1. Detect status change triggers:
   - Participant marks "interested" → Status: Viewing Pending
   - Viewing scheduled → Status: Under Viewing
   - Application submitted → Status: Under Review
   - Approved → Status: Tenanted
2. Auto-update property status
3. Notify relevant parties (landlord, participant, admin)
4. Create follow-up tasks
5. Update availability on public site

**Admin Workflow:**
```
Property: 123 Main St
Status: Available → Viewing Pending

AI Detected:
- 3 participants marked "interested"
- Sarah Johnson (hot lead, score 95)
- Mike Brown (warm lead, score 72)
- Emma Davis (cold lead, score 35)

AI Recommendation:
1. Priority viewing: Sarah Johnson (highest score, all docs verified)
2. Backup viewing: Mike Brown (pending doc verification)
3. Waitlist: Emma Davis (new signup)

AI Actions Suggested:
- [Auto] Send viewing invite to Sarah
- [Auto] Request income proof from Mike
- [Auto] Send welcome email to Emma
- [Manual] Schedule viewing with landlord

Admin: [Approve All] [Edit Priority] [Manual Override]
```

#### **Performance Tracking Agent**
**Trigger:** Weekly/monthly analysis
**AI Actions:**
1. Track property metrics:
   - Days on market
   - Number of views
   - Interested participants
   - Application conversion rate
2. Flag underperforming properties
3. Suggest improvements:
   - Price adjustment
   - Better photos
   - Enhanced description
   - Target different audience
4. Compare to similar properties

**Admin Dashboard:**
```
Property Performance Report:

⚠️ Underperforming:
- 789 Pine St (45 days, 0 applications)
  AI Analysis: Price 15% above market
  AI Suggestion: Reduce to $780/week OR add photos

✅ High Performers:
- 123 Main St (3 days, 3 applications)
  AI Analysis: Well-priced, excellent photos, perfect location
  Status: Under review
```

---

### 4. **PLCG Job Management** 💼

**Admin Tasks:**
- Create jobs for properties
- Assign investors
- Track job status (new → in_progress → completed)
- Manage job documents
- Monitor ROI and performance

**AI Agent Assistance:**

#### **Job Creation Agent**
**Trigger:** Admin creates new PLCG job OR uploads job brief
**AI Actions:**
1. Extract job details from uploaded brief:
   - Property details
   - Required investment amount
   - Timeline
   - Expected ROI
   - Risk factors
2. Auto-populate job form
3. Suggest suitable investors based on:
   - Investment capacity
   - Preferred property types
   - Historical performance
   - Location preferences
4. Calculate projected returns
5. Flag compliance requirements

**Admin Workflow:**
```
Upload Job Brief: [PDF: New Development - 10 units Melbourne]

AI Processing...
✅ Extracted Data:
- Project: 10-unit SDA development, Melbourne East
- Investment Required: $3.5M
- Timeline: 18 months
- Expected ROI: 7.2% annual
- Property Type: Fully Accessible SDA
- Target Investors: 3-5 participants

AI Matched Investors:
1. John Investment Group ($2M capacity, prefers Melbourne, avg ROI 6.8%)
   Match Score: 92%
2. Sarah Capital ($1.5M capacity, SDA specialist, avg ROI 7.1%)
   Match Score: 88%
3. Brown Properties ($1M capacity, diversified portfolio)
   Match Score: 75%

AI Recommendation: Invite top 2 investors, wait on #3

Admin: [Create Job] [Edit Matches] [Cancel]
```

#### **Job Status Tracking Agent**
**Trigger:** Job status update OR milestone reached
**AI Actions:**
1. Track job milestones:
   - Job created → Investors invited
   - Investors committed → Funding secured
   - Construction started → Progress updates
   - Construction completed → Tenancy ready
2. Auto-update status based on actions
3. Send notifications at each milestone
4. Flag delays or issues
5. Suggest corrective actions

**Admin Dashboard:**
```
Active Jobs:

🟢 On Track:
- Melbourne East Development (In Progress, 40% complete)
  Next Milestone: Foundation inspection (due 2025-11-01)
  AI Status: On schedule

⚠️ Attention Needed:
- Sydney North Project (In Progress, 15% complete)
  Issue: 3 weeks behind schedule
  AI Analysis: Weather delays + permit issues
  AI Suggestion: Notify investors, extend timeline 2 weeks

🔴 Blocked:
- Brisbane South Development (Funding Pending)
  Issue: 1 investor pulled out
  AI Suggestion: Contact backup investor (Michael Properties, 85% match)
```

#### **Investor Matching Agent**
**Trigger:** New job created OR investor profile updated
**AI Actions:**
1. Analyze investor portfolio:
   - Current investments
   - Available capital
   - Preferred property types
   - Geographic preferences
   - Risk tolerance
2. Match to suitable jobs
3. Calculate potential ROI for investor
4. Rank jobs by fit
5. Generate investor pitch deck

**Admin View:**
```
Investor: John Investment Group
Available Capital: $2M
Preferences: SDA, Melbourne, Low-Medium Risk

AI Matched Opportunities:

1. Melbourne East Development (Score: 92%)
   Investment: $1.2M
   Projected ROI: 7.2% annual
   Risk: Low
   Timeline: 18 months
   Why Good Fit: Perfect location, SDA focus, conservative returns

2. Adelaide Central Units (Score: 78%)
   Investment: $800K
   Projected ROI: 8.5% annual
   Risk: Medium
   Timeline: 12 months
   Why Lower Score: Outside preferred geography

Admin: [Send Pitch] [Schedule Meeting] [Skip]
```

---

### 5. **Intelligent File Upload & Processing** 📁

**Admin Tasks:**
- Upload property documents (leases, compliance certs, floor plans)
- Upload participant documents (NDIS plans, IDs, income proofs)
- Upload job briefs (investment proposals, contracts)
- Organize files by category

**AI Agent Assistance:**

#### **Smart Upload Agent**
**Trigger:** Admin uploads any file
**AI Actions:**
1. Detect file type (PDF, image, Excel, Word)
2. OCR scan if PDF/image
3. Analyze content to determine category:
   - Lease agreement → Property > Landlord > Lease
   - NDIS plan → Participant > Documents > NDIS
   - Investment brief → PLCG > Jobs > Briefs
   - Compliance cert → Property > Compliance
4. Extract key metadata
5. Auto-categorize and route to correct section
6. Suggest file naming convention
7. Flag sensitive data (PII, financial info)

**Admin Upload Screen:**
```
Upload File: [Drag & Drop OR Browse]

AI Processing: lease_agreement_123mainst.pdf

AI Analysis:
✅ Document Type: Lease Agreement
✅ Property: 123 Main St, Melbourne (auto-detected from content)
✅ Landlord: Smith Property Group (matched in database)
✅ Category: Property > Landlord > Lease Agreements
✅ Extracted Data:
   - Lease Start: 2025-01-01
   - Lease End: 2026-12-31
   - Monthly Rent: $3,600 ($900/week)
   - Tenant: To be assigned

AI Suggestion:
- Save to: /properties/123-main-st/landlord/lease-agreements/
- File name: 2025-01-01_lease_agreement.pdf
- Link to: Property ID abc123
- Create task: Review lease before listing property

Admin: [Accept AI Categorization] [Edit] [Cancel]
```

#### **Document Extraction Agent**
**Trigger:** AI categorizes document
**AI Actions:**
1. Extract structured data from document
2. Auto-fill relevant database fields
3. Flag data inconsistencies
4. Suggest form updates
5. Create related tasks

**Examples:**

**NDIS Plan Upload:**
```
AI Extracted:
- NDIS Number: NDIS12345678
- Participant Name: John Smith
- SDA Funding: $850/week
- Plan Period: 2024-07-01 to 2025-06-30
- Plan Manager: ABC Plan Management

AI Actions:
- ✅ Update participant profile with NDIS number
- ✅ Set max weekly budget to $850
- ✅ Flag plan expiry date (2025-06-30)
- ⚠️ Create reminder: Review plan 30 days before expiry
- ✅ Mark document as "verified"

Admin: [Approve All] [Edit] [Reject]
```

**Investment Brief Upload:**
```
AI Extracted:
- Project Name: Melbourne East 10-Unit Development
- Investment Required: $3.5M
- Timeline: 18 months
- Expected ROI: 7.2% annual
- Property Type: Fully Accessible SDA
- Location: Melbourne East

AI Actions:
- ✅ Create new PLCG job
- ✅ Set status: New
- ✅ Match to 3 suitable investors
- ✅ Calculate ROI projections
- 🔔 Notify admin: Ready to invite investors

Admin: [Create Job] [Edit Details] [Cancel]
```

#### **Bulk Upload Agent**
**Trigger:** Admin uploads multiple files (e.g., folder of property photos)
**AI Actions:**
1. Process all files in batch
2. Group related files (same property, same participant)
3. Auto-categorize each file
4. Detect duplicates
5. Generate upload summary
6. Flag errors

**Admin Workflow:**
```
Bulk Upload: 25 files selected

AI Processing...
✅ Processed 25 files in 12 seconds

Categorization Summary:
- Property Images: 15 files
  - 123 Main St: 8 photos (living, bedroom, bathroom, kitchen, exterior)
  - 456 Oak Ave: 7 photos
- Lease Agreements: 5 PDFs
  - 123 Main St: 1 lease
  - 456 Oak Ave: 1 lease
  - 789 Pine St: 3 leases (multiple versions detected)
- Compliance Certs: 5 PDFs

AI Actions:
- ✅ Auto-linked images to properties
- ✅ Set primary photo for each property
- ⚠️ 789 Pine St has 3 lease versions - manual review needed
- ✅ Filed all compliance certs

Admin: [Accept] [Review Duplicates] [Cancel]
```

---

## 🎨 Admin UI Design

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  SDA Admin Dashboard       [🤖 AI Assistant] [Profile] [⚙️] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ⚡ AI Alerts & Recommendations                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 High Priority (3)                                 │   │
│  │ • Sarah Johnson ready for viewing (score 95)        │   │
│  │ • 789 Pine St underperforming - suggest price cut   │   │
│  │ • Sydney North job 3 weeks behind - notify investors│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  📊 Quick Stats                                              │
│  ┌──────┬──────┬──────┬──────┬──────┐                      │
│  │ Hot  │Active│Docs  │Jobs  │Files │                      │
│  │Leads │Props │Queue │Track │Today │                      │
│  │  12  │  45  │  8   │  5   │  23  │                      │
│  └──────┴──────┴──────┴──────┴──────┘                      │
│                                                               │
│  🏠 Property Management    │  👥 Participant Management      │
│  ┌─────────────────────┐   │  ┌──────────────────────┐     │
│  │ [AI] New Property   │   │  │ [AI] Review Docs (8) │     │
│  │ [AI] Bulk Upload    │   │  │ [AI] Hot Leads (12)  │     │
│  │      Performance    │   │  │      Send Matches    │     │
│  └─────────────────────┘   │  └──────────────────────┘     │
│                             │                                │
│  💼 PLCG Jobs              │  📁 Smart File Upload          │
│  ┌─────────────────────┐   │  ┌──────────────────────┐     │
│  │ [AI] Create Job     │   │  │ [Drop Files Here]    │     │
│  │ [AI] Match Investors│   │  │ AI Auto-Categorizes  │     │
│  │      Job Status     │   │  │ Extracts Data        │     │
│  └─────────────────────┘   │  └──────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### AI Assistant Panel

```
┌─────────────────────────────────┐
│  🤖 AI Assistant                │
├─────────────────────────────────┤
│                                 │
│  What can I help with?          │
│                                 │
│  Suggested Actions:             │
│  • Review 8 pending documents   │
│  • Contact 3 hot leads          │
│  • Update underperforming props │
│  • Match investors to new job   │
│                                 │
│  [Ask AI] _____________________ │
│                                 │
│  Recent AI Actions:             │
│  ✅ Matched Sarah to 123 Main   │
│  ✅ Verified 3 NDIS plans       │
│  ✅ Created Melbourne East job  │
│                                 │
└─────────────────────────────────┘
```

---

## 🛠️ Technical Architecture

### AI Agents Structure

```typescript
// AI Agent Framework
interface AIAgent {
  name: string;
  trigger: AgentTrigger;
  process: (input: any) => Promise<AIResult>;
  confidence: number; // 0-100
  suggestAction: boolean;
  autoExecute: boolean;
}

// Agent Types
enum AgentType {
  DOCUMENT_PROCESSING = 'document_processing',
  LEAD_QUALIFICATION = 'lead_qualification',
  PROPERTY_MATCHING = 'property_matching',
  JOB_MATCHING = 'job_matching',
  STATUS_TRANSITION = 'status_transition',
  FILE_CATEGORIZATION = 'file_categorization',
  PERFORMANCE_ANALYSIS = 'performance_analysis'
}

// Example: Document Processing Agent
const documentAgent: AIAgent = {
  name: 'NDIS Plan Verifier',
  trigger: { event: 'file_upload', fileType: 'ndis_plan' },
  process: async (file) => {
    // OCR scan
    const text = await ocrScan(file);

    // Extract data
    const extracted = await extractNDISData(text);

    // Verify against profile
    const verification = await verifyAgainstProfile(extracted);

    // Return result
    return {
      success: true,
      confidence: 95,
      extracted_data: extracted,
      verification: verification,
      suggested_action: verification.isValid ? 'approve' : 'request_clarification'
    };
  },
  confidence: 95,
  suggestAction: true,
  autoExecute: false // Requires admin approval
};
```

### Integration with Supabase Edge Functions

**Edge Functions:**
1. `ai-document-processor` - OCR and data extraction
2. `ai-lead-scorer` - Calculate lead scores
3. `ai-property-matcher` - Match participants to properties
4. `ai-job-matcher` - Match investors to jobs
5. `ai-file-categorizer` - Auto-categorize uploads
6. `ai-performance-analyzer` - Property performance insights

**Database Tables:**
```sql
-- AI Actions Log
CREATE TABLE ai_actions (
  id uuid PRIMARY KEY,
  agent_type text NOT NULL,
  trigger_event text NOT NULL,
  input_data jsonb,
  output_data jsonb,
  confidence_score integer, -- 0-100
  suggested_action text,
  admin_approved boolean DEFAULT false,
  executed_at timestamp,
  created_at timestamp DEFAULT now()
);

-- AI Recommendations
CREATE TABLE ai_recommendations (
  id uuid PRIMARY KEY,
  entity_type text, -- 'property', 'participant', 'job'
  entity_id uuid,
  recommendation_type text,
  recommendation_data jsonb,
  priority text, -- 'high', 'medium', 'low'
  status text, -- 'pending', 'accepted', 'rejected'
  created_at timestamp DEFAULT now()
);
```

---

## 📋 Implementation Phases

### **Phase 1: Smart File Upload (Foundation)**
**Time:** 6-8 hours

**Build:**
1. Universal file upload component with drag & drop
2. OCR integration (Tesseract.js or Cloud Vision API)
3. File categorization agent
4. Auto-routing to correct section
5. Metadata extraction

**Deliverables:**
- Upload any file → AI detects type → Routes to correct location
- Extract data from PDFs/images
- Admin approval workflow

---

### **Phase 2: Document Processing Agents**
**Time:** 8-10 hours

**Build:**
1. NDIS Plan Verifier Agent
2. Lease Agreement Processor
3. Compliance Certificate Checker
4. Investment Brief Analyzer
5. Admin review dashboard

**Deliverables:**
- Auto-verify participant documents
- Extract lease data for properties
- Flag compliance issues
- Suggest job creation from briefs

---

### **Phase 3: Lead & Match Intelligence**
**Time:** 10-12 hours

**Build:**
1. Lead Qualification Agent
2. Property Matching Agent (enhance existing)
3. Investor-Job Matching Agent
4. Recommendation engine
5. Priority scoring

**Deliverables:**
- Hot/warm/cold lead classification
- AI match suggestions for admin
- Investor opportunity matching
- Priority action list

---

### **Phase 4: Status & Performance Tracking**
**Time:** 8-10 hours

**Build:**
1. Property Status Transition Agent
2. Job Status Tracking Agent
3. Performance Analysis Agent
4. Alert system
5. Task automation

**Deliverables:**
- Auto-update property/job status
- Performance dashboards
- Underperforming property alerts
- Automated task creation

---

### **Phase 5: Admin AI Assistant Interface**
**Time:** 6-8 hours

**Build:**
1. AI Assistant sidebar
2. Recommendation cards
3. One-click action buttons
4. Approval workflow UI
5. AI action history

**Deliverables:**
- Unified AI assistant panel
- Quick action buttons
- Approve/reject AI suggestions
- View AI decision reasoning

---

## 🎯 Recommended Build Order

**Priority 1:** Phase 1 (Smart File Upload) - Foundation for everything
**Priority 2:** Phase 2 (Document Processing) - Immediate admin value
**Priority 3:** Phase 3 (Intelligence) - Enhanced matching and qualification
**Priority 4:** Phase 5 (AI Interface) - Brings it all together
**Priority 5:** Phase 4 (Tracking) - Ongoing optimization

**Total Time:** 38-48 hours (~1 week intensive development)

---

## ✅ Success Metrics

**Admin Efficiency:**
- 80% reduction in manual data entry
- 90% of documents auto-categorized correctly
- 70% of leads auto-qualified
- 50% reduction in time to match participants to properties

**AI Accuracy:**
- Document extraction: 95%+ accuracy
- Lead scoring: 85%+ predictive accuracy
- Property matching: 90%+ participant satisfaction
- File categorization: 98%+ correct routing

---

**Ready to build Phase 1 (Smart File Upload) in auto-mode?**
