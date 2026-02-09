// Simple script to check database connection and users
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function check() {
  try {
    console.log('Checking database connection...')
    
    // Count users
    const userCount = await prisma.user.count()
    console.log(`Users in database: ${userCount}`)
    
    // List users
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        isActive: true,
        company: {
          select: {
            name: true,
            isApproved: true
          }
        }
      }
    })
    
    console.log('\nUsers:')
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role}) - Active: ${u.isActive} - Company: ${u.company?.name} (Approved: ${u.company?.isApproved})`)
    })
    
    // Count products
    const productCount = await prisma.product.count()
    console.log(`\nProducts in database: ${productCount}`)
    
    // Count orders
    const orderCount = await prisma.order.count()
    console.log(`Orders in database: ${orderCount}`)
    
    console.log('\n✅ Database connection OK!')
  } catch (error) {
    console.error('❌ Database error:', error.message)
    if (error.message.includes('does not exist')) {
      console.log('\n⚠️ Tables not found. Run: npx prisma db push && npx prisma db seed')
    }
  } finally {
    await prisma.$disconnect()
  }
}

check()
