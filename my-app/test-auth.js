const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🔍 Testing authentication...');

    // Test admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (adminUser) {
      console.log('✅ Admin user found in database');
      console.log('📧 Email:', adminUser.email);
      console.log('🔐 Has password:', !!adminUser.password);
      console.log('🎭 Role:', adminUser.role);
      
      // Test password verification
      const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
      console.log('🔑 Password verification:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
      
      if (isPasswordValid) {
        console.log('🎉 Admin authentication should work!');
      } else {
        console.log('❌ Password verification failed - this is the issue!');
      }
    } else {
      console.log('❌ Admin user not found in database');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test enseignant user
    const enseignantUser = await prisma.user.findUnique({
      where: { email: 'enseignant@example.com' }
    });

    if (enseignantUser) {
      console.log('✅ Enseignant user found in database');
      console.log('📧 Email:', enseignantUser.email);
      console.log('🔐 Has password:', !!enseignantUser.password);
      console.log('🎭 Role:', enseignantUser.role);
      
      // Test password verification
      const isPasswordValid = await bcrypt.compare('enseignant123', enseignantUser.password);
      console.log('🔑 Password verification:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test candidat user
    const candidatUser = await prisma.user.findUnique({
      where: { email: 'candidat@example.com' }
    });

    if (candidatUser) {
      console.log('✅ Candidat user found in database');
      console.log('📧 Email:', candidatUser.email);
      console.log('🔐 Has password:', !!candidatUser.password);
      console.log('🎭 Role:', candidatUser.role);
      
      // Test password verification
      const isPasswordValid = await bcrypt.compare('candidat123', candidatUser.password);
      console.log('🔑 Password verification:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
    }

  } catch (error) {
    console.error('❌ Error testing authentication:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
