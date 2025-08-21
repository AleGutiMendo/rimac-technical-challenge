export interface ServerlessConfig {
  service: string;
  frameworkVersion: string;
  provider: {
    name: string;
    runtime: string;
    region: string;
    stage: string;
    timeout: number;
    memorySize: number;
    environment: Record<string, any>;
    iamRoleStatements?: any[];
    profile?: string;
  };
  plugins: string[];
  custom: Record<string, any>;
  functions: Record<string, any>;
  resources?: any;
}

export const baseConfig: Partial<ServerlessConfig> = {
  frameworkVersion: '4',
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: '${opt:region, "us-east-1"}',
    stage: '${opt:stage, "dev"}',
    timeout: 30,
    memorySize: 512,
    environment: {
      NODE_ENV: '${self:provider.stage}',
      PROJECT_PREFIX: '${env:PROJECT_PREFIX, "rimac-challenge"}',
      STAGE: '${self:provider.stage}',
    },
  },
  plugins: ['serverless-offline'],
  custom: {
    'serverless-offline': {
      httpPort: 3000,
      babelOptions: {
        presets: ['env'],
      },
    },
  },
};
