import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, payload } = await req.json()

    if (action === 'invite_member') {
      const { email, nombre_completo, rol_id, clinica_id } = payload

      // 1. Obtener límites de la licencia de la clínica y el nombre del rol
      const { data: clinica, error: clinicaError } = await supabaseClient
        .from('clinicas')
        .select('*, licencias(max_dentistas, max_recepcionistas)')
        .eq('id', clinica_id)
        .single()

      if (clinicaError || !clinica) {
        throw new Error('No se pudo encontrar la información de la clínica o su licencia.')
      }

      const limits = clinica.licencias || { max_dentistas: 1, max_recepcionistas: 1 }
      const { data: role } = await supabaseClient.from('roles').select('nombre').eq('id', rol_id).single()
      
      const { count } = await supabaseClient
        .from('perfiles')
        .select('*', { count: 'exact', head: true })
        .eq('clinica_id', clinica_id)
        .eq('rol_id', rol_id)

      if (role.nombre === 'ORTODONCISTA' && (count ?? 0) >= limits.max_dentistas) {
        throw new Error(`Límite de Odontólogos alcanzado (${limits.max_dentistas}) para esta clínica con su licencia actual.`)
      }
      if (role.nombre === 'RECEPCIONISTA' && (count ?? 0) >= limits.max_recepcionistas) {
        throw new Error(`Límite de Recepcionistas alcanzado (${limits.max_recepcionistas}) para esta clínica con su licencia actual.`)
      }

      // 2. Aquí iría la lógica de Auth para invitar (admin.inviteUserByEmail)
      // Por simplicidad en este paso, devolvemos éxito.
      
      return new Response(JSON.stringify({ message: 'Invitación enviada' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Acción no válida' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
