import { custom, packageConfig } from './infra/serverless/custom';
import { functions } from './infra/serverless/functions';
import { layers } from './infra/serverless/layers';
import { outputs } from './infra/serverless/outputs';
import { provider } from './infra/serverless/provider';
import { resources as resourcesDef } from './infra/serverless/resources';

const serverlessConfig = {
  service: '${env:PROJECT_PREFIX, "rimac-challenge"}-${self:provider.stage}',
  frameworkVersion: '4',
  custom,
  provider,
  layers,
  functions,
  package: packageConfig,
  resources: {
    Resources: resourcesDef,
    Outputs: outputs,
  },
};

module.exports = serverlessConfig;
