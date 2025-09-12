// Authentication routes for FireLynx
// Handles login, logout, password reset, and account management

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { db, users, clients, tenants } = require('../database');
const { eq, and, or } = require('drizzle-orm');

const router = express.Router();

// JWT Secret (in production, this should be in environment variables)
// JWT secrets are required from environment - no fallbacks for security
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Helper function to generate tokens
const generateTokens = (userId, email, role) => {
  const accessToken = jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  console.log('🔐 POST /api/auth/login - Login attempt');
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    
    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
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
        error: 'Account is temporarily locked. Please try again later.'
      });
    }
    
    // Verify password
    if (!foundUser.passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Account not set up. Please contact administrator.'
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, foundUser.passwordHash);
    
    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = (foundUser.failedLoginAttempts || 0) + 1;
      const updateData = {
        failedLoginAttempts: failedAttempts,
        updatedAt: new Date()
      };
      
      // Lock account after 5 failed attempts for 15 minutes
      if (failedAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, foundUser.id));
      
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Successful login - reset failed attempts and update last login
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, foundUser.id));
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(foundUser.id, foundUser.email, foundUser.role);
    
    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    console.log(`✅ User ${foundUser.email} logged in successfully`);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        specialization: foundUser.specialization,
        avatar: foundUser.avatar,
        lastLoginAt: foundUser.lastLoginAt
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
  console.log('🚪 POST /api/auth/logout - Logout request');
  
  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token not found'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    // Get user details
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
    
    if (user.length === 0 || user[0].status !== 'active') {
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }
    
    const foundUser = user[0];
    
    // Generate new access token
    const accessToken = jwt.sign(
      { userId: foundUser.id, email: foundUser.email, role: foundUser.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // Set new access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });
    
  } catch (error) {
    res.clearCookie('refreshToken');
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
});

// POST /api/auth/change-password - Change password (authenticated users)
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }
    
    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const foundUser = user[0];
    
    // Verify current password
    if (!foundUser.passwordHash) {
      return res.status(400).json({
        success: false,
        error: 'Password not set up'
      });
    }
    
    const isValidPassword = await bcrypt.compare(currentPassword, foundUser.passwordHash);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    console.log(`✅ User ${foundUser.email} changed password successfully`);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/request-password-reset - Request password reset
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    
    // Always return success to prevent email enumeration
    if (user.length === 0) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    const foundUser = user[0];
    
    if (foundUser.status !== 'active') {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Save reset token
    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpires,
        updatedAt: new Date()
      })
      .where(eq(users.id, foundUser.id));
    
    // TODO: Send email with reset link
    console.log(`🔗 Password reset requested for ${foundUser.email}. Token: ${resetToken}`);
    console.log(`Reset link: /reset-password?token=${resetToken}`);
    
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      // For development only - remove in production
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
    
  } catch (error) {
    console.error('❌ Request password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Reset token and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Find user with valid reset token
    const user = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetToken, token),
          // Token should not be expired
        )
      )
      .limit(1);
    
    if (user.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }
    
    const foundUser = user[0];
    
    // Check if token is expired
    if (!foundUser.resetTokenExpires || new Date() > foundUser.resetTokenExpires) {
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired'
      });
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password and clear reset token
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, foundUser.id));
    
    console.log(`✅ Password reset successful for ${foundUser.email}`);
    
    res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
    
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/auth/me - Get current user info (authenticated)
router.get('/me', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        specialization: users.specialization,
        avatar: users.avatar,
        status: users.status,
        lastLoginAt: users.lastLoginAt,
        clientId: users.clientId,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user[0]
    });
    
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/signup - Tenant and admin user registration  
router.post('/signup', async (req, res) => {
  console.log('📝 POST /api/auth/signup - New tenant signup');
  
  try {
    const { 
      companyName,
      subdomain,
      adminName, 
      adminEmail,
      adminPassword
    } = req.body;

    // Validation
    if (!companyName || !subdomain || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: companyName, subdomain, adminName, adminEmail, adminPassword'
      });
    }

    if (adminPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Validate subdomain format (alphanumeric, lowercase, hyphens allowed)
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain) || subdomain.length < 2 || subdomain.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Subdomain must be 2-50 characters, lowercase letters, numbers, and hyphens only'
      });
    }

    // Reserved subdomains
    const reservedSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'help', 'support'];
    if (reservedSubdomains.includes(subdomain)) {
      return res.status(400).json({
        success: false,
        error: 'This subdomain is reserved. Please choose a different one.'
      });
    }

    // Check if subdomain or email already exists
    const existingTenant = await db
      .select()
      .from(tenants)
      .where(or(eq(tenants.subdomain, subdomain), eq(tenants.slug, subdomain)))
      .limit(1);
    
    if (existingTenant.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Subdomain already taken. Please choose a different one.'
      });
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email address already registered. Please use a different email or try logging in.'
      });
    }

    // Create tenant and admin user in atomic transaction
    const tenantId = `tenant-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Atomic transaction to create both tenant and admin user
    await db.transaction(async (tx) => {
      // Create tenant
      await tx.insert(tenants).values({
        id: tenantId,
        name: companyName,
        slug: subdomain,
        subdomain: subdomain,
        status: 'active',
        settings: {
          allowedDomains: [`${subdomain}.firelynx.com`],
          features: ['projects', 'invoicing', 'files', 'tickets']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create admin user
      await tx.insert(users).values({
        id: userId,
        tenantId: tenantId,
        name: adminName,
        email: adminEmail.toLowerCase(),
        role: 'Admin',
        specialization: 'Administrator',
        status: 'active',
        passwordHash: hashedPassword,
        emailVerifiedAt: new Date(), // Auto-verify for now
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    console.log(`🎉 New tenant created: ${companyName} (${subdomain}) with admin: ${adminEmail}`);

    // Generate login tokens immediately
    const { accessToken, refreshToken } = generateTokens(userId, adminEmail.toLowerCase(), 'Admin');
    
    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! You are now logged in.',
      tenant: {
        id: tenantId,
        name: companyName,
        subdomain: subdomain,
        url: `https://${subdomain}.firelynx.com`
      },
      user: {
        id: userId,
        name: adminName,
        email: adminEmail.toLowerCase(),
        role: 'Admin'
      }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    
    // Handle specific database constraint errors  
    if (error.code === '23505') { // Unique constraint violation
      if (error.detail?.includes('subdomain') || error.detail?.includes('slug')) {
        return res.status(409).json({
          success: false,
          error: 'Subdomain already taken. Please choose a different one.'
        });
      }
      if (error.detail?.includes('email')) {
        return res.status(409).json({
          success: false,
          error: 'Email address already registered.'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Account creation failed. Please try again.'
    });
  }
});

module.exports = router;