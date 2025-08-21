#!/bin/bash
# Script para limpiar node_modules del layer aws-sdk y dejar solo lo esencial
set -e
cd "$(dirname $0)/../layer/aws-sdk/nodejs/node_modules"

# Eliminar archivos innecesarios
echo "Eliminando tests, docs, markdown, maps y tipos..."
find . -type d -name "test" -o -name "tests" -o -name "__tests__" | xargs rm -rf || true
find . -type f -name "*.md" -o -name "*.map" -o -name "*.d.ts" | xargs rm -f || true
find . -type d -name "docs" | xargs rm -rf || true

echo "Limpieza de layer aws-sdk completada."
