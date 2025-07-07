#!/usr/bin/env node

const { FigmaIntegration } = require('./figma-integration');
const DesignSystemWatcher = require('./design-watcher');

const runDesignSync = async () => {
  console.log('🎨 Running weekly design sync...');

  const figma = new FigmaIntegration();
  await figma.fetchDesignTokens();

  const watcher = new DesignSystemWatcher();
  watcher.watchDesignChanges();

  console.log('✅ Design sync complete');
};

runDesignSync();
