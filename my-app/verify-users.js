const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyUsers() {
  try {
    console.log('🔍 Verifying created users...');

    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@example.com', 'enseignant@example.com', 'candidat@example.com']
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true
      }
    });

    console.log(`\n✅ Found ${users.length} users in database:`);
    console.log('='.repeat(60));
    
    users.forEach(user => {
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.name}`);
      console.log(`🎭 Role: ${user.role}`);
      console.log(`📅 Created: ${user.createdAt.toISOString()}`);
      console.log('-'.repeat(40));
    });

    if (users.length === 3) {
      console.log('\n🎉 All 3 users have been created successfully!');
    } else {
      console.log(`\n⚠️  Expected 3 users, but found ${users.length}`);
    }

  } catch (error) {
    console.error('❌ Error verifying users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUsers();
