import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding forum data...")

  // Find or create a system user for pinned threads
  let systemUser = await prisma.user.findFirst({
    where: { email: "admin@innosci.org" }
  })

  if (!systemUser) {
    // Try to find any user to use as author
    systemUser = await prisma.user.findFirst()
  }

  if (!systemUser) {
    console.log("No users found. Please create a user first.")
    return
  }

  // Create pinned threads
  const pinnedThreads = [
    {
      title: "Welcome to the Community",
      content: "👋 Welcome to the InnovaSci Open Academy community!\n\nWe're excited to have you here. This is a space where you can:\n\n• Share your learning journey\n• Ask questions about courses\n• Help other learners\n• Discuss scientific topics\n• Connect with fellow students\n\nIntroduce yourself in the comments and let us know what you're learning!",
      category: "announcements",
      isPinned: true,
      authorId: systemUser.id
    },
    {
      title: "Frequently Asked Questions (FAQ)",
      content: "📚 Common Questions and Answers\n\n**Course Enrollment**\nQ: How do I enroll in a course?\nA: Browse our course catalog, select a course, and click 'Enroll Now'. You can pay using credit card, Paystack, or bank transfer.\n\nQ: Can I get a refund?\nA: Yes! We offer a 30-day money-back guarantee. Contact support within 30 days of purchase.\n\n**Certificates**\nQ: How do I download my certificate?\nA: Go to 'My Certificates' in your dashboard and click the download button.\n\nQ: Are certificates verifiable?\nA: Yes! Each certificate has a unique verification code that employers can use to verify your achievement.\n\n**Platform Usage**\nQ: Can I access courses offline?\nA: Currently, offline access requires an internet connection. We're working on this feature.\n\nQ: How long do I have access?\nA: Once enrolled, you have lifetime access to all course materials.\n\nHave more questions? Feel free to ask in the forum!",
      category: "announcements",
      isPinned: true,
      authorId: systemUser.id
    }
  ]

  for (const threadData of pinnedThreads) {
    // Check if thread already exists
    const existingThread = await prisma.forumThread.findFirst({
      where: { title: threadData.title }
    })

    if (!existingThread) {
      await prisma.forumThread.create({
        data: threadData
      })
      console.log(`✓ Created thread: "${threadData.title}"`)
    } else {
      console.log(`○ Thread already exists: "${threadData.title}"`)
    }
  }

  console.log("Forum seeding complete!")
}

main()
  .catch((e) => {
    console.error("Error seeding forum:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })