/**
 * Email Service
 * 
 * Handles email sending using Resend API.
 * Falls back to console logging in development.
 * 
 * Environment Variables:
 * - RESEND_API_KEY: Resend API key
 * - EMAIL_FROM: Default from email address
 * - APP_URL: Application URL for unsubscribe links
 */

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Default from address
const DEFAULT_FROM = process.env.EMAIL_FROM || "InnovaSci Open Academy <noreply@innovasci.com>"
const APP_URL = process.env.APP_URL || "https://innovasci.com"

// HTML email template wrapper
export function wrapInEmailTemplate(content: string, title?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "InnovaSci Open Academy"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .content h2 {
      color: #1f2937;
      font-size: 20px;
      margin-bottom: 15px;
    }
    .content p {
      margin-bottom: 15px;
      color: #4b5563;
    }
    .content ul {
      margin: 15px 0;
      padding-left: 20px;
    }
    .content li {
      margin-bottom: 8px;
      color: #4b5563;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%);
      color: white !important;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      margin: 15px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    }
    .footer a {
      color: #7C3AED;
      text-decoration: none;
    }
    .unsubscribe {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #9ca3af;
    }
    .unsubscribe a {
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>InnovaSci Open Academy</h1>
      <p>Empowering Lifelong Learners</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} InnovaSci Open Academy. All rights reserved.</p>
      <p>
        <a href="${APP_URL}">Visit Website</a> | 
        <a href="${APP_URL}/contact">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

// Generate unsubscribe link
export function generateUnsubscribeLink(email: string, token?: string): string {
  const baseUrl = `${APP_URL}/api/newsletter/unsubscribe`
  const params = new URLSearchParams()
  params.set("email", encodeURIComponent(email))
  if (token) {
    params.set("token", token)
  }
  return `${baseUrl}?${params.toString()}`
}

// Add unsubscribe footer to email content
export function addUnsubscribeFooter(html: string, email: string): string {
  const unsubscribeLink = generateUnsubscribeLink(email)
  return html + `
    <div class="unsubscribe">
      <p>You're receiving this email because you signed up for InnovaSci Open Academy newsletters.</p>
      <p>
        <a href="${unsubscribeLink}">Unsubscribe</a> from these emails
      </p>
    </div>
  `
}

// Send email using Resend API
export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, from = DEFAULT_FROM } = options
  
  // In development, just log the email
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
    console.log("📧 [DEV] Email would be sent:")
    console.log(`   To: ${Array.isArray(to) ? to.join(", ") : to}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   From: ${from}`)
    return {
      success: true,
      messageId: `dev-${Date.now()}`
    }
  }

  // Production email sending via Resend
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured")
      return {
        success: false,
        error: "Email service not configured"
      }
    }

    const recipients = Array.isArray(to) ? to : [to]
    
    // For batch sending, we use Resend's batch API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Resend API error:", errorData)
      return {
        success: false,
        error: errorData.message || "Failed to send email"
      }
    }

    const data = await response.json()
    return {
      success: true,
      messageId: data.id
    }
  } catch (error) {
    console.error("Email send error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

// Send email to multiple recipients (batch)
export async function sendBatchEmails(
  recipients: { email: string; name?: string }[],
  subject: string,
  html: string
): Promise<{ successful: string[]; failed: string[] }> {
  const successful: string[] = []
  const failed: string[] = []

  // Process in batches of 100 (Resend limit)
  const batchSize = 100
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)
    
    // For each recipient, add their unsubscribe link
    const emailsWithUnsubscribe = batch.map(recipient => ({
      ...recipient,
      html: addUnsubscribeFooter(html, recipient.email)
    }))

    // In development, just log
    if (process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
      console.log(`📧 [DEV] Batch ${Math.floor(i / batchSize) + 1}: Would send to ${batch.length} recipients`)
      batch.forEach(r => successful.push(r.email))
      continue
    }

    // Send batch via Resend
    try {
      const resendApiKey = process.env.RESEND_API_KEY
      
      if (!resendApiKey) {
        batch.forEach(r => failed.push(r.email))
        continue
      }

      // Send individual emails with personalized unsubscribe links
      const results = await Promise.allSettled(
        emailsWithUnsubscribe.map(recipient =>
          sendEmail({
            to: recipient.email,
            subject,
            html: recipient.html,
            from: DEFAULT_FROM
          })
        )
      )

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.success) {
          successful.push(batch[index].email)
        } else {
          failed.push(batch[index].email)
        }
      })
    } catch (error) {
      console.error("Batch send error:", error)
      batch.forEach(r => failed.push(r.email))
    }
  }

  return { successful, failed }
}

// Send welcome email to new subscriber
export async function sendWelcomeEmail(email: string, name?: string): Promise<SendEmailResult> {
  const content = `
    <h2>Welcome to InnovaSci Open Academy!</h2>
    <p>Hello ${name || "there"},</p>
    <p>Thank you for subscribing to our newsletter. You'll now receive:</p>
    <ul>
      <li>Latest course updates and new offerings</li>
      <li>Learning tips and industry insights</li>
      <li>Exclusive promotions and discounts</li>
      <li>Inspiring success stories from our community</li>
    </ul>
    <p>Start exploring our courses today and begin your learning journey!</p>
    <a href="${APP_URL}/courses" class="button">Browse Courses</a>
  `
  
  return sendEmail({
    to: email,
    subject: "Welcome to InnovaSci Open Academy! 🎓",
    html: wrapInEmailTemplate(content, "Welcome!")
  })
}

