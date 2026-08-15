import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || ''
  const allowedOrigins = [
    'https://gmdigitalstudio.app',
    'https://www.gmdigitalstudio.app',
    'https://portal.gmdigitalstudio.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
  ]
  const isAllowed =
    allowedOrigins.includes(origin) ||
    origin.endsWith('.gmdigitalstudio.app') ||
    (origin.startsWith('https://') && origin.includes('gm-digital-studio') && origin.endsWith('.vercel.app'))

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://gmdigitalstudio.app',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const pexelsApiKey = Deno.env.get('PEXELS_API_KEY') || ''

    if (!pexelsApiKey) {
      console.warn('[Pexels Proxy] PEXELS_API_KEY secret is missing on server.')
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: PEXELS_API_KEY is not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let query = ''
    let page = 1
    let perPage = 1
    let orientation = 'portrait'

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      query = body.query || ''
      page = body.page || 1
      perPage = body.per_page || 1
      orientation = body.orientation || 'portrait'
    } else {
      const url = new URL(req.url)
      query = url.searchParams.get('query') || ''
      page = parseInt(url.searchParams.get('page') || '1', 10)
      perPage = parseInt(url.searchParams.get('per_page') || '1', 10)
      orientation = url.searchParams.get('orientation') || 'portrait'
    }

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required search query parameter.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=${encodeURIComponent(orientation)}`

    const pexelsRes = await fetch(pexelsUrl, {
      headers: {
        Authorization: pexelsApiKey,
      },
    })

    const data = await pexelsRes.json().catch(() => ({}))

    if (!pexelsRes.ok) {
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Pexels API error status ${pexelsRes.status}` }),
        { status: pexelsRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, photos: data.photos || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('[Pexels Proxy] Internal Error:', err)
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
