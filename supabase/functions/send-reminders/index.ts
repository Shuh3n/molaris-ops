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

    // 1. Buscar citas programadas para mañana que NO tengan recordatorio enviado
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

    // Filtrar citas que ya tienen recordatorio enviado
    const { data: recordatoriosExistentes } = await supabase
      .from('recordatorios')
      .select('cita_id')
      .in('cita_id', citas?.map(c => c.id) || [])

    const idsConRecordatorio = new Set(recordatoriosExistentes?.map(r => r.cita_id) || [])
    const citasPendientes = citas?.filter(c => !idsConRecordatorio.has(c.id)) || []

    if (citasPendientes.length === 0) {
      console.log('No hay citas pendientes para mañana')
      return new Response(JSON.stringify({ message: 'No hay citas', count: 0 }))
    }

    console.log(`Encontradas ${citasPendientes.length} citas para recordatorio`)

    // 2. Procesar cada cita con botones
    const resultados = []

    for (const cita of citasPendientes) {
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

        // Mensaje con botones inline
        const mensaje = `🦷 *Recordatorio de cita - Molaris Ops*\n\n` +
          `Hola *${nombreCompleto}*, te recordamos que tienes una cita programada para *mañana*:\n\n` +
          `📅 *Fecha:* ${fechaFormateada}\n` +
          `⏰ *Hora:* ${horaFormateada}\n` +
          `⏱️ *Duración:* ${cita.duracion_minutos} minutos\n\n` +
          `✅ *¿Confirmas tu asistencia?*\n\n` +
          `Por favor, selecciona una opción:`

        // Crear teclado inline con botones
        const replyMarkup = {
          inline_keyboard: [
            [
              { text: "✅ Sí, confirmo mi asistencia", callback_data: `confirmar_${cita.id}` },
              { text: "❌ No, cancelar cita", callback_data: `cancelar_${cita.id}` }
            ]
          ]
        }

        // Enviar mensaje con botones
        const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: parseInt(paciente.telegram_chat_id),
            text: mensaje,
            parse_mode: 'Markdown',
            reply_markup: replyMarkup
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

        console.log(`✅ Recordatorio enviado a ${nombreCompleto} con botones`)
        resultados.push({
          cita_id: cita.id,
          paciente: nombreCompleto,
          success: true,
          message_id: telegramResult.result.message_id
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
      total: citasPendientes.length,
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