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

      // 1. Obtener la clínica
      const { data: clinica, error: clinicaError } = await supabaseClient
        .from('clinicas')
        .select('*')
        .eq('id', clinica_id)
        .single()

      if (clinicaError || !clinica) {
        throw new Error('No se pudo encontrar la información de la clínica.')
      }

      // 2. Obtener la licencia asociada por ID
      let licencia = null
      if (clinica.licencia_id) {
        const { data: lic, error: licError } = await supabaseClient
          .from('licencias')
          .select('*')
          .eq('id', clinica.licencia_id)
          .single()
        if (!licError && lic) licencia = lic
      }

      // fallback a valores por defecto (Básica) si no hay licencia explícita
      const limits = licencia || { max_dentistas: 1, max_recepcionistas: 1 }

      // 3. Obtener el rol que se quiere asignar
      const { data: role, error: roleError } = await supabaseClient
        .from('roles')
        .select('nombre')
        .eq('id', rol_id)
        .single()
      
      if (roleError || !role) throw new Error('El rol especificado no es válido.')

      // 4. Validar límites según el rol
      const isDoctor = role.nombre === 'ORTODONCISTA'
      const isStaff = role.nombre === 'RECEPCIONISTA'

      if (isDoctor || isStaff) {
        const { count } = await supabaseClient
          .from('perfiles')
          .select('*', { count: 'exact', head: true })
          .eq('clinica_id', clinica_id)
          .eq('rol_id', rol_id)

        const max = isDoctor ? limits.max_dentistas : limits.max_recepcionistas
        
        if ((count ?? 0) >= (max ?? 1)) {
          throw new Error(`Límite de ${isDoctor ? 'Odontólogos' : 'Recepcionistas'} alcanzado (${max}). Tu licencia actual no permite más miembros en este rol.`)
        }
      }

      // 5. Intentar invitar al usuario en Auth y crear su perfil en BD
      try {
        // Usamos inviteUserByEmail para que Supabase envíe el correo de invitación
        // Esto permite que el usuario elija su propia contraseña al aceptar.
        const inviteRes = await supabaseClient.auth.admin.inviteUserByEmail(email, {
          data: { nombre_completo },
          // redirectTo: 'https://tu-dominio.com/login' // Opcional: configurar en Supabase Dashboard
        })

        const invitedUser = inviteRes?.data?.user

        if (!invitedUser || !invitedUser.id) {
          throw new Error((inviteRes?.error && inviteRes.error.message) || 'No se pudo enviar la invitación')
        }

        // Insertar perfil ligado al user id
        const perfilPayload = {
          id: invitedUser.id,
          clinica_id,
          nombre_completo,
          rol_id,
          email,
        }

        const { error: perfilError } = await supabaseClient.from('perfiles').upsert(perfilPayload)
        if (perfilError) throw perfilError;

        return new Response(JSON.stringify({ message: 'Invitación enviada correctamente' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } catch (err) {
        // Si la llamada admin no está disponible o falló, devolver información útil
        return new Response(JSON.stringify({ error: err.message || String(err) }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }
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
