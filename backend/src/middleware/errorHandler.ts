import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message, err.stack);

  // Mongoose duplicate key (e.g. duplicate email or category)
  if ((err as NodeJS.ErrnoException).name === 'MongoServerError') {
    const mongoErr = err as NodeJS.ErrnoException & { code?: number; keyValue?: Record<string, unknown> };
    if (mongoErr.code === 11000) {
      const field = Object.keys(mongoErr.keyValue ?? {})[0] ?? 'field';
      res.status(409).json({ message: `${field} already exists.` });
      return;
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(422).json({ message: err.message });
    return;
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({ message: 'Invalid ID format.' });
    return;
  }

  // Generic 500
  res.status(500).json({
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong. Please try again.'
        : err.message,
  });
}
