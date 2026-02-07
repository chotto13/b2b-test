import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
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

  // Create demo company
  const demoCompany = await prisma.company.upsert({
    where: { id: 'demo-company-1' },
    update: {},
    create: {
      id: 'demo-company-1',
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
  console.log('✅ Demo company created:', demoCompany.name)

  // Create demo user
  const userPassword = await bcrypt.hash('user123', 10)
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

  // Create categories
  const categories = [
    { nameFr: 'Dermocosmétique', slug: 'dermocosmetique', descriptionFr: 'Soins dermatologiques et cosmétiques' },
    { nameFr: 'Hygiène', slug: 'hygiene', descriptionFr: 'Produits d\'hygiène corporelle' },
    { nameFr: 'Bébé & Maman', slug: 'bebe-maman', descriptionFr: 'Produits pour bébé et future maman' },
    { nameFr: 'Compléments Alimentaires', slug: 'complements-alimentaires', descriptionFr: 'Vitamines et compléments' },
    { nameFr: 'Matériel Médical', slug: 'materiel-medical', descriptionFr: 'Équipements médicaux et consommables' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        ...cat,
        isActive: true,
      },
    })
  }
  console.log('✅ Categories created')

  // Create brands
  const brands = [
    { name: 'La Roche-Posay', slug: 'la-roche-posay', description: 'Laboratoire dermatologique' },
    { name: 'Avène', slug: 'avene', description: 'Eau thermale et soins' },
    { name: 'Bioderma', slug: 'bioderma', description: 'Dermocosmétique' },
    { name: 'Vichy', slug: 'vichy', description: 'Soins dermatologiques' },
    { name: 'Mustela', slug: 'mustela', description: 'Soins bébé' },
    { name: 'Cattier', slug: 'cattier', description: 'Cosmétique bio' },
  ]

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: {
        ...brand,
        isActive: true,
      },
    })
  }
  console.log('✅ Brands created')

  // Create price list
  const defaultPriceList = await prisma.priceList.upsert({
    where: { id: 'default-price-list' },
    update: {},
    create: {
      id: 'default-price-list',
      name: 'Tarif Standard B2B',
      isDefault: true,
    },
  })
  console.log('✅ Price list created')

  // Link company to price list
  await prisma.company.update({
    where: { id: demoCompany.id },
    data: { priceListId: defaultPriceList.id },
  })

  // Create sample products
  const dermocosCategory = await prisma.category.findUnique({ where: { slug: 'dermocosmetique' } })
  const hygieneCategory = await prisma.category.findUnique({ where: { slug: 'hygiene' } })
  const bebeCategory = await prisma.category.findUnique({ where: { slug: 'bebe-maman' } })
  
  const laRocheBrand = await prisma.brand.findUnique({ where: { slug: 'la-roche-posay' } })
  const aveneBrand = await prisma.brand.findUnique({ where: { slug: 'avene' } })
  const biodermaBrand = await prisma.brand.findUnique({ where: { slug: 'bioderma' } })
  const mustelaBrand = await prisma.brand.findUnique({ where: { slug: 'mustela' } })

  const products = [
    {
      sku: 'LP-001',
      nameFr: 'Effaclar Gel Moussant Purifiant 400ml',
      slug: 'effaclar-gel-moussant-400ml',
      descriptionFr: 'Gel moussant purifiant pour peaux grasses et sensibles',
      basePrice: 125.50,
      stockQuantity: 45,
      packSize: 12,
      moq: 12,
      categoryId: dermocosCategory?.id,
      brandId: laRocheBrand?.id,
    },
    {
      sku: 'LP-002',
      nameFr: 'Cicaplast Baume B5+ 100ml',
      slug: 'cicaplast-baume-b5-100ml',
      descriptionFr: 'Baume réparateur apaisant',
      basePrice: 156.00,
      stockQuantity: 32,
      packSize: 6,
      moq: 6,
      categoryId: dermocosCategory?.id,
      brandId: laRocheBrand?.id,
    },
    {
      sku: 'AV-001',
      nameFr: 'Eau Thermale Avène 300ml',
      slug: 'eau-thermale-avene-300ml',
      descriptionFr: 'Eau thermale apaisante et adoucissante',
      basePrice: 89.00,
      stockQuantity: 120,
      packSize: 12,
      moq: 12,
      categoryId: dermocosCategory?.id,
      brandId: aveneBrand?.id,
    },
    {
      sku: 'BI-001',
      nameFr: 'Sensibio H2O 500ml',
      slug: 'sensibio-h2o-500ml',
      descriptionFr: 'Eau micellaire démaquillante',
      basePrice: 145.00,
      stockQuantity: 85,
      packSize: 12,
      moq: 12,
      categoryId: hygieneCategory?.id,
      brandId: biodermaBrand?.id,
    },
    {
      sku: 'MU-001',
      nameFr: 'Hydra Bébé Crème Visage 40ml',
      slug: 'hydra-bebe-creme-visage-40ml',
      descriptionFr: 'Crème hydratante visage pour bébé',
      basePrice: 98.50,
      stockQuantity: 67,
      packSize: 12,
      moq: 12,
      categoryId: bebeCategory?.id,
      brandId: mustelaBrand?.id,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        ...product,
        unit: 'UNIT',
        taxRate: 0.20,
        isActive: true,
      } as any,
    })
  }
  console.log('✅ Sample products created')

  // Create warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-CAS-01' },
    update: {},
    create: {
      name: 'Entrepôt Principal Casablanca',
      code: 'WH-CAS-01',
      address: 'Zone industrielle Sud',
      city: 'Casablanca',
      isPrimary: true,
    },
  })
  console.log('✅ Warehouse created')

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
