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
    const check = url.searchParams.get('check') === 'true'

    // Get User and Clinic ID from Auth Token for security
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

    // Helper: resolve state name to ID
    const getEstadoId = async (nombre: string): Promise<string | null> => {
      const { data, error } = await supabaseClient
        .from('estados_cita')
        .select('id')
        .eq('nombre', nombre)
        .single()
      if (error || !data) return null
      return data.id
    }

    // GET: Listar citas, motivos o verificar disponibilidad
    if (method === 'GET') {
      // 1. Fetch motifs
      if (type === 'motivos') {
        const { data, error } = await supabaseClient
          .from('motivos_consulta')
          .select('id, nombre, costo_base')
          .eq('status', 'activo')
          .order('nombre', { ascending: true })
        if (error) throw error
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        })
      }

      // 2. Fetch statuses
      if (type === 'estados') {
        const { data, error } = await supabaseClient
          .from('estados_cita')
          .select('id, nombre, descripcion')
          .order('nombre', { ascending: true })
        if (error) throw error
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // 3. Availability check
      if (check) {
        const dentista_id = url.searchParams.get('dentista_id')
        const fecha_hora = url.searchParams.get('fecha_hora')
        const duracion_minutos = parseInt(url.searchParams.get('duracion_minutos') || '30')
        const exclude_id = url.searchParams.get('exclude_id')

        if (!dentista_id || !fecha_hora) throw new Error('Missing parameters for check')

        const estadoCanceladaId = await getEstadoId('cancelada')

        let query = supabaseClient
          .from('citas')
          .select('id, fecha_hora, duracion_minutos, estado_id')
          .eq('dentista_id', dentista_id)
          .eq('clinica_id', clinica_id)

        if (estadoCanceladaId) query = query.neq('estado_id', estadoCanceladaId)
        if (exclude_id) query = query.neq('id', exclude_id)

        const { data: existingApts, error: queryError } = await query
        if (queryError) throw queryError

        const start = new Date(fecha_hora)
        const end = new Date(start.getTime() + duracion_minutos * 60000)

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

      // 4. List all appointments for the clinic
      const { data, error } = await supabaseClient
        .from('citas')
        .select(`
          id,
          fecha_hora,
          duracion_minutos,
          notas_medicas,
          costo,
          creado_en,
          actualizado_en,
          clinica_id,
          paciente_id,
          dentista_id,
          motivo_id,
          estado_id,
          pacientes (id, nombre, apellido, telefono),
          perfiles:dentista_id (nombre_completo),
          motivos_consulta:motivo_id (id, nombre),
          estados_cita:estado_id (id, nombre)
        `)
        .eq('clinica_id', clinica_id)
        .order('fecha_hora', { ascending: true })

      if (error) throw error

      const result = (data || []).map((c: any) => ({
        ...c,
        estado: c.estados_cita?.nombre ?? 'programada',
      }))

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST: Create appointment
    if (method === 'POST') {
      const body = await req.json()

      if (!body.paciente_id || !body.fecha_hora) {
        throw new Error('paciente_id y fecha_hora son obligatorios')
      }

      // Resolve estado_id - accepts direct ID or state name
      let estado_id = body.estado_id ?? null
      if (!estado_id) {
        estado_id = await getEstadoId(body.estado ?? 'programada')
      }
      if (!estado_id) {
        throw new Error('No se encontró el estado solicitado en la tabla estados_cita')
      }

      const appointmentData = {
        clinica_id,
        paciente_id: body.paciente_id,
        dentista_id: body.dentista_id ?? null,
        fecha_hora: body.fecha_hora,
        duracion_minutos: body.duracion_minutos ?? 30,
        estado_id,
        motivo_id: body.motivo_id ?? null,
        notas_medicas: body.notas_medicas ?? null,
        costo: body.costo ?? 0
      }

      const { data, error } = await supabaseClient
        .from('citas')
        .insert([appointmentData])
        .select(`
          id, fecha_hora, duracion_minutos, notas_medicas, clinica_id, costo,
          pacientes (id, nombre, apellido),
          motivos_consulta:motivo_id (id, nombre),
          estados_cita:estado_id (id, nombre)
        `)
        .single()

      if (error) throw error

      return new Response(JSON.stringify({
        ...data,
        estado: (data as any).estados_cita?.nombre ?? 'programada',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // PUT / PATCH: Update appointment
    if (method === 'PUT' || method === 'PATCH') {
      if (!id) throw new Error('id es obligatorio para actualizar')
      const body = await req.json()

      const updateData: Record<string, unknown> = {
        actualizado_en: new Date().toISOString(),
      }

      // Direct fields
      const directFields = ['fecha_hora', 'duracion_minutos', 'notas_medicas',
        'paciente_id', 'dentista_id', 'motivo_id', 'costo']
      for (const key of directFields) {
        if (key in body) updateData[key] = body[key]
      }

      // Resolve estado_id
      if (body.estado_id) {
        updateData.estado_id = body.estado_id
      } else if (body.estado && typeof body.estado === 'string') {
        const estadoId = await getEstadoId(body.estado)
        if (estadoId) updateData.estado_id = estadoId
      }

      const { data, error } = await supabaseClient
        .from('citas')
        .update(updateData)
        .eq('id', id)
        .eq('clinica_id', clinica_id) // Security: only update if it belongs to this clinic
        .select(`
          id, fecha_hora, duracion_minutos, notas_medicas, costo,
          pacientes (id, nombre, apellido),
          motivos_consulta:motivo_id (id, nombre),
          estados_cita:estado_id (id, nombre)
        `)
        .single()

      if (error) throw error

      return new Response(JSON.stringify({
        ...data,
        estado: (data as any).estados_cita?.nombre ?? 'programada',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // DELETE: Delete appointment
    if (method === 'DELETE') {
      if (!id) throw new Error('id es obligatorio para eliminar')
      const { error } = await supabaseClient
        .from('citas')
        .delete()
        .eq('id', id)
        .eq('clinica_id', clinica_id) // Security
      
      if (error) throw error
      return new Response(JSON.stringify({ message: 'Cita eliminada correctamente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
