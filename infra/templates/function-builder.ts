export interface FunctionConfig {
  name: string;
  handler: string;
  events?: any[];
  timeout?: number;
  memorySize?: number;
  environment?: Record<string, any>;
}

export class FunctionBuilder {
  private config: FunctionConfig;

  constructor(name: string, handler: string) {
    this.config = {
      name,
      handler,
      events: [],
    };
  }

  withTimeout(timeout: number): this {
    this.config.timeout = timeout;
    return this;
  }

  withMemorySize(memorySize: number): this {
    this.config.memorySize = memorySize;
    return this;
  }

  withEnvironment(env: Record<string, any>): this {
    this.config.environment = { ...this.config.environment, ...env };
    return this;
  }

  withHttpEvent(method: string, path: string): this {
    const event = {
      http: {
        method,
        path,
        cors: true,
      },
    };
    this.config.events = this.config.events || [];
    this.config.events.push(event);
    return this;
  }

  withScheduleEvent(rate: string): this {
    const event = {
      schedule: {
        rate,
        enabled: true,
      },
    };
    this.config.events = this.config.events || [];
    this.config.events.push(event);
    return this;
  }

  build(): any {
    const functionDef: any = {
      handler: this.config.handler,
    };

    if (this.config.events && this.config.events.length > 0) {
      functionDef.events = this.config.events;
    }

    if (this.config.timeout) {
      functionDef.timeout = this.config.timeout;
    }

    if (this.config.memorySize) {
      functionDef.memorySize = this.config.memorySize;
    }

    if (this.config.environment) {
      functionDef.environment = this.config.environment;
    }

    return functionDef;
  }
}

export const createApiFunction = (name: string, handler: string) => 
  new FunctionBuilder(name, handler);

export const createScheduledFunction = (name: string, handler: string, schedule: string) => 
  new FunctionBuilder(name, handler).withScheduleEvent(schedule);
