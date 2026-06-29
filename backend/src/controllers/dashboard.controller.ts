import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalHospitals = await prisma.hospital.count();
    const totalVisits = await prisma.visit.count();
    const activeFollowups = await prisma.followup.count({ where: { status: 'Pending' } });
    const generatedQuotations = await prisma.quotation.count();

    const recentVisits = await prisma.visit.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { hospital: true, executive: { include: { user: true } } }
    });

    const recentQuotations = await prisma.quotation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { hospital: true }
    });

    res.json({
      stats: {
        totalHospitals,
        totalVisits,
        activeFollowups,
        generatedQuotations
      },
      recentVisits,
      recentQuotations
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
};
