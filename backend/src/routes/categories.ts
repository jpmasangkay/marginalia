import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { Category } from '../models/Category';
import { Note } from '../models/Note';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All category routes require authentication
router.use(authenticate);

// ─── GET /api/categories ───────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find({ userId: req.user!._id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/categories ──────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 1, max: 50 })
      .withMessage('Category name must be 1–50 characters'),
    body('color')
      .trim()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, color } = req.body as { name: string; color: string };

      const category = await Category.create({
        name,
        color,
        userId: req.user!._id,
      });

      res.status(201).json({ category });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/categories/:id ───────────────────────────────────────────────
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid category ID')],
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await Category.findOneAndDelete({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!category) {
        res.status(404).json({ message: 'Category not found.' });
        return;
      }

      // Update notes that belonged to this category to "Uncategorized"
      await Note.updateMany(
        { userId: req.user!._id, category: category.name },
        { $set: { category: 'Uncategorized' } }
      );

      res.json({ message: 'Category deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
