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
  const defaultActivities = [
    {
      name: 'Sholat 5 Waktu',
      description: 'Melaksanakan sholat fardhu tepat waktu.',
      icon: 'clock',
      points: 5,
    },
    {
      name: 'Mengaji 10-15 Menit',
      description: 'Membaca Iqra atau Al-Qur\'an.',
      icon: 'book-open',
      points: 5,
    },
    {
      name: 'Menghafal 1 Ayat',
      description: 'Menghafal ayat baru Al-Qur\'an.',
      icon: 'book-open',
      points: 10,
    },
    {
      name: 'Mandi Sendiri',
      description: 'Mandi dan membersihkan diri sendiri tanpa bantuan.',
      icon: 'sparkles',
      points: 5,
    },
    {
      name: 'Cebok BAB Sendiri',
      description: 'Membersihkan diri sendiri setelah Buang Air Besar.',
      icon: 'sparkles',
      points: 10,
    },
    {
      name: 'Belajar Membaca/Menulis 20 Menit',
      description: 'Belajar membaca buku atau latihan menulis.',
      icon: 'edit',
      points: 10,
    },
    {
      name: 'Membantu Umi/Abi/Kake/Nene',
      description: 'Membantu pekerjaan rumah orang tua atau kakek/nenek.',
      icon: 'heart',
      points: 5,
    },
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
  ];

  for (const act of defaultActivities) {
    const existing = await prisma.activity.findFirst({
      where: { name: act.name },
    });
    if (!existing) {
      await prisma.activity.create({ data: act });
      console.log(`Created default activity: ${act.name}`);
    }
  }


  // 4. Create Default Rewards
  // 4. Create Default Rewards
  const defaultRewards = [
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
  ];

  for (const reward of defaultRewards) {
    const existing = await prisma.reward.findFirst({
      where: { name: reward.name },
    });
    if (!existing) {
      await prisma.reward.create({ data: reward });
      console.log(`Created default reward: ${reward.name}`);
    }
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
