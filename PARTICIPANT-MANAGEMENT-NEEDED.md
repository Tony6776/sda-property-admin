# Missing: Participant Lead Management Dashboard

**Status:** ❌ **NOT BUILT** (High Priority for Production)

---

## 🎯 Problem

You now have:
- ✅ **Participant Portal** (Phase 2) - Participants can signup, upload docs, view matches
- ✅ **Admin Property Management** (Phase 1-6) - You can manage properties, sync Airtable, manage admin users

**What's Missing:**
- ❌ **Admin view of participant data** - You can't see who signed up
- ❌ **Lead management dashboard** - You can't manage participant leads
- ❌ **Document verification workflow** - You can't approve uploaded documents
- ❌ **Match quality review** - You can't see AI matching results from admin side
- ❌ **Communication tools** - You can't email participants from admin

**Impact:**
All participant data is being collected in the database, but you have **NO UI to view or manage it** from admin side. You must query Supabase directly via SQL to see participant data.

---

## 📊 What Data Exists (But No Admin UI)

These tables are populated by participant portal but have NO admin dashboard:

### `participants` Table
**Current Data Captured:**
- Full name, email, phone
- NDIS number, SDA category, funding level
- Location preferences (array)
- Budget requirements (bedrooms, bathrooms, max weekly)
- Pathway interest (deposit-ready, rent-to-buy, equity-share)
- Deposit available
- Document upload status (ndis_plan_uploaded, id_uploaded, income_proof_uploaded)
- Lead score (0-100, auto-calculated)
- Engagement level (cold/warm/hot)
- Status (new/qualified/viewing/applied/approved)

**What You CAN'T Do Without Admin UI:**
- ❌ View list of all participants
- ❌ Filter by lead score, engagement, status
- ❌ See participant profile details
- ❌ Update participant status
- ❌ Export participant list to CSV
- ❌ Search participants by name/email

### `property_matches` Table
**Current Data Captured:**
- Participant-property pairs with match scores (0-100)
- Match reasons (JSON array explaining why)
- Match status (suggested/viewed/interested/applied)
- Viewed timestamp, interested timestamp

**What You CAN'T Do Without Admin UI:**
- ❌ See which participants matched which properties
- ❌ View match quality distribution
- ❌ Override AI match scores
- ❌ Manually create/delete matches
- ❌ See match conversion funnel (suggested → viewed → interested)

### `lead_activities` Table
**Current Data Captured:**
- All participant actions (signup, login, profile_updated, document_uploaded, match_viewed, match_interested)
- Activity timestamps
- Activity metadata (JSON)

**What You CAN'T Do Without Admin UI:**
- ❌ View participant activity timeline
- ❌ See engagement patterns
- ❌ Track user journey progress
- ❌ Identify stalled participants

### Supabase Storage: `participant-documents`
**Current Data Captured:**
- NDIS plans (PDF/JPG)
- Photo IDs (PDF/JPG)
- Income proofs (PDF/JPG)

**What You CAN'T Do Without Admin UI:**
- ❌ View uploaded documents
- ❌ Download documents for verification
- ❌ Approve/reject documents
- ❌ Request additional documents
- ❌ See document upload completion rate

---

## 🚀 What Should Be Built: Admin Participant Management

### 1. Participant List Dashboard

**URL:** `/admin/participants`

**Features:**
- Table showing all participants
- Columns: Name, Email, Phone, NDIS Number, Lead Score, Engagement, Status, Signup Date
- Filters: Status, Engagement Level, Lead Score Range
- Search: Name, Email, Phone
- Sort: By score, date, name
- Actions: View Profile, Email, Update Status, Delete

**Priority:** 🔴 **CRITICAL** - You need to see who signed up

### 2. Participant Profile View

**URL:** `/admin/participants/:id`

**Sections:**

**Overview Card:**
- Name, email, phone
- Lead score with history chart
- Engagement level badge
- Status dropdown (editable)
- Last activity timestamp

**NDIS Information:**
- NDIS number
- SDA category
- Funding level
- Document upload status (3 checkboxes)

**Preferences:**
- Preferred locations (list)
- Budget requirements (bedrooms, bathrooms, max weekly)
- Pathway interest (badges)
- Deposit available

**Documents Section:**
- NDIS Plan: [Download] [View] [Approve/Reject]
- Photo ID: [Download] [View] [Approve/Reject]
- Income Proof: [Download] [View] [Approve/Reject]
- Upload status indicators

**Property Matches:**
- Table of matched properties
- Match score, property name, status
- View match reasons
- Actions: Override score, Remove match

**Activity Timeline:**
- Chronological list of all activities
- Icons for each activity type
- Timestamps
- Filter by activity type

