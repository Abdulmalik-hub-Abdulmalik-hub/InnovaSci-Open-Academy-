import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding categories...")

  const categories = [
    {
      name: "Web Development",
      slug: "web-development",
      description: "Learn to build modern websites and web applications",
      icon: "🌐",
      color: "#6366f1",
      orderIndex: 1
    },
    {
      name: "Mobile Development",
      slug: "mobile-development",
      description: "Build iOS and Android applications",
      icon: "📱",
      color: "#ec4899",
      orderIndex: 2
    },
    {
      name: "Data Science",
      slug: "data-science",
      description: "Analyze data and build machine learning models",
      icon: "📊",
      color: "#10b981",
      orderIndex: 3
    },
    {
      name: "Cloud Computing",
      slug: "cloud-computing",
      description: "Master AWS, Azure, and Google Cloud Platform",
      icon: "☁️",
      color: "#3b82f6",
      orderIndex: 4
    },
    {
      name: "DevOps",
      slug: "devops",
      description: "Learn CI/CD, containerization, and infrastructure",
      icon: "🔄",
      color: "#f59e0b",
      orderIndex: 5
    },
    {
      name: "Cybersecurity",
      slug: "cybersecurity",
      description: "Understand security principles and protect systems",
      icon: "🔒",
      color: "#ef4444",
      orderIndex: 6
    },
    {
      name: "Artificial Intelligence",
      slug: "artificial-intelligence",
      description: "Deep learning, NLP, and AI applications",
      icon: "🤖",
      color: "#8b5cf6",
      orderIndex: 7
    },
    {
      name: "Programming Fundamentals",
      slug: "programming-fundamentals",
      description: "Essential programming concepts and logic",
      icon: "💻",
      color: "#14b8a6",
      orderIndex: 8
    }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    })
    console.log(`Created category: ${category.name}`)
  }

  console.log("Categories seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
