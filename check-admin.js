const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@deuxapara.ma' },
      include: { company: true }
    });
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('isActive:', user.isActive);
      console.log('Has password:', user.password ? 'YES (length: ' + user.password.length + ')' : 'NO');
      console.log('Company:', user.company ? user.company.name : 'NONE');
    } else {
      console.log('Admin user does not exist!');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
