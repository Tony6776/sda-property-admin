# Jotform Auto-Sync Integration Plan

## **Problem Statement**

Currently, when participants fill out Jotform submissions with file attachments:
1. Files remain in Jotform inbox
2. Admin must manually download files
3. Admin must manually upload files to participant profile in SDA system
4. No automatic linking between Jotform submission and participant

**Goal:** Automatically detect Jotform submissions, download attachments, link to correct participant, and upload to their profile.

---

## **Architecture Overview**

```
Jotform Submission → Webhook → Edge Function → AI Matching → Supabase Storage → Participant Documents
```

### **Components:**

1. **Jotform Webhook** - Triggers when new submission received
2. **Supabase Edge Function** - Processes webhook, downloads files
3. **AI Matching Logic** - Identifies which participant the submission belongs to
4. **Storage Upload** - Saves files to `documents` bucket
5. **Database Record** - Links files to participant in `file_uploads` table

---

## **Implementation Steps**

### **Phase 1: Jotform Webhook Setup**

**Jotform Configuration:**
1. Go to Jotform form settings
2. Navigate to **Integrations** → **Webhooks**
3. Add webhook URL: `https://bqvptfdxnrzculgjcnjo.supabase.co/functions/v1/jotform-webhook`
4. Select trigger: **On Form Submit**
5. Include: **All submission data + file URLs**

**Webhook Payload Example:**
```json
{
  "submissionID": "123456789",
  "formID": "987654321",
  "answers": {
    "1": {
      "name": "fullName",
      "answer": "Jessica Teasdale",
      "type": "control_fullname"
    },
    "2": {
      "name": "email",
      "answer": "jessica@example.com",
      "type": "control_email"
    },
    "3": {
      "name": "ndisNumber",
      "answer": "4301234567",
      "type": "control_textbox"
    },
    "4": {
      "name": "documentUpload",
      "answer": [
        "https://www.jotform.com/uploads/file123.pdf"
      ],
      "type": "control_fileupload"
    }
  }
}
```

---

### **Phase 2: Edge Function Implementation**

**Create:** `supabase/functions/jotform-webhook/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Parse Jotform webhook payload
    const payload = await req.json()

    // Extract submission data
    const submissionID = payload.submissionID
    const answers = payload.answers

    // Extract participant info
    const fullName = answers["1"]?.answer || ""
    const email = answers["2"]?.answer || ""
    const ndisNumber = answers["3"]?.answer || ""
    const fileUrls = answers["4"]?.answer || []

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Step 1: Find matching participant
    const participant = await findParticipant(supabase, {
      name: fullName,
      email,
      ndisNumber
    })

    if (!participant) {
      console.warn('No matching participant found', { fullName, email, ndisNumber })
      return new Response(JSON.stringify({
        success: false,
        error: 'Participant not found'
      }), { status: 404 })
    }

    // Step 2: Download and upload files
    const uploadedFiles = []

    for (const fileUrl of fileUrls) {
      try {
        // Download file from Jotform
        const fileResponse = await fetch(fileUrl)
        const fileBlob = await fileResponse.blob()
        const fileName = fileUrl.split('/').pop() || 'document.pdf'

        // Categorize file using AI
        const category = await categorizeFile(fileName)

        // Upload to Supabase Storage
        const storagePath = `participant/${participant.id}/${category}/${Date.now()}_${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, fileBlob)

        if (uploadError) throw uploadError

        // Save to file_uploads table
        const { data: fileRecord, error: dbError } = await supabase
          .from('file_uploads')
          .insert({
            original_filename: fileName,
            storage_path: storagePath,
            file_category: category,
            entity_type: 'participant',
            entity_id: participant.id,
            ai_detected_type: category,
            ai_confidence: 85,
            ai_processed: true,
            source: 'jotform',
            source_submission_id: submissionID,
          })
          .select()
          .single()

        if (dbError) throw dbError

        uploadedFiles.push(fileRecord)

      } catch (error) {
        console.error('Failed to process file', { fileUrl, error })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      participant_id: participant.id,
      files_uploaded: uploadedFiles.length
    }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})

// Helper: Find participant by name, email, or NDIS number
async function findParticipant(supabase, data) {
  // Try exact NDIS number match first
  if (data.ndisNumber) {
    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .eq('ndis_number', data.ndisNumber)
      .limit(1)

    if (participants?.length > 0) return participants[0]
  }

  // Try email match
  if (data.email) {
    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .ilike('email', data.email)
      .limit(1)

    if (participants?.length > 0) return participants[0]
  }

  // Try fuzzy name match
  if (data.name) {
    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .ilike('name', `%${data.name}%`)
      .limit(1)

    if (participants?.length > 0) return participants[0]
  }

  return null
}

