import Link from "next/link"
import { AcademyLogo } from "@/components/layout/logo"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <AcademyLogo className="h-10 w-auto" />
          </Link>
          <Link href="/auth/signup" className="text-sm font-medium text-brand-purple hover:underline">
            Sign Up
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="lead text-xl text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using InnovaSci Open Academy (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              InnovaSci Open Academy provides online educational content, courses, and learning resources in the fields of computational science, chemistry, and related disciplines. Our platform includes:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Video lectures and tutorials</li>
              <li>Interactive coding exercises and notebooks</li>
              <li>Course materials and documentation</li>
              <li>Progress tracking and certifications</li>
              <li>Community forum and discussion boards</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>
              To access certain features, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Providing accurate and complete information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p>
              All content on InnovaSci Open Academy, including but not limited to videos, text, graphics, logos, and course materials, is the property of InnovaSci or its content creators and is protected by copyright laws.
            </p>
            <p className="mt-4">
              You may not:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Redistribute, sell, or share course content</li>
              <li>Download content for commercial purposes</li>
              <li>Use our materials to create competing products</li>
              <li>Bypass or circumvent content protection measures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Payment and Refunds</h2>
            <p>
              For paid courses and memberships:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>All fees are charged in advance</li>
              <li>Refunds are available within 14 days of purchase</li>
              <li>Subscription cancellations take effect at the end of the billing period</li>
              <li>Prices are subject to change with 30 days notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Post harmful, offensive, or inappropriate content</li>
              <li>Harass or intimidate other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the normal operation of the platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
            <p>
              INNOVASCI OPEN ACADEMY IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>The content will be accurate, complete, or current</li>
              <li>The service will be uninterrupted or error-free</li>
              <li>Any errors in the service will be corrected</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, InnovaSci shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our <Link href="/privacy" className="text-brand-purple hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account and access to the service at any time, with or without notice, for any reason, including but not limited to violation of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. We will notify you of significant changes by posting the new terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-none mt-4 space-y-2">
              <li>Email: legal@innovasci.com</li>
              <li>Website: <Link href="/contact" className="text-brand-purple hover:underline">Contact Page</Link></li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} InnovaSci Open Academy. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
