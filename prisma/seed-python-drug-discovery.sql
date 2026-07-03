-- ============================================
-- INNOVASCI OPEN ACADEMY
-- Python for Drug Discovery Course Seed
-- ============================================
-- This SQL script creates the complete Python for Drug Discovery course
-- with 13 modules and 42 lessons

-- ============================================
-- STEP 1: Create Categories
-- ============================================

INSERT INTO categories (id, name, slug, description, icon, color, "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Drug Discovery', 'drug-discovery', 'Learn computational methods and Python programming for modern drug discovery, from molecular representations to virtual screening.', '🧬', '#8b5cf6', 9, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (id, name, slug, description, icon, color, "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Computational Biology', 'computational-biology', 'Explore computational approaches to understanding biological systems, including bioinformatics and systems biology.', '🧫', '#10b981', 10, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (id, name, slug, description, icon, color, "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Python Programming', 'python-programming', 'Master Python programming from basics to advanced concepts for scientific computing and data analysis.', '🐍', '#3b82f6', 11, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- STEP 2: Create the Course
-- ============================================

DO $$
DECLARE
    drug_discovery_cat_id UUID;
    course_id UUID;
BEGIN
    -- Get Drug Discovery category ID
    SELECT id INTO drug_discovery_cat_id FROM categories WHERE slug = 'drug-discovery';
    
    -- Delete existing course if exists (for clean re-seeding)
    DELETE FROM courses WHERE slug = 'python-for-drug-discovery';
    
    -- Insert the course
    INSERT INTO courses (
        id, title, slug, "categoryId", subcategory, "shortDescription", "fullDescription",
        "learningOutcomes", prerequisites, "targetAudience", "difficultyLevel", language,
        "durationHours", "thumbnailUrl", "introVideoUrl", price, "isFree", "isActive", status,
        "createdAt", "updatedAt"
    ) VALUES (
        gen_random_uuid(),
        'Python for Drug Discovery',
        'python-for-drug-discovery',
        drug_discovery_cat_id,
        'Computational Drug Discovery',
        'Master Python programming for computational drug discovery, from molecular representations to machine learning applications.',
        E'This comprehensive course teaches you how to use Python for modern drug discovery and computational biology. Whether you''re a researcher, chemist, biologist, or data scientist, you''ll learn to leverage Python''s powerful libraries to analyze molecular data, build predictive models, and contribute to the drug discovery pipeline.\n\nStarting from the fundamentals of Python programming, you''ll progress through essential topics like NumPy, Pandas, and data visualization before diving into cheminformatics with RDKit. You''ll learn to work with molecular representations like SMILES and InChI, calculate molecular descriptors, and generate molecular fingerprints.\n\nThe course covers both traditional machine learning approaches (QSAR modeling) and deep learning techniques for drug discovery. You''ll explore protein-ligand interactions, virtual screening methods, and learn to access major chemical databases like PubChem, ChEMBL, and DrugBank.\n\nBy the end of this course, you''ll have built a complete end-to-end drug discovery pipeline and be ready to apply these skills in research, pharmaceutical industry, or further studies.',
        E'By the end of this course, you will be able to:\n\n• Write Python code for scientific computing and data analysis\n• Use Jupyter Notebooks for reproducible research\n• Manipulate molecular structures using RDKit\n• Calculate and interpret molecular descriptors\n• Generate and analyze molecular fingerprints\n• Build QSAR models for activity prediction\n• Apply machine learning to drug discovery problems\n• Perform virtual screening using computational methods\n• Access and query major chemical databases\n• Create interactive web applications for drug discovery\n• Build end-to-end drug discovery pipelines\n• Present findings with professional visualizations',
        E'• Basic understanding of programming concepts (variables, loops, functions)\n• High school level mathematics\n• Basic chemistry or biology knowledge is helpful but not required\n• A computer with internet access and ability to install software',
        E'• Researchers in chemistry, biology, and pharmacology\n• Graduate students in life sciences\n• Pharmaceutical industry professionals\n• Data scientists interested in computational biology\n• Anyone curious about drug discovery and cheminformatics',
        'Intermediate',
        'English',
        40,
        'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
        'https://www.youtube.com/embed/jBlTQjcKuaY',
        0,
        true,
        true,
        'published',
        NOW(),
        NOW()
    ) RETURNING id INTO course_id;
    
    RAISE NOTICE 'Course created with ID: %', course_id;
END $$;

-- ============================================
-- STEP 3: Create Modules and Lessons
-- ============================================

DO $$
DECLARE
    course_uuid UUID;
    module_uuid UUID;
    lesson_uuid UUID;
    
    -- YouTube video embed URLs
    drug_discovery_intro TEXT := 'https://www.youtube.com/embed/jBlTQjcKuaY';
    python_basics TEXT := 'https://www.youtube.com/embed/kqtD5dpn9C8';
    python_intermediate TEXT := 'https://www.youtube.com/embed/rfscVS0vtbw';
    jupyter_intro TEXT := 'https://www.youtube.com/embed/HW29067qVWk';
    jupyter_beginners TEXT := 'https://www.youtube.com/embed/2WL-XTl2QYI';
    numpy_basics TEXT := 'https://www.youtube.com/embed/cx7aHfKng9Y';
    numpy_full TEXT := 'https://www.youtube.com/embed/Z1fp8zKta5A';
    pandas_30min TEXT := 'https://www.youtube.com/embed/EXIgjIBu4EU';
    pandas_full TEXT := 'https://www.youtube.com/embed/r-uOLxNrNk8';
    pandas_data_umbrella TEXT := 'https://www.youtube.com/embed/hc8-AhYBu08';
    matplotlib_intro TEXT := 'https://www.youtube.com/embed/3Xc5A4W5rPE';
    matplotlib_seaborn TEXT := 'https://www.youtube.com/embed/FN78JowwpSY';
    seaborn_full TEXT := 'https://www.youtube.com/embed/6GUZXDef2U0';
    smiles_inchi TEXT := 'https://www.youtube.com/embed/TnBc2vOCYSA';
    rdkit_part1 TEXT := 'https://www.youtube.com/embed/NozaWUkJ3YM';
    ml_drug_discovery TEXT := 'https://www.youtube.com/embed/yf3N0nnAFDk';
    ml_basics TEXT := 'https://www.youtube.com/embed/Gw6-PcNkAGE';
    deep_learning_intro TEXT := 'https://www.youtube.com/embed/aircAruvnKk';
    qsar_intro TEXT := 'https://www.youtube.com/embed/xDMzOUUnNzw';
    virtual_screening TEXT := 'https://www.youtube.com/embed/MWx3lKLMN10';
    pubchem_api TEXT := 'https://www.youtube.com/embed/jBlTQjcKuaY';
    streamlit_drug_app TEXT := 'https://www.youtube.com/embed/0rqIwSeUImo';
    
    -- Module counter for order index
    module_order INT := 0;
    lesson_order INT;
BEGIN
    -- Get course ID
    SELECT id INTO course_uuid FROM courses WHERE slug = 'python-for-drug-discovery';
    
    IF course_uuid IS NULL THEN
        RAISE NOTICE 'Course not found!';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Creating modules and lessons for course: %', course_uuid;
    
    -- MODULE 1: Introduction to Drug Discovery
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'Introduction to Drug Discovery', 'Learn the fundamentals of the drug discovery process, from target identification to clinical trials.', 0, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    lesson_order := 0;
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Overview of Drug Discovery Pipeline', 'Understand the complete drug discovery process from target identification to FDA approval. Learn about the various stages including hit identification, lead optimization, and preclinical testing.', lesson_order, 'video', 900, drug_discovery_intro, true, true, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Introduction to Computational Drug Discovery', 'Discover how computational methods are revolutionizing drug discovery. Learn about the role of AI, machine learning, and data science in accelerating the drug development process.', 1, 'video', 720, qsar_intro, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'The Role of Python in Pharmaceutical Research', 'Explore why Python has become the go-to language for computational drug discovery. Learn about key libraries and tools used in the field.', 2, 'video', 600, python_basics, false, false, true, NOW(), NOW());
    
    -- MODULE 2: Python Fundamentals for Drug Discovery
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'Python Fundamentals for Drug Discovery', 'Master Python programming basics essential for scientific computing and drug discovery applications.', 1, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Python Basics', 'Learn Python fundamentals including variables, data types, operators, and control flow. Perfect starting point for beginners.', 0, 'video', 2700, python_basics, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Python Functions and Modules', 'Deep dive into Python functions, parameters, return values, and how to organize code with modules and packages.', 1, 'video', 3600, python_intermediate, false, false, true, NOW(), NOW());
    
    -- MODULE 3: Jupyter Notebook for Scientific Computing
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'Jupyter Notebook for Scientific Computing', 'Set up and master Jupyter Notebooks for reproducible research and data analysis.', 2, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Getting Started with Jupyter Notebook', 'Complete guide to installing Jupyter, understanding the interface, and creating your first notebook. Learn about cells, markdown, and execution.', 0, 'video', 1200, jupyter_intro, true, true, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Jupyter for Data Science', 'Advanced Jupyter features including magic commands, widgets, and best practices for data science workflows.', 1, 'video', 900, jupyter_beginners, false, false, true, NOW(), NOW());
    
    -- MODULE 4: NumPy for Numerical Computing
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'NumPy for Numerical Computing', 'Master NumPy for efficient numerical computations essential in drug discovery calculations.', 3, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'NumPy Fundamentals', 'Learn about NumPy arrays, broadcasting, array operations, and mathematical functions. Foundation for all scientific computing in Python.', 0, 'video', 1800, numpy_basics, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'NumPy for Chemistry Calculations', 'Apply NumPy to chemical calculations including molecular weight, stoichiometry, and property calculations.', 1, 'video', 3600, numpy_full, false, false, true, NOW(), NOW());
    
    -- MODULE 5: Data Analysis with Pandas
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'Data Analysis with Pandas', 'Learn Pandas for manipulating and analyzing chemical and biological datasets.', 4, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Pandas DataFrames', 'Master Pandas DataFrames for data manipulation, filtering, grouping, and aggregation. Essential for working with molecular datasets.', 0, 'video', 1800, pandas_30min, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Data Cleaning and Preparation', 'Learn techniques for cleaning, transforming, and preparing chemical datasets for machine learning and analysis.', 1, 'video', 3600, pandas_full, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Analyzing Molecular Data', 'Apply Pandas to real-world molecular datasets including activity data, ADMET properties, and compound libraries.', 2, 'video', 5400, pandas_data_umbrella, false, false, true, NOW(), NOW());
    
    -- MODULE 6: Data Visualization with Matplotlib and Seaborn
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'Data Visualization with Matplotlib and Seaborn', 'Create professional visualizations for drug discovery data and research findings.', 5, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Matplotlib Fundamentals', 'Learn to create various plots including line charts, scatter plots, bar charts, and histograms for scientific visualization.', 0, 'video', 1800, matplotlib_intro, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Advanced Visualization with Seaborn', 'Create statistical visualizations with Seaborn including box plots, violin plots, heatmaps, and pair plots.', 1, 'video', 2700, matplotlib_seaborn, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Visualization for QSAR Analysis', 'Apply visualization techniques to QSAR modeling including correlation plots, residual analysis, and model comparison.', 2, 'video', 2400, seaborn_full, false, false, true, NOW(), NOW());
    
    -- MODULE 7: Molecular Representations: SMILES and InChI
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'Molecular Representations: SMILES and InChI', 'Understand and work with molecular representations essential for computational drug discovery.', 6, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Introduction to SMILES Notation', 'Learn the SMILES (Simplified Molecular Input Line Entry System) notation for representing molecular structures as strings.', 0, 'video', 1800, smiles_inchi, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'InChI and Molecular Identifiers', 'Understand InChI (International Chemical Identifier) and other molecular identifiers used in chemical databases.', 1, 'video', 1500, smiles_inchi, false, false, true, NOW(), NOW());
    
    -- MODULE 8: RDKit Fundamentals for Cheminformatics
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'RDKit Fundamentals for Cheminformatics', 'Master RDKit, the essential Python library for cheminformatics and molecular analysis.', 7, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Getting Started with RDKit', 'Introduction to RDKit library, installing, creating molecules from SMILES, and basic molecular operations.', 0, 'video', 2400, rdkit_part1, true, true, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Calculating Molecular Descriptors', 'Learn to calculate essential molecular descriptors including molecular weight, LogP, TPSA, and pharmacokinetic properties.', 1, 'video', 2700, rdkit_part1, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Molecular Fingerprints', 'Generate and interpret molecular fingerprints including Morgan fingerprints, MACCS keys, and topological fingerprints.', 2, 'video', 2400, rdkit_part1, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Molecular Similarity and Clustering', 'Use molecular fingerprints to calculate similarity, perform clustering, and select diverse compound sets.', 3, 'video', 2100, rdkit_part1, false, false, true, NOW(), NOW());
    
    -- MODULE 9: Machine Learning for Drug Discovery
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'Machine Learning for Drug Discovery', 'Apply machine learning techniques to predict molecular properties and drug-target interactions.', 8, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Introduction to QSAR Modeling', 'Learn Quantitative Structure-Activity Relationship (QSAR) modeling fundamentals and applications in drug discovery.', 0, 'video', 1800, qsar_intro, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Building ML Models with scikit-learn', 'Implement machine learning models for drug discovery including random forests, SVMs, and gradient boosting.', 1, 'video', 2700, ml_drug_discovery, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Virtual Screening with ML', 'Apply machine learning models for virtual screening to identify potential drug candidates from large compound libraries.', 2, 'video', 2400, virtual_screening, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Model Validation and Optimization', 'Learn cross-validation, hyperparameter tuning, and model evaluation metrics for drug discovery models.', 3, 'video', 2100, ml_basics, false, false, true, NOW(), NOW());
    
    -- MODULE 10: Deep Learning Applications in Drug Discovery
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'Deep Learning Applications in Drug Discovery', 'Explore deep learning approaches for molecular property prediction and drug design.', 9, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Deep Learning Fundamentals for Chemistry', 'Introduction to deep learning concepts and neural network architectures relevant to drug discovery.', 0, 'video', 1800, deep_learning_intro, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Graph Neural Networks for Molecules', 'Learn about graph neural networks that operate directly on molecular graphs for property prediction.', 1, 'video', 2400, ml_drug_discovery, false, false, true, NOW(), NOW());
    
    -- MODULE 11: Protein-Ligand Interaction Analysis
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'Protein-Ligand Interaction Analysis', 'Understand molecular docking and protein-ligand interaction analysis techniques.', 10, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Introduction to Molecular Docking', 'Learn the principles of molecular docking and how Python tools are used for protein-ligand interaction analysis.', 0, 'video', 2100, smiles_inchi, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Analyzing Binding Affinities', 'Interpret and analyze molecular docking results including binding scores and interaction patterns.', 1, 'video', 1800, virtual_screening, false, false, true, NOW(), NOW());
    
    -- MODULE 12: Public Chemical Databases
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'Public Chemical Databases', 'Learn to access and query major chemical databases for drug discovery research.', 11, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Working with PubChem', 'Access and query PubChem database programmatically to retrieve compound information and biological data.', 0, 'video', 1800, pubchem_api, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'ChEMBL and DrugBank Integration', 'Learn to access ChEMBL and DrugBank databases for bioactivity data and drug information.', 1, 'video', 2100, pandas_data_umbrella, false, false, true, NOW(), NOW());
    
    -- MODULE 13: Capstone Project: End-to-End Drug Discovery Pipeline
    INSERT INTO modules (id, "courseId", title, description, "orderIndex", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, 'Capstone Project: End-to-End Drug Discovery Pipeline', 'Build a complete drug discovery pipeline integrating all the skills learned throughout the course.', 12, NOW(), NOW())
    RETURNING id INTO module_uuid;
    
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Project Overview and Planning', 'Introduction to the capstone project: building a complete drug discovery pipeline from data collection to model deployment.', 0, 'video', 1200, ml_drug_discovery, true, true, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Building the Data Pipeline', 'Create a complete data pipeline for collecting, cleaning, and preparing molecular data for machine learning.', 1, 'video', 2700, pandas_full, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Feature Engineering for Molecules', 'Generate molecular descriptors and fingerprints as features for machine learning models.', 2, 'video', 2400, rdkit_part1, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Training and Evaluating Models', 'Build, train, and evaluate machine learning models for molecular property prediction.', 3, 'video', 2700, ml_drug_discovery, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Building a Streamlit Application', 'Create an interactive web application using Streamlit to deploy your drug discovery pipeline.', 4, 'video', 2100, streamlit_drug_app, false, false, true, NOW(), NOW());
    INSERT INTO lessons (id, "courseId", "moduleId", title, description, "orderIndex", "lessonType", duration, "videoUrl", "isPreview", "isFree", "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), course_uuid, module_uuid, 'Course Wrap-up and Next Steps', 'Review key concepts, discuss career paths in computational drug discovery, and explore further learning resources.', 5, 'video', 1200, drug_discovery_intro, false, false, true, NOW(), NOW());
    
    RAISE NOTICE 'Modules and lessons created successfully!';
END $$;

-- ============================================
-- STEP 4: Create Video Records for Each Lesson
-- ============================================

DO $$
DECLARE
    lesson_rec RECORD;
BEGIN
    FOR lesson_rec IN 
        SELECT l.id, l.title, l.duration, l."videoUrl"
        FROM lessons l
        JOIN courses c ON l."courseId" = c.id
        WHERE c.slug = 'python-for-drug-discovery'
    LOOP
        -- Insert video record if not exists
        INSERT INTO videos (id, "lessonId", title, "videoUrl", duration, provider, "storageType", "orderIndex", "createdAt")
        SELECT gen_random_uuid(), lesson_rec.id, lesson_rec.title, lesson_rec."videoUrl", lesson_rec.duration, 'youtube', 'external', 0, NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM videos WHERE "lessonId" = lesson_rec.id
        );
    END LOOP;
    
    RAISE NOTICE 'Video records created successfully!';
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 
    'Course: ' || title AS info,
    'Status: ' || status AS info,
    'Modules: ' || (SELECT COUNT(*) FROM modules WHERE "courseId" = courses.id)::TEXT AS info,
    'Lessons: ' || (SELECT COUNT(*) FROM lessons WHERE "courseId" = courses.id)::TEXT AS info
FROM courses 
WHERE slug = 'python-for-drug-discovery';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT '✅ Python for Drug Discovery course seeded successfully!' AS status;
SELECT 'Course URL: /courses/python-for-drug-discovery' AS info;
