const prisma = require('./src/utils/prisma.js').default;

async function main() {
  console.log('Clearing AuditLogs...');
  await prisma.auditLog.deleteMany();
  
  console.log('Clearing Notifications...');
  await prisma.notification.deleteMany();
  
  console.log('Clearing Quotations...');
  await prisma.quotation.deleteMany();
  
  console.log('Clearing Products...');
  await prisma.product.deleteMany();
  
  console.log('Clearing Followups...');
  await prisma.followup.deleteMany();
  
  console.log('Clearing Visits...');
  await prisma.visit.deleteMany();
  
  console.log('Clearing HospitalAssignments...');
  await prisma.hospitalAssignment.deleteMany();
  
  console.log('Clearing Hospitals...');
  await prisma.hospital.deleteMany();
  
  console.log('Data cleared successfully (keeping Users, Executives, Roles).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
