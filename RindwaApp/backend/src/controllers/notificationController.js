const { AppError } = require('../middleware/errorHandler');
const { db } = require('../config/database');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const notifications = await db('notifications')
      .where('user_id', req.user.id)
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');

    const total = await db('notifications')
      .where('user_id', req.user.id)
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: notifications,
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

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
const getNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await db('notifications')
      .where('id', id)
      .where('user_id', req.user.id)
      .first();

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await db('notifications')
      .where('id', id)
      .where('user_id', req.user.id)
      .first();

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    await db('notifications')
      .where('id', id)
      .update({
        is_read: true,
        read_at: new Date(),
        updated_at: new Date(),
      });

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await db('notifications')
      .where('user_id', req.user.id)
      .where('is_read', false)
      .update({
        is_read: true,
        read_at: new Date(),
        updated_at: new Date(),
      });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await db('notifications')
      .where('id', id)
      .where('user_id', req.user.id)
      .first();

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    await db('notifications').where('id', id).del();

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
}; 