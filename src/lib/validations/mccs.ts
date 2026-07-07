import { z } from "zod"

// =============================================================================
// MASTER COURSE CREATION SYSTEM (MCCS) - VALIDATION SCHEMAS
// =============================================================================

// Common validation patterns
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// --------------------------------------------------------------------
// BASIC INFO SCHEMA
// --------------------------------------------------------------------
export const basicInfoSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  slug: z.string()
    .regex(slugPattern, "Slug must be lowercase alphanumeric with hyphens only")
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must be less than 100 characters"),
  categoryId: z.string().uuid("Invalid category"),
  difficultyLevelId: z.string().uuid("Invalid difficulty level").optional().nullable(),
  shortDescription: z.string()
    .max(500, "Short description must be less than 500 characters")
    .optional(),
  fullDescription: z.string()
    .max(10000, "Full description must be less than 10000 characters")
    .optional(),
  targetAudience: z.string().max(500).optional(),
  language: z.string().default("English"),
  durationHours: z.coerce.number().min(0).max(1000).optional(),
});

// --------------------------------------------------------------------
// BRANDING & MEDIA SCHEMA
// --------------------------------------------------------------------
export const brandingMediaSchema = z.object({
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional().nullable(),
  introVideoUrl: z.string().url("Invalid intro video URL").optional().nullable(),
  promoVideoUrl: z.string().url("Invalid promo video URL").optional().nullable(),
  trailerVideoUrl: z.string().url("Invalid trailer video URL").optional().nullable(),
});

// --------------------------------------------------------------------
// LEARNING INFO SCHEMA
// --------------------------------------------------------------------
export const learningInfoSchema = z.object({
  learningOutcomes: z.array(z.object({
    id: z.string().optional(),
    outcome: z.string().min(1, "Outcome cannot be empty").max(500),
    orderIndex: z.number(),
  })).optional(),
  objectives: z.array(z.object({
    id: z.string().optional(),
    objective: z.string().min(1, "Objective cannot be empty").max(500),
    orderIndex: z.number(),
  })).optional(),
});

// --------------------------------------------------------------------
// PREREQUISITES SCHEMA
// --------------------------------------------------------------------
export const prerequisitesSchema = z.object({
  prerequisites: z.array(z.object({
    id: z.string().optional(),
    prerequisiteCourseId: z.string().uuid("Invalid prerequisite course"),
    isRequired: z.boolean().default(true),
    minimumGrade: z.number().min(0).max(100).optional().nullable(),
    description: z.string().max(500).optional(),
  })).optional(),
});

// --------------------------------------------------------------------
// REQUIREMENTS SCHEMA
// --------------------------------------------------------------------
export const requirementsSchema = z.object({
  software: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Software name is required").max(200),
    version: z.string().max(50).optional(),
    websiteUrl: z.string().url("Invalid website URL").optional().nullable(),
    installInstructions: z.string().max(2000).optional(),
    isRequired: z.boolean().default(true),
    orderIndex: z.number(),
  })).optional(),
  resources: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Resource title is required").max(200),
    type: z.enum(["LINK", "DOWNLOAD", "DOCUMENT", "EXTERNAL_COURSE", "TOOL"]),
    url: z.string().url("Invalid resource URL"),
    description: z.string().max(500).optional(),
    isDownloadable: z.boolean().default(true),
    orderIndex: z.number(),
  })).optional(),
});

// --------------------------------------------------------------------
// DATASETS SCHEMA
// --------------------------------------------------------------------
export const datasetsSchema = z.object({
  datasets: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Dataset name is required").max(200),
    description: z.string().max(1000).optional(),
    sourceUrl: z.string().url("Invalid source URL").optional().nullable(),
    downloadUrl: z.string().url("Invalid download URL").optional().nullable(),
    fileSize: z.string().max(50).optional(),
    format: z.string().max(20).optional(),
    license: z.string().max(100).optional(),
    isRequired: z.boolean().default(false),
    orderIndex: z.number(),
  })).optional(),
});

// --------------------------------------------------------------------
// CAREER OUTCOMES SCHEMA
// --------------------------------------------------------------------
export const careerOutcomesSchema = z.object({
  careerOutcomes: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Career title is required").max(200),
    description: z.string().max(1000).optional(),
    probability: z.enum(["high", "medium", "low"]).optional(),
    salaryRange: z.string().max(100).optional(),
    orderIndex: z.number(),
  })).optional(),
});

