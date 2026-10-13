import { prisma } from "./db";

export interface ParsedLinkedInData {
  positions: Array<{ title: string; company: string; dates: string; description: string }>;
  skills: string[];
  certifications: Array<{ title: string; issuer: string; dates: string; credentialUrl?: string }>;
  education: Array<{ school: string; degree: string; dates: string }>;
  projects: Array<{ title: string; description: string; url?: string }>;
}

export class LinkedInService {
  /**
   * Parses official LinkedIn Data Export CSV format.
   */
  static parseCSV(csvContent: string): Array<Record<string, string>> {
    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Parse header
    const headers = this.parseCSVLine(lines[0]);
    const results: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h.trim()] = values[idx]?.trim() || "";
        });
        results.push(row);
      }
    }
    return results;
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(cur);
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur);
    return result;
  }

  /**
   * Ingests parsed CSV records and converts them to verified ProfessionalFact records.
   */
  static async ingestDataExport(
    csvType: "POSITIONS" | "SKILLS" | "CERTIFICATIONS" | "PROJECTS" | "EDUCATION",
    csvContent: string,
    userId: string
  ) {
    const rows = this.parseCSV(csvContent);
    const createdFacts = [];

    for (const row of rows) {
      if (csvType === "POSITIONS") {
        const title = row["Title"] || row["Role"] || "Software Engineer";
        const company = row["Company Name"] || row["Company"] || "Organization";
        const start = row["Started On"] || "";
        const end = row["Finished On"] || "Present";
        const desc = row["Description"] || "";

        const fact = await prisma.professionalFact.create({
          data: {
            userId,
            category: "POSITION",
            title,
            organization: company,
            startDate: start,
            endDate: end,
            description: desc,
            skills: JSON.stringify([]),
            verificationStatus: "VERIFIED",
            source: "LINKEDIN_CSV",
          },
        });
        createdFacts.push(fact);
      } else if (csvType === "SKILLS") {
        const skillName = row["Name"] || row["Skill"] || "";
        if (skillName) {
          const fact = await prisma.professionalFact.create({
            data: {
              userId,
              category: "SKILL",
              title: skillName,
              verificationStatus: "VERIFIED",
              source: "LINKEDIN_CSV",
            },
          });
          createdFacts.push(fact);
        }
      } else if (csvType === "CERTIFICATIONS") {
        const title = row["Name"] || row["Certification"] || "";
        const issuer = row["Authority"] || row["Issuer"] || "";
        const start = row["Started On"] || "";
        const end = row["Finished On"] || "";
        const url = row["Url"] || "";

        if (title) {
          const fact = await prisma.professionalFact.create({
            data: {
              userId,
              category: "CERTIFICATION",
              title,
              organization: issuer,
              startDate: start,
              endDate: end,
              description: url ? `Credential URL: ${url}` : undefined,
              verificationStatus: "VERIFIED",
              source: "LINKEDIN_CSV",
            },
          });
          createdFacts.push(fact);
        }
      } else if (csvType === "PROJECTS") {
        const title = row["Title"] || "";
        const desc = row["Description"] || "";
        const url = row["Url"] || "";

        if (title) {
          const fact = await prisma.professionalFact.create({
            data: {
              userId,
              category: "PROJECT",
              title,
              description: desc + (url ? ` (Link: ${url})` : ""),
              verificationStatus: "VERIFIED",
              source: "LINKEDIN_CSV",
            },
          });
          createdFacts.push(fact);
        }
      }
    }

    await prisma.syncLog.create({
      data: {
        userId,
        source: "LINKEDIN",
        status: "SUCCESS",
        details: `Imported ${createdFacts.length} verified records from LinkedIn ${csvType} export.`,
      },
    });

    return createdFacts;
  }

  /**
   * Ingests manual profile summary or post content.
   */
  static async ingestManualFact(data: {
    userId: string;
    category: "POSITION" | "CERTIFICATION" | "PROJECT" | "SKILL" | "EDUCATION" | "ACHIEVEMENT" | "LEARNING";
    title: string;
    organization?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    skills?: string[];
    verificationStatus?: "VERIFIED" | "SELF_REPORTED" | "UNVERIFIED";
    relatedRepoId?: string;
  }) {
    return prisma.professionalFact.create({
      data: {
        userId: data.userId,
        category: data.category,
        title: data.title,
        organization: data.organization,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        skills: JSON.stringify(data.skills || []),
        verificationStatus: data.verificationStatus || "SELF_REPORTED",
        source: "MANUAL_INPUT",
        relatedRepoId: data.relatedRepoId,
      },
    });
  }
}
