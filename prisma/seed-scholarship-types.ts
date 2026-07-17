/**
 * Seed script for comprehensive Scholarship Types
 * Run with: npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed-scholarship-types.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const DEFAULT_SCHOLARSHIP_TYPES = [
  {
    name: "Academic Excellence Scholarship",
    slug: "academic-excellence",
    shortName: "Academic Excellence",
    description: "Awarded to students who demonstrate outstanding academic achievement, exceptional grades, and a commitment to scholarly excellence.",
    objectives: "• Recognize and reward exceptional academic performance\n• Encourage continued dedication to academic excellence\n• Support students who demonstrate outstanding intellectual capabilities\n• Foster a culture of academic achievement and scholarly pursuit",
    eligibility: "• Minimum GPA of 3.5 or equivalent\n• Full-time enrollment in an accredited institution\n• Completion of at least one semester of undergraduate or graduate studies\n• Demonstrated commitment to academic excellence through coursework and research\n• Strong letters of recommendation from faculty members",
    benefits: "• Full or partial tuition coverage\n• Monthly stipend for living expenses\n• Priority access to research opportunities\n• Mentorship from faculty members\n• Networking opportunities with academic professionals",
    icon: "GraduationCap",
    color: "#8B5CF6",
    badge: "Academic",
    orderIndex: 1,
    seoTitle: "Academic Excellence Scholarship | Merit-Based Educational Award",
    seoDescription: "Apply for the Academic Excellence Scholarship recognizing outstanding academic achievement. Full tuition coverage and stipends available for high-achieving students.",
    seoKeywords: "academic scholarship, merit scholarship, GPA scholarship, dean's list, honor society",
    tags: "academic, merit, grades, honor",
  },
  {
    name: "Merit Scholarship",
    slug: "merit",
    shortName: "Merit",
    description: "Recognizes students who demonstrate exceptional abilities, talent, or potential across various disciplines.",
    objectives: "• Reward exceptional talent and potential\n• Support students who show promise in their field\n• Encourage continuous growth and development\n• Identify and nurture future leaders",
    eligibility: "• Demonstrated excellence in chosen field\n• Portfolio or evidence of achievement\n• Minimum academic standing as specified by program\n• Recommendation from mentor or professional\n• Statement of purpose outlining goals",
    benefits: "• Financial support for educational expenses\n• Professional development opportunities\n• Access to exclusive workshops and seminars\n• Networking with industry professionals\n• Internship placement assistance",
    icon: "Star",
    color: "#F59E0B",
    badge: "Merit",
    orderIndex: 2,
    seoTitle: "Merit Scholarship | Recognizing Exceptional Talent",
    seoDescription: "Discover Merit Scholarships for students demonstrating exceptional talent and potential. Financial support and professional development opportunities.",
    seoKeywords: "merit scholarship, talent recognition, achievement award, exceptional student",
    tags: "merit, talent, achievement, potential",
  },
  {
    name: "Need-Based Scholarship",
    slug: "need-based",
    shortName: "Need-Based",
    description: "Provides financial assistance to students who demonstrate significant financial need to pursue their educational goals.",
    objectives: "• Remove financial barriers to education\n• Support students from disadvantaged backgrounds\n• Promote equal access to educational opportunities\n• Help families facing economic challenges",
    eligibility: "• Demonstrated financial need through official documentation\n• Household income below threshold as defined by program\n• Enrollment in accredited educational program\n• Good academic standing with minimum GPA requirements\n• Completion of financial aid application",
    benefits: "• Direct financial assistance for tuition and fees\n• Book allowance and educational supplies\n• Housing support for on-campus students\n• Meal plan assistance\n• Emergency funding for unexpected expenses",
    icon: "Heart",
    color: "#EC4899",
    badge: "Need-Based",
    orderIndex: 3,
    seoTitle: "Need-Based Scholarship | Financial Aid for Students",
    seoDescription: "Apply for Need-Based Scholarships designed to help students with financial challenges. Access education regardless of economic circumstances.",
    seoKeywords: "need-based scholarship, financial aid, low income students, educational support",
    tags: "need-based, financial aid, assistance, support",
  },
  {
    name: "Women in STEM Scholarship",
    slug: "women-in-stem",
    shortName: "Women in STEM",
    description: "Empowering women pursuing careers in Science, Technology, Engineering, and Mathematics through targeted support and opportunities.",
    objectives: "• Increase representation of women in STEM fields\n• Support women's advancement in technical disciplines\n• Create networking opportunities for women in STEM\n• Encourage innovation and leadership among women scientists\n• Break gender barriers in traditionally male-dominated fields",
    eligibility: "• Self-identify as woman\n• Enrolled in STEM program (Science, Technology, Engineering, Mathematics)\n• Minimum GPA of 3.0 or equivalent\n• Demonstrated interest in advancing women in STEM\n• Commitment to promoting diversity in technology",
    benefits: "• Tuition support for STEM programs\n• Conference attendance funding\n• Mentorship from women leaders in STEM\n• Access to exclusive networking events\n• Technology and equipment allowances",
    icon: "FlaskConical",
    color: "#3B82F6",
    badge: "STEM",
    orderIndex: 4,
    seoTitle: "Women in STEM Scholarship | Supporting Women in Technology",
    seoDescription: "Women in STEM Scholarships supporting female students pursuing careers in science, technology, engineering, and mathematics. Join a community of innovation.",
    seoKeywords: "women in STEM, female STEM students, women in technology, girls in science",
    tags: "women, STEM, technology, engineering, science, diversity",
  },
  {
    name: "Research Scholarship",
    slug: "research",
    shortName: "Research",
    description: "Supports students engaged in scientific research, innovation projects, and academic inquiry across disciplines.",
    objectives: "• Advance scientific knowledge and discovery\n• Support undergraduate and graduate research initiatives\n• Encourage innovation and creative problem-solving\n• Foster collaboration between students and faculty\n• Develop the next generation of researchers",
    eligibility: "• Active participation in research project\n• Faculty sponsorship or mentorship\n• Minimum GPA of 3.2 in relevant coursework\n• Submission of research proposal or ongoing research documentation\n• Strong analytical and critical thinking skills",
    benefits: "• Research funding and laboratory supplies\n• Conference presentation support\n• Publication assistance for research papers\n• Access to specialized equipment and facilities\n• Collaboration opportunities with leading researchers",
    icon: "Microscope",
    color: "#10B981",
    badge: "Research",
    orderIndex: 5,
    seoTitle: "Research Scholarship | Supporting Scientific Discovery",
    seoDescription: "Research Scholarships for students conducting scientific studies and innovation projects. Funding for laboratory work, conferences, and publications.",
    seoKeywords: "research scholarship, scientific research, undergraduate research, research funding",
    tags: "research, science, innovation, discovery",
  },
  {
    name: "Innovation Challenge Scholarship",
    slug: "innovation-challenge",
    shortName: "Innovation",
    description: "Rewards students who demonstrate exceptional creativity, innovative thinking, and the ability to solve complex problems.",
    objectives: "• Foster innovation and entrepreneurship\n• Reward creative problem-solvers\n• Support the development of novel solutions\n• Encourage interdisciplinary thinking\n• Turn innovative ideas into reality",
    eligibility: "• Submission of innovative project or proposal\n• Demonstration of creative problem-solving abilities\n• Pitch presentation to selection committee\n• Implementation plan for proposed solution\n• Team collaboration experience preferred",
    benefits: "• Seed funding for innovative projects\n• Access to startup incubators and accelerators\n• Mentorship from industry innovators\n• Workspace and resources for development\n• Networking with investors and entrepreneurs",
    icon: "Lightbulb",
    color: "#F97316",
    badge: "Innovation",
    orderIndex: 6,
    seoTitle: "Innovation Challenge Scholarship | Fostering Creative Solutions",
    seoDescription: "Innovation Challenge Scholarships rewarding creative thinkers and problem-solvers. Seed funding and mentorship for groundbreaking projects.",
    seoKeywords: "innovation scholarship, entrepreneurship, creative thinking, startup scholarship",
    tags: "innovation, entrepreneurship, creativity, startup",
  },
  {
    name: "Leadership Scholarship",
    slug: "leadership",
    shortName: "Leadership",
    description: "Recognizes students who demonstrate exceptional leadership abilities, organizational skills, and commitment to community service.",
    objectives: "• Develop future leaders and changemakers\n• Recognize demonstrated leadership potential\n• Support student organizations and initiatives\n• Encourage civic engagement and community service\n• Build leadership capacity in emerging leaders",
    eligibility: "• Leadership experience in student organizations\n• Demonstrated commitment to community service\n• Recommendation from supervisor or mentor\n• Evidence of initiative and organizational skills\n• Statement of leadership philosophy and goals",
    benefits: "• Leadership development training\n• Conference and workshop attendance\n• Mentorship from established leaders\n• Networking with professionals in leadership roles\n• Funding for leadership initiatives and projects",
    icon: "Crown",
    color: "#EAB308",
    badge: "Leadership",
    orderIndex: 7,
    seoTitle: "Leadership Scholarship | Developing Future Leaders",
    seoDescription: "Leadership Scholarships recognizing students who demonstrate exceptional leadership abilities and commitment to community service. Develop your leadership potential.",
    seoKeywords: "leadership scholarship, student leader, community service, leadership development",
    tags: "leadership, community service, organization, management",
  },
  {
    name: "Community Impact Scholarship",
    slug: "community-impact",
    shortName: "Community Impact",
    description: "Supports students who have made significant contributions to their communities through service, activism, and social initiatives.",
    objectives: "• Recognize and reward community service\n• Encourage active citizenship\n• Support grassroots initiatives and activism\n• Promote social justice and equity\n• Develop socially responsible leaders",
    eligibility: "• Significant volunteer or community service experience\n• Demonstrated impact on community\n• Leadership in community initiatives\n• Commitment to social causes\n• Documentation of service hours and achievements",
    benefits: "• Financial support for continued education\n• Funding for community service projects\n• Leadership training and workshops\n• Networking with social impact organizations\n• Recognition and visibility for community work",
    icon: "Users",
    color: "#14B8A6",
    badge: "Community",
    orderIndex: 8,
    seoTitle: "Community Impact Scholarship | Recognizing Service Leaders",
    seoDescription: "Community Impact Scholarships for students making a difference through service and activism. Support for grassroots initiatives and social causes.",
    seoKeywords: "community service scholarship, volunteer scholarship, social impact, activism",
    tags: "community, service, activism, social impact",
  },
  {
    name: "International Student Scholarship",
    slug: "international",
    shortName: "International",
    description: "Provides support for international students pursuing education in a foreign country, promoting global cultural exchange and diversity.",
    objectives: "• Support international student success\n• Promote cultural diversity and exchange\n• Ease transition for international students\n• Develop global perspectives\n• Build international academic networks",
    eligibility: "• International student status with valid visa\n• Enrollment in degree program\n• Minimum GPA requirement as specified\n• Proof of English language proficiency\n• Financial need documentation",
    benefits: "• Tuition support and fee waivers\n• Visa assistance and support services\n• Cultural adjustment resources\n• International student community access\n• Travel grants for home visits in special circumstances",
    icon: "Globe",
    color: "#06B6D4",
    badge: "International",
    orderIndex: 9,
    seoTitle: "International Student Scholarship | Global Education Support",
    seoDescription: "International Student Scholarships supporting students from abroad. Financial aid, visa support, and resources for studying internationally.",
    seoKeywords: "international student scholarship, foreign students, study abroad, visa scholarship",
    tags: "international, global, foreign, exchange",
  },
  {
    name: "Early Career Scholarship",
    slug: "early-career",
    shortName: "Early Career",
    description: "Supports students beginning their educational journey, providing foundational resources for career development and exploration.",
    objectives: "• Facilitate career exploration and discovery\n• Provide early professional development\n• Help students identify career paths\n• Build foundational professional skills\n• Support career planning and goal setting",
    eligibility: "• First or second-year undergraduate students\n• Exploratory or undeclared major\n• Demonstrated interest in career development\n• Participation in career planning activities\n• Commitment to professional growth",
    benefits: "• Career assessment and counseling\n• Professional skills workshops\n• Internship placement assistance\n• Industry networking events\n• Resume and interview preparation",
    icon: "Briefcase",
    color: "#8B5CF6",
    badge: "Early Career",
    orderIndex: 10,
    seoTitle: "Early Career Scholarship | Start Your Professional Journey",
    seoDescription: "Early Career Scholarships for students beginning their educational path. Career planning, professional development, and internship support.",
    seoKeywords: "early career, freshman scholarship, sophomore scholarship, career development",
    tags: "early career, freshman, professional development, career planning",
  },
  {
    name: "Disability Support Scholarship",
    slug: "disability-support",
    shortName: "Disability Support",
    description: "Provides comprehensive support for students with disabilities, ensuring equal access to educational opportunities.",
    objectives: "• Ensure equal access to education\n• Support students with disabilities\n• Provide accessibility resources\n• Promote inclusion and accommodation\n• Remove barriers to academic success",
    eligibility: "• Documentation of disability\n• Active registration with disability services\n• Academic enrollment in good standing\n• Need for financial or resource support\n• Self-advocacy and determination",
    benefits: "• Tuition assistance for accessibility services\n• Assistive technology and equipment\n• Note-taking and academic support services\n• Extended time and testing accommodations\n• Accessibility counseling and advocacy",
    icon: "Accessibility",
    color: "#A855F7",
    badge: "Accessibility",
    orderIndex: 11,
    seoTitle: "Disability Support Scholarship | Equal Access to Education",
    seoDescription: "Disability Support Scholarships ensuring students with disabilities have equal access to educational opportunities. Assistive technology and comprehensive support.",
    seoKeywords: "disability scholarship, accessibility, ADA, special needs education",
    tags: "disability, accessibility, accommodation, inclusion",
  },
  {
    name: "Industry Sponsored Scholarship",
    slug: "industry-sponsored",
    shortName: "Industry Sponsored",
    description: "Scholarships funded by corporate partners, designed to develop talent pipelines and support students in specific industries.",
    objectives: "• Create industry talent pipelines\n• Support students in target industries\n• Build partnerships with employers\n• Prepare students for specific careers\n• Facilitate industry-academia collaboration",
    eligibility: "• Enrollment in industry-relevant program\n• Alignment with sponsor's industry or values\n• Minimum academic requirements as specified by sponsor\n• Career interest in sponsoring industry\n• Professional conduct and leadership potential",
    benefits: "• Tuition sponsorship from corporate partner\n• Internship opportunity with sponsor\n• Industry mentorship from professionals\n• Networking with industry leaders\n• Potential employment pathway after graduation",
    icon: "Building",
    color: "#64748B",
    badge: "Sponsored",
    orderIndex: 12,
    seoTitle: "Industry Sponsored Scholarship | Corporate Education Partnerships",
    seoDescription: "Industry Sponsored Scholarships funded by corporate partners. Internship opportunities, mentorship, and career pathways in target industries.",
    seoKeywords: "corporate scholarship, industry scholarship, sponsored education, employer partnership",
    tags: "corporate, industry, sponsored, employer",
  },
  {
    name: "Talent Scholarship",
    slug: "talent",
    shortName: "Talent",
    description: "Recognizes and supports students with exceptional talents in arts, athletics, music, or other specialized areas.",
    objectives: "• Nurture exceptional talents and abilities\n• Support artistic and athletic development\n• Balance talent pursuit with academic achievement\n• Create well-rounded individuals\n• Provide opportunities for talent showcase",
    eligibility: "• Demonstrated exceptional talent in specific area\n• Portfolio or performance evidence\n• Enrollment in related program or independent study\n• Commitment to talent development\n• Good academic standing",
    benefits: "• Funding for talent development activities\n• Access to specialized facilities and equipment\n• Coaching or instruction support\n• Competition and performance opportunities\n• Equipment and supply allowances",
    icon: "Sparkles",
    color: "#F472B6",
    badge: "Talent",
    orderIndex: 13,
    seoTitle: "Talent Scholarship | Nurturing Exceptional Abilities",
    seoDescription: "Talent Scholarships recognizing exceptional abilities in arts, athletics, and specialized areas. Support for developing your unique talents.",
    seoKeywords: "talent scholarship, arts scholarship, athletic scholarship, music scholarship",
    tags: "talent, arts, athletics, music, creative",
  },
  {
    name: "Entrepreneurship Scholarship",
    slug: "entrepreneurship",
    shortName: "Entrepreneurship",
    description: "Supports students with entrepreneurial ambitions, providing resources and mentorship to launch successful ventures.",
    objectives: "• Foster entrepreneurial mindset and skills\n• Support startup creation and innovation\n• Provide mentorship from entrepreneurs\n• Develop business planning capabilities\n• Create pathways for venture success",
    eligibility: "• Business idea or startup plan submission\n• Demonstrated entrepreneurial initiative\n• Leadership and team-building experience\n• Commitment to venture development\n• Pitch presentation capability",
    benefits: "• Seed funding for startup ventures\n• Access to startup incubators\n• Mentorship from successful entrepreneurs\n• Co-working space and resources\n• Legal and business development support",
    icon: "Rocket",
    color: "#22C55E",
    badge: "Entrepreneurship",
    orderIndex: 14,
    seoTitle: "Entrepreneurship Scholarship | Launch Your Startup",
    seoDescription: "Entrepreneurship Scholarships for aspiring business founders. Seed funding, mentorship, and resources to launch your startup venture.",
    seoKeywords: "entrepreneurship scholarship, startup scholarship, business plan, venture funding",
    tags: "entrepreneurship, startup, business, founder",
  },
  {
    name: "AI & Computational Science Scholarship",
    slug: "ai-computational-science",
    shortName: "AI & Computational Science",
    description: "Supports students pioneering in artificial intelligence, machine learning, and computational science research and applications.",
    objectives: "• Advance AI and computational science education\n• Support cutting-edge technology research\n• Develop next-generation AI talent\n• Promote ethical AI development\n• Bridge academic and industry AI applications",
    eligibility: "• Enrollment in AI, ML, or computational science program\n• Background in programming and mathematics\n• Research or project experience in AI/ML\n• Minimum GPA of 3.3 in technical courses\n• Understanding of ethical AI considerations",
    benefits: "• GPU and computing resource access\n• Conference attendance for AI research\n• Collaboration with AI research labs\n• Industry partnerships with tech companies\n• Advanced coursework and certification support",
    icon: "Brain",
    color: "#6366F1",
    badge: "AI",
    orderIndex: 15,
    seoTitle: "AI & Computational Science Scholarship | Future Technology Leaders",
    seoDescription: "AI and Computational Science Scholarships supporting students in machine learning and advanced computing. GPU resources, research opportunities, and industry partnerships.",
    seoKeywords: "AI scholarship, machine learning scholarship, computational science, deep learning",
    tags: "AI, machine learning, computational, technology, data science",
  },
  {
    name: "Healthcare & Precision Medicine Scholarship",
    slug: "healthcare-precision-medicine",
    shortName: "Healthcare & Precision Medicine",
    description: "Supports students advancing healthcare through precision medicine, genomics, and personalized treatment research.",
    objectives: "• Advance personalized healthcare education\n• Support genomics and precision medicine research\n• Develop healthcare innovation leaders\n• Bridge laboratory and clinical applications\n• Promote patient-centered approaches",
    eligibility: "• Enrollment in healthcare or biomedical program\n• Research experience in health sciences\n• Background in molecular biology or genetics\n• Minimum GPA of 3.2 in science courses\n• Understanding of clinical applications",
    benefits: "• Laboratory research funding\n• Clinical observation opportunities\n• Conference attendance in healthcare\n• Collaboration with medical institutions\n• Specialized training in genomics technologies",
    icon: "Stethoscope",
    color: "#EF4444",
    badge: "Healthcare",
    orderIndex: 16,
    seoTitle: "Healthcare & Precision Medicine Scholarship | Personalized Treatment",
    seoDescription: "Healthcare and Precision Medicine Scholarships supporting students in genomics and personalized healthcare. Research funding and clinical opportunities.",
    seoKeywords: "healthcare scholarship, precision medicine, genomics, biomedical, personalized medicine",
    tags: "healthcare, medicine, genomics, precision, biomedical",
  },
  {
    name: "Bioinformatics Scholarship",
    slug: "bioinformatics",
    shortName: "Bioinformatics",
    description: "Supports students bridging biology and computer science to analyze complex biological data and advance life sciences research.",
    objectives: "• Develop bioinformatics expertise\n• Support computational biology research\n• Bridge biological and data sciences\n• Advance genomic data analysis\n• Promote interdisciplinary collaboration",
    eligibility: "• Enrollment in bioinformatics or related program\n• Strong programming and data analysis skills\n• Background in biology or computer science\n• Research experience with biological data\n• Minimum GPA of 3.2",
    benefits: "• Access to biological databases and tools\n• High-performance computing resources\n• Conference attendance in bioinformatics\n• Collaboration with research institutions\n• Software and tool training",
    icon: "Dna",
    color: "#0EA5E9",
    badge: "Bioinformatics",
    orderIndex: 17,
    seoTitle: "Bioinformatics Scholarship | Biology Meets Computer Science",
    seoDescription: "Bioinformatics Scholarships for students combining biology and computer science. Access to biological databases and computational resources.",
    seoKeywords: "bioinformatics scholarship, computational biology, genomic analysis, biological data",
    tags: "bioinformatics, computational biology, genomics, data science",
  },
  {
    name: "Computational Chemistry Scholarship",
    slug: "computational-chemistry",
    shortName: "Computational Chemistry",
    description: "Supports students using computational methods to solve chemical problems and advance chemical research.",
    objectives: "• Advance computational chemistry methods\n• Support molecular modeling research\n• Develop chemistry computation skills\n• Bridge experimental and theoretical chemistry\n• Promote innovative chemical research",
    eligibility: "• Enrollment in chemistry or materials science program\n• Background in physical chemistry\n• Programming experience (Python, FORTRAN)\n• Understanding of molecular modeling\n• Minimum GPA of 3.2 in chemistry courses",
    benefits: "• Access to computational chemistry software\n• High-performance computing time\n• Conference attendance in computational chemistry\n• Collaboration with chemistry labs\n• Molecular modeling training",
    icon: "Atom",
    color: "#14B8A6",
    badge: "Computational Chemistry",
    orderIndex: 18,
    seoTitle: "Computational Chemistry Scholarship | Molecular Innovation",
    seoDescription: "Computational Chemistry Scholarships for students using computational methods in chemical research. Access to molecular modeling software and HPC resources.",
    seoKeywords: "computational chemistry scholarship, molecular modeling, theoretical chemistry, simulation",
    tags: "chemistry, computation, molecular, simulation, materials",
  },
  {
    name: "Drug Discovery Scholarship",
    slug: "drug-discovery",
    shortName: "Drug Discovery",
    description: "Supports students working on pharmaceutical development, drug design, and therapeutic innovation for new treatments.",
    objectives: "• Advance pharmaceutical research education\n• Support drug design and development\n• Develop next-generation researchers\n• Bridge academia and pharmaceutical industry\n• Promote therapeutic innovation",
    eligibility: "• Enrollment in pharmaceutical sciences or chemistry\n• Background in organic chemistry or pharmacology\n• Research experience in drug-related area\n• Understanding of drug development pipeline\n• Minimum GPA of 3.2",
    benefits: "• Laboratory research funding\n• Access to drug design software\n• Industry internship opportunities\n• Conference attendance in pharmaceutical sciences\n• Mentorship from pharmaceutical researchers",
    icon: "Pill",
    color: "#F43F5E",
    badge: "Drug Discovery",
    orderIndex: 19,
    seoTitle: "Drug Discovery Scholarship | Pharmaceutical Innovation",
    seoDescription: "Drug Discovery Scholarships supporting students in pharmaceutical development. Research funding, drug design software, and industry connections.",
    seoKeywords: "drug discovery scholarship, pharmaceutical scholarship, drug development, pharmacology",
    tags: "pharmaceutical, drug discovery, pharmacology, therapeutics",
  },
  {
    name: "Smart Agriculture Scholarship",
    slug: "smart-agriculture",
    shortName: "Smart Agriculture",
    description: "Supports students developing technological solutions for sustainable agriculture, food security, and environmental stewardship.",
    objectives: "• Advance agricultural technology education\n• Support sustainable farming innovation\n• Develop food security solutions\n• Promote environmental stewardship\n• Bridge agriculture and technology",
    eligibility: "• Enrollment in agriculture or environmental science\n• Interest in agricultural technology\n• Understanding of sustainable practices\n• Research or project experience in agriculture\n• Minimum GPA of 3.0",
    benefits: "• Field research funding\n• Access to agricultural technology resources\n• Collaboration with farms and research stations\n• Conference attendance in precision agriculture\n• Technology and sensor equipment",
    icon: "Sprout",
    color: "#84CC16",
    badge: "Agriculture",
    orderIndex: 20,
    seoTitle: "Smart Agriculture Scholarship | Technology Meets Farming",
    seoDescription: "Smart Agriculture Scholarships for students developing technological solutions for sustainable farming. Field research funding and agricultural technology resources.",
    seoKeywords: "agriculture scholarship, smart farming, precision agriculture, sustainable food",
    tags: "agriculture, farming, sustainability, food security, technology",
  },
  {
    name: "Scientific Computing Scholarship",
    slug: "scientific-computing",
    shortName: "Scientific Computing",
    description: "Supports students developing computational methods and tools to solve complex scientific and engineering problems.",
    objectives: "• Advance scientific computing education\n• Support computational methodology development\n• Develop high-performance computing skills\n• Bridge science and computer science\n• Enable breakthrough discoveries",
    eligibility: "• Enrollment in scientific computing or applied mathematics\n• Strong programming and mathematical skills\n• Experience with numerical methods\n• Background in scientific applications\n• Minimum GPA of 3.3",
    benefits: "• High-performance computing access\n• Scientific software and tools\n• Conference attendance in computational science\n• Collaboration with research institutions\n• Advanced training in parallel computing",
    icon: "Cpu",
    color: "#64748B",
    badge: "Scientific Computing",
    orderIndex: 21,
    seoTitle: "Scientific Computing Scholarship | Solving Complex Problems",
    seoDescription: "Scientific Computing Scholarships for students developing computational methods. HPC access, scientific software, and research collaboration opportunities.",
    seoKeywords: "scientific computing scholarship, HPC, numerical methods, simulation, parallel computing",
    tags: "computing, simulation, numerical methods, high-performance, engineering",
  },
  {
    name: "Simulation Science Scholarship",
    slug: "simulation-science",
    shortName: "Simulation Science",
    description: "Supports students creating and applying simulations to model complex systems and phenomena across disciplines.",
    objectives: "• Advance simulation methodology education\n• Support virtual modeling and prototyping\n• Develop simulation expertise\n• Bridge physical and virtual experiments\n• Enable risk-free experimentation",
    eligibility: "• Enrollment in simulation or modeling program\n• Background in relevant scientific field\n• Programming and mathematical modeling skills\n• Understanding of simulation principles\n• Minimum GPA of 3.2",
    benefits: "• Simulation software and licenses\n• Access to simulation laboratories\n• Collaboration with industry partners\n• Conference attendance in simulation science\n• Equipment for virtual prototyping",
    icon: "Box",
    color: "#8B5CF6",
    badge: "Simulation",
    orderIndex: 22,
    seoTitle: "Simulation Science Scholarship | Virtual Prototyping & Modeling",
    seoDescription: "Simulation Science Scholarships for students creating models and simulations. Access to simulation software, laboratories, and industry collaboration.",
    seoKeywords: "simulation scholarship, virtual prototyping, modeling, 3D simulation, digital twin",
    tags: "simulation, modeling, virtual, prototyping, digital twin",
  },
  {
    name: "Environmental Sustainability Scholarship",
    slug: "environmental-sustainability",
    shortName: "Environmental Sustainability",
    description: "Supports students dedicated to environmental protection, sustainability practices, and combating climate change.",
    objectives: "• Advance environmental education\n• Support sustainability initiatives\n• Develop environmental leaders\n• Promote climate action\n• Foster sustainable practices",
    eligibility: "• Enrollment in environmental science or sustainability\n• Demonstrated commitment to environment\n• Leadership in environmental projects\n• Understanding of sustainability principles\n• Minimum GPA of 3.0",
    benefits: "• Field research funding\n• Conference attendance in environmental science\n• Sustainability project support\n• Networking with environmental organizations\n• Equipment for environmental monitoring",
    icon: "Leaf",
    color: "#22C55E",
    badge: "Environment",
    orderIndex: 23,
    seoTitle: "Environmental Sustainability Scholarship | Climate Action Leaders",
    seoDescription: "Environmental Sustainability Scholarships for students dedicated to protecting our planet. Research funding, sustainability projects, and climate action opportunities.",
    seoKeywords: "environmental scholarship, sustainability, climate change, green scholarship, eco-friendly",
    tags: "environment, sustainability, climate, green, conservation",
  },
  {
    name: "Professional Development Scholarship",
    slug: "professional-development",
    shortName: "Professional Development",
    description: "Supports students in their professional growth through certifications, workshops, and career development opportunities.",
    objectives: "• Enhance professional skills and competencies\n• Support career-oriented education\n• Develop industry-ready graduates\n• Bridge academic and professional worlds\n• Build professional networks",
    eligibility: "• Enrollment in professional development program\n• Clear career goals and objectives\n• Commitment to professional growth\n• Participation in career activities\n• Good academic standing",
    benefits: "• Professional certification support\n• Workshop and training funding\n• Industry conference attendance\n• Professional networking events\n• Career coaching and mentorship",
    icon: "Target",
    color: "#3B82F6",
    badge: "Professional",
    orderIndex: 24,
    seoTitle: "Professional Development Scholarship | Career Excellence",
    seoDescription: "Professional Development Scholarships supporting career growth through certifications, workshops, and networking. Become industry-ready with professional support.",
    seoKeywords: "professional development scholarship, career development, certification, professional skills",
    tags: "professional, career, development, certification, skills",
  },
  {
    name: "Custom Scholarship",
    slug: "custom",
    shortName: "Custom",
    description: "A flexible scholarship type that allows administrators to create custom scholarship programs with specific requirements and benefits.",
    icon: "Sparkles",
    color: "#6366F1",
    badge: "Custom",
    orderIndex: 999, // Always last
    isCustom: true,
    seoTitle: "Custom Scholarship | Flexible Educational Awards",
    seoDescription: "Custom Scholarships designed for unique educational needs and specific eligibility requirements. Flexible awards for diverse student populations.",
    seoKeywords: "custom scholarship, flexible award, special scholarship, unique criteria",
    tags: "custom, flexible, special, unique",
  },
]

async function seedScholarshipTypes() {
  console.log("🌱 Seeding comprehensive scholarship types...\n")

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

    const typeData = {
      name: type.name,
      slug: type.slug,
      shortName: type.shortName || null,
      description: (type as any).description || null,
      objectives: (type as any).objectives || null,
      eligibility: (type as any).eligibility || null,
      benefits: (type as any).benefits || null,
      icon: (type as any).icon,
      color: (type as any).color,
      badge: (type as any).badge || null,
      banner: (type as any).banner || null,
      seoTitle: (type as any).seoTitle || null,
      seoDescription: (type as any).seoDescription || null,
      seoKeywords: (type as any).seoKeywords || null,
      tags: (type as any).tags || null,
      isActive: true,
      isCustom: (type as any).isCustom || false,
      orderIndex: (type as any).orderIndex,
    }

    if (existing) {
      // Update if any field changed
      const needsUpdate =
        existing.description !== typeData.description ||
        existing.objectives !== typeData.objectives ||
        existing.eligibility !== typeData.eligibility ||
        existing.benefits !== typeData.benefits ||
        existing.icon !== typeData.icon ||
        existing.color !== typeData.color ||
        existing.seoTitle !== typeData.seoTitle ||
        existing.seoDescription !== typeData.seoDescription ||
        existing.seoKeywords !== typeData.seoKeywords ||
        existing.orderIndex !== typeData.orderIndex ||
        existing.isCustom !== typeData.isCustom

      if (needsUpdate) {
        await prisma.scholarshipType.update({
          where: { id: existing.id },
          data: typeData,
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
        data: typeData,
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
  console.log("─".repeat(100))
  console.log("ID".padEnd(40) + "Name".padEnd(35) + "Scholarships" + "  Custom")
  console.log("─".repeat(100))
  for (const t of allTypes) {
    console.log(
      t.id.substring(0, 37).padEnd(40) +
      t.name.substring(0, 32).padEnd(35) +
      t._count.scholarships.toString().padEnd(12) +
      (t.isCustom ? "Yes" : "No")
    )
  }
  console.log("─".repeat(100))
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
