/**
 * Content Safety & Moderation Module for Vilo AI Avatar Studio
 * Provides safeguards against:
 * 1. Abusive, hateful, illegal, or harassing script content
 * 2. Unauthorized public figure / celebrity avatar impersonation
 * 3. Malicious upload file formats, path traversals, or oversized payloads
 */

export interface SafetyCheckResult {
  allowed: boolean;
  flaggedCategories: string[];
  reasons: string[];
  sanitizedScript?: string;
}

export interface FileSafetyResult {
  allowed: boolean;
  reason?: string;
  sanitizedFileName?: string;
}

// Restricted impersonation targets without verified licensing / authorization
const RESTRICTED_PUBLIC_FIGURES = [
  "elon musk",
  "donald trump",
  "joe biden",
  "barack obama",
  "taylor swift",
  "bill gates",
  "mark zuckerberg",
  "jeff bezos",
  "vladimir putin",
  "narendra modi",
  "cristiano ronaldo",
  "lionel messi",
];

// Restricted toxic / harmful keywords and patterns
const HARMFUL_PATTERNS: Array<{ category: string; regex: RegExp; reason: string }> = [
  {
    category: "hate_speech",
    regex: /\b(hate\s+speech|kill\s+all|exterminate|racial\s+slur)\b/i,
    reason: "Script contains prohibited discriminatory or hate speech terms.",
  },
  {
    category: "harassment",
    regex: /\b(doxx|doxxing|harass|stalk\s+you|threaten\s+you)\b/i,
    reason: "Script contains targeted harassment or threat patterns.",
  },
  {
    category: "violence_and_threats",
    regex: /\b(bomb\s+threat|bomb|explosive|terror|terrorist|terrorism|violence|murder|assassinate|suicide|massacre)\b/i,
    reason: "Script references prohibited violence, terrorism, or threat patterns.",
  },
  {
    category: "illegal_acts",
    regex: /\b(how\s+to\s+make\s+a\s+bomb|steal\s+credit\s+cards|ddos\s+attack|ransomware\s+deploy|money\s+laundering)\b/i,
    reason: "Script references prohibited illegal instructions or cyber attacks.",
  },
  {
    category: "malicious_script",
    regex: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    reason: "Script contains dangerous raw HTML / executable script injection.",
  },
];

export class ContentSafetyService {
  private static instance: ContentSafetyService;

  public static getInstance(): ContentSafetyService {
    if (!ContentSafetyService.instance) {
      ContentSafetyService.instance = new ContentSafetyService();
    }
    return ContentSafetyService.instance;
  }

  /**
   * Evaluates text script for toxicity, harassment, injection, and safety compliance.
   */
  public evaluateScript(script: string, customAvatarName?: string): SafetyCheckResult {
    const flaggedCategories: string[] = [];
    const reasons: string[] = [];
    const normalized = (script || "").trim().toLowerCase();

    if (!normalized) {
      return {
        allowed: false,
        flaggedCategories: ["empty_input"],
        reasons: ["Script text cannot be empty."],
      };
    }

    // 1. Harmful Pattern Analysis
    for (const pattern of HARMFUL_PATTERNS) {
      if (pattern.regex.test(normalized)) {
        flaggedCategories.push(pattern.category);
        reasons.push(pattern.reason);
      }
    }

    // 2. Impersonation Guard
    for (const figure of RESTRICTED_PUBLIC_FIGURES) {
      if (normalized.includes(`i am ${figure}`) || normalized.includes(`my name is ${figure}`)) {
        flaggedCategories.push("unauthorized_impersonation");
        reasons.push(`Impersonation of public figure '${figure}' is prohibited without verified authorization.`);
      }
    }

    if (customAvatarName) {
      const normName = customAvatarName.toLowerCase();
      if (RESTRICTED_PUBLIC_FIGURES.some((fig) => normName.includes(fig))) {
        flaggedCategories.push("unauthorized_avatar_name");
        reasons.push(`Avatar name matches restricted public figure '${customAvatarName}'.`);
      }
    }

    // 3. Sanitization (Strip control characters & HTML tags)
    const sanitizedScript = script
      .replace(/<[^>]*>?/gm, "") // Strip HTML tags
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Strip non-printable ASCII
      .trim();

    return {
      allowed: flaggedCategories.length === 0,
      flaggedCategories,
      reasons,
      sanitizedScript,
    };
  }

  /**
   * Validates uploaded files for MIME whitelist, size restrictions, and path safety.
   */
  public validateUploadedFile(
    fileName: string,
    mimeType: string,
    fileSizeBytes: number,
    type: "image" | "audio" | "video"
  ): FileSafetyResult {
    // 1. Path Traversal & Name Sanitization
    const sanitizedFileName = fileName.replace(/(\.\.[\/\\]|[\/\\])/g, "_").trim();

    // 2. Size Limits
    const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
    const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25MB
    const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

    if (type === "image" && fileSizeBytes > MAX_IMAGE_BYTES) {
      return { allowed: false, reason: "Image file exceeds maximum allowed size of 10MB." };
    }
    if (type === "audio" && fileSizeBytes > MAX_AUDIO_BYTES) {
      return { allowed: false, reason: "Audio file exceeds maximum allowed size of 25MB." };
    }
    if (type === "video" && fileSizeBytes > MAX_VIDEO_BYTES) {
      return { allowed: false, reason: "Video file exceeds maximum allowed size of 100MB." };
    }

    // 3. MIME Whitelist
    const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const ALLOWED_AUDIO_MIMES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"];
    const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/webm", "video/quicktime"];

    if (type === "image" && !ALLOWED_IMAGE_MIMES.includes(mimeType.toLowerCase())) {
      return { allowed: false, reason: `Disallowed image MIME type: ${mimeType}` };
    }
    if (type === "audio" && !ALLOWED_AUDIO_MIMES.includes(mimeType.toLowerCase())) {
      return { allowed: false, reason: `Disallowed audio MIME type: ${mimeType}` };
    }
    if (type === "video" && !ALLOWED_VIDEO_MIMES.includes(mimeType.toLowerCase())) {
      return { allowed: false, reason: `Disallowed video MIME type: ${mimeType}` };
    }

    return { allowed: true, sanitizedFileName };
  }
}

export const contentSafetyService = ContentSafetyService.getInstance();
