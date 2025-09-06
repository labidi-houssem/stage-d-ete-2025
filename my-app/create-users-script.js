const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log('🚀 Starting user creation...');

    // Create Admin User
    console.log('👑 Creating Admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: adminPassword,
        role: 'ADMIN',
        nom: 'Admin',
        prenom: 'System',
        telephone: '+21612345678',
        name: 'System Admin',
      },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create Enseignant User
    console.log('👨‍🏫 Creating Enseignant user...');
    const enseignantPassword = await bcrypt.hash('enseignant123', 12);
    const enseignant = await prisma.user.create({
      data: {
        email: 'enseignant@example.com',
        password: enseignantPassword,
        role: 'ENSEIGNANT',
        nom: 'Dupont',
        prenom: 'Jean',
        telephone: '+21612345679',
        name: 'Jean Dupont',
      },
    });
    console.log('✅ Enseignant user created:', enseignant.email);

    // Create Candidat User
    console.log('🎯 Creating Candidat user...');
    const candidatPassword = await bcrypt.hash('candidat123', 12);
    const candidat = await prisma.user.create({
      data: {
        email: 'candidat@example.com',
        password: candidatPassword,
        role: 'CANDIDAT',
        nom: 'Martin',
        prenom: 'Marie',
        telephone: '+21612345680',
        name: 'Marie Martin',
        cin: '12345678',
        nationalite: 'Tunisienne',
        civilite: 'Mme',
        gouvernorat: 'Tunis',
        specialite: 'Informatique',
      },
    });
    console.log('✅ Candidat user created:', candidat.email);

    console.log('\n🎉 All users created successfully!');
    console.log('\n📋 User Credentials:');
    console.log('👑 Admin: admin@example.com / admin123');
    console.log('👨‍🏫 Enseignant: enseignant@example.com / enseignant123');
    console.log('🎯 Candidat: candidat@example.com / candidat123');

  } catch (error) {
    console.error('❌ Error creating users:', error);
    
    // Check if users already exist
    if (error.code === 'P2002') {
      console.log('\n⚠️  Some users might already exist. Checking existing users...');
      
      const existingUsers = await prisma.user.findMany({
        where: {
          email: {
            in: ['admin@example.com', 'enseignant@example.com', 'candidat@example.com']
          }
        },
        select: {
          email: true,
          role: true,
          name: true
        }
      });
      
      console.log('\n📋 Existing users:');
      existingUsers.forEach(user => {
        console.log(`- ${user.email} (${user.role}): ${user.name}`);
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();

