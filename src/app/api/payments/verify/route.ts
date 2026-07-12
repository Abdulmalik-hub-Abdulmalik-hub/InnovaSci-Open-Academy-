/**
 * Paystack Payment Verification API with Auto-Enrollment Engine
 * 
 * GET /api/payments/verify?reference=xxx
 * 
 * This endpoint verifies the payment and automatically:
 * 1. Creates the purchase record (Category/Domain/Academy)
 * 2. Creates the payment record
 * 3. Issues an invoice
 * 4. Creates access licenses
 * 5. Auto-enrolls student in all relevant courses
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { verifyTransaction, fromKobo } from '@/lib/paystack'

export const dynamic = "force-dynamic"

// Helper function to generate invoice number
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.invoice.count({
    where: {
      invoiceNumber: {
        startsWith: `INV-${year}-`,
      }
    }
  })
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`
}

// Helper function to auto-enroll students
async function autoEnrollStudent(
  userId: string,
  scope: string,
  targetId: string | null,
  planId: string | null
): Promise<{ enrolledCourses: number; enrollments: any[] }> {
  const enrolledCourses: string[] = []
  const enrollmentRecords: any[] = []

  try {
    if (scope === 'academy') {
      // Academy scope: enroll in ALL courses
      const allCourses = await prisma.course.findMany({
        where: { status: 'published', isActive: true },
        select: { id: true }
      })
      
      for (const course of allCourses) {
        // Check if already enrolled
        const existing = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: course.id } }
        })
        
        if (!existing) {
          const enrollment = await prisma.enrollment.create({
            data: {
              userId,
              courseId: course.id,
              progressPercent: 0,
              completed: false,
            }
          })
          enrolledCourses.push(course.id)
          enrollmentRecords.push(enrollment)
        }
      }

      // Create academy access license
      await prisma.accessLicense.upsert({
        where: {
          userId_licenseType_targetId: {
            userId,
            licenseType: 'academy',
            targetId: 'all',
          }
        },
        update: {
          status: 'active',
          grantedAt: new Date(),
          expiresAt: null,
          sourceType: 'purchase',
          purchaseId: targetId,
        },
        create: {
          userId,
          licenseType: 'academy',
          targetId: 'all',
          status: 'active',
          grantedAt: new Date(),
          sourceType: 'purchase',
          purchaseId: targetId,
          coursesEnrolled: enrolledCourses.length,
          lastEnrolledAt: new Date(),
        }
      })

    } else if (scope === 'domain' && targetId) {
      // Domain scope: enroll in all courses within all categories of this domain
      const domainCategories = await prisma.category.findMany({
        where: { domainId: targetId, isActive: true },
        select: { id: true }
      })
      
      const categoryIds = domainCategories.map(c => c.id)
      
      const domainCourses = await prisma.course.findMany({
        where: { 
          categoryId: { in: categoryIds },
          status: 'published',
          isActive: true 
        },
        select: { id: true }
      })
      
      for (const course of domainCourses) {
        const existing = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: course.id } }
        })
        
        if (!existing) {
          const enrollment = await prisma.enrollment.create({
            data: {
              userId,
              courseId: course.id,
              progressPercent: 0,
              completed: false,
            }
          })
          enrolledCourses.push(course.id)
          enrollmentRecords.push(enrollment)
        }
      }

      // Create domain access license
      await prisma.accessLicense.upsert({
        where: {
          userId_licenseType_targetId: {
            userId,
            licenseType: 'domain',
            targetId,
          }
        },
        update: {
          status: 'active',
          grantedAt: new Date(),
          expiresAt: null,
          sourceType: 'purchase',
          purchaseId: targetId,
        },
        create: {
          userId,
          licenseType: 'domain',
          targetId,
          status: 'active',
          grantedAt: new Date(),
          sourceType: 'purchase',
          purchaseId: targetId,
          coursesEnrolled: enrolledCourses.length,
          lastEnrolledAt: new Date(),
        }
      })

      // Also create access licenses for each category in this domain
      for (const categoryId of categoryIds) {
        await prisma.accessLicense.upsert({
          where: {
            userId_licenseType_targetId: {
              userId,
              licenseType: 'category',
              targetId: categoryId,
            }
          },
          update: {
            status: 'active',
            sourceType: 'purchase',
          },
          create: {
            userId,
            licenseType: 'category',
            targetId: categoryId,
            status: 'active',
            grantedAt: new Date(),
            sourceType: 'purchase',
            purchaseId: targetId,
          }
        })
      }

    } else if (scope === 'category' && targetId) {
      // Category scope: enroll in all courses within this category
      const categoryCourses = await prisma.course.findMany({
        where: { 
          categoryId: targetId,
          status: 'published',
          isActive: true 
        },
        select: { id: true }
      })
      
      for (const course of categoryCourses) {
        const existing = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: course.id } }
        })
        
        if (!existing) {
          const enrollment = await prisma.enrollment.create({
            data: {
              userId,
              courseId: course.id,
              progressPercent: 0,
              completed: false,
            }
          })
          enrolledCourses.push(course.id)
          enrollmentRecords.push(enrollment)
        }
      }

      // Create category access license
      await prisma.accessLicense.upsert({
        where: {
          userId_licenseType_targetId: {
            userId,
            licenseType: 'category',
            targetId,
          }
        },
        update: {
          status: 'active',
          grantedAt: new Date(),
          expiresAt: null,
          sourceType: 'purchase',
          purchaseId: targetId,
        },
        create: {
          userId,
          licenseType: 'category',
          targetId,
          status: 'active',
          grantedAt: new Date(),
          sourceType: 'purchase',
          purchaseId: targetId,
          coursesEnrolled: enrolledCourses.length,
          lastEnrolledAt: new Date(),
        }
      })
    }

    return { enrolledCourses: enrolledCourses.length, enrollments: enrollmentRecords }
  } catch (error) {
    console.error('Auto-enrollment error:', error)
    return { enrolledCourses: 0, enrollments: [] }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')
    const userId = searchParams.get('userId')

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Reference is required' },
        { status: 400 }
      )
    }

    // Verify with Paystack
    const response = await verifyTransaction(reference)

    if (!response.status) {
      return NextResponse.json(
        { success: false, error: response.message },
        { status: 400 }
      )
    }

    const transaction = response.data

    // Check if payment already processed
    const existingPayment = await prisma.payment.findFirst({
      where: { paystackRef: reference },
      include: {
        // Include any existing purchase records
      }
    })

    if (existingPayment && existingPayment.status === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        paymentId: existingPayment.id,
        status: 'completed',
      })
    }

    // Extract metadata
    const metadata = transaction.metadata || {}
    const scope = metadata.scope || (reference.startsWith('ACAD-') ? 'academy' : reference.startsWith('DOM-') ? 'domain' : 'category')
    const planId = metadata.plan_id || null
    const targetId = metadata.target_id || null
    const couponCode = metadata.coupon_code || null
    const finalAmount = metadata.final_amount || fromKobo(transaction.amount)
    const originalAmount = metadata.original_amount || finalAmount
    const discountApplied = metadata.discount_applied || 0

    // Get actual userId (from metadata or query param)
    const actualUserId = metadata.user_id || userId || transaction.customer.email

    if (!actualUserId || actualUserId === 'pending') {
      // Payment verified but user not authenticated - return pending status
      // Update payment record with verification info
      await prisma.payment.updateMany({
        where: { paystackRef: reference },
        data: {
          status: 'completed',
          completedAt: new Date(),
          paystackId: transaction.id?.toString(),
          paystackChannel: transaction.channel,
          gatewayResponse: JSON.parse(JSON.stringify(transaction)),
          metadata: {
            ...metadata,
            verifiedAt: new Date().toISOString(),
            customerEmail: transaction.customer.email,
          },
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Payment verified. Please login to complete purchase.',
        reference: transaction.reference,
        status: 'pending_user_auth',
      })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: transaction.customer.email },
    })

    if (!user) {
      // Create a pending user record - they can complete registration later
      // For now, we'll mark the payment as pending user association
      await prisma.payment.updateMany({
        where: { paystackRef: reference },
        data: {
          status: 'completed',
          completedAt: new Date(),
          paystackId: transaction.id?.toString(),
          paystackChannel: transaction.channel,
          gatewayResponse: JSON.parse(JSON.stringify(transaction)),
          metadata: {
            ...metadata,
            verifiedAt: new Date().toISOString(),
            customerEmail: transaction.customer.email,
            userAssociationPending: true,
          },
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Payment verified. Please login or create an account to access your purchase.',
        reference: transaction.reference,
        status: 'pending_user_association',
      })
    }

    // Update payment record
    await prisma.payment.updateMany({
      where: { paystackRef: reference },
      data: {
        userId: user.id,
        status: 'completed',
        completedAt: new Date(),
        paystackId: transaction.id?.toString(),
        paystackChannel: transaction.channel,
        gatewayResponse: JSON.parse(JSON.stringify(transaction)),
        metadata: {
          ...metadata,
          verifiedAt: new Date().toISOString(),
        },
      }
    })

    // Create purchase record based on scope
    let purchaseRecord: any = null
    let targetName = 'Entire Academy'

    if (scope === 'academy') {
      // Check if already purchased
      const existing = await prisma.academyPurchase.findUnique({
        where: { userId: user.id }
      })
      
      if (!existing || existing.status !== 'active') {
        purchaseRecord = await prisma.academyPurchase.create({
          data: {
            userId: user.id,
            planId,
            amountPaid: finalAmount,
            currency: transaction.currency,
            paymentId: existingPayment?.id,
            status: 'active',
            couponId: couponCode ? (await prisma.coupon.findUnique({ where: { code: couponCode } }))?.id : null,
            couponCode,
            discountAmount: discountApplied,
            paystackRef: reference,
          }
        })

        // Update coupon usage
        if (couponCode) {
          await prisma.coupon.update({
            where: { code: couponCode },
            data: { currentUses: { increment: 1 } }
          })
        }
      }
      targetName = 'Entire Academy'

    } else if (scope === 'domain' && targetId) {
      const domain = await prisma.domain.findUnique({ where: { id: targetId } })
      targetName = domain?.name || 'Domain'

      // Check if already purchased
      const existing = await prisma.domainPurchase.findUnique({
        where: { userId_domainId: { userId: user.id, domainId: targetId } }
      })
      
      if (!existing || existing.status !== 'active') {
        purchaseRecord = await prisma.domainPurchase.create({
          data: {
            userId: user.id,
            planId,
            domainId: targetId,
            domainName: targetName,
            amountPaid: finalAmount,
            currency: transaction.currency,
            paymentId: existingPayment?.id,
            status: 'active',
            couponId: couponCode ? (await prisma.coupon.findUnique({ where: { code: couponCode } }))?.id : null,
            couponCode,
            discountAmount: discountApplied,
            paystackRef: reference,
          }
        })

        if (couponCode) {
          await prisma.coupon.update({
            where: { code: couponCode },
            data: { currentUses: { increment: 1 } }
          })
        }
      }

    } else if (scope === 'category' && targetId) {
      const category = await prisma.category.findUnique({ 
        where: { id: targetId },
        include: { domain: true }
      })
      targetName = category?.name || 'Category'

      // Check if already purchased
      const existing = await prisma.categoryPurchase.findUnique({
        where: { userId_categoryId: { userId: user.id, categoryId: targetId } }
      })
      
      if (!existing || existing.status !== 'active') {
        purchaseRecord = await prisma.categoryPurchase.create({
          data: {
            userId: user.id,
            planId,
            categoryId: targetId,
            categoryName: targetName,
            domainId: category?.domainId || null,
            domainName: category?.domain?.name || null,
            amountPaid: finalAmount,
            currency: transaction.currency,
            paymentId: existingPayment?.id,
            status: 'active',
            couponId: couponCode ? (await prisma.coupon.findUnique({ where: { code: couponCode } }))?.id : null,
            couponCode,
            discountAmount: discountApplied,
            paystackRef: reference,
          }
        })

        if (couponCode) {
          await prisma.coupon.update({
            where: { code: couponCode },
            data: { currentUses: { increment: 1 } }
          })
        }
      }
    }

    // Create invoice
    const invoiceNumber = await generateInvoiceNumber()
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: user.id,
        userEmail: user.email,
        items: [{
          description: `${scope === 'academy' ? 'Entire Academy Access' : scope === 'domain' ? `${targetName} Domain Access` : `${targetName} Category Access`}`,
          quantity: 1,
          unitPrice: originalAmount - discountApplied,
          total: finalAmount,
          planId,
          scope,
        }],
        subtotal: originalAmount,
        discountAmount,
        taxAmount: 0,
        totalAmount: finalAmount,
        currency: transaction.currency,
        status: 'paid',
        paidAt: new Date(),
        paymentId: existingPayment?.id,
        couponId: couponCode ? (await prisma.coupon.findUnique({ where: { code: couponCode } }))?.id : null,
        couponCode,
      }
    })

    // Auto-enroll student
    const { enrolledCourses, enrollments } = await autoEnrollStudent(
      user.id,
      scope,
      purchaseRecord?.id || targetId,
      planId
    )

    // Update purchase with invoice
    if (purchaseRecord && invoice) {
      if (scope === 'academy') {
        await prisma.academyPurchase.update({
          where: { id: purchaseRecord.id },
          data: { invoiceId: invoice.id }
        })
      } else if (scope === 'domain') {
        await prisma.domainPurchase.update({
          where: { id: purchaseRecord.id },
          data: { invoiceId: invoice.id }
        })
      } else {
        await prisma.categoryPurchase.update({
          where: { id: purchaseRecord.id },
          data: { invoiceId: invoice.id }
        })
      }
    }

    // Log audit
    try {
      await prisma.auditLog.create({
        data: {
          action: "PURCHASE_COMPLETED",
          module: "PAYMENTS",
          userId: user.id,
          details: {
            paymentId: existingPayment?.id,
            purchaseId: purchaseRecord?.id,
            scope,
            targetId,
            targetName,
            amount: finalAmount,
            currency: transaction.currency,
            coursesEnrolled: enrolledCourses,
            invoiceId: invoice.id,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and purchase completed successfully!',
      paymentId: existingPayment?.id,
      purchaseId: purchaseRecord?.id,
      invoiceId: invoice.id,
      reference: transaction.reference,
      scope,
      targetName,
      amount: finalAmount,
      currency: transaction.currency,
      coursesEnrolled: enrolledCourses,
      status: 'completed',
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
