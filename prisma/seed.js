import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─── Datos base ───────────────────────────────────────────────────────────────

const AVATARS = [
  { nombre: 'Búho', emoji: '🦉', categoria: 'animales' },
  { nombre: 'Zorro', emoji: '🦊', categoria: 'animales' },
  { nombre: 'Panda', emoji: '🐼', categoria: 'animales' },
  { nombre: 'León', emoji: '🦁', categoria: 'animales' },
  { nombre: 'Unicornio', emoji: '🦄', categoria: 'fantasía' },
  { nombre: 'Dragón', emoji: '🐲', categoria: 'fantasía' },
  { nombre: 'Cohete', emoji: '🚀', categoria: 'objetos' },
  { nombre: 'Estrella', emoji: '⭐', categoria: 'objetos' },
  { nombre: 'Robot', emoji: '🤖', categoria: 'objetos' },
  { nombre: 'Pingüino', emoji: '🐧', categoria: 'animales' },
]

const GAME_MODES = [
  {
    nombre: 'LIBRE',
    descripcion: 'Practica a tu ritmo, sin límite de tiempo',
    configuracion: { cantidad: 10, tiempoLimitePorPregunta: null, vidas: null },
  },
  {
    nombre: 'CONTRARRELOJ',
    descripcion: '60 segundos por pregunta. ¡Piensa rápido!',
    configuracion: { cantidad: 10, tiempoLimitePorPregunta: 60, vidas: null },
  },
  {
    nombre: 'SUPERVIVENCIA',
    descripcion: '3 vidas. Cada error te acerca al fin.',
    configuracion: { cantidad: 20, tiempoLimitePorPregunta: null, vidas: 3 },
  },
  {
    nombre: 'MARATON',
    descripcion: '20 ejercicios seguidos. ¡Tú puedes!',
    configuracion: { cantidad: 20, tiempoLimitePorPregunta: null, vidas: null },
  },
]

const ACHIEVEMENTS = [
  { codigo: 'primera_sesion', nombre: '¡Primera Aventura!', descripcion: 'Completa tu primera sesión de práctica', xpRecompensa: 20, raridad: 'COMUN', criterios: { tipo: 'totalSessions', valor: 1 } },
  { codigo: 'perfecto', nombre: '¡Sin Fallos!', descripcion: 'Completa una sesión con 100% de aciertos', xpRecompensa: 50, raridad: 'RARO', criterios: { tipo: 'precision', valor: 100 } },
  { codigo: 'racha_5', nombre: '🔥 ¡En Llamas!', descripcion: 'Logra una racha de 5 respuestas correctas', xpRecompensa: 30, raridad: 'COMUN', criterios: { tipo: 'racha', valor: 5 } },
  { codigo: 'racha_10', nombre: '⚡ ¡Imparable!', descripcion: 'Logra una racha de 10 respuestas correctas', xpRecompensa: 60, raridad: 'RARO', criterios: { tipo: 'racha', valor: 10 } },
  { codigo: 'sesiones_10', nombre: '🎮 ¡Aventurero!', descripcion: 'Completa 10 sesiones de práctica', xpRecompensa: 60, raridad: 'COMUN', criterios: { tipo: 'totalSessions', valor: 10 } },
  { codigo: 'sesiones_50', nombre: '🏆 ¡Leyenda!', descripcion: 'Completa 50 sesiones de práctica', xpRecompensa: 200, raridad: 'LEGENDARIO', criterios: { tipo: 'totalSessions', valor: 50 } },
  { codigo: 'nivel_5', nombre: '⭐ ¡Supernova!', descripcion: 'Alcanza el nivel 5', xpRecompensa: 100, raridad: 'RARO', criterios: { tipo: 'nivel', valor: 5 } },
  { codigo: 'nivel_10', nombre: '🌟 ¡Gran Maestro!', descripcion: 'Alcanza el nivel 10', xpRecompensa: 300, raridad: 'EPICO', criterios: { tipo: 'nivel', valor: 10 } },
  { codigo: 'maestro_dificil', nombre: '🔥 ¡Valiente!', descripcion: 'Completa una sesión difícil con 80%+ de aciertos', xpRecompensa: 80, raridad: 'RARO', criterios: { tipo: 'dificultad_aciertos', dificultad: 'DIFICIL', valor: 80 } },
  { codigo: 'tres_estrellas', nombre: '🌟 ¡Triple Estrella!', descripcion: 'Obtén 3 estrellas en una sesión', xpRecompensa: 40, raridad: 'COMUN', criterios: { tipo: 'estrellas', valor: 3 } },
]

