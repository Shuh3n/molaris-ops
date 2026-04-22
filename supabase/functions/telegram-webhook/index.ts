// supabase/functions/telegram-webhook/index.ts
/// <reference lib="deno.window" />

import { createClient } from 'jsr:@supabase/supabase-js@2'

interface UserState {
  step: string;
  paciente_id?: string;
  paciente_nombre?: string;
}

const userStates = new Map<string, UserState>()

Deno.serve(async (req: Request) => {
  try {
    const update = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')

    if (!BOT_TOKEN) {
      return new Response('OK', { status: 200 })
    }

    // ─── CALLBACK QUERY (respuesta a botones inline) ───────────────────────────
    const callbackQuery = update.callback_query
    if (callbackQuery) {
      const chat_id   = callbackQuery.message?.chat?.id
      const message_id = callbackQuery.message?.message_id
      const callbackData = callbackQuery.data as string
      const callbackId   = callbackQuery.id

      if (!chat_id || !message_id || !callbackData) {
        return new Response('OK', { status: 200 })
      }

      // Responder inmediatamente para quitar el spinner de Telegram
      await answerCallbackQuery(callbackId, BOT_TOKEN, '⏳ Procesando...')

      // callback_data: "confirmar_<uuid>" | "cancelar_<uuid>"
      const underscoreIdx = callbackData.indexOf('_')
      const accion  = callbackData.slice(0, underscoreIdx)
      const citaId  = callbackData.slice(underscoreIdx + 1)

      if (!accion || !citaId) {
        await editMessageText(chat_id, message_id, BOT_TOKEN, '❌ Acción inválida.', null)
        return new Response('OK', { status: 200 })
      }

      // Buscar la cita con su paciente y motivo
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
          ),
          motivos_consulta:motivo_id (
            nombre
          )
        `)
        .eq('id', citaId)
        .single()

      if (citaError || !cita) {
        await editMessageText(chat_id, message_id, BOT_TOKEN,
          '❌ *Error:* La cita ya no existe en el sistema.\n\nPor favor contacta a la clínica.',
          'Markdown'
        )
        return new Response('OK', { status: 200 })
      }

      // Verificar autorización por chat_id
      if ((cita.pacientes as any).telegram_chat_id !== chat_id.toString()) {
        return new Response('OK', { status: 200 })
      }

      // Verificar que la cita siga programada
      if ((cita as any).estado !== 'programada') {
        const msg = (cita as any).estado === 'cancelada'
          ? '❌ Esta cita ya fue cancelada anteriormente.'
          : '✅ Esta cita ya fue completada.'
        await editMessageText(chat_id, message_id, BOT_TOKEN,
          `${msg}\n\nPor favor contacta a la clínica si tienes dudas.`, 'Markdown'
        )
        return new Response('OK', { status: 200 })
      }

      const paciente       = cita.pacientes as any
      const nombrePaciente = `${paciente.nombre} ${paciente.apellido}`
      const motivo         = (cita as any).motivos_consulta?.nombre
      const fechaCita      = new Date((cita as any).fecha_hora)
      const fechaFormateada = fechaCita.toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const horaFormateada = fechaCita.toLocaleTimeString('es-ES', {
        hour: '2-digit', minute: '2-digit'
      })

      if (accion === 'confirmar') {
        await editMessageText(chat_id, message_id, BOT_TOKEN,
          `✅ *Cita confirmada*\n\n` +
          `Hola *${nombrePaciente}*, gracias por confirmar tu asistencia.\n\n` +
          `📅 *Fecha:* ${fechaFormateada}\n` +
          `⏰ *Hora:* ${horaFormateada}\n` +
          (motivo ? `🦷 *Motivo:* ${motivo}\n` : '') +
          `\n📍 Te esperamos en la clínica. ¡Que tengas un excelente día!`,
          'Markdown'
        )

        await supabase.from('notas_pacientes').insert({
          paciente_id: paciente.id,
          nota: `Paciente confirmó cita del ${fechaFormateada} a las ${horaFormateada} vía Telegram`
        })

      } else if (accion === 'cancelar') {
        const { error: updateError } = await supabase
          .from('citas')
          .update({ estado: 'cancelada', actualizado_en: new Date().toISOString() })
          .eq('id', citaId)

        if (updateError) {
          await editMessageText(chat_id, message_id, BOT_TOKEN,
            '❌ Ocurrió un error al cancelar la cita. Por favor intenta más tarde o contacta a la clínica.',
            null
          )
          return new Response('OK', { status: 200 })
        }

        await editMessageText(chat_id, message_id, BOT_TOKEN,
          `❌ *Cita cancelada*\n\n` +
          `Hola *${nombrePaciente}*, hemos cancelado tu cita del *${fechaFormateada}* a las *${horaFormateada}*.\n` +
          (motivo ? `🦷 *Motivo:* ${motivo}\n` : '') +
          `\nSi fue un error o deseas reagendar, por favor contacta a la clínica.`,
          'Markdown'
        )

        await supabase.from('notas_pacientes').insert({
          paciente_id: paciente.id,
          nota: `Paciente canceló cita del ${fechaFormateada} a las ${horaFormateada} vía Telegram`
        })
      }

      return new Response('OK', { status: 200 })
    }

    // ─── MENSAJES DE TEXTO (flujo de registro) ─────────────────────────────────
    const chat_id    = update.message?.chat?.id
    const text       = update.message?.text
    const first_name = update.message?.chat?.first_name

    if (!chat_id) {
      return new Response('OK', { status: 200 })
    }

    const chatIdStr = chat_id.toString()
    let state = userStates.get(chatIdStr) || { step: 'start' }

    // Comando /start
    if (text === '/start') {
      state = { step: 'awaiting_document' }
      userStates.set(chatIdStr, state)
      await sendMessage(chat_id, BOT_TOKEN,
        `*Bienvenido a Molaris Ops Asistente*\n\n` +
        `Hola ${first_name}, te ayudaremos a activar los recordatorios automáticos de tus citas.\n\n` +
        `Para comenzar, por favor ingresa tu *número de cédula*:`,
        'Markdown'
      )
      return new Response('OK', { status: 200 })
    }

    // Comando /cancel
    if (text === '/cancel') {
      userStates.delete(chatIdStr)
      await sendMessage(chat_id, BOT_TOKEN,
        `Operación cancelada.\n\nPuedes iniciar nuevamente con /start`, null
      )
      return new Response('OK', { status: 200 })
    }

    // Comando /help
    if (text === '/help') {
      await sendMessage(chat_id, BOT_TOKEN,
        `*Ayuda de Molaris Ops*\n\n` +
        `/start - Activar recordatorios de citas\n` +
        `/cancel - Cancelar operación actual\n` +
        `/help - Mostrar esta ayuda`,
        'Markdown'
      )
      return new Response('OK', { status: 200 })
    }

    // Paso 1: Esperando número de cédula
    if (state.step === 'awaiting_document') {
      const document = text?.trim()
      if (!document) {
        await sendMessage(chat_id, BOT_TOKEN, `Por favor, ingresa un número de cédula válido:`, null)
        return new Response('OK', { status: 200 })
      }

      const { data: paciente, error } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido, telegram_chat_id')
        .eq('documento_id', document)
        .single()

      if (error || !paciente) {
        await sendMessage(chat_id, BOT_TOKEN,
          `No encontramos un paciente con la cédula *${document}*.\n\n` +
          `Por favor verifica el número o contacta a recepción de la clínica.\n\n` +
          `Puedes intentar nuevamente o escribir /cancel para salir.`,
          'Markdown'
        )
        return new Response('OK', { status: 200 })
      }

      const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`

      if (paciente.telegram_chat_id && paciente.telegram_chat_id !== chatIdStr) {
        await sendMessage(chat_id, BOT_TOKEN,
          `*Atención*\n\n` +
          `Este número de cédula ya estaba registrado con otra cuenta de Telegram.\n\n` +
          `Si deseas cambiar la cuenta a este chat, por favor contacta a administración.`,
          'Markdown'
        )
        return new Response('OK', { status: 200 })
      }

      state = { step: 'confirming', paciente_id: paciente.id, paciente_nombre: nombreCompleto }
      userStates.set(chatIdStr, state)

      await sendMessage(chat_id, BOT_TOKEN,
        `¿Eres *${nombreCompleto}*?\n\nResponde *SI* para confirmar o *NO* para intentar con otra cédula.`,
        'Markdown'
      )
      return new Response('OK', { status: 200 })
    }

    // Paso 2: Confirmando identidad
    if (state.step === 'confirming') {
      const answer = text?.toLowerCase()

      if (answer === 'si') {
        const { error: updateError } = await supabase
          .from('pacientes')
          .update({ telegram_chat_id: chatIdStr })
          .eq('id', state.paciente_id)

        if (updateError) {
          await sendMessage(chat_id, BOT_TOKEN,
            `Ocurrió un error al activar los recordatorios.\n\nPor favor intenta nuevamente más tarde.`, null
          )
          userStates.delete(chatIdStr)
          return new Response('OK', { status: 200 })
        }

        userStates.delete(chatIdStr)
        await sendMessage(chat_id, BOT_TOKEN,
          `*¡Activación exitosa!*\n\n` +
          `A partir de ahora recibirás recordatorios automáticos de tus citas 24 horas antes.\n\n` +
          `Puedes cerrar esta conversación.`,
          'Markdown'
        )
      } else if (answer === 'no') {
        state = { step: 'awaiting_document' }
        userStates.set(chatIdStr, state)
        await sendMessage(chat_id, BOT_TOKEN, `Por favor, ingresa tu número de cédula nuevamente:`, null)
      } else {
        await sendMessage(chat_id, BOT_TOKEN,
          `Por favor, responde *SI* o *NO*.\n\n¿Eres *${state.paciente_nombre}*?`, 'Markdown'
        )
      }
      return new Response('OK', { status: 200 })
    }

    // Respuesta por defecto
    await sendMessage(chat_id, BOT_TOKEN,
      `Hola ${first_name}, para activar tus recordatorios escribe /start`, null
    )
    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Error:', error)
    return new Response('OK', { status: 200 }) // Siempre 200 para Telegram
  }
})

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function sendMessage(chat_id: number, token: string, text: string, parse_mode: string | null) {
  try {
    const payload: Record<string, unknown> = { chat_id, text }
    if (parse_mode) payload.parse_mode = parse_mode
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (err) {
    console.error('sendMessage error:', err)
  }
}

async function answerCallbackQuery(callbackId: string, token: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackId, text, show_alert: false })
    })
  } catch (err) {
    console.error('answerCallbackQuery error:', err)
  }
}

async function editMessageText(
  chat_id: number, message_id: number, token: string,
  text: string, parse_mode: string | null
) {
  try {
    const payload: Record<string, unknown> = { chat_id, message_id, text }
    if (parse_mode) payload.parse_mode = parse_mode
    await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (err) {
    console.error('editMessageText error:', err)
  }
}