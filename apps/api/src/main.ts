import { config } from './config.js'
import { compose } from './composition.js'
import { connectMongo } from './infrastructure/mongodb/connection.js'
import { createApp } from './infrastructure/http/create-app.js'
import { seedIfNeeded } from './seed.js'

async function start() {
  if (config.useMemoryDb) {
    console.log('No MONGODB_URI — using in-memory store (data resets on sleep). Set Atlas to persist.')
  } else {
    await connectMongo(config.mongodbUri)
  }
  await seedIfNeeded()
  const { services, images } = compose()
  const app = await createApp(services, images)
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`boutique-market api on :${config.port}  graphql /graphql`)
  })
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
