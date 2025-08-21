# Rimac Technical Challenge

Serverless microservices architecture with Clean Architecture principles using AWS Lambda, Serverless Framework v4 and optimized TypeScript bundles.

## Architecture

This project follows a **serverless microservices architecture** where **each use case is an independent AWS Lambda function**. The project has been optimized for minimal bundle sizes using:

- **Individual packaging**: Each function is packaged separately (~25KB each)
- **Lambda Layers**: Shared dependencies in optimized layers
- **ESBuild**: Native bundling for fast, efficient builds
- **TypeScript**: Full type safety with proper Serverless Framework integration

### Benefits:

- **Ultra-light functions**: 25KB per function vs 600MB+ in previous versions
- **Cost Optimization**: Pay only for actual function size and execution
- **Fast Cold Starts**: Minimal bundle size reduces initialization time
- **Scalability**: Each function scales independently
- **Isolation**: Failures in one function don't affect others

### Layers:

- **Domain**: Contains entities, value objects, repositories interfaces, and business rules
- **Application**: Contains use cases, DTOs, and application interfaces  
- **Infrastructure**: Contains implementations of repositories, external services, and configurations
- **Lambdas**: Contains Lambda handlers and shared utilities
- **Shared**: Contains common utilities, exceptions, constants, and types

## Tech Stack

- **Framework**: Serverless Framework v4 (TypeScript native)
- **Runtime**: Node.js 18
- **Bundler**: ESBuild (native integration)
- **Deployment**: AWS Lambda + Lambda Layers
- **Package Manager**: pnpm
- **Language**: TypeScript with `@serverless/typescript`

## Bundle Optimization

This project implements several optimization strategies:

