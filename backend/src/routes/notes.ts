import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { Note } from '../models/Note';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All note routes require authentication
router.use(authenticate);

// ─── Validation chains ────────────────────────────────────────────────────────
const noteBodyValidators = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Content cannot exceed 10000 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category name cannot exceed 50 characters'),
  body('color')
    .trim()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('checklist')
    .optional()
    .isArray({ max: 100 })
    .withMessage('Checklist cannot have more than 100 items'),
  body('checklist.*.text')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Checklist item text cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Checklist item text cannot exceed 500 characters'),
  body('checklist.*.checked')
    .optional()
    .isBoolean()
    .withMessage('Checked must be a boolean'),
];

const noteIdValidator = param('id').isMongoId().withMessage('Invalid note ID');
const itemIdValidator = param('itemId').isMongoId().withMessage('Invalid item ID');

// ─── GET /api/notes ────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    // Optional search query — safe because userId always scopes the query
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    let query: Record<string, unknown> = { userId };

    if (search) {
      query = {
        ...query,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const notes = await Note.find(query).sort({ createdAt: -1 }).limit(200).lean();

    res.json({ notes });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/notes ───────────────────────────────────────────────────────────
router.post(
  '/',
  noteBodyValidators,
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, content, category, color, checklist } = req.body as {
        title: string;
        content?: string;
        category?: string;
        color: string;
        checklist?: { text: string; checked: boolean }[];
      };

      const note = await Note.create({
        title,
        content: content ?? '',
        category: category ?? 'Uncategorized',
        color,
        userId: req.user!._id,
        checklist: checklist ?? [],
      });

      res.status(201).json({ note });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/notes/:id ────────────────────────────────────────────────────────
router.put(
  '/:id',
  [noteIdValidator, ...noteBodyValidators],
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const note = await Note.findOne({ _id: req.params.id, userId: req.user!._id });
      if (!note) {
        res.status(404).json({ message: 'Note not found.' });
        return;
      }

      const { title, content, category, color, checklist } = req.body as {
        title: string;
        content?: string;
        category?: string;
        color: string;
        checklist?: { text: string; checked: boolean }[];
      };

      note.title = title;
      note.content = content ?? '';
      note.category = category ?? 'Uncategorized';
      note.color = color;
      note.checklist = (checklist ?? []) as typeof note.checklist;

      await note.save();
      res.json({ note });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/notes/:id ────────────────────────────────────────────────────
router.delete(
  '/:id',
  [noteIdValidator],
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
      if (!note) {
        res.status(404).json({ message: 'Note not found.' });
        return;
      }
      res.json({ message: 'Note deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PATCH /api/notes/:id/checklist/:itemId ───────────────────────────────────
router.patch(
  '/:id/checklist/:itemId',
  [noteIdValidator, itemIdValidator],
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const note = await Note.findOne({ _id: req.params.id, userId: req.user!._id });
      if (!note) {
        res.status(404).json({ message: 'Note not found.' });
        return;
      }

      const item = note.checklist.find((i) => i._id.toString() === req.params.itemId);
      if (!item) {
        res.status(404).json({ message: 'Checklist item not found.' });
        return;
      }

      item.checked = !item.checked;
      await note.save();

      res.json({ note });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