// ─── Ejercicios ───────────────────────────────────────────────────────────────

function makeEx(enunciado, opciones, correcta, explicacion, pista, dificultad, puntajeBase = 10, tiempo = 30) {
  return { enunciado, tipo: 'OPCION_MULTIPLE', opciones, respuestaCorrecta: correcta, explicacion, pista, dificultad, puntajeBase, tiempoEstimadoSegundos: tiempo }
}

const EJERCICIOS_SUMAS = [
  // FACIL
  makeEx('¿Cuánto es 23 + 14?', ['35', '37', '38', '40'], '37', '23 + 14: sumamos unidades 3+4=7, decenas 2+1=3. Resultado: 37', 'Suma primero las unidades: 3 + 4 = ?', 'FACIL', 10, 20),
  makeEx('¿Cuánto es 45 + 32?', ['75', '77', '78', '80'], '77', '45 + 32 = 77. Unidades: 5+2=7. Decenas: 4+3=7.', 'Suma columna por columna de derecha a izquierda', 'FACIL', 10, 20),
  makeEx('¿Cuánto es 60 - 25?', ['25', '35', '45', '15'], '35', '60 - 25 = 35. Puedes verificar: 35 + 25 = 60 ✓', 'Piensa: ¿cuánto le falta a 25 para llegar a 60?', 'FACIL', 10, 20),
  makeEx('¿Cuánto es 100 - 37?', ['53', '63', '73', '67'], '63', '100 - 37 = 63. Verificación: 63 + 37 = 100 ✓', 'Resta de derecha a izquierda, prestando si es necesario', 'FACIL', 10, 25),
  makeEx('¿Cuánto es 56 + 28?', ['74', '84', '82', '86'], '84', '56 + 28: unidades 6+8=14 (escribo 4, llevo 1). Decenas: 5+2+1=8. Resultado: 84', 'Suma las unidades primero: 6 + 8 = 14', 'FACIL', 10, 25),
  // MEDIO
  makeEx('¿Cuánto es 347 + 285?', ['622', '632', '642', '652'], '632', '347 + 285: unidades 7+5=12 (llevo 1). Decenas 4+8+1=13 (llevo 1). Centenas 3+2+1=6. Resultado: 632', 'Suma columna por columna empezando por las unidades', 'MEDIO', 15, 35),
  makeEx('¿Cuánto es 1.000 - 348?', ['652', '648', '662', '658'], '652', '1000 - 348 = 652. Verifica: 652 + 348 = 1000 ✓', 'Piensa en 999 - 348 = 651, luego suma 1', 'MEDIO', 15, 35),
  makeEx('¿Cuánto es 524 + 378?', ['892', '902', '912', '882'], '902', '524 + 378: unidades 4+8=12 (llevo 1). Decenas 2+7+1=10 (llevo 1). Centenas 5+3+1=9. Resultado: 902', 'Pon especial atención al llevar números', 'MEDIO', 15, 35),
  makeEx('¿Cuánto es 750 - 263?', ['487', '487', '477', '497'], '487', '750 - 263 = 487. Verifica: 487 + 263 = 750 ✓', 'Resta columna por columna, prestando si es necesario', 'MEDIO', 15, 40),
  // DIFICIL
  makeEx('¿Cuánto es 4.563 + 2.897?', ['7.460', '7.460', '7.460', '7.460'].map((v,i) => ['7.460', '7.360', '7.560', '7.450'][i]), '7.460', '4.563 + 2.897 = 7.460. Suma columna por columna con todos los "llevo 1"', 'Suma de derecha a izquierda: 3+7=10, llevo 1...', 'DIFICIL', 20, 50),
  makeEx('¿Cuánto es 8.201 - 3.456?', ['4.745', '4.755', '4.845', '4.645'], '4.745', '8.201 - 3.456 = 4.745. Verifica sumando: 4.745 + 3.456 = 8.201 ✓', 'Trabaja columna por columna, prestando cuando sea necesario', 'DIFICIL', 20, 55),
]

