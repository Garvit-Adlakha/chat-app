import jwt from 'jsonwebtoken'

export const generateToken = (res, user, message, statusCode) => {
    if (!res || !user) {
        throw new Error('Missing required parameters');
    }

    try {
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '15d' }
        );

        // Configure cookies properly for cross-origin in production
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days
        };
        
        res.cookie('token', token, cookieOptions);

        return res
            .status(statusCode)
            .json({
                success: true,
                message,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    avatar: user.avatar
                }
            });
    } catch (error) {
        console.error('Error generating token:', error.message); // Log the error message
        throw new Error('Token generation failed');
    }
}