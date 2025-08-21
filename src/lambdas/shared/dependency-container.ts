import { Logger } from '@shared/utils/logger.util';

/**
 * Simple dependency injection container for Lambda functions
 * This allows us to share dependencies across different lambda handlers
 */
export class DependencyContainer {
  private static instance: DependencyContainer;
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();

  private constructor() {}

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  /**
   * Register a service instance
   */
  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  /**
   * Register a factory function for lazy initialization
   */
  registerFactory<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  /**
   * Get a service by key
   */
  get<T>(key: string): T {
    if (this.services.has(key)) {
      return this.services.get(key) as T;
    }

    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      const service = factory();
      this.services.set(key, service);
      return service as T;
    }

    throw new Error(`Service '${key}' not found in container`);
  }

  /**
   * Check if service exists
   */
  has(key: string): boolean {
    return this.services.has(key) || this.factories.has(key);
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

// Service keys constants
export const SERVICE_KEYS = {
  LOGGER: 'logger',
  // Add your repository and service keys here
  USER_REPOSITORY: 'userRepository',
  USER_SERVICE: 'userService',
  // Example:
  // NOTIFICATION_SERVICE: 'notificationService',
  // DATABASE_CONNECTION: 'databaseConnection',
} as const;

// Helper function to get container instance
export const getContainer = () => DependencyContainer.getInstance();
