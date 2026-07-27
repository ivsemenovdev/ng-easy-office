import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError, isPgForeignKeyViolation, isPgUniqueViolation } from '../errors.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Ошибка валидации данных',
      code: 'VALIDATION_ERROR',
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (isPgUniqueViolation(err)) {
    res.status(409).json({
      error: 'Запись с такими данными уже существует',
      code: 'CONFLICT',
    });
    return;
  }

  if (isPgForeignKeyViolation(err)) {
    res.status(409).json({
      error: 'Связанная запись не найдена или используется',
      code: 'FK_VIOLATION',
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
