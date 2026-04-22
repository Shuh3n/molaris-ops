// supabase/functions/send-reminders/index.ts
/// <reference lib="deno.window" />

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')

    if (!BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN no configurado')
    }

    // Calcular el rango de 24 horas desde ahora
    const ahora = new Date()
    const mananaInicio = new Date(ahora)
    mananaInicio.setDate(ahora.getDate() + 1)
    mananaInicio.setHours(0, 0, 0, 0)

    const mananaFin = new Date(mananaInicio)
    mananaFin.setHours(23, 59, 59, 999)

    console.log(`Buscando citas entre ${mananaInicio.toISOString()} y ${mananaFin.toISOString()}`)

    // 1. Buscar citas programadas para mañana
    const { data: citas, error: citasError } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_hora,
        duracion_minutos,
        notas_medicas,
        pacientes!inner (
          id,
          nombre,
          apellido,
          telegram_chat_id,
          telefono
        )
      `)
      .eq('estado', 'programada')
      .gte('fecha_hora', mananaInicio.toISOString())
      .lt('fecha_hora', mananaFin.toISOString())
      .not('pacientes.telegram_chat_id', 'is', null)

    if (citasError) {
      console.error('Error al buscar citas:', citasError)
      return new Response(JSON.stringify({ error: citasError.message }), { status: 500 })
    }

    if (!citas || citas.length === 0) {
      console.log('No hay citas para mañana')
      return new Response(JSON.stringify({ message: 'No hay citas', count: 0 }))
    }

    console.log(`Encontradas ${citas.length} citas para mañana`)

    // 2. Procesar cada cita
    const resultados = []

    for (const cita of citas) {
      try {
        const paciente = cita.pacientes
        const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`

        // Formatear fecha y hora
        const fechaCita = new Date(cita.fecha_hora)
        const fechaFormateada = fechaCita.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        const horaFormateada = fechaCita.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })

        // Mensaje personalizado
        const mensaje = `🦷 *Recordatorio de cita - Molaris Ops*\n\n` +
          `Hola *${nombreCompleto}*, te recordamos que tienes una cita programada para *mañana*:\n\n` +
          `📅 *Fecha:* ${fechaFormateada}\n` +
          `⏰ *Hora:* ${horaFormateada}\n` +
          `⏱️ *Duración:* ${cita.duracion_minutos} minutos\n\n` +
          `📍 Te esperamos en la clínica.\n\n` +
          `_Si no puedes asistir, por favor comunícate con nosotros con anticipación._`

        // Enviar mensaje por Telegram
        const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: parseInt(paciente.telegram_chat_id),
            text: mensaje,
            parse_mode: 'Markdown'
          })
        })

        const telegramResult = await telegramResponse.json()

        if (!telegramResult.ok) {
          console.error(`Error enviando a ${nombreCompleto}:`, telegramResult.description)
          resultados.push({
            cita_id: cita.id,
            paciente: nombreCompleto,
            success: false,
            error: telegramResult.description
          })
          continue
        }

        // Registrar en la tabla de recordatorios
        await supabase
          .from('recordatorios')
          .insert({
            cita_id: cita.id,
            tipo: 'telegram',
            enviado: true,
            enviado_en: new Date().toISOString()
          })

        console.log(`✅ Recordatorio enviado a ${nombreCompleto}`)
        resultados.push({
          cita_id: cita.id,
          paciente: nombreCompleto,
          success: true
        })

      } catch (error) {
        console.error(`Error procesando cita ${cita.id}:`, error)
        resultados.push({
          cita_id: cita.id,
          success: false,
          error: String(error)
        })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total: citas.length,
      enviados: resultados.filter(r => r.success).length,
      fallidos: resultados.filter(r => !r.success).length,
      detalles: resultados
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error general:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})