const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validation');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const fetch = require('node-fetch');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    validateRequest,
  ],
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validateRequest,
  ],
  authController.login
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', protect, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, authController.getMe);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail(), validateRequest],
  authController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   put:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.put(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 }), validateRequest],
  authController.resetPassword
);

// Google social login
router.post('/google', async (req, res, next) => {
  const { accessToken } = req.body;
  try {
    // 1. Verify token with Google
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    const profile = await response.json();
    if (!profile.email) throw new Error('Invalid Google token');

    // 2. Find or create user
    let user = await db('users').where('email', profile.email).first();
    if (!user) {
      const [userId] = await db('users').insert({
        email: profile.email,
        first_name: profile.given_name || 'Google',
        last_name: profile.family_name || 'User',
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      user = await db('users').where('id', userId).first();
    }

    // 3. Generate JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
});

// Facebook social login
router.post('/facebook', async (req, res, next) => {
  const { accessToken } = req.body;
  try {
    // 1. Verify token with Facebook
    const response = await fetch(`https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token=${accessToken}`);
    const profile = await response.json();
    if (!profile.email) throw new Error('Invalid Facebook token');

    // 2. Find or create user
    let user = await db('users').where('email', profile.email).first();
    if (!user) {
      const [userId] = await db('users').insert({
        email: profile.email,
        first_name: profile.first_name || 'Facebook',
        last_name: profile.last_name || 'User',
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      user = await db('users').where('id', userId).first();
    }

    // 3. Generate JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 