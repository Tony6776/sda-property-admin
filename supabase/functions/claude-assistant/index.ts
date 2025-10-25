/**
 * CLAUDE ASSISTANT EDGE FUNCTION (Enhanced v2.0)
 *
 * Backend for the chat widget that:
 * - Receives user questions about features/data
 * - Calls Claude 4.5 Sonnet API for intelligent responses
 * - Queues terminal commands for execution
 * - Routes complex tasks to Claude Code
 * - Returns responses with execution status
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { readGitHubFile, listGitHubDirectory, searchGitHubFiles } from './github.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || ''
const GITHUB_ENABLED = Deno.env.get('GITHUB_TOKEN') ? true : false

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { message, page, context, conversation_history } = await req.json()

    // Check if this is a formatting request (not a user query)
    const isFormattingMode = context?.formatting_mode === true

    console.log(`💬 Chat request from ${page}: ${message}${isFormattingMode ? ' [FORMATTING MODE]' : ''}`)

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(page, context)

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          ...formatConversationHistory(conversation_history),
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    })

    const claudeData = await claudeResponse.json()

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeData.error?.message || 'Unknown error'}`)
    }

    const assistantResponse = claudeData.content[0].text

    // Skip routing and command extraction if in formatting mode
    if (isFormattingMode) {
      return new Response(
        JSON.stringify({
          response: assistantResponse,
          action: 'formatting_response',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Check if task should be routed to Claude Code
    const routeToClaudeCode = shouldRouteToClaudeCode(message, assistantResponse)
    let claudeCodeTaskId = null

    if (routeToClaudeCode) {
      // Create task in claude_code_tasks for Claude Code to pick up
      const { data: claudeCodeTask } = await supabaseClient
        .from('claude_code_tasks')
        .insert({
          user_message: message,
          page_context: page,
          context: context,
          status: 'pending',
          priority: 'normal',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      claudeCodeTaskId = claudeCodeTask?.id
      console.log(`🚀 Task routed to Claude Code: ${message.substring(0, 50)}... (ID: ${claudeCodeTaskId})`)

      // Return response indicating task was routed
      await supabaseClient.from('claude_chat_logs').insert({
        page: page,
        user_message: message,
        assistant_response: `${assistantResponse}\n\n[Task routed to Claude Code for complex modifications]`,
        terminal_command: null,
        context: context,
        created_at: new Date().toISOString(),
      })

      return new Response(
        JSON.stringify({
          response: `${assistantResponse}\n\n✨ **This task has been routed to Claude Code for complex modifications.**\n\nClaude Code has full access to the codebase and will handle this request. You'll be notified when it's complete.`,
          routed_to_claude_code: true,
          claude_code_task_id: claudeCodeTaskId,
          action: 'routed_to_claude_code',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Parse response for terminal commands
    const terminalCommand = extractTerminalCommand(assistantResponse)
    let commandStatus = null

    // If there's a terminal command, queue it
    let commandId = null
    if (terminalCommand) {
      const { data: queuedCommand } = await supabaseClient
        .from('claude_terminal_queue')
        .insert({
          command: terminalCommand,
          page_context: page,
          user_message: message,
          assistant_response: assistantResponse,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      commandStatus = 'pending'
      commandId = queuedCommand?.id
      console.log(`📟 Terminal command queued: ${terminalCommand} (ID: ${commandId})`)
    }

    // Log the conversation
    await supabaseClient.from('claude_chat_logs').insert({
      page: page,
      user_message: message,
      assistant_response: assistantResponse,
      terminal_command: terminalCommand,
      context: context,
      created_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({
        response: assistantResponse,
        terminal_command: terminalCommand,
        command_id: commandId,
        status: commandStatus,
        action: terminalCommand ? 'terminal_execution' : 'chat_response',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('❌ Claude Assistant error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function buildSystemPrompt(page: string, context: any): string {
  const githubStatus = GITHUB_ENABLED ? '✅ ENABLED' : '❌ DISABLED (Token not configured)'

  return `You are Claude 4.5 Sonnet, an AI assistant embedded in the SDA Enterprise admin system.

**Current Page**: ${page}
**Page Context**: ${JSON.stringify(context, null, 2)}

**Your Role & Capabilities**:
1. Answer questions about features, data, and functionality
2. Execute SQL queries directly via TERMINAL_COMMAND (goes to terminal-monitor.sh)
3. Diagnose database issues and run analytics
4. Format results into natural language responses
5. **Route complex code modifications to Claude Code** (automatic)
6. Read GitHub files (${githubStatus})

**IMPORTANT - You CAN Execute Terminal Commands**:
- SQL queries execute via terminal-monitor.sh successfully
- Use TERMINAL_COMMAND: prefix for SQL
- Results come back and are formatted for the user
- DO NOT say "I cannot execute terminal commands" - you CAN execute SQL
- Bash/file operations route to Claude Code automatically

**How Routing Works**:
- SQL queries/data operations: You handle directly via TERMINAL_COMMAND
- Complex code changes, multi-file edits, build/deploy: Automatically routed to Claude Code
- Terminal-monitor.sh picks up and executes your SQL commands
- Results are returned to the chat widget and formatted into natural language

**How to Answer Questions**:
When users ask questions, provide conversational, natural language responses. Examples:

User: "How many participants do we have with NDIS numbers?"
You: "Let me check that for you..."
TERMINAL_COMMAND: SELECT COUNT(*) FROM participants WHERE ndis_number IS NOT NULL;

User: "Show me the last 5 participants"
You: "I'll retrieve the 5 most recently added participants for you..."
TERMINAL_COMMAND: SELECT id, name, email, created_at FROM participants ORDER BY created_at DESC LIMIT 5;

**Response Format**:
1. First, explain what you're doing in natural language
2. Then provide the SQL command with TERMINAL_COMMAND: prefix
3. Provide ONLY the SQL query after TERMINAL_COMMAND:, NOT "psql -c"
4. Be conversational and helpful, not technical

**SQL Query Guidelines** (CRITICAL - Follow Exactly):
- ALWAYS use single quotes for string literals: 'value' NOT "value"
- LIKE/ILIKE patterns MUST be quoted: WHERE col ILIKE '%pattern%' NOT %pattern%
- Use metadata column for leads table: leads.metadata::text NOT leads.data
- Quote table/column names in WHERE clause: WHERE table_name = 'participants'
- ONLY output the SQL query after TERMINAL_COMMAND:, NO explanations or prefixes

**Example Answer Formats** (after SQL executes):
- "We have 8 participants with NDIS numbers out of 208 total."
- "Here are the 5 most recent participants: [format data readably]"
- "The total property count is 59, with 18 visible to investors."

**When to Route to Claude Code**:
If user asks for:
- Reading/modifying code files
- Multi-file refactoring
- Build and deploy operations
- Complex bug fixes
- Component modifications
- Testing operations
Simply acknowledge the request and the system will automatically route it. You can say "ROUTE_TO_CLAUDE_CODE" to force routing.

**Database Schema** (IMPORTANT - Use these exact column names):

**participants** (208 total, 8 with NDIS numbers):
- Key columns: id, name, email, phone, ndis_number, pathway_preference, location_preference
- NDIS data: ndis_number (text), ndis_plan_expiry (date)
- Example query: SELECT id, name, ndis_number, email FROM participants WHERE ndis_number IS NOT NULL;

**leads** (269 total, 155 converted):
- Key columns: id, name, email, phone, lead_type, status, metadata (jsonb)
- ⚠️ CRITICAL: Use metadata column (NOT data) - queries with "data" will fail
- Form data: metadata->'raw_data' (jsonb), metadata->>'form_name' for form type
- Example: SELECT id, name, metadata->>'form_name' FROM leads WHERE metadata::text ILIKE '%ndis%' LIMIT 10;

**properties** (59 total, 18 visible to investors):
- Key columns: id, address, price, design_category, sda_category

**property_matches** (3,420 total):
- Links participants to properties
- Key columns: participant_id, property_id, match_score, status

**System Status**:
- Agentic matching: ✅ OPERATIONAL (SQL-based)
- Property visibility: ✅ CONFIGURED
- Channel agents: ✅ ACTIVE
- Error logging: ✅ FUNCTIONAL
- Claude Code routing: ✅ ENABLED

Be helpful, concise, and actionable. Handle SQL queries yourself. Complex code tasks route automatically.`
}

function formatConversationHistory(history: any[]): any[] {
  if (!history || history.length === 0) return []

  return history
    .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
}

function extractTerminalCommand(response: string): string | null {
  const match = response.match(/TERMINAL_COMMAND:\s*(.+?)(?:\n|$)/i)
  return match ? match[1].trim() : null
}

function shouldRouteToClaudeCode(userMessage: string, assistantResponse: string): boolean {
  // Check for complexity indicators in AI response
  const complexityIndicators = [
    'I cannot',
    'I don\'t have access to',
    'would need to modify multiple files',
    'requires file system access',
    'needs terminal access',
    'beyond my capabilities',
    'ROUTE_TO_CLAUDE_CODE'
  ]

  if (complexityIndicators.some(indicator =>
    assistantResponse.toLowerCase().includes(indicator.toLowerCase())
  )) {
    return true
  }

  // Check for terminal/code operations in user request
  const terminalOperations = [
    'read file',
    'show me the code',
    'modify component',
    'update code',
    'fix bug',
    'refactor',
    'build and deploy',
    'run tests',
    'check logs',
    'restart service',
    'edit multiple files',
    'change the site',
    'modify the website',
    'update functionality',
    'create file',
    'make file',
    'write file',
    'new file',
    'generate file',
    'create a file',
    'make a file',
    'write a file',
    'delete file',
    'remove file'
  ]

  if (terminalOperations.some(op =>
    userMessage.toLowerCase().includes(op)
  )) {
    return true
  }

  // Check for file access patterns
  if (userMessage.match(/show me.*\.(tsx?|jsx?|css|sql|json)$/i)) {
    return true
  }

  return false
}
