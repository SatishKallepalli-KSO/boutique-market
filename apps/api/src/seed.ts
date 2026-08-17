import { DEMO_STORE, DEFAULT_STORE, type Category } from '@boutique-market/shared'
import { config } from './config.js'
import { connectMongo, disconnectMongo } from './infrastructure/mongodb/connection.js'
import { ProductModel } from './infrastructure/mongodb/models.js'
import { compose } from './composition.js'

const demoProducts = [
  {
    slug: 'banarasi-silk-saree-gold',
    title: 'Banarasi silk saree — antique gold',
    description: 'Handloom Banarasi silk with zari border. Pair with a custom blouse from the studio.',
    category: 'SAREE' as Category,
    priceInPaise: 899900,
    compareAtPaise: 1099900,
    fabric: 'Banarasi silk',
    color: 'Antique gold',
    sizes: ['Free size'],
    stock: 6,
    featured: true,
    images: [{ id: '1', url: '/demo/saree-gold.svg', alt: 'Banarasi silk saree' }],
  },
  {
    slug: 'kanjeevaram-saree-maroon',
    title: 'Kanjeevaram saree — maroon temple',
    description: 'Heavy Kanjeevaram with temple border. Bridal and festive wear.',
    category: 'SAREE' as Category,
    priceInPaise: 1499900,
    compareAtPaise: null,
    fabric: 'Kanjeevaram silk',
    color: 'Maroon',
    sizes: ['Free size'],
    stock: 3,
    featured: true,
    images: [{ id: '2', url: '/demo/saree-maroon.svg', alt: 'Kanjeevaram saree' }],
  },
  {
    slug: 'georgette-saree-ivory',
    title: 'Georgette saree — ivory floral',
    description: 'Light drape for daytime functions. Easy pleating, soft fall.',
    category: 'SAREE' as Category,
    priceInPaise: 349900,
    compareAtPaise: 429900,
    fabric: 'Georgette',
    color: 'Ivory',
    sizes: ['Free size'],
    stock: 12,
    featured: true,
    images: [{ id: '3', url: '/demo/saree-ivory.svg', alt: 'Georgette saree' }],
  },
  {
    slug: 'raw-silk-blouse-32-40',
    title: 'Raw silk blouse — boat neck',
    description: 'Ready-to-wear raw silk blouse. Lined, hook-and-eye back.',
    category: 'BLOUSE' as Category,
    priceInPaise: 249900,
    compareAtPaise: null,
    fabric: 'Raw silk',
    color: 'Cream',
    sizes: ['32', '34', '36', '38', '40'],
    stock: 18,
    featured: true,
    images: [{ id: '4', url: '/demo/blouse-cream.svg', alt: 'Raw silk blouse' }],
  },
  {
    slug: 'maggam-blouse-navy',
    title: 'Maggam work blouse — navy',
    description: 'Studio maggam work on navy silk. Elbow sleeve, sweetheart neck.',
    category: 'BLOUSE' as Category,
    priceInPaise: 429900,
    compareAtPaise: null,
    fabric: 'Silk',
    color: 'Navy',
    sizes: ['32', '34', '36', '38'],
    stock: 8,
    featured: false,
    images: [{ id: '5', url: '/demo/blouse-navy.svg', alt: 'Maggam blouse' }],
  },
  {
    slug: 'festive-lehenga-rose',
    title: 'Festive lehenga — rose gold',
    description: 'Three-piece lehenga set with dupatta. Soft net, sequin spray.',
    category: 'LEHENGA' as Category,
    priceInPaise: 1899900,
    compareAtPaise: 2199900,
    fabric: 'Net',
    color: 'Rose gold',
    sizes: ['S', 'M', 'L'],
    stock: 4,
    featured: true,
    images: [{ id: '6', url: '/demo/lehenga-rose.svg', alt: 'Festive lehenga' }],
  },
  {
    slug: 'cotton-kurta-sage',
    title: 'Cotton kurta — sage',
    description: 'Everyday cotton kurta with side slits. Breathable, machine wash.',
    category: 'KURTA' as Category,
    priceInPaise: 189900,
    compareAtPaise: null,
    fabric: 'Cotton',
    color: 'Sage',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 20,
    featured: false,
    images: [{ id: '7', url: '/demo/kurta-sage.svg', alt: 'Cotton kurta' }],
  },
  {
    slug: 'organza-dupatta-gold',
    title: 'Organza dupatta — gold tissue',
    description: 'Sheer organza with tissue border. Finishes a plain kurta or blouse.',
    category: 'DUPATTA' as Category,
    priceInPaise: 129900,
    compareAtPaise: null,
    fabric: 'Organza',
    color: 'Gold',
    sizes: ['Free size'],
    stock: 15,
    featured: false,
    images: [{ id: '8', url: '/demo/dupatta-gold.svg', alt: 'Organza dupatta' }],
  },
]

function applyEnvOverrides() {
  const o = config.storeOverrides
  const base = config.seedDemo ? { ...DEMO_STORE } : { ...DEFAULT_STORE }
  return {
    ...base,
    ...(o.storeName ? { storeName: o.storeName } : {}),
    ...(o.tagline ? { tagline: o.tagline } : {}),
    ...(o.ownerName ? { ownerName: o.ownerName } : {}),
    ...(o.phone ? { phone: o.phone } : {}),
    ...(o.whatsapp ? { whatsapp: o.whatsapp } : {}),
    ...(o.email ? { email: o.email } : {}),
    ...(o.addressLine ? { addressLine: o.addressLine } : {}),
    ...(o.accentColor ? { accentColor: o.accentColor } : {}),
  }
}

export async function seedIfNeeded() {
  const { auth, stores, products } = compose()
  await auth.ensureAdmin(config.adminEmail, config.adminPassword, 'Store admin')

  const store = await stores.get()
  if (store.storeName === DEFAULT_STORE.storeName) {
    await stores.save(applyEnvOverrides())
  }

  const existing = await ProductModel.countDocuments()
  if (existing === 0 && config.seedDemo) {
    for (const product of demoProducts) {
      await products.create(product)
    }
  }
}

async function run() {
  await connectMongo(config.mongodbUri)
  await seedIfNeeded()
  await disconnectMongo()
  console.log('Seed complete')
}

if (process.argv[1]?.includes('seed')) {
  run().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
