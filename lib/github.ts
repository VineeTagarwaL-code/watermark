type GitHubRepoStats = {
  stars: number;
  forks: number;
  lastUpdated: string;
};

// Simple in-memory cache
let cache: {
  data: GitHubRepoStats | null;
  expiresAt: number;
} = {
  data: null,
  expiresAt: 0,
};

/**
 * Fetches GitHub repository stats with caching
 * Cache expires after 1 hour to avoid hitting GitHub's rate limits
 */
export async function getGitHubRepoStats(
  owner: string,
  repo: string
): Promise<GitHubRepoStats> {
  const now = Date.now();

  // Return cached data if available and not expired
  if (cache.data && cache.expiresAt > now) {
    return cache.data;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      // Use cache: 'no-store' to always fetch fresh data from GitHub
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    const stats: GitHubRepoStats = {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      lastUpdated: data.updated_at || new Date().toISOString(),
    };

    // Update cache with a 1-hour expiration (3600000 ms)
    cache = {
      data: stats,
      expiresAt: now + 3600000,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching GitHub repo stats:', error);
    
    // Return cached data even if expired or zeros as fallback
    return cache.data || {
      stars: 0,
      forks: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
} 