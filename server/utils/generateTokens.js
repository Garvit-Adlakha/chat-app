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
        // Check if headers already sent to avoid duplicate cookies
        if (res.headersSent) {
            console.warn('Headers already sent, cannot set token cookie');
            return;
        }

        // Generate JWT token with more secure payload
        const token = jwt.sign(
            { 
                userId: user._id,
                version: user.passwordChangedAt || Date.now() // Add version for invalidation
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: process.env.JWT_EXPIRY || '15d',
                audience: process.env.JWT_AUDIENCE || 'chat-app-users',
                issuer: process.env.JWT_ISSUER || 'chat-app'
            }
        );

        // Determine if token cookie is already being set - improved check
        const existingCookies = res.getHeader('Set-Cookie') || [];
        const tokenCookieExists = Array.isArray(existingCookies) 
            ? existingCookies.some(cookie => cookie.startsWith('token='))
            : typeof existingCookies === 'string' && existingCookies.startsWith('token=');

        // Only set cookie if not already set
        if (!tokenCookieExists) {
            const cookieOptions = {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 15 * 24 * 60 * 60 * 1000, // 15 days
                path: "/"
            };
            
            res.cookie('token', token, cookieOptions);
            
            // Consider setting a non-httpOnly cookie with minimal user info for client-side checks
            if (process.env.ENABLE_CLIENT_COOKIE === 'true') {
                res.cookie('user_session', JSON.stringify({ 
                    authenticated: true, 
                    userId: user._id.toString() 
                }), {
                    ...cookieOptions,
                    httpOnly: false // Accessible to client JavaScript
                });
            }
        } else {
            console.log('Token cookie already exists, skipping duplicate');
        }

        // Create a sanitized user object
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

        // Send response without including token in body
        return res.status(statusCode).json({
            status: 'success',
            message,
            user: sanitizedUser
        });
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Token generation failed');
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
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production'
    });
    
    if (process.env.ENABLE_CLIENT_COOKIE === 'true') {
        res.cookie('user_session', '', {
            httpOnly: false,
            expires: new Date(0),
            path: '/',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
    }
};