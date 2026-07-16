import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Default Admin
  const adminEmail = 'admin@poinanak.com';
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('adminpassword123', 10);
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
      },
    });
    console.log('Created default admin: admin@poinanak.com / adminpassword123');
  } else {
    console.log('Admin already exists.');
  }

  // 2. Create Default Children
  const childrenCount = await prisma.child.count();
  if (childrenCount === 0) {
    await prisma.child.createMany({
      data: [
        {
          name: 'Afi',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Afi',
          totalPoints: 100,
        },
        {
          name: 'Budi',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Budi',
          totalPoints: 50,
        },
      ],
    });
    console.log('Created 2 default children: Afi and Budi');
  } else {
    console.log('Children already exist.');
  }

  // 3. Create Default Activities
  const activitiesCount = await prisma.activity.count();
  if (activitiesCount === 0) {
    await prisma.activity.createMany({
      data: [
        {
          name: 'Merapikan Tempat Tidur',
          description: 'Merapikan bantal, guling, dan selimut setelah bangun tidur.',
          icon: 'bed',
          points: 10,
        },
        {
          name: 'Belajar 30 Menit',
          description: 'Membaca buku pelajaran atau mengerjakan PR.',
          icon: 'book-open',
          points: 20,
        },
        {
          name: 'Membantu Orang Tua',
          description: 'Membantu menyapu halaman, mencuci piring, atau membuang sampah.',
          icon: 'heart',
          points: 15,
        },
        {
          name: 'Sikat Gigi Sebelum Tidur',
          description: 'Membersihkan gigi sebelum tidur malam.',
          icon: 'sparkles',
          points: 5,
        },
      ],
    });
    console.log('Created default activities.');
  } else {
    console.log('Activities already exist.');
  }

  // 4. Create Default Rewards
  const rewardsCount = await prisma.reward.count();
  if (rewardsCount === 0) {
    await prisma.reward.createMany({
      data: [
        {
          name: 'Main Game 30 Menit',
          description: 'Bermain game di HP atau konsol selama 30 menit.',
          icon: 'gamepad-2',
          cost: 50,
        },
        {
          name: 'Beli Es Krim',
          description: 'Mendapatkan es krim favorit.',
          icon: 'ice-cream',
          cost: 100,
        },
        {
          name: 'Main ke Taman Bermain',
          description: 'Jalan-jalan ke taman bermain di akhir pekan.',
          icon: 'compass',
          cost: 200,
        },
      ],
    });
    console.log('Created default rewards.');
  } else {
    console.log('Rewards already exist.');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
