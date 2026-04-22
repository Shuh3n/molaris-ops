// supabase/functions/telegram-callback/index.ts
/// <reference lib="deno.window" />

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    const update = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')

    if (!BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN no configurado')
    }

    // Verificar si es un callback query (respuesta de botón)
    const callbackQuery = update.callback_query
    if (!callbackQuery) {
      return new Response('OK', { status: 200 })
    }

    const chat_id = callbackQuery.message?.chat?.id
    const message_id = callbackQuery.message?.message_id
    const callbackData = callbackQuery.data
    const callbackId = callbackQuery.id

    if (!chat_id || !message_id || !callbackData) {
      return new Response('OK', { status: 200 })
    }

    // Parsear los datos del callback: "confirmar_uuid" o "cancelar_uuid"
    const [accion, citaId] = callbackData.split('_')

    if (!accion || !citaId) {
      await answerCallbackQuery(callbackId, BOT_TOKEN, "❌ Acción inválida")
      return new Response('OK', { status: 200 })
    }

    // Verificar que la cita existe y pertenece al paciente
    const { data: cita, error: citaError } = await supabase
      .from('citas')
      .select(`
        id,
        estado,
        fecha_hora,
        pacientes!inner (
          id,
          nombre,
          apellido,
          telegram_chat_id
        )
      `)
      .eq('id', citaId)
      .single()

    if (citaError || !cita) {
      await answerCallbackQuery(callbackId, BOT_TOKEN, "❌ Cita no encontrada")
      await editMessageText(chat_id, message_id, BOT_TOKEN,
        "❌ *Error:* La cita ya no existe en el sistema.\n\nPor favor contacta a la clínica.",
        'Markdown'
      )
      return new Response('OK', { status: 200 })
    }

    // Verificar que el chat_id coincide con el paciente
    if (cita.pacientes.telegram_chat_id !== chat_id.toString()) {
      await answerCallbackQuery(callbackId, BOT_TOKEN, "❌ No autorizado")
      return new Response('OK', { status: 200 })
    }

    // Verificar que la cita no esté ya cancelada o completada
    if (cita.estado !== 'programada') {
      let mensajeError = ""
      if (cita.estado === 'cancelada') {
        mensajeError = "❌ Esta cita ya fue cancelada anteriormente."
      } else if (cita.estado === 'completada') {
        mensajeError = "✅ Esta cita ya fue completada."
      } else {
        mensajeError = `❌ Esta cita ya tiene estado: ${cita.estado}`
      }

      await answerCallbackQuery(callbackId, BOT_TOKEN, mensajeError)
      await editMessageText(chat_id, message_id, BOT_TOKEN,
        `${mensajeError}\n\nPor favor contacta a la clínica si tienes dudas.`,
        'Markdown'
      )
      return new Response('OK', { status: 200 })
    }

    const nombrePaciente = `${cita.pacientes.nombre} ${cita.pacientes.apellido}`
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

    // Procesar según la acción
    if (accion === 'confirmar') {
      // Actualizar la cita (se mantiene como programada, pero registramos confirmación)
      // Opcional: podrías agregar un campo 'confirmada' a la tabla citas

      await answerCallbackQuery(callbackId, BOT_TOKEN, "✅ ¡Gracias por confirmar!")

      // Editar el mensaje original para quitar los botones
      await editMessageText(chat_id, message_id, BOT_TOKEN,
        `✅ *Cita confirmada*\n\n` +
        `Hola *${nombrePaciente}*, gracias por confirmar tu asistencia.\n\n` +
        `📅 *Fecha:* ${fechaFormateada}\n` +
        `⏰ *Hora:* ${horaFormateada}\n\n` +
        `📍 Te esperamos en la clínica. ¡Que tengas un excelente día!`,
        'Markdown'
      )

      // Opcional: Registrar en notas_pacientes
      await supabase
        .from('notas_pacientes')
        .insert({
          paciente_id: cita.pacientes.id,
          nota: `Paciente confirmó cita del ${fechaFormateada} a las ${horaFormateada} vía Telegram`
        })

    } else if (accion === 'cancelar') {
      // Actualizar el estado de la cita a 'cancelada'
      const { error: updateError } = await supabase
        .from('citas')
        .update({
          estado: 'cancelada',
          actualizado_en: new Date().toISOString()
        })
        .eq('id', citaId)

      if (updateError) {
        await answerCallbackQuery(callbackId, BOT_TOKEN, "❌ Error al cancelar la cita")
        return new Response('OK', { status: 200 })
      }

      await answerCallbackQuery(callbackId, BOT_TOKEN, "❌ Cita cancelada")

      // Editar el mensaje original para quitar los botones
      await editMessageText(chat_id, message_id, BOT_TOKEN,
        `❌ *Cita cancelada*\n\n` +
        `Hola *${nombrePaciente}*, hemos cancelado tu cita del *${fechaFormateada}* a las *${horaFormateada}*.\n\n` +
        `Si fue un error o deseas reagendar, por favor contacta a la clínica.`,
        'Markdown'
      )

      // Registrar en notas_pacientes
      await supabase
        .from('notas_pacientes')
        .insert({
          paciente_id: cita.pacientes.id,
          nota: `Paciente canceló cita del ${fechaFormateada} a las ${horaFormateada} vía Telegram`
        })
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Error general:', error)
    return new Response('OK', { status: 200 })
  }
})

// Función para responder al callback (quita el "loading" en Telegram)
async function answerCallbackQuery(callbackId: string, token: string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackId,
      text: text,
      show_alert: false
    })
  })
}

// Función para editar el mensaje original (quitar los botones)
async function editMessageText(chat_id: number, message_id: number, token: string, text: string, parse_mode: string | null) {
  const payload: any = {
    chat_id,
    message_id,
    text
  }
  if (parse_mode) payload.parse_mode = parse_mode

  await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}