/**
 * NUCLEUS MCP CONNECTOR
 *
 * Single source of truth connecting:
 * 1. SDA Property Admin (Frontend/Backend)
 * 2. Remote MCP Server (Claude Mobile/Desktop access)
 * 3. Master MCP Orchestrator (AI Agent coordination)
 * 4. All Supabase Edge Functions
 *
 * This file enables seamless AI integration across all platforms
 */

const SDA_SUPABASE_URL = "https://bqvptfdxnrzculgjcnjo.supabase.co";
const SDA_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdnB0ZmR4bnJ6Y3VsZ2pjbmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjY5NDAsImV4cCI6MjA2OTgwMjk0MH0.I10e1TQkVntpEm3KSXmydNJQLbhJQ3MU4SyMt1lOvOk";
const SDA_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdnB0ZmR4bnJ6Y3VsZ2pjbmpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIyNjk0MCwiZXhwIjoyMDY5ODAyOTQwfQ.3s8fFVrDyJmMwbpo9OXx03GyV5JT3M8sVEUAV8_qhh4";

const REMOTE_MCP_URL = "https://smartceo.com.au";
const MASTER_ORCHESTRATOR_URL = `${SDA_SUPABASE_URL}/functions/v1/master-mcp-orchestrator`;

export interface NucleusResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source?: 'sda-admin' | 'remote-mcp' | 'orchestrator' | 'edge-function';
  timestamp?: string;
}

/**
 * CORE NUCLEUS FUNCTIONS
 */

