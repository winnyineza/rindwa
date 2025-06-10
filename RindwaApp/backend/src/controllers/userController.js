const { AppError } = require('../middleware/errorHandler');
const { db } = require('../config/database');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at', 'last_login')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');

    const total = await db('users').count('* as count').first();

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Users can only access their own data unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return next(new AppError('Not authorized to access this user', 403));
    }

    const user = await db('users')
      .where('id', id)
      .select('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at', 'last_login')
      .first();

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    // Users can only update their own data unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return next(new AppError('Not authorized to update this user', 403));
    }

    // Check if user exists
    const existingUser = await db('users').where('id', id).first();
    if (!existingUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if email is already taken (if email is being updated)
    if (email && email !== existingUser.email) {
      const emailExists = await db('users').where('email', email).first();
      if (emailExists) {
        return next(new AppError('Email already in use', 400));
      }
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date(),
    };

    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (email) updateData.email = email;

    // Update user
    await db('users').where('id', id).update(updateData);

    // Get updated user
    const updatedUser = await db('users')
      .where('id', id)
      .select('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at', 'last_login')
      .first();

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await db('users').where('id', id).first();
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(id)) {
      return next(new AppError('Cannot delete your own account', 400));
    }

    // Soft delete - mark as inactive instead of actually deleting
    await db('users')
      .where('id', id)
      .update({ is_active: false, updated_at: new Date() });

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
}; 