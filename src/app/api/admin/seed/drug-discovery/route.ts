import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// YouTube video IDs from reputable sources
const YOUTUBE_VIDEOS = {
  drugDiscoveryIntro: "jBlTQjcKuaY",
  pythonBasics: "kqtD5dpn9C8",
  pythonIntermediate: "rfscVS0vtbw",
  jupyterIntro: "HW29067qVWk",
  jupyterBeginners: "2WL-XTl2QYI",
  numpyBasics: "cx7aHfKng9Y",
  numpyFull: "Z1fp8zKta5A",
  pandas30min: "EXIgjIBu4EU",
  pandasFull: "r-uOLxNrNk8",
  pandasDataUmbrella: "hc8-AhYBu08",
  matplotlibIntro: "3Xc5A4W5rPE",
  matplotlibSeaborn: "FN78JowwpSY",
  seabornFull: "6GUZXDef2U0",
  smilesInchi: "TnBc2vOCYSA",
  rdkitPart1: "NozaWUkJ3YM",
  mlDrugDiscovery: "yf3N0nnAFDk",
  mlBasics: "Gw6-PcNkAGE",
  deepLearningIntro: "aircAruvnKk",
  qsarIntro: "xDMzOUUnNzw",
  virtualScreening: "MWx3lKLMN10",
  pubchemAPI: "jBlTQjcKuaY",
  streamlitDrugApp: "0rqIwSeUImo",
}

function getEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