const EJERCICIOS_MULTI = [
  // FACIL
  makeEx('¿Cuánto es 6 × 7?', ['36', '42', '48', '54'], '42', '6 × 7 = 42. Puedes contar: 7, 14, 21, 28, 35, 42 (6 veces el 7)', 'Cuenta de 7 en 7, seis veces', 'FACIL', 10, 20),
  makeEx('¿Cuánto es 8 × 4?', ['24', '28', '32', '36'], '32', '8 × 4 = 32. También: 4 × 8 = 32 (la multiplicación es conmutativa)', 'Cuenta de 8 en 8: 8, 16, 24, 32', 'FACIL', 10, 20),
  makeEx('¿Cuánto es 9 × 9?', ['72', '81', '82', '89'], '81', '9 × 9 = 81. Truco: 9 × 10 = 90, luego resta 9: 90 - 9 = 81', '9 × 10 = 90. Entonces 9 × 9 = 90 - 9 = ?', 'FACIL', 10, 20),
  makeEx('¿Cuánto es 7 × 6?', ['35', '42', '36', '48'], '42', '7 × 6 = 42. ¡Es lo mismo que 6 × 7!', 'Piensa en el resultado de 6 × 7', 'FACIL', 10, 20),
  makeEx('¿Cuánto es 5 × 8?', ['30', '35', '40', '45'], '40', '5 × 8 = 40. Los múltiplos de 5 siempre terminan en 0 o 5', 'Cuenta de 5 en 5: 5, 10, 15, 20, 25, 30, 35, 40', 'FACIL', 10, 20),
  // MEDIO
  makeEx('¿Cuánto es 25 × 4?', ['90', '95', '100', '105'], '100', '25 × 4 = 100. Como 4 monedas de 25 centavos = 1 peso', '25 × 2 = 50. Entonces 25 × 4 = 50 × 2 = ?', 'MEDIO', 15, 30),
  makeEx('¿Cuánto es 36 × 3?', ['98', '108', '118', '128'], '108', '36 × 3: primero 30 × 3 = 90, luego 6 × 3 = 18. Total: 90 + 18 = 108', 'Descompón: 36 = 30 + 6. Multiplica cada parte por 3.', 'MEDIO', 15, 35),
  makeEx('¿Cuánto es 48 × 5?', ['200', '220', '240', '260'], '240', '48 × 5 = 240. Truco: 48 × 10 = 480, divido en 2: 480/2 = 240', '48 × 10 = 480. Como 5 es la mitad de 10, divide 480 en 2', 'MEDIO', 15, 35),
  makeEx('¿Cuánto es 12 × 12?', ['124', '134', '144', '154'], '144', '12 × 12 = 144. Es una de las multiplicaciones más importantes', '12 × 10 = 120 y 12 × 2 = 24. Suma los resultados.', 'MEDIO', 15, 35),
  // DIFICIL
  makeEx('¿Cuánto es 23 × 17?', ['371', '391', '381', '361'], '391', '23 × 17 = 391. Descomponiendo: 23 × 10 = 230, 23 × 7 = 161. Total: 230 + 161 = 391', 'Descompón 17 = 10 + 7 y multiplica cada parte por 23', 'DIFICIL', 20, 50),
  makeEx('¿Cuánto es 45 × 24?', ['1.000', '1.020', '1.080', '1.100'], '1.080', '45 × 24 = 1.080. Puedes hacer: 45 × 20 = 900 y 45 × 4 = 180. Total: 900 + 180 = 1.080', 'Descompón 24 = 20 + 4. Multiplica 45 por cada parte.', 'DIFICIL', 20, 55),
]