// Send unsubscribe confirmation
export async function sendUnsubscribeConfirmation(email: string): Promise<SendEmailResult> {
  const content = `
    <h2>You've Been Unsubscribed</h2>
    <p>Hello,</p>
    <p>You've been successfully unsubscribed from InnovaSci Open Academy newsletters.</p>
    <p>We're sorry to see you go. If you ever want to re-subscribe, simply visit our website.</p>
    <p>If you unsubscribed by mistake, click below to re-subscribe:</p>
    <a href="${APP_URL}/newsletter" class="button">Re-subscribe</a>
  `
  
  return sendEmail({
    to: email,
    subject: "You've Been Unsubscribed - InnovaSci Open Academy",
    html: wrapInEmailTemplate(content, "Unsubscribed")
  })
}

// ============================================
// TICKET EMAIL NOTIFICATIONS
// ============================================

interface TicketEmailData {
  ticketId: string
  subject: string
  customerEmail: string
  customerName?: string
  message: string
  status?: string
  ticketUrl?: string
}

export async function sendTicketReplyNotification(data: TicketEmailData): Promise<SendEmailResult> {
  const { customerEmail, customerName, subject, message, ticketId } = data
  
  const ticketUrl = data.ticketUrl || `${APP_URL}/support/tickets/${ticketId}`
  
  const content = `
    <h2>We've Responded to Your Support Request</h2>
    <p>Hello ${customerName || "there"},</p>
    <p>Our support team has responded to your ticket:</p>
    <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 10px; color: #1f2937;">${subject}</h3>
      <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${message}</p>
    </div>
    <a href="${ticketUrl}" class="button">View Full Conversation</a>
    <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
      If you have any further questions, please don't hesitate to reach out.
    </p>
  `
  
  return sendEmail({
    to: customerEmail,
    subject: `Re: ${subject}`,
    html: wrapInEmailTemplate(content, "Support Response"),
  })
}

export async function sendTicketCreatedNotification(data: TicketEmailData): Promise<SendEmailResult> {
  const { customerEmail, customerName, subject, ticketId } = data
  
  const ticketUrl = data.ticketUrl || `${APP_URL}/support/tickets/${ticketId}`
  
  const content = `
    <h2>Support Ticket Received</h2>
    <p>Hello ${customerName || "there"},</p>
    <p>Thank you for contacting our support team. Your ticket has been received and is being reviewed.</p>
    <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 10px; color: #1f2937;">${subject}</h3>
      <p style="margin: 0; color: #6b7280;">Ticket ID: #${ticketId.slice(0, 8).toUpperCase()}</p>
    </div>
    <p style="margin: 0 0 20px;">Our team will get back to you as soon as possible. You can expect a response within 24-48 hours.</p>
    <a href="${ticketUrl}" class="button">View Your Ticket</a>
  `
  
  return sendEmail({
    to: customerEmail,
    subject: `Support Ticket Received: ${subject}`,
    html: wrapInEmailTemplate(content, "Ticket Received"),
  })
}

export async function sendTicketStatusNotification(data: TicketEmailData): Promise<SendEmailResult> {
  const { customerEmail, customerName, subject, status, ticketId } = data
  
  const statusMessages: Record<string, string> = {
    open: "Your ticket is now open and waiting for review.",
    in_progress: "Your ticket is being worked on by our team.",
    resolved: "Your ticket has been marked as resolved.",
    closed: "Your ticket has been closed.",
  }
  
  const content = `
    <h2>Ticket Status Update</h2>
    <p>Hello ${customerName || "there"},</p>
    <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center;">
      <p style="margin: 0; font-size: 18px; color: #667eea; text-transform: capitalize; font-weight: bold;">${status?.replace("_", " ") || "Updated"}</p>
      <p style="margin: 10px 0 0; color: #4b5563;">${statusMessages[status || ""] || "Your ticket status has been updated."}</p>
    </div>
    <p style="margin: 20px 0;">Ticket: ${subject}</p>
    <a href="${APP_URL}/support/tickets/${ticketId}" class="button">View Ticket</a>
  `
  
  return sendEmail({
    to: customerEmail,
    subject: `Ticket Status Updated: ${subject}`,
    html: wrapInEmailTemplate(content, "Status Update"),
  })
}

// ============================================
// SCHOLARSHIP EMAIL NOTIFICATIONS
// ============================================

interface ScholarshipApplicationEmailData {
  recipientEmail: string
  recipientName?: string
  applicationNumber: string
  trackingNumber: string
  scholarshipName: string
  scholarshipSlug: string
}

