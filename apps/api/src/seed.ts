import { DEMO_STORE, DEFAULT_STORE, type Category } from '@boutique-market/shared'
import { config } from './config.js'
import { connectMongo, disconnectMongo } from './infrastructure/mongodb/connection.js'
import { compose } from './composition.js'

const img = (file: string, alt: string, extra: string[] = []) => [
  { id: file, url: `/demo/${file}`, alt },
  ...extra.map((name) => ({ id: name, url: `/demo/${name}`, alt })),
]

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
    images: img('saree-gold.jpg', 'Banarasi silk saree', ['saree-red.jpg']),
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
    images: img('saree-maroon.jpg', 'Kanjeevaram saree', ['saree-gold.jpg']),
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
    images: img('saree-ivory.jpg', 'Georgette saree'),
  },
  {
    slug: 'silk-saree-crimson',
    title: 'Silk saree — crimson zari',
    description: 'Rich crimson silk with gold zari pallu. Ready for festive evenings.',
    category: 'SAREE' as Category,
    priceInPaise: 649900,
    compareAtPaise: null,
    fabric: 'Silk',
    color: 'Crimson',
    sizes: ['Free size'],
    stock: 7,
    featured: false,
    images: img('saree-red.jpg', 'Crimson silk saree', ['saree-maroon.jpg']),
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
    images: img('blouse-cream.jpg', 'Raw silk blouse'),
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
    images: img('blouse-navy.jpg', 'Maggam blouse', ['blouse-cream.jpg']),
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
    images: img('lehenga-rose.jpg', 'Festive lehenga', ['lehenga-red.jpg']),
  },
  {
    slug: 'bridal-lehenga-crimson',
    title: 'Bridal lehenga — crimson',
    description: 'Bridal consultation piece. Heavy work, dupatta, and fitted choli.',
    category: 'LEHENGA' as Category,
    priceInPaise: 2499900,
    compareAtPaise: null,
    fabric: 'Silk + net',
    color: 'Crimson',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 2,
    featured: true,
    images: img('lehenga-bridal.jpg', 'Bridal lehenga', ['gallery-bridal.jpg', 'lehenga-red.jpg']),
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
    images: img('kurta-sage.jpg', 'Cotton kurta'),
  },
  {
    slug: 'linen-kurta-ivory',
    title: 'Linen kurta — ivory',
    description: 'Relaxed ivory linen kurta. Workdays, travel, and temple visits.',
    category: 'KURTA' as Category,
    priceInPaise: 219900,
    compareAtPaise: 249900,
    fabric: 'Linen',
    color: 'Ivory',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 14,
    featured: true,
    images: img('kurta-ivory.jpg', 'Ivory linen kurta', ['kurta-sage.jpg']),
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
    images: img('dupatta-gold.jpg', 'Organza dupatta'),
  },
  {
    slug: 'temple-jhumkas-gold',
    title: 'Temple jhumkas — antique gold',
    description: 'Statement jhumkas to finish a silk saree or blouse look.',
    category: 'ACCESSORY' as Category,
    priceInPaise: 249900,
    compareAtPaise: 299900,
    fabric: 'Gold-plated brass',
    color: 'Antique gold',
    sizes: ['One size'],
    stock: 11,
    featured: true,
    images: img('accessory-gold.jpg', 'Temple jhumkas'),
  },
  {
    slug: 'festive-kids-set',
    title: 'Festive kids set — silk',
    description: 'Little festive set for family functions. Soft lining, neat finish.',
    category: 'ACCESSORY' as Category,
    priceInPaise: 329900,
    compareAtPaise: null,
    fabric: 'Silk',
    color: 'Festive mix',
    sizes: ['2-3Y', '4-5Y', '6-7Y'],
    stock: 9,
    featured: false,
    images: img('accessory-festive.jpg', 'Festive kids set'),
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
  await auth.ensureCustomer('customer@example.com', 'ChangeMe!shop', 'Demo shopper')

  const store = await stores.get()
  if (store.storeName === DEFAULT_STORE.storeName || !store.logoUrl) {
    await stores.save(applyEnvOverrides())
  }

  if (!config.seedDemo) return

  for (const product of demoProducts) {
    const existing = await products.findBySlug(product.slug)
    if (existing) {
      await products.update(existing.id, {
        title: product.title,
        description: product.description,
        category: product.category,
        priceInPaise: product.priceInPaise,
        compareAtPaise: product.compareAtPaise,
        fabric: product.fabric,
        color: product.color,
        sizes: product.sizes,
        featured: product.featured,
        images: product.images,
      })
    } else {
      await products.create(product)
    }
  }
}

async function run() {
  if (!config.useMemoryDb) await connectMongo(config.mongodbUri)
  await seedIfNeeded()
  if (!config.useMemoryDb) await disconnectMongo()
  console.log('Seed complete')
}

if (process.argv[1]?.includes('seed')) {
  run().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
