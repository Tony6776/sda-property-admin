# Participant Portal - User Testing Guide

**Status:** 🚀 Live on Production
**URL:** https://tony6776.github.io/sda-property-admin

---

## 🎯 What to Test

You now have a complete **Participant Self-Service Portal** where NDIS participants can:
- Sign up for an account
- See AI-matched properties
- Upload documents
- Track their homeownership journey

This is **Phase 2** of the SDA market dominance strategy.

---

## ✅ Prerequisites (One-Time Setup)

Before testing, you need to create the Supabase storage bucket for document uploads.

### Step 1: Create Storage Bucket

1. Go to https://supabase.com/dashboard/project/bqvptfdxnrzculgjcnjo/storage/buckets
2. Click **"New Bucket"**
3. Settings:
   - **Name:** `participant-documents`
   - **Public:** Leave unchecked (private)
   - **File size limit:** 10MB
   - **Allowed MIME types:** Leave empty (allow all)
4. Click **"Create bucket"**

### Step 2: Set Bucket Policies

1. Click on `participant-documents` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"** → **"For full customization"**
4. **Policy name:** `Participants can upload their own documents`
5. **Target roles:** `authenticated`
6. **Policy definition:**
   ```sql
   -- Allow authenticated users to upload to their own folder
   CREATE POLICY "Users can upload own documents"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'participant-documents' AND
     (storage.foldername(name))[1] IN (
       SELECT id::text FROM participants WHERE user_id = auth.uid()
     )
   );

   -- Allow users to read their own documents
   CREATE POLICY "Users can read own documents"
   ON storage.objects
   FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'participant-documents' AND
     (storage.foldername(name))[1] IN (
       SELECT id::text FROM participants WHERE user_id = auth.uid()
     )
   );
   ```
6. Click **"Create policy"**

---

## 🧪 Test Flow (Complete User Journey)

### **Test 1: Participant Signup**

1. Go to https://tony6776.github.io/sda-property-admin/participant/signup
2. Fill in form:
   - **Full Name:** John Smith
   - **Email:** john.smith+test@gmail.com (use your real email)
   - **Phone:** 0400123456
   - **Password:** Password123
   - **Confirm Password:** Password123
3. Click **"Create Account"**
4. **Expected:** Success message + redirect to login
5. **Check email:** You should receive verification email from Supabase

✅ **Success Criteria:** Account created, email received

---

### **Test 2: Email Verification**

1. Open verification email from Supabase
2. Click verification link
3. **Expected:** Email confirmed

✅ **Success Criteria:** Email verified

---

### **Test 3: Participant Login**

1. Go to https://tony6776.github.io/sda-property-admin/participant/login
2. Enter:
   - **Email:** john.smith+test@gmail.com
   - **Password:** Password123
3. Click **"Sign In"**
4. **Expected:** Redirect to dashboard

✅ **Success Criteria:** Logged in, dashboard loads

---

### **Test 4: Dashboard Overview**

You should see:

**Header:**
- "Welcome back, John!"
- Status badge (Getting Started)
- Profile button
- Sign Out button

**Journey Progress:**
- Progress bar showing ~20% (just signed up)
- Checkboxes showing incomplete items

**Quick Stats:**
- Your Matches: 0 (or more if properties exist)
- Saved Properties: 0
- Applications: 0

**Next Steps:**
- Upload NDIS Plan
- Upload ID Document
- Set Location Preferences
- View My Property Matches

✅ **Success Criteria:** Dashboard displays correctly with your name

---

### **Test 5: Complete Profile**

1. Click **"Profile"** button (top right) or **"Set Location Preferences"**
2. Fill in NDIS information:
   - **NDIS Number:** NDIS12345678
   - **SDA Category:** Fully Accessible
   - **Weekly SDA Funding:** 850
3. Select locations (check at least 2):
   - Melbourne CBD
   - Melbourne East
4. Enter budget:
   - **Maximum Weekly Budget:** 850
   - **Minimum Bedrooms:** 2
   - **Minimum Bathrooms:** 1
5. Select pathway interest (check 1 or more):
   - Deposit Ready
   - Rent to Buy
6. If "Deposit Ready" checked:
   - **Deposit Available:** 50000
7. Click **"Save Profile"**
8. **Expected:** "Profile updated successfully!" message

✅ **Success Criteria:** Profile saved, progress bar increases to ~40-50%

---

### **Test 6: Upload Documents**

1. Go back to **Dashboard**
2. Click **"Upload NDIS Plan"** button
3. You should see **Documents** page with 3 sections:
   - NDIS Plan (circle icon)
   - Photo ID (circle icon)
   - Income Proof (circle icon)

#### Upload NDIS Plan:
1. Click or drag file to **"Upload NDIS Plan"** area
2. Choose any PDF/JPG file
3. **Expected:** "Document uploaded successfully!" message
4. Icon changes to green checkmark
5. Progress: 1/3 complete

#### Upload Photo ID:
1. Click **"Upload ID Document"**
2. Choose any PDF/JPG file
3. **Expected:** Success message
4. Progress: 2/3 complete

#### Upload Income Proof:
1. Click **"Upload Income Proof"**
2. Choose any PDF/JPG file
3. **Expected:** Success message
4. Progress: 3/3 complete
5. Green banner appears: "All documents uploaded!"

✅ **Success Criteria:** All 3 documents uploaded, progress shows 3/3

---

### **Test 7: View Property Matches**

1. Go back to **Dashboard**
2. Click **"View My Property Matches"** or click on **"Your Matches"** card
3. You should see the **Matches** page

