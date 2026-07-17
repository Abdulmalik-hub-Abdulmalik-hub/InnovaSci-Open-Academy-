import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const scholarshipTypes = [
  {
    name: 'Workforce Scholarships',
    slug: 'workforce-scholarships',
    description: 'Scholarships designed to support workforce development and career advancement in emerging industries and critical skills areas.',
    icon: 'Briefcase',
    color: '#7C3AED',
    orderIndex: 1,
  },
  {
    name: 'Merit Scholarships',
    slug: 'merit-scholarships',
    description: 'Awarded to students demonstrating exceptional academic achievement, leadership, and outstanding performance.',
    icon: 'Trophy',
    color: '#F59E0B',
    orderIndex: 2,
  },
  {
    name: 'Need-Based Scholarships',
    slug: 'need-based-scholarships',
    description: 'Financial assistance for students who demonstrate significant financial need to pursue their education.',
    icon: 'Heart',
    color: '#EF4444',
    orderIndex: 3,
  },
  {
    name: 'Research Scholarships',
    slug: 'research-scholarships',
    description: 'Support for students engaged in scientific research, innovation projects, and academic research initiatives.',
    icon: 'Microscope',
    color: '#10B981',
    orderIndex: 4,
  },
  {
    name: 'Women in STEM Scholarships',
    slug: 'women-in-stem-scholarships',
    description: 'Empowering women pursuing careers in Science, Technology, Engineering, and Mathematics fields.',
    icon: 'Sparkles',
    color: '#EC4899',
    orderIndex: 5,
  },
  {
    name: 'Community Impact Scholarships',
    slug: 'community-impact-scholarships',
    description: 'Recognizing students who have made significant positive contributions to their communities.',
    icon: 'Users',
    color: '#3B82F6',
    orderIndex: 6,
  },
  {
    name: 'Founder Scholarships',
    slug: 'founder-scholarships',
    description: 'Scholarships funded by platform founders to support the next generation of innovators and entrepreneurs.',
    icon: 'Rocket',
    color: '#8B5CF6',
    orderIndex: 7,
  },
  {
    name: 'Sponsored Scholarships',
    slug: 'sponsored-scholarships',
    description: 'Scholarships sponsored by corporate partners, foundations, and organizations committed to education.',
    icon: 'Building2',
    color: '#6366F1',
    orderIndex: 8,
  },
  {
    name: 'Zakat & Waqf Scholarships',
    slug: 'zakat-waqf-scholarships',
    description: 'Islamic charitable scholarships funded through Zakat and Waqf contributions for eligible students.',
    icon: 'Moon',
    color: '#059669',
    orderIndex: 9,
  },
  {
    name: 'Tuition Waivers',
    slug: 'tuition-waivers',
    description: 'Partial or full tuition waivers to reduce the financial burden of education for qualifying students.',
    icon: 'Percent',
    color: '#14B8A6',
    orderIndex: 10,
  },
  {
    name: 'Partial Scholarships',
    slug: 'partial-scholarships',
    description: 'Scholarships covering a portion of tuition or educational expenses to support student finances.',
    icon: 'DollarSign',
    color: '#F97316',
    orderIndex: 11,
  },
  {
    name: 'Full Scholarships',
    slug: 'full-scholarships',
    description: 'Complete coverage of tuition, fees, and often including living stipends for outstanding candidates.',
    icon: 'Crown',
    color: '#EAB308',
    orderIndex: 12,
  },
  {
    name: 'Financial Aid',
    slug: 'financial-aid',
    description: 'Comprehensive financial assistance programs including grants, loans, and work-study opportunities.',
    icon: 'Wallet',
    color: '#64748B',
    orderIndex: 13,
  },
]

async function main() {
  console.log('🌱 Seeding scholarship types...')

  for (const type of scholarshipTypes) {
    await prisma.scholarshipType.upsert({
      where: { slug: type.slug },
      update: {
        name: type.name,
        description: type.description,
        icon: type.icon,
        color: type.color,
        orderIndex: type.orderIndex,
      },
      create: type,
    })
    console.log(`  ✓ ${type.name}`)
  }

  // Create default review rubric
  const defaultRubric = {
    name: 'Default Scholarship Review',
    slug: 'default-scholarship-review',
    description: 'Standard rubric for evaluating scholarship applications',
    criteria: [
      {
        id: 'academic_excellence',
        name: 'Academic Excellence',
        description: 'GPA, transcripts, and academic achievements',
        maxScore: 25,
        weight: 1,
      },
      {
        id: 'research_potential',
        name: 'Research Potential',
        description: 'Research experience, publications, and innovation',
        maxScore: 20,
        weight: 1,
      },
      {
        id: 'leadership',
        name: 'Leadership',
        description: 'Leadership experience and community involvement',
        maxScore: 15,
        weight: 1,
      },
      {
        id: 'financial_need',
        name: 'Financial Need',
        description: 'Demonstrated financial need assessment',
        maxScore: 15,
        weight: 1,
      },
      {
        id: 'personal_statement',
        name: 'Personal Statement',
        description: 'Quality of essay, motivation, and goals',
        maxScore: 15,
        weight: 1,
      },
      {
        id: 'recommendations',
        name: 'Recommendations',
        description: 'Strength of recommendation letters',
        maxScore: 10,
        weight: 1,
      },
    ],
    totalScore: 100,
    passingScore: 60,
    isActive: true,
  }

  await prisma.reviewRubric.upsert({
    where: { slug: defaultRubric.slug },
    update: defaultRubric,
    create: defaultRubric,
  })
  console.log('  ✓ Default review rubric created')

  console.log('✅ Scholarship types seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding scholarship types:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
