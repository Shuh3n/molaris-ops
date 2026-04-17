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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No se encontró el token de autorización')
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) throw new Error('No autorizado: ' + (authError?.message || 'Usuario no encontrado'))

    // 1. Obtener la clinica_id del perfil del usuario logueado
    const { data: profile, error: profileError } = await supabaseClient
      .from('perfiles')
      .select('clinica_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.clinica_id) {
      console.error('Error de Perfil:', profileError)
      throw new Error('Tu cuenta no tiene una clínica asignada. Contacta al administrador.')
    }
    
    const clinica_id = profile.clinica_id

    const url = new URL(req.url)
    const method = req.method
    const id = url.searchParams.get('id')
    const showAll = url.searchParams.get('all') === 'true'

    if (method === 'GET') {
      let query = supabaseClient
        .from('pacientes')
        .select('*')
        .eq('clinica_id', clinica_id)
      
      if (!showAll) {
        query = query.eq('activo', true)
      }

      const { data, error } = await query.order('nombre', { ascending: true })

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (method === 'POST') {
      const body = await req.json()
      
      // Limpiamos el body de cualquier clinica_id que traiga para que no nos engañen
      const { clinica_id: _, ...patientData } = body
      
      const { data, error } = await supabaseClient
        .from('pacientes')
        .insert([{ ...patientData, clinica_id }]) // Forzamos la ID de la clínica del recepcionista
        .select()
        .single()

      if (error) {
        console.error('Error DB al crear:', error)
        throw new Error(error.message)
      }
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    if (method === 'PUT' || method === 'PATCH') {
      if (!id) throw new Error('Se requiere el ID del paciente para actualizar')
      const body = await req.json()
      
      // Aseguramos que solo actualice pacientes de SU propia clínica
      const { data, error } = await supabaseClient
        .from('pacientes')
        .update(body)
        .eq('id', id)
        .eq('clinica_id', clinica_id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (method === 'DELETE') {
      if (!id) throw new Error('Se requiere el ID del paciente')
      const { data, error } = await supabaseClient
        .from('pacientes')
        .update({ activo: false })
        .eq('id', id)
        .eq('clinica_id', clinica_id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return new Response(JSON.stringify({ message: 'Paciente desactivado', data }), {
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
