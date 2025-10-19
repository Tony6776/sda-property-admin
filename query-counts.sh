#!/bin/bash

# Query all Supabase tables for record counts

ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdnB0ZmR4bnJ6Y3VsZ2pjbmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjY5NDAsImV4cCI6MjA2OTgwMjk0MH0.I10e1TQkVntpEm3KSXmydNJQLbhJQ3MU4SyMt1lOvOk"
BASE_URL="https://bqvptfdxnrzculgjcnjo.supabase.co/rest/v1"

echo "🔍 Auditing Supabase Database..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

query_table() {
  local table=$1
  local response=$(curl -s "$BASE_URL/$table?select=count" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Range: 0-0" \
    -H "Prefer: count=exact" \
    -D - 2>&1)

  local count=$(echo "$response" | grep -i "content-range" | sed 's/.*\///' | tr -d '\r')

  if [ -z "$count" ]; then
    echo "  ❌ $table: Error querying"
  elif [ "$count" = "0" ]; then
    echo "  ⚪ $table: 0 records"
  else
    echo "  ✅ $table: $count records"
  fi
}

# Query all tables
query_table "participants"
query_table "properties"
query_table "landlords"
query_table "investors"
query_table "jobs"
query_table "job_investors"
query_table "file_uploads"
query_table "document_extractions"
query_table "ai_actions"
query_table "ai_recommendations"
query_table "organizations"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Audit complete!"