const EJERCICIOS_DIVISION = [
  // FACIL
  makeEx('¿Cuánto es 42 ÷ 6?', ['5', '6', '7', '8'], '7', '42 ÷ 6 = 7. Porque 6 × 7 = 42 ✓', 'Piensa: ¿cuántas veces cabe el 6 en 42?', 'FACIL', 10, 25),
  makeEx('¿Cuánto es 56 ÷ 8?', ['5', '6', '7', '8'], '7', '56 ÷ 8 = 7. Porque 8 × 7 = 56 ✓', '¿Qué número multiplicado por 8 da 56?', 'FACIL', 10, 25),
  makeEx('¿Cuánto es 81 ÷ 9?', ['7', '8', '9', '10'], '9', '81 ÷ 9 = 9. Porque 9 × 9 = 81 ✓', '¿Cuántas veces cabe el 9 en 81?', 'FACIL', 10, 25),
  makeEx('¿Cuánto es 64 ÷ 8?', ['6', '7', '8', '9'], '8', '64 ÷ 8 = 8. Porque 8 × 8 = 64 ✓', 'Piensa en la tabla del 8', 'FACIL', 10, 25),
  makeEx('¿Cuánto es la mitad de 250?', ['100', '115', '125', '150'], '125', 'La mitad de 250 = 250 ÷ 2 = 125', 'La mitad significa dividir en 2 partes iguales', 'FACIL', 10, 20),
  // MEDIO
  makeEx('¿Cuánto es 124 ÷ 4?', ['30', '31', '32', '41'], '31', '124 ÷ 4: divido 12 ÷ 4 = 3, y 4 ÷ 4 = 1. Resultado: 31', 'Divide el 12 de las decenas primero: 12 ÷ 4 = ?', 'MEDIO', 15, 35),
  makeEx('¿Cuánto es 225 ÷ 5?', ['40', '45', '55', '35'], '45', '225 ÷ 5 = 45. Porque 5 × 45 = 225 ✓', 'Divide 200 ÷ 5 = 40 y 25 ÷ 5 = 5. Suma los resultados.', 'MEDIO', 15, 40),
  makeEx('¿Cuánto es 360 ÷ 6?', ['50', '55', '60', '70'], '60', '360 ÷ 6 = 60. Porque 6 × 60 = 360 ✓', 'Piensa: 36 ÷ 6 = 6, entonces 360 ÷ 6 = 60', 'MEDIO', 15, 35),
  // DIFICIL
  makeEx('¿Cuánto es 144 ÷ 12?', ['10', '11', '12', '13'], '12', '144 ÷ 12 = 12. Porque 12 × 12 = 144 ✓', '¿Qué número × 12 da 144? ¡Es un cuadrado perfecto!', 'DIFICIL', 20, 45),
  makeEx('¿Cuánto es 336 ÷ 8?', ['32', '38', '42', '48'], '42', '336 ÷ 8 = 42. Porque 8 × 42 = 336 ✓', 'Divide 320 ÷ 8 = 40 y 16 ÷ 8 = 2. Total: 42', 'DIFICIL', 20, 50),
]

const EJERCICIOS_FRACCIONES = [
  // FACIL
  makeEx('Una pizza se divide en 8 trozos y comes 3. ¿Qué fracción comiste?', ['3/5', '5/8', '3/8', '8/3'], '3/8', 'Comiste 3 trozos de 8 posibles = 3/8. Numerador: partes comidas. Denominador: partes totales.', 'La fracción es: partes comidas / partes totales', 'FACIL', 10, 25),
  makeEx('¿Cuál fracción es igual a la mitad?', ['1/3', '2/5', '1/2', '3/4'], '1/2', 'La mitad siempre se escribe como 1/2. Significa 1 parte de 2 totales.', 'La mitad divide algo en 2 partes iguales', 'FACIL', 10, 20),
  makeEx('¿Cuál es mayor: 1/4 o 1/2?', ['1/4', '1/2', 'Son iguales', 'No se puede comparar'], '1/2', '1/2 > 1/4. Con el mismo numerador (1), la fracción con menor denominador es mayor.', 'Con el mismo numerador, el denominador más pequeño da la fracción más grande', 'FACIL', 10, 25),
  makeEx('¿Qué fracción representa 2 de 5 partes?', ['2/5', '5/2', '3/5', '2/3'], '2/5', '2 partes de 5 totales = 2/5. El numerador (arriba) son las partes que tomamos.', 'Partes tomadas arriba, partes totales abajo', 'FACIL', 10, 20),
  // MEDIO
  makeEx('¿Cuánto es 1/2 + 1/4?', ['2/6', '3/4', '1/6', '2/4'], '3/4', '1/2 + 1/4: convierto 1/2 = 2/4. Entonces 2/4 + 1/4 = 3/4', 'Convierte 1/2 a cuartos: 1/2 = 2/4', 'MEDIO', 15, 40),
  makeEx('¿Cuánto es 3/4 - 1/4?', ['2/4', '1/2', '3/8', '4/8'], '2/4', '3/4 - 1/4 = 2/4. Con igual denominador, solo resto los numeradores.', 'Cuando los denominadores son iguales, solo resta los numeradores', 'MEDIO', 15, 35),
  makeEx('¿Cuál es equivalente a 2/4?', ['1/4', '3/4', '1/2', '2/3'], '1/2', '2/4 = 1/2. Simplificamos dividiendo numerador y denominador por 2: 2÷2=1 y 4÷2=2.', 'Divide numerador y denominador por el mismo número', 'MEDIO', 15, 35),
  makeEx('Si tengo 3/5 de 20 manzanas, ¿cuántas manzanas tengo?', ['8', '10', '12', '15'], '12', '3/5 de 20 = (20 ÷ 5) × 3 = 4 × 3 = 12 manzanas', 'Primero divide 20 entre el denominador, luego multiplica por el numerador', 'MEDIO', 15, 40),
  // DIFICIL
  makeEx('¿Cuánto es 2/3 + 1/4?', ['3/7', '11/12', '3/12', '8/12'], '11/12', '2/3 + 1/4: busco denominador común (12). 2/3 = 8/12, 1/4 = 3/12. Suma: 11/12', 'Busca el mínimo común múltiplo de 3 y 4', 'DIFICIL', 20, 55),
  makeEx('¿Cuánto es 5/6 - 1/3?', ['4/3', '1/2', '4/6', '3/6'], '1/2', '5/6 - 1/3: convierto 1/3 = 2/6. Entonces 5/6 - 2/6 = 3/6 = 1/2', 'Convierte 1/3 a sextos para poder restar', 'DIFICIL', 20, 50),
]

