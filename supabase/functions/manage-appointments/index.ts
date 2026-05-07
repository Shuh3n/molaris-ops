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
    const check = url.searchParams.get('check')

    // ── Helper: obtener UUID de un estado por nombre ──────────────────────────
    const getEstadoId = async (nombre: string): Promise<string | null> => {
      const { data } = await supabaseClient
        .from('estados_cita')
        .select('id')
        .eq('nombre', nombre)
        .single()
      return data?.id ?? null
    }

    // ── GET: motivos de consulta ──────────────────────────────────────────────
    if (method === 'GET' && type === 'motivos') {
      const { data, error } = await supabaseClient
        .from('motivos_consulta')
        .select('id, nombre, costo_base')
        .eq('status', 'activo')
        .order('nombre', { ascending: true })
      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // ── GET: estados disponibles ──────────────────────────────────────────────
    if (method === 'GET' && type === 'estados') {
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

    // ── GET: verificar disponibilidad ─────────────────────────────────────────
    if (method === 'GET' && check === 'true') {
      const dentista_id = url.searchParams.get('dentista_id')
      const fecha_hora = url.searchParams.get('fecha_hora')
      const duracion_minutos = parseInt(url.searchParams.get('duracion_minutos') || '30')
      const exclude_id = url.searchParams.get('exclude_id')

      if (!dentista_id || !fecha_hora) {
        return new Response(JSON.stringify({ disponible: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // Obtener el estado_id de "programada" para el filtro
      const estadoProgramadaId = await getEstadoId('programada')

      let query = supabaseClient
        .from('citas')
        .select('id, fecha_hora, duracion_minutos')
        .eq('dentista_id', dentista_id)

      if (estadoProgramadaId) query = query.eq('estado_id', estadoProgramadaId)
      if (exclude_id) query = query.neq('id', exclude_id)

      const { data: citas, error } = await query
      if (error) throw error

      const inicio = new Date(fecha_hora)
      const fin = new Date(inicio.getTime() + duracion_minutos * 60000)

      const overlap = (citas || []).some(c => {
        const cInicio = new Date(c.fecha_hora)
        const cFin = new Date(cInicio.getTime() + (c.duracion_minutos || 30) * 60000)
        return inicio < cFin && fin > cInicio
      })

      return new Response(JSON.stringify({ disponible: !overlap }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // ── GET: listar citas ─────────────────────────────────────────────────────
    if (method === 'GET') {
      const clinica_id = url.searchParams.get('clinica_id')

      let query = supabaseClient
        .from('citas')
        .select(`
          id,
          fecha_hora,
          duracion_minutos,
          notas_medicas,
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
        .order('fecha_hora', { ascending: true })

      if (clinica_id) query = query.eq('clinica_id', clinica_id)

      const { data, error } = await query
      if (error) throw error

      // Aplanar el estado para facilitar el uso en frontend
      const result = (data || []).map((c: any) => ({
        ...c,
        estado: c.estados_cita?.nombre ?? 'programada',
      }))

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // ── POST: crear cita ──────────────────────────────────────────────────────
    if (method === 'POST') {
      const body = await req.json()

      if (!body.paciente_id || !body.fecha_hora) {
        throw new Error('paciente_id y fecha_hora son obligatorios')
      }
      if (!body.clinica_id) {
        throw new Error('clinica_id es obligatorio')
      }

      // Resolver estado_id — acepta estado_id directo o nombre de estado
      let estado_id: string | null = body.estado_id ?? null
      if (!estado_id) {
        estado_id = await getEstadoId(body.estado ?? 'programada')
      }
      if (!estado_id) {
        throw new Error('No se encontró el estado "programada" en la tabla estados_cita')
      }

      const appointmentData = {
        clinica_id: body.clinica_id,
        paciente_id: body.paciente_id,
        dentista_id: body.dentista_id ?? null,
        fecha_hora: body.fecha_hora,
        duracion_minutos: body.duracion_minutos ?? 30,
        estado_id,
        motivo_id: body.motivo_id ?? null,
        notas_medicas: body.notas_medicas ?? null,
      }

      const { data, error } = await supabaseClient
        .from('citas')
        .insert([appointmentData])
        .select(`
          id, fecha_hora, duracion_minutos, notas_medicas, clinica_id,
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

    // ── PUT / PATCH: actualizar cita ──────────────────────────────────────────
    if (method === 'PUT' || method === 'PATCH') {
      if (!id) throw new Error('id es obligatorio para actualizar')
      const body = await req.json()

      const updateData: Record<string, unknown> = {
        actualizado_en: new Date().toISOString(),
      }

      // Campos permitidos de actualización directa
      const directFields = ['fecha_hora', 'duracion_minutos', 'notas_medicas',
        'paciente_id', 'dentista_id', 'motivo_id']
      for (const key of directFields) {
        if (key in body) updateData[key] = body[key]
      }

      // Resolver estado_id — acepta estado_id directo o nombre
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
        .select(`
          id, fecha_hora, duracion_minutos, notas_medicas,
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

    // ── DELETE ────────────────────────────────────────────────────────────────
    if (method === 'DELETE') {
      if (!id) throw new Error('id es obligatorio para eliminar')
      const { error } = await supabaseClient
        .from('citas')
        .delete()
        .eq('id', id)
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
