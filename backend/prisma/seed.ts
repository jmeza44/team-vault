import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123!', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@teamvault.app' },
    update: {},
    create: {
      email: 'admin@teamvault.app',
      name: 'System Administrator',
      passwordHash: adminPasswordHash,
      role: 'GLOBAL_ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create demo user
  const demoPasswordHash = await bcrypt.hash('demo123!', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@teamvault.app' },
    update: {},
    create: {
      email: 'demo@teamvault.app',
      name: 'Demo User',
      passwordHash: demoPasswordHash,
      role: 'USER',
      emailVerified: true,
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create demo team
  const demoTeam = await prisma.team.upsert({
    where: { id: 'demo-team-id' },
    update: {},
    create: {
      id: 'demo-team-id',
      name: 'Demo Team',
      description: 'A demonstration team for testing purposes',
      createdById: adminUser.id,
    },
  });

  console.log('✅ Created demo team:', demoTeam.name);

  // Add users to demo team
  await prisma.teamMembership.upsert({
    where: { 
      userId_teamId: {
        userId: adminUser.id,
        teamId: demoTeam.id,
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      teamId: demoTeam.id,
      role: 'ADMIN',
    },
  });

  await prisma.teamMembership.upsert({
    where: { 
      userId_teamId: {
        userId: demoUser.id,
        teamId: demoTeam.id,
      }
    },
    update: {},
    create: {
      userId: demoUser.id,
      teamId: demoTeam.id,
      role: 'MEMBER',
    },
  });

  console.log('✅ Added users to demo team');

  console.log('🎉 Database seed completed!');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   Admin: admin@teamvault.app / admin123!');
  console.log('   Demo:  demo@teamvault.app / demo123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
