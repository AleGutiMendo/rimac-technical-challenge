import { DependencyContainer, SERVICE_KEYS } from './dependency-container';
import { Logger } from '@shared/utils/logger.util';

/**
 * Bootstrap function to initialize all dependencies
 * This should be called once at the start of each Lambda handler
 */
export async function bootstrap(): Promise<DependencyContainer> {
  const container = DependencyContainer.getInstance();
  
  // Register common services
  container.registerFactory(SERVICE_KEYS.LOGGER, () => new Logger('Lambda'));
  
  // Register repositories (implement these based on your needs)
  // container.registerFactory(SERVICE_KEYS.USER_REPOSITORY, () => 
  //   new UserRepository(/* dependencies */)
  // );
  
  // Register domain services
  // container.registerFactory(SERVICE_KEYS.USER_SERVICE, () => 
  //   new UserService(container.get(SERVICE_KEYS.USER_REPOSITORY))
  // );
  
  // Initialize any async services here
  await initializeAsyncServices(container);
  
  return container;
}

async function initializeAsyncServices(container: DependencyContainer): Promise<void> {
  // Initialize database connections, external services, etc.
  // Example:
  // const dbConnection = await createDatabaseConnection();
  // container.register(SERVICE_KEYS.DATABASE_CONNECTION, dbConnection);
}

/**
 * Lambda cold start handler - ensures dependencies are initialized
 */
let isBootstrapped = false;
export async function ensureBootstrap(): Promise<DependencyContainer> {
  if (!isBootstrapped) {
    await bootstrap();
    isBootstrapped = true;
  }
  return DependencyContainer.getInstance();
}
