const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

class AuthController {
  /**
   * Register new user
   */
  async register(req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        company,
        jobTitle,
        industry
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        company,
        jobTitle,
        industry
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          company: user.company,
          industry: user.industry,
          subscription: user.subscription
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          error: 'Account deactivated',
          message: 'Your account has been deactivated'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          company: user.company,
          industry: user.industry,
          subscription: user.subscription,
          usage: user.usage
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * Logout user (client-side token removal)
   */
  async logout(req, res) {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }

  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('-password');

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get profile',
        message: error.message
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Remove sensitive fields
      delete updateData.password;
      delete updateData.email; // Email changes should be handled separately

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: error.message
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: 'Invalid current password',
          message: 'The current password you entered is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        error: 'Failed to change password',
        message: error.message
      });
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent'
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user._id, type: 'password-reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // In a real application, you would send an email here
      // For now, we'll just return the token (remove this in production)
      console.log(`Password reset token for ${email}: ${resetToken}`);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
        // Remove this in production
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        error: 'Failed to process forgot password request',
        message: error.message
      });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Verify reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== 'password-reset') {
        return res.status(400).json({
          error: 'Invalid reset token'
        });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(400).json({
          error: 'Invalid reset token'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        error: 'Failed to reset password',
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
