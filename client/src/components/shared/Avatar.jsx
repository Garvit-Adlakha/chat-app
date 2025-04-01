import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({ src, alt, className, user }) => {
    // Default image if none provided
    const defaultImage = '/default-avatar.png';
    
    // Check if we should use Google profile attributes
    const hasGoogleVerification = user?.googleId && user?.isEmailVerified;
    
    // Determine the image source
    const imageSrc = src || (hasGoogleVerification && user?.avatar?.url) || defaultImage;
    
    return (
        <img
            src={imageSrc}
            alt={alt || 'Avatar'}
            className={`object-cover rounded-full ${className || 'w-10 h-10'}`}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
            }}
        />
    );
};

Avatar.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    className: PropTypes.string,
    user: PropTypes.object
};

export default Avatar;