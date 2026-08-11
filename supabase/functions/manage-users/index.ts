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
  const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.gmdigitalstudio.app')
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://gmdigitalstudio.app',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header provided' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Create a Supabase Client with the caller's JWT to verify their identity and role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 2. Get the user data and app_metadata to confirm they are an Admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Role MUST come from server-controlled app_metadata or server secret to prevent client privilege escalation
    const userRole = user.app_metadata?.role
    const superAdminEmail = Deno.env.get('SUPERADMIN_EMAIL') || Deno.env.get('ADMIN_EMAIL') || Deno.env.get('VITE_ADMIN_EMAIL')
    const isSuperAdmin = (superAdminEmail && user.email === superAdminEmail) || userRole === 'superadmin'
    if (userRole !== 'admin' && !isSuperAdmin) {
      console.warn(`User ${user.email} (role: ${userRole}) attempted admin action but was blocked.`)
      return new Response(JSON.stringify({ error: 'Unauthorized: Admins only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Create a Supabase Client with the service role key to perform admin actions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 4. Parse action request
    const { action, email, password, role, userId, updates } = await req.json()

    if (action === 'create-user') {
      if (!email || !password || !role) {
        return new Response(JSON.stringify({ error: 'Missing required parameters: email, password, role' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create auth user with pre-confirmed email; store role strictly in app_metadata
      const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        app_metadata: {
          role,
        },
        user_metadata: {
          full_name: updates?.fullName ?? updates?.name ?? 'New User',
          company: updates?.company ?? '',
        }
      })

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Insert/Upsert into public table (clients or authors)
      if (role === 'client') {
        const { error: dbError } = await supabaseAdmin.from('clients').upsert({
          id: newUser.id,
          fullName: updates?.fullName ?? 'New Client',
          company: updates?.company ?? '',
          email: newUser.email,
          phone: updates?.phone ?? '',
          avatarUrl: updates?.avatarUrl ?? '',
          status: updates?.status ?? 'active',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          activeProjectsCount: updates?.activeProjectsCount ?? 0,
          totalBilled: updates?.totalBilled ?? '$0',
          assignedPackage: updates?.assignedPackage ?? 'Standard Web Development',
          allowedToolIds: updates?.allowedToolIds ?? [],
          requestedToolIds: updates?.requestedToolIds ?? [],
        })

        if (dbError) {
          return new Response(JSON.stringify({ error: `User created but DB sync failed: ${dbError.message}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      } else if (role === 'author') {
        const { error: dbError } = await supabaseAdmin.from('authors').upsert({
          id: newUser.id,
          name: updates?.name ?? 'New Author',
          email: newUser.email,
          role: updates?.role ?? 'Author',
          avatar_url: updates?.avatar_url ?? '',
          bio: updates?.bio ?? '',
        })

        if (dbError) {
          return new Response(JSON.stringify({ error: `User created but DB sync failed: ${dbError.message}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      return new Response(JSON.stringify({ user: newUser }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'update-user') {
      if (!userId || !role) {
        return new Response(JSON.stringify({ error: 'Missing required parameters: userId, role' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const updateData: any = {}
      if (password) {
        updateData.password = password
      }
      if (updates || role) {
        updateData.app_metadata = { role }
        updateData.user_metadata = {
          full_name: updates?.fullName ?? updates?.name ?? '',
          company: updates?.company ?? '',
        }
      }

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);

      // Update auth user if updating password or auth metadata AND is a valid UUID
      if (isUUID && (password || updates || role)) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData)
        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      // Sync changes to DB
      if (role === 'client') {
        const { error: dbError } = await supabaseAdmin.from('clients').update({
          fullName: updates?.fullName,
          company: updates?.company,
          email: email?.trim().toLowerCase(),
          phone: updates?.phone,
          avatarUrl: updates?.avatarUrl,
          status: updates?.status,
          assignedPackage: updates?.assignedPackage,
          allowedToolIds: updates?.allowedToolIds,
          requestedToolIds: updates?.requestedToolIds,
        }).eq('id', userId)

        if (dbError) {
          return new Response(JSON.stringify({ error: `Auth updated but DB sync failed: ${dbError.message}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      } else if (role === 'author') {
        const { error: dbError } = await supabaseAdmin.from('authors').update({
          name: updates?.name,
          email: email?.trim().toLowerCase(),
          role: updates?.role,
          avatar_url: updates?.avatar_url,
          bio: updates?.bio,
        }).eq('id', userId)

        if (dbError) {
          return new Response(JSON.stringify({ error: `Auth updated but DB sync failed: ${dbError.message}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'delete-user') {
      if (!userId || !role) {
        return new Response(JSON.stringify({ error: 'Missing required parameters: userId, role' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Delete from Auth first
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (deleteError) {
        console.warn(`User ${userId} not found in Auth during deletion: ${deleteError.message}`)
      }

      // Delete from DB
      if (role === 'client') {
        const { error: dbError } = await supabaseAdmin.from('clients').delete().eq('id', userId)
        if (dbError) {
          return new Response(JSON.stringify({ error: `Auth deleted but DB sync failed: ${dbError.message}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      } else if (role === 'author') {
        const { error: dbError } = await supabaseAdmin.from('authors').delete().eq('id', userId)
        if (dbError) {
          return new Response(JSON.stringify({ error: `Auth deleted but DB sync failed: ${dbError.message}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
