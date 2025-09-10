// Diagnostics middleware for API monitoring and error tracking
const diagnostics = {
  requests: [],
  errors: [],
  maxBufferSize: 1000, // Keep last 1000 entries
  
  // Add request to buffer
  logRequest(req, res, statusCode, responseTime, error = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      responseTime: responseTime + 'ms',
      userAgent: req.get('User-Agent') || 'Unknown',
      ip: req.ip || req.connection.remoteAddress || 'Unknown',
      payload: req.method === 'POST' || req.method === 'PUT' ? req.body : null,
      error: error ? {
        message: error.message,
        stack: error.stack
      } : null
    };
    
    // Add to appropriate buffer
    if (error || statusCode >= 400) {
      this.errors.unshift(entry);
      if (this.errors.length > this.maxBufferSize) {
        this.errors = this.errors.slice(0, this.maxBufferSize);
      }
    }
    
    this.requests.unshift(entry);
    if (this.requests.length > this.maxBufferSize) {
      this.requests = this.requests.slice(0, this.maxBufferSize);
    }
    
    // Console log for failing API calls
    if (error || statusCode >= 400) {
      console.error(`❌ API DIAGNOSTICS: ${req.method} ${req.originalUrl} - Status: ${statusCode}`, {
        error: error ? error.message : 'No error message',
        payload: req.body,
        responseTime
      });
    }
  },
  
  // Get diagnostic data
  getData() {
    return {
      summary: {
        totalRequests: this.requests.length,
        totalErrors: this.errors.length,
        errorRate: this.requests.length > 0 ? ((this.errors.length / this.requests.length) * 100).toFixed(2) + '%' : '0%',
        lastUpdated: new Date().toISOString()
      },
      recentRequests: this.requests.slice(0, 50), // Last 50 requests
      recentErrors: this.errors.slice(0, 50), // Last 50 errors
      errorsByEndpoint: this.getErrorsByEndpoint(),
      statusCodes: this.getStatusCodeDistribution()
    };
  },
  
  // Group errors by endpoint
  getErrorsByEndpoint() {
    const grouped = {};
    this.errors.forEach(error => {
      const endpoint = error.url;
      if (!grouped[endpoint]) {
        grouped[endpoint] = {
          count: 0,
          lastError: null,
          methods: new Set()
        };
      }
      grouped[endpoint].count++;
      grouped[endpoint].lastError = error.timestamp;
      grouped[endpoint].methods.add(error.method);
    });
    
    // Convert methods Set to Array for JSON serialization
    Object.keys(grouped).forEach(key => {
      grouped[key].methods = Array.from(grouped[key].methods);
    });
    
    return grouped;
  },
  
  // Get status code distribution
  getStatusCodeDistribution() {
    const distribution = {};
    this.requests.forEach(req => {
      const status = req.status;
      distribution[status] = (distribution[status] || 0) + 1;
    });
    return distribution;
  },
  
  // Clear all diagnostic data
  clear() {
    this.requests = [];
    this.errors = [];
    return { message: 'Diagnostic data cleared', timestamp: new Date().toISOString() };
  }
};

// Middleware function to track requests and responses
function diagnosticsMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Track response
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    diagnostics.logRequest(req, res, res.statusCode, responseTime);
    return originalSend.call(this, body);
  };
  
  res.json = function(body) {
    const responseTime = Date.now() - startTime;
    diagnostics.logRequest(req, res, res.statusCode, responseTime);
    return originalJson.call(this, body);
  };
  
  // Track errors
  const originalNext = next;
  next = function(error) {
    if (error) {
      const responseTime = Date.now() - startTime;
      diagnostics.logRequest(req, res, res.statusCode || 500, responseTime, error);
    }
    return originalNext(error);
  };
  
  next();
}

module.exports = { diagnostics, diagnosticsMiddleware };