// Helper: Categorize file (same logic as SmartFileUpload)
async function categorizeFile(filename) {
  const lowerName = filename.toLowerCase()

  if (lowerName.includes('lease') || lowerName.includes('rental')) {
    return 'lease_agreement'
  }
  if (lowerName.includes('ndis') || lowerName.includes('plan')) {
    return 'ndis_plan'
  }
  if (lowerName.includes('id') || lowerName.includes('license')) {
    return 'participant_id'
  }
  if (lowerName.includes('income') || lowerName.includes('payslip')) {
    return 'income_proof'
  }

  return 'other'
}
```

---

### **Phase 3: Database Schema Updates**

Add `source` and `source_submission_id` to `file_uploads` table:

```sql
ALTER TABLE file_uploads
ADD COLUMN source text CHECK (source IN ('manual', 'jotform', 'email', 'api')),
ADD COLUMN source_submission_id text,
ADD COLUMN jotform_form_id text;

CREATE INDEX idx_file_uploads_source ON file_uploads(source);
CREATE INDEX idx_file_uploads_submission ON file_uploads(source_submission_id);
```

---

### **Phase 4: Deployment**

**Deploy Edge Function:**
```bash
cd supabase/functions
supabase functions deploy jotform-webhook --no-verify-jwt
```

**Set Environment Variables:**
```bash
supabase secrets set SUPABASE_URL=https://bqvptfdxnrzculgjcnjo.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

**Test Webhook:**
```bash
curl -X POST https://bqvptfdxnrzculgjcnjo.supabase.co/functions/v1/jotform-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "submissionID": "test123",
    "formID": "form123",
    "answers": {
      "1": {"answer": "Jessica Teasdale"},
      "2": {"answer": "jessica@example.com"},
      "3": {"answer": "4301234567"},
      "4": {"answer": ["https://example.com/file.pdf"]}
    }
  }'
```

---

### **Phase 5: Admin UI Enhancements**

**Show Jotform Source Badge in DocumentTabs:**

```tsx
// In DocumentTabs.tsx, add source badge
{doc.source === 'jotform' && (
  <Badge variant="outline" className="text-blue-600">
    From Jotform
  </Badge>
)}
```

**Add Jotform Sync Status Card to Dashboard:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Jotform Auto-Sync</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Last Sync:</span>
        <Badge variant="default">2 minutes ago</Badge>
      </div>
      <div className="flex justify-between">
        <span>Files Synced Today:</span>
        <span className="font-semibold">15</span>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## **Testing Plan**

1. **Unit Tests:**
   - Test participant matching logic
   - Test file categorization
   - Test error handling

2. **Integration Tests:**
   - Submit test Jotform with file
   - Verify webhook receives payload
   - Verify file downloads from Jotform
   - Verify file uploads to Supabase
   - Verify database record created
   - Verify file appears in participant Documents tab

3. **Edge Cases:**
   - Participant not found → Log error, notify admin
   - File download fails → Retry 3 times
   - Duplicate submission → Check if file already exists
   - Invalid file type → Skip file, log warning

---

## **Security Considerations**

1. **Webhook Authentication:**
   - Validate webhook signature from Jotform
   - Or use secret token in URL parameter

2. **File Validation:**
   - Check file size (max 10MB)
   - Check file type (PDF, images only)
   - Scan for malware (optional)

3. **Participant Privacy:**
   - Use service_role key securely
   - Don't log sensitive data
   - Respect RLS policies

---

## **Monitoring & Alerts**

**Create `jotform_sync_logs` table:**

```sql
CREATE TABLE jotform_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id text NOT NULL,
  participant_id uuid REFERENCES participants(id),
  files_synced integer DEFAULT 0,
  status text CHECK (status IN ('success', 'error', 'partial')),
  error_message text,
  created_at timestamptz DEFAULT now()
);
```

**Dashboard Metrics:**
- Sync success rate
- Average files per submission
- Failed syncs requiring manual intervention

---

## **Future Enhancements**

1. **Bi-directional Sync:**
   - Update Jotform status when admin approves document
   - Send email notifications via Jotform

2. **Advanced Matching:**
   - Use AI/ML for fuzzy name matching
   - Match by phone number, address

3. **Multi-Form Support:**
   - Different forms for different document types
   - Map form fields to participant fields

4. **Retry Queue:**
   - Failed syncs go to retry queue
   - Admin can manually retry or approve matches

---

## **Immediate Next Steps**

1. ✅ **Create storage bucket** (prerequisite)
2. ✅ **Apply database migration** (prerequisite)
3. 📝 **Create Edge Function** (development task)
4. 🔗 **Configure Jotform webhook** (configuration task)
5. ✅ **Test with sample submission** (testing task)
6. 🚀 **Deploy to production** (deployment task)

---

**Estimated Time:** 4-6 hours development + 2 hours testing

**Dependencies:**
- Supabase Edge Functions enabled
- Jotform API access
- Storage bucket configured
- Database schema updated
