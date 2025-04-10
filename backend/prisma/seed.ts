import { PrismaClient, UserRole, DifficultyLevel, QuestionType, CompletionStatus, ActivityType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Define the ActivityType enum since it's not being exported correctly
// enum ActivityType {
//   PAGE_VIEW = 'PAGE_VIEW',
//   VIDEO_WATCHED = 'VIDEO_WATCHED',
//   EXERCISE_COMPLETED = 'EXERCISE_COMPLETED',
//   QUIZ_ATTEMPTED = 'QUIZ_ATTEMPTED',
//   RESOURCE_DOWNLOADED = 'RESOURCE_DOWNLOADED',
//   NOTE_ADDED = 'NOTE_ADDED',
//   MODULE_STARTED = 'MODULE_STARTED',
//   MODULE_COMPLETED = 'MODULE_COMPLETED',
//   SECTION_COMPLETED = 'SECTION_COMPLETED'
// }

async function main() {
  console.log('Starting seeding...');

  // *** Create Users ***
  console.log('Creating users...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cybersafe.com' },
    update: {},
    create: {
      email: 'admin@cybersafe.com',
      username: 'admin',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isVerified: true,
      isPremium: true,
      premiumExpiryDate: new Date(2026, 11, 31),
    },
  } as any);
  console.log(`Created admin user: ${admin.email}`);

  // Create instructor user
  const instructorPassword = await bcrypt.hash('Instructor123!', 10);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@cybersafe.com' },
    update: {},
    create: {
      email: 'instructor@cybersafe.com',
      username: 'instructor',
      passwordHash: instructorPassword,
      firstName: 'Instructor',
      lastName: 'User',
      role: UserRole.INSTRUCTOR,
      isVerified: true,
      bio: 'Cybersecurity professional with over 10 years of experience in network security and penetration testing.',
      isPremium: true,
      premiumExpiryDate: new Date(2026, 5, 15),
    },
  } as any);
  console.log(`Created instructor user: ${instructor.email}`);

  // Create regular user
  const userPassword = await bcrypt.hash('User123!', 10);
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@cybersafe.com' },
    update: {},
    create: {
      email: 'user@cybersafe.com',
      username: 'user',
      passwordHash: userPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
      isVerified: true,
      bio: 'Enthusiastic learner interested in cybersecurity fundamentals.',
    },
  } as any);
  console.log(`Created regular user: ${regularUser.email}`);

  // *** Create Badges ***
  console.log('Creating badges...');
  
  const badges = [
    {
      name: 'Beginner',
      description: 'Completed your first cybersecurity module',
      imageUrl: 'badges/beginner.png',
      criteria: 'Complete one learning module successfully.',
      pointsRequired: 100,
    },
    {
      name: 'Code Breaker',
      description: 'Successfully decrypted a challenging cipher',
      imageUrl: 'badges/codebreaker.png',
      criteria: 'Complete the Cryptography Basics module with a score of at least 90%.',
      pointsRequired: 300,
    },
    {
      name: 'Security Expert',
      description: 'Demonstrated expert-level knowledge in cybersecurity concepts',
      imageUrl: 'badges/expert.png',
      criteria: 'Complete 5 advanced modules with an average score of at least 85%.',
      pointsRequired: 1000,
    },
    {
      name: 'Ethical Hacker',
      description: 'Completed the ethical hacking pathway',
      imageUrl: 'badges/ethical-hacker.png',
      criteria: 'Complete all modules in the Ethical Hacking track.',
      pointsRequired: 2000,
    },
    {
      name: 'Bug Hunter',
      description: 'Found and reported multiple security vulnerabilities',
      imageUrl: 'badges/bug-hunter.png',
      criteria: 'Identify vulnerabilities in 3 different code review exercises.',
      pointsRequired: 1500,
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    } as any);
  }
  console.log('Created badges');

  // Assign badges to the user
  await prisma.userBadge.upsert({
    where: { 
      userId_badgeId: {
        userId: regularUser.id,
        badgeId: 1,
      }
    },
    update: {},
    create: {
      userId: regularUser.id,
      badgeId: 1,
      awardedAt: new Date(2024, 11, 15),
    },
  } as any);

  // *** Create Learning Modules ***
  console.log('Creating learning modules...');
  
  const modules = [
    {
      title: 'Cybersecurity Foundations',
      description: 'An introduction to the fundamental concepts and principles of cybersecurity.',
      content: JSON.stringify({
        sections: [
          {
            title: 'Introduction to Cybersecurity',
            content: 'Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks...'
          },
          {
            title: 'CIA Triad',
            content: 'The CIA triad consists of Confidentiality, Integrity, and Availability...'
          },
          {
            title: 'Threat Landscape',
            content: 'The cybersecurity threat landscape is constantly evolving...'
          },
          {
            title: 'Security Controls',
            content: 'Security controls are safeguards or countermeasures to avoid, detect, counteract, or minimize security risks...'
          }
        ]
      }),
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedTimeMinutes: 60,
      points: 100,
      prerequisites: null,
      imageUrl: 'modules/cybersec-foundations.jpg',
      isPublished: true,
      orderIndex: 1,
    },
    {
      title: 'Cryptography Basics',
      description: 'Learn about encryption, decryption, and the importance of cryptography in security.',
      content: JSON.stringify({
        sections: [
          {
            title: 'Encryption Basics',
            content: 'Encryption is the process of encoding information to prevent unauthorized access...'
          },
          {
            title: 'Symmetric vs Asymmetric Encryption',
            content: 'Symmetric encryption uses the same key for encryption and decryption, while asymmetric encryption uses a pair of keys...'
          },
          {
            title: 'Hashing Algorithms',
            content: 'Hashing is a one-way function that converts input into a fixed-length string of characters...'
          }
        ]
      }),
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedTimeMinutes: 90,
      points: 150,
      prerequisites: 'Cybersecurity Foundations',
      imageUrl: 'modules/cryptography.jpg',
      isPublished: true,
      orderIndex: 2,
    },
    {
      title: 'Network Security',
      description: 'Explore the principles and practices of securing computer networks.',
      content: JSON.stringify({
        sections: [
          {
            title: 'Network Basics',
            content: 'Computer networks allow devices to communicate and share resources...'
          },
          {
            title: 'Firewalls and IDS/IPS',
            content: 'Firewalls act as a barrier between trusted and untrusted networks...'
          },
          {
            title: 'VPNs and Secure Communication',
            content: 'Virtual Private Networks (VPNs) create a secure tunnel for data transmission...'
          }
        ]
      }),
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedTimeMinutes: 120,
      points: 200,
      prerequisites: 'Cybersecurity Foundations',
      imageUrl: 'modules/network-security.jpg',
      isPublished: true,
      orderIndex: 3,
    },
    {
      title: 'Web Application Security',
      description: 'Learn about common web vulnerabilities and how to secure web applications.',
      content: JSON.stringify({
        sections: [
          {
            title: 'OWASP Top 10',
            content: 'The OWASP Top 10 is a standard awareness document for developers and web application security...'
          },
          {
            title: 'Cross-Site Scripting (XSS)',
            content: 'XSS attacks inject malicious scripts into trusted websites...'
          },
          {
            title: 'SQL Injection',
            content: 'SQL Injection is a code injection technique that exploits vulnerabilities in web applications...'
          }
        ]
      }),
      difficultyLevel: DifficultyLevel.ADVANCED,
      estimatedTimeMinutes: 150,
      points: 250,
      prerequisites: 'Network Security, Cryptography Basics',
      imageUrl: 'modules/web-security.jpg',
      isPublished: true,
      orderIndex: 4,
    },
    {
      title: 'Ethical Hacking',
      description: 'Explore the methodologies and tools used by ethical hackers to identify security vulnerabilities.',
      content: JSON.stringify({
        sections: [
          {
            title: 'Ethical Hacking Methodology',
            content: 'Ethical hacking follows a structured approach to identify and address vulnerabilities...'
          },
          {
            title: 'Reconnaissance Techniques',
            content: 'Reconnaissance is the first phase of ethical hacking, involving information gathering...'
          },
          {
            title: 'Vulnerability Assessment',
            content: 'Vulnerability assessment involves identifying, quantifying, and prioritizing vulnerabilities...'
          },
          {
            title: 'Penetration Testing',
            content: 'Penetration testing simulates real-world attacks to identify security weaknesses...'
          }
        ]
      }),
      difficultyLevel: DifficultyLevel.EXPERT,
      estimatedTimeMinutes: 180,
      points: 300,
      prerequisites: 'Web Application Security',
      imageUrl: 'modules/ethical-hacking.jpg',
      isPublished: true,
      orderIndex: 5,
    }
  ];

  const createdModules = [];
  for (const module of modules) {
    const createdModule = await prisma.learningModule.upsert({
      where: { id: createdModules.length + 1 },
      update: {},
      create: module,
    } as any);
    createdModules.push(createdModule);
  }
  console.log('Created learning modules');

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
