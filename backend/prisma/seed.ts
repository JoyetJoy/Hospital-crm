import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: { name: 'Super Admin', permissions: 'ALL' },
  });

  await prisma.role.upsert({
    where: { name: 'Sales Executive' },
    update: {},
    create: { name: 'Sales Executive', permissions: 'BASIC' },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hospitalcrm.com' },
    update: {},
    create: {
      email: 'admin@hospitalcrm.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      roleId: superAdminRole.id,
    },
  });

  console.log({ admin });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
