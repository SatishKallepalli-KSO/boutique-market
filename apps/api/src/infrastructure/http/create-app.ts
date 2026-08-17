import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import { ForbiddenError, UnauthorizedError } from '../../domain/errors.js'
import type { ImageStore } from '../../application/ports/image-store.js'
import { recordSandboxPayment } from '../payment/sandbox-gateway.js'
import { typeDefs } from '../graphql/schema.js'
import { resolvers } from '../graphql/resolvers.js'
import { buildContext, type Services } from '../graphql/context.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
})

export async function createApp(services: Services, images: ImageStore) {
  const apollo = new ApolloServer({ typeDefs, resolvers })
  await apollo.start()

  const app = express()
  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json({ limit: '2mb' }))

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true, service: 'boutique-market' })
  })

  app.get('/openapi.yaml', (_req, res) => {
    const here = path.dirname(fileURLToPath(import.meta.url))
    const candidates = [
      path.resolve(here, '../../../../../openapi/openapi.yaml'),
      path.resolve(here, '../../../../../../openapi/openapi.yaml'),
      path.resolve(process.env.STATIC_DIR ?? '', 'openapi.yaml'),
    ]
    const file = candidates.find((candidate) => candidate && existsSync(candidate))
    if (!file) {
      res.status(404).send('openapi.yaml not packaged')
      return
    }
    res.type('text/yaml').sendFile(file)
  })

  app.use(
    '/graphql',
    expressMiddleware(apollo, {
      context: async ({ req }) => buildContext(req, services),
    }),
  )

  app.post('/api/uploads', upload.single('file'), async (req, res) => {
    try {
      const header = req.headers.authorization
      const token = header?.startsWith('Bearer ') ? header.slice(7) : null
      if (!token) throw new UnauthorizedError()
      const payload = services.tokens.verify(token)
      const user = await services.users.findById(payload.sub)
      if (!user || user.role !== 'ADMIN') throw new ForbiddenError('Admin access required')
      if (!req.file) {
        res.status(400).json({ error: 'file is required' })
        return
      }
      const stored = await images.save(req.file.buffer, req.file.mimetype, req.file.originalname)
      res.json(stored)
    } catch (error) {
      const status = error instanceof UnauthorizedError || error instanceof ForbiddenError ? error.status : 500
      res.status(status).json({ error: error instanceof Error ? error.message : 'Upload failed' })
    }
  })

  app.get('/api/media/:id', async (req, res) => {
    const file = await images.get(req.params.id)
    if (!file) {
      res.status(404).end()
      return
    }
    res.setHeader('Content-Type', file.contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(file.buffer)
  })

  app.post('/api/pay/sandbox/complete', (req, res) => {
    const merchantOrderId = String(req.body?.merchantOrderId ?? '')
    const state = req.body?.state === 'FAILED' ? 'FAILED' : 'COMPLETED'
    if (!merchantOrderId) {
      res.status(400).json({ error: 'merchantOrderId required' })
      return
    }
    recordSandboxPayment(merchantOrderId, state)
    res.json({ ok: true, merchantOrderId, state })
  })

  const staticDir = process.env.STATIC_DIR
    ? path.resolve(process.env.STATIC_DIR)
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../web/dist')

  app.use(express.static(staticDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/graphql') || req.path.startsWith('/api') || req.path.startsWith('/healthz') || req.path.startsWith('/openapi')) {
      next()
      return
    }
    res.sendFile(path.join(staticDir, 'index.html'), (err) => {
      if (err) next()
    })
  })

  return app
}
