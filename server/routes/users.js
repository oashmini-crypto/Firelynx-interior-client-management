// User management routes for FireLynx
// CRUD operations for user accounts with proper authentication and authorization

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db, users, clients } = require('../database');
const { eq, and, or, like, desc, count } = require('drizzle-orm');
const { authenticateToken, requireManagerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all user management routes
router.use(authenticateToken);

// GET /api/users - Get all users with filtering and pagination
router.get('/', requireManagerOrAdmin, async (req, res) => {
  console.log('📋 GET /api/users - Request received');
  
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      role = '', 
      status = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    // Build where conditions
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }
    
    if (role) {
      conditions.push(eq(users.role, role));
    }
    
    if (status) {
      conditions.push(eq(users.status, status));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);
    
    const total = totalResult[0].count;
    
    // Get users with pagination
    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        specialization: users.specialization,
        avatar: users.avatar,
        status: users.status,
        lastLoginAt: users.lastLoginAt,
        clientId: users.clientId,
        emailVerifiedAt: users.emailVerifiedAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(whereClause)
      .limit(limitNum)
      .offset(offset);
    
    // Apply sorting
    if (sortBy === 'name') {
      query = sortOrder === 'asc' ? query.orderBy(users.name) : query.orderBy(desc(users.name));
    } else if (sortBy === 'email') {
      query = sortOrder === 'asc' ? query.orderBy(users.email) : query.orderBy(desc(users.email));
    } else if (sortBy === 'role') {
      query = sortOrder === 'asc' ? query.orderBy(users.role) : query.orderBy(desc(users.role));
    } else if (sortBy === 'status') {
      query = sortOrder === 'asc' ? query.orderBy(users.status) : query.orderBy(desc(users.status));
    } else if (sortBy === 'lastLoginAt') {
      query = sortOrder === 'asc' ? query.orderBy(users.lastLoginAt) : query.orderBy(desc(users.lastLoginAt));
    } else {
      // Default sort by createdAt
      query = sortOrder === 'asc' ? query.orderBy(users.createdAt) : query.orderBy(desc(users.createdAt));
    }
    
    const allUsers = await query;
    
    console.log(`✅ Successfully fetched ${allUsers.length} users from database`);
    
    res.json({
      success: true,
      data: allUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: (pageNum * limitNum) < total
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        specialization: users.specialization,
        avatar: users.avatar,
        status: users.status,
        lastLoginAt: users.lastLoginAt,
        clientId: users.clientId,
        emailVerifiedAt: users.emailVerifiedAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.id, id))
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
    console.error('❌ Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// POST /api/users - Create new user
router.post('/', requireManagerOrAdmin, async (req, res) => {
  console.log('➕ POST /api/users - Create user request');
  
  try {
    const {
      name,
      email,
      phone,
      role,
      specialization,
      clientId,
      password,
      status = 'active'
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and role are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Validate role
    const allowedRoles = ['admin', 'manager', 'designer', 'client'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: ' + allowedRoles.join(', ')
      });
    }
    
    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // If clientId is provided, validate it exists
    if (clientId) {
      const client = await db
        .select()
        .from(clients)
        .where(eq(clients.id, clientId))
        .limit(1);
      
      if (client.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid client ID'
        });
      }
    }
    
    // Generate user ID
    const userId = crypto.randomUUID();
    
    // Hash password if provided
    let passwordHash = null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }
      const saltRounds = 12;
      passwordHash = await bcrypt.hash(password, saltRounds);
    }
    
    // Create user
    const newUser = await db
      .insert(users)
      .values({
        id: userId,
        name: name.trim(),
        email: email.toLowerCase(),
        phone: phone || null,
        role,
        specialization: specialization || null,
        status,
        clientId: clientId || null,
        passwordHash,
        emailVerifiedAt: passwordHash ? new Date() : null // Auto-verify if password is set
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        specialization: users.specialization,
        status: users.status,
        clientId: users.clientId,
        createdAt: users.createdAt
      });
    
    console.log(`✅ User ${email} created successfully by ${req.user.email}`);
    
    res.status(201).json({
      success: true,
      data: newUser[0],
      message: 'User created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      role,
      specialization,
      clientId
    } = req.body;
    
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
      
      // Check if email is already used by another user
      const emailUser = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email.toLowerCase()), eq(users.id, id)))
        .limit(1);
      
      if (emailUser.length > 0 && emailUser[0].id !== id) {
        return res.status(400).json({
          success: false,
          error: 'Email is already in use by another user'
        });
      }
    }
    
    // Validate role if provided
    if (role) {
      const allowedRoles = ['admin', 'manager', 'designer', 'client'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role. Must be one of: ' + allowedRoles.join(', ')
        });
      }
    }
    
    // Validate clientId if provided
    if (clientId) {
      const client = await db
        .select()
        .from(clients)
        .where(eq(clients.id, clientId))
        .limit(1);
      
      if (client.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid client ID'
        });
      }
    }
    
    // Build update object
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone || null;
    if (role) updateData.role = role;
    if (specialization !== undefined) updateData.specialization = specialization || null;
    if (clientId !== undefined) updateData.clientId = clientId || null;
    
    // Update user
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        specialization: users.specialization,
        status: users.status,
        clientId: users.clientId,
        updatedAt: users.updatedAt
      });
    
    console.log(`✅ User ${id} updated successfully by ${req.user.email}`);
    
    res.json({
      success: true,
      data: updatedUser[0],
      message: 'User updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// PATCH /api/users/:id/status - Update user status (activate/deactivate)
router.patch('/:id/status', requireManagerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    const allowedStatuses = ['active', 'inactive', 'suspended', 'pending'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: ' + allowedStatuses.join(', ')
      });
    }
    
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update status
    const updatedUser = await db
      .update(users)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        status: users.status
      });
    
    console.log(`✅ User ${id} status updated to ${status} by ${req.user.email}`);
    
    res.json({
      success: true,
      data: updatedUser[0],
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    });
    
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
});

// PATCH /api/users/:id/password - Reset user password (admin only)
router.patch('/:id/password', requireManagerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password is required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password and reset security fields
    await db
      .update(users)
      .set({
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
        resetToken: null,
        resetTokenExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    
    console.log(`✅ Password reset for user ${id} by ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', requireManagerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Don't allow users to delete themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }
    
    // Delete user
    await db
      .delete(users)
      .where(eq(users.id, id));
    
    console.log(`✅ User ${id} deleted by ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    
    // Handle foreign key constraints
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete user due to existing references. Consider deactivating instead.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

module.exports = router;