### Lambda Layers
- **awsSdk Layer**: ~20MB (contains @aws-sdk/*, joi)
- **mysql2 Layer**: ~1.7MB (contains mysql2 client)

### Function Packaging
- **Individual packaging**: `individually: true`
- **ESBuild exclusions**: Dependencies moved to layers
- **Result**: Each function ~25KB vs ~600MB before optimization

### Build Configuration
```typescript
// serverless.ts - optimized configuration
custom: {
  esbuild: {
    bundle: true,
    minify: false,
    sourcemap: true,
    exclude: ['aws-sdk', '@aws-sdk/*', 'mysql2', 'joi'],
    target: 'node18',
    define: { 'require.resolve': undefined },
    platform: 'node',
    concurrency: 10,
  },
},
package: {
  individually: true,
  excludeDevDependencies: true,
  patterns: [
    '!node_modules/**',
    '!layer/**',
    '!infra/**',
    '!test/**',
    // ... other exclusions
  ],
}
```

## Project Structure

```
src/
├── domain/
│   ├── entities/          # Domain entities (Appointment, etc.)
│   ├── repositories/      # Repository interfaces
│   ├── value-objects/     # Domain value objects
│   └── services/         # Domain services
├── application/
│   ├── use-cases/        # Use cases (one per Lambda)
│   ├── dto/              # Data transfer objects
│   ├── interfaces/       # Application interfaces
│   └── services/         # Application services
├── infrastructure/
│   ├── database/         # Database configurations
│   ├── external-services/# External service clients
│   ├── repositories/     # Repository implementations
│   ├── services/         # Infrastructure services (DynamoDB, SNS, etc.)
│   └── config/          # Infrastructure configs
├── lambdas/
│   ├── handlers/        # Lambda handlers (one per use case)
│   └── shared/          # Shared Lambda utilities
└── shared/
    ├── exceptions/      # Custom exceptions
    ├── utils/          # Utility functions
    ├── constants/      # Application constants
    └── types/          # TypeScript types

infra/
├── config/             # Base Serverless configurations
├── templates/          # Infrastructure templates
└── serverless/         # Modular Serverless config
    ├── custom.ts       # ESBuild and custom settings
    ├── provider.ts     # AWS provider configuration
    ├── functions.ts    # Lambda functions definitions
    ├── layers.ts       # Lambda layers configuration
    ├── resources.ts    # CloudFormation resources
    └── outputs.ts      # Stack outputs

layer/                  # Lambda layer dependencies
├── aws-sdk/           # AWS SDK v3 + joi
└── mysql2/            # MySQL client
```
│   └── shared/          # Shared Lambda utilities
└── shared/
    ├── exceptions/      # Custom exceptions
    ├── utils/          # Utility functions
    ├── constants/      # Application constants
    └── types/          # TypeScript types

infra/
├── config/             # Serverless configurations
├── templates/          # Infrastructure templates
└── serverless/         # Serverless utilities
```

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Setup AWS Profile
# Make sure you have configured your AWS profile 'ale-gutimendo-dev'
# or set AWS_PROFILE environment variable to your preferred profile
```

## Development

```bash
# Build TypeScript to JavaScript
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Run with Serverless Offline (if needed)
pnpm sls:offline
```

## Deployment

### AWS Profile Configuration

The deployment uses environment variables for AWS configuration. You can configure this in multiple ways:

**Option 1: Using .env file (Recommended)**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your configuration
AWS_PROFILE=your-aws-profile-name
PROJECT_PREFIX=rimac-challenge
STAGE=prod
```

**Option 2: Export environment variables**
```bash
# Set your AWS profile
export AWS_PROFILE=your-aws-profile-name
export PROJECT_PREFIX=rimac-challenge
export STAGE=prod

# Deploy
pnpm deploy:script
```

**Option 3: Inline environment variables**
```bash
AWS_PROFILE=your-profile pnpm deploy:script
```

### Full Deployment with Documentation

For complete deployment including API documentation:

```bash
# Option 1: Using .env file (automatically loads variables)
pnpm deploy:env

# Option 2: Using npm script (simple)
pnpm deploy:full

# Option 3: Using bash script (detailed output)
pnpm deploy:script
```

All options will:
1. Build TypeScript code
2. Deploy Serverless infrastructure to AWS
3. Generate Swagger/OpenAPI documentation
4. Upload documentation to S3
5. Display the documentation URL

The bash script provides detailed progress information and a comprehensive summary.

### Environment Variables

Required environment variables in `.env` file:

```bash
# AWS Configuration (Required)
AWS_PROFILE=your-aws-profile-name

# Project Configuration (Optional - has defaults)
PROJECT_PREFIX=rimac-challenge
STAGE=prod
AWS_REGION=us-east-1
```

If you don't set these variables, the system will use defaults where possible, but **AWS_PROFILE is recommended** for proper credential management.

### Manual Step-by-Step Deployment

If you prefer to run each step manually:

```bash
# 1. Build the project
pnpm build

# 2. Deploy Serverless infrastructure
pnpm sls:deploy:prod

# 3. Generate Swagger documentation
pnpm docs:generate

# 4. Upload documentation to S3
pnpm docs:upload

# 5. Get documentation URL
pnpm docs:url
```

### API Documentation

After deployment, your API documentation will be available at:
- **Swagger UI**: `http://rimac-challenge-prod-swagger-docs-prod.s3-website-us-east-1.amazonaws.com`
- **OpenAPI YAML**: `http://rimac-challenge-prod-swagger-docs-prod.s3-website-us-east-1.amazonaws.com/openapi.yaml`

The documentation is served as static files from S3, providing:
- ✅ Fast loading times
- ✅ No Lambda costs for documentation
- ✅ Interactive Swagger UI interface
- ✅ Always available (no cold starts)

### Documentation Scripts

Available documentation management scripts:

```bash
# Generate documentation HTML from OpenAPI
pnpm docs:generate

# Upload documentation to S3
pnpm docs:upload

# Get documentation URL
pnpm docs:url
```

### Deployment Process

The optimized deployment process:

1. **Build layers**: Dependencies are organized into Lambda layers
2. **Bundle functions**: Each function is bundled individually with ESBuild
3. **Package optimization**: Only necessary files are included (~25KB per function)
4. **Deploy infrastructure**: Functions + layers + S3 bucket to AWS
5. **Generate documentation**: Convert OpenAPI YAML to interactive HTML
6. **Upload documentation**: Static files to S3 bucket

**Result**: Ultra-fast deployments with minimal function sizes and static documentation hosting.

## Scripts

- `pnpm build` - Build TypeScript to JavaScript  
- `pnpm test` - Run tests
- `pnpm lint` - Run linter
- `pnpm sls:offline` - Run serverless offline (if needed)
- `pnpm sls:deploy:prod` - Deploy to production
- `pnpm sls:remove` - Remove deployment
- `pnpm sls:logs:appointment` - View appointment Lambda logs
- `pnpm generate:lambda` - Generate new Lambda function boilerplate
- `pnpm docs:generate` - Generate Swagger/OpenAPI documentation HTML
- `pnpm docs:upload` - Upload documentation to S3
- `pnpm docs:url` - Get documentation URL
- `pnpm deploy:full` - Complete deployment (infrastructure + documentation)
- `pnpm deploy:script` - Complete deployment with detailed output
- `pnpm deploy:env` - Complete deployment loading .env variables

## Environment Variables

See `.env.example` for required environment variables:

```bash
# AWS Configuration (Required)
AWS_PROFILE=your-aws-profile-name
AWS_REGION=us-east-1

# Project Configuration (Optional - has defaults)
PROJECT_PREFIX=rimac-challenge
STAGE=prod

# Alternative AWS Configuration (if not using profile)
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key

# Application
NODE_ENV=production
PORT=3000
```

**Important**: 
- `AWS_PROFILE` should match your local AWS CLI profile name
- Each developer can have their own `.env` file with their specific profile
- Never commit `.env` files to version control (already in `.gitignore`)

## Deployed Resources

After successful deployment, you'll have:

### API Endpoints
- **POST** `https://{api-id}.execute-api.us-east-1.amazonaws.com/prod/api/appointments`
- **GET** `https://{api-id}.execute-api.us-east-1.amazonaws.com/prod/api/appointments/{insuredId}`

### API Documentation
- **Swagger UI**: `http://rimac-challenge-prod-swagger-docs-prod.s3-website-us-east-1.amazonaws.com`
- **OpenAPI YAML**: Available at the same domain under `/openapi.yaml`

### Lambda Functions (25KB each)
- `appointment` - Create appointments
- `listAppointments` - List appointments by insured ID
- `appointmentPe` - Process Peru appointments (SQS)
- `appointmentCl` - Process Chile appointments (SQS)  
- `appointmentConfirmation` - Process confirmations (SQS)

### Lambda Layers
- `awsSdk` - AWS SDK v3 clients + joi (~20MB)
- `mysql2` - MySQL client (~1.7MB)

### Infrastructure
- DynamoDB tables for appointments
- SQS queues for async processing
- SNS topics for notifications
- EventBridge for event routing
- S3 bucket for documentation hosting

## Creating New Lambda Functions

Each use case becomes an independent Lambda function. Follow these steps to create a new optimized function:

### 1. Create the Use Case

```typescript
// src/application/use-cases/my-new-use-case.ts
import { UseCase } from '../interfaces/use-case.interface';

export class MyNewUseCase implements UseCase<InputDto, OutputDto> {
  constructor(private repository: MyRepository) {}

  async execute(input: InputDto): Promise<OutputDto> {
    // Business logic here
  }
}
```

### 2. Create DTOs

```typescript
// src/application/dto/my-dto.ts
export interface MyInputDto {
  // Input properties
}

export interface MyOutputDto {
  // Output properties
}
```

### 3. Create Lambda Handler

```typescript
// src/lambdas/handlers/my-handler.handler.ts
import { BaseLambdaHandler } from '../shared/base-lambda.handler';
import { MyNewUseCase } from '../../application/use-cases/my-new-use-case';

class MyHandler extends BaseLambdaHandler<InputDto, OutputDto> {
  protected useCase: MyNewUseCase;

  constructor() {
    super();
    this.useCase = new MyNewUseCase(/* dependencies */);
  }

  protected async parseInput(event: APIGatewayProxyEvent): Promise<InputDto> {
    // Parse input from event
  }
}

