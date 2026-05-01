import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Autenticación
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No se encontró el token de autorización')

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) throw new Error('No autorizado: ' + (authError?.message || 'Usuario no encontrado'))

    // Perfil y clínica del usuario
    const { data: profile, error: profileError } = await supabaseClient
      .from('perfiles')
      .select('clinica_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.clinica_id) {
      throw new Error('Tu cuenta no tiene una clínica asignada. Contacta al administrador.')
    }

    const clinica_id = profile.clinica_id
    const url = new URL(req.url)
    const method = req.method
    const id = url.searchParams.get('id')
    const showAll = url.searchParams.get('all') === 'true'
    const search = url.searchParams.get('search') || ''

    // ── GET ────────────────────────────────────────────────────────────────────
    if (method === 'GET') {
      let query = supabaseClient
        .from('pacientes')
        .select('*')
        .eq('clinica_id', clinica_id)

      if (!showAll) {
        query = query.eq('activo', true)
      }

      if (search) {
        query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,documento_id.ilike.%${search}%`)
      }

      const { data, error } = await query.order('nombre', { ascending: true })
      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // ── POST: Crear paciente ───────────────────────────────────────────────────
    if (method === 'POST') {
      const body = await req.json()
      const { data, error } = await supabaseClient
        .from('pacientes')
        .insert([{ ...body, clinica_id }])
        .select()
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // ── PUT: Actualizar paciente ───────────────────────────────────────────────
    if (method === 'PUT') {
      if (!id) throw new Error('Se requiere un ID para actualizar')
      const body = await req.json()
      const { data, error } = await supabaseClient
        .from('pacientes')
        .update({ ...body, actualizado_en: new Date().toISOString() })
        .eq('id', id)
        .eq('clinica_id', clinica_id)
        .select()
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // ── PATCH: Actualización parcial (ej. reactivar) ──────────────────────────
    if (method === 'PATCH') {
      if (!id) throw new Error('Se requiere un ID para actualizar')
      const body = await req.json()
      const { data, error } = await supabaseClient
        .from('pacientes')
        .update({ ...body, actualizado_en: new Date().toISOString() })
        .eq('id', id)
        .eq('clinica_id', clinica_id)
        .select()
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // ── DELETE: Desactivar paciente (soft delete) ─────────────────────────────
    if (method === 'DELETE') {
      if (!id) throw new Error('Se requiere un ID para eliminar')
      const { error } = await supabaseClient
        .from('pacientes')
        .update({ activo: false, actualizado_en: new Date().toISOString() })
        .eq('id', id)
        .eq('clinica_id', clinica_id)

      if (error) throw error
      return new Response(JSON.stringify({ message: 'Paciente desactivado correctamente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })

  } catch (error) {
    console.error('Error en Función:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
