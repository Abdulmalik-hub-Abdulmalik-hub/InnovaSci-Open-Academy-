import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/forum - Get all forum threads
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: Record<string, any> = {}
    
    if (category && category !== "all") {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } }
      ]
    }

    const [threads, total] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  avatarUrl: true
                }
              }
            }
          }
        },
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" }
        ],
        skip,
        take: limit
      }),
      prisma.forumThread.count({ where })
    ])

    // Transform to include author info
    const transformedThreads = threads.map((thread: any) => ({
      id: thread.id,
      title: thread.title,
      content: thread.content,
      category: thread.category,
      isPinned: thread.isPinned,
      isResolved: thread.isResolved,
      viewCount: thread.viewCount,
      replyCount: thread.replyCount,
      lastReplyAt: thread.lastReplyAt,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      author: {
        id: thread.author.id,
        email: thread.author.email,
        displayName: thread.author.profile?.fullName || thread.author.email.split("@")[0],
        avatarUrl: thread.author.profile?.avatarUrl
      }
    }))

    return NextResponse.json({
      threads: transformedThreads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching forum threads:", error)
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    )
  }
}

// POST /api/forum - Create a new forum thread
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, category } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    const thread = await prisma.forumThread.create({
      data: {
        title,
        content,
        category: category || "general",
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    })

    // Transform response
    const transformedThread = {
      id: thread.id,
      title: thread.title,
      content: thread.content,
      category: thread.category,
      isPinned: thread.isPinned,
      isResolved: thread.isResolved,
      viewCount: thread.viewCount,
      replyCount: thread.replyCount,
      lastReplyAt: thread.lastReplyAt,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      author: {
        id: thread.author.id,
        email: thread.author.email,
        displayName: thread.author.profile?.fullName || thread.author.email.split("@")[0],
        avatarUrl: thread.author.profile?.avatarUrl
      }
    }

    return NextResponse.json(transformedThread, { status: 201 })
  } catch (error) {
    console.error("Error creating forum thread:", error)
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    )
  }
}