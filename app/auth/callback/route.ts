import { NextResponse } from 'next/server'

// Auth.js v5 handles the callback automatically via /api/auth/callback/resend
// This route handles legacy redirects
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get('next') ?? '/dashboard'
  return NextResponse.redirect(`${origin}${next}`)
}
