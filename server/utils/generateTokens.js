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

        // Prepare cookie options with modern browser compatibility
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
            partitioned: true // Support Chrome's CHIPS (Cookies Having Independent Partitioned State)
        };

        // Set the cookie
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
            createdAt: user.createdAt
        };

        // Send response with token in header as well for clients that can't access cookies
        return res
            .status(statusCode)
            .header('Authorization', `Bearer ${token}`)
            .json({
                status: 'success',
                message,
                token, // Include token in response body for non-cookie clients
                user: sanitizedUser
            });
    } catch (error) {
        console.error('Error generating token:', error.message);
        throw new Error('Token generation failed');
    }
};