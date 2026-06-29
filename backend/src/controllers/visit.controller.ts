import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getVisits = async (req: Request, res: Response) => {
  try {
    const { hospitalId, executiveId } = req.query;
    const where: any = {};
    if (hospitalId) where.hospitalId = parseInt(String(hospitalId));
    if (executiveId) where.executiveId = parseInt(String(executiveId));

    const visits = await prisma.visit.findMany({
      where,
      include: { hospital: true, executive: { include: { user: true } } },
      orderBy: { visitDate: 'desc' }
    });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visits', error });
  }
};

export const getVisitById = async (req: Request, res: Response) => {
  try {
    const visit = await prisma.visit.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: { hospital: true, followups: true }
    });
    if (!visit) return res.status(404).json({ message: 'Visit not found' });
    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visit', error });
  }
};

export const createVisit = async (req: Request, res: Response) => {
  try {
    const { hospitalId, executiveId, visitDate, visitTime, purpose, notes, productsDiscussed, outcome, status } = req.body;
    
    // Handle image paths
    const files = req.files as Express.Multer.File[];
    const images = files ? files.map(file => `/uploads/${file.filename}`).join(',') : null;

    const visit = await prisma.visit.create({
      data: {
        hospitalId: parseInt(hospitalId),
        executiveId: parseInt(executiveId),
        visitDate: new Date(visitDate),
        visitTime,
        purpose,
        notes,
        productsDiscussed,
        outcome,
        status: status || 'Interested',
        images
      }
    });
    res.status(201).json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Error creating visit', error });
  }
};

export const updateVisit = async (req: Request, res: Response) => {
  try {
    const { visitDate, visitTime, purpose, notes, productsDiscussed, outcome, status } = req.body;
    
    const updateData: any = {
      visitDate: visitDate ? new Date(visitDate) : undefined,
      visitTime, purpose, notes, productsDiscussed, outcome, status
    };

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      updateData.images = files.map(file => `/uploads/${file.filename}`).join(',');
    }

    const visit = await prisma.visit.update({
      where: { id: parseInt(req.params.id as string) },
      data: updateData
    });
    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Error updating visit', error });
  }
};

export const deleteVisit = async (req: Request, res: Response) => {
  try {
    await prisma.visit.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ message: 'Visit deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting visit', error });
  }
};
