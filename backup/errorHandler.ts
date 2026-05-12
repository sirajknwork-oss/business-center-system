// Error Handler for Production
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: any, context: string) {
  console.error(`[${context}] Error:`, {
    message: error.message,
    status: error.status,
    code: error.code,
    timestamp: new Date().toISOString()
  });
  
  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    // sendToSentry(error);
    // sendToLoggingService(error);
  }
}
