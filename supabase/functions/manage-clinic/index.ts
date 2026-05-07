import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type MemberPayload = {
  email?: string
  nombre_completo?: string
  rol_id?: string
  clinica_id?: string
  member_id?: string
}

const createAdminClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const getRequesterContext = async (req: Request, adminClient: ReturnType<typeof createAdminClient>) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Falta el token de autorización.')
  }

  const token = authHeader.replace('Bearer ', '').trim()
  const { data: userData, error: userError } = await adminClient.auth.getUser(token)
  if (userError || !userData.user) {
    throw new Error('No se pudo validar la sesión del usuario.')
  }

  const { data: profile, error: profileError } = await adminClient
    .from('perfiles')
    .select('id, clinica_id, roles(nombre)')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('No se pudo cargar el perfil del usuario actual.')
  }

  return {
    userId: userData.user.id,
    clinicId: profile.clinica_id,
    roleName: profile.roles?.nombre,
  }
}

const requireAdminAccess = (context: { clinicId: string | null, roleName?: string | null }, clinicId: string) => {
  if (!context.clinicId || context.clinicId !== clinicId) {
    throw new Error('No tienes acceso a esta clínica.')
  }

  if (context.roleName !== 'ADMIN_GLOBAL') {
    throw new Error('Solo el Administrador Global puede gestionar el equipo.')
  }
}

const getRole = async (adminClient: ReturnType<typeof createAdminClient>, rolId: string) => {
  const { data: role, error } = await adminClient
    .from('roles')
    .select('id, nombre')
    .eq('id', rolId)
    .single()

  if (error || !role) {
    throw new Error('El rol especificado no es válido.')
  }

  return role
}

const getClinicWithLicense = async (adminClient: ReturnType<typeof createAdminClient>, clinicId: string) => {
  const { data: clinic, error } = await adminClient
    .from('clinicas')
    .select('id, licencia_id, licencias(max_dentistas, max_recepcionistas)')
    .eq('id', clinicId)
    .single()

  if (error || !clinic) {
    throw new Error('No se pudo encontrar la información de la clínica.')
  }

  return clinic
}

const validateRoleLimits = async (
  adminClient: ReturnType<typeof createAdminClient>,
  clinicId: string,
  roleName: string,
  roleId: string,
  currentMemberId?: string,
) => {
  const clinic = await getClinicWithLicense(adminClient, clinicId)
  const limits = clinic.licencias || { max_dentistas: 1, max_recepcionistas: 1 }

  const isDoctor = roleName === 'ORTODONCISTA'
  const isReceptionist = roleName === 'RECEPCIONISTA'

  if (!isDoctor && !isReceptionist) {
    return
  }

  let query = adminClient
    .from('perfiles')
    .select('id', { count: 'exact', head: true })
    .eq('clinica_id', clinicId)
    .eq('rol_id', roleId)

  if (currentMemberId) {
    query = query.neq('id', currentMemberId)
  }

  const { count, error } = await query
  if (error) {
    throw new Error('No se pudo validar el límite de miembros de la licencia.')
  }

  const maxAllowed = isDoctor ? limits.max_dentistas : limits.max_recepcionistas
  if ((count ?? 0) >= (maxAllowed ?? 1)) {
    throw new Error(`Límite de ${isDoctor ? 'Odontólogos' : 'Recepcionistas'} alcanzado (${maxAllowed}). Tu licencia actual no permite más miembros en este rol.`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const adminClient = createAdminClient()
    const { action, payload } = await req.json() as { action?: string, payload?: MemberPayload }

    if (!action || !payload?.clinica_id) {
      throw new Error('Solicitud inválida.')
    }

    const requester = await getRequesterContext(req, adminClient)
    requireAdminAccess(requester, payload.clinica_id)

    if (action === 'invite_member') {
      const { email, nombre_completo, rol_id, clinica_id } = payload
      if (!email || !nombre_completo || !rol_id || !clinica_id) {
        throw new Error('Faltan datos obligatorios para invitar al miembro.')
      }

      const role = await getRole(adminClient, rol_id)
      if (role.nombre === 'ADMIN_GLOBAL') {
        throw new Error('No está permitido invitar usuarios con rol administrador desde este flujo.')
      }

      await validateRoleLimits(adminClient, clinica_id, role.nombre, rol_id)

      const inviteRes = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { nombre_completo },
      })

      const invitedUser = inviteRes?.data?.user
      if (!invitedUser?.id) {
        throw new Error(inviteRes.error?.message || 'No se pudo enviar la invitación.')
      }

      const { error: perfilError } = await adminClient
        .from('perfiles')
        .upsert({
          id: invitedUser.id,
          clinica_id,
          nombre_completo,
          rol_id,
          email,
        })

      if (perfilError) {
        throw perfilError
      }

      return new Response(JSON.stringify({ message: 'Invitación enviada correctamente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'update_member') {
      const { member_id, nombre_completo, rol_id, clinica_id } = payload
      if (!member_id || !nombre_completo || !rol_id || !clinica_id) {
        throw new Error('Faltan datos obligatorios para actualizar el miembro.')
      }

      const { data: member, error: memberError } = await adminClient
        .from('perfiles')
        .select('id, clinica_id, roles(nombre)')
        .eq('id', member_id)
        .single()

      if (memberError || !member || member.clinica_id !== clinica_id) {
        throw new Error('No se encontró el miembro a actualizar en la clínica actual.')
      }

      if (member.roles?.nombre === 'ADMIN_GLOBAL') {
        throw new Error('No está permitido editar administradores desde este flujo.')
      }

      const role = await getRole(adminClient, rol_id)
      if (role.nombre === 'ADMIN_GLOBAL') {
        throw new Error('No está permitido asignar rol administrador desde este flujo.')
      }

      await validateRoleLimits(adminClient, clinica_id, role.nombre, rol_id, member_id)

      const { error: updateError } = await adminClient
        .from('perfiles')
        .update({
          nombre_completo,
          rol_id,
        })
        .eq('id', member_id)
        .eq('clinica_id', clinica_id)

      if (updateError) {
        throw updateError
      }

      return new Response(JSON.stringify({ message: 'Miembro actualizado correctamente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'delete_member') {
      const { member_id, clinica_id } = payload
      if (!member_id || !clinica_id) {
        throw new Error('Faltan datos obligatorios para retirar el miembro.')
      }

      const { data: member, error: memberError } = await adminClient
        .from('perfiles')
        .select('id, clinica_id, roles(nombre)')
        .eq('id', member_id)
        .single()

      if (memberError || !member || member.clinica_id !== clinica_id) {
        throw new Error('No se encontró el miembro a retirar en la clínica actual.')
      }

      if (member.roles?.nombre === 'ADMIN_GLOBAL') {
        throw new Error('No está permitido retirar administradores desde este flujo.')
      }

      const { error: updateError } = await adminClient
        .from('perfiles')
        .update({ clinica_id: null })
        .eq('id', member_id)
        .eq('clinica_id', clinica_id)

      if (updateError) {
        throw updateError
      }

      return new Response(JSON.stringify({ message: 'Miembro retirado de la clínica correctamente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Acción no válida' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
