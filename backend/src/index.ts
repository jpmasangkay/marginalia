import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import mongoSanitize from './middleware/sanitize';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import categoriesRoutes from './routes/categories';
import { errorHandler } from './middleware/errorHandler';

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT ?? 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Please configure your .env file.');
  process.exit(1);
}

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('JWT_SECRET and JWT_REFRESH_SECRET must be set.');
  process.exit(1);
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 auth attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again after 15 minutes.' },
});

// ─── Security Middleware ──────────────────────────────────────────────────────

// Set secure HTTP headers
app.use(helmet());

// CORS — only allow configured frontend origin
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman in dev) or from the allowed origin
      if (!origin || origin === ALLOWED_ORIGIN) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true, // required for cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// General rate limiter for all /api endpoints
app.use('/api', apiLimiter);

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '50kb' })); // Reject oversized payloads
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// HTTP Parameter Pollution protection
app.use(hpp());

// Sanitize user-supplied data against NoSQL injection
// In-place stripping of '$' and '.' operators without reassigning getter-only req.query
app.use(mongoSanitize);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stricter limiter on sensitive auth paths
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/categories', categoriesRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database & Server Start ──────────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📋 Allowed origin: ${ALLOWED_ORIGIN}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

start();
