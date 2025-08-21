import type { AWS } from '@serverless/typescript';

export const custom: AWS['custom'] = {
  documentation: {},
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
};

export const packageConfig = {
  individually: true,
  excludeDevDependencies: true,
  patterns: [
    '!node_modules/**',
    '!layer/**',
    '!infra/**',
    '!test/**',
    '!scripts/**',
    '!coverage/**',
    '!.serverless/**',
    '!*.md',
    '!*.json',
    '!tsconfig*.json',
    '!eslint.config.mjs',
    '!jest.config.js',
    '!README.md',
    '!pnpm-lock.yaml',
    // Exclusión de archivos de entorno y config
    '!.env',
    '!.env.*',
    '!serverless.ts',
    '!openapi.yaml',
    '!.prettierrc',
    '!*.example',
    '!*.prod',
    '!*.dev',
  ],
};

export const plugins = ['serverless-aws-documentation'];
