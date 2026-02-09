import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'dermocosmetique' },
      update: {},
      create: { name: 'Dermocosmétique', slug: 'dermocosmetique', description: 'Soins dermatologiques', isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'hygiene' },
      update: {},
      create: { name: 'Hygiène', slug: 'hygiene', description: 'Produits d\'hygiène', isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'bebe-maman' },
      update: {},
      create: { name: 'Bébé & Maman', slug: 'bebe-maman', description: 'Produits bébé', isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'complements' },
      update: {},
      create: { name: 'Compléments', slug: 'complements', description: 'Compléments alimentaires', isActive: true },
    }),
  ])
  console.log('✅ Categories created')

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'la-roche-posay' },
      update: {},
      create: { name: 'La Roche-Posay', slug: 'la-roche-posay', isActive: true },
    }),
    prisma.brand.upsert({
      where: { slug: 'avene' },
      update: {},
      create: { name: 'Avène', slug: 'avene', isActive: true },
    }),
    prisma.brand.upsert({
      where: { slug: 'bioderma' },
      update: {},
      create: { name: 'Bioderma', slug: 'bioderma', isActive: true },
    }),
    prisma.brand.upsert({
      where: { slug: 'vichy' },
      update: {},
      create: { name: 'Vichy', slug: 'vichy', isActive: true },
    }),
    prisma.brand.upsert({
      where: { slug: 'mustela' },
      update: {},
      create: { name: 'Mustela', slug: 'mustela', isActive: true },
    }),
  ])
  console.log('✅ Brands created')

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'LP-001' },
      update: {},
      create: {
        sku: 'LP-001',
        name: 'Effaclar Gel Moussant Purifiant 400ml',
        slug: 'effaclar-gel-moussant-400ml',
        description: 'Gel moussant purifiant pour peaux grasses et sensibles',
        basePrice: 125.50,
        stockQuantity: 45,
        packSize: 12,
        moq: 12,
        categoryId: categories[0].id,
        brandId: brands[0].id,
        unit: 'UNIT',
        vatRate: 0.20,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LP-002' },
      update: {},
      create: {
        sku: 'LP-002',
        name: 'Cicaplast Baume B5+ 100ml',
        slug: 'cicaplast-baume-b5-100ml',
        description: 'Baume réparateur apaisant',
        basePrice: 156.00,
        promoPrice: 140.40,
        stockQuantity: 32,
        packSize: 6,
        moq: 6,
        categoryId: categories[0].id,
        brandId: brands[0].id,
        unit: 'UNIT',
        vatRate: 0.20,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'AV-001' },
      update: {},
      create: {
        sku: 'AV-001',
        name: 'Eau Thermale Avène 300ml',
        slug: 'eau-thermale-avene-300ml',
        description: 'Eau thermale apaisante',
        basePrice: 89.00,
        stockQuantity: 120,
        packSize: 12,
        moq: 12,
        categoryId: categories[0].id,
        brandId: brands[1].id,
        unit: 'UNIT',
        vatRate: 0.20,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'BI-001' },
      update: {},
      create: {
        sku: 'BI-001',
        name: 'Sensibio H2O 500ml',
        slug: 'sensibio-h2o-500ml',
        description: 'Eau micellaire démaquillante',
        basePrice: 145.00,
        stockQuantity: 85,
        packSize: 12,
        moq: 12,
        categoryId: categories[1].id,
        brandId: brands[2].id,
        unit: 'UNIT',
        vatRate: 0.20,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'MU-001' },
      update: {},
      create: {
        sku: 'MU-001',
        name: 'Hydra Bébé Crème Visage 40ml',
        slug: 'hydra-bebe-creme-visage-40ml',
        description: 'Crème hydratante visage bébé',
        basePrice: 98.50,
        promoPrice: 88.65,
        stockQuantity: 67,
        packSize: 12,
        moq: 12,
        categoryId: categories[2].id,
        brandId: brands[4].id,
        unit: 'UNIT',
        vatRate: 0.20,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'VI-001' },
      update: {},
      create: {
        sku: 'VI-001',
        name: 'Minéral 89 50ml',
        slug: 'mineral-89-50ml',
        description: 'Booster d\'hydratation',
        basePrice: 235.00,
        stockQuantity: 28,
        packSize: 6,
        moq: 6,
        categoryId: categories[0].id,
        brandId: brands[3].id,
        unit: 'UNIT',
        vatRate: 0.20,
        isActive: true,
      },
    }),
  ])
  console.log('✅ Products created')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@deuxapara.ma' },
    update: {},
    create: {
      email: 'admin@deuxapara.ma',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create demo company (approved)
  const demoCompany = await prisma.company.upsert({
    where: { ice: '001234567890123' },
    update: {},
    create: {
      name: 'Pharmacie Centrale Casablanca',
      ice: '001234567890123',
      ifField: '12345678',
      rc: '123456',
      address: '123 Boulevard Mohammed V',
      city: 'Casablanca',
      phone: '+212 522 123 456',
      email: 'contact@pharmaciecentrale.ma',
      isApproved: true,
      approvalStatus: 'APPROVED',
      paymentTerms: 'TRANSFER_30',
    },
  })

  // Create default address for demo company
  await prisma.address.create({
    data: {
      name: 'Pharmacie Principale',
      address: '123 Boulevard Mohammed V',
      city: 'Casablanca',
      postalCode: '20000',
      isDefault: true,
      isBilling: true,
      isShipping: true,
      companyId: demoCompany.id,
    },
  })

  // Create demo user
  const userPassword = await bcrypt.hash('user123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'pharmacien@pharmaciecentrale.ma' },
    update: {},
    create: {
      email: 'pharmacien@pharmaciecentrale.ma',
      password: userPassword,
      firstName: 'Karim',
      lastName: 'Benali',
      phone: '+212 612 345 678',
      role: 'CLIENT_PRO',
      isActive: true,
      companyId: demoCompany.id,
    },
  })
  console.log('✅ Demo user created:', demoUser.email)

  // Create cart for demo user
  const cart = await prisma.cart.create({
    data: {
      companyId: demoCompany.id,
      userId: demoUser.id,
    },
  })

  // Add items to cart
  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: products[0].id,
      quantity: 24,
    },
  })

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: products[2].id,
      quantity: 36,
    },
  })
  console.log('✅ Demo cart created')

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'CMD-2401-1001',
      companyId: demoCompany.id,
      userId: demoUser.id,
      status: 'DELIVERED',
      subtotal: 15420,
      vatAmount: 3084,
      total: 18504,
      paymentTerms: 'TRANSFER_30',
      paymentStatus: 'PAID',
      shippingAddress: {
        name: 'Pharmacie Principale',
        address: '123 Boulevard Mohammed V',
        city: 'Casablanca',
        postalCode: '20000',
        country: 'Maroc',
      },
      items: {
        create: [
          {
            productId: products[0].id,
            sku: products[0].sku,
            name: products[0].name,
            quantity: 24,
            unitPrice: 125.50,
            vatRate: 0.20,
            totalPrice: 3614.40,
          },
          {
            productId: products[2].id,
            sku: products[2].sku,
            name: products[2].name,
            quantity: 36,
            unitPrice: 89.00,
            vatRate: 0.20,
            totalPrice: 3844.80,
          },
        ],
      },
    },
  })

  // Create status history for order1
  await prisma.orderStatusHistory.createMany({
    data: [
      { orderId: order1.id, status: 'CREATED', note: 'Commande créée' },
      { orderId: order1.id, status: 'CONFIRMED', note: 'Commande confirmée' },
      { orderId: order1.id, status: 'PREPARING', note: 'En préparation' },
      { orderId: order1.id, status: 'SHIPPED', note: 'Expédiée' },
      { orderId: order1.id, status: 'DELIVERED', note: 'Livrée' },
    ],
  })

  // Create invoice for order1
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'FAC-2024-0101',
      orderId: order1.id,
      companyId: demoCompany.id,
      subtotal: 15420,
      vatAmount: 3084,
      total: 18504,
      status: 'PAID',
      dueDate: new Date('2024-02-15'),
      paidAt: new Date('2024-01-20'),
    },
  })

  // Create pending order
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'CMD-2401-1002',
      companyId: demoCompany.id,
      userId: demoUser.id,
      status: 'PREPARING',
      subtotal: 8750,
      vatAmount: 1750,
      total: 10500,
      paymentTerms: 'TRANSFER_30',
      paymentStatus: 'PENDING',
      shippingAddress: {
        name: 'Pharmacie Principale',
        address: '123 Boulevard Mohammed V',
        city: 'Casablanca',
        postalCode: '20000',
        country: 'Maroc',
      },
      items: {
        create: [
          {
            productId: products[3].id,
            sku: products[3].sku,
            name: products[3].name,
            quantity: 12,
            unitPrice: 145.00,
            vatRate: 0.20,
            totalPrice: 2088.00,
          },
        ],
      },
    },
  })

  await prisma.orderStatusHistory.createMany({
    data: [
      { orderId: order2.id, status: 'CREATED', note: 'Commande créée' },
      { orderId: order2.id, status: 'CONFIRMED', note: 'Commande confirmée' },
      { orderId: order2.id, status: 'PREPARING', note: 'En préparation' },
    ],
  })
  console.log('✅ Sample orders created')

  console.log('')
  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('Login credentials:')
  console.log('  Admin: admin@deuxapara.ma / admin123')
  console.log('  User:  pharmacien@pharmaciecentrale.ma / user123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
