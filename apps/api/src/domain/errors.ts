export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status = 400,
  ) {
    super(message)
    this.name = 'DomainError'
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string) {
    super(`${entity} not found`, 'NOT_FOUND', 404)
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Please sign in to continue') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'You do not have permission to do that') {
    super(message, 'FORBIDDEN', 403)
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}
