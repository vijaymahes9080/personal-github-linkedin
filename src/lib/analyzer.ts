import { RepoFolderNode } from "@/types";

export interface DependencyAnalysis {
  technologies: string[];
  skills: string[];
  categories: {
    aiMl: string[];
    frontend: string[];
    backend: string[];
    database: string[];
    devops: string[];
    testing: string[];
  };
}

export interface StructureAudit {
  score: number; // 0-100
  completionStatus: "COMPLETED" | "IN_PROGRESS" | "PROTOTYPE" | "ARCHIVED";
  missingDocumentation: string[];
  reusableComponents: string[];
  recommendedTree: RepoFolderNode[];
}

/**
 * Analyzes repository dependencies across Python, Node.js, Go, Rust, etc.
 */
export function analyzeDependencies(
  fileMap: Record<string, string>,
  primaryLanguage: string | null
): DependencyAnalysis {
  const technologies = new Set<string>();
  const skills = new Set<string>();

  const categories = {
    aiMl: [] as string[],
    frontend: [] as string[],
    backend: [] as string[],
    database: [] as string[],
    devops: [] as string[],
    testing: [] as string[],
  };

  if (primaryLanguage) {
    skills.add(primaryLanguage);
    technologies.add(primaryLanguage);
  }

  // 1. Check Node.js package.json
  const packageJsonContent = fileMap["package.json"] || fileMap["client/package.json"] || fileMap["frontend/package.json"];
  if (packageJsonContent) {
    try {
      const parsed = JSON.parse(packageJsonContent);
      const allDeps = {
        ...(parsed.dependencies || {}),
        ...(parsed.devDependencies || {}),
      };

      for (const dep of Object.keys(allDeps)) {
        technologies.add(dep);
        const lower = dep.toLowerCase();

        if (lower.includes("react") || lower.includes("next") || lower.includes("vue") || lower.includes("svelte") || lower.includes("tailwind")) {
          categories.frontend.push(dep);
          skills.add("Frontend Engineering");
        } else if (lower.includes("express") || lower.includes("nest") || lower.includes("fastify") || lower.includes("koa")) {
          categories.backend.push(dep);
          skills.add("Node.js Backend");
        } else if (lower.includes("prisma") || lower.includes("mongoose") || lower.includes("typeorm") || lower.includes("pg") || lower.includes("sqlite")) {
          categories.database.push(dep);
          skills.add("Database & ORM");
        } else if (lower.includes("jest") || lower.includes("vitest") || lower.includes("playwright") || lower.includes("cypress")) {
          categories.testing.push(dep);
          skills.add("Automated Testing");
        }
      }
    } catch {
      // ignore json parse error
    }
  }

  // 2. Check Python requirements.txt or Pipfile or pyproject.toml
  const pythonReqs = fileMap["requirements.txt"] || fileMap["Pipfile"] || fileMap["pyproject.toml"] || fileMap["backend/requirements.txt"];
  if (pythonReqs) {
    skills.add("Python");
    technologies.add("Python");

    const lines = pythonReqs.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim().split(/[==|>=|<=|<|>|~=]/)[0].trim().toLowerCase();
      if (!line || line.startsWith("#")) continue;

      technologies.add(line);

      if (["torch", "tensorflow", "transformers", "langchain", "llamaindex", "chromadb", "qdrant", "scikit-learn", "sklearn", "openai", "huggingface-hub", "vllm", "onnx"].includes(line)) {
        categories.aiMl.push(line);
        skills.add("AI & Machine Learning");
      } else if (["pandas", "numpy", "matplotlib", "seaborn", "scipy", "plotly", "duckdb"].includes(line)) {
        categories.aiMl.push(line);
        skills.add("Data Analysis & Processing");
      } else if (["fastapi", "flask", "django", "tornado", "uvicorn", "starlette"].includes(line)) {
        categories.backend.push(line);
        skills.add("Python Web APIs");
      } else if (["sqlalchemy", "psycopg2", "pymongo", "redis", "alembic"].includes(line)) {
        categories.database.push(line);
        skills.add("Database Architecture");
      } else if (["pytest", "unittest", "hypothesis"].includes(line)) {
        categories.testing.push(line);
        skills.add("Python Testing (pytest)");
      } else if (["celery", "airflow", "dvc", "mlflow"].includes(line)) {
        categories.devops.push(line);
        skills.add("Workflow Orchestration");
      }
    }
  }

  // 3. Check Go mod
  const goMod = fileMap["go.mod"];
  if (goMod) {
    skills.add("Go (Golang)");
    technologies.add("Go");
    if (goMod.includes("gin-gonic") || goMod.includes("fiber") || goMod.includes("echo")) {
      categories.backend.push("Gin/Fiber Web Framework");
      skills.add("High-Performance Backend");
    }
  }

  // 4. Check Docker / DevOps
  if (fileMap["Dockerfile"] || fileMap["docker-compose.yml"]) {
    technologies.add("Docker");
    categories.devops.push("Docker Containerization");
    skills.add("Containerization (Docker)");
  }

  return {
    technologies: Array.from(technologies),
    skills: Array.from(skills),
    categories,
  };
}

/**
 * Audits repository structure, detects missing files, and generates recommended production structure.
 */
