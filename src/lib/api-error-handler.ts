import { NextResponse } from 'next/server';
import { AuthError, ProjectAccessError, FileUploadError, ValidationError } from './auth-utils';
import { logger, createContext } from './logger';

/**
 * Centralized API error handler
 * Converts various error types to appropriate HTTP responses
 */
export function handleApiError(error: unknown, context?: string, logContext?: Record<string, any>): NextResponse {
  // Enhanced error logging
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const contextMessage = context ? `${context}` : 'API operation';
  
  if (error instanceof Error) {
    logger.error(`${contextMessage} failed: ${errorMessage}`, error, createContext(logContext));
  } else {
    logger.error(`${contextMessage} failed with unknown error`, undefined, createContext({ 
      ...logContext, 
      errorType: typeof error,
      errorValue: String(error)
    }));
  }

  // Handle specific error types
  if (error instanceof AuthError) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        code: 'AUTHENTICATION_ERROR'
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ProjectAccessError) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        code: 'ACCESS_DENIED'
      },
      { status: 403 }
    );
  }

  if (error instanceof FileUploadError) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        code: 'FILE_UPLOAD_ERROR'
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        code: 'VALIDATION_ERROR',
        ...(error.field && { field: error.field })
      },
      { status: 400 }
    );
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    // Check for common error patterns and map to appropriate status codes
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    if (error.message.includes('access denied') || error.message.includes('unauthorized')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: 'ACCESS_DENIED'
        },
        { status: 403 }
      );
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    if (error.message.includes('rate limit') || error.message.includes('too many')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: 'RATE_LIMITED'
        },
        { status: 429 }
      );
    }

    if (error.message.includes('quota') || error.message.includes('limit exceeded')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: 'QUOTA_EXCEEDED'
        },
        { status: 402 }
      );
    }

    // Default to 500 for other Error instances
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    { 
      success: false, 
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    },
    { status: 500 }
  );
}

/**
 * Async wrapper for API route handlers with built-in error handling and logging
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>,
  operationName?: string
) {
  return async (...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const operation = operationName || handler.name || 'API Handler';
    
    try {
      logger.serviceCall('API', operation);
      const response = await handler(...args);
      const duration = Date.now() - startTime;
      logger.serviceSuccess('API', operation, duration);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.serviceError('API', operation, error as Error, { duration });
      return handleApiError(error, operation);
    }
  };
}

/**
 * Request validation wrapper
 */
export async function validateRequest<T>(
  request: Request,
  validator: (body: any) => T
): Promise<{ valid: true; data: T } | { valid: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const data = validator(body);
    return { valid: true, data };
  } catch (error) {
    return {
      valid: false,
      response: handleApiError(error, 'Request validation')
    };
  }
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add CORS headers if needed
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  
  return response;
}

/**
 * Success response builder with consistent format
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
  logContext?: Record<string, any>
): NextResponse {
  // Log successful response
  if (logContext?.operation) {
    logger.info(`API ${logContext.operation} successful`, createContext(logContext));
  }

  const response = NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );

  return addSecurityHeaders(response);
}

/**
 * Paginated response builder
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
): NextResponse {
  const response = NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
      ...(message && { message }),
      timestamp: new Date().toISOString(),
    }
  );

  return addSecurityHeaders(response);
}

/**
 * Environment validation
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    'POSTGRES_URL',
    'OPENAI_API_KEY',
    'AUTH_SECRET',
    'CLOUDFLARE_R2_ENDPOINT',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET_NAME',
    'CLOUDFLARE_R2_PUBLIC_URL',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Health check utility
 */
export async function performHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: string;
}> {
  const checks: Record<string, boolean> = {};
  
  // Check environment variables
  const envCheck = validateEnvironment();
  checks.environment = envCheck.valid;

  // Check database connectivity (basic check)
  try {
    // This would be a simple query to test DB connectivity
    // For now, just check if the URL is configured
    checks.database = !!process.env.POSTGRES_URL;
  } catch {
    checks.database = false;
  }

  // Check R2 storage
  try {
    checks.storage = !!(
      process.env.CLOUDFLARE_R2_ENDPOINT &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
    );
  } catch {
    checks.storage = false;
  }

  // Check OpenAI API
  checks.openai = !!process.env.OPENAI_API_KEY;

  // Determine overall status
  const allHealthy = Object.values(checks).every(Boolean);
  const mostHealthy = Object.values(checks).filter(Boolean).length >= Object.keys(checks).length * 0.7;

  const status = allHealthy ? 'healthy' : mostHealthy ? 'degraded' : 'unhealthy';

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
  };
}