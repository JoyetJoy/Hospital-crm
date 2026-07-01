const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const data = await prisma.executive.findUnique({ 
      where: { id: 1 }, 
      include: { 
        assignments: { 
          include: { 
            hospital: { 
              include: { 
                _count: { 
                  select: { 
                    visits: { 
                      where: { executiveId: 1 } 
                    } 
                  } 
                } 
              } 
            } 
          } 
        } 
      } 
    });
    console.log("SUCCESS");
  } catch(e) {
    console.error(e);
  }
}

main().finally(() => prisma.$disconnect());
