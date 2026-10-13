import { RoleSkillRequirement, TargetRole } from "@/types";

export const PRESET_ROLES: TargetRole[] = [
  "AI Engineer",
  "Machine Learning Engineer",
  "Data Analyst",
  "Python Full Stack Developer",
  "Embedded Systems Engineer",
  "Software Developer",
  "Backend Engineer",
  "Frontend Engineer",
  "Cloud / DevOps Engineer",
  "Data Engineer",
  "Researcher or Academic Professional",
];

export const ROLE_TAXONOMY: Record<string, RoleSkillRequirement> = {
  "AI Engineer": {
    role: "AI Engineer",
    category: "Artificial Intelligence & LLMs",
    coreSkills: ["Python", "PyTorch", "Transformers", "LangChain", "LlamaIndex", "Vector Databases", "FastAPI", "Prompt Engineering", "Fine-tuning", "RAG"],
    recommendedTechnologies: ["ChromaDB", "Qdrant", "Hugging Face", "OpenAI API", "Ollama", "Docker", "ONNX", "vLLM"],
    criticalConcepts: ["Retrieval-Augmented Generation (RAG)", "Semantic Search", "Embeddings", "Agentic Workflows", "Evaluation Benchmarks", "Latency Optimization"],
    sampleProjectIdeas: [
      "Production RAG Pipeline with Hybrid Search and Re-ranking",
      "Autonomous Multi-Agent Task Orchestrator with Tool Calling",
      "Local LLM Inference Engine with Quantization (vLLM / Ollama)",
      "Domain-Specific Knowledge Base QA System with Citations",
    ],
    atsKeywords: ["RAG", "LLM", "Vector DB", "Embeddings", "LangChain", "PyTorch", "Prompt Engineering", "Semantic Search", "FastAPI", "Agentic AI"],
  },
  "Machine Learning Engineer": {
    role: "Machine Learning Engineer",
    category: "ML Modeling & Operations",
    coreSkills: ["Python", "Scikit-Learn", "PyTorch", "TensorFlow", "MLflow", "DVC", "Docker", "Feature Engineering", "Pandas", "NumPy"],
    recommendedTechnologies: ["FastAPI", "Kubeflow", "Airflow", "Optuna", "ONNX Runtime", "AWS SageMaker", "PostgreSQL"],
    criticalConcepts: ["Model Drift Detection", "Data Validation", "Hyperparameter Tuning", "Cross-Validation", "CI/CD for ML (MLOps)", "Serving Latency"],
    sampleProjectIdeas: [
      "End-to-End Predictive Maintenance Pipeline with MLflow Tracking",
      "Real-time Fraud Detection Microservice with Model Monitoring",
      "Customer Churn Forecasting Model with Feature Store Integration",
      "Computer Vision Defect Inspection with TensorRT Optimization",
    ],
    atsKeywords: ["MLOps", "Model Deployment", "MLflow", "Feature Engineering", "Hyperparameter Optimization", "Scikit-Learn", "PyTorch", "Data Pipelines", "Model Drift"],
  },
  "Data Analyst": {
    role: "Data Analyst",
    category: "Business Intelligence & Analytics",
    coreSkills: ["SQL", "Python", "Pandas", "Power BI", "Tableau", "Excel", "Data Visualization", "Statistical Analysis", "ETL", "Matplotlib / Seaborn"],
    recommendedTechnologies: ["DuckDB", "PostgreSQL", "Snowflake", "BigQuery", "Plotly", "Streamlit", "Jupyter"],
    criticalConcepts: ["Cohort Analysis", "A/B Testing", "KPI Dashboards", "Data Cleaning", "Data Storytelling", "Statistical Significance"],
    sampleProjectIdeas: [
      "Interactive Sales & Customer Retention Dashboard with Cohort Breakdown",
      "E-commerce Pricing Elasticity & Funnel Conversion Analysis",
      "Automated Financial Reporting Pipeline with Automated Data Validation",
      "Healthcare Outcomes Risk Factor Statistical Analysis",
    ],
    atsKeywords: ["SQL", "Data Visualization", "Pandas", "Power BI", "A/B Testing", "Cohort Analysis", "ETL", "Business Intelligence", "KPI Reporting"],
  },
  "Python Full Stack Developer": {
    role: "Python Full Stack Developer",
    category: "Full Stack Web Engineering",
    coreSkills: ["Python", "Django", "FastAPI", "Flask", "JavaScript / TypeScript", "React", "PostgreSQL", "REST APIs", "Docker", "Git"],
    recommendedTechnologies: ["Next.js", "Redis", "Celery", "SQLAlchemy", "Tailwind CSS", "GitHub Actions", "pytest"],
    criticalConcepts: ["Asynchronous Task Queues", "Relational Database Indexing", "Authentication & JWT / OAuth", "API Versioning", "Containerization", "State Management"],
    sampleProjectIdeas: [
      "SaaS Project Management Platform with Real-Time WebSockets and Celery Tasks",
      "High-Throughput E-commerce REST API with FastAPI and PostgreSQL",
      "Analytics Dashboard with Next.js Frontend and Python Microservice Backend",
      "Content Publishing Platform with Markdown Processing and Role-Based Access Control",
    ],
    atsKeywords: ["Python", "FastAPI", "Django", "React", "PostgreSQL", "RESTful API", "Docker", "Celery", "Redis", "TypeScript", "Full Stack"],
  },
  "Embedded Systems Engineer": {
    role: "Embedded Systems Engineer",
    category: "Hardware & Firmware Engineering",
    coreSkills: ["C", "C++", "Microcontrollers", "RTOS", "UART / SPI / I2C", "PCB Design Basics", "Debugging (JTAG/SWD)", "Low-Power Optimization", "Git"],
    recommendedTechnologies: ["FreeRTOS", "STM32", "ESP32", "PlatformIO", "KiCad", "CMake", "Linux Embedded", "Saleae Logic"],
    criticalConcepts: ["Memory Management in Constrained Systems", "Interrupt Service Routines (ISRs)", "Watchdog Timers", "Hardware Protocols", "DMA Transfers"],
    sampleProjectIdeas: [
      "Low-Power IoT Environmental Sensor Node with FreeRTOS and BLE",
      "Automotive CAN-Bus Telemetry Logger with Real-Time Data Streaming",
      "Custom Firmware Bootloader for Microcontroller OTA Updates",
      "Robotic Motor Control System with PID Loop on STM32",
    ],
    atsKeywords: ["Embedded C", "C++", "RTOS", "FreeRTOS", "Microcontrollers", "STM32", "I2C", "SPI", "UART", "Firmware Development", "Low-Power"],
  },
  "Software Developer": {
    role: "Software Developer",
    category: "General Software Engineering",
    coreSkills: ["TypeScript / JavaScript", "Python or Java", "Data Structures & Algorithms", "Git", "SQL", "REST APIs", "Unit Testing", "Object-Oriented Design"],
    recommendedTechnologies: ["Docker", "Linux", "Node.js", "PostgreSQL", "Jest / Pytest", "CI/CD Pipelines"],
    criticalConcepts: ["Clean Architecture", "SOLID Principles", "Code Quality & Refactoring", "Design Patterns", "Database Transactions", "Error Handling"],
    sampleProjectIdeas: [
      "Collaborative Task Management Tool with WebSockets and Activity Feed",
      "Distributed Rate Limiter Service with Redis and Token Bucket Algorithm",
      "File Storage & Metadata Indexing Service with Cloud Integration",
      "Modular Plugin-Based CLI Tool for Developer Workflow Automation",
    ],
    atsKeywords: ["Software Engineering", "REST APIs", "Unit Testing", "System Design", "SQL", "Git", "Docker", "TypeScript", "Clean Code"],
  },
  "Backend Engineer": {
    role: "Backend Engineer",
    category: "Distributed Systems & Services",
    coreSkills: ["Go, Python, or Java", "PostgreSQL", "Redis", "Docker", "Microservices", "REST & gRPC", "Message Queues (Kafka/RabbitMQ)", "System Architecture"],
    recommendedTechnologies: ["Kubernetes", "Prometheus / Grafana", "GitHub Actions", "Elasticsearch", "SQLAlchemy / GORM"],
    criticalConcepts: ["Concurrency & Race Conditions", "Database Sharding & Replication", "Caching Strategies", "Distributed Tracing", "Idempotency"],
    sampleProjectIdeas: [
      "Event-Driven Order Processing System with RabbitMQ and Event Sourcing",
      "High-Concurrency URL Shortener with Distributed Caching and Rate Limiting",
      "Notification Dispatch Engine Supporting WebSockets, Email, and Push Notifications",
    ],
    atsKeywords: ["Backend Engineering", "Microservices", "PostgreSQL", "Redis", "Kafka", "Docker", "REST API", "gRPC", "Scalability", "Distributed Systems"],
  },
  "Frontend Engineer": {
    role: "Frontend Engineer",
    category: "User Interfaces & Web Performance",
    coreSkills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "HTML5 & Semantic Web", "State Management", "Web Performance (Core Web Vitals)", "Responsive Design"],
    recommendedTechnologies: ["Motion", "Playwright / Vitest", "GraphQL / REST", "Zustand", "Radix UI / Shadcn"],
    criticalConcepts: ["Component Architecture", "Accessibility (a11y / WCAG)", "Rendering Performance", "Server vs. Client State", "Bundle Size Optimization"],
    sampleProjectIdeas: [
      "Design System Component Library with Fluid Animations and Full WCAG AA Compliance",
      "Interactive Financial Charting Dashboard with Real-time Data Streaming",
      "Offline-First Progressive Web App with IndexedDB and Background Sync",
    ],
    atsKeywords: ["Frontend Development", "React", "TypeScript", "Next.js", "Tailwind CSS", "Web Performance", "Accessibility", "Responsive Design"],
  },
  "Cloud / DevOps Engineer": {
    role: "Cloud / DevOps Engineer",
    category: "Infrastructure & Platform Engineering",
    coreSkills: ["Linux", "Docker", "Kubernetes", "Terraform", "CI/CD (GitHub Actions / GitLab CI)", "AWS / GCP / Azure", "Bash Scripting", "Prometheus & Grafana"],
    recommendedTechnologies: ["Ansible", "Helm", "ArgoCD", "Nginx", "Cloudflare", "OpenTelemetry"],
    criticalConcepts: ["Infrastructure as Code (IaC)", "Zero-Downtime Deployments", "Secret Management", "Site Reliability & SLIs/SLOs", "Security Hardening"],
    sampleProjectIdeas: [
      "GitOps Kubernetes Deployment Pipeline with ArgoCD and Helm",
      "Multi-Region AWS Infrastructure Provisioned via Terraform with Remote State",
      "Observability Stack with Prometheus, Grafana, and Automated PagerDuty Alerts",
    ],
    atsKeywords: ["DevOps", "Kubernetes", "Docker", "Terraform", "CI/CD", "AWS", "Infrastructure as Code", "Linux", "Observability", "Cloud Engineering"],
  },
  "Data Engineer": {
    role: "Data Engineer",
    category: "Big Data & Pipeline Engineering",
    coreSkills: ["Python", "SQL", "Apache Spark", "Airflow", "Kafka", "Data Warehousing (Snowflake/BigQuery)", "dbt", "PostgreSQL"],
    recommendedTechnologies: ["Delta Lake", "DuckDB", "Docker", "AWS S3", "Parquet", "PySpark"],
    criticalConcepts: ["Data Lakehouse Architecture", "Idempotent DAGs", "Data Quality Testing", "Schema Evolution", "Partitioning & Partition Pruning"],
    sampleProjectIdeas: [
      "Streaming ETL Pipeline with Kafka, Spark Streaming, and Delta Lake Storage",
      "Automated dbt Data Modeling Pipeline with Soda Data Quality Validation",
      "Cloud Data Warehouse Ingestion System with CDC (Change Data Capture)",
    ],
    atsKeywords: ["Data Engineering", "Apache Spark", "Airflow", "SQL", "Python", "ETL Pipelines", "dbt", "Kafka", "Data Modeling", "Data Warehousing"],
  },
  "Researcher or Academic Professional": {
    role: "Researcher or Academic Professional",
    category: "Research, Papers & Applied Experiments",
    coreSkills: ["Python", "PyTorch", "LaTeX", "NumPy", "SciPy", "Matplotlib", "Experiment Tracking", "Scientific Writing", "Statistical Hypothesis Testing"],
    recommendedTechnologies: ["Weights & Biases", "JupyterLab", "Pandas", "BibTeX", "ArXiv Tools", "Hugging Face"],
    criticalConcepts: ["Reproducibility", "Ablation Studies", "Empirical Evaluation", "Literature Review Synthesis", "Peer Review Standards"],
    sampleProjectIdeas: [
      "Reproducible Benchmark Pipeline for Neural Architecture Search with Ablation Reports",
      "Empirical Analysis of Attention Heads in Transformer Models with Heatmap Visualizations",
      "Open-Source Benchmark Dataset Preprocessing and Baseline Evaluation Suite",
    ],
    atsKeywords: ["Scientific Research", "PyTorch", "Empirical Evaluation", "Statistical Analysis", "Reproducibility", "Ablation Study", "LaTeX", "Machine Learning"],
  },
};

export function getRoleRequirement(roleName: string): RoleSkillRequirement {
  const normalized = roleName.trim().toLowerCase();
  for (const [key, req] of Object.entries(ROLE_TAXONOMY)) {
    if (key.toLowerCase() === normalized || normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return req;
    }
  }

  // Fallback for custom role query
  return {
    role: roleName,
    category: "Software & Technology Engineering",
    coreSkills: ["Problem Solving", "System Design", "Documentation", "Testing", "Git", "API Integration"],
    recommendedTechnologies: ["Python", "TypeScript", "Docker", "SQL", "Linux"],
    criticalConcepts: ["Clean Architecture", "Code Readability", "Automated Testing", "Modularity"],
    sampleProjectIdeas: [
      `Production-grade showcase project tailored for ${roleName}`,
      `Technical assessment or microservice addressing key ${roleName} challenges`,
    ],
    atsKeywords: [roleName, "Software Engineering", "System Design", "Best Practices", "Testing"],
  };
}
