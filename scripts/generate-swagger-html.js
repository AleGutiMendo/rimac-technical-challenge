#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script para generar un archivo HTML que renderice la documentación Swagger/OpenAPI
function generateSwaggerHTML() {
  const openApiYamlPath = path.join(__dirname, '../openapi.yaml');
  const outputPath = path.join(__dirname, '../docs');

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Leer el archivo OpenAPI YAML
  const openApiContent = fs.readFileSync(openApiYamlPath, 'utf8');

  // Generar HTML con Swagger UI
  const swaggerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rimac Technical Challenge API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(require('js-yaml').load(openApiContent))},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;

  // Escribir archivo HTML
  fs.writeFileSync(path.join(outputPath, 'index.html'), swaggerHTML);

  // Copiar archivo YAML para referencia
  fs.copyFileSync(openApiYamlPath, path.join(outputPath, 'openapi.yaml'));

  console.log('✅ Swagger HTML documentation generated in docs/');
  console.log('📁 Files created:');
  console.log('   - docs/index.html');
  console.log('   - docs/openapi.yaml');
}

// Instalar dependencia js-yaml si no existe
try {
  require('js-yaml');
  generateSwaggerHTML();
} catch (e) {
  console.log('js-yaml not found. Please install it first: pnpm add js-yaml');
  process.exit(1);
}
