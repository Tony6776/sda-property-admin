#!/bin/bash

# Multi-Tenancy Migration Runner
# Run this script to apply the multi-tenant architecture to Supabase

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}SDA Multi-Tenancy Migration${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Database connection details
DB_HOST="aws-0-ap-southeast-2.pooler.supabase.com"
DB_PORT="6543"
DB_USER="postgres.bqvptfdxnrzculgjcnjo"
DB_NAME="postgres"
DB_PASSWORD="SimpleBusiness2024!"

# Path to migration file
MIGRATION_FILE="database/migrations/001-add-multi-tenancy.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
  exit 1
fi

echo -e "${YELLOW}⚠️  This will modify your Supabase database schema${NC}"
echo -e "${YELLOW}Database: $DB_HOST${NC}"
echo ""
echo -e "Changes to be applied:"
echo -e "  • Create organizations table (Homelander, PLCG, Channel Agent)"
echo -e "  • Add multi-tenancy columns to properties"
echo -e "  • Enable Row Level Security (RLS)"
echo -e "  • Create admin_users table"
echo -e "  • Create audit_log table"
echo -e "  • Update existing data with audience tags"
echo ""
read -p "Do you want to proceed? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo -e "${YELLOW}Migration cancelled.${NC}"
  exit 0
fi

echo -e "${BLUE}Running migration...${NC}"
echo ""

# Run the migration using full path to psql
PGPASSWORD="$DB_PASSWORD" /opt/homebrew/opt/postgresql@16/bin/psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}============================================${NC}"
  echo -e "${GREEN}✅ Migration completed successfully!${NC}"
  echo -e "${GREEN}============================================${NC}"
  echo ""
  echo -e "Next steps:"
  echo -e "  1. Verify organizations: ${BLUE}SELECT * FROM organizations;${NC}"
  echo -e "  2. Check property updates: ${BLUE}SELECT id, name, organization_id, audience FROM properties LIMIT 5;${NC}"
  echo -e "  3. Test admin dashboard with new schema"
  echo ""
else
  echo ""
  echo -e "${RED}============================================${NC}"
  echo -e "${RED}❌ Migration failed!${NC}"
  echo -e "${RED}============================================${NC}"
  exit 1
fi
