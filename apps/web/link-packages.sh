#!/bin/bash

# Create symlinks for local packages
mkdir -p node_modules/@basagram
ln -sf ../../packages/ui node_modules/@basagram/ui
ln -sf ../../packages/types node_modules/@basagram/types
ln -sf ../../packages/validation node_modules/@basagram/validation
ln -sf ../../packages/utils node_modules/@basagram/utils

echo "✓ Local packages linked"
