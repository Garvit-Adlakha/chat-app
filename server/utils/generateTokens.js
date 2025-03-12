import jwt from 'jsonwebtoken'

export const generateToken = (res, user, message) => {
    if (!res || !user) {
        throw new Error('Missing required parameters');
    }

    try {
        const expiryTime = process.env.JWT_EXPIRY || '1d';
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: expiryTime }
        );

        return res
            .status(200)
            .cookie("token", token, {
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === 'production', // Add secure flag in production
                maxAge: 15*24 * 60 * 60 * 1000 //15 day
            })
            .json({
                success: true,
                message,
                user
            });
    } catch (error) {
        console.error('Error generating token:', error.message); // Log the error message
        throw new Error('Token generation failed');
    }
}