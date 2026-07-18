import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/scholarships/[slug] - Get single public scholarship
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const now = new Date()
    
    const scholarship = await prisma.scholarship.findFirst({
      where: {
        slug: params.slug,
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
      include: {
        sponsor: {
          select: {
            id: true,
            name: true,
            logo: true,
            website: true,
          }
        },
        domains: {
          include: {
            domain: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                color: true,
              }
            }
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        },
        difficulties: true,
        certificates: {
          include: {
            certificate: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        plans: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                description: true,
              }
            }
          }
        },
        customQuestions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            question: true,
            questionType: true,
            options: true,
            isRequired: true,
            helpText: true,
            placeholder: true,
            validation: true,
          }
        }
      }
    })
    
    if (!scholarship) {
      return NextResponse.json({ error: "Scholarship not found" }, { status: 404 })
    }
    
    // Check if scholarship is still open
    const isOpen = !scholarship.closingDate || scholarship.closingDate > now
    
    // Increment view count (async, don't wait)
    prisma.scholarship.update({
      where: { id: scholarship.id },
      data: { viewCount: { increment: 1 } }
    }).catch(() => {})
    
    // Get shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openscience-academy.com"
    
    return NextResponse.json({
      ...scholarship,
      isOpen,
      shareUrls: {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${baseUrl}/scholarships/${scholarship.slug}`)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${baseUrl}/scholarships/${scholarship.slug}`)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(`${baseUrl}/scholarships/${scholarship.slug}`)}&text=${encodeURIComponent(`Apply for ${scholarship.name}!`)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out this scholarship opportunity: ${scholarship.name}\n${baseUrl}/scholarships/${scholarship.slug}`)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(`${baseUrl}/scholarships/${scholarship.slug}`)}&text=${encodeURIComponent(scholarship.name)}`,
        email: `mailto:?subject=${encodeURIComponent(`Scholarship Opportunity: ${scholarship.name}`)}&body=${encodeURIComponent(`I thought you might be interested in this scholarship:\n\n${scholarship.name}\n\n${baseUrl}/scholarships/${scholarship.slug}`)}`,
      },
      applyUrl: `${baseUrl}/scholarships/apply/${scholarship.slug}`,
      trackUrl: `${baseUrl}/scholarships/track`,
    })
  } catch (error) {
    console.error("Error fetching public scholarship:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
