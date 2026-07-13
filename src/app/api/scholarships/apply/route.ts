import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, createdResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { z } from "zod"
import { Prisma } from "@prisma/client"

// Validation schema for application
const applicationSchema = z.object({
  scholarshipSlug: z.string().min(1, "Scholarship slug is required"),
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  // Location
  nationality: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  gender: z.string().optional(),
  // Education
  educationLevel: z.string().optional(),
  institution: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  graduationYear: z.number().int().optional(),
  gpa: z.number().optional(),
  academicBackground: z.string().optional(),
  // Professional
  employmentStatus: z.string().optional(),
  currentEmployer: z.string().optional(),
  jobTitle: z.string().optional(),
  // Additional Info
  researchInterests: z.string().optional(),
  linkedIn: z.string().url().optional(),
  github: z.string().url().optional(),
  googleScholar: z.string().url().optional(),
  orcid: z.string().optional(),
  // Financial Need
  financialNeedStatement: z.string().optional(),
  householdIncome: z.number().optional(),
  hasScholarshipDependency: z.boolean().optional(),
  // Essays
  statementOfPurpose: z.string().optional(),
  motivationLetter: z.string().optional(),
  communityImpactStatement: z.string().optional(),
  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  // Documents
  documents: z.array(z.object({
    type: z.string(),
    url: z.string(),
    name: z.string(),
  })).optional(),
  // Custom question answers
  customAnswers: z.record(z.any()).optional(),
})

// POST - Submit a scholarship application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = applicationSchema.parse(body)

    // Find the scholarship
    const scholarship = await prisma.scholarship.findFirst({
      where: {
        slug: validatedData.scholarshipSlug,
        status: "PUBLISHED",
        visibility: { in: ["PUBLIC", "FEATURED"] },
      },
    })

    if (!scholarship) {
      return errorResponse("Scholarship not found or not accepting applications", ErrorCodes.NOT_FOUND, 404)
    }

    // Check if application window is open
    const now = new Date()
    if (scholarship.closingDate && scholarship.closingDate < now && !scholarship.allowLateApplications) {
      return errorResponse("Application deadline has passed", ErrorCodes.BAD_REQUEST, 400)
    }

    if (scholarship.openingDate && scholarship.openingDate > now) {
      return errorResponse("Applications are not yet open", ErrorCodes.BAD_REQUEST, 400)
    }

    // Check if max recipients reached
    if (scholarship.maxRecipients && scholarship.currentRecipients >= scholarship.maxRecipients) {
      return errorResponse("All available slots have been filled", ErrorCodes.BAD_REQUEST, 400)
    }

    // Check for duplicate application (same email + scholarship)
    const existingApplication = await prisma.scholarshipApplication.findFirst({
      where: {
        scholarshipId: scholarship.id,
        email: validatedData.email.toLowerCase(),
        isDraft: false,
      },
    })

    if (existingApplication) {
      return errorResponse("You have already submitted an application for this scholarship", ErrorCodes.CONFLICT, 409)
    }

    // Check if user exists (by email)
    let user = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    // Generate application numbers
    const applicationNumber = `APP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const trackingNumber = `TRK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create application
    const application = await prisma.scholarshipApplication.create({
      data: {
        applicationNumber,
        trackingNumber,
        scholarshipId: scholarship.id,
        userId: user?.id,
        // Personal Information
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email.toLowerCase(),
        phone: validatedData.phone,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        // Location
        nationality: validatedData.nationality,
        country: validatedData.country,
        state: validatedData.state,
        city: validatedData.city,
        address: validatedData.address,
        postalCode: validatedData.postalCode,
        gender: validatedData.gender,
        // Education
        educationLevel: validatedData.educationLevel,
        institution: validatedData.institution,
        fieldOfStudy: validatedData.fieldOfStudy,
        graduationYear: validatedData.graduationYear,
        gpa: validatedData.gpa ? new Prisma.Decimal(validatedData.gpa) : null,
        academicBackground: validatedData.academicBackground,
        // Professional
        employmentStatus: validatedData.employmentStatus,
        currentEmployer: validatedData.currentEmployer,
        jobTitle: validatedData.jobTitle,
        // Additional Info
        researchInterests: validatedData.researchInterests,
        linkedIn: validatedData.linkedIn,
        github: validatedData.github,
        googleScholar: validatedData.googleScholar,
        orcid: validatedData.orcid,
        // Financial Need
        financialNeedStatement: validatedData.financialNeedStatement,
        householdIncome: validatedData.householdIncome ? new Prisma.Decimal(validatedData.householdIncome) : null,
        hasScholarshipDependency: validatedData.hasScholarshipDependency || false,
        // Essays
        statementOfPurpose: validatedData.statementOfPurpose,
        motivationLetter: validatedData.motivationLetter,
        communityImpactStatement: validatedData.communityImpactStatement,
        // Emergency Contact
        emergencyContactName: validatedData.emergencyContactName,
        emergencyContactPhone: validatedData.emergencyContactPhone,
        emergencyContactRelation: validatedData.emergencyContactRelation,
        // Documents
        documents: validatedData.documents ? JSON.stringify(validatedData.documents) : undefined,
        // Status
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      include: {
        scholarship: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    // Create initial status history
    await prisma.scholarshipApplicationStatus.create({
      data: {
        applicationId: application.id,
        status: "SUBMITTED",
        notes: "Application submitted",
        changedBy: "SYSTEM",
      },
    })

    // TODO: Send confirmation email
    // await sendScholarshipApplicationConfirmation(application);

    return createdResponse({
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      trackingNumber: application.trackingNumber,
      scholarshipName: application.scholarship.name,
      message: "Your application has been submitted successfully. You will receive a confirmation email shortly.",
    }, "Application submitted successfully")

  } catch (error) {
    console.error("Error submitting application:", error)
    
    if (error instanceof z.ZodError) {
      return errorResponse(
        error.errors.map((e) => e.message).join(", "),
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }
    
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
