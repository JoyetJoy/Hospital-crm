const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const hospital = await prisma.hospital.findFirst();
    if (!hospital) return console.log('No hospital');
    
    // Simulate frontend payload
    const payload = {
      name: hospital.name,
      category: hospital.category,
      department: hospital.department,
      contactPerson: hospital.contactPerson,
      mobileNumber: hospital.mobileNumber,
      email: hospital.email,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      district: hospital.district,
      pincode: hospital.pincode,
      bedCount: hospital.bedCount ? parseInt(hospital.bedCount) : null,
      latitude: hospital.latitude ? parseFloat(hospital.latitude) : null,
      longitude: hospital.longitude ? parseFloat(hospital.longitude) : null
    };

    console.log('Sending payload:', payload);

    await prisma.hospital.update({
      where: { id: hospital.id },
      data: payload
    });
    console.log('Success');
  } catch (e) {
    console.log('Error message:');
    console.log(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
