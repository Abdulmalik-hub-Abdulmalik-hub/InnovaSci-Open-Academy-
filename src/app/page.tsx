import { HeroSection } from "@/components/home/hero-section"
import { CourseCatalog } from "@/components/home/course-catalog"
import { LearningPaths } from "@/components/home/learning-paths"
import { Features } from "@/components/home/features"
import { Newsletter } from "@/components/home/newsletter"
import { Footer } from "@/components/home/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <CourseCatalog />
        <LearningPaths />
        <Features />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
