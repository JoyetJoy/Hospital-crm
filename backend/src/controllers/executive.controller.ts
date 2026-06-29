import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getExecutives = async (req: Request, res: Response) => {
  try {
    const executives = await prisma.executive.findMany({
      include: { user: true }
    });
    res.json(executives);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching executives', error });
  }
};

export const getExecutiveById = async (req: Request, res: Response) => {
  try {
    const executive = await prisma.executive.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: { user: true, assignments: { include: { hospital: true } } }
    });
    if (!executive) return res.status(404).json({ message: 'Executive not found' });
    res.json(executive);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching executive', error });
  }
};

export const createExecutive = async (req: Request, res: Response) => {
  try {
    const { userId, employeeCode, territory, target } = req.body;
    const executive = await prisma.executive.create({
      data: {
        userId: parseInt(userId),
        employeeCode,
        territory,
        target: target ? parseFloat(target) : null
      }
    });
    res.status(201).json(executive);
  } catch (error) {
    res.status(500).json({ message: 'Error creating executive', error });
  }
};

export const updateExecutive = async (req: Request, res: Response) => {
  try {
    const { employeeCode, territory, target } = req.body;
    const executive = await prisma.executive.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        employeeCode,
        territory,
        target: target ? parseFloat(target) : null
      }
    });
    res.json(executive);
  } catch (error) {
    res.status(500).json({ message: 'Error updating executive', error });
  }
};

export const deleteExecutive = async (req: Request, res: Response) => {
  try {
    await prisma.executive.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ message: 'Executive deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting executive', error });
  }
};

// Hospital Assignments
export const assignHospital = async (req: Request, res: Response) => {
  try {
    const { hospitalId, notes } = req.body;
    const assignment = await prisma.hospitalAssignment.create({
      data: {
        hospitalId: parseInt(hospitalId),
        executiveId: parseInt(req.params.id as string),
        notes
      }
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning hospital', error });
  }
};

export const removeAssignment = async (req: Request, res: Response) => {
  try {
    await prisma.hospitalAssignment.delete({
      where: { id: parseInt(req.params.assignmentId as string) }
    });
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing assignment', error });
  }
};
