const { AppError } = require('../middleware/errorHandler');
const { db } = require('../config/database');

// @desc    Get current user profile
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await db('profiles')
      .where('user_id', req.user.id)
      .first();

    if (!profile) {
      return next(new AppError('Profile not found', 404));
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/profiles/me
// @access  Private
const updateMyProfile = async (req, res, next) => {
  try {
    const { bio, phone, location, website } = req.body;

    // Check if profile exists
    let profile = await db('profiles')
      .where('user_id', req.user.id)
      .first();

    if (profile) {
      // Update existing profile
      const updateData = {
        bio: bio || profile.bio,
        phone: phone || profile.phone,
        location: location || profile.location,
        website: website || profile.website,
        updated_at: new Date(),
      };

      await db('profiles')
        .where('user_id', req.user.id)
        .update(updateData);
    } else {
      // Create new profile
      const insertData = {
        user_id: req.user.id,
        bio: bio || null,
        phone: phone || null,
        location: location || null,
        website: website || null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await db('profiles').insert(insertData);
    }

    // Get updated profile
    profile = await db('profiles')
      .where('user_id', req.user.id)
      .first();

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile by ID
// @route   GET /api/profiles/:id
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await db('profiles')
      .where('user_id', id)
      .first();

    if (!profile) {
      return next(new AppError('Profile not found', 404));
    }

    // Get user info
    const user = await db('users')
      .where('id', id)
      .select('id', 'first_name', 'last_name', 'email', 'created_at')
      .first();

    const profileWithUser = {
      ...profile,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        createdAt: user.created_at,
      },
    };

    res.json({
      success: true,
      data: profileWithUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getProfile,
}; 