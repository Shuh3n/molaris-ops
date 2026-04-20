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

    // Verificar auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No autorizado')
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) throw new Error('No autorizado')

    // Obtener clinica_id del usuario
    const { data: profile } = await supabaseClient
      .from('perfiles')
      .select('clinica_id')
      .eq('id', user.id)
      .single()

    if (!profile?.clinica_id) throw new Error('Sin clínica asignada')

    const url = new URL(req.url)
    const method = req.method
    const id = url.searchParams.get('id')

    // GET — Listar facturas con datos del paciente y cita
    if (method === 'GET') {
      if (id) {
        // Una sola factura
        const { data, error } = await supabaseClient
          .from('facturas')
          .select(`
            *,
            pacientes (id, nombre, apellido, documento_id, telefono, email, direccion),
            cita:cita_id (id, fecha_hora, motivo_id, motivos_consulta (nombre))
          `)
          .eq('id', id)
          .single()
        if (error) throw error
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // Todas las facturas de la clínica (via pacientes)
      const { data, error } = await supabaseClient
        .from('facturas')
        .select(`
          *,
          pacientes!inner (id, nombre, apellido, documento_id, clinica_id)
        `)
        .eq('pacientes.clinica_id', profile.clinica_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST — Crear factura
    if (method === 'POST') {
      const body = await req.json()
      if (!body.paciente) throw new Error('El paciente es obligatorio')

      const { data, error } = await supabaseClient
        .from('facturas')
        .insert([{
          paciente: body.paciente,
          cita_id: body.cita_id,
          categoria: body.categoria,
          descripcion: body.descripcion,
          costo: body.costo ?? 0,
          fecha_servicio: body.fecha_servicio,
          estado: body.estado ?? 'pendiente',
        }])
        .select(`
          *,
          pacientes (id, nombre, apellido, documento_id)
        `)
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // PUT — Editar factura completa
    if (method === 'PUT') {
      if (!id) throw new Error('ID requerido')
      const body = await req.json()

      const { data, error } = await supabaseClient
        .from('facturas')
        .update({
          paciente: body.paciente,
          cita_id: body.cita_id,
          categoria: body.categoria,
          descripcion: body.descripcion,
          costo: body.costo,
          fecha_servicio: body.fecha_servicio,
          estado: body.estado,
        })
        .eq('id', id)
        .select(`
          *,
          pacientes (id, nombre, apellido, documento_id)
        `)
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // PATCH — Cambiar solo el estado
    if (method === 'PATCH') {
      if (!id) throw new Error('ID requerido')
      const body = await req.json()

      const { data, error } = await supabaseClient
        .from('facturas')
        .update({ estado: body.estado })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // DELETE — Eliminar factura
    if (method === 'DELETE') {
      if (!id) throw new Error('ID requerido')
      const { error } = await supabaseClient
        .from('facturas')
        .delete()
        .eq('id', id)
      if (error) throw error
      return new Response(JSON.stringify({ message: 'Factura eliminada' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})