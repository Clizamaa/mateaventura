import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { unit, dificultad, modo } = body;

    if (!unit || !unit.nombre || !unit.keywords) {
      return NextResponse.json(
        { error: 'Datos de la unidad incompletos (requiere nombre y keywords)' },
        { status: 400 }
      );
    }

    if (!dificultad || !modo) {
      return NextResponse.json(
        { error: 'Faltan parámetros de dificultad o modo' },
        { status: 400 }
      );
    }

    const prompt = `Eres un generador de ejercicios de matemáticas para niños de 4° básico (9-10 años) en Chile.

Genera UN ejercicio sobre: ${unit.nombre}
Conceptos clave: ${unit.keywords}
Dificultad: ${dificultad}  (facil = operaciones simples, numeros pequeños | medio = operaciones con mas pasos | dificil = problemas de aplicacion o numeros grandes)
Modo: ${modo}  (libre = sin presion | contrarreloj = enunciado corto y claro | supervivencia = sin errores permitidos)

REGLAS:
- Lenguaje simple, directo, apropiado para niños de 9-10 años
- Si el modo es contrarreloj, el enunciado debe ser muy corto (max 15 palabras)
- Para dificultad facil: usa numeros pequeños y una sola operacion
- Para dificultad dificil: usa contextos de la vida cotidiana (tienda, cocina, deporte)
- Genera exactamente 4 opciones de respuesta, solo una correcta
- Las opciones incorrectas deben ser plausibles (errores típicos de niños)

Responde SOLO con este JSON, sin texto adicional:
{
  "enunciado": "texto del ejercicio",
  "opciones": ["opcion A", "opcion B", "opcion C", "opcion D"],
  "correcta": "opcion correcta exacta",
  "explicacion": "por que esta es la respuesta correcta, en lenguaje para niños"
}`;

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Using latest Sonnet model equivalent to requirements
      max_tokens: 1000,
      temperature: 0.7,
      system: "Eres un experto creador de contenido educativo de matemáticas para educación básica.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const responseText = msg.content[0].text.trim();
    
    // Extract JSON in case Claude adds markdown code blocks
    let jsonStr = responseText;
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const jsonResponse = JSON.parse(jsonStr);

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error generando ejercicio con Claude:', error);
    return NextResponse.json(
      { error: 'Error interno al generar el ejercicio' },
      { status: 500 }
    );
  }
}
