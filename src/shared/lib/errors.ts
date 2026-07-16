export class AppError extends Error {
  readonly code: string

  constructor(message: string, code = 'APP_ERROR') {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }

  return fallback
}
