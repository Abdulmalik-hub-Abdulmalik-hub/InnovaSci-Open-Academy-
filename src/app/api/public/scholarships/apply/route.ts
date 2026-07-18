import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { randomBytes } from "crypto"

// Validation schema for application
const applicationSchema = z.object({
  scholarshipSlug: z.string(),
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  // Educational Background
  highestDegree: z.string().optional(),
  institution: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  graduationYear: z.number().optional(),
  gpa: z.string().optional(),
  // Professional
  employmentStatus: z.string().optional(),
  currentEmployer: z.string().optional(),
  yearsExperience: z.number().optional(),
  // Online Presence
  linkedIn: z.string().optional(),
  github: z.string().optional(),
  googleScholar: z.string().optional(),
  orcid: z.string().optional(),
  website: z.string().optional(),
  // Emergency Contact
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  // Motivation
  statementOfPurpose: z.string().optional(),
  motivationLetter: z.string().optional(),
  financialNeedStatement: z.string().optional(),
  // Research Interests
  researchInterests: z.array(z.string()).optional(),
  // Custom Responses
  customResponses: z.record(z.any()).optional(),
  // Documents (URLs from upload)
  documents: z.array(z.object({
    type: z.string(),
    url: z.string(),
    name: z.string(),
  })).optional(),
  cvUrl: z.string().optional(),
  transcriptUrl: z.string().optional(),
  recommendationLetters: z.array(z.object({
    name: z.string(),
    email: z.string(),
    url: z.string(),
  })).optional(),
  // National ID
  nationalIdType: z.string().optional(),
  nationalIdUrl: z.string().optional(),
  // Draft flag
  isDraft: z.boolean().default(false),
})

// POST /api/public/scholarships/apply - Submit application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = applicationSchema.parse(body)
    
    // Find scholarship
    const scholarship = await prisma.scholarship.findFirst({
      where: {
        slug: validatedData.scholarshipSlug,
        status: "PUBLISHED",
      }
    })
    
    if (!scholarship) {
      return NextResponse.json({ error: "Scholarship not found or not accepting applications" }, { status: 404 })
    }
    
    // Check if scholarship is still open
    const now = new Date()
    if (scholarship.closingDate && scholarship.closingDate < now) {
      return NextResponse.json({ error: "Application period has closed" }, { status: 400 })
    }
    
    // Check for duplicate application by email
    const existingApplication = await prisma.scholarshipApplication.findFirst({
      where: {
        scholarshipId: scholarship.id,
        email: validatedData.email.toLowerCase(),
        status: { notIn: ["WITHDRAWN"] }
      }
    })
    
    if (existingApplication) {
      return NextResponse.json({ 
        error: "You have already submitted an application for this scholarship",
        existingTrackingNumber: existingApplication.trackingNumber
      }, { status: 400 })
    }
    
    // Generate application number and tracking number
    const count = await prisma.scholarshipApplication.count()
    const applicationNumber = `APP-${String(count + 1).padStart(6, "0")}`
    const trackingNumber = `TRK-${randomBytes(4).toString("hex").toUpperCase()}`
    
    // Create application
    const application = await prisma.scholarshipApplication.create({
      data: {
        applicationNumber,
        trackingNumber,
        scholarshipId: scholarship.id,
        // Personal Information
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email.toLowerCase(),
        phone: validatedData.phone,
        nationality: validatedData.nationality,
        state: validatedData.state,
        country: validatedData.country,
        gender: validatedData.gender,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        // Educational Background
        highestDegree: validatedData.highestDegree,
        institution: validatedData.institution,
        fieldOfStudy: validatedData.fieldOfStudy,
        graduationYear: validatedData.graduationYear,
        gpa: validatedData.gpa ? parseFloat(validatedData.gpa) : null,
        // Professional
        employmentStatus: validatedData.employmentStatus,
        currentEmployer: validatedData.currentEmployer,
        yearsExperience: validatedData.yearsExperience,
        // Online Presence
        linkedIn: validatedData.linkedIn,
        github: validatedData.github,
        googleScholar: validatedData.googleScholar,
        orcid: validatedData.orcid,
        website: validatedData.website,
        // Emergency Contact
        emergencyName: validatedData.emergencyName,
        emergencyPhone: validatedData.emergencyPhone,
        emergencyRelation: validatedData.emergencyRelation,
        // Motivation
        statementOfPurpose: validatedData.statementOfPurpose,
        motivationLetter: validatedData.motivationLetter,
        financialNeedStatement: validatedData.financialNeedStatement,
        // Research Interests
        researchInterests: validatedData.researchInterests,
        // Custom Responses
        customResponses: validatedData.customResponses,
        // Documents
        documents: validatedData.documents,
        cvUrl: validatedData.cvUrl,
        transcriptUrl: validatedData.transcriptUrl,
        recommendationLetters: validatedData.recommendationLetters,
        // National ID
        nationalIdType: validatedData.nationalIdType,
        nationalIdUrl: validatedData.nationalIdUrl,
        // Status
        status: validatedData.isDraft ? "DRAFT" : "SUBMITTED",
        isDraft: validatedData.isDraft,
        submittedAt: validatedData.isDraft ? null : new Date(),
      }
    })
    
    // If submitted (not draft), update scholarship count and create history
    if (!validatedData.isDraft) {
      // Update application count
      await prisma.scholarship.update({
        where: { id: scholarship.id },
        data: { applicationCount: { increment: 1 } }
      })
      
      // Create status history entry
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          newStatus: "SUBMITTED",
          changedBy: "SYSTEM",
          changedByName: "Application System",
          notes: "Application submitted successfully"
        }
      })
      
      // Create notification
      await prisma.applicationNotification.create({
        data: {
          applicationId: application.id,
          type: "SUBMITTED",
          title: "Application Submitted",
          message: `Your application ${applicationNumber} has been submitted successfully. Your tracking number is ${trackingNumber}.`,
          channel: "EMAIL",
          sentAt: new Date()
        }
      })
      
      // TODO: Send confirmation email
      // await sendApplicationConfirmationEmail(...)
    }
    
    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        applicationNumber: application.applicationNumber,
        trackingNumber: application.trackingNumber,
        status: application.status,
      },
      message: validatedData.isDraft 
        ? "Application saved as draft" 
        : "Application submitted successfully"
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error submitting application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
