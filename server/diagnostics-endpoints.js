// Diagnostics endpoints for debugging and verification
const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');

// Get git commit hash and build time
function getBuildInfo() {
  let gitCommit = 'unknown';
  try {
    gitCommit = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    gitCommit = 'no-git';
  }
  
  return {
    gitCommit,
    buildTime: new Date().toISOString(),
    service: 'api',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  };
}

// GET /__version - Build and version info
router.get('/__version', (req, res) => {
  res.json(getBuildInfo());
});

// GET /__routes - List all registered routes
router.get('/__routes', (req, res) => {
  const routes = [];
  
  function extractRoutes(stack, basePath = '') {
    stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
        routes.push({
          path: basePath + layer.route.path,
          methods: methods
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        extractRoutes(layer.handle.stack, basePath + (layer.regexp.source.match(/[^\\\/\?\(\)]+/) || [''])[0].replace(/\\/g, ''));
      }
    });
  }
  
  extractRoutes(req.app._router.stack);
  
  res.json({
    routes: routes.filter(r => r.path !== '/__routes'), // Don't include this endpoint
    total: routes.length - 1
  });
});

// GET /__healthz - Health check
router.get('/__healthz', (req, res) => {
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

module.exports = router;