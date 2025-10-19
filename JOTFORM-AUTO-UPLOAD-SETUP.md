# Jotform Automatic File Upload - Setup Guide

## ✅ System Overview

**What This Does:**
- Participant fills Jotform with file attachment
- Webhook triggers automatically
- Edge Function downloads file from Jotform
- AI categorizes the file
- System matches participant by NDIS number / email / name
- File uploads to Supabase Storage
- File appears in participant's Documents tab
- Badge shows "From Jotform"

**No more manual downloading and re-uploading!**

---

## 🚀 Deployment Steps

### Step 1: Deploy to Supabase (Auto-Complete via GitHub)

1. Go to GitHub Actions: https://github.com/Tony6776/sda-property-admin/actions
2. Click **"Deploy Jotform Integration"** workflow
3. Click **"Run workflow"**
4. Type **"DEPLOY"** in the confirmation box
5. Click green **"Run workflow"** button
6. Wait ~2 minutes for deployment

**What gets deployed:**
- ✅ Storage bucket "documents" created
- ✅ Storage policies configured
- ✅ file_uploads table updated
- ✅ jotform-extractor Edge Function deployed

---

## 📝 Jotform Webhook Setup

### For Each Form with File Uploads:

**Example: "Participant Intake Form"**

1. **Go to Jotform:** https://www.jotform.com/myforms
2. **Open the form** you want to connect
3. **Settings** → **Integrations** → Search for **"Webhooks"**
4. **Click "Webhooks"** to add integration
5. **Add webhook URL:**
   ```
   https://bqvptfdxnrzculgjcnjo.supabase.co/functions/v1/jotform-extractor
   ```
6. **Method:** POST ✅
7. **Format:** JSON ✅
8. **When to send:** On form submit ✅
9. **Click Save**

**IMPORTANT:** This is a SECOND webhook - keep your existing n8n webhook!

**Both webhooks will trigger:**
- Webhook 1: `https://homelandersda.app.n8n.cloud/webhook/sda-lead-intake` (existing - for Airtable)
- Webhook 2: `https://bqvptfdxnrzculgjcnjo.supabase.co/functions/v1/jotform-extractor` (new - for file uploads)

---

## 🧪 Testing

### Test the Integration:

1. **Fill out a Jotform that has file upload**
   - Use a test participant name (e.g., "Jessica Teasdale")
   - Upload a test file (e.g., "NDIS_Plan.pdf")
   - Submit the form

2. **Check Edge Function Logs**
   - Go to: https://supabase.com/dashboard/project/bqvptfdxnrzculgjcnjo/functions/jotform-extractor/invocations
   - Look for recent invocation
   - Should show: "✅ Found participant", "✅ Uploaded to storage", "✅ Saved to database"

3. **Check Admin Dashboard**
   - Go to: http://sda-property-admin.s3-website-us-west-2.amazonaws.com/admin/participants
   - Click on the participant
   - Go to **Documents** tab
   - You should see the file with a "From Jotform" badge

---

## 📊 How It Works

### Participant Matching Logic:

The Edge Function tries to match the Jotform submission to an existing participant:

1. **NDIS Number** (most accurate)
   - If NDIS number in form matches database → ✅ Match
2. **Email** (second best)
   - If email in form matches database → ✅ Match
3. **Name** (fuzzy match)
   - If name in form is similar to database name → ✅ Match

**If no match:** File is not uploaded (logged as warning)

**Solution:** Make sure participant exists in database first, OR create them from Jotform data

---

## 🤖 AI File Categorization

Files are automatically categorized based on filename:

| Filename Contains | Category | Confidence |
|---|---|---|
| "lease", "rental" | Lease Agreement | 92% |
| "ndis", "plan" | NDIS Plan | 95% |
| "id", "license", "passport" | Participant ID | 88% |
| "income", "payslip", "bank" | Income Proof | 85% |
| "compliance", "certificate" | Compliance Certificate | 90% |
| "photo", "image", ".jpg", ".png" | Property Photo | 75% |
| Other | Other Document | 50% |

---

## 🔍 Troubleshooting

### Problem: Files not uploading

**Check Edge Function Logs:**
```
https://supabase.com/dashboard/project/bqvptfdxnrzculgjcnjo/functions/jotform-extractor/invocations
```

**Common Issues:**

1. **"No matching participant found"**
   - Participant doesn't exist in database
   - Name/email/NDIS number doesn't match
   - Solution: Create participant first OR improve matching logic

2. **"Storage bucket 'documents' not found"**
   - Migration not applied
   - Solution: Run deployment workflow again

3. **"Permission denied"**
   - Storage policies not configured
   - Solution: Check migration was applied correctly

4. **"Failed to download file"**
   - Jotform file URL expired or invalid
   - Solution: Check Jotform file upload settings

---

## 📋 Which Forms Should Have This Webhook?

Add the webhook to any form that:
- ✅ Has file upload fields
- ✅ Is for participants (not investors or landlords)
- ✅ Needs automatic document management

**Examples:**
- Participant Intake Form
- NDIS Plan Upload Form
- Document Submission Form
- Participant Registration Form

**Don't add to:**
- Forms without file uploads
- Internal admin forms
- Quick contact forms

---

## 🎯 Expected Behavior

**When participant submits form with file:**

1. Jotform receives submission
2. Two webhooks trigger simultaneously:
   - n8n webhook → Airtable (creates lead)
   - Supabase webhook → File upload (saves document)
3. Edge Function:
   - Downloads file from Jotform
   - Finds matching participant
   - Categorizes file with AI
   - Uploads to Supabase Storage
   - Creates database record
4. Admin sees:
   - File appears in participant Documents tab
   - Badge shows "From Jotform"
   - All details: filename, size, date, category
   - Can download, approve, or reject

**Timeline:** 2-5 seconds from submission to appearing in admin dashboard

---

## 📊 Monitoring

**Check Integration Health:**

1. **Edge Function Stats**
   - Go to: https://supabase.com/dashboard/project/bqvptfdxnrzculgjcnjo/functions
   - Check "jotform-extractor" invocations
   - Success rate should be >90%

2. **Storage Usage**
   - Go to: https://supabase.com/dashboard/project/bqvptfdxnrzculgjcnjo/storage/buckets/documents
   - Monitor storage usage
   - Files should be organized by participant

3. **Database Records**
   - Check file_uploads table
   - Filter by source = 'jotform'
   - Should match number of form submissions

---

## 🔐 Security Notes

- ✅ Files stored in private bucket (not public)
- ✅ Only authenticated users can access
- ✅ Service role key used by Edge Function (secure)
- ✅ File size limited to 10MB
- ✅ Only allowed file types accepted
- ✅ No sensitive data logged

---

## 📞 Support

**If you need help:**

1. Check Edge Function logs
2. Check GitHub Actions deployment logs
3. Verify webhook is configured in Jotform
4. Test with a simple submission
5. Contact development team with:
   - Submission ID
   - Form ID
   - Error message from logs

---

## ✅ Quick Checklist

Before going live:

- [ ] Deployment completed successfully
- [ ] Storage bucket exists
- [ ] Storage policies configured
- [ ] Edge Function deployed
- [ ] Webhook added to Jotform forms
- [ ] Test submission successful
- [ ] File appears in admin dashboard
- [ ] AI categorization working
- [ ] Participant matching working

**Ready to go!** 🚀
