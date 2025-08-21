#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function generateLambda(name, httpMethod = 'post', apiPath) {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  const kebabName = name;
  
  const defaultApiPath = apiPath || `/api/${kebabName}`;
  
  // Generate DTO
  const dtoContent = `export interface ${pascalName}Dto {
  // TODO: Add input properties
}

export interface ${pascalName}ResponseDto {
  // TODO: Add response properties
}`;

  // Generate Use Case
  const useCaseContent = `import { UseCase } from '../interfaces/use-case.interface';
import { ${pascalName}Dto, ${pascalName}ResponseDto } from '../dto/${kebabName}.dto';
import { ValidationException } from '../../shared/exceptions/domain.exception';

export class ${pascalName}UseCase implements UseCase<${pascalName}Dto, ${pascalName}ResponseDto> {
  constructor(
    // TODO: Add repository dependencies
  ) {}

  async execute(input: ${pascalName}Dto): Promise<${pascalName}ResponseDto> {
    // TODO: Validate input
    await this.validateInput(input);

    // TODO: Implement business logic

    // TODO: Return response
    return {
      // TODO: Map to response DTO
    };
  }

  private async validateInput(input: ${pascalName}Dto): Promise<void> {
    // TODO: Add validation logic
  }
}`;

  // Generate Lambda Handler
  const handlerContent = `import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Handler } from 'aws-lambda';
import { BaseLambdaHandler } from '../shared/base-lambda.handler';
import { ${pascalName}UseCase } from '../../application/use-cases/${kebabName}.use-case';
import { ${pascalName}Dto, ${pascalName}ResponseDto } from '../../application/dto/${kebabName}.dto';
import { ensureBootstrap } from '../shared/bootstrap';

class ${pascalName}Handler extends BaseLambdaHandler<${pascalName}Dto, ${pascalName}ResponseDto> {
  protected useCase: ${pascalName}UseCase;

  constructor() {
    super();
    // TODO: Initialize use case with dependencies
    this.useCase = new ${pascalName}UseCase(
      // TODO: Add repository instances
    );
  }

  protected async parseInput(event: APIGatewayProxyEvent): Promise<${pascalName}Dto> {
    ${httpMethod.toLowerCase() === 'get' ? `
    // Parse from query parameters or path parameters
    return {
      // TODO: Extract from event.queryStringParameters or event.pathParameters
    };` : `
    if (!event.body) {
      throw new Error('Request body is required');
    }

    try {
      const body = JSON.parse(event.body);
      return {
        // TODO: Extract from body
      };
    } catch (error) {
      throw new Error('Invalid JSON in request body');
    }`}
  }
}

// Lambda handler function
export const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Ensure dependencies are bootstrapped
  await ensureBootstrap();
  
  // Create handler instance
  const handlerInstance = new ${pascalName}Handler();
  
  // Handle the request
  return handlerInstance.handle(event, context);
};`;

  // Create directories if they don't exist
  const dtoDir = path.join(__dirname, '../src/application/dto');
  const useCaseDir = path.join(__dirname, '../src/application/use-cases');
  const handlerDir = path.join(__dirname, '../src/lambdas/handlers');

  [dtoDir, useCaseDir, handlerDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Write files
  fs.writeFileSync(path.join(dtoDir, `${kebabName}.dto.ts`), dtoContent);
  fs.writeFileSync(path.join(useCaseDir, `${kebabName}.use-case.ts`), useCaseContent);
  fs.writeFileSync(path.join(handlerDir, `${kebabName}.handler.ts`), handlerContent);

  // Generate serverless function configuration
  const serverlessFunction = `
// Add this to your serverless.ts functions section:
${camelName}: createApiFunction('${camelName}', 'src/lambdas/handlers/${kebabName}.handler')
  .withTimeout(30)
  .withMemorySize(256)
  .withHttpEvent('${httpMethod.toLowerCase()}', '${defaultApiPath}')
  .build(),`;

  console.log(`✅ Generated Lambda function: ${pascalName}`);
  console.log(`📁 Files created:`);
  console.log(`   - src/application/dto/${kebabName}.dto.ts`);
  console.log(`   - src/application/use-cases/${kebabName}.use-case.ts`);
  console.log(`   - src/lambdas/handlers/${kebabName}.handler.ts`);
  console.log(`\n🔧 Add this to your serverless.ts:`);
  console.log(serverlessFunction);
  console.log(`\n📝 Don't forget to:`);
  console.log(`   1. Implement the business logic in the use case`);
  console.log(`   2. Add the repository dependencies`);
  console.log(`   3. Define the DTO properties`);
  console.log(`   4. Add the function to serverless.ts`);
  console.log(`   5. Test your new Lambda function`);
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node scripts/generate-lambda.js <function-name> [http-method] [api-path]');
  console.error('Example: node scripts/generate-lambda.js create-order post /api/orders');
  process.exit(1);
}

const [functionName, httpMethod = 'post', apiPath] = args;
generateLambda(functionName, httpMethod, apiPath);
