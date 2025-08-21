export class Logger {
  constructor(private context: string) {}

  info(message: string, data?: any): void {
    console.log(JSON.stringify({
      level: 'INFO',
      context: this.context,
      message,
      data,
      timestamp: new Date().toISOString(),
    }));
  }

  error(message: string, data?: any): void {
    console.error(JSON.stringify({
      level: 'ERROR',
      context: this.context,
      message,
      data,
      timestamp: new Date().toISOString(),
    }));
  }

  warn(message: string, data?: any): void {
    console.warn(JSON.stringify({
      level: 'WARN',
      context: this.context,
      message,
      data,
      timestamp: new Date().toISOString(),
    }));
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({
        level: 'DEBUG',
        context: this.context,
        message,
        data,
        timestamp: new Date().toISOString(),
      }));
    }
  }
}
