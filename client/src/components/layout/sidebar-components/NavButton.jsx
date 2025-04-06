export const NavButton = ({ icon: Icon, isActive, onClick, badge, tooltip, size = "default", ...props }) => {
    const sizeClasses = {
        sm: "w-12 h-12",
        default: "w-12 h-12"
    };

    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={`
                    relative rounded-xl flex items-center justify-center
                    ${sizeClasses[size]}
                    ${isActive 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                    }
                    transition-all duration-200 ease-out
                `}
                {...props}
            >
                <Icon size={24} strokeWidth={1.5} />
                {badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                        {badge}
                    </span>
                )}
            </button>
            
            {tooltip && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[1000]">
                    {tooltip}
                </div>
            )}
        </div>
    );
};
