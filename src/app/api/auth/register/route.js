import { NextResponse } from 'next/server'
import { withErrorHandler, ok } from '@/lib/api-handler'
import { authService } from '@/services/auth.service'
import { registerSchema } from '@/schemas/auth.schema'

export const POST = withErrorHandler(async (request) => {
  const body = await request.json()
  const data = registerSchema.parse(body)
  const user = await authService.register(data)
  return ok(user, 'Cuenta creada exitosamente', 201)
})
