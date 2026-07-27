import { Router, Response } from 'express';
import multer from 'multer';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/auth';
import { uploadToGarage } from '../utils/s3';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/children - Public (accessible by family device)
router.get('/', async (req, res): Promise<void> => {
  try {
    const children = await prisma.child.findMany({
      orderBy: { createdAt: 'asc' },
    });
    res.json(children);
  } catch (error: any) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/children/:id - Public
router.get('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const child = await prisma.child.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 50, // Get last 50 transactions
        },
      },
    });

    if (!child) {
      res.status(404).json({ error: 'Child not found.' });
      return;
    }

    res.json(child);
  } catch (error: any) {
    console.error('Error fetching child details:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/children/:id/logs - Public (Paginated logs for child)
router.get('/:id/logs', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 15));
    const skip = (page - 1) * limit;

    const child = await prisma.child.findUnique({ where: { id } });
    if (!child) {
      res.status(404).json({ error: 'Child not found.' });
      return;
    }

    const [logs, total] = await prisma.$transaction([
      prisma.pointLog.findMany({
        where: { childId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pointLog.count({
        where: { childId: id },
      }),
    ]);

    const hasMore = skip + logs.length < total;

    res.json({
      logs,
      total,
      page,
      limit,
      hasMore,
    });
  } catch (error: any) {
    console.error('Error fetching child logs:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/children - Admin Only (Create child with avatar upload)
router.post(
  '/',
  authenticateJWT,
  upload.single('avatar'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      const file = req.file;

      if (!name) {
        res.status(400).json({ error: 'Name is required.' });
        return;
      }

      if (!file) {
        res.status(400).json({ error: 'Avatar image file is required.' });
        return;
      }

      console.log(`Uploading avatar for child ${name} to Garage S3...`);
      let avatarUrl = '';
      try {
        avatarUrl = await uploadToGarage(file);
      } catch (s3Error: any) {
        console.error('S3 upload failed:', s3Error);
        res.status(500).json({ error: 'Failed to upload avatar to storage.' });
        return;
      }

      const child = await prisma.child.create({
        data: {
          name,
          avatarUrl,
          totalPoints: 0,
        },
      });

      res.status(201).json(child);
    } catch (error: any) {
      console.error('Error creating child:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// DELETE /api/children/:id - Admin Only
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const child = await prisma.child.findUnique({ where: { id } });
    if (!child) {
      res.status(404).json({ error: 'Child not found.' });
      return;
    }

    await prisma.child.delete({ where: { id } });
    res.json({ message: 'Child deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting child:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/children/:id/earn - Public/Parent (Add points for activity)
router.post('/:id/earn', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { activityId } = req.body;

    if (!activityId) {
      res.status(400).json({ error: 'activityId is required.' });
      return;
    }

    const child = await prisma.child.findUnique({ where: { id } });
    if (!child) {
      res.status(404).json({ error: 'Child not found.' });
      return;
    }

    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity || activity.isDeleted) {
      res.status(404).json({ error: 'Activity not found or deleted.' });
      return;
    }

    // Execute in transaction: 1. update points, 2. create log
    const [updatedChild, log] = await prisma.$transaction([
      prisma.child.update({
        where: { id },
        data: {
          totalPoints: {
            increment: activity.points,
          },
        },
      }),
      prisma.pointLog.create({
        data: {
          childId: id,
          type: 'EARN',
          amount: activity.points,
          title: activity.name,
          activityId: activity.id,
        },
      }),
    ]);

    res.json({
      message: `Points added successfully! +${activity.points} pts`,
      child: updatedChild,
      log,
    });
  } catch (error: any) {
    console.error('Error completing activity:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/children/:id/redeem - Public/Parent (Deduct points for reward)
router.post('/:id/redeem', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { rewardId } = req.body;

    if (!rewardId) {
      res.status(400).json({ error: 'rewardId is required.' });
      return;
    }

    const child = await prisma.child.findUnique({ where: { id } });
    if (!child) {
      res.status(404).json({ error: 'Child not found.' });
      return;
    }

    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward || reward.isDeleted) {
      res.status(404).json({ error: 'Reward not found or deleted.' });
      return;
    }

    // Check balance
    if (child.totalPoints < reward.cost) {
      res.status(400).json({ error: `Insufficient points. Needs ${reward.cost} pts, has ${child.totalPoints} pts.` });
      return;
    }

    // Execute in transaction: 1. deduct points, 2. create log
    const [updatedChild, log] = await prisma.$transaction([
      prisma.child.update({
        where: { id },
        data: {
          totalPoints: {
            decrement: reward.cost,
          },
        },
      }),
      prisma.pointLog.create({
        data: {
          childId: id,
          type: 'REDEEM',
          amount: reward.cost, // absolute value
          title: reward.name,
          rewardId: reward.id,
        },
      }),
    ]);

    res.json({
      message: `Reward redeemed successfully! -${reward.cost} pts`,
      child: updatedChild,
      log,
    });
  } catch (error: any) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/children/:childId/logs/:logId - Admin Only (Revoke a point log)
router.delete(
  '/:childId/logs/:logId',
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { childId, logId } = req.params;

      const log = await prisma.pointLog.findFirst({
        where: { id: logId, childId },
      });

      if (!log) {
        res.status(404).json({ error: 'Point log not found for this child.' });
        return;
      }

      const child = await prisma.child.findUnique({
        where: { id: childId },
      });

      if (!child) {
        res.status(404).json({ error: 'Child not found.' });
        return;
      }

      let newPoints = child.totalPoints;
      if (log.type === 'EARN') {
        newPoints = child.totalPoints - log.amount;
        if (newPoints < 0) {
          newPoints = 0;
        }
      } else if (log.type === 'REDEEM' || log.type === 'DEDUCT') {
        newPoints = child.totalPoints + log.amount;
      }

      const [updatedChild] = await prisma.$transaction([
        prisma.child.update({
          where: { id: childId },
          data: { totalPoints: newPoints },
        }),
        prisma.pointLog.delete({
          where: { id: logId },
        }),
      ]);

      res.json({
        message: 'Point transaction revoked successfully.',
        child: updatedChild,
      });
    } catch (error: any) {
      console.error('Error revoking point transaction:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// POST /api/children/:id/deduct - Admin Only (Deduct points for correction/penalty)
router.post('/:id/deduct', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, title } = req.body;

    if (amount === undefined || Number(amount) <= 0) {
      res.status(400).json({ error: 'Amount must be greater than 0.' });
      return;
    }

    if (!title) {
      res.status(400).json({ error: 'Reason/title is required.' });
      return;
    }

    const child = await prisma.child.findUnique({ where: { id } });
    if (!child) {
      res.status(404).json({ error: 'Child not found.' });
      return;
    }

    // Check balance
    if (child.totalPoints < Number(amount)) {
      res.status(400).json({ error: `Insufficient points. Cannot deduct ${amount} pts, child only has ${child.totalPoints} pts.` });
      return;
    }

    // Execute in transaction: 1. deduct points, 2. create log
    const [updatedChild, log] = await prisma.$transaction([
      prisma.child.update({
        where: { id },
        data: {
          totalPoints: {
            decrement: Number(amount),
          },
        },
      }),
      prisma.pointLog.create({
        data: {
          childId: id,
          type: 'DEDUCT',
          amount: Number(amount), // absolute value
          title: title,
        },
      }),
    ]);

    res.json({
      message: `Points deducted successfully! -${amount} pts`,
      child: updatedChild,
      log,
    });
  } catch (error: any) {
    console.error('Error deducting points:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