**If you have properties in database:**
- Properties displayed as cards
- Each card shows:
  - Property image
  - Match score badge (e.g., "85% Match")
  - Property name & address
  - Bedrooms, bathrooms, weekly rent
  - Match reasons (why it's a good match)
  - Action buttons ("Mark as Viewed", "I'm Interested")

**Filter tabs:**
- All Matches
- Excellent (80+ score)
- Good (60-79 score)

**If no properties:**
- "No Matches Yet" message
- "Complete Profile" button

✅ **Success Criteria:** Matches page loads (with or without properties)

---

### **Test 8: Interact with Match**

(If you have property matches)

1. Click **"Mark as Viewed"** on a property
2. **Expected:** "Marked as viewed" message
3. Button changes to **"I'm Interested"**

4. Click **"I'm Interested"**
5. **Expected:** "Marked as interested! Our team will contact you soon."
6. Badge appears: "You're interested - We'll contact you soon"

✅ **Success Criteria:** Property status updates correctly

---

### **Test 9: Journey Progress**

1. Go back to **Dashboard**
2. Check progress bar - should now show ~80-90% or 100%

**Progress breakdown:**
- ✅ Profile created (20%)
- ✅ NDIS plan uploaded (10%)
- ✅ ID uploaded (10%)
- ✅ Income proof uploaded (10%)
- ✅ Locations set (10%)
- ✅ Budget set (10%)
- ✅ Matches found (10%)
- ✅ Excellent matches found (10%)

✅ **Success Criteria:** Progress reflects completed actions

---

### **Test 10: Sign Out**

1. Click **"Sign Out"** button
2. **Expected:** Redirected to login page
3. Try accessing `/participant/dashboard` directly
4. **Expected:** Redirected to login (protected route working)

✅ **Success Criteria:** Signed out successfully, routes protected

---

## 📊 Admin View (Check Data in Supabase)

To verify data was saved correctly:

1. Go to https://supabase.com/dashboard/project/bqvptfdxnrzculgjcnjo/editor

### Check Participants Table:
```sql
SELECT
  full_name,
  email,
  phone,
  ndis_number,
  sda_category,
  sda_funding_level,
  preferred_locations,
  max_weekly_budget,
  lead_score,
  engagement_level,
  status,
  ndis_plan_uploaded,
  id_uploaded,
  income_proof_uploaded
FROM participants
WHERE email = 'john.smith+test@gmail.com';
```

**Expected:**
- All fields populated
- `lead_score` should be 60-70 (auto-calculated)
- `engagement_level` should be "warm" or "hot"
- All `*_uploaded` fields should be `true`

### Check Lead Activities:
```sql
SELECT
  activity_type,
  activity_data,
  created_at
FROM lead_activities
WHERE participant_id IN (
  SELECT id FROM participants WHERE email = 'john.smith+test@gmail.com'
)
ORDER BY created_at DESC;
```

**Expected activities:**
- `signup_completed`
- `login`
- `profile_updated`
- `document_uploaded` (x3)
- `match_viewed` (if you viewed a property)

### Check Property Matches:
```sql
SELECT
  pm.match_score,
  pm.match_reasons,
  pm.status,
  p.name as property_name
FROM property_matches pm
JOIN properties p ON pm.property_id = p.id
WHERE pm.participant_id IN (
  SELECT id FROM participants WHERE email = 'john.smith+test@gmail.com'
)
ORDER BY pm.match_score DESC;
```

**Expected:**
- Matches with scores 40-100
- `match_reasons` JSON array explaining why
- `status` reflects actions (suggested/viewed/interested)

---

## 🐛 Troubleshooting

### "Failed to upload document"
- **Cause:** Storage bucket not created
- **Fix:** Follow Prerequisites Step 1-2 above

### "No matches found"
- **Cause:** No properties in database OR no matches with score >= 60
- **Fix:** Add properties via admin portal OR adjust participant profile to match existing properties

### "Failed to load profile"
- **Cause:** Participant record not created
- **Check:** Supabase → participants table → verify record exists

### Email not received
- **Check:** Spam folder
- **Check:** Supabase → Authentication → Email Templates → Confirm signup template enabled

### Dashboard shows 0% progress
- **Cause:** Lead score not calculated
- **Fix:** Run manual calculation:
  ```sql
  UPDATE participants
  SET lead_score = calculate_participant_lead_score(id)
  WHERE email = 'john.smith+test@gmail.com';
  ```

---

## 🎯 Success Metrics

After completing all tests, you should have:

- ✅ **1 participant account** created and verified
- ✅ **Lead score:** 60-80 (auto-calculated)
- ✅ **Documents:** 3/3 uploaded
- ✅ **Profile:** 100% complete
- ✅ **Matches:** 0+ (depends on property inventory)
- ✅ **Activities:** 5+ logged events
- ✅ **Progress:** 80-100%

---

## 📝 Provide Feedback

After testing, please note:

### What worked well:
- [ ] Signup process
- [ ] Dashboard loads correctly
- [ ] Profile saves successfully
- [ ] Documents upload
- [ ] Matches display
- [ ] Progress tracking

### Issues found:
- [ ] Error messages encountered
- [ ] Confusing UI/UX
- [ ] Missing features
- [ ] Performance problems

### Improvements needed:
- [ ] Additional fields needed
- [ ] Better explanations
- [ ] More guidance
- [ ] Design changes

---

## 🚀 Next Steps

Once you've tested and provided feedback, we'll proceed to:

**Phase 3: Investor Portal**
- Investor signup/login
- Market intelligence dashboard
- ROI calculator
- Property opportunities with demand scores
- Portfolio tracker

**Phase 4: Automation**
- Automated email campaigns (match notifications, follow-ups)
- AI matching runs nightly
- Lead scoring updates automatically
- Engagement level tracking

---

**Testing Status:** Ready for User Testing
**Deployed:** https://tony6776.github.io/sda-property-admin

*Complete testing and provide feedback to proceed to Phase 3!* 🎉
