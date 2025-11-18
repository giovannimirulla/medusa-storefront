import { NextRequest, NextResponse } from 'next/server'

// Proxy to fetch the current customer's wishlist using httpOnly auth cookies (server side)
export async function GET(req: NextRequest) {
  try {
    const backendBase = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL
    if (!backendBase) {
      return NextResponse.json({ error: 'Backend URL non configurato' }, { status: 500 })
    }

  const url = new URL('/store/customers/me/wishlist', backendBase)
  // Prova ad aggiungere Authorization se disponibile
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const token = cookieStore.get('_medusa_jwt')?.value
    const upstream = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward publishable key if present (SSR safe)
        ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
          ? { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Include cookies for auth (Next automatically attaches cookies from the request context)
      credentials: 'include',
      cache: 'no-store'
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      return NextResponse.json({ error: 'Impossibile recuperare la wishlist', details: text }, { status: upstream.status })
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: 'Errore inatteso nel recupero wishlist', details: e?.message }, { status: 500 })
  }
}
