import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Wrapper que captura errores y devuelve respuestas consistentes.
 * @param {Function} handler
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('[API Error]', error?.message ?? error)

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Datos inválidos',
              details: error.flatten(),
            },
          },
          { status: 400 }
        )
      }

      if (error?.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Recurso no encontrado' } },
          { status: 404 }
        )
      }

      if (error?.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: { code: 'CONFLICT', message: 'Ya existe un registro con esos datos' } },
          { status: 409 }
        )
      }

      const status = error?.status ?? 500
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error?.code ?? 'INTERNAL_ERROR',
            message: error?.message ?? 'Error interno del servidor',
          },
        },
        { status }
      )
    }
  }
}

/**
 * Crea un error con código HTTP personalizado.
 * @param {string} message
 * @param {number} status
 * @param {string} code
 */
export function createError(message, status = 400, code = 'BAD_REQUEST') {
  const err = new Error(message)
  err.status = status
  err.code = code
  return err
}

/** Respuesta estándar de éxito */
export function ok(data, message = 'OK', status = 200) {
  return NextResponse.json({ success: true, data, message }, { status })
}

/** Respuesta paginada */
export function paginated(data, total, page, limit) {
  return NextResponse.json({
    success: true,
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  })
}
