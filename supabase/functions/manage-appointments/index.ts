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

    const url = new URL(req.url)
    const method = req.method
    const id = url.searchParams.get('id')
    const type = url.searchParams.get('type')

    // Get User and Clinic ID
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) throw new Error('Invalid token')

    const { data: profile, error: profileError } = await supabaseClient
      .from('perfiles')
      .select('clinica_id')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile?.clinica_id) throw new Error('User profile or clinic not found')
    const clinica_id = profile.clinica_id

    // GET: Listar citas o motivos
    if (method === 'GET') {
      if (type === 'motivos') {
        const { data, error } = await supabaseClient
          .from('motivos_consulta')
          .select('*')
          .eq('status', 'activo')
          .order('nombre', { ascending: true })
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
      }

      const { data, error } = await supabaseClient
        .from('citas')
        .select(`
          *,
          pacientes (nombre, apellido, telefono),
          perfiles:dentista_id (nombre_completo),
          motivos_consulta:motivo_id (nombre)
        `)
        .eq('clinica_id', clinica_id)
        .order('fecha_hora', { ascending: true })

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST: Crear cita
    if (method === 'POST') {
      const body = await req.json()
      if (!body.paciente_id || !body.fecha_hora) {
        throw new Error('Paciente y fecha/hora son obligatorios')
      }
      
      const appointmentData = {
        ...body,
        clinica_id: clinica_id // Ensure clinic ID is correct
      }

      const { data, error } = await supabaseClient
        .from('citas')
        .insert([appointmentData])
        .select()
        .single()
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
    }

    // PUT/PATCH: Actualizar cita
    if (method === 'PUT' || method === 'PATCH') {
      if (!id) throw new Error('ID is required for updates')
      const body = await req.json()
      
      // Verify the appointment belongs to the clinic before updating
      const { data: checkData, error: checkError } = await supabaseClient
        .from('citas')
        .select('clinica_id')
        .eq('id', id)
        .single()
      
      if (checkError || checkData?.clinica_id !== clinica_id) {
        throw new Error('Unauthorized or appointment not found')
      }

      const { data, error } = await supabaseClient
        .from('citas')
        .update(body)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    // DELETE: Eliminar cita
    if (method === 'DELETE') {
      if (!id) throw new Error('ID is required for deletion')

      const { error } = await supabaseClient
        .from('citas')
        .delete()
        .eq('id', id)
        .eq('clinica_id', clinica_id) // Extra safety

      if (error) throw error
      return new Response(JSON.stringify({ message: 'Appointment deleted successfully' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
