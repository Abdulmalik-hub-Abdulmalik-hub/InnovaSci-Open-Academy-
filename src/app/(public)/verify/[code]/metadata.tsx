import { Metadata } from "next"

// This is a dynamic metadata function that will be called for each certificate verification page
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://innovasci-open-academy.vercel.app'
  const verifyUrl = `${baseUrl}/verify/${code}`
  const academyName = "InnovaSci Open Academy"
  
  // Default metadata
  const title = `Verify Certificate | ${academyName}`
  const description = `Verify the authenticity of a certificate from ${academyName}. This link confirms the achievement of a verified graduate.`
  const ogImage = `${baseUrl}/api/og/certificate?code=${code}`

  return {
    title,
    description,
    openGraph: {
      title: `Certificate Verification | ${academyName}`,
      description: `Verify certificate from ${academyName}`,
      url: verifyUrl,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${academyName} Certificate Verification`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Certificate Verification | ${academyName}`,
      description: `Verify certificate from ${academyName}`,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}