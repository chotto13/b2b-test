const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'admin@deuxapara.ma';
    const password = 'admin123';
    
    console.log('Testing login for:', email);
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { company: true }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.email);
    console.log('Role:', user.role);
    console.log('isActive:', user.isActive);
    console.log('Password hash:', user.password.substring(0, 20) + '...');
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);
    
    // Test with admin123 hashed
    const testHash = await bcrypt.hash('admin123', 10);
    console.log('Test hash format:', testHash.substring(0, 20) + '...');
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
