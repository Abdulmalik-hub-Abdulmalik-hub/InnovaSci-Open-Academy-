import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/forum/[threadId]/replies - Add a reply to a thread
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { threadId } = await params
    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    // Check if thread exists
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId }
    })

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      )
    }

    // Create reply and update thread atomically
    const [reply] = await prisma.$transaction([
      prisma.forumReply.create({
        data: {
          content,
          authorId: session.user.id,
          threadId
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
      }),
      prisma.forumThread.update({
        where: { id: threadId },
        data: {
          replyCount: { increment: 1 },
          lastReplyAt: new Date()
        }
      })
    ])

    // Transform response
    const transformedReply = {
      id: reply.id,
      content: reply.content,
      isAccepted: reply.isAccepted,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      author: {
        id: reply.author.id,
        email: reply.author.email,
        displayName: reply.author.profile?.fullName || reply.author.email.split("@")[0],
        avatarUrl: reply.author.profile?.avatarUrl
      }
    }

    return NextResponse.json(transformedReply, { status: 201 })
  } catch (error) {
    console.error("Error creating reply:", error)
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    )
  }
}