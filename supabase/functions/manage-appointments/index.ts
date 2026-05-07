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

    // Helper to resolve state name to ID
    const resolveEstadoId = async (nombre: string) => {
      const { data, error } = await supabaseClient
        .from('estados_cita')
        .select('id')
        .eq('nombre', nombre)
        .single()
      if (error || !data) return null
      return data.id
    }

    const check = url.searchParams.get('check') === 'true'

    // GET: Listar citas o motivos
    if (method === 'GET') {
      if (type === 'motivos') {
        const { data, error } = await supabaseClient
          .from('motivos_consulta')
          .select('*')
          .eq('status', 'activo')
          .order('nombre', { ascending: true })
        if (error) {
          console.error('Error fetching motivos:', error)
          throw error
        }
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
      }

      if (check) {
        const dentista_id = url.searchParams.get('dentista_id')
        const fecha_hora = url.searchParams.get('fecha_hora')
        const duracion_minutos = parseInt(url.searchParams.get('duracion_minutos') || '30')
        const exclude_id = url.searchParams.get('exclude_id')

        if (!dentista_id || !fecha_hora) throw new Error('Missing parameters for check')

        const start = new Date(fecha_hora)
        const end = new Date(start.getTime() + duracion_minutos * 60000)

        let query = supabaseClient
          .from('citas')
          .select(`
            id, 
            fecha_hora, 
            duracion_minutos,
            estados_cita!inner (nombre)
          `)
          .eq('dentista_id', dentista_id)
          .eq('clinica_id', clinica_id)
          .neq('estados_cita.nombre', 'cancelada')

        if (exclude_id) {
          query = query.neq('id', exclude_id)
        }

        const { data: existingApts, error: queryError } = await query
        if (queryError) throw queryError

        const isDisponible = !existingApts?.some(apt => {
          const aptStart = new Date(apt.fecha_hora)
          const aptEnd = new Date(aptStart.getTime() + (apt.duracion_minutos || 30) * 60000)
          return (start < aptEnd && end > aptStart)
        })

        return new Response(JSON.stringify({ disponible: isDisponible }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        })
      }

      const { data, error } = await supabaseClient
        .from('citas')
        .select(`
          *,
          pacientes (nombre, apellido, telefono),
          perfiles:perfiles!dentista_id (nombre_completo),
          motivos_consulta:motivos_consulta!motivo_id (nombre),
          estados_cita:estados_cita!estado_id (nombre)
        `)
        .eq('clinica_id', clinica_id)
        .order('fecha_hora', { ascending: true })

      if (error) {
        console.error('Error fetching appointments:', error)
        throw error
      }

      // Flatten the state name for backward compatibility if needed, 
      // but let's see if we can just keep the structure and update frontend.
      // For now, let's inject 'estado' as a top-level property
      const mappedData = data.map(apt => ({
        ...apt,
        estado: apt.estados_cita?.nombre || 'desconocido'
      }))

      return new Response(JSON.stringify(mappedData), {
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
      
      // Resolve estado_id if 'estado' (name) is provided
      let estado_id = body.estado_id
      if (!estado_id && body.estado) {
        estado_id = await resolveEstadoId(body.estado)
      }
      // Default to 'programada' if not provided
      if (!estado_id) {
        estado_id = await resolveEstadoId('programada')
      }

      const appointmentData = {
        ...body,
        estado_id,
        clinica_id: clinica_id
      }
      delete appointmentData.estado // Remove if present to avoid DB error

      const { data, error } = await supabaseClient
        .from('citas')
        .insert([appointmentData])
        .select(`
          *,
          estados_cita:estados_cita!estado_id (nombre)
        `)
        .single()
      if (error) throw error
      
      return new Response(JSON.stringify({
        ...data,
        estado: data.estados_cita?.nombre
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
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

      // Resolve estado_id if 'estado' (name) is provided
      if (body.estado && !body.estado_id) {
        body.estado_id = await resolveEstadoId(body.estado)
      }
      delete body.estado // Remove if present

      const { data, error } = await supabaseClient
        .from('citas')
        .update(body)
        .eq('id', id)
        .select(`
          *,
          estados_cita:estados_cita!estado_id (nombre)
        `)
        .single()
      if (error) throw error

      return new Response(JSON.stringify({
        ...data,
        estado: data.estados_cita?.nombre
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
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
