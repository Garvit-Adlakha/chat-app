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
        if (res.headersSent) {
            console.warn('Headers already sent, cannot set token cookie');
            return;
        }

        const token = jwt.sign(
            { 
                userId: user._id,
                version: user.passwordChangedAt || Date.now()
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: process.env.JWT_EXPIRY || '15d',
                audience: process.env.JWT_AUDIENCE || 'chat-app-users',
                issuer: process.env.JWT_ISSUER || 'chat-app'
            }
        );
        const cookieOptions = {
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
            sameSite: "none", // Required for cross-origin requests
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Secure in production
            path: "/",
            partitioned: true // Enables cross-site cookies in newer browsers
        };
        
        res.cookie('token', token, cookieOptions);

        // Sanitized user object
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
            googleId: !!user.googleId
        };

        return res.status(statusCode).json({
            status: 'success',
            message,
            user: sanitizedUser
        });
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
};

/**
 * Verifies a JWT token
 * 
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, {
            audience: process.env.JWT_AUDIENCE || 'chat-app-users',
            issuer: process.env.JWT_ISSUER || 'chat-app'
        });
    } catch (error) {
        console.error('Token verification failed:', error.message);
        throw new Error('Invalid token');
    }
};

/**
 * Clears the authentication token cookie
 * 
 * @param {object} res - Express response object
 */
export const clearTokenCookie = (res) => {
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production',
        partitioned: true // Enables cross-site cookies in newer browsers
    };

    res.cookie('token', '', cookieOptions);
};