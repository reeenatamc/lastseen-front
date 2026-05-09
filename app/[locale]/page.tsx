'use client'

import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { PrivacyNote } from '@/components/landing/PrivacyNote'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <PrivacyNote />
      <Footer />
    </div>
  )
}