export async function sendScholarshipApplicationConfirmation(data: ScholarshipApplicationEmailData): Promise<SendEmailResult> {
  const { recipientEmail, recipientName, applicationNumber, trackingNumber, scholarshipName, scholarshipSlug } = data
  
  const content = `
    <h2>Scholarship Application Received</h2>
    <p>Hello ${recipientName || "Applicant"},</p>
    <p>Thank you for applying for the <strong>${scholarshipName}</strong> scholarship! We have received your application.</p>
    <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px; color: #1f2937;"><strong>Application Number:</strong> ${applicationNumber}</p>
      <p style="margin: 0 0 10px; color: #1f2937;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p style="margin: 0; color: #6b7280;">Save your tracking number to check your application status.</p>
    </div>
    <p>You can track your application status using your tracking number:</p>
    <a href="${APP_URL}/scholarships/track" class="button">Track Your Application</a>
    <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
      Our scholarship committee will review all applications and notify you of the outcome via email.
    </p>
  `
  
  return sendEmail({
    to: recipientEmail,
    subject: `Scholarship Application Received - ${scholarshipName}`,
    html: wrapInEmailTemplate(content, "Application Received"),
  })
}

export async function sendScholarshipStatusUpdate(data: {
  recipientEmail: string
  recipientName?: string
  applicationNumber: string
  scholarshipName: string
  status: string
  notes?: string
}): Promise<SendEmailResult> {
  const { recipientEmail, recipientName, applicationNumber, scholarshipName, status, notes } = data
  
  const statusMessages: Record<string, string> = {
    UNDER_REVIEW: "Your application is now being reviewed by our scholarship committee.",
    INTERVIEW: "Congratulations! You have been selected for an interview.",
    ADDITIONAL_INFO: "We need additional information from you to complete your application.",
    APPROVED: "Congratulations! Your application has been approved!",
    REJECTED: "Thank you for your interest. Unfortunately, your application was not selected this time.",
  }
  
  const statusColors: Record<string, string> = {
    UNDER_REVIEW: "#f59e0b",
    INTERVIEW: "#8b5cf6",
    ADDITIONAL_INFO: "#f97316",
    APPROVED: "#10b981",
    REJECTED: "#ef4444",
  }
  
  const content = `
    <h2>Scholarship Application Status Update</h2>
    <p>Hello ${recipientName || "Applicant"},</p>
    <div style="background: ${statusColors[status] || "#667eea"}20; padding: 20px; margin: 20px 0; border-radius: 4px; border-left: 4px solid ${statusColors[status] || "#667eea"}; text-align: center;">
      <p style="margin: 0; font-size: 20px; color: ${statusColors[status] || "#667eea"}; font-weight: bold; text-transform: capitalize;">${status.replace("_", " ")}</p>
    </div>
    <p><strong>Scholarship:</strong> ${scholarshipName}</p>
    <p><strong>Application Number:</strong> ${applicationNumber}</p>
    <p style="margin-top: 20px;">${statusMessages[status] || "Your application status has been updated."}</p>
    ${notes ? `<p style="margin-top: 10px; padding: 15px; background: #f9fafb; border-radius: 4px;"><strong>Notes:</strong> ${notes}</p>` : ""}
    <a href="${APP_URL}/scholarships/track" class="button">Track Your Application</a>
  `
  
  return sendEmail({
    to: recipientEmail,
    subject: `Application ${status.replace("_", " ")} - ${scholarshipName}`,
    html: wrapInEmailTemplate(content, "Status Update"),
  })
}

export async function sendScholarshipAwardNotification(data: {
  recipientEmail: string
  recipientName?: string
  awardNumber: string
  scholarshipName: string
  amount: number
  currency: string
  startDate: string
  acceptanceDeadline: string
}): Promise<SendEmailResult> {
  const { recipientEmail, recipientName, awardNumber, scholarshipName, amount, currency, startDate, acceptanceDeadline } = data
  
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
  
  const content = `
    <h2>🎉 Congratulations! You've Been Awarded!</h2>
    <p>Dear ${recipientName || "Scholar"},</p>
    <p>We are thrilled to inform you that you have been awarded the <strong>${scholarshipName}</strong> scholarship!</p>
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center; color: white;">
      <p style="margin: 0; font-size: 14px;">Award Amount</p>
      <p style="margin: 10px 0 0; font-size: 32px; font-weight: bold;">${formattedAmount}</p>
    </div>
    <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px;"><strong>Award Number:</strong> ${awardNumber}</p>
      <p style="margin: 0 0 10px;"><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
      <p style="margin: 0;"><strong>Acceptance Deadline:</strong> ${new Date(acceptanceDeadline).toLocaleDateString()}</p>
    </div>
    <p><strong>Important:</strong> Please accept your award by the deadline to secure your scholarship.</p>
    <a href="${APP_URL}/scholarships/awards/accept/${awardNumber}" class="button">Accept Your Award</a>
    <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
      If you have any questions, please don't hesitate to contact our scholarship office.
    </p>
  `
  
  return sendEmail({
    to: recipientEmail,
    subject: `🎉 You've Been Awarded - ${scholarshipName}`,
    html: wrapInEmailTemplate(content, "Congratulations!"),
  })
}