// --------------------------------------------------------------------
// PRICING SCHEMA
// --------------------------------------------------------------------
export const pricingSchema = z.object({
  isFree: z.boolean().default(true),
  price: z.coerce.number().min(0, "Price cannot be negative").optional(),
  pricing: z.object({
    NGN: z.object({
      amount: z.number().min(0),
      currency: z.string().default("NGN"),
    }).optional(),
    USD: z.object({
      amount: z.number().min(0),
      currency: z.string().default("USD"),
    }).optional(),
  }).optional(),
});

// --------------------------------------------------------------------
// SEO SCHEMA
// --------------------------------------------------------------------
export const seoSchema = z.object({
  metaTitle: z.string().max(70, "Meta title must be less than 70 characters").optional(),
  metaDescription: z.string().max(160, "Meta description must be less than 160 characters").optional(),
  keywords: z.array(z.string().max(50)).max(20, "Maximum 20 keywords allowed").optional(),
});

// --------------------------------------------------------------------
// PUBLISHING SCHEMA
// --------------------------------------------------------------------
export const publishingSchema = z.object({
  status: z.enum(["DRAFT", "UNDER_REVIEW", "PUBLISHED", "ARCHIVED"]),
  isActive: z.boolean().default(true),
});

// --------------------------------------------------------------------
// MODULE SCHEMA
// --------------------------------------------------------------------
export const moduleSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string().uuid(),
  title: z.string().min(1, "Module title is required").max(200),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().min(0),
  isPreview: z.boolean().default(false),
});

// --------------------------------------------------------------------
// LESSON SCHEMA
// --------------------------------------------------------------------
export const lessonSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string().uuid(),
  moduleId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Lesson title is required").max(200),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().min(0),
  lessonType: z.enum(["VIDEO", "TEXT", "QUIZ", "EXERCISE", "LIVE", "RESOURCE"]),
  videoUrl: z.string().url("Invalid video URL").optional().nullable(),
  videoDuration: z.coerce.number().min(0).optional(),
  videoProvider: z.string().optional(),
  isPreview: z.boolean().default(false),
  isFree: z.boolean().default(false),
  isActive: z.boolean().default(true),
  content: z.string().optional(),
  contentUrl: z.string().url("Invalid content URL").optional().nullable(),
});

// --------------------------------------------------------------------
// PRACTICAL EXERCISE SCHEMA
// --------------------------------------------------------------------
export const practicalExerciseSchema = z.object({
  id: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional().nullable(),
  moduleId: z.string().uuid().optional().nullable(),
  courseId: z.string().uuid(),
  title: z.string().min(1, "Exercise title is required").max(200),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().min(0),
  instructions: z.string().min(1, "Instructions are required"),
  hints: z.array(z.object({
    level: z.number(),
    text: z.string(),
  })).optional(),
  starterFilesUrl: z.string().url("Invalid starter files URL").optional().nullable(),
  solutionFilesUrl: z.string().url("Invalid solution files URL").optional().nullable(),
  solutionVideoUrl: z.string().url("Invalid solution video URL").optional().nullable(),
  rubrics: z.array(z.object({
    criterion: z.string(),
    points: z.number().min(0),
    description: z.string().optional(),
  })).optional(),
  passingScore: z.coerce.number().min(0).max(100).default(70),
  environmentType: z.string().optional(),
  setupInstructions: z.string().optional(),
  estimatedTime: z.coerce.number().min(0).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
});

// --------------------------------------------------------------------
// MINI PROJECT SCHEMA
// --------------------------------------------------------------------
export const miniProjectSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string().uuid(),
  title: z.string().min(1, "Project title is required").max(200),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().min(0),
  scenario: z.string().max(5000).optional(),
  objectives: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  workflowSteps: z.array(z.object({
    step: z.number(),
    title: z.string(),
    description: z.string(),
  })).optional(),
  starterFilesUrl: z.string().url("Invalid starter files URL").optional().nullable(),
  referenceFilesUrl: z.string().url("Invalid reference files URL").optional().nullable(),
  rubrics: z.array(z.object({
    criterion: z.string(),
    points: z.number().min(0),
    description: z.string().optional(),
  })).optional(),
  passingScore: z.coerce.number().min(0).max(100).default(70),
  evaluationCriteria: z.string().max(2000).optional(),
  environmentSetup: z.string().max(2000).optional(),
  technicalRequirements: z.object({
    tools: z.array(z.string()).optional(),
    packages: z.array(z.string()).optional(),
    environment: z.string().optional(),
  }).optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
  difficulty: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
  deadline: z.string().datetime().optional().nullable(),
});