const modulesData = [
  {
    title: "Introduction to Drug Discovery",
    description: "Learn the fundamentals of the drug discovery process, from target identification to clinical trials.",
    orderIndex: 0,
    lessons: [
      { title: "Overview of Drug Discovery Pipeline", description: "Understand the complete drug discovery process from target identification to FDA approval. Learn about the various stages including hit identification, lead optimization, and preclinical testing.", videoId: YOUTUBE_VIDEOS.drugDiscoveryIntro, duration: 900, isPreview: true, isFree: true },
      { title: "Introduction to Computational Drug Discovery", description: "Discover how computational methods are revolutionizing drug discovery. Learn about the role of AI, machine learning, and data science in accelerating the drug development process.", videoId: YOUTUBE_VIDEOS.qsarIntro, duration: 720, isPreview: false, isFree: false },
      { title: "The Role of Python in Pharmaceutical Research", description: "Explore why Python has become the go-to language for computational drug discovery. Learn about key libraries and tools used in the field.", videoId: YOUTUBE_VIDEOS.pythonBasics, duration: 600, isPreview: false, isFree: false }
    ]
  },
  {
    title: "Python Fundamentals for Drug Discovery",
    description: "Master Python programming basics essential for scientific computing and drug discovery applications.",
    orderIndex: 1,
    lessons: [
      { title: "Python Basics", description: "Learn Python fundamentals including variables, data types, operators, and control flow. Perfect starting point for beginners.", videoId: YOUTUBE_VIDEOS.pythonBasics, duration: 2700, isPreview: false, isFree: false },
      { title: "Python Functions and Modules", description: "Deep dive into Python functions, parameters, return values, and how to organize code with modules and packages.", videoId: YOUTUBE_VIDEOS.pythonIntermediate, duration: 3600, isPreview: false, isFree: false }
    ]
  },
  {
    title: "Jupyter Notebook for Scientific Computing",
    description: "Set up and master Jupyter Notebooks for reproducible research and data analysis.",
    orderIndex: 2,
    lessons: [
      { title: "Getting Started with Jupyter Notebook", description: "Complete guide to installing Jupyter, understanding the interface, and creating your first notebook. Learn about cells, markdown, and execution.", videoId: YOUTUBE_VIDEOS.jupyterIntro, duration: 1200, isPreview: true, isFree: true },
      { title: "Jupyter for Data Science", description: "Advanced Jupyter features including magic commands, widgets, and best practices for data science workflows.", videoId: YOUTUBE_VIDEOS.jupyterBeginners, duration: 900, isPreview: false, isFree: false }
    ]
  },
  {
    title: "NumPy for Numerical Computing",
    description: "Master NumPy for efficient numerical computations essential in drug discovery calculations.",
    orderIndex: 3,
    lessons: [
      { title: "NumPy Fundamentals", description: "Learn about NumPy arrays, broadcasting, array operations, and mathematical functions. Foundation for all scientific computing in Python.", videoId: YOUTUBE_VIDEOS.numpyBasics, duration: 1800, isPreview: false, isFree: false },
      { title: "NumPy for Chemistry Calculations", description: "Apply NumPy to chemical calculations including molecular weight, stoichiometry, and property calculations.", videoId: YOUTUBE_VIDEOS.numpyFull, duration: 3600, isPreview: false, isFree: false }
    ]
  },
  {
    title: "Data Analysis with Pandas",
    description: "Learn Pandas for manipulating and analyzing chemical and biological datasets.",
    orderIndex: 4,
    lessons: [
      { title: "Pandas DataFrames", description: "Master Pandas DataFrames for data manipulation, filtering, grouping, and aggregation. Essential for working with molecular datasets.", videoId: YOUTUBE_VIDEOS.pandas30min, duration: 1800, isPreview: false, isFree: false },
      { title: "Data Cleaning and Preparation", description: "Learn techniques for cleaning, transforming, and preparing chemical datasets for machine learning and analysis.", videoId: YOUTUBE_VIDEOS.pandasFull, duration: 3600, isPreview: false, isFree: false },
      { title: "Analyzing Molecular Data", description: "Apply Pandas to real-world molecular datasets including activity data, ADMET properties, and compound libraries.", videoId: YOUTUBE_VIDEOS.pandasDataUmbrella, duration: 5400, isPreview: false, isFree: false }
    ]
  },
  {
    title: "Data Visualization with Matplotlib and Seaborn",
    description: "Create professional visualizations for drug discovery data and research findings.",
    orderIndex: 5,
    lessons: [
      { title: "Matplotlib Fundamentals", description: "Learn to create various plots including line charts, scatter plots, bar charts, and histograms for scientific visualization.", videoId: YOUTUBE_VIDEOS.matplotlibIntro, duration: 1800, isPreview: false, isFree: false },
      { title: "Advanced Visualization with Seaborn", description: "Create statistical visualizations with Seaborn including box plots, violin plots, heatmaps, and pair plots.", videoId: YOUTUBE_VIDEOS.matplotlibSeaborn, duration: 2700, isPreview: false, isFree: false },
      { title: "Visualization for QSAR Analysis", description: "Apply visualization techniques to QSAR modeling including correlation plots, residual analysis, and model comparison.", videoId: YOUTUBE_VIDEOS.seabornFull, duration: 2400, isPreview: false, isFree: false }
    ]
  },
  {
    title: "Molecular Representations: SMILES and InChI",
    description: "Understand and work with molecular representations essential for computational drug discovery.",
    orderIndex: 6,
    lessons: [
      { title: "Introduction to SMILES Notation", description: "Learn the SMILES (Simplified Molecular Input Line Entry System) notation for representing molecular structures as strings.", videoId: YOUTUBE_VIDEOS.smilesInchi, duration: 1800, isPreview: false, isFree: false },
      { title: "InChI and Molecular Identifiers", description: "Understand InChI (International Chemical Identifier) and other molecular identifiers used in chemical databases.", videoId: YOUTUBE_VIDEOS.smilesInchi, duration: 1500, isPreview: false, isFree: false }
    ]
  },
  {
    title: "RDKit Fundamentals for Cheminformatics",
    description: "Master RDKit, the essential Python library for cheminformatics and molecular analysis.",
    orderIndex: 7,
    lessons: [
      { title: "Getting Started with RDKit", description: "Introduction to RDKit library, installing, creating molecules from SMILES, and basic molecular operations.", videoId: YOUTUBE_VIDEOS.rdkitPart1, duration: 2400, isPreview: true, isFree: true },
      { title: "Calculating Molecular Descriptors", description: "Learn to calculate essential molecular descriptors including molecular weight, LogP, TPSA, and pharmacokinetic properties.", videoId: YOUTUBE_VIDEOS.rdkitPart1, duration: 2700, isPreview: false, isFree: false },
      { title: "Molecular Fingerprints", description: "Generate and interpret molecular fingerprints including Morgan fingerprints, MACCS keys, and topological fingerprints.", videoId: YOUTUBE_VIDEOS.rdkitPart1, duration: 2400, isPreview: false, isFree: false },
      { title: "Molecular Similarity and Clustering", description: "Use molecular fingerprints to calculate similarity, perform clustering, and select diverse compound sets.", videoId: YOUTUBE_VIDEOS.rdkitPart1, duration: 2100, isPreview: false, isFree: false }
    ]
  },
  {
    title: "Machine Learning for Drug Discovery",
    description: "Apply machine learning techniques to predict molecular properties and drug-target interactions.",
    orderIndex: 8,
    lessons: [
      { title: "Introduction to QSAR Modeling", description: "Learn Quantitative Structure-Activity Relationship (QSAR) modeling fundamentals and applications in drug discovery.", videoId: YOUTUBE_VIDEOS.qsarIntro, duration: 1800, isPreview: false, isFree: false },
      { title: "Building ML Models with scikit-learn", description: "Implement machine learning models for drug discovery including random forests, SVMs, and gradient boosting.", videoId: YOUTUBE_VIDEOS.mlDrugDiscovery, duration: 2700, isPreview: false, isFree: false },
      { title: "Virtual Screening with ML", description: "Apply machine learning models for virtual screening to identify potential drug candidates from large compound libraries.", videoId: YOUTUBE_VIDEOS.virtualScreening, duration: 2400, isPreview: false, isFree: false },
      { title: "Model Validation and Optimization", description: "Learn cross-validation, hyperparameter tuning, and model evaluation metrics for drug discovery models.", videoId: YOUTUBE_VIDEOS.mlBasics, duration: 2100, isPreview: false, isFree: false }
    ]
  },
  {
    title: "Deep Learning Applications in Drug Discovery",
    description: "Explore deep learning approaches for molecular property prediction and drug design.",
    orderIndex: 9,
    lessons: [
      { title: "Deep Learning Fundamentals for Chemistry", description: "Introduction to deep learning concepts and neural network architectures relevant to drug discovery.", videoId: YOUTUBE_VIDEOS.deepLearningIntro, duration: 1800, isPreview: false, isFree: false },
      { title: "Graph Neural Networks for Molecules", description: "Learn about graph neural networks that operate directly on molecular graphs for property prediction.", videoId: YOUTUBE_VIDEOS.mlDrugDiscovery, duration: 2400, isPreview: false, isFree: false }
    ]
  },
  {
    title: "Protein-Ligand Interaction Analysis",
    description: "Understand molecular docking and protein-ligand interaction analysis techniques.",
    orderIndex: 10,
    lessons: [
      { title: "Introduction to Molecular Docking", description: "Learn the principles of molecular docking and how Python tools are used for protein-ligand interaction analysis.", videoId: YOUTUBE_VIDEOS.smilesInchi, duration: 2100, isPreview: false, isFree: false },
      { title: "Analyzing Binding Affinities", description: "Interpret and analyze molecular docking results including binding scores and interaction patterns.", videoId: YOUTUBE_VIDEOS.virtualScreening, duration: 1800, isPreview: false, isFree: false }
    ]
  },
  {
    title: "Public Chemical Databases",
    description: "Learn to access and query major chemical databases for drug discovery research.",
    orderIndex: 11,
    lessons: [
      { title: "Working with PubChem", description: "Access and query PubChem database programmatically to retrieve compound information and biological data.", videoId: YOUTUBE_VIDEOS.pubchemAPI, duration: 1800, isPreview: false, isFree: false },
      { title: "ChEMBL and DrugBank Integration", description: "Learn to access ChEMBL and DrugBank databases for bioactivity data and drug information.", videoId: YOUTUBE_VIDEOS.pandasDataUmbrella, duration: 2100, isPreview: false, isFree: false }
    ]
  },
  {
    title: "Capstone Project: End-to-End Drug Discovery Pipeline",
    description: "Build a complete drug discovery pipeline integrating all the skills learned throughout the course.",
    orderIndex: 12,
    lessons: [
      { title: "Project Overview and Planning", description: "Introduction to the capstone project: building a complete drug discovery pipeline from data collection to model deployment.", videoId: YOUTUBE_VIDEOS.mlDrugDiscovery, duration: 1200, isPreview: true, isFree: true },
      { title: "Building the Data Pipeline", description: "Create a complete data pipeline for collecting, cleaning, and preparing molecular data for machine learning.", videoId: YOUTUBE_VIDEOS.pandasFull, duration: 2700, isPreview: false, isFree: false },
      { title: "Feature Engineering for Molecules", description: "Generate molecular descriptors and fingerprints as features for machine learning models.", videoId: YOUTUBE_VIDEOS.rdkitPart1, duration: 2400, isPreview: false, isFree: false },
      { title: "Training and Evaluating Models", description: "Build, train, and evaluate machine learning models for molecular property prediction.", videoId: YOUTUBE_VIDEOS.mlDrugDiscovery, duration: 2700, isPreview: false, isFree: false },
      { title: "Building a Streamlit Application", description: "Create an interactive web application using Streamlit to deploy your drug discovery pipeline.", videoId: YOUTUBE_VIDEOS.streamlitDrugApp, duration: 2100, isPreview: false, isFree: false },
      { title: "Course Wrap-up and Next Steps", description: "Review key concepts, discuss career paths in computational drug discovery, and explore further learning resources.", videoId: YOUTUBE_VIDEOS.drugDiscoveryIntro, duration: 1200, isPreview: false, isFree: false }
    ]
  }
]