**Actions:**
- Send Email button
- Update Status dropdown
- Add Note (internal)
- Download Profile PDF

**Priority:** 🔴 **CRITICAL** - You need detailed view to qualify leads

### 3. Document Verification Workflow

**URL:** `/admin/participants/:id/documents`

**Features:**
- Document viewer (PDF/image)
- Approve button → sets `ndis_plan_verified: true`
- Reject button → sends email to participant requesting re-upload
- Comments field for internal notes
- Verification history log

**Workflow:**
1. Participant uploads document
2. Admin receives notification (email or dashboard badge)
3. Admin opens document viewer
4. Admin approves or rejects with comment
5. If rejected, participant gets email with reason
6. Status updated in database

**Priority:** 🟡 **HIGH** - Important for compliance/verification

### 4. Match Management Dashboard

**URL:** `/admin/matches`

**Features:**
- View all property-participant matches
- Filter by: Property, Participant, Score Range, Status
- Bulk actions: Create matches, Delete matches
- Override match score manually
- View match reasons explanation
- Match quality analytics

**Analytics:**
- Total matches created
- Average match score
- Conversion rate (suggested → interested)
- Top performing properties
- Properties with no matches

**Priority:** 🟡 **HIGH** - Optimize AI matching

### 5. Communication Tools

**URL:** `/admin/participants/:id/email`

**Features:**
- Email composer with templates
- Template library:
  - Welcome email
  - Match notification
  - Document request
  - Viewing invitation
  - Follow-up reminders
- Merge fields: {name}, {property_name}, {match_score}
- Send test email
- Email history log

**Bulk Email:**
- Select participants by filter (score, engagement, status)
- Send campaign to group
- Track open rates (if using email service)

**Priority:** 🟡 **HIGH** - Essential for lead nurturing

### 6. Analytics Dashboard

**URL:** `/admin/analytics/participants`

**Metrics:**
- Total signups (last 7/30/90 days)
- Lead score distribution (0-20, 21-40, 41-60, 61-80, 81-100)
- Engagement level breakdown (cold/warm/hot)
- Document upload completion rate
- Average time-to-interest
- Conversion funnel: Signup → Profile Complete → Documents Uploaded → Match Viewed → Interested

**Charts:**
- Signups over time (line chart)
- Lead quality pie chart
- Geographic heatmap (preferred locations)
- Property type demand (bar chart)

**Priority:** 🟢 **MEDIUM** - Nice to have, helps optimize marketing

---

## 🛠️ Technical Implementation

### Database Queries Needed

**Get all participants with stats:**
```sql
SELECT
  p.*,
  COUNT(pm.id) as total_matches,
  COUNT(pm.id) FILTER (WHERE pm.match_score >= 80) as excellent_matches,
  COUNT(pm.id) FILTER (WHERE pm.status = 'interested') as interested_count,
  COUNT(la.id) as total_activities,
  MAX(la.created_at) as last_activity
FROM participants p
LEFT JOIN property_matches pm ON p.id = pm.participant_id
LEFT JOIN lead_activities la ON p.id = la.participant_id
GROUP BY p.id
ORDER BY p.created_at DESC;
```

**Get participant activity timeline:**
```sql
SELECT * FROM lead_activities
WHERE participant_id = :participant_id
ORDER BY created_at DESC;
```

**Get participant matches with property details:**
```sql
SELECT
  pm.*,
  p.name,
  p.address,
  p.weekly_rent,
  p.bedrooms,
  p.bathrooms
FROM property_matches pm
JOIN properties p ON pm.property_id = p.id
WHERE pm.participant_id = :participant_id
ORDER BY pm.match_score DESC;
```

### Components to Build

1. **ParticipantList** (similar to PropertyListEnhanced)
2. **ParticipantProfile** (detailed view)
3. **DocumentViewer** (PDF/image viewer with approve/reject)
4. **MatchTable** (property matches for participant)
5. **ActivityTimeline** (activity log component)
6. **EmailComposer** (email sending form)
7. **ParticipantFilters** (filter sidebar)
8. **ParticipantAnalytics** (charts and metrics)

### Routes to Add

```typescript
// In App.tsx
<Route path="/admin/participants" element={
  <ProtectedRoute>
    <AdminParticipants />
  </ProtectedRoute>
} />

<Route path="/admin/participants/:id" element={
  <ProtectedRoute>
    <AdminParticipantProfile />
  </ProtectedRoute>
} />

<Route path="/admin/participants/:id/documents" element={
  <ProtectedRoute>
    <AdminDocumentVerification />
  </ProtectedRoute>
} />

<Route path="/admin/matches" element={
  <ProtectedRoute>
    <AdminMatches />
  </ProtectedRoute>
} />

<Route path="/admin/analytics/participants" element={
  <ProtectedRoute>
    <AdminParticipantAnalytics />
  </ProtectedRoute>
} />
```