// --------------------------------------------------------------------
// DIFFICULTY LEVEL CAPSTONE SCHEMA
// --------------------------------------------------------------------
export const difficultyLevelCapstoneSchema = z.object({
  id: z.string().uuid().optional(),
  difficultyLevelId: z.string().uuid(),
  title: z.string().min(1, "Capstone title is required").max(200),
  slug: z.string().regex(slugPattern, "Invalid slug format"),
  description: z.string().max(5000).optional(),
  orderIndex: z.number().min(0),
  requiredCourses: z.coerce.number().min(1).default(1),
  requiredCourseIds: z.array(z.string().uuid()).optional(),
  projectTitle: z.string().max(200).optional(),
  projectDescription: z.string().max(5000).optional(),
  projectRequirements: z.string().max(5000).optional(),
  starterFilesUrl: z.string().url("Invalid URL").optional().nullable(),
  referenceMaterialsUrl: z.string().url("Invalid URL").optional().nullable(),
  rubrics: z.array(z.object({
    criterion: z.string(),
    points: z.number().min(0),
    description: z.string().optional(),
  })).optional(),
  passingScore: z.coerce.number().min(0).max(100).default(70),
  certificateTemplateId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
});

// --------------------------------------------------------------------
// PROFESSIONAL CAPSTONE SCHEMA
// --------------------------------------------------------------------
export const professionalCapstoneSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid(),
  title: z.string().min(1, "Capstone title is required").max(200),
  slug: z.string().regex(slugPattern, "Invalid slug format"),
  description: z.string().max(5000).optional(),
  orderIndex: z.number().min(0),
  requiredDifficultyLevels: z.coerce.number().min(1).default(1),
  requiredCourses: z.coerce.number().min(1).default(1),
  projectTitle: z.string().max(200).optional(),
  projectDescription: z.string().max(5000).optional(),
  projectRequirements: z.string().max(5000).optional(),
  projectDeliverables: z.array(z.string()).optional(),
  starterFilesUrl: z.string().url("Invalid URL").optional().nullable(),
  referenceMaterialsUrl: z.string().url("Invalid URL").optional().nullable(),
  additionalResourcesUrl: z.string().url("Invalid URL").optional().nullable(),
  rubrics: z.array(z.object({
    criterion: z.string(),
    points: z.number().min(0),
    description: z.string().optional(),
  })).optional(),
  passingScore: z.coerce.number().min(0).max(100).default(70),
  certificateTemplateId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
});

// --------------------------------------------------------------------
// PROJECT SUBMISSION SCHEMAS
// --------------------------------------------------------------------
export const exerciseSubmissionSchema = z.object({
  exerciseId: z.string().uuid(),
  submissionUrl: z.string().url("Invalid submission URL").optional().nullable(),
  submissionNotes: z.string().max(5000).optional(),
  submittedFiles: z.array(z.string()).optional(),
});

export const projectSubmissionSchema = z.object({
  projectId: z.string().uuid(),
  projectTitle: z.string().max(200).optional(),
  submissionUrl: z.string().url("Invalid submission URL").optional().nullable(),
  liveDemoUrl: z.string().url("Invalid demo URL").optional().nullable(),
  documentationUrl: z.string().url("Invalid documentation URL").optional().nullable(),
  submissionNotes: z.string().max(5000).optional(),
  screenshots: z.array(z.string().url()).optional(),
  teamMembers: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
  })).optional(),
  isTeamSubmission: z.boolean().default(false),
});

export const capstoneSubmissionSchema = z.object({
  capstoneId: z.string().uuid(),
  projectTitle: z.string().max(200).optional(),
  submissionUrl: z.string().url("Invalid submission URL").optional().nullable(),
  liveDemoUrl: z.string().url("Invalid demo URL").optional().nullable(),
  documentationUrl: z.string().url("Invalid documentation URL").optional().nullable(),
  submissionNotes: z.string().max(5000).optional(),
  isTeamSubmission: z.boolean().default(false),
  teamName: z.string().max(100).optional(),
  teamMembers: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
  })).optional(),
});