export const nucleus = {
  /**
   * Get participant data with AI enrichment
   */
  async getParticipant(participantId: string): Promise<NucleusResponse> {
    try {
      const response = await fetch(`${SDA_SUPABASE_URL}/rest/v1/participants?id=eq.${participantId}`, {
        headers: {
          'apikey': SDA_ANON_KEY,
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch participant');

      const data = await response.json();
      return {
        success: true,
        data: data[0],
        source: 'sda-admin',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'sda-admin',
      };
    }
  },

  /**
   * Get all participants (for AI agents)
   */
  async getAllParticipants(filters?: { status?: string; limit?: number }): Promise<NucleusResponse> {
    try {
      let url = `${SDA_SUPABASE_URL}/rest/v1/participants?select=*`;

      if (filters?.status) url += `&status=eq.${filters.status}`;
      if (filters?.limit) url += `&limit=${filters.limit}`;

      const response = await fetch(url, {
        headers: {
          'apikey': SDA_ANON_KEY,
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch participants');

      const data = await response.json();
      return {
        success: true,
        data,
        source: 'sda-admin',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'sda-admin',
      };
    }
  },

  /**
   * Get landlord data
   */
  async getLandlord(landlordId: string): Promise<NucleusResponse> {
    try {
      const response = await fetch(`${SDA_SUPABASE_URL}/rest/v1/landlords?id=eq.${landlordId}`, {
        headers: {
          'apikey': SDA_ANON_KEY,
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch landlord');

      const data = await response.json();
      return {
        success: true,
        data: data[0],
        source: 'sda-admin',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'sda-admin',
      };
    }
  },

  /**
   * Get all landlords
   */
  async getAllLandlords(filters?: { ndis_registered?: boolean }): Promise<NucleusResponse> {
    try {
      let url = `${SDA_SUPABASE_URL}/rest/v1/landlords?select=*`;

      if (filters?.ndis_registered !== undefined) {
        url += `&ndis_registered=eq.${filters.ndis_registered}`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': SDA_ANON_KEY,
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch landlords');

      const data = await response.json();
      return {
        success: true,
        data,
        source: 'sda-admin',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'sda-admin',
      };
    }
  },

  /**
   * Get investor data
   */
  async getInvestor(investorId: string): Promise<NucleusResponse> {
    try {
      const response = await fetch(`${SDA_SUPABASE_URL}/rest/v1/investors?id=eq.${investorId}`, {
        headers: {
          'apikey': SDA_ANON_KEY,
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch investor');

      const data = await response.json();
      return {
        success: true,
        data: data[0],
        source: 'sda-admin',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'sda-admin',
      };
    }
  },

  /**
   * Get all properties with optional filters
   */
  async getProperties(filters?: {
    status?: string;
    visible_on_participant_site?: boolean;
    limit?: number;
  }): Promise<NucleusResponse> {
    try {
      let url = `${SDA_SUPABASE_URL}/rest/v1/properties?select=*`;

      if (filters?.status) url += `&status=eq.${filters.status}`;
      if (filters?.visible_on_participant_site !== undefined) {
        url += `&visible_on_participant_site=eq.${filters.visible_on_participant_site}`;
      }
      if (filters?.limit) url += `&limit=${filters.limit}`;

      const response = await fetch(url, {
        headers: {
          'apikey': SDA_ANON_KEY,
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch properties');

      const data = await response.json();
      return {
        success: true,
        data,
        source: 'sda-admin',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'sda-admin',
      };
    }
  },

  /**
   * Get PLCG jobs (investment opportunities)
   */
  async getJobs(filters?: { status?: string }): Promise<NucleusResponse> {
    try {
      let url = `${SDA_SUPABASE_URL}/rest/v1/jobs?select=*`;

      if (filters?.status) url += `&status=eq.${filters.status}`;

      const response = await fetch(url, {
        headers: {
          'apikey': SDA_ANON_KEY,
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      return {
        success: true,
        data,
        source: 'sda-admin',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'sda-admin',
      };
    }
  },

  /**
   * Get tenancies with relationships
   */
  async getTenancies(filters?: { status?: string }): Promise<NucleusResponse> {
    try {
      let url = `${SDA_SUPABASE_URL}/rest/v1/tenancies?select=*,properties(*),participants(*),landlords(*)`;

      if (filters?.status) url += `&status=eq.${filters.status}`;

      const response = await fetch(url, {
        headers: {
          'apikey': SDA_ANON_KEY,
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch tenancies');

      const data = await response.json();
      return {
        success: true,
        data,
        source: 'sda-admin',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'sda-admin',
      };
    }
  },

  /**
   * Get NDIA payment batches
   */
  async getNDIABatches(filters?: { status?: string }): Promise<NucleusResponse> {
    try {
      let url = `${SDA_SUPABASE_URL}/rest/v1/ndia_payment_batches?select=*`;

      if (filters?.status) url += `&status=eq.${filters.status}`;

      const response = await fetch(url, {
        headers: {
          'apikey': SDA_ANON_KEY,
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch NDIA batches');

      const data = await response.json();
      return {
        success: true,
        data,
        source: 'sda-admin',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'sda-admin',
      };
    }
  },

  /**
   * Generate monthly NDIA payment batch via Edge Function
   */
  async generateNDIABatch(organizationId: string = 'homelander'): Promise<NucleusResponse> {
    try {
      const response = await fetch(`${SDA_SUPABASE_URL}/functions/v1/ndia-payment-processor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'auto_process_monthly',
          organization_id: organizationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate NDIA batch');

      const data = await response.json();
      return {
        success: true,
        data,
        source: 'edge-function',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'edge-function',
      };
    }
  },

  /**
   * Process JotForm submission via Edge Function
   */
  async processJotFormSubmission(submissionId: string, action: 'extract_participants' | 'extract_landlords' | 'extract_investors'): Promise<NucleusResponse> {
    try {
      const response = await fetch(`${SDA_SUPABASE_URL}/functions/v1/jotform-extractor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SDA_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          submissionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to process JotForm submission');

      const data = await response.json();
      return {
        success: true,
        data,
        source: 'edge-function',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'edge-function',
      };
    }
  },

  /**
   * Call Master Orchestrator for coordinated workflows
   */
  async orchestrate(workflow: 'daily-morning' | 'lead-processing' | 'property-pipeline' | 'bi-report'): Promise<NucleusResponse> {
    try {
      const response = await fetch(`${MASTER_ORCHESTRATOR_URL}?action=execute&workflow=${workflow}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to execute orchestration workflow');

      const data = await response.json();
      return {
        success: true,
        data,
        source: 'orchestrator',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'orchestrator',
      };
    }
  },

  /**
   * Health check across all systems
   */
  async healthCheck(): Promise<NucleusResponse> {
    const checks = {
      database: false,
      edgeFunctions: false,
      orchestrator: false,
      remoteMCP: false,
    };

    try {
      // Check database
      const dbResponse = await fetch(`${SDA_SUPABASE_URL}/rest/v1/properties?select=id&limit=1`, {
        headers: { 'apikey': SDA_ANON_KEY },
      });
      checks.database = dbResponse.ok;

      // Check Edge Functions (JotForm extractor)
      const edgeResponse = await fetch(`${SDA_SUPABASE_URL}/functions/v1/jotform-extractor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SDA_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'health' }),
      });
      checks.edgeFunctions = edgeResponse.ok;

      // Check Master Orchestrator
      const orchResponse = await fetch(`${MASTER_ORCHESTRATOR_URL}?action=health`, {
        headers: { 'Authorization': `Bearer ${SDA_ANON_KEY}` },
      });
      checks.orchestrator = orchResponse.ok;

      // Check Remote MCP (if accessible)
      try {
        const mcpResponse = await fetch(`${REMOTE_MCP_URL}/health`, { method: 'GET' });
        checks.remoteMCP = mcpResponse.ok;
      } catch {
        checks.remoteMCP = false; // Remote MCP may not be publicly accessible
      }

      const allHealthy = Object.values(checks).every(Boolean);
      const status = allHealthy ? 'healthy' : 'degraded';

      return {
        success: true,
        data: { status, checks },
        source: 'sda-admin',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        data: { status: 'unhealthy', checks },
        source: 'sda-admin',
      };
    }
  },
};

export default nucleus;
