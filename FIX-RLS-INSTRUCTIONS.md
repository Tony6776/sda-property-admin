# Fix RLS Policy Error - Jobs Table

## Problem
Creating jobs fails with error:
```
Failed to create job: new row violates row-level security policy for table "jobs"
```

## Root Cause
The RLS policies on the `jobs` table reference an `admin_users` table that doesn't exist.

## Solution

Apply the SQL fix using **ONE** of these methods:

---

### Method 1: Supabase Dashboard (FASTEST) ⭐

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/bqvptfdxnrzculgjcnjo/sql/new

2. **Paste this SQL:**

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin users can view jobs in their organization" ON jobs;
DROP POLICY IF EXISTS "Admin users can insert jobs in their organization" ON jobs;
DROP POLICY IF EXISTS "Admin users can update jobs in their organization" ON jobs;

-- Create simpler policies for authenticated users
CREATE POLICY "Authenticated users can view all jobs"
  ON jobs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND organization_id = 'plcg'
  );

CREATE POLICY "Authenticated users can update jobs"
  ON jobs FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND organization_id = 'plcg'
  );

CREATE POLICY "Authenticated users can delete jobs"
  ON jobs FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND organization_id = 'plcg'
  );
```

3. **Click "Run"**

4. **Test job creation** - go to `/admin/jobs/new` and create a job

---

### Method 2: Via Command Line (if you have DB password)

```bash
PGPASSWORD="YOUR_DB_PASSWORD" /opt/homebrew/opt/postgresql@16/bin/psql \
  -h aws-0-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.bqvptfdxnrzculgjcnjo \
  -d postgres \
  -f supabase/migrations/20251019_temp_fix_jobs_rls.sql
```

---

### Method 3: GitHub Actions (if DB password secret is set)

1. **Set GitHub secret** (if not already set):
```bash
gh secret set SUPABASE_DB_PASSWORD
```

2. **Run the workflow:**
```bash
gh workflow run fix-rls-policies.yml -f confirm=FIX
```

---

## What This Fix Does

- **Removes** policies that require `admin_users` table
- **Adds** simpler policies: any authenticated user can manage jobs
- **Maintains** organization_id = 'plcg' requirement for write operations
- **Allows** job creation to work immediately

## After Applying

1. Hard refresh admin panel (Cmd+Shift+R)
2. Try creating a job at: `/admin/jobs/new`
3. Should work without RLS errors

## Files Reference

- SQL fix: `supabase/migrations/20251019_temp_fix_jobs_rls.sql`
- Full admin_users solution: `supabase/migrations/20251019_fix_rls_admin_users.sql` (optional, for later)
- Workflow: `.github/workflows/fix-rls-policies.yml`

---

**Status:** ✅ Committed to GitHub (commit 9b2357d)
**Next:** Apply SQL via dashboard then test job creation
