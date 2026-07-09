import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, wrapInEmailTemplate } from "@/lib/email"

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    })

    // Always return success to prevent email enumeration attacks
    // Even if user doesn't exist, we don't want to reveal that information
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent."
      })
    }

    // Generate a simple reset token (in production, use crypto.randomBytes)
    const resetToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64url')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`

    // Send password reset email
    const emailContent = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.profile?.fullName?.split(' ')[0] || 'there'},</p>
      <p>You requested a password reset for your InnovaSci Open Academy account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 15px 0;">Reset Password</a>
      <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>
      <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, please ignore this email. Your account is secure.</p>
    `

    await sendEmail({
      to: normalizedEmail,
      subject: 'Password Reset Request - InnovaSci Open Academy',
      html: wrapInEmailTemplate(emailContent, 'Password Reset'),
    })

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent."
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    // Return success anyway to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent."
    })
  }
}
