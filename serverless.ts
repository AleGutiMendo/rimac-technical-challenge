import { custom, packageConfig, plugins } from './infra/serverless/custom';
import { functions } from './infra/serverless/functions';
import { layers } from './infra/serverless/layers';
import { outputs } from './infra/serverless/outputs';
import { provider } from './infra/serverless/provider';
import { resources as resourcesDef } from './infra/serverless/resources';

const serverlessConfiguration = {
  service: '${env:PROJECT_PREFIX, "rimac-challenge"}-${self:provider.stage}',
  frameworkVersion: '3',
  plugins,
  provider,
  custom,
  layers,
  functions,
  package: packageConfig,
  resources: {
    Resources: resourcesDef,
    Outputs: outputs,
  },
};

module.exports = serverlessConfiguration;
