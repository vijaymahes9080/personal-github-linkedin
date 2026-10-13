import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with verified demonstration career data...");

  // 1. Create default User
  const user = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      targetRole: "AI Engineer",
      aiProvider: "HEURISTIC",
    },
  });

  // 2. Create demo GitHub Account
  const ghAccount = await prisma.gitHubAccount.upsert({
    where: { username: "demo-engineer" },
    update: {},
    create: {
      userId: user.id,
      username: "demo-engineer",
      avatarUrl: "https://avatars.githubusercontent.com/u/9919?v=4",
      profileUrl: "https://github.com/demo-engineer",
      bio: "Software & AI Engineer passionate about scalable systems, RAG pipelines, and clean architecture.",
      publicRepos: 4,
      totalStars: 42,
      lastSyncedAt: new Date(),
    },
  });

  // 3. Create Sample Repositories with deep inspection details
  const repo1 = await prisma.repository.upsert({
    where: { githubRepoId: 10101 },
    update: {},
    create: {
      githubAccountId: ghAccount.id,
      githubRepoId: 10101,
      name: "enterprise-rag-pipeline",
      fullName: "demo-engineer/enterprise-rag-pipeline",
      description: "High-throughput Retrieval-Augmented Generation pipeline using LangChain, Qdrant, and FastAPI with hybrid search and re-ranking.",
      htmlUrl: "https://github.com/demo-engineer/enterprise-rag-pipeline",
      defaultBranch: "main",
      isPrivate: false,
      stars: 28,
      forks: 6,
      openIssues: 1,
      primaryLanguage: "Python",
      topics: JSON.stringify(["rag", "langchain", "qdrant", "fastapi", "embeddings", "ai"]),
      hasReadme: true,
      readmeContent: "# Enterprise RAG Pipeline\n\nProduction-ready RAG service featuring hybrid sparse/dense vector search, cross-encoder re-ranking, and streaming response generation.",
      languagesBreakdown: JSON.stringify({ Python: 92, Dockerfile: 8 }),
      dependencies: JSON.stringify(["fastapi", "uvicorn", "langchain", "qdrant-client", "sentence-transformers", "pydantic", "pytest"]),
      folderTree: JSON.stringify([
        { name: "README.md", path: "README.md", type: "file", existsInRepo: true, purpose: "Comprehensive documentation" },
        { name: "src/", path: "src/", type: "dir", existsInRepo: true, purpose: "Core application logic" },
        { name: "src/api/", path: "src/api/", type: "dir", existsInRepo: true, purpose: "FastAPI endpoints" },
        { name: "src/core/", path: "src/core/", type: "dir", existsInRepo: true, purpose: "Vector embeddings and pipeline orchestration" },
        { name: "tests/", path: "tests/", type: "dir", existsInRepo: true, purpose: "Pytest unit & integration test suite" },
        { name: "requirements.txt", path: "requirements.txt", type: "file", existsInRepo: true, purpose: "Dependency lockfile" },
        { name: "Dockerfile", path: "Dockerfile", type: "file", existsInRepo: true, purpose: "Production containerization" },
      ]),
      structureScore: 92,
      completionStatus: "COMPLETED",
      reusableComponents: JSON.stringify(["Hybrid Vector Retriever", "Cross-Encoder Re-ranker", "FastAPI Streaming Endpoint"]),
      demonstratedSkills: JSON.stringify(["Python", "LangChain", "Vector Databases", "FastAPI", "Prompt Engineering", "Docker"]),
      missingDocumentation: JSON.stringify([]),
      lastInspectedAt: new Date(),
    },
  });

  const repo2 = await prisma.repository.upsert({
    where: { githubRepoId: 10102 },
    update: {},
    create: {
      githubAccountId: ghAccount.id,
      githubRepoId: 10102,
      name: "smart-student-analytics",
      fullName: "demo-engineer/smart-student-analytics",
      description: "Python application to analyze student performance trends and identify academic risk patterns using Pandas and Matplotlib.",
      htmlUrl: "https://github.com/demo-engineer/smart-student-analytics",
      defaultBranch: "main",
      isPrivate: false,
      stars: 14,
      forks: 3,
      openIssues: 0,
      primaryLanguage: "Python",
      topics: JSON.stringify(["data-analysis", "python", "pandas", "matplotlib", "statistics"]),
      hasReadme: true,
      readmeContent: "# Smart Student Performance Analytics\n\nAnalyzes academic scores across 10,000+ student records to detect grade distributions and early attrition factors.",
      languagesBreakdown: JSON.stringify({ Python: 95, Shell: 5 }),
      dependencies: JSON.stringify(["pandas", "numpy", "matplotlib", "seaborn", "pytest"]),
      folderTree: JSON.stringify([
        { name: "README.md", path: "README.md", type: "file", existsInRepo: true, purpose: "Project overview and findings" },
        { name: "src/", path: "src/", type: "dir", existsInRepo: true, purpose: "ETL and analytical computation scripts" },
        { name: "tests/", path: "tests/", type: "dir", existsInRepo: true, purpose: "Data integrity verification tests" },
        { name: "requirements.txt", path: "requirements.txt", type: "file", existsInRepo: true, purpose: "Dependencies" },
      ]),
      structureScore: 84,
      completionStatus: "COMPLETED",
      reusableComponents: JSON.stringify(["ETL Data Normalizer", "Statistical Trend Analyzer", "Automated Chart Generator"]),
      demonstratedSkills: JSON.stringify(["Python", "Pandas", "Data Cleaning", "Data Visualization", "Statistical Analysis"]),
      missingDocumentation: JSON.stringify(["Missing Dockerfile for containerized deployment"]),
      lastInspectedAt: new Date(),
    },
  });

  const repo3 = await prisma.repository.upsert({
    where: { githubRepoId: 10103 },
    update: {},
    create: {
      githubAccountId: ghAccount.id,
      githubRepoId: 10103,
      name: "iot-firmware-telemetry",
      fullName: "demo-engineer/iot-firmware-telemetry",
      description: "Embedded C/C++ FreeRTOS telemetry daemon for STM32 microcontrollers with I2C sensor bus and UART streaming.",
      htmlUrl: "https://github.com/demo-engineer/iot-firmware-telemetry",
      defaultBranch: "main",
      isPrivate: false,
      stars: 9,
      forks: 2,
      openIssues: 2,
      primaryLanguage: "C",
      topics: JSON.stringify(["embedded", "freertos", "stm32", "i2c", "c-plus-plus"]),
      hasReadme: false,
      languagesBreakdown: JSON.stringify({ C: 80, "C++": 20 }),
      dependencies: JSON.stringify(["freertos", "cmsis", "stm32-hal"]),
      folderTree: JSON.stringify([
        { name: "src/", path: "src/", type: "dir", existsInRepo: true, purpose: "Firmware source" },
        { name: "include/", path: "include/", type: "dir", existsInRepo: true, purpose: "Header definitions" },
      ]),
      structureScore: 48,
      completionStatus: "PROTOTYPE",
      reusableComponents: JSON.stringify(["I2C Sensor Driver", "Ring Buffer Logger"]),
      demonstratedSkills: JSON.stringify(["C", "C++", "RTOS", "Microcontrollers", "Hardware Protocols"]),
      missingDocumentation: JSON.stringify([
        "Missing README.md with pinout and build instructions",
        "Missing unit tests or hardware simulator mocks",
        "Missing .gitignore for build binaries (.bin, .hex)",
      ]),
      lastInspectedAt: new Date(),
    },
  });

  // 4. Create Sample LinkedIn Facts
  await prisma.professionalFact.createMany({
    data: [
      {
        userId: user.id,
        category: "POSITION",
        title: "AI & Full Stack Engineering Intern",
        organization: "Cognitive Tech Labs",
        startDate: "Jun 2024",
        endDate: "Aug 2024",
        description: "Developed backend microservices and assisted in fine-tuning internal retrieval pipelines.",
        skills: JSON.stringify(["Python", "FastAPI", "Docker", "RAG"]),
        verificationStatus: "VERIFIED",
        source: "LINKEDIN_CSV",
        relatedRepoId: repo1.id,
      },
      {
        userId: user.id,
        category: "CERTIFICATION",
        title: "Deep Learning Specialization",
        organization: "DeepLearning.AI",
        startDate: "2024",
        endDate: "2024",
        description: "Verified credential covering Neural Networks, CNNs, Sequence Models, and Optimization.",
        skills: JSON.stringify(["PyTorch", "Deep Learning", "Mathematics for ML"]),
        verificationStatus: "VERIFIED",
        source: "LINKEDIN_CSV",
      },
      {
        userId: user.id,
        category: "SKILL",
        title: "Python (Advanced)",
        verificationStatus: "VERIFIED",
        source: "LINKEDIN_CSV",
      },
      {
        userId: user.id,
        category: "EDUCATION",
        title: "Bachelor of Technology in Computer Science",
        organization: "University of Technology",
        startDate: "2022",
        endDate: "2026",
        description: "Relevant Coursework: Data Structures, Operating Systems, Machine Learning, Database Management Systems.",
        skills: JSON.stringify(["Algorithms", "System Design", "Database Systems"]),
        verificationStatus: "VERIFIED",
        source: "LINKEDIN_CSV",
      },
    ],
  });

  // 5. Create Initial Resume Entries adhering to strict ATS format
  await prisma.resumeEntry.create({
    data: {
      userId: user.id,
      repoId: repo1.id,
      targetRole: "AI Engineer",
      projectTitle: "Enterprise RAG Pipeline",
      objective: "Developed a high-throughput Retrieval-Augmented Generation pipeline using LangChain, Qdrant, and FastAPI with hybrid search and re-ranking.",
      technologies: JSON.stringify(["Python", "FastAPI", "LangChain", "Qdrant", "Docker"]),
      contributions: "Architected hybrid search index, integrated cross-encoder re-ranking for higher precision, and built streaming REST API.",
      keyFeatures: JSON.stringify([
        "Implemented sparse and dense hybrid retrieval over domain documents",
        "Integrated cross-encoder re-ranking to filter irrelevant context chunks",
        "Containerized application with multi-stage Dockerfile and automated unit tests",
      ]),
      verifiableOutcomes: "Gained 28 GitHub stars; Achieved 92% repository health score",
      keywords: JSON.stringify(["RAG", "LangChain", "Vector DB", "FastAPI", "Docker", "Python", "Embeddings"]),
      oneLineVersion: "Engineered Enterprise RAG Pipeline, an AI-aligned solution utilizing Python, FastAPI, and LangChain to deliver high-throughput hybrid retrieval and contextual re-ranking.",
      twoLineVersion: "Developed Enterprise RAG Pipeline using Python, FastAPI, LangChain, and Qdrant to implement production hybrid vector search.\nStructured production-ready codebase with comprehensive documentation (Gained 28 GitHub stars; 92% health score).",
      threeBulletVersion: JSON.stringify([
        "Architected and developed Enterprise RAG Pipeline using Python, FastAPI, and LangChain, delivering high-throughput hybrid vector retrieval.",
        "Engineered core workflows including cross-encoder re-ranking and streaming inference, ensuring reliable context delivery and low latency.",
        "Authored end-to-end documentation, automated pytest test suite, and Docker containerization (Gained 28 GitHub stars).",
      ]),
      detailedVersion: "**Enterprise RAG Pipeline** | Python, FastAPI, LangChain, Qdrant, Docker\n- Objective: High-throughput Retrieval-Augmented Generation pipeline with hybrid search and re-ranking.\n- Key Features:\n  * Implemented sparse and dense hybrid retrieval over domain documents\n  * Integrated cross-encoder re-ranking to filter irrelevant context chunks\n  * Containerized with Docker and tested via pytest\n- Milestones: Gained 28 GitHub stars; Achieved 92% repository health score",
      isFavorite: true,
    },
  });

  // 6. Create Initial Sync Log
  await prisma.syncLog.create({
    data: {
      userId: user.id,
      source: "GITHUB",
      status: "SUCCESS",
      details: "Initialized demonstration knowledge hub with 3 analyzed repositories and verified milestones.",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
