import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

const BASE_PROMPT = `Sos el asesor virtual de Cardinal, un desarrollo inmobiliario premium ubicado en Necochea 3568, Santa Fe, Argentina.

Tu rol es responder preguntas sobre el proyecto de manera profesional, cálida y concisa. Siempre hablás en español rioplatense (vos, podés, etc).

INFORMACIÓN DEL PROYECTO:
- Nombre: Cardinal
- Dirección: Necochea 3568, Santa Fe, Argentina
- Descripción: Edificio residencial premium de 9 pisos con 18 departamentos
- Tipologías:
  * Frente: 3 dormitorios, 140 m2, con estar/comedor, dormitorio en suite, baño, cocina, balcón 2.10x7.80m, lavadero, cochera y palier privado
  * Contrafrente: 2 dormitorios, 120 m2, con estar/comedor, dormitorio en suite, baño, cocina, balcón 1.00x6.50m, lavadero, cochera y palier privado
- Cada unidad incluye cochera
- Estado: En construcción
- Financiación disponible
- Precio: a consultar (derivar a WhatsApp)

CONTACTO:
- WhatsApp: +54 9 342 508-3468
- Email: info@cardinal.com.ar
- Para precios o visitas, siempre invitá a contactar por WhatsApp

INSTRUCCIONES:
- Respondé de forma breve y clara (máximo 3-4 oraciones)
- Si te preguntan por precio, decí que los precios son a consultar y derivá a WhatsApp
- Si te preguntan algo que no sabés, invitá a contactar directamente
- No inventes información que no esté en este prompt
- Usá un tono elegante pero accesible, acorde a un proyecto premium
- Si el usuario saluda, respondé con un saludo breve y preguntá en qué podés ayudar`

async function getUnidadesInfo(): Promise<string> {
  try {
    const { data: unidades } = await supabase
      .from('unidades')
      .select('codigo, tipo, piso, m2, precio_texto, estado')
      .order('piso')

    if (!unidades || unidades.length === 0) return ''

    const TIPO_LABEL: Record<string, string> = {
      mono: 'Monoambiente', '1amb': '1 amb.', '2amb': '2 amb.',
      '3amb': '3 amb.', '4amb': '4 amb.', ph: 'PH', local: 'Local'
    }

    const disponibles = unidades.filter(u => u.estado === 'disponible')
    const reservadas  = unidades.filter(u => u.estado === 'reservado')
    const vendidas    = unidades.filter(u => u.estado === 'vendido')

    let info = `\nDISPONIBILIDAD ACTUAL (datos en tiempo real):
- Total unidades: ${unidades.length}
- Disponibles: ${disponibles.length}
- Reservadas: ${reservadas.length}
- Vendidas: ${vendidas.length}

UNIDADES DISPONIBLES:`

    if (disponibles.length === 0) {
      info += '\nNo hay unidades disponibles en este momento.'
    } else {
      disponibles.forEach(u => {
        info += `\n- Unidad ${u.codigo} | Piso ${u.piso ?? '-'} | ${TIPO_LABEL[u.tipo] ?? u.tipo} | ${u.m2 ? u.m2 + ' m2' : '-'} | ${u.precio_texto ?? 'Precio a consultar'}`
      })
    }

    return info
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    console.log('GEMINI_API_KEY present:', !!apiKey, 'length:', apiKey?.length)

    const { messages } = await req.json()

    // Obtener datos reales de unidades
    const unidadesInfo = await getUnidadesInfo()
    const systemPrompt = BASE_PROMPT + unidadesInfo

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    })

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })
    const lastMessage = messages[messages.length - 1].content
    const result = await chat.sendMessage(lastMessage)
    const text = result.response.text()

    return NextResponse.json({ message: text })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
