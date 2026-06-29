import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding forum data (Welcome & FAQ threads)...")

  // Find or create a system user for pinned threads
  let systemUser = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: "admin@innosci.org" },
        { email: "system@innosci.org" }
      ]
    }
  })

  if (!systemUser) {
    // Try to find any admin user
    systemUser = await prisma.user.findFirst({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }
    })
  }

  if (!systemUser) {
    // Try to find any user to use as author
    systemUser = await prisma.user.findFirst()
  }

  if (!systemUser) {
    console.log("No users found. Forum seeding skipped. Please create a user first.")
    return
  }

  console.log(`Using user "${systemUser.email}" as thread author`)

  // Define pinned threads to create
  const pinnedThreads = [
    {
      title: "Welcome to the InnovaSci Open Academy Community! 🎓",
      content: `👋 **Welcome to InnovaSci Open Academy!**

We're thrilled to have you join our learning community. Here's what you need to know:

## Getting Started
1. Browse our course catalog and find topics that interest you
2. Enroll in courses that match your learning goals
3. Track your progress and earn certificates
4. Join the community forum to connect with fellow learners

## Community Guidelines
- **Be Respectful**: Treat all members with respect and courtesy
- **Stay on Topic**: Keep discussions relevant to the course or subject
- **Help Others**: Share your knowledge and help fellow students
- **No Spam**: Don't post promotional content or irrelevant links

## Quick Links
- 📚 Browse Courses
- 🏆 My Certificates
- 🗺️ Learning Paths
- 💬 Forum

Have questions? Don't hesitate to ask. We're here to help!

**Happy Learning!**`,
      category: "announcements",
      isPinned: true
    },
    {
      title: "Frequently Asked Questions (FAQ) 📚",
      content: `## Frequently Asked Questions

### Course Enrollment & Access

**Q: How do I enroll in a course?**
A: Navigate to the course page and click the "Enroll Now" button. You can pay using credit card, Paystack, or bank transfer.

**Q: Can I get a refund?**
A: Yes! We offer a 30-day money-back guarantee. Contact our support team within 30 days of purchase for a full refund.

**Q: How long do I have access to courses?**
A: Once enrolled, you have **lifetime access** to all course materials, including future updates.

### Certificates

**Q: How do I earn a certificate?**
A: Complete all lessons in a course and pass any required assessments. Your certificate will be available in your dashboard.

**Q: Are certificates verifiable?**
A: Yes! Each certificate has a unique verification code that employers can use to verify your achievement.

### Learning Paths

**Q: What are Learning Paths?**
A: Learning Paths are curated sequences of courses designed to help you master a specific skill or career track.

### Technical Support

**Q: The video is not playing. What should I do?**
A: Try refreshing the page, clearing your browser cache, or using a different browser. If the issue persists, contact support.

---

*Still have questions? Contact our support team or ask in this forum!*`,
      category: "announcements",
      isPinned: true
    },
    {
      title: "How to Make the Most of Your Learning Experience 🎯",
      content: `## Tips for Effective Learning

### 1. Set Clear Goals
Before starting a course, define what you want to achieve. Having clear goals keeps you motivated and focused.

### 2. Create a Study Schedule
Consistency is key to learning. Set aside dedicated time each day or week for studying.

### 3. Take Notes
Write down key concepts, formulas, and ideas. Note-taking improves retention and helps you review later.

### 4. Practice Regularly
Learning by doing is more effective than passive watching. Complete all exercises and projects in each course.

### 5. Join Study Groups
Connect with other learners in the forum. Discussing concepts with others deepens your understanding.

---

**Share your learning tips in the replies below!**`,
      category: "general",
      isPinned: false
    }
  ]

  // Create threads
  let createdCount = 0
  let existingCount = 0

  for (const threadData of pinnedThreads) {
    // Check if thread already exists by title
    const existingThread = await prisma.forumThread.findFirst({
      where: { title: threadData.title }
    })

    if (!existingThread) {
      await prisma.forumThread.create({
        data: {
          title: threadData.title,
          content: threadData.content,
          category: threadData.category,
          isPinned: threadData.isPinned,
          authorId: systemUser.id,
          isActive: true
        }
      })
      createdCount++
      console.log(`✓ Created: "${threadData.title}"`)
    } else {
      existingCount++
      console.log(`○ Already exists: "${threadData.title}"`)
    }
  }

  console.log(`\n✅ Forum seeding complete!`)
  console.log(`   Created: ${createdCount} new threads`)
  console.log(`   Already existed: ${existingCount} threads`)
}

main()
  .catch((e) => {
    console.error("Error seeding forum:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })