// Authentication middleware for FireLynx
// JWT token verification and user authorization

const jwt = require('jsonwebtoken');
const { db, users } = require('../database');
const { eq } = require('drizzle-orm');

// SECURITY: JWT_SECRET must be provided via environment variable
// Never use hardcoded fallbacks in production
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('🚨 CRITICAL SECURITY ERROR: JWT_SECRET environment variable is required');
  console.error('   Set JWT_SECRET to a strong, randomly generated secret key');
  console.error('   Example: JWT_SECRET="your-256-bit-secret-key-here"');
  process.exit(1);
}

// Authentication middleware - verifies JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from cookies (preferred) or Authorization header
    let token = req.cookies?.accessToken;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database to check current status
    const user = await db
      .select({
        id: users.id,
        tenantId: users.tenantId,
        email: users.email,
        role: users.role,
        status: users.status,
        lockedUntil: users.lockedUntil
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
    
    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const foundUser = user[0];
    
    // Check if user account is active
    if (foundUser.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: `Account is ${foundUser.status}. Please contact administrator.`
      });
    }
    
    // Check if account is locked
    if (foundUser.lockedUntil && new Date() < foundUser.lockedUntil) {
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked'
      });
    }
    
    // Add user info to request object
    req.user = {
      userId: foundUser.id,
      tenantId: foundUser.tenantId,
      email: foundUser.email,
      role: foundUser.role
    };
    
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Access token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid access token'
      });
    }
    
    console.error('❌ Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Optional authentication middleware - doesn't fail if no token, just sets req.user if available
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies?.accessToken;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      // No token provided - continue without authentication
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await db
      .select({
        id: users.id,
        tenantId: users.tenantId,
        email: users.email,
        role: users.role,
        status: users.status
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
    
    if (user.length > 0 && user[0].status === 'active') {
      req.user = {
        userId: user[0].id,
        tenantId: user[0].tenantId,
        email: user[0].email,
        role: user[0].role
      };
    }
    
    next();
    
  } catch (error) {
    // Token verification failed - continue without authentication
    next();
  }
};

// Role-based authorization middleware
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Admin-only authorization
const requireAdmin = requireRole('admin');

// Manager or Admin authorization
const requireManagerOrAdmin = requireRole('admin', 'manager');

// Staff authorization (admin, manager, designer)
const requireStaff = requireRole('admin', 'manager', 'designer');

// PHASE 2: Dynamic tenant resolution middleware
// Resolves tenant from subdomain, path, or header
const TenantService = require('../services/tenantService');

const addTenantContext = async (req, res, next) => {
  try {
    // Dynamic tenant resolution from subdomains/paths
    const tenant = await TenantService.resolveTenantFromRequest(req);
    
    // CRITICAL SECURITY: Validate user belongs to the requested tenant
    if (req.user) {
      // Get the user's actual tenant from database (set during authentication)
      const userActualTenantId = req.user.tenantId;
      
      // Verify the user belongs to the requested tenant
      if (userActualTenantId !== tenant.id) {
        console.error(`🚨 SECURITY VIOLATION: User ${req.user.email} (tenant: ${userActualTenantId}) attempted to access tenant ${tenant.id} (${tenant.slug})`);
        
        return res.status(403).json({ 
          success: false, 
          error: 'Unauthorized tenant access',
          details: 'You do not have permission to access this tenant\'s data'
        });
      }
      
      // User is authorized - add resolved tenant details to user object
      req.user.tenant = tenant;
    }
    
    // Add tenant context to request
    req.tenantId = tenant.id;
    req.tenant = tenant;
    
    console.log(`🏢 Tenant Context: ${tenant.name} (${tenant.slug}) -> ${tenant.id}${req.user ? ` | User: ${req.user.email}` : ' | No user'}`);
    
    next();
  } catch (error) {
    console.error('❌ Tenant Context Error:', error.message);
    
    // Return more specific error messages
    if (error.message.includes('Tenant not found')) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tenant not found',
        details: error.message
      });
    }
    
    if (error.message.includes('not active')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Tenant access denied',
        details: error.message
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to establish tenant context',
      details: error.message
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireManagerOrAdmin,
  requireStaff,
  addTenantContext
};