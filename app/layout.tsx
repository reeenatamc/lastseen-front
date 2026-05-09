import { Instrument_Serif, Geist_Mono } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: '400',
  variable: '--font-instrument-serif',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${instrumentSerif.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col relative z-[1]">{children}</body>
    </html>
  )
}
