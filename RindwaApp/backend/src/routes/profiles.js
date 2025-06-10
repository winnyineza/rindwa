const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const profileController = require('../controllers/profileController');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/profiles/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: Profile not found
 */
router.get('/me', profileController.getMyProfile);

/**
 * @swagger
 * /api/profiles/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               phone:
 *                 type: string
 *               location:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
 */
router.put(
  '/me',
  [
    body('bio').optional().trim(),
    body('phone').optional().trim(),
    body('location').optional().trim(),
    body('website').optional().isURL(),
    validateRequest,
  ],
  profileController.updateMyProfile
);

/**
 * @swagger
 * /api/profiles/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: Profile not found
 */
router.get('/:id', profileController.getProfile);

// Get user profile (mock)
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://via.placeholder.com/150',
      bio: 'This is a mock profile'
    }
  });
});

module.exports = router; 