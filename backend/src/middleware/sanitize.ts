import { Request, Response, NextFunction } from 'express';

function sanitizeInPlace(target: Record<string, any> | any[]): void {
  if (!target || typeof target !== 'object') return;

  if (Array.isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      if (typeof target[i] === 'object' && target[i] !== null) {
        sanitizeInPlace(target[i]);
      }
    }
    return;
  }

  for (const key of Object.keys(target)) {
    // If key starts with '$' (Mongo operator) or contains '.', strip it to prevent operator injection
    if (key.startsWith('$') || key.includes('.')) {
      delete target[key];
      continue;
    }

    if (typeof target[key] === 'object' && target[key] !== null) {
      sanitizeInPlace(target[key]);
    }
  }
}

/**
 * Express and Node.js safe MongoDB NoSQL query injection sanitizer.
 * Recursively cleans dangerous MongoDB operator keys in-place without
 * reassigning req.query (which is read-only in modern Node/Express runtimes).
 */
export const mongoSanitize = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    sanitizeInPlace(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeInPlace(req.params);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeInPlace(req.query as Record<string, any>);
  }
  next();
};

export default mongoSanitize;