// POST - Seed the Python for Drug Discovery course
export async function POST() {
  try {
    console.log("🚀 Seeding Python for Drug Discovery course...")

    // Find or create Drug Discovery category
    let drugDiscoveryCategory = await prisma.category.findFirst({
      where: { slug: "drug-discovery", domainId: null }
    })
    if (!drugDiscoveryCategory) {
      drugDiscoveryCategory = await prisma.category.create({
        data: {
          name: "Drug Discovery",
          slug: "drug-discovery",
          description: "Learn computational methods and Python programming for modern drug discovery, from molecular representations to virtual screening.",
          icon: "🧬",
          color: "#8b5cf6",
          orderIndex: 9,
          domainId: null
        }
      })
    }

    // Find or create Computational Biology category
    let compBioCategory = await prisma.category.findFirst({
      where: { slug: "computational-biology", domainId: null }
    })
    if (!compBioCategory) {
      await prisma.category.create({
        data: {
          name: "Computational Biology",
          slug: "computational-biology",
          description: "Explore computational approaches to understanding biological systems, including bioinformatics and systems biology.",
          icon: "🧫",
          color: "#10b981",
          orderIndex: 10,
          domainId: null
        }
      })
    }

    // Find or create Python Programming category
    let pythonCategory = await prisma.category.findFirst({
      where: { slug: "python-programming", domainId: null }
    })
    if (!pythonCategory) {
      await prisma.category.create({
        data: {
          name: "Python Programming",
          slug: "python-programming",
          description: "Master Python programming from basics to advanced concepts for scientific computing and data analysis.",
          icon: "🐍",
          color: "#3b82f6",
          orderIndex: 11,
          domainId: null
        }
      })
    }
    console.log("✓ Categories created")

    // Create Course
    const course = await prisma.course.upsert({
      where: { slug: "python-for-drug-discovery" },
      update: {},
      create: {
        title: "Python for Drug Discovery",
        slug: "python-for-drug-discovery",
        categoryId: drugDiscoveryCategory.id,
        subcategory: "Computational Drug Discovery",
        shortDescription: "Master Python programming for computational drug discovery, from molecular representations to machine learning applications.",
        fullDescription: `This comprehensive course teaches you how to use Python for modern drug discovery and computational biology. Whether you're a researcher, chemist, biologist, or data scientist, you'll learn to leverage Python's powerful libraries to analyze molecular data, build predictive models, and contribute to the drug discovery pipeline.

Starting from the fundamentals of Python programming, you'll progress through essential topics like NumPy, Pandas, and data visualization before diving into cheminformatics with RDKit. You'll learn to work with molecular representations like SMILES and InChI, calculate molecular descriptors, and generate molecular fingerprints.

The course covers both traditional machine learning approaches (QSAR modeling) and deep learning techniques for drug discovery. You'll explore protein-ligand interactions, virtual screening methods, and learn to access major chemical databases like PubChem, ChEMBL, and DrugBank.

By the end of this course, you'll have built a complete end-to-end drug discovery pipeline and be ready to apply these skills in research, pharmaceutical industry, or further studies.`,
        learningOutcomes: `By the end of this course, you will be able to:

• Write Python code for scientific computing and data analysis
• Use Jupyter Notebooks for reproducible research
• Manipulate molecular structures using RDKit
• Calculate and interpret molecular descriptors
• Generate and analyze molecular fingerprints
• Build QSAR models for activity prediction
• Apply machine learning to drug discovery problems
• Perform virtual screening using computational methods
• Access and query major chemical databases
• Create interactive web applications for drug discovery
• Build end-to-end drug discovery pipelines
• Present findings with professional visualizations`,
        prerequisites: `• Basic understanding of programming concepts (variables, loops, functions)
• High school level mathematics
• Basic chemistry or biology knowledge is helpful but not required
• A computer with internet access and ability to install software`,
        targetAudience: `• Researchers in chemistry, biology, and pharmacology
• Graduate students in life sciences
• Pharmaceutical industry professionals
• Data scientists interested in computational biology
• Anyone curious about drug discovery and cheminformatics`,
        difficultyLevel: "Intermediate",
        language: "English",
        durationHours: 40,
        thumbnailUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80",
        introVideoUrl: getEmbedUrl(YOUTUBE_VIDEOS.drugDiscoveryIntro),
        price: 0,
        isFree: true,
        isActive: true,
        status: "published",
      },
    })
    console.log("✓ Course created:", course.title)

    // Create Modules and Lessons
    let totalLessons = 0
    for (const moduleData of modulesData) {
      const module = await prisma.module.upsert({
        where: { courseId_orderIndex: { courseId: course.id, orderIndex: moduleData.orderIndex } },
        update: {},
        create: {
          courseId: course.id,
          title: moduleData.title,
          description: moduleData.description,
          orderIndex: moduleData.orderIndex
        }
      })

      for (let i = 0; i < moduleData.lessons.length; i++) {
        const lessonData = moduleData.lessons[i]
        const lesson = await prisma.lesson.create({
          data: {
            courseId: course.id,
            moduleId: module.id,
            title: lessonData.title,
            description: lessonData.description,
            orderIndex: i,
            lessonType: "video",
            duration: lessonData.duration,
            videoUrl: getEmbedUrl(lessonData.videoId),
            isPreview: lessonData.isPreview,
            isFree: lessonData.isFree,
            isActive: true
          }
        })

        await prisma.video.create({
          data: {
            lessonId: lesson.id,
            title: lessonData.title,
            videoUrl: getEmbedUrl(lessonData.videoId),
            duration: lessonData.duration,
            provider: "youtube",
            storageType: "external",
            orderIndex: 0
          }
        })
        totalLessons++
      }
    }
    console.log(`✓ Created ${totalLessons} lessons across ${modulesData.length} modules`)

    return NextResponse.json({
      success: true,
      message: "Python for Drug Discovery course seeded successfully!",
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          modules: modulesData.length,
          lessons: totalLessons,
          url: `/courses/${course.slug}`
        }
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Seed error:", errorMessage)
    return NextResponse.json(
      { success: false, error: "Failed to seed course", details: errorMessage },
      { status: 500 }
    )
  }
}

// GET - Check if course exists
export async function GET() {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: "python-for-drug-discovery" },
      include: {
        modules: {
          include: { lessons: true },
          orderBy: { orderIndex: "asc" }
        }
      }
    })

    if (!course) {
      return NextResponse.json({
        success: true,
        data: { exists: false, message: "Course not yet seeded" }
      })
    }

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
    return NextResponse.json({
      success: true,
      data: {
        exists: true,
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          status: course.status,
          modules: course.modules.length,
          lessons: totalLessons,
          url: `/courses/${course.slug}`
        }
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: "Database error", details: errorMessage },
      { status: 500 }
    )
  }
}
