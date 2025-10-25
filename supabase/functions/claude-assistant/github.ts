/**
 * GITHUB API INTEGRATION
 *
 * Provides functions for reading files from GitHub repositories
 * Used by Claude chat widget to access code files
 */

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN') || ''
const GITHUB_REPO_OWNER = 'tonytadros' // Update if different
const GITHUB_REPO_NAME = 'sda-property-admin' // Update if different

export interface GitHubFile {
  path: string
  content: string
  sha: string
  size: number
}

/**
 * Read a file from the GitHub repository
 */
export async function readGitHubFile(filePath: string): Promise<GitHubFile | null> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SDA-Claude-Assistant'
      }
    })

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()

    // Decode base64 content
    const content = atob(data.content.replace(/\n/g, ''))

    return {
      path: data.path,
      content: content,
      sha: data.sha,
      size: data.size
    }
  } catch (error) {
    console.error(`Error reading GitHub file ${filePath}:`, error)
    return null
  }
}

/**
 * List files in a directory
 */
export async function listGitHubDirectory(dirPath: string = ''): Promise<string[] | null> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${dirPath}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SDA-Claude-Assistant'
      }
    })

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()

    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        name: item.name,
        path: item.path,
        type: item.type, // 'file' or 'dir'
        size: item.size
      }))
    }

    return null
  } catch (error) {
    console.error(`Error listing GitHub directory ${dirPath}:`, error)
    return null
  }
}

/**
 * Search for files in the repository
 */
export async function searchGitHubFiles(query: string): Promise<any[] | null> {
  try {
    const url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}+repo:${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SDA-Claude-Assistant'
      }
    })

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error(`Error searching GitHub:`, error)
    return null
  }
}
