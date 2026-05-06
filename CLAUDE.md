# MateAventura — Contexto del proyecto

Plataforma educativa de matemáticas para niños de 4° básico (Chile), con generación de ejercicios mediante IA. Construida con Next.js, Tailwind, Prisma y MySQL.

## Stack técnico

- Next.js (App Router, JavaScript)
- Tailwind CSS
- Prisma ORM + MySQL
- Auth.js v5 (NextAuth)
- Claude API (claude-sonnet-4-20250514) para generación de ejercicios

## Arquitectura de contenido

El contenido viene de dos fuentes combinadas:
1. **MINEDUC Chile**: Los Objetivos de Aprendizaje (OA) de 4° básico se almacenan en la BD como "configuración curricular". No son ejercicios, son los parámetros que definen qué debe saber el alumno.
2. **Claude API**: Recibe el OA + dificultad + modo de juego y genera ejercicios dinámicamente en formato JSON. Los ejercicios nunca se repiten.

## Unidades curriculares 4° básico (seeds de la BD)

### Eje: Números y operaciones
- OA1 — Leer, escribir y representar números hasta el 1.000.000 (keywords: conteo, valor posicional, escritura)
- OA2 — Comparar y ordenar números hasta el 1.000.000 (keywords: comparación, mayor, menor, ordenamiento)
- OA3 — Adición y sustracción con reagrupación hasta el 1.000.000 (keywords: suma, resta, reagrupación, llevada)
- OA4 — Multiplicación hasta 10×10 y sus propiedades (keywords: multiplicación, tablas, conmutatividad, distributiva)
- OA5 — División exacta e inexacta con divisores hasta 10 (keywords: división, cociente, resto, dividendo)
- OA6 — Fracciones: representar, comparar y ordenar fracciones simples (keywords: fracciones, numerador, denominador, equivalencia)

### Eje: Geometría
- OA7 — Identificar y clasificar figuras 2D (keywords: triángulo, cuadrado, rectángulo, círculo, polígonos, lados, vértices)
- OA8 — Identificar cuerpos geométricos 3D (keywords: cubo, esfera, cilindro, cono, pirámide, caras, aristas)
- OA9 — Calcular perímetro y estimar área (keywords: perímetro, área, unidades de medida, cm, m)

### Eje: Medición
- OA10 — Medir longitud, masa y capacidad (keywords: metro, kilogramo, litro, estimación, conversión)
- OA11 — Tiempo y dinero (keywords: reloj, horas, minutos, pesos chilenos, cambio, vuelto)

### Eje: Datos y probabilidades
- OA12 — Tablas y gráficos de barras (keywords: tabla de datos, gráfico de barras, frecuencia, categoría)

### Eje: Patrones y álgebra
- OA13 — Patrones numéricos y geométricos (keywords: secuencia, regla del patrón, serie, término)

## Schema Prisma principal

```prisma
model Subject {
  id      Int     @id @default(autoincrement())
  nombre  String
  activo  Boolean @default(true)
  grades  Grade[]
}

model Grade {
  id        Int     @id @default(autoincrement())
  nombre    String  // "4° Básico"
  orden     Int     // 4
  subjectId Int
  subject   Subject @relation(fields: [subjectId], references: [id])
  axes      Axis[]
}

model Axis {
  id      Int    @id @default(autoincrement())
  nombre  String // "Números y operaciones"
  orden   Int
  gradeId Int
  grade   Grade  @relation(fields: [gradeId], references: [id])
  units   Unit[]
}

model Unit {
  id          Int       @id @default(autoincrement())
  codigo      String    // "OA1"
  nombre      String
  descripcion String    @db.Text
  keywords    String    // para el prompt a Claude
  orden       Int
  axisId      Int
  axis        Axis      @relation(fields: [axisId], references: [id])
  sessions    Session[]
}

model Session {
  id          Int        @id @default(autoincrement())
  userId      Int
  unitIds     String     // JSON array "[1,3,5]"
  dificultad  String     // "facil" | "medio" | "dificil"
  modo        String     // "libre" | "contrarreloj" | "supervivencia" | "maraton"
  puntaje     Int        @default(0)
  correctas   Int        @default(0)
  incorrectas Int        @default(0)
  duracion    Int?       // segundos
  completada  Boolean    @default(false)
  creadaEn    DateTime   @default(now())
  user        User       @relation(fields: [userId], references: [id])
  respuestas  Respuesta[]
}

model Respuesta {
  id           Int     @id @default(autoincrement())
  sessionId    Int
  unitId       Int
  enunciado    String  @db.Text
  respCorrecta String
  respAlumno   String
  esCorrecta   Boolean
  tiempoMs     Int?
  session      Session @relation(fields: [sessionId], references: [id])
}
```

## Prompt a Claude para generar ejercicios

El endpoint `POST /api/ejercicios/generar` construye este prompt dinámicamente:

```
Eres un generador de ejercicios de matemáticas para niños de 4° básico (9-10 años) en Chile.

Genera UN ejercicio sobre: {unit.nombre}
Conceptos clave: {unit.keywords}
Dificultad: {dificultad}  (facil = operaciones simples, numeros pequeños | medio = operaciones con mas pasos | dificil = problemas de aplicacion o numeros grandes)
Modo: {modo}  (libre = sin presion | contrarreloj = enunciado corto y claro | supervivencia = sin errores permitidos)

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
}
```

## Modos de juego

- `libre` — sin límite de tiempo, retroalimentación inmediata
- `contrarreloj` — 30 segundos por ejercicio, enunciados cortos
- `supervivencia` — 3 vidas, pierde una por error
- `maraton` — 20 ejercicios seguidos, puntaje acumulado

## Dificultades

- `facil` — números pequeños, una sola operación
- `medio` — operaciones con más pasos, números medianos
- `dificil` — problemas de aplicación con contexto cotidiano

## Estado actual del proyecto

- [x] Configuración inicial Next.js + Prisma + MySQL
- [x] Schema Prisma completo
- [x] Seeds con OA MINEDUC 4° básico
- [x] Autenticación con Auth.js v5
- [x] Endpoint generación de ejercicios (Claude API)
- [x] Frontend selector de unidades y dificultad
- [ ] Lógica de sesiones y puntajes
- [ ] Panel de logros

## Variables de entorno necesarias


## Notas importantes

- Usar JavaScript (no TypeScript) según decisión anterior del proyecto
- Next.js con App Router y Turbopack (`next dev --turbo`)
- Prisma 7 requiere `output` obligatorio en el generator client
- El sistema debe escalar a futuro: 5°, 6° básico y otras asignaturas
- Diseño visual amigable para niños (ver prompts de frontend en historial)
