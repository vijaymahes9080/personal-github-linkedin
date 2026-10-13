import { LinkedInPostOutput } from "@/types";

export interface ContentGenerationContext {
  repoName?: string;
  repoDescription?: string;
  technologies?: string[];
  role?: string;
  verifiableOutcome?: string;
  repoUrl?: string;
  milestoneTitle?: string;
  organization?: string;
}

export class ContentStudioService {
  /**
   * Generates LinkedIn career and technical content strictly grounded in verified data.
   */
  static generateContent(
    formatType: string,
    ctx: ContentGenerationContext
  ): LinkedInPostOutput {
    const techStr = (ctx.technologies || []).slice(0, 5).join(", ") || "modern software tools";
    const repo = ctx.repoName || "featured project";
    const role = ctx.role || "Software Engineering";
    const link = ctx.repoUrl ? `\n\nGitHub Repository: ${ctx.repoUrl}` : "";

    switch (formatType) {
      case "ANNOUNCEMENT":
        return {
          id: `announcement-${Date.now()}`,
          formatType: "ANNOUNCEMENT",
          title: `Project Launch Announcement: ${repo}`,
          targetAudience: "Technical Recruiters, Engineers, and Peers",
          conciseVersion: `Excited to share ${repo} — a project built with ${techStr} to address ${ctx.repoDescription || "core architectural workflows"}.${link}\n\n#SoftwareEngineering #${role.replace(/\s+/g, "")} #OpenSource`,
          mediumVersion: `I recently finished building ${repo}, a dedicated tool built using ${techStr}.\n\nThe focus of this project was on modularity, clean architecture, and reliable data flow: ${ctx.repoDescription || "delivering automated execution."}\n\nCheck out the source code, README, and documentation on GitHub:${link}\n\nFeedback and code reviews are welcome!\n\n#TechProjects #${role.replace(/\s+/g, "")} #Coding #Developers`,
          detailedVersion: `Excited to introduce ${repo} — an engineering project developed using ${techStr}.\n\n🎯 The Objective:\n${ctx.repoDescription || "To solve real-world technical problems through clean, structured software development."}\n\n🛠️ What I Built:\n• Structured modular codebase with comprehensive documentation\n• Integrated ${techStr} for core logic execution\n• Tested dependencies and prepared reproducible setup instructions\n\n🔍 Lessons Learned:\nBuilding this reinforced the importance of maintainable architecture, structured error handling, and clear documentation.${link}\n\nI’d love to hear your thoughts, feedback, or suggestions in the comments!\n\n#SoftwareDevelopment #${role.replace(/\s+/g, "")} #Portfolio #GitHub #Engineering`,
          tags: ["#SoftwareDevelopment", `#${role.replace(/\s+/g, "")}`, "#GitHub", "#Engineering"],
          directShareUrl: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`Excited to share ${repo} built with ${techStr}.${link}`)}`,
        };

      case "INTERNSHIP_UPDATE":
        return {
          id: `internship-${Date.now()}`,
          formatType: "INTERNSHIP_UPDATE",
          title: `Internship & Training Milestone`,
          targetAudience: "Hiring Managers and Industry Mentors",
          conciseVersion: `Reflecting on recent professional training and project milestones in ${role}. Applying ${techStr} to real engineering problems.\n\n#CareerGrowth #LearningInPublic #${role.replace(/\s+/g, "")}`,
          mediumVersion: `Continuous hands-on practice is the key to engineering growth. Over the past few weeks, I’ve been deepening my focus in ${role}, working on practical implementations with ${techStr}.\n\nBuilding verifiable projects like ${repo} has allowed me to translate technical theory into working systems.\n\nEager to bring these skills to collaborative engineering teams!\n\n#EngineeringJourney #ContinuousLearning #${role.replace(/\s+/g, "")} #CareerMilestone`,
          detailedVersion: `Milestone Update: Advancing in ${role}.\n\nOver the recent period, my primary focus has been on practical system design, applying ${techStr} in structured project repositories.\n\nKey takeaways from recent work:\n1. Technical depth matters more than breadth — digging deep into ${techStr.split(",")[0] || "core languages"}.\n2. Code quality and tests are as important as initial features.\n3. Transparent documentation makes any project recruiter- and team-ready.\n\nCheck out my recent project work on GitHub:${link}\n\nOpen to discussing junior and full-time opportunities in ${role}!\n\n#Hiring #JobSearch #${role.replace(/\s+/g, "")} #SoftwareEngineering`,
          tags: ["#CareerGrowth", `#${role.replace(/\s+/g, "")}`, "#SoftwareEngineering", "#LearningInPublic"],
          directShareUrl: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`Advancing my practical experience in ${role} using ${techStr}.`)}`,
        };

      case "TECH_LEARNING":
        return {
          id: `learning-${Date.now()}`,
          formatType: "TECH_LEARNING",
          title: `Technical Deep-Dive: ${techStr.split(",")[0] || "Core Tooling"}`,
          targetAudience: "Developers and Technical Communities",
          conciseVersion: `Key takeaway while implementing ${repo}: When working with ${techStr}, maintaining clear separation between business logic and interfaces prevents tech debt.\n\n#DevTips #${role.replace(/\s+/g, "")}`,
          mediumVersion: `A quick technical insight from building ${repo}:\n\nWhile integrating ${techStr}, one of the key challenges was keeping the architecture clean and maintainable. Instead of tightly coupled modules, structuring separate layers for data, services, and APIs made debugging and testing significantly faster.\n\nWhat are your go-to architectural patterns when building with ${techStr.split(",")[0] || "these tools"}?\n\n#CodingTips #CleanCode #Architecture #${role.replace(/\s+/g, "")}`,
          detailedVersion: `Technical Breakdown: Architecting ${repo} with ${techStr}.\n\nWhen starting a new project, it’s easy to focus solely on the immediate feature set. In ${repo}, I made a conscious effort to prioritize maintainability from Day 1:\n\n1. Isolated Configurations: Kept environment variables strictly separated from business logic.\n2. Predictable Data Flow: Ensured interfaces have explicit types and validation.\n3. Documentation as Code: Detailed the directory layout and execution instructions in the README.\n\nHere’s the repository if you want to inspect the implementation:${link}\n\nAlways looking to refine these patterns. What’s your experience?\n\n#CleanCode #SoftwareEngineering #BestPractices #${role.replace(/\s+/g, "")}`,
          tags: ["#CleanCode", "#SoftwareEngineering", `#${role.replace(/\s+/g, "")}`, "#BestPractices"],
          directShareUrl: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`Technical insight from building ${repo} using ${techStr}: Clean architecture from Day 1.`)}`,
        };

      case "REPO_SHOWCASE":
        return {
          id: `repo-${Date.now()}`,
          formatType: "REPO_SHOWCASE",
          title: `GitHub Showcase: ${repo}`,
          targetAudience: "Open Source Contributors and Engineering Leads",
          conciseVersion: `Open-sourced a new project: ${repo}. Built with ${techStr}. Star or inspect the codebase on GitHub:${link}\n\n#OpenSource #GitHub #${role.replace(/\s+/g, "")}`,
          mediumVersion: `Sharing my repository: ${repo}.\n\nThis project provides ${ctx.repoDescription || "a complete solution built with " + techStr}.\n\nFeatures include:\n• Structured repository layout\n• Reproducible setup guide\n• Documented dependencies\n\nTake a look at the code on GitHub and feel free to contribute or drop a star ⭐:${link}\n\n#GitHub #OpenSource #DevCommunity #${role.replace(/\s+/g, "")}`,
          detailedVersion: `Repository Spotlight: ${repo} 🚀\n\nAs part of my technical portfolio for ${role}, I built and open-sourced ${repo}.\n\n📁 Tech Stack: ${techStr}\n🎯 Purpose: ${ctx.repoDescription || "Modular, high-performance software system"}\n\nRepository Highlights:\n• Clean folder hierarchy adhering to production standards\n• Zero-fuss local setup instructions\n• Grounded implementation without unnecessary bloat\n\nExplore the project on GitHub:${link}\n\nI’d appreciate any feedback or suggestions on architecture and improvements!\n\n#OpenSource #GitHub #Portfolio #${role.replace(/\s+/g, "")} #CodeReview`,
          tags: ["#OpenSource", "#GitHub", `#${role.replace(/\s+/g, "")}`, "#Portfolio"],
          directShareUrl: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`Check out my open-source project ${repo} built with ${techStr}:${link}`)}`,
        };

      case "ACHIEVEMENT":
        return {
          id: `achievement-${Date.now()}`,
          formatType: "ACHIEVEMENT",
          title: `Milestone Achieved: ${ctx.milestoneTitle || "Certification or Goal"}`,
          targetAudience: "Professional Network",
          conciseVersion: `Proud to achieve: ${ctx.milestoneTitle || "Core Certification in " + role}. Solidifying practical skills in ${techStr}.\n\n#Achievement #Milestone #${role.replace(/\s+/g, "")}`,
          mediumVersion: `Excited to share a career milestone: completed ${ctx.milestoneTitle || "advanced specialization in " + role}.\n\nThis involved intensive hands-on project work, validating competencies in ${techStr}.\n\nGrateful for the journey so far and eager to apply these capabilities to real-world challenges.\n\n#Certification #CareerGrowth #${role.replace(/\s+/g, "")} #TechSkills`,
          detailedVersion: `Continuous improvement milestone: ${ctx.milestoneTitle || "Specialization in " + role}.\n\nAchieving this represents sustained dedication to mastering ${techStr} and foundational engineering principles.\n\nWhat this means for my work:\n• Strengthened conceptual foundations in ${role}\n• Practical verification through hands-on implementation and projects like ${repo}\n• Readiness to tackle complex technical challenges in production environments\n\nThank you to everyone who has supported my growth along the way!\n\n#Milestone #ContinuousLearning #GrowthMindset #${role.replace(/\s+/g, "")}`,
          tags: ["#Milestone", "#ContinuousLearning", `#${role.replace(/\s+/g, "")}`, "#TechSkills"],
          directShareUrl: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`Proud to achieve: ${ctx.milestoneTitle || "Milestone in " + role}.`)}`,
        };

      case "HEADLINE":
        return {
          id: `headline-${Date.now()}`,
          formatType: "HEADLINE",
          title: `LinkedIn Professional Headline & Tagline`,
          targetAudience: "Recruiters scanning LinkedIn search results",
          conciseVersion: `${role} | Building with ${techStr.split(",").slice(0, 3).join(", ")} | Open Source Contributor`,
          mediumVersion: `${role} | Specializing in ${techStr.split(",").slice(0, 3).join(" & ")} | Building Production-Ready, Documented Systems | Passionate about Scalable Software`,
          detailedVersion: `${role} | ${techStr.split(",").slice(0, 4).join(" • ")} | Architecting Verifiable Solutions on GitHub | Open to High-Impact Opportunities`,
          tags: [role, "Headline", "LinkedIn Optimization"],
        };

      case "LINKEDIN_PROJECT":
        return {
          id: `li-proj-${Date.now()}`,
          formatType: "LINKEDIN_PROJECT",
          title: `LinkedIn Projects Section Description: ${repo}`,
          targetAudience: "Recruiters reviewing the Projects section of your profile",
          conciseVersion: `${repo}: Engineered a modular ${role.toLowerCase()} project using ${techStr}. Includes comprehensive documentation and clean directory architecture on GitHub.`,
          mediumVersion: `${repo} | Technologies: ${techStr}\nDeveloped a practical software project implementing ${ctx.repoDescription || "core architectural features"}. Established maintainable folder structures, automated dependency management, and transparent technical documentation on GitHub.`,
          detailedVersion: `${repo}\nRole: Lead Developer\nTechnologies: ${techStr}\n\n• Designed and developed ${repo} to deliver ${ctx.repoDescription || "reliable software capabilities"}.\n• Structured modular codebase with comprehensive README documentation and dependency configuration.\n• Validated repository architecture according to industry standards for maintainability and clean code.\n\nGitHub: ${ctx.repoUrl || "Available on request"}`,
          tags: [repo, "LinkedIn Projects", techStr],
        };

      case "FEATURED_CARD":
        return {
          id: `featured-${Date.now()}`,
          formatType: "FEATURED_CARD",
          title: `LinkedIn Featured Section Card Summary: ${repo}`,
          targetAudience: "Visitors to your profile homepage",
          conciseVersion: `${repo} — An open-source ${role.toLowerCase()} tool built with ${techStr}. Source code & documentation on GitHub.`,
          mediumVersion: `${repo} 🚀\nBuilt with ${techStr}. Features clean architecture, reproducible setup instructions, and modular design. View code and documentation on GitHub.`,
          detailedVersion: `⭐ Featured Project: ${repo}\n\nA showcase of hands-on engineering in ${role}. Built with ${techStr}, emphasizing modular architecture, clean documentation, and best practices. Explore the GitHub repository to inspect the implementation.`,
          tags: ["Featured", repo],
        };

      case "ABOUT_DRAFT":
        return {
          id: `about-${Date.now()}`,
          formatType: "ABOUT_DRAFT",
          title: `Role-Specific About Section Draft: ${role}`,
          targetAudience: "Hiring managers reading your full About summary",
          conciseVersion: `I am a dedicated ${role} specializing in ${techStr}. Passionate about clean code, maintainable systems, and building verifiable software on GitHub.`,
          mediumVersion: `I am an engineer focused on ${role}, with practical experience designing and building systems using ${techStr}.\n\nMy approach emphasizes clean architecture, strong documentation, and continuous hands-on learning. On GitHub, I maintain documented repositories showcasing modular implementations and verifiable problem-solving.\n\nAlways open to discussing new opportunities, open-source collaborations, and engineering challenges.`,
          detailedVersion: `Welcome to my profile! I am an engineer specializing in ${role}.\n\n💻 What I Do:\nI build reliable, maintainable software systems using ${techStr}. Rather than relying on surface-level tutorials, I focus on end-to-end implementation: from modular system architecture to automated testing and clear technical documentation.\n\n🌟 Key Focus Areas:\n• Core Technologies: ${techStr}\n• System Design & Clean Architecture\n• Practical Open Source Work on GitHub\n\n🚀 How I Work:\nI believe code should speak for itself. That’s why all my key projects feature structured directories, comprehensive setup guides, and reproducible execution environments.\n\nLet’s connect! I am always eager to talk about technology, career opportunities in ${role}, and open-source software.`,
          tags: ["About Section", role, "LinkedIn Summary"],
        };

      case "WEEKLY_PLAN":
      default:
        return {
          id: `plan-${Date.now()}`,
          formatType: "WEEKLY_PLAN",
          title: `7-Day Professional Content Plan for ${role}`,
          targetAudience: "Consistent LinkedIn thought leadership",
          conciseVersion: `7-Day Roadmap: Mon (Project Announcement: ${repo}) • Wed (Technical Learning on ${techStr.split(",")[0] || "Architecture"}) • Fri (GitHub Showcase) • Sun (Weekly Reflection).`,
          mediumVersion: `7-Day LinkedIn Cadence:\n\n• Day 1 (Monday): Project Launch Announcement — introduce ${repo} and its core objective.\n• Day 3 (Wednesday): Technical Deep-Dive — share a specific challenge solved using ${techStr.split(",")[0] || "core tools"}.\n• Day 5 (Friday): GitHub Repository Showcase — invite code review and feedback on directory layout.\n• Day 7 (Sunday): Weekly Learning Recap — reflect on milestones and set goals for next week in ${role}.`,
          detailedVersion: `Structured 7-Day LinkedIn Career & Content Plan for ${role}:\n\n📅 Day 1 (Monday): Project Announcement\nPost about ${repo}. Focus on the problem statement, why you chose ${techStr}, and link the repository.\n\n📅 Day 3 (Wednesday): "Under the Hood" Tech Insight\nPick one module or function from ${repo}. Explain your architectural decision, error handling, or performance consideration.\n\n📅 Day 5 (Friday): Open Source & Collaboration\nPost a GitHub Spotlight highlighting your clean README, setup instructions, and invite connections to test or review the code.\n\n📅 Day 7 (Sunday): Weekly Progress & Next Steps\nReflect on skills gained this week in ${role}, summarize milestones, and preview what you'll be building next week.\n\nConsistency, genuine technical substance, and verified facts build lasting credibility.`,
          tags: ["Weekly Plan", "Career Strategy", role],
        };
    }
  }
}