export const professionalCapstoneSubmissionSchema = z.object({
  capstoneId: z.string().uuid(),
  projectTitle: z.string().max(200).optional(),
  submissionUrl: z.string().url("Invalid submission URL").optional().nullable(),
  liveDemoUrl: z.string().url("Invalid demo URL").optional().nullable(),
  documentationUrl: z.string().url("Invalid documentation URL").optional().nullable(),
  presentationUrl: z.string().url("Invalid presentation URL").optional().nullable(),
  submissionNotes: z.string().max(5000).optional(),
  teamName: z.string().max(100).optional(),
  teamMembers: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.string().optional(),
  })).optional(),
  isTeamSubmission: z.boolean().default(false),
});

// --------------------------------------------------------------------
// COMPLETE COURSE SCHEMA (for full course creation)
// --------------------------------------------------------------------
export const completeCourseSchema = z.object({
  // Basic Info
  ...basicInfoSchema.shape,
  
  // Branding & Media
  ...brandingMediaSchema.shape,
  
  // Learning Info
  ...learningInfoSchema.shape,
  
  // Requirements
  ...requirementsSchema.shape,
  
  // Datasets
  ...datasetsSchema.shape,
  
  // Career Outcomes
  ...careerOutcomesSchema.shape,
  
  // Pricing
  ...pricingSchema.shape,
  
  // SEO
  ...seoSchema.shape,
  
  // Publishing
  ...publishingSchema.shape,
  
  // Modules (with nested lessons)
  modules: z.array(z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    orderIndex: z.number().min(0),
    isPreview: z.boolean().default(false),
    lessons: z.array(z.object({
      id: z.string().uuid().optional(),
      title: z.string().min(1).max(200),
      description: z.string().max(2000).optional(),
      orderIndex: z.number().min(0),
      lessonType: z.enum(["VIDEO", "TEXT", "QUIZ", "EXERCISE", "LIVE", "RESOURCE"]),
      videoUrl: z.string().url().optional().nullable(),
      videoDuration: z.coerce.number().min(0).optional(),
      isPreview: z.boolean().default(false),
      isFree: z.boolean().default(false),
      isActive: z.boolean().default(true),
      content: z.string().optional(),
    })).optional(),
  })).optional(),
  
  // Prerequisites
  ...prerequisitesSchema.shape,
});

// Type exports
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type BrandingMediaFormData = z.infer<typeof brandingMediaSchema>;
export type LearningInfoFormData = z.infer<typeof learningInfoSchema>;
export type PrerequisitesFormData = z.infer<typeof prerequisitesSchema>;
export type RequirementsFormData = z.infer<typeof requirementsSchema>;
export type DatasetsFormData = z.infer<typeof datasetsSchema>;
export type CareerOutcomesFormData = z.infer<typeof careerOutcomesSchema>;
export type PricingFormData = z.infer<typeof pricingSchema>;
export type SeoFormData = z.infer<typeof seoSchema>;
export type PublishingFormData = z.infer<typeof publishingSchema>;
export type ModuleFormData = z.infer<typeof moduleSchema>;
export type LessonFormData = z.infer<typeof lessonSchema>;
export type PracticalExerciseFormData = z.infer<typeof practicalExerciseSchema>;
export type MiniProjectFormData = z.infer<typeof miniProjectSchema>;
export type DifficultyLevelCapstoneFormData = z.infer<typeof difficultyLevelCapstoneSchema>;
export type ProfessionalCapstoneFormData = z.infer<typeof professionalCapstoneSchema>;
export type ExerciseSubmissionFormData = z.infer<typeof exerciseSubmissionSchema>;
export type ProjectSubmissionFormData = z.infer<typeof projectSubmissionSchema>;
export type CapstoneSubmissionFormData = z.infer<typeof capstoneSubmissionSchema>;
export type ProfessionalCapstoneSubmissionFormData = z.infer<typeof professionalCapstoneSubmissionSchema>;
export type CompleteCourseFormData = z.infer<typeof completeCourseSchema>;
