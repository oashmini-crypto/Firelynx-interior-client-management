// Authentication middleware for FireLynx
// JWT token verification and user authorization

const jwt = require('jsonwebtoken');
const { db, users } = require('../database');
const { eq } = require('drizzle-orm');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

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

// TEMPORARY: Tenant context middleware for multi-tenant conversion
// Forces default tenant ID until subdomain/path-based tenant resolution is implemented
const addTenantContext = (req, res, next) => {
  // Default tenant ID (will be replaced with proper tenant resolution)
  const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
  
  // Add tenant context to all requests
  req.tenantId = DEFAULT_TENANT_ID;
  
  // Also add to user object if it exists
  if (req.user) {
    req.user.tenantId = DEFAULT_TENANT_ID;
  }
  
  next();
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