export function auditRepoStructure(
  existingPaths: string[],
  primaryLanguage: string | null,
  detectedTech: string[]
): StructureAudit {
  const pathSet = new Set(existingPaths.map((p) => p.toLowerCase()));
  let score = 30; // base score for having files
  const missingDocumentation: string[] = [];
  const reusableComponents: string[] = [];

  // Check README
  const hasReadme = pathSet.has("readme.md") || pathSet.has("readme");
  if (hasReadme) {
    score += 20;
  } else {
    missingDocumentation.push("Missing README.md with setup instructions and project overview");
  }

  // Check License
  const hasLicense = pathSet.has("license") || pathSet.has("license.md") || pathSet.has("license.txt");
  if (hasLicense) {
    score += 10;
  } else {
    missingDocumentation.push("Missing LICENSE file (recommended for open-source clarity)");
  }

  // Check .gitignore
  const hasGitignore = pathSet.has(".gitignore");
  if (hasGitignore) {
    score += 10;
  } else {
    missingDocumentation.push("Missing .gitignore (risks committing secrets or build artifacts)");
  }

  // Check Tests
  const hasTests = existingPaths.some((p) => {
    const l = p.toLowerCase();
    return l.startsWith("test") || l.startsWith("tests/") || l.includes("__tests__") || l.endsWith(".test.ts") || l.endsWith(".test.js") || l.endsWith("_test.py");
  });
  if (hasTests) {
    score += 15;
    reusableComponents.push("Automated Test Suite");
  } else {
    missingDocumentation.push("Missing automated test suite (e.g. pytest, Jest, or Vitest)");
  }

  // Check CI/CD
  const hasCI = existingPaths.some((p) => p.toLowerCase().includes(".github/workflows"));
  if (hasCI) {
    score += 15;
    reusableComponents.push("GitHub Actions CI/CD Pipeline");
  } else {
    missingDocumentation.push("Missing CI/CD workflow (.github/workflows for automated lint/test)");
  }

  // Determine completion status
  let completionStatus: "COMPLETED" | "IN_PROGRESS" | "PROTOTYPE" | "ARCHIVED" = "IN_PROGRESS";
  if (score >= 80) {
    completionStatus = "COMPLETED";
  } else if (score < 50) {
    completionStatus = "PROTOTYPE";
  }

  // Generate recommended production folder structure customized to stack
  const recommendedTree = generateCustomizedStructure(existingPaths, primaryLanguage, detectedTech);

  return {
    score: Math.min(score, 100),
    completionStatus,
    missingDocumentation,
    reusableComponents,
    recommendedTree,
  };
}

function generateCustomizedStructure(
  existingPaths: string[],
  primaryLang: string | null,
  tech: string[]
): RepoFolderNode[] {
  const pathSet = new Set(existingPaths.map((p) => p.toLowerCase()));
  const isPython = primaryLang?.toLowerCase() === "python" || tech.some((t) => t.toLowerCase().includes("python") || t.toLowerCase().includes("fastapi"));
  const isJSorTS = primaryLang?.toLowerCase().includes("javascript") || primaryLang?.toLowerCase().includes("typescript") || tech.some((t) => t.toLowerCase().includes("react") || t.toLowerCase().includes("next"));

  const nodes: RepoFolderNode[] = [];

  const addNode = (path: string, type: "file" | "dir", purpose: string) => {
    const exists = pathSet.has(path.toLowerCase()) || existingPaths.some((p) => p.toLowerCase().startsWith(path.toLowerCase() + "/"));
    nodes.push({
      name: path.split("/").pop() || path,
      path,
      type,
      existsInRepo: exists,
      purpose,
      isRecommended: true,
    });
  };

  addNode("README.md", "file", "Comprehensive project overview, architecture diagram, and quickstart");
  addNode(".gitignore", "file", "Prevents committing virtual environments, dependencies, and credentials");
  addNode("LICENSE", "file", "Defines software distribution and re-use permissions");

  if (isPython) {
    addNode("requirements.txt", "file", "Pinned runtime dependencies for reproducible environments");
    addNode("src/", "dir", "Application source code and modular business logic");
    addNode("src/core/", "dir", "Configuration, settings, and database connections");
    addNode("src/api/", "dir", "REST endpoints, route handlers, and request validation");
    addNode("tests/", "dir", "Unit and integration tests run via pytest");
    addNode("docs/", "dir", "API documentation, design decisions, and system diagrams");
    addNode("Dockerfile", "file", "Containerization recipe for production deployment");
    addNode(".env.example", "file", "Template for required environment variables without secrets");
  } else if (isJSorTS) {
    addNode("package.json", "file", "Project metadata, dependency declarations, and scripts");
    addNode("tsconfig.json", "file", "TypeScript strict type-checking compiler options");
    addNode("src/", "dir", "Source code containing components, pages, and utilities");
    addNode("src/components/", "dir", "Reusable UI components and design system tokens");
    addNode("src/lib/", "dir", "Data fetching utilities, API clients, and helper algorithms");
    addNode("tests/", "dir", "Automated test specs for components and business logic");
    addNode("Dockerfile", "file", "Production multi-stage container build");
    addNode(".env.example", "file", "Environment variable template for local and CI execution");
  } else {
    addNode("src/", "dir", "Core source code");
    addNode("tests/", "dir", "Automated test suite");
    addNode("docs/", "dir", "Technical specifications and usage guides");
    addNode("Dockerfile", "file", "Container configuration for reproducible builds");
  }

  addNode(".github/workflows/", "dir", "Continuous Integration (CI) configuration for automated tests");

  return nodes;
}
