import { Response } from 'express';
import { logger } from '@/utils/logger';

// Standard error response interface
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

// Standard success response interface
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

// Response utility class
export class ResponseUtil {
  // Send error response
  static error(res: Response, statusCode: number, message: string, code?: string): void {
    const response: ErrorResponse = {
      success: false,
      error: {
        message,
        ...(code && { code }),
      },
    };
    
    res.status(statusCode).json(response);
  }

  // Send success response
  static success<T>(res: Response, data: T, statusCode: number = 200): void {
    const response: SuccessResponse<T> = {
      success: true,
      data,
    };
    
    res.status(statusCode).json(response);
  }

  // Common error responses
  static badRequest(res: Response, message: string = 'Bad request'): void {
    this.error(res, 400, message);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    this.error(res, 401, message);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): void {
    this.error(res, 403, message);
  }

  static notFound(res: Response, message: string = 'Not found'): void {
    this.error(res, 404, message);
  }

  static conflict(res: Response, message: string = 'Conflict'): void {
    this.error(res, 409, message);
  }

  static serverError(res: Response, message: string = 'Internal server error'): void {
    this.error(res, 500, message);
  }

  // Handle async controller errors
  static handleError(res: Response, error: any, context: string): void {
    logger.error(`${context} error:`, error);
    this.serverError(res, `${context} failed`);
  }
}
