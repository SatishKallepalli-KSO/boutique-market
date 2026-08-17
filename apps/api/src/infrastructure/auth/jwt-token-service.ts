import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../../domain/errors.js'
import type { TokenPayload, TokenService } from '../../application/ports/token-service.js'
import { config } from '../../config.js'

export class JwtTokenService implements TokenService {
  sign(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '14d' })
  }

  verify(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload
    } catch {
      throw new UnauthorizedError('Session expired. Please sign in again.')
    }
  }
}
