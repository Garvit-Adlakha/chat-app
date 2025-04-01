import React from 'react';
import PropTypes from 'prop-types';

const GroupAvatar = ({ groupIcon, name, className = "", size = "md" }) => {
    // Get the first letter of the group name for the fallback
    const firstLetter = name ? name.charAt(0).toUpperCase() : 'G';
    
    // Determine if we have a valid icon URL
    const hasValidIcon = groupIcon && groupIcon.url;
    
    // Default group icon from public folder
    const defaultGroupIcon = "/group-chat-icon-17.png";
    
    // Size classes
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-24 h-24 text-xl"
    };
    
    const sizeClass = sizeClasses[size] || sizeClasses.md;
    
    return (
        <div className={`rounded-full flex items-center justify-center overflow-hidden ${sizeClass} ${className}`}>
            {hasValidIcon ? (
                <img 
                    src={groupIcon.url} 
                    alt={name || "Group"} 
                    className="w-full h-full object-cover"
                />
            ) : (
                // Try to use default image first, fallback to gradient with letter
                <picture>
                    <img 
                        src={defaultGroupIcon} 
                        alt={name || "Group"} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // If the default image fails to load, show the gradient with first letter
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                    ${firstLetter}
                                </div>
                            `;
                        }}
                    />
                </picture>
            )}
        </div>
    );
};

GroupAvatar.propTypes = {
    groupIcon: PropTypes.shape({
        url: PropTypes.string,
        publicId: PropTypes.string
    }),
    name: PropTypes.string,
    className: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl'])
};

export default GroupAvatar;
