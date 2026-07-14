/**
 * Seed script for default Scholarship Types
 * Run with: npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed-scholarship-types.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const DEFAULT_SCHOLARSHIP_TYPES = [
  {
    name: "Excellence Scholarship",
    slug: "excellence",
    description: "For students with outstanding academic achievement and exceptional performance.",
    icon: "GraduationCap",
    color: "#8B5CF6",
    orderIndex: 1,
  },
  {
    name: "Research & Innovation Scholarship",
    slug: "research-innovation",
    description: "For students involved in scientific research, AI, computational sciences, drug discovery, innovation, and technology.",
    icon: "FlaskConical",
    color: "#3B82F6",
    orderIndex: 2,
  },
  {
    name: "Opportunity Scholarship",
    slug: "opportunity",
    description: "For talented students who require financial assistance or special educational support.",
    icon: "Heart",
    color: "#EC4899",
    orderIndex: 3,
  },
  {
    name: "Global Partnership Scholarship",
    slug: "global-partnership",
    description: "For scholarships funded by governments, universities, NGOs, companies, foundations, donors, or strategic partners.",
    icon: "Globe",
    color: "#10B981",
    orderIndex: 4,
  },
  {
    name: "Leadership & Impact Scholarship",
    slug: "leadership-impact",
    description: "For students demonstrating leadership, community service, entrepreneurship, innovation, or outstanding societal impact.",
    icon: "Star",
    color: "#F59E0B",
    orderIndex: 5,
  },
  {
    name: "Custom Scholarship",
    slug: "custom",
    description: "A flexible scholarship type that allows administrators to create any additional scholarship program.",
    icon: "Sparkles",
    color: "#6366F1",
    orderIndex: 6,
  },
]

async function seedScholarshipTypes() {
  console.log("🌱 Seeding scholarship types...\n")

  let created = 0
  let skipped = 0
  let updated = 0

  for (const type of DEFAULT_SCHOLARSHIP_TYPES) {
    // Check if type already exists
    const existing = await prisma.scholarshipType.findFirst({
      where: {
        OR: [{ slug: type.slug }, { name: type.name }],
      },
    })

    if (existing) {
      // Update if description or other fields changed
      const needsUpdate =
        existing.description !== type.description ||
        existing.icon !== type.icon ||
        existing.color !== type.color ||
        existing.orderIndex !== type.orderIndex

      if (needsUpdate) {
        await prisma.scholarshipType.update({
          where: { id: existing.id },
          data: {
            description: type.description,
            icon: type.icon,
            color: type.color,
            orderIndex: type.orderIndex,
          },
        })
        console.log(`  ✏️  Updated: ${type.name}`)
        updated++
      } else {
        console.log(`  ⏭️  Skipped: ${type.name} (already exists)`)
        skipped++
      }
    } else {
      // Create new type
      await prisma.scholarshipType.create({
        data: {
          name: type.name,
          slug: type.slug,
          description: type.description,
          icon: type.icon,
          color: type.color,
          orderIndex: type.orderIndex,
          isActive: true,
        },
      })
      console.log(`  ✅ Created: ${type.name}`)
      created++
    }
  }

  console.log("\n📊 Seed Summary:")
  console.log(`   Created: ${created}`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Total: ${created + updated + skipped}`)

  // Display all types
  const allTypes = await prisma.scholarshipType.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      _count: {
        select: { scholarships: true },
      },
    },
  })

  console.log("\n📋 All Scholarship Types:")
  console.log("─".repeat(80))
  console.log("ID".padEnd(40) + "Name".padEnd(30) + "Scholarships")
  console.log("─".repeat(80))
  for (const t of allTypes) {
    console.log(
      t.id.substring(0, 37).padEnd(40) +
      t.name.substring(0, 27).padEnd(30) +
      t._count.scholarships.toString()
    )
  }
  console.log("─".repeat(80))
}

async function main() {
  try {
    await seedScholarshipTypes()
  } catch (error) {
    console.error("❌ Error seeding scholarship types:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log("\n✨ Seeding completed successfully!")
    process.exit(0)
  })
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
