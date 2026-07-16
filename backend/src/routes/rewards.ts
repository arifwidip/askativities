import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// GET /api/rewards - Public (viewable by children)
router.get('/', async (req, res): Promise<void> => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { isDeleted: false },
      orderBy: { cost: 'asc' },
    });
    res.json(rewards);
  } catch (error: any) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/rewards - Admin Only
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, icon, cost } = req.body;

    if (!name || !icon || cost === undefined) {
      res.status(400).json({ error: 'Name, icon, and cost are required.' });
      return;
    }

    const reward = await prisma.reward.create({
      data: {
        name,
        description,
        icon,
        cost: Number(cost),
      },
    });

    res.status(201).json(reward);
  } catch (error: any) {
    console.error('Error creating reward:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/rewards/:id - Admin Only
router.patch('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, icon, cost } = req.body;

    const reward = await prisma.reward.findUnique({ where: { id } });
    if (!reward || reward.isDeleted) {
      res.status(404).json({ error: 'Reward not found.' });
      return;
    }

    const updated = await prisma.reward.update({
      where: { id },
      data: {
        name: name !== undefined ? name : reward.name,
        description: description !== undefined ? description : reward.description,
        icon: icon !== undefined ? icon : reward.icon,
        cost: cost !== undefined ? Number(cost) : reward.cost,
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating reward:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/rewards/:id - Admin Only (Soft Delete)
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const reward = await prisma.reward.findUnique({ where: { id } });
    if (!reward || reward.isDeleted) {
      res.status(404).json({ error: 'Reward not found.' });
      return;
    }

    await prisma.reward.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: 'Reward deleted successfully (soft deleted).' });
  } catch (error: any) {
    console.error('Error deleting reward:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
