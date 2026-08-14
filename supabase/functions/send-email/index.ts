import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.7"

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || ''
  const allowedOrigins = [
    'https://gmdigitalstudio.app',
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || Deno.env.get('VITE_ADMIN_EMAIL') || ''
    const { to, subject, html, from, mode } = await req.json().catch(() => ({}))

    const dispatchMode = mode || 'system_notification'
    let recipientTo: string[] = []

    // 1. PUBLIC CONTACT FORM MODE
    // Recipient is STRICTLY FORCED on the server to the configured ADMIN_EMAIL secret.
    if (dispatchMode === 'contact_form') {
      const targetAdmin = adminEmail || (Array.isArray(to) ? to[0] : to)
      if (!targetAdmin) {
        return new Response(
          JSON.stringify({ success: false, error: 'Server configuration error: ADMIN_EMAIL secret is not configured.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      recipientTo = [targetAdmin]
    } 
    // 2. AUTHENTICATED NOTIFICATIONS & CUSTOM COMPOSER MODES
    else {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized: Missing authorization header.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      )

      const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
      if (userError || !user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized: Invalid user session.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // If sending bulk custom compose emails, enforce Admin privilege
      if (dispatchMode === 'custom_compose') {
        const userRole = user.app_metadata?.role
        const superAdminEmail = Deno.env.get('SUPERADMIN_EMAIL') || adminEmail
        const isAdmin = userRole === 'admin' || userRole === 'superadmin' || (superAdminEmail && user.email === superAdminEmail)
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ success: false, error: 'Forbidden: Admin privilege required for custom email dispatch.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      recipientTo = Array.isArray(to) ? to : [to]
    }

    // Clean recipient list
    recipientTo = recipientTo.filter((email) => email && typeof email === 'string' && email.trim() !== '')

    if (!recipientTo.length) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request: Valid recipient email address is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!resendApiKey) {
      console.warn('[Serverless Send-Email] RESEND_API_KEY secret is missing on server.')
      return new Response(
        JSON.stringify({ success: false, error: 'Server secret configuration missing: RESEND_API_KEY is not set.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Official production domain sender
    const senderFrom = from || 'GM Digital Studio <notifications@gmdigitalstudio.app>'

    // Call Resend API server-to-server
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: senderFrom,
        to: recipientTo,
        subject: subject || 'GM Digital Studio Notification',
        html: html || '<p>GM Digital Studio Notification</p>',
      }),
    })

    const resendData = await resendRes.json().catch(() => ({}))

    if (!resendRes.ok) {
      console.warn('[Serverless Send-Email] Resend API error response:', resendData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: resendData.message || `Resend API returned status ${resendRes.status}` 
        }),
        { status: resendRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully via Resend API.', data: resendData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('[Serverless Send-Email] Internal Error:', err)
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