const EJERCICIOS_GEOMETRIA = [
  // FACIL
  makeEx('¿Cuántos lados tiene un triángulo?', ['2', '3', '4', '5'], '3', 'Un triángulo tiene 3 lados y 3 ángulos. "Tri" significa tres.', '"Tri" significa tres', 'FACIL', 10, 15),
  makeEx('¿Cómo se llama la figura con 4 lados iguales y 4 ángulos rectos?', ['Rectángulo', 'Rombo', 'Cuadrado', 'Trapecio'], 'Cuadrado', 'Un cuadrado tiene 4 lados iguales y 4 ángulos de 90°.', 'Todos sus lados son iguales y sus ángulos son rectos (90°)', 'FACIL', 10, 20),
  makeEx('¿Cuántos lados tiene un hexágono?', ['4', '5', '6', '8'], '6', 'Un hexágono tiene 6 lados. "Hexa" significa seis en griego.', '"Hexa" significa seis', 'FACIL', 10, 15),
  makeEx('¿Qué figura tiene exactamente 0 lados?', ['Triángulo', 'Cuadrado', 'Círculo', 'Pentágono'], 'Círculo', 'El círculo no tiene lados rectos, es una curva cerrada perfecta.', 'Piensa en una figura completamente redonda', 'FACIL', 10, 15),
  // MEDIO
  makeEx('Un rectángulo mide 8 cm de largo y 5 cm de ancho. ¿Cuál es su perímetro?', ['13 cm', '26 cm', '40 cm', '24 cm'], '26 cm', 'Perímetro = 2 × (largo + ancho) = 2 × (8+5) = 2 × 13 = 26 cm', 'El perímetro es la suma de todos los lados. Un rectángulo tiene 2 largos y 2 anchos.', 'MEDIO', 15, 40),
  makeEx('¿Cuál es el perímetro de un cuadrado con lado de 7 cm?', ['14 cm', '21 cm', '28 cm', '49 cm'], '28 cm', 'Perímetro del cuadrado = 4 × lado = 4 × 7 = 28 cm', 'El cuadrado tiene 4 lados iguales', 'MEDIO', 15, 35),
  makeEx('¿Cuál es el área de un rectángulo de 6 cm × 4 cm?', ['10 cm²', '20 cm²', '24 cm²', '28 cm²'], '24 cm²', 'Área = largo × ancho = 6 × 4 = 24 cm²', 'El área del rectángulo es largo × ancho', 'MEDIO', 15, 40),
  makeEx('Un triángulo tiene lados de 5 cm, 7 cm y 9 cm. ¿Cuál es su perímetro?', ['16 cm', '19 cm', '21 cm', '25 cm'], '21 cm', 'Perímetro del triángulo = suma de todos sus lados = 5 + 7 + 9 = 21 cm', 'Suma todos los lados del triángulo', 'MEDIO', 15, 35),
  // DIFICIL
  makeEx('¿Cuál es el área de un cuadrado con lado de 9 cm?', ['36 cm²', '72 cm²', '81 cm²', '18 cm²'], '81 cm²', 'Área del cuadrado = lado × lado = 9 × 9 = 81 cm²', 'El área del cuadrado es lado al cuadrado', 'DIFICIL', 20, 40),
  makeEx('Si el área de un rectángulo es 48 cm² y su ancho es 6 cm, ¿cuál es su largo?', ['6 cm', '7 cm', '8 cm', '9 cm'], '8 cm', 'Área = largo × ancho → 48 = largo × 6 → largo = 48 ÷ 6 = 8 cm', 'Si Área = largo × ancho, entonces largo = Área ÷ ancho', 'DIFICIL', 20, 45),
  makeEx('El perímetro de un cuadrado es 36 cm. ¿Cuánto mide cada lado?', ['6 cm', '7 cm', '8 cm', '9 cm'], '9 cm', 'Perímetro = 4 × lado → 36 = 4 × lado → lado = 36 ÷ 4 = 9 cm', 'Si el perímetro = 4 × lado, entonces lado = perímetro ÷ 4', 'DIFICIL', 20, 45),
]

