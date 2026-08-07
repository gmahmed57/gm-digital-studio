import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || Deno.env.get('VITE_RESEND_API_KEY')
    const { to, subject, html, from } = await req.json()

    if (!resendApiKey) {
      console.log('[Serverless Send-Email] No RESEND_API_KEY set in Deno env. Simulating dispatch:', { to, subject })
      return new Response(
        JSON.stringify({ success: true, message: 'Email dispatch simulated on serverless backend.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const senderFrom = from || 'GM Digital Studio <notifications@gmdigitalstudio.app>';
    const recipientTo = Array.isArray(to) ? to : [to];

    // Call Resend API server-to-server (No CORS restrictions on Deno backend)
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
        JSON.stringify({ success: false, error: resendData.message || `Resend API returned status ${resendRes.status}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
