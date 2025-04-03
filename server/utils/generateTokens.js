import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token and sets it as a cookie
 * Updated to support Chrome's third-party cookie restrictions
 * 
 * @param {object} res - Express response object
 * @param {object} user - User object
 * @param {string} message - Message to include in response
 * @param {number} statusCode - HTTP status code
 */
export const generateToken = (res, user, message, statusCode = 200) => {
    try {
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '15d' }
        );

        // Update cookie options for better security and cross-browser compatibility
        const cookieOptions = {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            path: "/",
            partitioned: true // For Chrome's third-party cookie restrictions
        };

        // Set cookie
        res.cookie('token', token, cookieOptions);

        // Create a sanitized user object without sensitive data
        const sanitizedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio || "",
            isOnline: user.isOnline,
            lastActive: user.lastActive,
            isEmailVerified: user.isEmailVerified || false,
            googleId: !!user.googleId, // Just indicate if it exists, don't send the actual ID
            createdAt: user.createdAt,
        };

        // Send response (without including the token in the body for better security)
        return res
            .status(statusCode)
            .json({
                status: 'success',
                message,
                user: sanitizedUser
            });
    } catch (error) {
        console.error('Error generating token:', error.message);
        throw new Error('Token generation failed: ' + error.message);
    }
};

// Consider adding a separate function for token verification/validation