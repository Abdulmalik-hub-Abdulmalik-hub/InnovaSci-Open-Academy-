import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/forum/[threadId] - Get a single thread with replies
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params

    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
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
        },
        replies: {
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
            { isAccepted: "desc" },
            { createdAt: "asc" }
          ]
        }
      }
    })

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.forumThread.update({
      where: { id: threadId },
      data: { viewCount: { increment: 1 } }
    })

    // Transform response
    const transformedThread = {
      id: thread.id,
      title: thread.title,
      content: thread.content,
      category: thread.category,
      isPinned: thread.isPinned,
      isResolved: thread.isResolved,
      viewCount: thread.viewCount + 1,
      replyCount: thread.replyCount,
      lastReplyAt: thread.lastReplyAt,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      author: {
        id: thread.author.id,
        email: thread.author.email,
        displayName: thread.author.profile?.fullName || thread.author.email.split("@")[0],
        avatarUrl: thread.author.profile?.avatarUrl
      },
      replies: thread.replies.map((reply: any) => ({
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
      }))
    }

    return NextResponse.json(transformedThread)
  } catch (error) {
    console.error("Error fetching thread:", error)
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    )
  }
}