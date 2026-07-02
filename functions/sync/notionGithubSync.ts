/**
 * Notion → GitHub Sync Worker
 * Mirrors Notion audit ledger rows to GitHub Issues.
 * Enables cross-platform audit trail and decision tracking.
 *
 * Run via: cron job, n8n workflow trigger, or manual invocation.
 * Frequency: every 5 minutes (or on-demand after execution).
 */

/**
 * Mock Notion and GitHub clients for Phase 1.
 * In production, import actual clients:
 * import { Client as NotionClient } from '@notionhq/client'
 * import { Octokit } from '@octokit/rest'
 */

interface NotionPage {
  id: string
  properties: Record<string, any>
}

interface GitHubIssue {
  number: number
  html_url: string
}

// Mock clients (Phase 1 simulation)
const notion = {
  databases: {
    query: async (_opts: any) => ({ results: [] as NotionPage[] }),
    retrieve: async (_id: string) => ({} as any),
  },
  pages: {
    update: async (_opts: any) => ({} as any),
  },
}

const github = {
  rest: {
    issues: {
      create: async (_opts: any): Promise<{ data: GitHubIssue }> => ({
        data: { number: 1, html_url: 'https://github.com/mock' },
      }),
    },
  },
}

const NOTION_AUDIT_DB_ID = process.env.NOTION_AUDIT_DB_ID || '002cc2e2-7033-4abd-9797-0af99d8c2cec'
const GITHUB_REPO = process.env.GITHUB_REPO || 'EarthTouched1234/secc-os-command-suite'

/**
 * Sync recent Notion audit rows to GitHub Issues.
 * Rows without a linked GitHub Issue are synced.
 */
export async function syncNotionToGithub(): Promise<{ synced: number; errors: number }> {
  let synced = 0
  let errors = 0

  try {
    console.log('[notionGithubSync] Starting sync...')

    // Query Notion for audit rows not yet synced to GitHub
    const query = await notion.databases.query({
      database_id: NOTION_AUDIT_DB_ID,
      filter: {
        and: [
          {
            property: 'GitHub Issue',
            url: { is_empty: true }, // Not yet synced
          },
          {
            property: 'Timestamp',
            date: {
              past_week: {},
            },
          },
        ],
      },
    })

    console.log(`[notionGithubSync] Found ${query.results.length} unsynced audit rows`)

    for (const page of query.results) {
      try {
        const title = extractPropertyValue(page, 'Name') || 'Audit Record'
        const decisionId = extractPropertyValue(page, 'Decision ID') || 'UNKNOWN'
        const domain = extractPropertyValue(page, 'Domain') || 'general'
        const status = extractPropertyValue(page, 'Execution Status') || 'pending'
        const timestamp = extractPropertyValue(page, 'Timestamp') || new Date().toISOString()

        console.log(`[notionGithubSync] Syncing audit ${decisionId}...`)

        // Create GitHub Issue
        const issue = await github.rest.issues.create({
          owner: GITHUB_REPO.split('/')[0],
          repo: GITHUB_REPO.split('/')[1],
          title: `[${domain.toUpperCase()}] ${title}`,
          body: formatNotionAsMarkdown(page),
          labels: [domain, status],
        })

        console.log(`[notionGithubSync] Created GitHub Issue #${issue.data.number}`)

        // Link back to GitHub from Notion
        await notion.pages.update({
          page_id: page.id,
          properties: {
            'GitHub Issue': {
              url: issue.data.html_url,
            },
          },
        })

        console.log(`[notionGithubSync] Linked GitHub Issue in Notion`)
        synced++
      } catch (err) {
        console.error(`[notionGithubSync] Error syncing audit ${page.id}:`, err)
        errors++
      }
    }

    console.log(`[notionGithubSync] Completed: ${synced} synced, ${errors} errors`)
  } catch (err) {
    console.error('[notionGithubSync] Fatal error:', err)
  }

  return { synced, errors }
}

/**
 * Sync a single audit row immediately after execution.
 * Called from the executor when an action completes.
 */
export async function syncAuditRowToGithub(auditRowId: string): Promise<boolean> {
  try {
    console.log(`[notionGithubSync] Syncing audit row ${auditRowId}...`)

    // Query the specific audit row
    const page = await notion.databases.retrieve(auditRowId)

    if (!page) {
      console.warn(`[notionGithubSync] Audit row not found: ${auditRowId}`)
      return false
    }

    const title = extractPropertyValue(page, 'Name') || 'Audit Record'
    const domain = extractPropertyValue(page, 'Domain') || 'general'
    const status = extractPropertyValue(page, 'Execution Status') || 'pending'

    // Create GitHub Issue
    const issue = await github.rest.issues.create({
      owner: GITHUB_REPO.split('/')[0],
      repo: GITHUB_REPO.split('/')[1],
      title: `[${domain.toUpperCase()}] ${title}`,
      body: formatNotionAsMarkdown(page),
      labels: [domain, status],
    })

    // Link back to GitHub
    await notion.pages.update({
      page_id: auditRowId,
      properties: {
        'GitHub Issue': {
          url: issue.data.html_url,
        },
      },
    })

    console.log(`[notionGithubSync] Synced to GitHub Issue #${issue.data.number}`)
    return true
  } catch (err) {
    console.error(`[notionGithubSync] Error:`, err)
    return false
  }
}

/**
 * Extract a property value from a Notion page.
 */
function extractPropertyValue(page: NotionPage, propertyName: string): string | null {
  const prop = page.properties[propertyName]
  if (!prop) return null

  if (prop.title && prop.title[0]) return prop.title[0].text.content
  if (prop.rich_text && prop.rich_text[0]) return prop.rich_text[0].text.content
  if (prop.select && prop.select.name) return prop.select.name
  if (prop.date && prop.date.start) return prop.date.start
  if (prop.number) return String(prop.number)

  return null
}

/**
 * Format a Notion audit page as Markdown for the GitHub Issue body.
 */
function formatNotionAsMarkdown(page: NotionPage): string {
  const decisionId = extractPropertyValue(page, 'Decision ID') || 'UNKNOWN'
  const domain = extractPropertyValue(page, 'Domain') || 'N/A'
  const status = extractPropertyValue(page, 'Execution Status') || 'N/A'
  const riskScore = extractPropertyValue(page, 'Risk Score') || 'N/A'
  const systemsUpdated = extractPropertyValue(page, 'Systems Updated') || 'N/A'
  const executionHash = extractPropertyValue(page, 'Execution Hash') || 'N/A'
  const timestamp = extractPropertyValue(page, 'Timestamp') || new Date().toISOString()
  const receipt = extractPropertyValue(page, 'Receipt JSON') || '{}'

  return `
# Execution Audit

**Decision ID:** \`${decisionId}\`  
**Domain:** ${domain}  
**Execution Status:** ${status}  
**Risk Score:** ${riskScore}  
**Systems Updated:** ${systemsUpdated}  
**Execution Hash:** \`${executionHash}\`  
**Timestamp:** ${timestamp}  

## Receipt
\`\`\`json
${receipt}
\`\`\`

---

Synced from SECC-OS Notion Audit Ledger. [View in Notion](https://notion.so/${page.id.replace(/-/g, '')})
`.trim()
}
