import { z } from "zod";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  userId?: string;
  projectId?: string;
  segmentId?: string;
  fileId?: string;
  requestId?: string;
  duration?: number;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  service?: string;
  operation?: string;
}

class Logger {
  private readonly minLevel: LogLevel;
  private readonly isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.minLevel = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = LogLevel[entry.level];
    const service = entry.service ? `[${entry.service}]` : '';
    const operation = entry.operation ? `[${entry.operation}]` : '';
    
    let message = `${timestamp} ${level}${service}${operation} ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      message += ` | Context: ${JSON.stringify(entry.context)}`;
    }
    
    return message;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      service: context?.service as string,
      operation: context?.operation as string,
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        if (error) console.debug(error.stack);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        if (error) console.info(error.stack);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        if (error) console.warn(error.stack);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        if (error) console.error(error.stack);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Service-specific logging methods
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`${method} ${path}`, {
      ...context,
      service: 'API',
      operation: 'REQUEST',
    });
  }

  apiResponse(method: string, path: string, status: number, duration: number, context?: LogContext): void {
    this.info(`${method} ${path} ${status}`, {
      ...context,
      service: 'API',
      operation: 'RESPONSE',
      duration,
    });
  }

  apiError(method: string, path: string, error: Error, context?: LogContext): void {
    this.error(`${method} ${path} failed`, error, {
      ...context,
      service: 'API',
      operation: 'ERROR',
    });
  }

  serviceCall(service: string, operation: string, context?: LogContext): void {
    this.info(`${service}.${operation} started`, {
      ...context,
      service,
      operation,
    });
  }

  serviceSuccess(service: string, operation: string, duration: number, context?: LogContext): void {
    this.info(`${service}.${operation} completed`, {
      ...context,
      service,
      operation,
      duration,
    });
  }

  serviceError(service: string, operation: string, error: Error, context?: LogContext): void {
    this.error(`${service}.${operation} failed`, error, {
      ...context,
      service,
      operation,
    });
  }

  databaseQuery(query: string, duration?: number, context?: LogContext): void {
    this.debug(`Database query: ${query}`, {
      ...context,
      service: 'Database',
      operation: 'QUERY',
      duration,
    });
  }

  databaseError(query: string, error: Error, context?: LogContext): void {
    this.error(`Database query failed: ${query}`, error, {
      ...context,
      service: 'Database',
      operation: 'ERROR',
    });
  }

  fileOperation(operation: string, filePath: string, context?: LogContext): void {
    this.debug(`File ${operation}: ${filePath}`, {
      ...context,
      service: 'FileSystem',
      operation: operation.toUpperCase(),
    });
  }

  fileError(operation: string, filePath: string, error: Error, context?: LogContext): void {
    this.error(`File ${operation} failed: ${filePath}`, error, {
      ...context,
      service: 'FileSystem',
      operation: 'ERROR',
    });
  }

  videoGeneration(stage: string, projectId: string, segmentId?: string, context?: LogContext): void {
    this.info(`Video generation ${stage}`, {
      ...context,
      projectId,
      segmentId,
      service: 'VideoGeneration',
      operation: stage.toUpperCase(),
    });
  }

  videoGenerationError(stage: string, projectId: string, error: Error, context?: LogContext): void {
    this.error(`Video generation ${stage} failed`, error, {
      ...context,
      projectId,
      service: 'VideoGeneration',
      operation: 'ERROR',
    });
  }

  aiRequest(provider: string, model: string, operation: string, context?: LogContext): void {
    this.info(`${provider} ${model} ${operation} started`, {
      ...context,
      service: provider,
      operation,
      model,
    });
  }

  aiResponse(provider: string, model: string, operation: string, duration: number, context?: LogContext): void {
    this.info(`${provider} ${model} ${operation} completed`, {
      ...context,
      service: provider,
      operation,
      model,
      duration,
    });
  }

  aiError(provider: string, model: string, operation: string, error: Error, context?: LogContext): void {
    this.error(`${provider} ${model} ${operation} failed`, error, {
      ...context,
      service: provider,
      operation,
      model,
    });
  }

  billing(operation: string, customerId?: string, context?: LogContext): void {
    this.info(`Billing ${operation}`, {
      ...context,
      customerId,
      service: 'Billing',
      operation: operation.toUpperCase(),
    });
  }

  billingError(operation: string, error: Error, context?: LogContext): void {
    this.error(`Billing ${operation} failed`, error, {
      ...context,
      service: 'Billing',
      operation: 'ERROR',
    });
  }

  auth(operation: string, userId?: string, context?: LogContext): void {
    this.info(`Auth ${operation}`, {
      ...context,
      userId,
      service: 'Auth',
      operation: operation.toUpperCase(),
    });
  }

  authError(operation: string, error: Error, context?: LogContext): void {
    this.error(`Auth ${operation} failed`, error, {
      ...context,
      service: 'Auth',
      operation: 'ERROR',
    });
  }

  // Performance monitoring
  performance(operation: string, duration: number, context?: LogContext): void {
    const level = duration > 5000 ? LogLevel.WARN : duration > 1000 ? LogLevel.INFO : LogLevel.DEBUG;
    this.log(level, `Performance: ${operation} took ${duration}ms`, {
      ...context,
      service: 'Performance',
      operation: 'MONITOR',
      duration,
    });
  }

  // Security logging
  security(event: string, context?: LogContext): void {
    this.warn(`Security event: ${event}`, {
      ...context,
      service: 'Security',
      operation: 'EVENT',
    });
  }

  securityError(event: string, error: Error, context?: LogContext): void {
    this.error(`Security violation: ${event}`, error, {
      ...context,
      service: 'Security',
      operation: 'VIOLATION',
    });
  }

  // Structured data logging for analytics
  metric(name: string, value: number, unit?: string, context?: LogContext): void {
    this.info(`Metric: ${name} = ${value}${unit ? ` ${unit}` : ''}`, {
      ...context,
      service: 'Metrics',
      operation: 'RECORD',
      metricName: name,
      metricValue: value,
      metricUnit: unit,
    });
  }

  // Request tracing
  trace(operation: string, traceId: string, context?: LogContext): void {
    this.debug(`Trace: ${operation}`, {
      ...context,
      traceId,
      service: 'Trace',
      operation: 'STEP',
    });
  }
}

// Create singleton instance
export const logger = new Logger();

// Utility functions for timing operations
export function withTiming<T>(
  operation: string,
  fn: () => T | Promise<T>,
  context?: LogContext
): T | Promise<T> {
  const start = Date.now();
  logger.trace(`${operation} started`, { ...context, operation });

  const handleResult = (result: T) => {
    const duration = Date.now() - start;
    logger.performance(operation, duration, context);
    return result;
  };

  const handleError = (error: any) => {
    const duration = Date.now() - start;
    logger.error(`${operation} failed after ${duration}ms`, error, context);
    throw error;
  };

  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(handleResult).catch(handleError);
    }
    return handleResult(result);
  } catch (error) {
    handleError(error);
    return undefined as T; // This will never be reached
  }
}

// Request ID generator for tracing
let requestIdCounter = 0;
export function generateRequestId(): string {
  return `req_${Date.now()}_${++requestIdCounter}`;
}

// Context builder utilities
export function createContext(base: LogContext = {}): LogContext {
  return {
    requestId: generateRequestId(),
    ...base,
  };
}

export function createUserContext(userId: string, additional: LogContext = {}): LogContext {
  return {
    userId,
    requestId: generateRequestId(),
    ...additional,
  };
}

export function createProjectContext(
  userId: string,
  projectId: string,
  additional: LogContext = {}
): LogContext {
  return {
    userId,
    projectId,
    requestId: generateRequestId(),
    ...additional,
  };
}