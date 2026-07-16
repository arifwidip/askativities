import { Router, Response } from 'express';
import multer from 'multer';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/auth';
import { uploadToGarage } from '../utils/s3';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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
router.post(
  '/',
  authenticateJWT,
  upload.single('image'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, description, cost } = req.body;
      const file = req.file;

      if (!name || cost === undefined) {
        res.status(400).json({ error: 'Name and cost are required.' });
        return;
      }

      let imageUrl = '';
      if (file) {
        console.log(`Uploading reward image ${name} to Garage S3...`);
        try {
          imageUrl = await uploadToGarage(file);
        } catch (s3Error: any) {
          console.error('S3 upload failed:', s3Error);
          res.status(500).json({ error: 'Failed to upload image to storage.' });
          return;
        }
      }

      const reward = await prisma.reward.create({
        data: {
          name,
          description,
          icon: imageUrl || '🎁',
          cost: Number(cost),
        },
      });

      res.status(201).json(reward);
    } catch (error: any) {
      console.error('Error creating reward:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// PATCH /api/rewards/:id - Admin Only
router.patch(
  '/:id',
  authenticateJWT,
  upload.single('image'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, cost } = req.body;
      const file = req.file;

      const reward = await prisma.reward.findUnique({ where: { id } });
      if (!reward || reward.isDeleted) {
        res.status(404).json({ error: 'Reward not found.' });
        return;
      }

      let imageUrl = reward.icon;
      if (file) {
        console.log(`Uploading new reward image ${name || reward.name} to Garage S3...`);
        try {
          imageUrl = await uploadToGarage(file);
        } catch (s3Error: any) {
          console.error('S3 upload failed:', s3Error);
          res.status(500).json({ error: 'Failed to upload image to storage.' });
          return;
        }
      }

      const updated = await prisma.reward.update({
        where: { id },
        data: {
          name: name !== undefined ? name : reward.name,
          description: description !== undefined ? description : reward.description,
          icon: imageUrl,
          cost: cost !== undefined ? Number(cost) : reward.cost,
        },
      });

      res.json(updated);
    } catch (error: any) {
      console.error('Error updating reward:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

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