export const handler = async (event, context) => {
  await ensureBootstrap();
  return new MyHandler().handle(event, context);
};
```

### 4. Add to Serverless Configuration

```typescript
// infra/serverless/functions.ts
import { createApiFunction } from '../../infra/templates/function-builder';

export const functions = {
  // ... existing functions
  myNewFunction: {
    ...createApiFunction('myNewFunction', 'src/lambdas/handlers/my-handler.handler')
      .withTimeout(30)
      .withMemorySize(256)
      .withHttpEvent('post', '/api/my-resource')
      .build(),
    layers: [{ Ref: 'AwsSdkLambdaLayer' }], // Use appropriate layers
  },
}
```

The new function will automatically:
- ✅ Be bundled separately (~25KB)
- ✅ Use shared Lambda layers for dependencies
- ✅ Have optimized ESBuild configuration
- ✅ Follow the established patterns

## Performance & Optimization

### Bundle Size Comparison
| Metric | Before Optimization | After Optimization |
|--------|-------------------|------------------|
| Function Size | ~600MB+ | ~25KB each |
| Deploy Time | 5+ minutes | ~3 minutes |
| Cold Start | 5-10 seconds | <1 second |
| Layer Usage | None | 2 optimized layers |

### Key Optimizations Applied
1. **Individual Packaging**: `individually: true` 
2. **Lambda Layers**: Shared dependencies (AWS SDK, mysql2, joi)
3. **ESBuild Exclusions**: Dependencies moved to layers
4. **TypeScript Native**: Using Serverless Framework v4 native TypeScript support
5. **Minimal Patterns**: Excluding unnecessary files and folders

### Troubleshooting Bundle Size Issues

If you encounter bundle size issues:

```bash
# Check individual function sizes
du -sh .serverless/*.zip

# Inspect bundle contents  
unzip -l .serverless/functionName.zip | head -50

# Check layer sizes
du -sh .serverless/awsSdk.zip .serverless/mysql2.zip
```

**Common fixes:**
- Add heavy dependencies to layers, not functions
- Use `exclude` in ESBuild config for dev dependencies  
- Check `patterns` in package config for unnecessary inclusions

## AWS Lambda Configuration

The application uses Serverless Framework v4 with optimized configuration:

- **Main config**: `serverless.ts` - Entry point with TypeScript imports
- **Modular config**: `infra/serverless/` - Separated concerns (functions, layers, provider, etc.)
- **Function builder**: `infra/templates/function-builder.ts` - Reusable function patterns
- **ESBuild integration**: Native bundling with optimization
- **Lambda layers**: Shared dependencies for cost and performance optimization

### Configuration Files Structure
```
serverless.ts                 # Main entry point
infra/
├── config/base.ts            # Base AWS configuration  
├── templates/function-builder.ts  # Function utilities
└── serverless/               # Modular serverless config
    ├── custom.ts             # ESBuild + custom settings
    ├── provider.ts           # AWS provider config
    ├── functions.ts          # Lambda functions
    ├── layers.ts             # Lambda layers
    ├── resources.ts          # CloudFormation resources
    └── outputs.ts            # Stack outputs
```

## Clean Architecture Guidelines

- **Domain layer** should not depend on any other layer
- **Application layer** can only depend on the Domain layer
- **Infrastructure layer** can depend on Domain and Application layers
- **Presentation layer** can depend on all layers but mainly Application layer

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the Clean Architecture principles
3. Ensure functions remain lightweight (check bundle sizes)
4. Add tests for new functionality
5. Run linting and tests: `pnpm test && pnpm lint`
6. Create a pull request

### Development Guidelines
- Keep functions under 25KB (use layers for heavy dependencies)
- Follow TypeScript strict mode
- Use ESBuild-compatible imports
- Test locally before deploying
- Document new environment variables

## License

This project is private and confidential.

## Layer Preparation (Lambda Layers)

> **Important:** Only the definition files (`package.json`) of each layer should be versioned. **DO NOT** commit the generated `node_modules` or `pnpm-lock.yaml` inside the layers.

### How to prepare the layers?

1. Each layer has its own `package.json` in `layer/aws-sdk/nodejs/` and `layer/mysql2/nodejs/`.
2. To populate the `node_modules` for each layer, run:
   ```bash
   cd layer/aws-sdk/nodejs && pnpm install --prod
   cd layer/mysql2/nodejs && pnpm install --prod
   ```
3. **Do not commit** the `node_modules` or generated files, only the `package.json`.

## Generated documentation (docs/)

The `/docs` folder is generated automatically by the documentation script and **should not be committed** to the repository. Each developer should generate it locally with:

```bash
pnpm docs:generate
```

## Versioning best practices

- Only version source code, layer definitions, and configuration files.
- Do not commit generated files, dependencies, or generated documentation.
- Before deploying, make sure to populate the layers and generate the documentation locally.
- If you clone the repo, remember:
  - Install root dependencies: `pnpm install`
  - Install dependencies for each layer as indicated above
  - Generate documentation: `pnpm docs:generate`
