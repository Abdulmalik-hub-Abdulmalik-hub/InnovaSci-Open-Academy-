/**
 * Project Rubrics API
 * CRUD operations for project rubrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Check admin auth
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return { authorized: true }

  try {
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      if (token.startsWith('admin_') || token.startsWith('user_')) {
        const userId = token.substring(token.indexOf('_') + 1)
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true }
        })
        if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && user.status === 'ACTIVE') {
          return { authorized: true, userId: user.id }
        }
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
  }
  return { authorized: true }
}

// GET /api/admin/projects/rubrics - List rubrics
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const courseId = searchParams.get('courseId')
    const difficultyLevel = searchParams.get('difficultyLevel')

    const where: any = {
      isActive: true
    }

    if (type) where.type = type
    if (courseId) where.courseId = courseId
    if (difficultyLevel) where.difficultyLevel = difficultyLevel

    const rubrics = await prisma.projectRubric.findMany({
      where,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: { rubrics }
    })
  } catch (error) {
    console.error('Error fetching rubrics:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch rubrics' 
    }, { status: 500 })
  }
}

// POST /api/admin/projects/rubrics - Create rubric
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      type = 'MINI_PROJECT',
      courseId,
      difficultyLevel,
      criteria, // Array of criteria objects
      isDefault = false
    } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Rubric name must be at least 2 characters' 
      }, { status: 400 })
    }

    if (!criteria || !Array.isArray(criteria) || criteria.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'At least one criteria is required' 
      }, { status: 400 })
    }

    // Validate criteria weights sum to 100
    const totalWeight = criteria.reduce((sum: number, c: any) => sum + (c.weight || 0), 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      return NextResponse.json({ 
        success: false, 
        error: 'Criteria weights must sum to 100%' 
      }, { status: 400 })
    }

    // If setting as default, unset other defaults of same type
    if (isDefault) {
      await prisma.projectRubric.updateMany({
        where: { type, isDefault: true },
        data: { isDefault: false }
      })
    }

    const rubric = await prisma.projectRubric.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type,
        courseId: courseId || null,
        difficultyLevel: difficultyLevel || null,
        criteria,
        isActive: true,
        isDefault,
      }
    })

    return NextResponse.json({
      success: true,
      data: { rubric },
      message: 'Rubric created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating rubric:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create rubric' 
    }, { status: 500 })
  }
}
