import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// GET /api/activities - Public (viewable by children)
router.get('/', async (req, res): Promise<void> => {
  try {
    const activities = await prisma.activity.findMany({
      where: { isDeleted: false },
      orderBy: { points: 'asc' },
    });
    res.json(activities);
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/activities - Admin Only
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, icon, points } = req.body;

    if (!name || !icon || points === undefined) {
      res.status(400).json({ error: 'Name, icon, and points are required.' });
      return;
    }

    const activity = await prisma.activity.create({
      data: {
        name,
        description,
        icon,
        points: Number(points),
      },
    });

    res.status(201).json(activity);
  } catch (error: any) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/activities/:id - Admin Only
router.patch('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, icon, points } = req.body;

    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity || activity.isDeleted) {
      res.status(404).json({ error: 'Activity not found.' });
      return;
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        name: name !== undefined ? name : activity.name,
        description: description !== undefined ? description : activity.description,
        icon: icon !== undefined ? icon : activity.icon,
        points: points !== undefined ? Number(points) : activity.points,
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/activities/:id - Admin Only (Soft Delete)
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity || activity.isDeleted) {
      res.status(404).json({ error: 'Activity not found.' });
      return;
    }

    await prisma.activity.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: 'Activity deleted successfully (soft deleted).' });
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
