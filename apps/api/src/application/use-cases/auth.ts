import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { ConflictError, UnauthorizedError } from '../../domain/errors.js'
import type { User } from '../../domain/entities/user.js'
import type { UserRepository } from '../../domain/repositories/user-repository.js'
import type { TokenService } from '../ports/token-service.js'

const registerSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  name: z.string().min(2).max(80),
  password: z.string().min(8).max(128),
})

const loginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1),
})

export class AuthUseCases {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: TokenService,
  ) {}

  async register(input: unknown) {
    const data = registerSchema.parse(input)
    const existing = await this.users.findByEmail(data.email)
    if (existing) {
      throw new ConflictError('An account with that email already exists')
    }
    const user = await this.users.create({
      email: data.email,
      name: data.name,
      passwordHash: await bcrypt.hash(data.password, 12),
      role: 'CUSTOMER',
    })
    return this.toAuth(user)
  }

  async login(input: unknown) {
    const data = loginSchema.parse(input)
    const user = await this.users.findByEmail(data.email)
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new UnauthorizedError('Invalid email or password')
    }
    return this.toAuth(user)
  }

  async ensureAdmin(email: string, password: string, name: string) {
    const existing = await this.users.findByEmail(email)
    if (existing) return existing
    return this.users.create({
      email,
      name,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'ADMIN',
    })
  }

  private toAuth(user: User) {
    return {
      token: this.tokens.sign({ sub: user.id, email: user.email, role: user.role }),
      user,
    }
  }
}