---

## 📋 Recommended Build Order

### Phase A: Basic Participant Management (CRITICAL)
**Goal:** See and manage participant leads

1. **Participant List Page** (`/admin/participants`)
   - Table with all participants
   - Basic filters (status, engagement)
   - Search by name/email
   - Click to view profile

2. **Participant Profile Page** (`/admin/participants/:id`)
   - Display all participant data
   - Show NDIS info and preferences
   - List property matches
   - Activity timeline
   - Status update dropdown

**Time Estimate:** 4-6 hours
**Impact:** 🔴 **CRITICAL** - Must have for production

---

### Phase B: Document Verification (HIGH)
**Goal:** Verify uploaded documents

3. **Document Viewer Component**
   - View PDF/image documents
   - Approve/reject buttons
   - Verification status tracking

4. **Document Management in Profile**
   - Show upload status
   - Download links
   - Approve/reject workflow

**Time Estimate:** 3-4 hours
**Impact:** 🟡 **HIGH** - Important for compliance

---

### Phase C: Match Management (HIGH)
**Goal:** Manage AI matching results

5. **Match Management Dashboard** (`/admin/matches`)
   - View all matches
   - Override scores
   - Create manual matches
   - Delete poor matches

6. **Match Quality Analytics**
   - Conversion metrics
   - Top properties
   - Score distribution

**Time Estimate:** 4-5 hours
**Impact:** 🟡 **HIGH** - Optimize AI performance

---

### Phase D: Communication (HIGH)
**Goal:** Email participants

7. **Email Composer**
   - Template library
   - Merge fields
   - Send individual emails

8. **Bulk Email Campaign**
   - Filter participants
   - Send to group
   - Track sending

**Time Estimate:** 5-6 hours
**Impact:** 🟡 **HIGH** - Lead nurturing essential

---

### Phase E: Analytics (MEDIUM)
**Goal:** Understand participant behavior

9. **Analytics Dashboard**
   - Signup charts
   - Conversion funnel
   - Geographic heatmap
   - Lead quality metrics

**Time Estimate:** 4-5 hours
**Impact:** 🟢 **MEDIUM** - Helps optimize marketing

---

## 🚨 Production Blocker Assessment

**Can you go to production WITHOUT participant management?**

**Short answer:** Technically yes, but **NOT RECOMMENDED**.

**Why:**
- Participant portal is live and collecting data
- You have NO WAY to see who signed up without querying database directly
- You can't respond to participant interest in properties
- You can't verify documents (compliance risk)
- You can't nurture leads effectively

**Recommended:** Build **Phase A (Participant List + Profile)** BEFORE going to production with participant portal live.

**Minimum Viable Production:**
- Phase A: Participant List + Profile ✅ (4-6 hours)
- Phase B: Document Verification ✅ (3-4 hours)

**Total Time to Production-Ready:** 7-10 hours of development

---

## 💡 Current Workarounds (Temporary)

Until admin participant management is built, you can:

**View Participants:**
```sql
-- In Supabase SQL Editor
SELECT
  full_name,
  email,
  phone,
  ndis_number,
  lead_score,
  engagement_level,
  status,
  created_at
FROM participants
ORDER BY created_at DESC;
```

**View Specific Participant:**
```sql
SELECT * FROM participants
WHERE email = 'participant@example.com';
```

**View Participant Matches:**
```sql
SELECT
  pm.match_score,
  pm.status,
  p.name,
  p.address
FROM property_matches pm
JOIN properties p ON pm.property_id = p.id
WHERE pm.participant_id = 'uuid-here'
ORDER BY pm.match_score DESC;
```

**Download Documents:**
- Go to Supabase Dashboard → Storage → participant-documents
- Navigate to participant folder (by participant ID)
- Download files manually

**Send Emails:**
- Manually via your email client
- Copy participant email from database

---

## 📊 Summary

**What You Have:**
- ✅ Participant portal (fully functional)
- ✅ Admin property management (fully functional)
- ✅ Data collection (all working correctly)

**What You DON'T Have:**
- ❌ Admin view of participant data
- ❌ Lead management tools
- ❌ Document verification workflow
- ❌ Match quality management
- ❌ Participant communication tools

**Next Steps:**
1. Review this document
2. Decide if Phase A (Participant List + Profile) should be built
3. If yes, I'll build it in auto-mode (4-6 hours)
4. Then optionally add Phase B (Document Verification) for production readiness

**Recommendation:** Build Phase A + B (7-10 hours total) before launching participant portal to real users.

---

**Created:** 2025-10-19
**Priority:** 🔴 **CRITICAL for Production**
