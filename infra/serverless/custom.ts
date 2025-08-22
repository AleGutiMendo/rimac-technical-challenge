export const custom = {
  dotenv: {
    path: '.env.${self:provider.stage}',
    include: [
      'RDS_HOST',
      'RDS_PORT',
      'RDS_USERNAME',
      'RDS_PASSWORD',
      'RDS_DATABASE',
      'PROJECT_PREFIX',
    ],
  },
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

export const plugins = [
  'serverless-dotenv-plugin',
  'serverless-esbuild',
  'serverless-aws-documentation',
];

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
