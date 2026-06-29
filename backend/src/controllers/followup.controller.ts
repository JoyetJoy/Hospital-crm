import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getFollowups = async (req: Request, res: Response) => {
  try {
    const { hospitalId, status } = req.query;
    const where: any = {};
    if (hospitalId) where.hospitalId = parseInt(String(hospitalId));
    if (status) where.status = String(status);

    const followups = await prisma.followup.findMany({
      where,
      include: { hospital: true, visit: true },
      orderBy: { followupDate: 'asc' }
    });
    res.json(followups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching followups', error });
  }
};

export const getFollowupById = async (req: Request, res: Response) => {
  try {
    const followup = await prisma.followup.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: { hospital: true, visit: true }
    });
    if (!followup) return res.status(404).json({ message: 'Followup not found' });
    res.json(followup);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching followup', error });
  }
};

export const createFollowup = async (req: Request, res: Response) => {
  try {
    const { hospitalId, visitId, followupDate, followupTime, followupType, priority, notes, status } = req.body;
    const followup = await prisma.followup.create({
      data: {
        hospitalId: parseInt(hospitalId),
        visitId: visitId ? parseInt(visitId) : null,
        followupDate: new Date(followupDate),
        followupTime,
        followupType,
        priority: priority || 'Medium',
        notes,
        status: status || 'Pending'
      }
    });
    res.status(201).json(followup);
  } catch (error) {
    res.status(500).json({ message: 'Error creating followup', error });
  }
};

export const updateFollowup = async (req: Request, res: Response) => {
  try {
    const { followupDate, followupTime, followupType, priority, notes, status } = req.body;
    const followup = await prisma.followup.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        followupDate: followupDate ? new Date(followupDate) : undefined,
        followupTime, followupType, priority, notes, status
      }
    });
    res.json(followup);
  } catch (error) {
    res.status(500).json({ message: 'Error updating followup', error });
  }
};

export const deleteFollowup = async (req: Request, res: Response) => {
  try {
    await prisma.followup.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ message: 'Followup deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting followup', error });
  }
};
