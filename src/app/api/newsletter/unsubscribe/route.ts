import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendUnsubscribeConfirmation } from "@/lib/email"

// GET /api/newsletter/unsubscribe - Get unsubscribe confirmation page
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email parameter is required" },
      { status: 400 }
    )
  }

  const decodedEmail = decodeURIComponent(email)

  // Check if email is subscribed
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email: decodedEmail }
  })

  const isSubscribed = subscriber?.isActive ?? false

  // Return simple HTML page
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter Subscription - InnovaSci Open Academy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 20px;
    }
    .container {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    h1 { color: white; margin-bottom: 20px; font-size: 24px; }
    p { color: rgba(255, 255, 255, 0.7); margin-bottom: 30px; line-height: 1.6; }
    .email { color: #a78bfa; font-weight: 500; }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #7C3AED, #2563EB);
      color: white;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: transform 0.2s, opacity 0.2s;
    }
    .button:hover { opacity: 0.9; transform: translateY(-2px); }
    .success { border-color: #10b981; }
    .success h1 { color: #10b981; }
    .unsubscribed { color: rgba(255, 255, 255, 0.5); font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container ${isSubscribed ? '' : 'success'}">
    <h1>${isSubscribed ? 'Unsubscribe' : 'Already Unsubscribed'}</h1>
    <p>
      ${isSubscribed 
        ? `Are you sure you want to unsubscribe <span class="email">${decodedEmail}</span> from our newsletter?`
        : `<span class="email">${decodedEmail}</span> is already unsubscribed from our newsletter.`
      }
    </p>
    ${isSubscribed 
      ? `<a href="/api/newsletter/unsubscribe?email=${encodeURIComponent(decodedEmail)}&confirm=true" class="button">Yes, Unsubscribe</a>`
      : `<a href="/" class="button">Return Home</a>`
    }
    <p class="unsubscribed">You won't receive any more emails from us.</p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" }
  })
}

// POST /api/newsletter/unsubscribe - Unsubscribe email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if subscriber exists
    let subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (subscriber) {
      if (!subscriber.isActive) {
        return NextResponse.json({
          success: true,
          message: "Already unsubscribed"
        })
      }

      // Update subscriber
      await prisma.newsletterSubscriber.update({
        where: { email: email.toLowerCase() },
        data: {
          isActive: false,
          unsubscribedAt: new Date()
        }
      })
    } else {
      // Create unsubscribed record to prevent future subscriptions
      await prisma.newsletterSubscriber.create({
        data: {
          email: email.toLowerCase(),
          isActive: false,
          unsubscribedAt: new Date()
        }
      })
    }

    // Send confirmation email
    await sendUnsubscribeConfirmation(email)

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed"
    })

  } catch (error) {
    console.error("Unsubscribe error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to unsubscribe" },
      { status: 500 }
    )
  }
}