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
    const chat_id = update.message?.chat?.id
    const text = update.message?.text
    const first_name = update.message?.chat?.first_name

    if (!chat_id || !BOT_TOKEN) {
      return new Response('OK', { status: 200 })
    }

    const chatIdStr = chat_id.toString()
    let state = userStates.get(chatIdStr) || { step: 'start' }

    // Redirigir el callback a la función especializada
    const callbackQuery = update.callback_query
    if (callbackQuery) {
      const callbackResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/telegram-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      })
      return callbackResponse
    }

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
        `Operación cancelada.\n\nPuedes iniciar nuevamente con /start`,
        null
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

    // Paso 1: Esperando número de documento (cédula)
    if (state.step === 'awaiting_document') {
      const document = text?.trim()

      if (!document) {
        await sendMessage(chat_id, BOT_TOKEN,
          `Por favor, ingresa un número de cédula válido:`,
          null
        )
        return new Response('OK', { status: 200 })
      }

      // Buscar paciente por documento_id en tu tabla 'pacientes'
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

      // Verificar si ya tenía otro chat_id asociado
      if (paciente.telegram_chat_id && paciente.telegram_chat_id !== chatIdStr) {
        await sendMessage(chat_id, BOT_TOKEN,
          `*Atención*\n\n` +
          `Este número de cédula ya estaba registrado con otra cuenta de Telegram.\n\n` +
          `Si deseas cambiar la cuenta a este chat, por favor contacta a administración.`,
          'Markdown'
        )
        return new Response('OK', { status: 200 })
      }

      state = {
        step: 'confirming',
        paciente_id: paciente.id,
        paciente_nombre: nombreCompleto
      }
      userStates.set(chatIdStr, state)

      await sendMessage(chat_id, BOT_TOKEN,
        `¿Eres *${nombreCompleto}*?\n\n` +
        `Responde *SI* para confirmar o *NO* para intentar con otra cédula.`,
        'Markdown'
      )
      return new Response('OK', { status: 200 })
    }

    // Paso 2: Confirmando identidad
    if (state.step === 'confirming') {
      const answer = text?.toLowerCase()

      if (answer === 'si') {
        // Actualizar telegram_chat_id en tu tabla 'pacientes'
        const { error: updateError } = await supabase
          .from('pacientes')
          .update({ telegram_chat_id: chatIdStr })
          .eq('id', state.paciente_id)

        if (updateError) {
          console.error('Error updating paciente:', updateError)
          await sendMessage(chat_id, BOT_TOKEN,
            `Ocurrió un error al activar los recordatorios.\n\n` +
            `Por favor intenta nuevamente más tarde o contacta a la clínica.`,
            null
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
      }
      else if (answer === 'no') {
        state = { step: 'awaiting_document' }
        userStates.set(chatIdStr, state)

        await sendMessage(chat_id, BOT_TOKEN,
          `Por favor, ingresa tu número de cédula nuevamente:`,
          null
        )
      }
      else {
        await sendMessage(chat_id, BOT_TOKEN,
          `Por favor, responde *SI* o *NO*.\n\n` +
          `¿Eres *${state.paciente_nombre}*?`,
          'Markdown'
        )
      }
      return new Response('OK', { status: 200 })
    }

    // Respuesta por defecto
    await sendMessage(chat_id, BOT_TOKEN,
      `Hola ${first_name}, para activar tus recordatorios escribe /start`,
      null
    )

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function sendMessage(chat_id: number, token: string, text: string, parse_mode: string | null) {
  try {
    const payload: any = { chat_id, text }
    if (parse_mode) payload.parse_mode = parse_mode

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const result = await response.json()
    if (!result.ok) {
      console.error('Telegram API error:', result.description)
    }
  } catch (error) {
    console.error('Error sending message:', error)
  }
}