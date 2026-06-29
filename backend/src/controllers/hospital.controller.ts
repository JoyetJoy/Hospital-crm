import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getHospitals = async (req: Request, res: Response) => {
  try {
    const { search, category, status } = req.query;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { city: { contains: String(search), mode: 'insensitive' } }
      ];
    }
    if (category) where.category = String(category);
    if (status) where.status = String(status);

    const hospitals = await prisma.hospital.findMany({ where, orderBy: { name: 'asc' } });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospitals', error });
  }
};

export const getHospitalById = async (req: Request, res: Response) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: {
        assignments: { include: { executive: { include: { user: true } } } },
        visits: { orderBy: { visitDate: 'desc' }, take: 5 },
        followups: { orderBy: { followupDate: 'desc' }, take: 5 }
      }
    });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospital', error });
  }
};

export const createHospital = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const hospital = await prisma.hospital.create({ data });
    res.status(201).json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Error creating hospital', error });
  }
};

export const updateHospital = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const hospital = await prisma.hospital.update({
      where: { id: parseInt(req.params.id as string) },
      data
    });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Error updating hospital', error });
  }
};

export const deleteHospital = async (req: Request, res: Response) => {
  try {
    await prisma.hospital.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ message: 'Hospital deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting hospital', error });
  }
};
