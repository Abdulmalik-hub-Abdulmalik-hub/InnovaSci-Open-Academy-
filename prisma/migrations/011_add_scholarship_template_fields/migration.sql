-- Migration: Add rich template fields to ScholarshipType
-- This extends the ScholarshipType model to support auto-fill functionality

-- Check if scholarship_types table exists, if not create it with all fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scholarship_types') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE "scholarship_types" (
            "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
            "name" TEXT NOT NULL UNIQUE,
            "slug" TEXT NOT NULL UNIQUE,
            "shortName" TEXT,
            "description" TEXT,
            "objectives" TEXT,
            "eligibility" TEXT,
            "benefits" TEXT,
            "icon" TEXT,
            "color" TEXT,
            "badge" TEXT,
            "banner" TEXT,
            "seoTitle" TEXT,
            "seoDescription" TEXT,
            "seoKeywords" TEXT,
            "tags" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "isCustom" BOOLEAN NOT NULL DEFAULT false,
            "orderIndex" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Add new columns to existing table
        ALTER TABLE "scholarship_types" ADD COLUMN IF NOT EXISTS "shortName" TEXT;
        ALTER TABLE "scholarship_types" ADD COLUMN IF NOT EXISTS "objectives" TEXT;
        ALTER TABLE "scholarship_types" ADD COLUMN IF NOT EXISTS "eligibility" TEXT;
        ALTER TABLE "scholarship_types" ADD COLUMN IF NOT EXISTS "benefits" TEXT;
        ALTER TABLE "scholarship_types" ADD COLUMN IF NOT EXISTS "badge" TEXT;
        ALTER TABLE "scholarship_types" ADD COLUMN IF NOT EXISTS "banner" TEXT;
        ALTER TABLE "scholarship_types" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
        ALTER TABLE "scholarship_types" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
        ALTER TABLE "scholarship_types" ADD COLUMN IF NOT EXISTS "seoKeywords" TEXT;
        ALTER TABLE "scholarship_types" ADD COLUMN IF NOT EXISTS "tags" TEXT;
        ALTER TABLE "scholarship_types" ADD COLUMN IF NOT EXISTS "isCustom" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Update existing types with isCustom flag (they're templates, not custom)
UPDATE "scholarship_types" SET "isCustom" = false WHERE "isCustom" IS NULL;

-- Seed the 7 default scholarship templates
-- Using INSERT ... ON CONFLICT to handle re-runs safely

-- 1. Academic Excellence Scholarship
INSERT INTO "scholarship_types" (
  "name", "slug", "shortName", "description", "objectives", "eligibility", "benefits",
  "icon", "color", "badge", "banner", "seoTitle", "seoDescription", "seoKeywords",
  "tags", "isCustom", "orderIndex", "isActive"
) VALUES (
  'Academic Excellence Scholarship',
  'academic-excellence',
  'AES',
  'Recognizes and rewards students who have demonstrated exceptional academic achievement, maintaining the highest standards of excellence throughout their studies.',
  'To recognize and reward students who demonstrate outstanding academic performance, encourage continued excellence in scholarly pursuits, support students who have shown exceptional dedication to their studies, and foster a culture of academic achievement across all disciplines.',
  'Minimum cumulative GPA of 3.8 on a 4.0 scale (or equivalent). Full-time enrollment in an accredited institution. Demonstrated commitment to academic excellence through coursework. No history of academic misconduct. Letters of recommendation from faculty members.',
  'Full tuition coverage for one academic year. Monthly stipend for living expenses. Priority registration privileges. Access to exclusive academic resources and research opportunities. Networking events with distinguished alumni. Certificate of Academic Excellence.',
  'GraduationCap',
  '#8B5CF6',
  'Academic Excellence',
  'Scholarly achievement, merit-based, top performer, honors',
  'Academic Excellence Scholarship | InnovaSci Open Academy',
  'Apply for the Academic Excellence Scholarship at InnovaSci Open Academy. Merit-based scholarships for outstanding students demonstrating exceptional academic achievement and dedication to scholarly pursuits.',
  'academic scholarship, merit scholarship, excellence award, honor roll, top student, GPA scholarship, academic achievement',
  'merit,academic,excellence,honors,gpa,scholarly',
  false,
  1,
  true
) ON CONFLICT (slug) DO UPDATE SET
  "shortName" = EXCLUDED."shortName",
  "description" = EXCLUDED."description",
  "objectives" = EXCLUDED."objectives",
  "eligibility" = EXCLUDED."eligibility",
  "benefits" = EXCLUDED."benefits",
  "icon" = EXCLUDED."icon",
  "color" = EXCLUDED."color",
  "badge" = EXCLUDED."badge",
  "banner" = EXCLUDED."banner",
  "seoTitle" = EXCLUDED."seoTitle",
  "seoDescription" = EXCLUDED."seoDescription",
  "seoKeywords" = EXCLUDED."seoKeywords",
  "tags" = EXCLUDED."tags",
  "isCustom" = EXCLUDED."isCustom",
  "orderIndex" = EXCLUDED."orderIndex";

-- 2. Research & Innovation Scholarship
INSERT INTO "scholarship_types" (
  "name", "slug", "shortName", "description", "objectives", "eligibility", "benefits",
  "icon", "color", "badge", "banner", "seoTitle", "seoDescription", "seoKeywords",
  "tags", "isCustom", "orderIndex", "isActive"
) VALUES (
  'Research & Innovation Scholarship',
  'research-innovation',
  'RIS',
  'Supports students conducting groundbreaking research in STEM fields, AI, computational sciences, drug discovery, and technological innovation.',
  'To foster innovation and scientific discovery, support students engaged in cutting-edge research, encourage the development of solutions to global challenges, promote interdisciplinary collaboration in research, and accelerate the translation of research into practical applications.',
  'Active participation in recognized research programs or labs. Demonstrated research output (publications, presentations, patents). Endorsement from research supervisor. Statement of research interests and proposed project. Minimum GPA of 3.3 in major courses.',
  'Full research funding including equipment and materials. Travel grants for conferences and symposia. Access to state-of-the-art laboratories and computational resources. Mentorship from leading researchers. Publication support and scientific writing workshops. Priority access to advanced courses and seminars.',
  'FlaskConical',
  '#3B82F6',
  'Research & Innovation',
  'STEM research, innovation, scientific discovery, AI, drug discovery',
  'Research & Innovation Scholarship | InnovaSci Open Academy',
  'Discover the Research & Innovation Scholarship at InnovaSci Open Academy. Supporting students in groundbreaking STEM research, AI innovation, computational sciences, and technological advancement.',
  'research scholarship, innovation award, STEM scholarship, PhD funding, research grant, scientific research, AI scholarship',
  'research,innovation,STEM,AI,drug-discovery,computational,technology,scientific',
  false,
  2,
  true
) ON CONFLICT (slug) DO UPDATE SET
  "shortName" = EXCLUDED."shortName",
  "description" = EXCLUDED."description",
  "objectives" = EXCLUDED."objectives",
  "eligibility" = EXCLUDED."eligibility",
  "benefits" = EXCLUDED."benefits",
  "icon" = EXCLUDED."icon",
  "color" = EXCLUDED."color",
  "badge" = EXCLUDED."badge",
  "banner" = EXCLUDED."banner",
  "seoTitle" = EXCLUDED."seoTitle",
  "seoDescription" = EXCLUDED."seoDescription",
  "seoKeywords" = EXCLUDED."seoKeywords",
  "tags" = EXCLUDED."tags",
  "isCustom" = EXCLUDED."isCustom",
  "orderIndex" = EXCLUDED."orderIndex";

-- 3. Opportunity Scholarship
INSERT INTO "scholarship_types" (
  "name", "slug", "shortName", "description", "objectives", "eligibility", "benefits",
  "icon", "color", "badge", "banner", "seoTitle", "seoDescription", "seoKeywords",
  "tags", "isCustom", "orderIndex", "isActive"
) VALUES (
  'Opportunity Scholarship',
  'opportunity',
  'OPS',
  'Provides educational access and support for talented students facing financial barriers or from underserved communities, ensuring equal opportunities for academic success.',
  'To democratize access to quality education, support students from economically disadvantaged backgrounds, promote diversity and inclusion in academia, remove financial barriers to educational excellence, and empower the next generation of leaders from all backgrounds.',
  'Demonstrated financial need through official documentation. First-generation college student status (preferred). Membership in underrepresented or underserved communities. Academic potential despite circumstantial challenges. Personal statement describing obstacles overcome.',
  'Full tuition coverage for the duration of study. Annual stipend for living expenses. Book allowance and technology stipend. Housing assistance for on-campus students. Career counseling and internship placement support. Alumni mentorship program. Emergency fund access for unexpected needs.',
  'Heart',
  '#EC4899',
  'Opportunity',
  'Need-based, financial aid, access, inclusion, underserved communities',
  'Opportunity Scholarship | InnovaSci Open Academy',
  'Apply for the Opportunity Scholarship at InnovaSci Open Academy. Need-based scholarships supporting talented students from underserved communities and those facing financial barriers to education.',
  'need-based scholarship, financial aid, underserved communities, access to education, first-generation, inclusive scholarship',
  'need-based,financial-aid,access,inclusion,underserved,diversity,community',
  false,
  3,
  true
) ON CONFLICT (slug) DO UPDATE SET
  "shortName" = EXCLUDED."shortName",
  "description" = EXCLUDED."description",
  "objectives" = EXCLUDED."objectives",
  "eligibility" = EXCLUDED."eligibility",
  "benefits" = EXCLUDED."benefits",
  "icon" = EXCLUDED."icon",
  "color" = EXCLUDED."color",
  "badge" = EXCLUDED."badge",
  "banner" = EXCLUDED."banner",
  "seoTitle" = EXCLUDED."seoTitle",
  "seoDescription" = EXCLUDED."seoDescription",
  "seoKeywords" = EXCLUDED."seoKeywords",
  "tags" = EXCLUDED."tags",
  "isCustom" = EXCLUDED."isCustom",
  "orderIndex" = EXCLUDED."orderIndex";

-- 4. Global Partnership Scholarship
INSERT INTO "scholarship_types" (
  "name", "slug", "shortName", "description", "objectives", "eligibility", "benefits",
  "icon", "color", "badge", "banner", "seoTitle", "seoDescription", "seoKeywords",
  "tags", "isCustom", "orderIndex", "isActive"
) VALUES (
  'Global Partnership Scholarship',
  'global-partnership',
  'GPS',
  'Sponsored through strategic partnerships with governments, universities, NGOs, corporations, foundations, and international donors to promote global educational access.',
  'To leverage international partnerships for educational impact, expand access to education across borders, support students with global citizenship aspirations, strengthen ties between educational institutions worldwide, and promote cultural exchange and understanding.',
  'Citizenship or residency in partnered country/region. Connection to partner organization (employee dependent, community member, etc.). Commitment to returning to home country or region. Language proficiency as required by partnership agreement. Academic good standing with minimum GPA requirement per partner specifications.',
  'Varies by partnership (full or partial tuition). Cross-cultural orientation and support services. Language training when applicable. Access to partner institution networks. International study abroad opportunities (where applicable). Post-graduation employment pathways with partner organizations.',
  'Globe',
  '#10B981',
  'Global Partnership',
  'International, government-sponsored, NGO, corporate partnership, embassy',
  'Global Partnership Scholarship | InnovaSci Open Academy',
  'Explore Global Partnership Scholarships at InnovaSci Open Academy. International scholarships through partnerships with governments, universities, NGOs, and corporate sponsors worldwide.',
  'international scholarship, government scholarship, embassy program, NGO scholarship, corporate sponsorship, cross-border education, global scholarship',
  'international,global,government,NGO,corporate,partnership,embassy,cross-cultural',
  false,
  4,
  true
) ON CONFLICT (slug) DO UPDATE SET
  "shortName" = EXCLUDED."shortName",
  "description" = EXCLUDED."description",
  "objectives" = EXCLUDED."objectives",
  "eligibility" = EXCLUDED."eligibility",
  "benefits" = EXCLUDED."benefits",
  "icon" = EXCLUDED."icon",
  "color" = EXCLUDED."color",
  "badge" = EXCLUDED."badge",
  "banner" = EXCLUDED."banner",
  "seoTitle" = EXCLUDED."seoTitle",
  "seoDescription" = EXCLUDED."seoDescription",
  "seoKeywords" = EXCLUDED."seoKeywords",
  "tags" = EXCLUDED."tags",
  "isCustom" = EXCLUDED."isCustom",
  "orderIndex" = EXCLUDED."orderIndex";

-- 5. Leadership & Impact Scholarship
INSERT INTO "scholarship_types" (
  "name", "slug", "shortName", "description", "objectives", "eligibility", "benefits",
  "icon", "color", "badge", "banner", "seoTitle", "seoDescription", "seoKeywords",
  "tags", "isCustom", "orderIndex", "isActive"
) VALUES (
  'Leadership & Impact Scholarship',
  'leadership-impact',
  'LIS',
  'Recognizes students who have demonstrated exceptional leadership, community service, entrepreneurship, or significant societal impact through innovative initiatives.',
  'To cultivate the next generation of leaders and change-makers, recognize and reward impactful community service, encourage entrepreneurial thinking and innovation, inspire students to create positive societal change, and build a network of socially responsible leaders.',
  'Documented leadership experience in student organizations, community groups, or professional settings. Demonstrated community service hours (minimum 100 hours documented). Evidence of social impact through projects or initiatives. Entrepreneurial achievements (founded organizations, launched products, etc.). Letters of reference from supervisors or community leaders.',
  'Leadership development program enrollment. Networking with established leaders and entrepreneurs. Seed funding for social impact projects (up to $5,000). Mentorship from industry leaders and entrepreneurs. Access to exclusive leadership workshops and seminars. Recognition and visibility through media coverage and award ceremonies.',
  'Star',
  '#F59E0B',
  'Leadership & Impact',
  'Leadership, community service, entrepreneurship, social impact, change-maker',
  'Leadership & Impact Scholarship | InnovaSci Open Academy',
  'Apply for the Leadership & Impact Scholarship at InnovaSci Open Academy. Recognizing students who demonstrate exceptional leadership, community service, and positive social impact.',
  'leadership scholarship, community service award, entrepreneurship scholarship, social impact, change-maker, student leader, volunteer scholarship',
  'leadership,impact,community,service,entrepreneurship,social,change-maker,volunteer',
  false,
  5,
  true
) ON CONFLICT (slug) DO UPDATE SET
  "shortName" = EXCLUDED."shortName",
  "description" = EXCLUDED."description",
  "objectives" = EXCLUDED."objectives",
  "eligibility" = EXCLUDED."eligibility",
  "benefits" = EXCLUDED."benefits",
  "icon" = EXCLUDED."icon",
  "color" = EXCLUDED."color",
  "badge" = EXCLUDED."badge",
  "banner" = EXCLUDED."banner",
  "seoTitle" = EXCLUDED."seoTitle",
  "seoDescription" = EXCLUDED."seoDescription",
  "seoKeywords" = EXCLUDED."seoKeywords",
  "tags" = EXCLUDED."tags",
  "isCustom" = EXCLUDED."isCustom",
  "orderIndex" = EXCLUDED."orderIndex";

-- 6. Innovation Challenge Scholarship
INSERT INTO "scholarship_types" (
  "name", "slug", "shortName", "description", "objectives", "eligibility", "benefits",
  "icon", "color", "badge", "banner", "seoTitle", "seoDescription", "seoKeywords",
  "tags", "isCustom", "orderIndex", "isActive"
) VALUES (
  'Innovation Challenge Scholarship',
  'innovation-challenge',
  'ICS',
  'For students who have developed innovative solutions to real-world problems through competitions, hackathons, technological innovation, or creative problem-solving.',
  'To encourage innovative thinking and creative problem-solving, reward students who develop impactful solutions to challenges, promote participation in innovation competitions and hackathons, support the development of marketable innovations, and bridge the gap between academic learning and real-world application.',
  'Submission of an innovation project or solution. Participation in recognized innovation competitions, hackathons, or challenges. Proof of concept or working prototype. Endorsement from faculty mentor or industry expert. Potential for real-world impact and scalability.',
  'Competition fee reimbursement. Access to innovation labs and maker spaces. Prototyping budget and resources. Mentorship from industry experts and investors. Pitch training and investor readiness workshops. Incubation support for promising innovations. Exhibition opportunities at innovation showcases.',
  'Lightbulb',
  '#6366F1',
  'Innovation Challenge',
  'Innovation, hackathon, competition, prototype, invention, startup',
  'Innovation Challenge Scholarship | InnovaSci Open Academy',
  'Discover the Innovation Challenge Scholarship at InnovaSci Open Academy. Supporting students who develop innovative solutions through competitions, hackathons, and technological invention.',
  'innovation scholarship, hackathon winner, competition award, prototype funding, invention scholarship, startup support, tech innovation',
  'innovation,hackathon,competition,prototype,invention,startup,creative,solution',
  false,
  6,
  true
) ON CONFLICT (slug) DO UPDATE SET
  "shortName" = EXCLUDED."shortName",
  "description" = EXCLUDED."description",
  "objectives" = EXCLUDED."objectives",
  "eligibility" = EXCLUDED."eligibility",
  "benefits" = EXCLUDED."benefits",
  "icon" = EXCLUDED."icon",
  "color" = EXCLUDED."color",
  "badge" = EXCLUDED."badge",
  "banner" = EXCLUDED."banner",
  "seoTitle" = EXCLUDED."seoTitle",
  "seoDescription" = EXCLUDED."seoDescription",
  "seoKeywords" = EXCLUDED."seoKeywords",
  "tags" = EXCLUDED."tags",
  "isCustom" = EXCLUDED."isCustom",
  "orderIndex" = EXCLUDED."orderIndex";

-- 7. Custom Scholarship
INSERT INTO "scholarship_types" (
  "name", "slug", "shortName", "description", "objectives", "eligibility", "benefits",
  "icon", "color", "badge", "banner", "seoTitle", "seoDescription", "seoKeywords",
  "tags", "isCustom", "orderIndex", "isActive"
) VALUES (
  'Custom Scholarship',
  'custom',
  'CS',
  'A flexible scholarship template for administrators to create custom scholarship programs tailored to specific requirements, sponsorships, or institutional needs.',
  'To provide maximum flexibility for unique scholarship requirements, support sponsor-specific criteria and preferences, enable quick deployment of custom scholarship programs, and accommodate institutional priorities and special circumstances.',
  'Requirements vary by custom scholarship program. Please review the specific eligibility criteria for this scholarship before applying.',
  'Benefits vary by custom scholarship program. Please review the specific benefits section for this scholarship to understand what is being offered.',
  'Sparkles',
  '#14B8A6',
  'Custom',
  'Flexible, custom criteria, sponsor-specific, tailored program',
  'Custom Scholarship | InnovaSci Open Academy',
  'Create custom scholarship programs with InnovaSci Open Academy. Flexible scholarship templates for unique requirements, sponsorships, and institutional needs.',
  'custom scholarship, flexible scholarship, sponsor scholarship, custom criteria, tailored program',
  'custom,flexible,sponsor,tailored,special,bespoke',
  true,
  7,
  true
) ON CONFLICT (slug) DO UPDATE SET
  "shortName" = EXCLUDED."shortName",
  "description" = EXCLUDED."description",
  "objectives" = EXCLUDED."objectives",
  "eligibility" = EXCLUDED."eligibility",
  "benefits" = EXCLUDED."benefits",
  "icon" = EXCLUDED."icon",
  "color" = EXCLUDED."color",
  "badge" = EXCLUDED."badge",
  "banner" = EXCLUDED."banner",
  "seoTitle" = EXCLUDED."seoTitle",
  "seoDescription" = EXCLUDED."seoDescription",
  "seoKeywords" = EXCLUDED."seoKeywords",
  "tags" = EXCLUDED."tags",
  "isCustom" = EXCLUDED."isCustom",
  "orderIndex" = EXCLUDED."orderIndex";

-- Make sure isCustom column is NOT NULL with default
ALTER TABLE "scholarship_types" ALTER COLUMN "isCustom" SET DEFAULT false;
ALTER TABLE "scholarship_types" ALTER COLUMN "isCustom" SET NOT NULL;
