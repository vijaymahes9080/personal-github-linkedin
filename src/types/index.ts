export type TargetRole =
  | "AI Engineer"
  | "Machine Learning Engineer"
  | "Data Analyst"
  | "Python Full Stack Developer"
  | "Embedded Systems Engineer"
  | "Software Developer"
  | "Backend Engineer"
  | "Frontend Engineer"
  | "Cloud / DevOps Engineer"
  | "Data Engineer"
  | "Researcher or Academic Professional";

export interface RoleSkillRequirement {
  role: string;
  category: string;
  coreSkills: string[];
  recommendedTechnologies: string[];
  criticalConcepts: string[];
  sampleProjectIdeas: string[];
  atsKeywords: string[];
}

export interface AnalyzedRepoData {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  isFork: boolean;
  stars: number;
  forks: number;
  openIssues: number;
  primaryLanguage: string | null;
  topics: string[];
  license: string | null;
  pushedAt: string | null;
  hasReadme: boolean;
  readmeContent?: string | null;
  languagesBreakdown: Record<string, number>;
  dependencies: string[];
  folderTree: RepoFolderNode[];
  structureScore: number;
  completionStatus: "COMPLETED" | "IN_PROGRESS" | "PROTOTYPE" | "ARCHIVED";
  reusableComponents: string[];
  demonstratedSkills: string[];
  missingDocumentation: string[];
  lastInspectedAt: string | null;
}

export interface RepoFolderNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  existsInRepo: boolean;
  purpose?: string;
  isRecommended?: boolean;
}

export interface LinkedInFact {
  id: string;
  category: "POSITION" | "CERTIFICATION" | "PROJECT" | "SKILL" | "EDUCATION" | "ACHIEVEMENT" | "LEARNING";
  title: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  skills: string[];
  verificationStatus: "VERIFIED" | "SELF_REPORTED" | "UNVERIFIED";
  source: "LINKEDIN_CSV" | "MANUAL_INPUT" | "POST_EXTRACT";
  relatedRepoId?: string;
}

export interface RecommendationItem {
  id: string;
  type: "BEST_SHOWCASE" | "NEEDS_IMPROVEMENT" | "MISSING_PORTFOLIO";
  repoId?: string;
  title: string;
  reason: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  actionPlan: string;
  skillsGained: string[];
  score?: number;
}

export interface ResumeGenerationOutput {
  projectTitle: string;
  objective: string;
  technologies: string[];
  contributions: string;
  keyFeatures: string[];
  verifiableOutcomes?: string;
  keywords: string[];
  oneLineVersion: string;
  twoLineVersion: string;
  threeBulletVersion: [string, string, string];
  detailedVersion: string;
}

export interface LinkedInPostOutput {
  id: string;
  formatType: string;
  title: string;
  targetAudience?: string;
  conciseVersion: string;
  mediumVersion: string;
  detailedVersion: string;
  tags: string[];
  directShareUrl?: string;
}

export interface SyncStatus {
  lastSyncTime: string | null;
  githubConnected: boolean;
  username: string | null;
  reposCount: number;
  linkedinFactsCount: number;
  aiProvider: string;
}
