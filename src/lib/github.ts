import { prisma } from "./db";
import { analyzeDependencies, auditRepoStructure } from "./analyzer";

export interface GitHubSyncOptions {
  username: string;
  token?: string; // Optional PAT
  userId?: string;
}

export interface GitHubApiRateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

export class GitHubService {
  private static getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Personal-GitHub-Career-Intelligence/1.0",
    };
    const activeToken = token?.trim() || process.env.GITHUB_TOKEN?.trim() || process.env.GITHUB_PAT?.trim();
    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }
    return headers;
  }

  /**
   * Fetches public/authenticated repositories for a given username or token.
   */
  static async syncAccountRepositories(options: GitHubSyncOptions) {
    let { username, token } = options;

    // Check if account already exists in DB with a saved token, or fall back to env var
    if (!token) {
      try {
        const existingAcc = await prisma.gitHubAccount.findUnique({ where: { username } });
        if (existingAcc?.accessToken) {
          token = existingAcc.accessToken;
        } else if (process.env.GITHUB_TOKEN || process.env.GITHUB_PAT) {
          token = (process.env.GITHUB_TOKEN || process.env.GITHUB_PAT)?.trim();
        }
      } catch {
        // DB not ready or account not found
      }
    }

    const headers = this.getHeaders(token);

    // 1. Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
    if (!userRes.ok) {
      if (userRes.status === 403 || userRes.status === 429) {
        const resetHeader = userRes.headers.get("x-ratelimit-reset");
        const resetDate = resetHeader ? new Date(parseInt(resetHeader) * 1000).toLocaleTimeString() : "soon";
        throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}. Please provide a free GitHub Personal Access Token (PAT) when connecting your account or set GITHUB_TOKEN in .env.local.`);
      }
      if (userRes.status === 404) {
        throw new Error(`GitHub user "${username}" not found.`);
      }
      throw new Error(`Failed to fetch GitHub profile for "${username}": HTTP ${userRes.status}`);
    }

    const userData = await userRes.json();

    // Ensure user in local DB
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: "admin",
          targetRole: "AI Engineer",
        },
      });
    }

    // Upsert GitHubAccount in DB
    const ghAccount = await prisma.gitHubAccount.upsert({
      where: { username },
      update: {
        accessToken: token || undefined,
        avatarUrl: userData.avatar_url,
        profileUrl: userData.html_url,
        bio: userData.bio,
        publicRepos: userData.public_repos || 0,
        lastSyncedAt: new Date(),
      },
      create: {
        userId: user.id,
        username,
        accessToken: token || undefined,
        avatarUrl: userData.avatar_url,
        profileUrl: userData.html_url,
        bio: userData.bio,
        publicRepos: userData.public_repos || 0,
        lastSyncedAt: new Date(),
      },
    });

    // 2. Fetch Repositories (up to 100 per page)
    const reposUrl = token
      ? `https://api.github.com/user/repos?per_page=100&sort=updated`
      : `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`;

    const reposRes = await fetch(reposUrl, { headers });
    if (!reposRes.ok) {
      throw new Error(`Failed to fetch repositories for "${username}": HTTP ${reposRes.status}`);
    }

    const rawRepos = await reposRes.json();
    if (!Array.isArray(rawRepos)) {
      throw new Error("Invalid response format from GitHub API");
    }

    const processedRepos = [];

    // Process each repo (top 15 most recently updated to respect rate limits on free requests)
    const reposToInspect = rawRepos.slice(0, 15);

    for (const r of reposToInspect) {
      try {
        const repoDetails = await this.inspectRepository(r.owner.login, r.name, token);

        const existingRepo = await prisma.repository.upsert({
          where: { githubRepoId: r.id },
          update: {
            name: r.name,
            fullName: r.full_name,
            description: r.description,
            htmlUrl: r.html_url,
            defaultBranch: r.default_branch || "main",
            isPrivate: r.private || false,
            isFork: r.fork || false,
            stars: r.stargazers_count || 0,
            forks: r.forks_count || 0,
            openIssues: r.open_issues_count || 0,
            primaryLanguage: r.language,
            topics: JSON.stringify(r.topics || []),
            license: r.license?.name || null,
            pushedAt: r.pushed_at ? new Date(r.pushed_at) : null,

            hasReadme: repoDetails.hasReadme,
            readmeContent: repoDetails.readmeContent,
            languagesBreakdown: JSON.stringify(repoDetails.languages),
            dependencies: JSON.stringify(repoDetails.dependencies),
            folderTree: JSON.stringify(repoDetails.tree),
            structureScore: repoDetails.structureAudit.score,
            completionStatus: repoDetails.structureAudit.completionStatus,
            reusableComponents: JSON.stringify(repoDetails.structureAudit.reusableComponents),
            demonstratedSkills: JSON.stringify(repoDetails.skills),
            missingDocumentation: JSON.stringify(repoDetails.structureAudit.missingDocumentation),
            lastInspectedAt: new Date(),
          },
          create: {
            githubAccountId: ghAccount.id,
            githubRepoId: r.id,
            name: r.name,
            fullName: r.full_name,
            description: r.description,
            htmlUrl: r.html_url,
            defaultBranch: r.default_branch || "main",
            isPrivate: r.private || false,
            isFork: r.fork || false,
            stars: r.stargazers_count || 0,
            forks: r.forks_count || 0,
            openIssues: r.open_issues_count || 0,
            primaryLanguage: r.language,
            topics: JSON.stringify(r.topics || []),
            license: r.license?.name || null,
            pushedAt: r.pushed_at ? new Date(r.pushed_at) : null,

            hasReadme: repoDetails.hasReadme,
            readmeContent: repoDetails.readmeContent,
            languagesBreakdown: JSON.stringify(repoDetails.languages),
            dependencies: JSON.stringify(repoDetails.dependencies),
            folderTree: JSON.stringify(repoDetails.tree),
            structureScore: repoDetails.structureAudit.score,
            completionStatus: repoDetails.structureAudit.completionStatus,
            reusableComponents: JSON.stringify(repoDetails.structureAudit.reusableComponents),
            demonstratedSkills: JSON.stringify(repoDetails.skills),
            missingDocumentation: JSON.stringify(repoDetails.structureAudit.missingDocumentation),
            lastInspectedAt: new Date(),
          },
        });

        processedRepos.push(existingRepo);
      } catch (err) {
        console.warn(`Could not deep-inspect repo ${r.full_name}:`, err);
      }
    }

    // Log the sync event
    await prisma.syncLog.create({
      data: {
        userId: user.id,
        source: "GITHUB",
        status: "SUCCESS",
        details: `Successfully synchronized ${processedRepos.length} repositories for account @${username}.`,
      },
    });

    return {
      account: ghAccount,
      syncedCount: processedRepos.length,
      repositories: processedRepos,
    };
  }

  /**
   * Deeply inspects repository README, directory tree, languages, and manifests.
   */
  static async inspectRepository(owner: string, repo: string, token?: string) {
    const headers = this.getHeaders(token);

    // 1. Fetch README
    let hasReadme = false;
    let readmeContent = "";
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        if (readmeData.content) {
          hasReadme = true;
          readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
        }
      }
    } catch {
      // ignore
    }

    // 2. Fetch Languages
    let languages: Record<string, number> = {};
    try {
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
      if (langRes.ok) {
        languages = await langRes.json();
      }
    } catch {
      // ignore
    }

    // 3. Fetch top-level contents and dependency files
    const fileMap: Record<string, string> = {};
    const filePaths: string[] = [];

    try {
      const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
      if (contentsRes.ok) {
        const contents = await contentsRes.json();
        if (Array.isArray(contents)) {
          for (const item of contents) {
            filePaths.push(item.path);

            // Fetch known dependency manifests
            if (["package.json", "requirements.txt", "Pipfile", "pyproject.toml", "go.mod", "Dockerfile"].includes(item.name)) {
              if (item.download_url) {
                try {
                  const rawRes = await fetch(item.download_url);
                  if (rawRes.ok) {
                    fileMap[item.name] = await rawRes.text();
                  }
                } catch {
                  // ignore
                }
              }
            }
          }
        }
      }
    } catch {
      // ignore
    }

    const primaryLang = Object.keys(languages)[0] || null;
    const depAnalysis = analyzeDependencies(fileMap, primaryLang);
    const structureAudit = auditRepoStructure(filePaths, primaryLang, depAnalysis.technologies);

    return {
      hasReadme,
      readmeContent: readmeContent.slice(0, 10000), // preserve first 10k chars
      languages,
      dependencies: depAnalysis.technologies,
      skills: depAnalysis.skills,
      tree: structureAudit.recommendedTree,
      structureAudit,
    };
  }
}