// ─── Función principal ────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed de MateAventura...\n')

  // Avatares
  console.log('📸 Creando avatares...')
  await prisma.avatar.deleteMany()
  const avatarRecords = await Promise.all(AVATARS.map((a) => prisma.avatar.create({ data: a })))
  console.log(`   ✓ ${avatarRecords.length} avatares creados`)

  // Modos de juego
  console.log('🎮 Creando modos de juego...')
  await prisma.gameMode.deleteMany()
  const gameModeRecords = await Promise.all(GAME_MODES.map((m) => prisma.gameMode.create({ data: m })))
  console.log(`   ✓ ${gameModeRecords.length} modos de juego creados`)

  // Logros
  console.log('🏆 Creando logros...')
  await prisma.achievement.deleteMany()
  const achievementRecords = await Promise.all(ACHIEVEMENTS.map((a) => prisma.achievement.create({ data: a })))
  console.log(`   ✓ ${achievementRecords.length} logros creados`)

  // Asignatura
  console.log('📚 Creando asignatura Matemáticas...')
  await prisma.subject.deleteMany()
  const subject = await prisma.subject.create({
    data: { nombre: 'Matemáticas', slug: 'matematicas', descripcion: 'Matemáticas para la educación básica', icono: '🧮', color: '#3B82F6' },
  })

  // Grado
  console.log('🎓 Creando grado 4° Básico...')
  await prisma.grade.deleteMany()
  const grade = await prisma.grade.create({
    data: { nombre: '4° Básico', nivel: 4, descripcion: 'Cuarto año de educación básica (9-10 años)' },
  })

  // Libro
  console.log('📖 Creando libro de Matemáticas 4°...')
  await prisma.book.deleteMany()
  const book = await prisma.book.create({
    data: {
      titulo: 'Matemáticas 4° Básico',
      descripcion: 'Libro de ejercicios de matemáticas para 4° básico',
      subjectId: subject.id,
      gradeId: grade.id,
      editorial: 'MateAventura',
      anio: 2024,
    },
  })

  // Unidades y ejercicios
  console.log('📝 Creando unidades y ejercicios...')
  await prisma.unit.deleteMany()
  await prisma.exercise.deleteMany()

  const unitsData = [
    // Números y operaciones
    { titulo: 'OA1 — Números hasta el 1.000.000', numero: 1, descripcion: 'conteo, valor posicional, escritura', objetivos: ['Leer, escribir y representar números hasta el 1.000.000'], exercises: [] },
    { titulo: 'OA2 — Comparar y ordenar', numero: 2, descripcion: 'comparación, mayor, menor, ordenamiento', objetivos: ['Comparar y ordenar números hasta el 1.000.000'], exercises: [] },
    { titulo: 'OA3 — Adición y sustracción', numero: 3, descripcion: 'suma, resta, reagrupación, llevada', objetivos: ['Adición y sustracción con reagrupación hasta el 1.000.000'], exercises: EJERCICIOS_SUMAS },
    { titulo: 'OA4 — Multiplicación', numero: 4, descripcion: 'multiplicación, tablas, conmutatividad, distributiva', objetivos: ['Multiplicación hasta 10×10 y sus propiedades'], exercises: EJERCICIOS_MULTI },
    { titulo: 'OA5 — División', numero: 5, descripcion: 'división, cociente, resto, dividendo', objetivos: ['División exacta e inexacta con divisores hasta 10'], exercises: EJERCICIOS_DIVISION },
    { titulo: 'OA6 — Fracciones', numero: 6, descripcion: 'fracciones, numerador, denominador, equivalencia', objetivos: ['Fracciones: representar, comparar y ordenar fracciones simples'], exercises: EJERCICIOS_FRACCIONES },
    // Geometría
    { titulo: 'OA7 — Figuras 2D', numero: 7, descripcion: 'triángulo, cuadrado, rectángulo, círculo, polígonos, lados, vértices', objetivos: ['Identificar y clasificar figuras 2D'], exercises: [] },
    { titulo: 'OA8 — Cuerpos 3D', numero: 8, descripcion: 'cubo, esfera, cilindro, cono, pirámide, caras, aristas', objetivos: ['Identificar cuerpos geométricos 3D'], exercises: [] },
    { titulo: 'OA9 — Perímetro y área', numero: 9, descripcion: 'perímetro, área, unidades de medida, cm, m', objetivos: ['Calcular perímetro y estimar área'], exercises: EJERCICIOS_GEOMETRIA },
    // Medición
    { titulo: 'OA10 — Longitud, masa y capacidad', numero: 10, descripcion: 'metro, kilogramo, litro, estimación, conversión', objetivos: ['Medir longitud, masa y capacidad'], exercises: [] },
    { titulo: 'OA11 — Tiempo y dinero', numero: 11, descripcion: 'reloj, horas, minutos, pesos chilenos, cambio, vuelto', objetivos: ['Tiempo y dinero'], exercises: [] },
    // Datos y probabilidades
    { titulo: 'OA12 — Tablas y gráficos', numero: 12, descripcion: 'tabla de datos, gráfico de barras, frecuencia, categoría', objetivos: ['Tablas y gráficos de barras'], exercises: [] },
    // Patrones y álgebra
    { titulo: 'OA13 — Patrones', numero: 13, descripcion: 'secuencia, regla del patrón, serie, término', objetivos: ['Patrones numéricos y geométricos'], exercises: [] },
  ]

  let totalExercises = 0
  for (const [i, unitData] of unitsData.entries()) {
    const { exercises, ...unitFields } = unitData
    const unit = await prisma.unit.create({
      data: { ...unitFields, bookId: book.id, orden: i + 1 },
    })

    for (const ex of exercises) {
      await prisma.exercise.create({ data: { ...ex, unitId: unit.id } })
      totalExercises++
    }
    console.log(`   ✓ Unidad "${unitData.titulo}": ${exercises.length} ejercicios`)
  }
  console.log(`   Total: ${totalExercises} ejercicios creados`)

  // Usuario admin
  console.log('👤 Creando usuario admin...')
  await prisma.user.deleteMany()
  const adminAvatar = avatarRecords[0]
  await prisma.user.create({
    data: {
      email: 'admin@mateaventura.cl',
      username: 'admin',
      passwordHash: await bcrypt.hash('admin1234', 12),
      nombre: 'Admin',
      role: 'ADMIN',
      avatarId: adminAvatar.id,
    },
  })

  // Usuario demo alumno
  await prisma.user.create({
    data: {
      email: 'sofia@mateaventura.cl',
      username: 'sofia',
      passwordHash: await bcrypt.hash('1234', 12),
      nombre: 'Sofía',
      apellido: 'González',
      role: 'ALUMNO',
      xp: 450,
      nivel: 3,
      racha: 5,
      avatarId: adminAvatar.id,
    },
  })

  await prisma.user.create({
    data: {
      email: 'demo@mateaventura.cl',
      username: 'demo',
      passwordHash: await bcrypt.hash('1234', 12),
      nombre: 'Aventurero',
      role: 'ALUMNO',
      avatarId: avatarRecords[7].id,
    },
  })

  console.log('   ✓ 3 usuarios creados (admin / sofia / demo - contraseña: 1234)')

  console.log('\n✅ Seed completado exitosamente!')
  console.log('\n📋 Resumen:')
  console.log(`   • ${avatarRecords.length} avatares`)
  console.log(`   • ${gameModeRecords.length} modos de juego`)
  console.log(`   • ${achievementRecords.length} logros`)
  console.log(`   • 1 asignatura, 1 grado, 1 libro`)
  console.log(`   • 5 unidades, ${totalExercises} ejercicios`)
  console.log(`   • 3 usuarios de prueba`)
  console.log('\n🚀 ¡Listo para jugar! Accede a http://localhost:3000')
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
