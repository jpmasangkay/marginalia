import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// ─── Rate limiter for auth endpoints ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per window per IP
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function setCookies(res: Response, accessToken: string, refreshToken: string): void {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh',
  });
}

function generateTokens(userId: string): { accessToken: string; refreshToken: string } {
  const secret = process.env.JWT_SECRET!;
  const refreshSecret = process.env.JWT_REFRESH_SECRET!;
  const expiresIn = (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) || '15m';
  const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn']) || '7d';

  const accessToken = jwt.sign({ id: userId }, secret, { expiresIn });
  const refreshToken = jwt.sign({ id: userId }, refreshSecret, { expiresIn: refreshExpiresIn });

  return { accessToken, refreshToken };
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/\d/).withMessage('Password must contain at least one number'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body as { name: string; email: string; password: string };

      const existing = await User.findOne({ email });
      if (existing) {
        res.status(409).json({ message: 'An account with that email already exists.' });
        return;
      }

      const user = await User.create({ name, email, password });
      const { accessToken, refreshToken } = generateTokens(user._id.toString());
      setCookies(res, accessToken, refreshToken);

      res.status(201).json({
        message: 'Account created successfully!',
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };

      // Select password explicitly since it's hidden by default
      const user = await User.findOne({ email }).select('+password');

      // Use generic message to prevent user enumeration
      if (!user || !(await user.comparePassword(password))) {
        res.status(401).json({ message: 'Invalid email or password.' });
        return;
      }

      const { accessToken, refreshToken } = generateTokens(user._id.toString());
      setCookies(res, accessToken, refreshToken);

      res.json({
        message: 'Logged in successfully!',
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token: string | undefined = req.cookies?.refreshToken;
      if (!token) {
        res.status(401).json({ message: 'No refresh token.' });
        return;
      }

      const secret = process.env.JWT_REFRESH_SECRET!;
      const decoded = jwt.verify(token, secret) as { id: string };

      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401).json({ message: 'User not found.' });
        return;
      }

      const { accessToken, refreshToken } = generateTokens(user._id.toString());
      setCookies(res, accessToken, refreshToken);

      res.json({ message: 'Tokens refreshed.' });
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: 'Invalid or expired refresh token. Please log in again.' });
        return;
      }
      next(err);
    }
  }
);

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.json({ message: 'Logged out successfully.' });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, (req: Request, res: Response): void => {
  const user = req.user!;
  res.json({ user: { id: user._id, name: user.name, email: user.email } });
});

export default router;
